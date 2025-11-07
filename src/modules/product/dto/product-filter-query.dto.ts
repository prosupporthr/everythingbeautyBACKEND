import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';

export class ProductFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search text (name/description)',
    example: 'spa',
  })
  @IsOptional()
  @IsString()
  q?: string;

  // @ApiPropertyOptional({ description: 'Filter by business ID', example: '64f7c2d91c2f4a0012345678' })
  // @IsOptional()
  // @IsMongoId()
  // businessId?: string;

  // @ApiPropertyOptional({ description: 'Filter by enabled status (defaults to true)', example: true })
  // @IsOptional()
  // @Type(() => Boolean)
  // @IsBoolean()
  // enabled?: boolean = true;

  // @ApiPropertyOptional({ description: 'Filter by allowReview flag', example: true })
  // @IsOptional()
  // @Type(() => Boolean)
  // @IsBoolean()
  // allowReview?: boolean;

  // @ApiPropertyOptional({ description: 'Minimum price', example: 10 })
  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // @Min(0)
  // minPrice?: number;

  // @ApiPropertyOptional({ description: 'Maximum price', example: 100 })
  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // @Min(0)
  // maxPrice?: number;

  // @ApiPropertyOptional({ description: 'Minimum hourly rate', example: 10 })
  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // @Min(0)
  // minHourlyRate?: number;

  // @ApiPropertyOptional({ description: 'Maximum hourly rate', example: 200 })
  // @IsOptional()
  // @Type(() => Number)
  // @IsInt()
  // @Min(0)
  // maxHourlyRate?: number;

  // @ApiPropertyOptional({ description: 'Filter by color (colors array contains)', example: 'red' })
  // @IsOptional()
  // @IsString()
  // color?: string;
}
