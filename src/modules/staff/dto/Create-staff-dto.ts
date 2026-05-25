import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '/uploads/photo.png'
  })
  @IsOptional()
  @IsString()
  image?: string;
}