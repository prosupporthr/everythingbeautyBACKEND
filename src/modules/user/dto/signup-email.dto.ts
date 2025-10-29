import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email for signup' })
  @IsEmail()
  email: string;
}