import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { GENDER } from '@schemas/User.schema';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty({ example: 'John', required: false, description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false, description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+15551234567', required: false, description: 'Phone number (E.164)' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '1990-01-01', required: false, description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({ enum: GENDER, example: GENDER.MALE, required: false, description: 'Gender' })
  @IsOptional()
  @IsEnum(GENDER)
  gender?: GENDER;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.png', required: false, description: 'Profile picture URL' })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ example: 'I enjoy photography and travel.', required: false, description: 'About the user' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ example: '123 Main St, Springfield', required: false, description: 'Home address' })
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiProperty({ example: 'CA', required: false, description: 'State or region' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '456 Business Rd, Springfield', required: false, description: 'Office address' })
  @IsOptional()
  @IsString()
  officeAddress?: string;

  @ApiProperty({ example: 'USA', required: false, description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;
}