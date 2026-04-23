import { HydratedDocument, SchemaTypes } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type ShipmentDocument = HydratedDocument<Shipment>;

export class Shipment extends MetaSchema {
  @Prop({
    required: false,
    type: SchemaTypes.ObjectId,
    ref: 'User',
  })
  orderId: string;

  @Prop({
    required: false,
    type: String,
  })
  status: string;

  @Prop({
    required: false,
    type: SchemaTypes.ObjectId,
    ref: 'Address',
  })
  deliveryAddressId: string;

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
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
