import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MetaSchema } from './meta.schema';
import { SchemaTypes, type ObjectId, HydratedDocument } from 'mongoose';

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Schema({
  timestamps: true,
})
export class Order extends MetaSchema {
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
    type: SchemaTypes.ObjectId,
    ref: 'Product',
  })
  productId: ObjectId;

  @Prop({
    required: true,
    type: Number,
    min: 1,
  })
  quantity: number;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  totalPrice: number;

  @Prop({
    required: false,
    type: String,
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.PENDING,
  })
  paymentStatus: PAYMENT_STATUS;

  @Prop({
    required: false,
    type: String,
    enum: ORDER_STATUS,
    default: ORDER_STATUS.PENDING,
  })
  status: ORDER_STATUS;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ userId: 1 });
OrderSchema.index({ businessId: 1 });
OrderSchema.index({ productId: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ status: 1 });