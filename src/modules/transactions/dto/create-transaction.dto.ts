import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  PAYMENT_TYPE,
  PAYMENT_SOURCE,
  PAYMENT_FLOW,
} from '@/schemas/Payment.schema';

export class CreateTransactionDto {
  @ApiProperty({ description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Amount to pay', example: 100 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Payment Source',
    enum: PAYMENT_SOURCE,
    example: PAYMENT_SOURCE.STRIPE,
  })
  @IsEnum(PAYMENT_SOURCE)
  source: PAYMENT_SOURCE;

  @ApiProperty({
    description: 'Payment Type',
    enum: PAYMENT_TYPE,
    example: PAYMENT_TYPE.PRODUCT,
  })
  @IsEnum(PAYMENT_TYPE)
  type: PAYMENT_TYPE;

  @ApiProperty({
    description: 'Payment Flow',
    enum: PAYMENT_FLOW,
    example: PAYMENT_FLOW.OUTBOUND,
  })
  @IsEnum(PAYMENT_FLOW)
  flow: PAYMENT_FLOW;

  @ApiProperty({
    description: 'Related Entity ID (Booking/Order/etc)',
    example: '64f7c2d91c2f4a00abcdef12',
  })
  @IsString()
  typeId: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'usd',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';
}
