import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ required: false, example: 'Hello world' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ required: false, example: ['uploads/abc.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ required: false, example: '64f7c2d91c2f4a0012345678' })
  @IsOptional()
  @IsMongoId()
  productId?: string;
}
