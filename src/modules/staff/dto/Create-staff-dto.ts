import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

   @ApiProperty({
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
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
  @IsNotEmpty()
  @IsString()
  primarySpeciality: string;

  @ApiProperty({
    example: 10
  })
  @IsNotEmpty()
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