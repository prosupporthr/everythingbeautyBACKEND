import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MetaSchema } from './meta.schema';
import { HydratedDocument } from 'mongoose';

export enum OTP_TYPE {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type Otpocument = HydratedDocument<Otp>;

@Schema()
export class Otp extends MetaSchema {
  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  adminId: string;

  @Prop({
    enum: OTP_TYPE,
  })
  type: OTP_TYPE;

  @Prop({
    type: String,
    required: true,
  })
  code: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  expired: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
