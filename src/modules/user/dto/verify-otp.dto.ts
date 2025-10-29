import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'A1B2C3', description: 'Alphanumeric OTP code (length 6)' })
  @IsString()
  @Length(4, 10)
  code: string;
}