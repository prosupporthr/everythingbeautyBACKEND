import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class TransferBookingDto {
  @ApiProperty({
    description: 'New staff ID to assign to the booking',
    example: '64f7c2d91c2f4a0012345678',
  })
  @IsMongoId()
  newStaffId: string;
}
