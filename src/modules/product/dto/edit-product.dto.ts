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

export class EditProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Shampoo',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Organic hair shampoo',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Hourly rate or price',
    example: 25,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Allow reviews', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  allowReview?: boolean;

  @ApiProperty({
    description: 'Pictures',
    example: ['images/product1.png'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];
}
