import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ description: 'Business ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  businessId: string;

  @ApiProperty({ description: 'Service name', example: 'Haircut' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Service description', example: 'Professional haircut and styling', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Hourly rate', example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @ApiProperty({ description: 'Allow reviews', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  allowReview?: boolean;

  @ApiProperty({ description: 'Pictures', example: ['images/service1.png'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];
}