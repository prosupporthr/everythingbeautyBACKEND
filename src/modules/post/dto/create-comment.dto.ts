import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ required: false, example: 'Nice post!' })
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @ApiProperty({ required: false, example: 'Nice post!' })
  @IsBoolean()
  isReply?: boolean;

  @ApiProperty({ required: false, example: 'edie392929bdwd' })
  @IsString()
  @IsOptional()
  commentId: string;

  @ApiProperty({ required: false, example: ['uploads/abc.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
