import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EditServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Haircut',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional haircut and styling',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Hourly rate', example: 55, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ description: 'Allow reviews', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  allowReview?: boolean;

  @ApiProperty({
    description: 'Accepts initial deposit',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  acceptsInitialDeposit?: boolean;

  @ApiProperty({
    description: 'Initial deposit percentage',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  initialDepositPercentage?: number;

  @ApiProperty({
    description: 'Pictures',
    example: ['images/service1.png'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];
}
