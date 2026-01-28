import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from '@/schemas/Role.schema';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: [ROLES.USER, ROLES.DASHBOARD], enum: ROLES, isArray: true })
  @IsArray()
  @IsEnum(ROLES, { each: true })
  @IsNotEmpty()
  permissions: ROLES[];
}
