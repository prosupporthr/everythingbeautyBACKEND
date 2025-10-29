import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Min, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'User ID making the booking', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Business ID where booking is made', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  businessId: string;

  @ApiProperty({ description: 'Service ID being booked', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  serviceId: string;

  @ApiProperty({ description: 'Total price of the booking', example: 150.5 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ description: 'Booking date/time (ISO string)', example: '2025-01-01T10:00:00.000Z' })
  @IsString()
  bookingDate: string;
}