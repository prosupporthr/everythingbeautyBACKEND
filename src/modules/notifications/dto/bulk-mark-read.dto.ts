import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export enum NOTIFICATION_USER_TYPE {
  USER = 'user',
  ADMIN = 'admin',
}

export class BulkMarkReadDto {
  @ApiProperty({
    description: 'Notification IDs to mark as read',
    example: ['64f7c2d91c2f4a0012345678', '64f7c2d91c2f4a0012345679'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];

  @ApiProperty({
    description: 'Type of user performing the action',
    enum: NOTIFICATION_USER_TYPE,
    example: NOTIFICATION_USER_TYPE.USER,
  })
  @IsEnum(NOTIFICATION_USER_TYPE)
  userType: NOTIFICATION_USER_TYPE;

  @ApiProperty({
    description: 'Admin ID (required when userType is admin)',
    required: false,
    example: '64f7c2d91c2f4a0012345670',
  })
  @IsOptional()
  @IsString()
  adminId?: string;
}
