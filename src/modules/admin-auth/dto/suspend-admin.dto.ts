import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SuspendAdminDto {
  @ApiProperty()
  @IsBoolean()
  suspended: boolean;
}
