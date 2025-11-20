import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MetaSchema } from './meta.schema';
import { SchemaTypes, type ObjectId, HydratedDocument } from 'mongoose';

export enum BOOKMARK_TYPE {
  SERVICE = 'service',
  PRODUCT = 'product',
}

@Schema({
  timestamps: true,
})
export class Bookmark extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  userId: ObjectId;

  @Prop({
    required: false,
    type: SchemaTypes.ObjectId,
    ref: 'Service',
  })
  serviceId: ObjectId;

  @Prop({
    required: false,
    type: SchemaTypes.ObjectId,
    ref: 'Service',
  })
  productId: ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: BOOKMARK_TYPE,
  })
  type: BOOKMARK_TYPE;
}

export type BookmarkDocument = HydratedDocument<Bookmark>;
export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
