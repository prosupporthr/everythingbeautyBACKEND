import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto {
  @ApiProperty({
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  name: string;

   @ApiProperty({
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  porfolioLink: string;

  @ApiProperty({
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  primarySpeciality: string;

  @ApiProperty({
    example: 10
  })
  @IsNumber()
  yearsOfExperience: number;

  @ApiProperty({
    example: ['HTML', 'CSS', 'JavaScript']
  })
  @IsArray()
  @IsOptional()
  skills: string[];

  @ApiProperty({
    example: '/uploads/photo.png'
  })
  @IsOptional()
  @IsString()
  image?: string;
}