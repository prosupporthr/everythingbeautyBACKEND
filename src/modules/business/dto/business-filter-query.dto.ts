import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from './pagination-query.dto';
import { CHARGE_TIMING } from '@schemas/Business.schema';

export class BusinessFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search text (name/location)', example: 'fitness' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by charge timing', enum: CHARGE_TIMING, example: CHARGE_TIMING.AFTER_ORDER })
  @IsOptional()
  @IsEnum(CHARGE_TIMING)
  chargeTiming?: CHARGE_TIMING;

  @ApiPropertyOptional({ description: 'Filter by approval status', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  approved?: boolean;

  @ApiPropertyOptional({ description: 'Filter by enabled status (defaults to true)', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enabled?: boolean = true;

  @ApiPropertyOptional({ description: 'Minimum rating', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum rating', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxRating?: number;

  @ApiPropertyOptional({ description: 'Filter by day of operation (0-6)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  day?: number;

  @ApiPropertyOptional({ description: 'Filter by owner user ID', example: '64f7c2d91c2f4a0012345678' })
  @IsOptional()
  @IsMongoId()
  userId?: string;
}