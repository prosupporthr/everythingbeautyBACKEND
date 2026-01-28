import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount to charge', example: 100 })
  @IsNumber()
  @Min(0.5) // Stripe minimum is usually around 50 cents
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'usd',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  metadata?: Record<string, string>;
}
