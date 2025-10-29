import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class BookingBusinessQueryDto {
  @ApiPropertyOptional({ description: 'Filter by service ID', example: '64f7c2d91c2f4a0012345678' })
  @IsOptional()
  @IsMongoId()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Start of booking date/time range (ISO)', example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End of booking date/time range (ISO)', example: '2025-01-31T23:59:59.999Z' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Exact booking date/time (ISO)', example: '2025-01-15T09:30:00.000Z' })
  @IsOptional()
  @IsString()
  time?: string;
}