import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { CHARGE_TIMING } from '@schemas/Business.schema';

export class EditBusinessDto {
  @ApiProperty({
    description: 'Business name',
    example: 'Acme Fitness',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Location (city or area)',
    example: 'San Francisco',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Longitude',
    example: '-122.4194',
    required: false,
  })
  @IsOptional()
  @IsString()
  long?: string;

  @ApiProperty({ description: 'Latitude', example: '37.7749', required: false })
  @IsOptional()
  @IsString()
  lat?: string;

  @ApiProperty({
    description: 'Days of operation (0-6)',
    example: [1, 2, 3],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  days?: number[];

  @ApiProperty({
    description: 'Opening time (HH:mm)',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiProperty({
    description: 'Closing time (HH:mm)',
    example: '17:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiProperty({
    description: 'Charge timing policy',
    enum: CHARGE_TIMING,
    example: CHARGE_TIMING.AFTER_ORDER,
    required: false,
  })
  @IsOptional()
  @IsEnum(CHARGE_TIMING)
  chargeTiming?: CHARGE_TIMING;

  @ApiProperty({
    description: 'must be from the upload endpoint',
    example: ['https://cdn.example.com/1.png'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];
}
