import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumber,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Amount to withdraw', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Destination bank account id (from linked accounts)',
    example: 'ba_1Pxxxxxxx',
  })
  @IsString()
  bankAccountId: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'usd',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';
}
