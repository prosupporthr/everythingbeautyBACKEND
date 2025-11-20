import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
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
  async createChat(params: {
    senderId: string;
    recipientId: string;
    businessId: string;
    creatorId: string;
  }): Promise<ReturnType> {
    try {
      const { senderId, recipientId, businessId, creatorId } = params;

      if (
        !isValidObjectId(senderId) ||
        !isValidObjectId(recipientId) ||
        !isValidObjectId(businessId) ||
        !isValidObjectId(creatorId)
      ) {
        throw new BadRequestException('Invalid ObjectId provided');
      }

      const senderObjId = new Types.ObjectId(senderId);
      const recipientObjId = new Types.ObjectId(recipientId);
      const businessObjId = new Types.ObjectId(businessId);
      const creatorObjId = new Types.ObjectId(creatorId);

      const existing = await this.chatModel
        .findOne({
          isDeleted: false,
          businessId: businessObjId,
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
        businessId: businessObjId,
        creatorId: creatorObjId,
      });

      return new ReturnType({
        success: true,
        message: 'Chat created successfully',
        data: chat.toObject(),
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
  }): Promise<ReturnType> {
    try {
      const { chatId, senderId, type, message } = params;
      if (!isValidObjectId(chatId) || !isValidObjectId(senderId)) {
        throw new BadRequestException('Invalid ObjectId provided');
      }

      const chat = await this.chatModel
        .findOne({ _id: chatId, isDeleted: false })
        .lean();
      if (!chat) throw new NotFoundException('Chat not found');

      const created = await this.chatMessageModel.create({
        chatId: new Types.ObjectId(chatId),
        senderId: new Types.ObjectId(senderId),
        type,
        message,
      });
      return new ReturnType({
        success: true,
        message: 'Message created successfully',
        data: created.toObject(),
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

  // 3. Get chats for a user (sender or recipient) paginated
  async getUserChats(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedReturnType<ChatDocument[]>> {
    try {
      if (!isValidObjectId(userId))
        throw new BadRequestException('Invalid userId');
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const skip = (page - 1) * limit;

      const filter = {
        isDeleted: false,
        $or: [
          { senderId: new Types.ObjectId(userId) },
          { recipientId: new Types.ObjectId(userId) },
        ],
      };

      const [data, total] = await Promise.all([
        this.chatModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.chatModel.countDocuments(filter),
      ]);

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

      const [data, total] = await Promise.all([
        this.chatMessageModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.chatMessageModel.countDocuments(filter),
      ]);

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
}
