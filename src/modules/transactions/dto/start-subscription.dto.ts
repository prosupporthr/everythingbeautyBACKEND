import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, IsUrl } from 'class-validator';

export class StartSubscriptionDto {
  @ApiProperty({ description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'Stripe Price ID for the recurring plan',
    example: 'price_1Pxxxxxxx',
  })
  @IsString()
  priceId: string;

  @ApiProperty({
    description: 'URL to redirect after successful checkout',
    example: 'https://app.example.com/billing/success',
  })
  @IsUrl()
  successUrl: string;

  @ApiProperty({
    description: 'URL to redirect if checkout is canceled',
    example: 'https://app.example.com/billing/cancel',
  })
  @IsUrl()
  cancelUrl: string;
}

