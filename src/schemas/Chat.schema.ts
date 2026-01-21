import { HydratedDocument, SchemaTypes, type ObjectId } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Chat extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  senderId: ObjectId;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  recipientId: ObjectId;

  @Prop({
    required: false,
    type: SchemaTypes.ObjectId,
    ref: 'ChatMessage',
  })
  lastMessage: ObjectId;
}

export type ChatDocument = HydratedDocument<Chat>;
export const ChatSchema = SchemaFactory.createForClass(Chat);
