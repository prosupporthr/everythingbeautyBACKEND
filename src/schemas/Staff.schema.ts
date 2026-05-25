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
    required: false,
  })
  image: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
