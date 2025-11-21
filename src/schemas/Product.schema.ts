import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Service } from './Service.Schema';

export class ColorType {
  value: string;
  label: string;
}

@Schema({
  timestamps: true,
})
export class Product extends Service {
  @Prop({
    required: false,
    type: Number,
    min: 0,
  })
  hourlyRate: number = 0;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  price: number;

  @Prop({
    required: true,
    type: Number,
    min: 1,
  })
  quantity: number;

  @Prop({
    required: false,
    type: [ColorType],
  })
  colors: ColorType[] = [];
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ businessId: 1 });
ProductSchema.index({ hourlyRate: 1 });
ProductSchema.index({ allowReview: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
