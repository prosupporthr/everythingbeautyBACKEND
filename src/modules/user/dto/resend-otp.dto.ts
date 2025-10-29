import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email to resend OTP' })
  @IsEmail()
  email: string;
}