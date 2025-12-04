import { HydratedDocument, SchemaTypes, type ObjectId } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema()
export class Wallet extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  userId: ObjectId;

  @Prop({
    required: true,
    type: Number,
    default: 0,
  })
  balance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
