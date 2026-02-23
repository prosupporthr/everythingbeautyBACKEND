import { HydratedDocument, SchemaTypes, type ObjectId } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum MESSAGE_TYPE {
  TEXT = 'text_only',
  FILE = 'with_file',
}

@Schema({
  timestamps: true,
})
export class ChatMessage extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'Chat',
  })
  chatId: ObjectId;

  @Prop({
    required: false,
    type: String,
  })
  message: string;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  senderId: ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: MESSAGE_TYPE,
  })
  type: MESSAGE_TYPE;

  @Prop({
    required: false,
    type: [String],
  })
  files: string[];

  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  isRead: boolean;
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
