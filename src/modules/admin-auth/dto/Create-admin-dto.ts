import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'efewfw-wfwfwefewfnwerf-fweffwe',
    description: 'The role id',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
