import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/schemas/User.schema';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { PostService } from './post.service';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  path: '/socket.io',
  pingInterval: 20000,
  pingTimeout: 20000,
})
export class PostGateway {
  @WebSocketServer()
  public socket: Server;

  private logger = new Logger(PostGateway.name);

  constructor(
    private readonly postService: PostService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<{
        id: string;
        email: string;
      }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userModel.findById(payload.id);
      if (!user || user.isDeleted || user.isSuspended) {
        client.disconnect(true);
        return;
      }

      client.data.user = user;
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('post:join')
  async joinPostRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { postId: string },
  ) {
    if (!payload?.postId) {
      return;
    }
    await client.join(`post:${payload.postId}`);
    return { success: true };
  }

  @SubscribeMessage('post:like')
  async likePost(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { postId: string },
  ) {
    const user = client.data.user as UserDocument | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    const likeCount = await this.postService.toggleLike(
      payload.postId,
      user._id.toString(),
    );

    this.socket.to(`post:${payload.postId}`).emit('post:likeCount', {
      postId: payload.postId,
      likeCount: likeCount.likes,
      hasLiked: likeCount.hasLiked,
    });

    return { postId: payload.postId, likeCount };
  }

  private extractToken(client: Socket): string | null {
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : null;

    const headerAuth =
      typeof client.handshake.headers?.authorization === 'string'
        ? client.handshake.headers.authorization
        : null;

    const raw = authToken ?? headerAuth;
    if (!raw) return null;

    if (raw.startsWith('Bearer ')) {
      return raw.slice('Bearer '.length).trim();
    }

    return raw.trim();
  }
}
