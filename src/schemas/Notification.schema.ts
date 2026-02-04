import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './User.schema';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: false })
  isForAdmin: boolean;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: [String], default: [] })
  readBy: string[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
