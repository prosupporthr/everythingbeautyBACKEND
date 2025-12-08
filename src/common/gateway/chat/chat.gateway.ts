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
      });
      this.logger.debug('CHAT SENT:', data);
      this.socket.emit(`chat:${payload.chatId}`, data.data);
    } catch (error) {
      this.logger.error(error);
      this.logger.error('FROM GATEWAY CLASS');
    }
  }

  // @SubscribeMessage('delete-message')
  // async handleDeleteMessage(client: any, payload: DeleteMessage) {
  //   try {
  //     this.socket.emit(CLIENT_EVENT.DELETE_MESSAGE(payload.chatId), payload);
  //     this.logger.debug('CHAT DELETED:', payload);
  //   } catch (error) {
  //     this.logger.error(error);
  //     this.logger.error('FROM GATEWAY CLASS');
  //   }
  // }
}
