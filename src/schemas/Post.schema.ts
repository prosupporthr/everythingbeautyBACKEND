import { HydratedDocument, Types } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post extends MetaSchema {
  @Prop({
    required: false,
    type: String,
  })
  body: string;

  @Prop({
    required: false,
    type: [String],
  })
  images: string[];

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: 'User',
  })
  userId: Types.ObjectId;


  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: 'Product',
  })
  productId?: Types.ObjectId;

  @Prop({
    required: false,
    type: [Types.ObjectId],
    ref: 'User',
  })
  likes: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
