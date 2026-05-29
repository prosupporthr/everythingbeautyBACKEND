import { MetaSchema } from '@schemas/meta.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;
@Schema({
  collection: 'staff',
  autoIndex: true,
})
export class Staff extends MetaSchema {
  @Prop({
    type: String,
    required: true,
  })
  businessId: string;

  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    required: false,
  })
  address: string;

  @Prop({
    type: String,
    required: false,
  })
  porfolioLink: string;

  @Prop({
    type: String,
    required: true,
  })
  primarySpeciality: string;

  @Prop({
    type: Number,
    required: true,
  })
  yearsOfExperience: number;

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  rating: number;

  @Prop({
    type: [String],
    required: false,
  })
  skills: string[];

  @Prop({
    type: String,
    required: false,
  })
  image: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
