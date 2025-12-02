import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Sender user ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @IsMongoId()
  senderId: string;

  @ApiProperty({
    description: 'Recipient user ID',
    example: '64f7c2d91c2f4a0098765432',
  })
  @IsMongoId()
  recipientId: string;
}
