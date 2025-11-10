import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type ObjectId, SchemaTypes, HydratedDocument } from 'mongoose';
import { MetaSchema } from './meta.schema';

export enum CHARGE_TIMING {
  AFTER_ORDER = 'after_order',
  BEFORE_ORDER = 'before_order',
}

@Schema({
  timestamps: true,
})
export class Review extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  userId: ObjectId;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'Business',
  })
  businessId: ObjectId;

  @Prop({
    required: true,
    trim: true,
    transform: (v: string) => v.toLowerCase(),
  })
  description: string;

  @Prop({
    required: false,
    type: Number,
    min: 1,
    max: 5,
  })
  rating: number;
}

export type ReviewDocument = HydratedDocument<Review>;

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ businessId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ approved: 1, enabled: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ days: 1 });
ReviewSchema.index({ lat: 1, long: 1 });
ReviewSchema.index({ chargeTiming: 1 });
ReviewSchema.index({ name: 'text', location: 'text' });
