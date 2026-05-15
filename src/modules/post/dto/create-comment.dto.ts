import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ required: false, example: 'Nice post!' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ required: false, example: ['uploads/abc.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
