import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { STATUS } from '@schemas/Booking.schema';

export class ChangeBookingStatusDto {
  @ApiProperty({ description: 'New booking status', enum: STATUS, example: STATUS.APPROVED })
  @IsEnum(STATUS)
  status: STATUS;
}