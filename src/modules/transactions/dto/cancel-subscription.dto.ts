import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiProperty({ description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;
}

