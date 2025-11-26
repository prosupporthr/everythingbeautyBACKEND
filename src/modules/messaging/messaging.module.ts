import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { Chat, ChatSchema } from '@/schemas/Chat.schema';
import { ChatMessage, ChatMessageSchema } from '@/schemas/ChatMessage.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, JwtService],
  exports: [MessagingService],
})
export class MessagingModule {}
