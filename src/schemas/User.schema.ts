import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MetaSchema } from './meta.schema';
export type UserDocument = HydratedDocument<User>;

export enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
}

export enum AUTH_TYPE {
  GOOGLE = 'google',
  EMAIL = 'email',
}

export enum PAYMENT_PLAN {
  FREE = 'free',
  PREMIUM = 'premium',
}

@Schema({
  timestamps: true,
})
export class User extends MetaSchema {
  @Prop({
    required: false,
    trim: true,
    transform: (v: string) => v.toLowerCase(),
  })
  firstName: string;

  @Prop({
    required: false,
    trim: true,
    transform: (v: string) => v.toLowerCase(),
  })
  lastName: string;

  @Prop({
    required: false,
  })
  phoneNumber: string;

  @Prop({
    required: true,
    trim: true,
    transform: (v: string) => v.toLowerCase(),
  })
  email: string;

  @Prop({
    required: false,
    default: false,
  })
  emailVerified: boolean;

  @Prop({
    required: false,
    trim: true,
    transform: (v: string) => v.toLowerCase(),
  })
  dateOfBirth: string;

  @Prop({
    required: false,
    enum: GENDER,
  })
  gender: GENDER;

  @Prop({
    required: false,
  })
  profilePicture: string;

  @Prop({
    required: false,
  })
  about: string;

  @Prop({
    required: false,
  })
  homeAddress: string;

  @Prop({
    required: false,
  })
  state: string;

  @Prop({
    required: false,
  })
  officeAddress: string;

  @Prop({
    required: false,
  })
  country: string;

  @Prop({
    required: false,
    default: PAYMENT_PLAN.FREE,
    enum: PAYMENT_PLAN,
  })
  plan: PAYMENT_PLAN;

  @Prop({
    required: false,
  })
  stripeCustomerId: string;

  @Prop({
    required: false,
  })
  stripeConnectId: string;

  @Prop({
    type: Date,
    required: false,
  })
  nextPaymentDate: Date | null;

  @Prop({
    required: false,
    default: false,
  })
  isSuspended: boolean;

  @Prop({
    required: true,
    default: AUTH_TYPE.EMAIL,
    enum: AUTH_TYPE,
  })
  authType: AUTH_TYPE;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual relationship: list of businesses owned by the user
UserSchema.virtual('businesses', {
  ref: 'Business',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});

// Ensure virtuals are included when converting to JSON/Object
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.index({ email: 1 });
UserSchema.index({ plan: 1 });
UserSchema.index({ phoneNumber: 1 });
