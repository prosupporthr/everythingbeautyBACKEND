import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class BusinessFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search text (name/location)',
    example: 'fitness',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
