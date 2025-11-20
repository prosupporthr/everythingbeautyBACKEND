import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { MESSAGE_TYPE } from '@/schemas/ChatMessage.schema';

export class CreateChatMessageDto {
  @ApiProperty({ description: 'Chat ID', example: '64f7c2d91c2f4a0012345678' })
  @IsMongoId()
  chatId: string;

  @ApiProperty({
    description: 'Sender user ID',
    example: '64f7c2d91c2f4a0098765432',
  })
  @IsMongoId()
  senderId: string;

  @ApiProperty({ description: 'Message type', enum: MESSAGE_TYPE })
  @IsEnum(MESSAGE_TYPE)
  type: MESSAGE_TYPE;

  @ApiProperty({ description: 'Message text content', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
