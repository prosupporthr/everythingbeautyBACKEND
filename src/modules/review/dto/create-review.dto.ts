import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Business ID', example: '64f7c2d91c2f4a00abcdef12' })
  @IsMongoId()
  businessId: string;

  @ApiProperty({ description: 'Review description', example: 'Great service and friendly staff!' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Rating between 1 and 5', example: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}