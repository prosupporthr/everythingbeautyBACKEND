import { SetMetadata } from '@nestjs/common';

export enum UserType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const AUTH_TYPE_KEY = 'authType';
export const AuthType = (...authTypes: UserType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
