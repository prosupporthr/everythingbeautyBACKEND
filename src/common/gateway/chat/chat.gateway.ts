import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserDocument } from '@/schemas/User.schema';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { MessagingService } from '@/modules/messaging/messaging.service';
import { CreateChatMessageDto } from '@/modules/messaging/dto/create-chat-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  pingInterval: 20000,
  pingTimeout: 20000,
})
export class ChatGateway {
  @WebSocketServer()
  public socket: Server;

  private logger = new Logger('ChatsGateway');

  constructor(
    @Inject(forwardRef(() => MessagingService))
    private messagingService: MessagingService,
  ) {}

  afterInit() {
    this.logger.log('ChatsGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat')
  async handleMessage(
    client: any,
    payload: CreateChatMessageDto & { user: UserDocument },
  ) {
    try {
      const data = await this.messagingService.createChatMessage({
        chatId: payload.chatId,
        senderId: payload.senderId,
        type: payload.type,
        message: payload.message,
        replyTo: payload.replyTo,
      });
      this.logger.debug('CHAT SENT:', data);
      this.socket.emit(`chat:${payload.chatId}`, data.data);
    } catch (error) {
      this.logger.error(error);
      this.logger.error('FROM GATEWAY CLASS');
    }
  }

  /**
   * Emit the total unread message count to a specific user.
   * Frontend should listen on: `unread-count:{userId}`
   */
  emitUnreadCount(userId: string, count: number) {
    this.socket.emit(`unread-count:${userId}`, { count });
  }

  /**
   * Emit an edited message to all clients listening on the chat.
   * Frontend should listen on: `message-edited:{chatId}`
   */
  emitMessageEdited(chatId: string, message: any) {
    this.socket.emit(`message-edited:${chatId}`, message);
  }
}
