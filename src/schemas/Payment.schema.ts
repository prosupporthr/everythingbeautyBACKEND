import { HydratedDocument, SchemaTypes } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum PAYMENT_TYPE {
  WALLET_TOP_UP = 'wallet_top_up',
  BOOKING = 'booking',
  PRODUCT = 'product',
  WITHDRAWAL = 'withdrawal',
  MONTHLY_SUBSCRIPTION = 'monthly_subscription',
}

export enum PAYMENT_FLOW {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum PAYMENT_SOURCE {
  STRIPE = 'stripe',
  WALLET = 'wallet',
}

@Schema()
export class Payment extends MetaSchema {
  @Prop({
    required: false,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  userId: string;

  @Prop({
    required: true,
    type: Number,
  })
  amount: number;

  @Prop({
    required: true,
    type: String,
    enum: PAYMENT_SOURCE,
  })
  source: PAYMENT_SOURCE;

  @Prop({
    required: true,
    type: String,
    enum: PAYMENT_TYPE,
  })
  type: PAYMENT_TYPE;

  @Prop({
    required: true,
    type: String,
    enum: PAYMENT_FLOW,
  })
  flow: PAYMENT_FLOW;

  @Prop({
    required: true,
    type: String,
  })
  typeId: string;

  @Prop({
    required: false,
    type: String,
  })
  stripeIntentId: string;

  @Prop({
    required: false,
    type: String,
  })
  stripePayoutId?: string;

  @Prop({
    required: false,
    type: String,
  })
  destinationBankId?: string;

  @Prop({
    required: false,
    type: String,
  })
  subscriptionId?: string;

  @Prop({
    required: false,
    type: String,
  })
  invoiceId?: string;

  @Prop({
    required: true,
    type: String,
    enum: PAYMENT_STATUS,
  })
  status: PAYMENT_STATUS;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
