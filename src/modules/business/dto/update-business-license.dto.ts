import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LICENSE_STATUS } from '@schemas/Business.schema';

export class UpdateBusinessLicenseDto {
  @ApiProperty({
    description: 'License status',
    enum: LICENSE_STATUS,
    example: LICENSE_STATUS.LICENSED,
  })
  @IsNotEmpty()
  @IsEnum(LICENSE_STATUS)
  status: LICENSE_STATUS;
}
