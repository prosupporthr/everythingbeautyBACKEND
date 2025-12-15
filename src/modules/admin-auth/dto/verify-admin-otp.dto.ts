import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyAdminOtpDto {
  @ApiProperty()
  @IsString()
  @Length(4, 10)
  code: string;
}
