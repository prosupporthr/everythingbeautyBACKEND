import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email for login' })
  @IsEmail()
  email: string;
}