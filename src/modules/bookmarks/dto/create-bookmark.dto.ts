import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { BOOKMARK_TYPE } from '@/schemas/Bookmark.schema';

export class CreateBookmarkDto {
  @ApiProperty({ description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Bookmark type', enum: BOOKMARK_TYPE })
  @IsEnum(BOOKMARK_TYPE)
  type: BOOKMARK_TYPE;

  @ApiProperty({
    description: 'Service ID (required when type is service)',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  serviceId?: string;

  @ApiProperty({
    description: 'Product ID (required when type is product)',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  productId?: string;
}