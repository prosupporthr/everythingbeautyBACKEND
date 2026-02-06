import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type ObjectId, SchemaTypes, HydratedDocument } from 'mongoose';
import { MetaSchema } from './meta.schema';

export enum CHARGE_TIMING {
  AFTER_ORDER = 'after_order',
  BEFORE_ORDER = 'before_order',
}

export enum LICENSE_STATUS {
  NOT_LICENSED = 'NOT_LICENSED',
  PENDING = 'PENDING',
  LICENSED = 'LICENSED',
}

@Schema({
  timestamps: true,
})
export class Business extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  userId: ObjectId;

  @Prop({
    required: true,
    trim: true,
    transform: (v: string) => v.toLowerCase(),
  })
  name: string;

  @Prop({
    required: false,
    trim: true,
    transform: (v: string) => v?.toLowerCase?.(),
  })
  location: string;

  @Prop({
    required: false,
    type: String,
  })
  long: string;

  @Prop({
    required: false,
    type: String,
  })
  lat: string;

  @Prop({
    required: false,
    type: [Number],
    default: [],
  })
  days: number[];

  @Prop({
    required: false,
    trim: true,
    type: String,
  })
  openingTime: string;

  @Prop({
    required: false,
    trim: true,
    type: String,
  })
  closingTime: string;

  @Prop({
    required: false,
    enum: CHARGE_TIMING,
    default: CHARGE_TIMING.AFTER_ORDER,
  })
  chargeTiming: CHARGE_TIMING;

  @Prop({
    required: false,
    type: [String],
    default: [],
  })
  pictures: string[];

  @Prop({
    required: false,
    type: Number,
    default: 0,
  })
  rating: number;

  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  approved: boolean;

  @Prop({
    required: false,
    type: Boolean,
    default: true,
  })
  enabled: boolean;

  @Prop({
    required: false,
    enum: LICENSE_STATUS,
    default: LICENSE_STATUS.NOT_LICENSED,
  })
  licenseStatus: LICENSE_STATUS;

  @Prop({
    required: false,
    type: String,
  })
  licenseNumber: string;
}

export type BusinessDocument = HydratedDocument<Business>;

export const BusinessSchema = SchemaFactory.createForClass(Business);

// Indexes
BusinessSchema.index({ userId: 1 });
BusinessSchema.index({ approved: 1, enabled: 1 });
BusinessSchema.index({ rating: 1 });
BusinessSchema.index({ days: 1 });
BusinessSchema.index({ lat: 1, long: 1 });
BusinessSchema.index({ chargeTiming: 1 });
BusinessSchema.index({ name: 'text', location: 'text' });
