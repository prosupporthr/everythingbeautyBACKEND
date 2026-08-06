import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({ description: 'Sender user ID (must be the original sender)', example: '64f7c2d91c2f4a0098765432' })
  @IsMongoId()
  senderId: string;

  @ApiProperty({ description: 'New message text content' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
