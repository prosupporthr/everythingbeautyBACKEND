import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @IsMongoId()
  businessId: string;

  @ApiProperty({ description: 'Product name', example: 'Shampoo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Organic hair shampoo',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'price', example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'quantity', example: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

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
