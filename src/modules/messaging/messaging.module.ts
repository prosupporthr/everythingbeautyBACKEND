import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { Chat, ChatSchema } from '@/schemas/Chat.schema';
import { ChatMessage, ChatMessageSchema } from '@/schemas/ChatMessage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
