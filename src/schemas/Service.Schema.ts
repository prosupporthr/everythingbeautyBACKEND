import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MetaSchema } from './meta.schema';
import { HydratedDocument, type ObjectId, SchemaTypes } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Service extends MetaSchema {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
    ref: 'Business',
  })
  businessId: ObjectId;

  @Prop({
    required: true,
    trim: true,
    transform: (v: string) => v?.toLowerCase?.(),
  })
  name: string;

  @Prop({
    required: false,
    trim: true,
    type: String,
  })
  description: string;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  hourlyRate: number;

  @Prop({
    required: false,
    type: Boolean,
    default: true,
  })
  allowReview: boolean;

  @Prop({
    required: false,
    type: [String],
    default: [],
  })
  pictures: string[];
}

export type ServiceDocument = HydratedDocument<Service>;
export const ServiceSchema = SchemaFactory.createForClass(Service);

// Indexes
ServiceSchema.index({ businessId: 1 });
ServiceSchema.index({ hourlyRate: 1 });
ServiceSchema.index({ allowReview: 1 });
ServiceSchema.index({ name: 'text', description: 'text' });
