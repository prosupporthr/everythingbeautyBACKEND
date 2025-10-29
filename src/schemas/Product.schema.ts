import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Service } from './Service.Schema';

@Schema({
  timestamps: true,
})
export class Product extends Service {}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ businessId: 1 });
ProductSchema.index({ hourlyRate: 1 });
ProductSchema.index({ allowReview: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
