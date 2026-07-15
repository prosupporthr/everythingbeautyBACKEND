/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { Chat, ChatDocument } from '@/schemas/Chat.schema';
import {
  ChatMessage,
  ChatMessageDocument,
  MESSAGE_TYPE,
} from '@/schemas/ChatMessage.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { User, UserDocument } from '@/schemas/User.schema';
import { UploadService } from '@modules/upload/upload.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatGateway } from '@/common/gateway/chat/chat.gateway';
import { NotificationsService } from '@modules/notifications/notifications.service';

@Injectable()
export class MessagingService {
  private logger = new Logger(MessagingService.name);
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly uploadService: UploadService,
    private chatGatewayService: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && typeof error?.message === 'string') {
      return error.message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unexpected error';
    }
  }

  // 1. Create chat; avoid duplicates (same users, either direction, same business)
  async createChat(dto: CreateChatDto): Promise<ReturnType> {
    try {
      const { senderId, recipientId } = dto;

      if (!isValidObjectId(senderId) || !isValidObjectId(recipientId)) {
        throw new BadRequestException('Invalid ObjectId provided');
      }

      const senderObjId = new Types.ObjectId(senderId);
      const recipientObjId = new Types.ObjectId(recipientId);
      const existing = await this.chatModel
        .findOne({
          isDeleted: false,
          $or: [
            { senderId: senderObjId, recipientId: recipientObjId },
            { senderId: recipientObjId, recipientId: senderObjId },
          ],
        })
        .lean();

      if (existing) {
        return new ReturnType({
          success: true,
          message: 'Chat already exists',
          data: existing,
        });
      }

      const chat = await this.chatModel.create({
        senderId: senderObjId,
        recipientId: recipientObjId,
      });

      const enriched = await this.enrichChat(chat);
      return new ReturnType({
        success: true,
        message: 'Chat created successfully',
        data: enriched,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // 2. Create chat message
  async createChatMessage(params: {
    chatId: string;
    senderId: string;
    type: MESSAGE_TYPE;
    message?: string;
    replyTo?: string;
  }): Promise<ReturnType> {
    try {
      const { chatId, senderId, type, message, replyTo } = params;
      if (!isValidObjectId(chatId) || !isValidObjectId(senderId)) {
        throw new BadRequestException('Invalid ObjectId provided');
      }

      const chat = await this.chatModel
        .findOne({ _id: chatId, isDeleted: false })
        .lean();
      if (!chat) throw new NotFoundException('Chat not found');

      const chatObjId = new Types.ObjectId(chatId);
      const senderObjId = new Types.ObjectId(senderId);

      const lastMessage = await this.chatMessageModel
        .findOne({
          chatId: chatObjId,
          senderId: senderObjId,
          isDeleted: false,
        })
        .sort({ createdAt: -1 })
        .lean();

      if (lastMessage) {
        const samePayload =
          lastMessage.type === type && lastMessage.message === message;
        const withinWindow =
          Math.abs(
            Date.now() - new Date(lastMessage.createdAt as any).getTime(),
          ) < 10000;
        if (samePayload && withinWindow) {
          const enrichedExisting = await this.enrichChatMessage(
            lastMessage as any,
          );
          return new ReturnType({
            success: true,
            message: 'Message already exists',
            data: enrichedExisting,
          });
        }
      }

      const createPayload: any = {
        chatId: chatObjId,
        senderId: senderObjId,
        type,
        message,
      };

      if (replyTo && isValidObjectId(replyTo)) {
        createPayload.replyTo = new Types.ObjectId(replyTo);
      }

      const created = await this.chatMessageModel.create(createPayload);

      await this.chatModel.findByIdAndUpdate(chatObjId, {
        lastMessage: created._id,
        updatedAt: new Date().toISOString(),
      });

      // Determine the recipient (the other participant in the chat)
      const recipientId =
        chat.senderId.toString() === senderId
          ? chat.recipientId.toString()
          : chat.senderId.toString();

      // Send notification to the recipient
      const sender = await this.userModel.findById(senderId);
      const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`
        : 'Someone';

      await this.notificationsService.createNotification({
        userId: recipientId,
        title: 'New Message',
        description: `${senderName} sent you a message${message ? ': ' + message.substring(0, 100) : ''}`,
      });

      // Emit unread count to recipient via WebSocket
      try {
        const totalUnread = await this.calculateTotalUnreadCount(recipientId);
        this.chatGatewayService.emitUnreadCount(recipientId, totalUnread);
      } catch (wsError) {
        this.logger.error('Failed to emit unread count', wsError);
      }

      const enriched = await this.enrichChatMessage(created);
      return new ReturnType({
        success: true,
        message: 'Message created successfully',
        data: enriched,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // Edit a message (only the original sender can edit)
  async editMessage(messageId: string, senderId: string, newMessage: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(messageId) || !isValidObjectId(senderId)) {
        throw new BadRequestException('Invalid ObjectId provided');
      }

      const existingMessage = await this.chatMessageModel.findOne({
        _id: new Types.ObjectId(messageId),
        isDeleted: false,
      });

      if (!existingMessage) {
        throw new NotFoundException('Message not found');
      }

      if (existingMessage.senderId.toString() !== senderId) {
        throw new BadRequestException('Only the sender can edit this message');
      }

      existingMessage.message = newMessage;
      existingMessage.isEdited = true;
      existingMessage.editedAt = new Date();
      await existingMessage.save();

      const enriched = await this.enrichChatMessage(existingMessage);

      // Emit edited message event via WebSocket
      try {
        this.chatGatewayService.emitMessageEdited(
          existingMessage.chatId.toString(),
          enriched,
        );
      } catch (wsError) {
        this.logger.error('Failed to emit message-edited event', wsError);
      }

      return new ReturnType({
        success: true,
        message: 'Message edited successfully',
        data: enriched,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // Get total unread message count across all chats for a user
  async getUserTotalUnreadCount(userId: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(userId)) {
        throw new BadRequestException('Invalid userId');
      }

      const count = await this.calculateTotalUnreadCount(userId);

      return new ReturnType({
        success: true,
        message: 'Total unread message count fetched successfully',
        data: { count },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // Helper: calculate total unread messages across all chats for a user
  private async calculateTotalUnreadCount(userId: string): Promise<number> {
    const userObjId = new Types.ObjectId(userId);

    // Find all chats where this user is a participant
    const chats = await this.chatModel
      .find({
        isDeleted: false,
        $or: [{ senderId: userObjId }, { recipientId: userObjId }],
      })
      .select('_id')
      .lean();

    const chatIds = chats.map((c) => c._id);

    // Count unread messages in those chats that were NOT sent by this user
    return this.chatMessageModel.countDocuments({
      chatId: { $in: chatIds },
      senderId: { $ne: userObjId },
      isDeleted: false,
      isRead: false,
    });
  }

  // 3. Get chats for a user (sender or recipient) paginated
  async getUserChats(
    userId: string,
    query: PaginationQueryDto,
    search?: string,
  ): Promise<PaginatedReturnType<ChatDocument[]>> {
    try {
      if (!isValidObjectId(userId))
        throw new BadRequestException('Invalid userId');
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const skip = (page - 1) * limit;

      // Base match: User must be a participant and chat not deleted
      const matchStage: any = {
        isDeleted: false,
        $or: [
          { senderId: new Types.ObjectId(userId) },
          { recipientId: new Types.ObjectId(userId) },
        ],
      };

      let pipeline: any[] = [{ $match: matchStage }];

      if (search) {
        // If searching, we need to join with users to filter by name
        pipeline = [
          ...pipeline,
          {
            $lookup: {
              from: 'users',
              localField: 'senderId',
              foreignField: '_id',
              as: 'sender',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'recipientId',
              foreignField: '_id',
              as: 'recipient',
            },
          },
          { $unwind: { path: '$sender', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$recipient', preserveNullAndEmptyArrays: true } },
          {
            $match: {
              $or: [
                {
                  'sender.firstName': { $regex: search, $options: 'i' },
                },
                {
                  'sender.lastName': { $regex: search, $options: 'i' },
                },
                {
                  'recipient.firstName': { $regex: search, $options: 'i' },
                },
                {
                  'recipient.lastName': { $regex: search, $options: 'i' },
                },
              ],
            },
          },
        ];
      }

      // Pagination and Sort pipeline
      const dataPipeline = [
        ...pipeline,
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      const countPipeline = [...pipeline, { $count: 'total' }];

      const [chatsResult, countResult] = await Promise.all([
        this.chatModel.aggregate(dataPipeline),
        this.chatModel.aggregate(countPipeline),
      ]);

      const chats = chatsResult as ChatDocument[];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const total = (countResult[0]?.total || 0) as number;

      const data = await Promise.all(chats.map((c) => this.enrichChat(c)));

      return new PaginatedReturnType<ChatDocument[]>({
        success: true,
        message: 'User chats fetched',
        data,
        page,
        total,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // 4. Mark multiple chat messages as read by IDs
  async markMessagesAsRead(ids: string[]): Promise<ReturnType> {
    try {
      const validIds = ids.filter((id) => isValidObjectId(id));
      if (!validIds.length) {
        throw new BadRequestException('No valid message IDs provided');
      }

      await this.chatMessageModel.updateMany(
        { _id: { $in: validIds }, isDeleted: false },
        { $set: { isRead: true } },
      );

      return new ReturnType({
        success: true,
        message: 'Messages marked as read successfully',
        data: null,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // 5. Get unread chat message count for a particular chat
  async getUnreadCount(chatId: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(chatId)) {
        throw new BadRequestException('Invalid chatId');
      }

      const count = await this.chatMessageModel.countDocuments({
        chatId: new Types.ObjectId(chatId),
        isDeleted: false,
        isRead: false,
      });

      return new ReturnType({
        success: true,
        message: 'Unread message count fetched successfully',
        data: { count },
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async getChatById(id: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(id)) throw new BadRequestException('Invalid chatId');
      const chat = await this.chatModel.findOne({
        _id: new Types.ObjectId(id),
        isDeleted: false,
      });
      if (!chat) throw new NotFoundException('Chat not found');
      const enriched = await this.enrichChat(chat);
      return new ReturnType({
        success: true,
        message: 'Chat fetched',
        data: enriched,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // 4. Get all chat messages by chat id, paginated, newest to oldest
  async getChatMessages(
    chatId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedReturnType<ChatMessageDocument[]>> {
    try {
      if (!isValidObjectId(chatId))
        throw new BadRequestException('Invalid chatId');
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const skip = (page - 1) * limit;

      const filter = { isDeleted: false, chatId: new Types.ObjectId(chatId) };

      const [rawMessages, total] = await Promise.all([
        this.chatMessageModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.chatMessageModel.countDocuments(filter),
      ]);

      const data = await Promise.all(
        rawMessages.map((m) => this.enrichChatMessage(m)),
      );

      return new PaginatedReturnType<ChatMessageDocument[]>({
        success: true,
        message: 'Chat messages fetched',
        data,
        page,
        total,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // 5. Delete chat (soft delete)
  async deleteChat(chatId: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(chatId))
        throw new BadRequestException('Invalid chatId');
      const updated = await this.chatModel.findOneAndUpdate(
        { _id: new Types.ObjectId(chatId), isDeleted: false },
        { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() },
        { new: true },
      );
      if (!updated) throw new NotFoundException('Chat not found');
      return new ReturnType({
        success: true,
        message: 'Chat deleted successfully',
        data: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // 6. Delete chat message (soft delete)
  async deleteChatMessage(messageId: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(messageId))
        throw new BadRequestException('Invalid messageId');
      const updated = await this.chatMessageModel.findOneAndUpdate(
        { _id: new Types.ObjectId(messageId), isDeleted: false },
        { isDeleted: true, deletedAt: new Date(), updatedAt: new Date() },
        { new: true },
      );
      if (!updated) throw new NotFoundException('Message not found');
      return new ReturnType({
        success: true,
        message: 'Message deleted successfully',
        data: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  // Helper: enrich a chat with sender and recipient details and signed profile pictures
  private async enrichChat(chat: ChatDocument) {
    try {
      const chatObj = chat.toObject ? chat.toObject() : chat;
      const [sender, recipient] = await Promise.all([
        this.userModel.findById(chatObj.senderId),
        this.userModel.findById(chatObj.recipientId),
      ]);

      const senderPic = sender?.profilePicture
        ? await this.uploadService.getSignedUrl(sender.profilePicture)
        : null;
      const recipientPic = recipient?.profilePicture
        ? await this.uploadService.getSignedUrl(recipient.profilePicture)
        : null;

      let lastMessage: any = null;
      if (chatObj.lastMessage) {
        const msg = await this.chatMessageModel.findOne({
          _id: chatObj.lastMessage,
          isDeleted: false,
        });
        if (msg) lastMessage = await this.enrichChatMessage(msg);
      }

      if (!lastMessage) {
        const latest = await this.chatMessageModel
          .findOne({ chatId: chatObj._id, isDeleted: false })
          .sort({ createdAt: -1 });
        if (latest) {
          lastMessage = await this.enrichChatMessage(latest);
        }
      }

      return {
        ...chatObj,
        sender: sender
          ? { ...sender.toObject(), profilePicture: senderPic }
          : null,
        recipient: recipient
          ? { ...recipient.toObject(), profilePicture: recipientPic }
          : null,
        lastMessage,
      };
    } catch (error: any) {
      this.logger.error(error);
      return chat.toObject ? chat.toObject() : chat;
    }
  }

  // Helper: enrich a chat message with sender details and signed profile picture
  private async enrichChatMessage(message: ChatMessageDocument) {
    try {
      const msgObj = message.toObject ? message.toObject() : message;
      const sender = await this.userModel.findById(msgObj.senderId);
      const senderPic = sender?.profilePicture
        ? await this.uploadService.getSignedUrl(sender.profilePicture)
        : null;
      const filesSrc = Array.isArray(msgObj.files) ? msgObj.files : [];
      const files = await Promise.all(
        filesSrc.map(async (f) => await this.uploadService.getSignedUrl(f)),
      );

      // Populate replied-to message if present
      let repliedMessage: any = null;
      if (msgObj.replyTo) {
        const replyMsg = await this.chatMessageModel
          .findOne({ _id: msgObj.replyTo, isDeleted: false })
          .lean();
        if (replyMsg) {
          const replySender = await this.userModel.findById(replyMsg.senderId);
          const replySenderPic = replySender?.profilePicture
            ? await this.uploadService.getSignedUrl(replySender.profilePicture)
            : null;
          repliedMessage = {
            ...replyMsg,
            sender: replySender
              ? { ...replySender.toObject(), profilePicture: replySenderPic }
              : null,
          };
        }
      }

      return {
        ...msgObj,
        sender: sender
          ? { ...sender.toObject(), profilePicture: senderPic }
          : null,
        files,
        repliedMessage,
      };
    } catch (error: any) {
      this.logger.error(error);
      return message.toObject ? message.toObject() : message;
    }
  }
}
