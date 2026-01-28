import { HydratedDocument, Types } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum ADMIN_ROLE {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

export enum ACCESS {
  DASHBOARD = 'DASHBOARD',
  USERS = 'USERS',
  TRANSACTIONS = 'TRANSACTIONS',
  BUSINESS = 'BUSINESS',
  PRODUCT = 'PRODUCT',
}

export type AdminDocument = HydratedDocument<Admin>;

@Schema({})
export class Admin extends MetaSchema {
  @Prop({ type: String })
  fullname: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  profilePicture: string;

  @Prop({ type: [String], enum: ACCESS, default: [ACCESS.DASHBOARD] })
  access: ACCESS[];

  @Prop({ type: Boolean, default: false })
  suspended: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  role: Types.ObjectId;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
