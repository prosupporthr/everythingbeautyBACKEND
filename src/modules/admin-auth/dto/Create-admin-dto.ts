import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;
}
