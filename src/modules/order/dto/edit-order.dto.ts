import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ORDER_STATUS, PAYMENT_STATUS } from '@/schemas/Order.schema';

export class EditOrderDto {
  @ApiPropertyOptional({ description: 'Product ID to update', example: '64f7c2d91c2f4a00fedcba98' })
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Total price', example: 59.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiPropertyOptional({ description: 'Payment status', enum: PAYMENT_STATUS })
  @IsOptional()
  @IsEnum(PAYMENT_STATUS)
  paymentStatus?: PAYMENT_STATUS;

  @ApiPropertyOptional({ description: 'Order status', enum: ORDER_STATUS })
  @IsOptional()
  @IsEnum(ORDER_STATUS)
  status?: ORDER_STATUS;
}