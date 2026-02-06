import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { CHARGE_TIMING } from '@schemas/Business.schema';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Owner user ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Business name', example: 'Acme Fitness' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Location (city or area)',
    example: 'San Francisco',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Longitude', example: '-122.4194' })
  @IsOptional()
  @IsString()
  long?: string;

  @ApiProperty({ description: 'Latitude', example: '37.7749' })
  @IsOptional()
  @IsString()
  lat?: string;

  @ApiProperty({ description: 'Days of operation (0-6)', example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  days?: number[];

  @ApiProperty({ description: 'Opening time (HH:mm)', example: '09:00' })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiProperty({ description: 'Closing time (HH:mm)', example: '17:00' })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiProperty({
    description: 'Charge timing policy',
    enum: CHARGE_TIMING,
    example: CHARGE_TIMING.AFTER_ORDER,
  })
  @IsOptional()
  @IsEnum(CHARGE_TIMING)
  chargeTiming?: CHARGE_TIMING;

  @ApiProperty({
    description: 'Business license number',
    example: 'LIC-12345678',
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({
    description: 'Business pictures',
    example: ['https://cdn.example.com/1.png'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];
}
