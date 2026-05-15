import { HydratedDocument, SchemaTypes } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum ESCROW_STATUS {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type EscrowDocument = HydratedDocument<Escrow>;

@Schema()
export class Escrow extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  userId: string;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'Order',
  })
  orderId: string;

   @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'Wallet',
  })
  businessWalletId: string;

  @Prop({
    required: true,
    type: Number,
  })
  amount: number;

  @Prop({
    required: true,
    enum: ESCROW_STATUS,
    default: ESCROW_STATUS.PENDING,
    type: String,
  })
  status: ESCROW_STATUS;

}

export const EscrowSchema = SchemaFactory.createForClass(Escrow);
