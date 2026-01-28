import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiBearerAuth('JWT-auth')
@ApiTags('Messaging')
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // 1. Create chat
  @Post('chats')
  @UseGuards(UserAuthGuard)
  @ApiOperation({
    summary: 'Create chat (deduplicated by participants and business)',
  })
  @ApiBody({ type: CreateChatDto })
  @ApiOkResponse({ description: 'Chat created or existing returned' })
  async createChat(@Body() dto: CreateChatDto): Promise<ReturnType> {
    return this.messagingService.createChat(dto);
  }

  // 2. Create chat message
  @Post('messages')
  @UseGuards(UserAuthGuard)
  @ApiOperation({
    summary: 'Create chat message',
  })
  @ApiBody({ type: CreateChatMessageDto })
  @ApiOkResponse({ description: 'Message created' })
  async createChatMessage(
    @Body() dto: CreateChatMessageDto,
  ): Promise<ReturnType> {
    return this.messagingService.createChatMessage(dto);
  }

  // 3. Get chats for a user (paginated)
  @Get('chats/user/:userId')
  @ApiOperation({
    summary: 'Get user chats (sender or recipient) paginated',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ description: 'User chats fetched' })
  async getUserChats(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
    @Query('search') search?: string,
  ): Promise<PaginatedReturnType> {
    return this.messagingService.getUserChats(userId, query, search);
  }

  // 4. Get chat by ID
  @Get('chats/:chatId')
  @ApiOperation({
    summary: 'Get chat by ID',
  })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiOkResponse({ description: 'Chat fetched' })
  async getChatById(@Param('chatId') chatId: string): Promise<ReturnType> {
    return this.messagingService.getChatById(chatId);
  }

  // 5. Get all chat messages by chat id (paginated)
  @Get('chats/:chatId/messages')
  @ApiOperation({
    summary: 'Get chat messages by chat id (paginated)',
  })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiOkResponse({ description: 'Chat messages fetched' })
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.messagingService.getChatMessages(chatId, query);
  }

  // 6. Delete chat
  @Delete('chats/:chatId')
  @UseGuards(UserAuthGuard)
  @ApiOperation({
    summary: 'Soft delete a chat',
  })
  @ApiParam({ name: 'chatId', description: 'Chat ID' })
  @ApiOkResponse({ description: 'Chat deleted' })
  async deleteChat(@Param('chatId') chatId: string): Promise<ReturnType> {
    return this.messagingService.deleteChat(chatId);
  }

  // 7. Delete chat message
  @Delete('messages/:messageId')
  @UseGuards(UserAuthGuard)
  @ApiOperation({
    summary: 'Soft delete a chat message',
  })
  @ApiParam({ name: 'messageId', description: 'Message ID' })
  @ApiOkResponse({ description: 'Message deleted' })
  async deleteChatMessage(
    @Param('messageId') messageId: string,
  ): Promise<ReturnType> {
    return this.messagingService.deleteChatMessage(messageId);
  }
}
