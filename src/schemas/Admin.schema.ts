import { HydratedDocument } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum ADMIN_ROLE {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  GROWTH_MANAGER = 'GROWTH_MANAGER',
  PRODUCT_MANAGER = 'PRODUCT_MANAGER',
  COMMUNITY_SUPPORT = 'COMMUNITY_SUPPORT',
}

export enum ACCESS {
  DASHBOARD = 'DASHBOARD',
  USERS = 'USERS',
  CHALLENGES = 'CHALLENGES',
  TRANSACTIONS = 'TRANSACTIONS',
  COMMUNITY = 'COMMUNITY',
}

export type AdminDocument = HydratedDocument<Admin>;

@Schema({
  autoCreate: true,
  autoIndex: true,
  autoSearchIndex: true,
})
export class Admin extends MetaSchema {
  @Prop({ type: String })
  fullname: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  profilePicture: string;

  @Prop({ type: String, enum: ADMIN_ROLE, default: ADMIN_ROLE.ADMIN })
  role: ADMIN_ROLE;

  @Prop({ type: [String], enum: ACCESS, default: [ACCESS.DASHBOARD] })
  access: ACCESS[];

  @Prop({ type: Boolean, default: false })
  suspended: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
