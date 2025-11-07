import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from './pagination-query.dto';
import { CHARGE_TIMING } from '@schemas/Business.schema';

export class BusinessFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search text (name/location)',
    example: 'fitness',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
