import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ACCESS, ADMIN_ROLE } from '@/schemas/Admin.schema';

export class UpdateAdminDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ADMIN_ROLE })
  @IsOptional()
  @IsEnum(ADMIN_ROLE)
  role?: ADMIN_ROLE;

  @ApiPropertyOptional({ enum: ACCESS, isArray: true })
  @IsOptional()
  @IsArray()
  access?: ACCESS[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  suspended?: boolean;
}
