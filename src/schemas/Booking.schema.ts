import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MetaSchema } from './meta.schema';
import { SchemaTypes, type ObjectId, HydratedDocument } from 'mongoose';

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum STATUS {
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({
  timestamps: true,
})
export class Booking extends MetaSchema {
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
    ref: 'Service',
  })
  serviceId: ObjectId;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  totalPrice: number;

  @Prop({
    required: true,
    type: String,
    trim: true,
  })
  bookingDate: string;

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
    enum: STATUS,
    default: STATUS.AWAITING_APPROVAL,
  })
  status: STATUS;
}

export type BookingDocument = HydratedDocument<Booking>;
export const BookingSchema = SchemaFactory.createForClass(Booking);

// Indexes
BookingSchema.index({ userId: 1 });
BookingSchema.index({ businessId: 1 });
BookingSchema.index({ serviceId: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingDate: 1 });
