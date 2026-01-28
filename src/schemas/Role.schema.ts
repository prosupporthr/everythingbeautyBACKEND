import { HydratedDocument } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type RoleDocument = HydratedDocument<Role>;
export enum ROLES {
  DASHBOARD = 'DASHBOARD',
  WALLET = 'WALLET',
  USER = 'USER',
  SERVICE = 'SERVICE',
  SHOP = 'SHOP',
  ROLE_MANAGEMENT = 'ROLE_MANAGEMENT',
  ADMIN = 'ADMIN',
}

@Schema({
  collection: 'roles',
})
export class Role extends MetaSchema {
  @Prop({
    required: false,
    type: String,
  })
  name: string;

  @Prop({
    required: false,
    type: [String],
    enum: ROLES,
  })
  permissions: ROLES[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
