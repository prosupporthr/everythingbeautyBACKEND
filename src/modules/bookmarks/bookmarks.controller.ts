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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
@ApiTags('Bookmarks')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Create a bookmark, or remove it if it exists' })
  @ApiBody({ type: CreateBookmarkDto })
  @ApiOkResponse({ description: 'Bookmark created or removed' })
  async toggleBookmark(@Body() dto: CreateBookmarkDto): Promise<ReturnType> {
    return this.bookmarksService.toggleBookmark(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a bookmark' })
  @ApiParam({
    name: 'id',
    description: 'Bookmark ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Bookmark deleted' })
  async softDeleteBookmark(@Param('id') id: string): Promise<ReturnType> {
    return this.bookmarksService.softDeleteBookmark(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user bookmarks (paginated)' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'User bookmarks fetched' })
  async getUserBookmarks(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.bookmarksService.getUserBookmarks(userId, query);
  }
}
