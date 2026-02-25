import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAYMENT_STATUS, ORDER_STATUS } from '@/schemas/Order.schema';

export class CreateOrderDto {
  @ApiProperty({ description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'Business ID',
    example: '64f7c2d91c2f4a00abcdef12',
  })
  @IsMongoId()
  businessId: string;

  @ApiProperty({
    description: 'Product ID',
    example: '64f7c2d91c2f4a00fedcba98',
  })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Total price', example: 49.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({
    description: 'Payment status',
    enum: PAYMENT_STATUS,
    default: PAYMENT_STATUS.PENDING,
  })
  @IsEnum(PAYMENT_STATUS)
  paymentStatus?: PAYMENT_STATUS = PAYMENT_STATUS.PENDING;

  @ApiProperty({
    description: 'Order status',
    enum: ORDER_STATUS,
    default: ORDER_STATUS.PENDING,
  })
  @IsEnum(ORDER_STATUS)
  status?: ORDER_STATUS = ORDER_STATUS.PENDING;
}
