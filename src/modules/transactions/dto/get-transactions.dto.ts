import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/modules/business/dto/pagination-query.dto';
import {
  PAYMENT_TYPE,
  PAYMENT_SOURCE,
  PAYMENT_STATUS,
  PAYMENT_FLOW,
} from '@/schemas/Payment.schema';

export class GetTransactionsDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Payment Type',
    enum: PAYMENT_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(PAYMENT_TYPE)
  type?: PAYMENT_TYPE;

  @ApiProperty({
    description: 'Payment Source',
    enum: PAYMENT_SOURCE,
    required: false,
  })
  @IsOptional()
  @IsEnum(PAYMENT_SOURCE)
  source?: PAYMENT_SOURCE;

  @ApiProperty({
    description: 'Payment Status',
    enum: PAYMENT_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(PAYMENT_STATUS)
  status?: PAYMENT_STATUS;

  @ApiProperty({
    description: 'Payment Flow',
    enum: PAYMENT_FLOW,
    required: false,
  })
  @IsOptional()
  @IsEnum(PAYMENT_FLOW)
  flow?: PAYMENT_FLOW;
}
