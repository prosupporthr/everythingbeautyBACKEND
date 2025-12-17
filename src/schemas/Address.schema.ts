import { HydratedDocument, SchemaTypes } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema()
export class Address extends MetaSchema {
  @Prop({
    required: false,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  userId: string;

  @Prop({
    required: false,
    type: String,
  })
  address: string;

  @Prop({
    required: false,
    type: String,
  })
  city: string;

  @Prop({
    required: false,
    type: String,
  })
  state: string;

  @Prop({
    required: false,
    type: String,
  })
  country: string;

  @Prop({
    required: false,
    type: String,
  })
  lat: string;

  @Prop({
    required: false,
    type: String,
  })
  long: string;

  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  isPrimary: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
