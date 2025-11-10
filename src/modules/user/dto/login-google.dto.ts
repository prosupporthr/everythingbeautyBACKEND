import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGoogleDto {
  @ApiProperty({ description: 'Google OAuth access token', example: 'ya29.a0AfH6SMA...' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}