import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { ReturnType } from '@/common/classes/ReturnType';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user/current-user.decorator';
import { User } from '@/schemas/User.schema';
import type { UserDocument } from '@/schemas/User.schema';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { PaginationQueryDto } from '../business/dto/pagination-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a post' })
  @ApiBody({ type: CreatePostDto })
  @ApiOkResponse({ description: 'Post created' })
  async createPost(
    @CurrentUser() user: User,
    @Body() dto: CreatePostDto,
  ): Promise<ReturnType> {
    return this.postService.createPost(
      (user as unknown as UserDocument)._id.toString(),
      dto,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Edit a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBody({ type: EditPostDto })
  @ApiOkResponse({ description: 'Post updated' })
  async editPost(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: EditPostDto,
  ): Promise<ReturnType> {
    return this.postService.editPost(
      (user as unknown as UserDocument)._id.toString(),
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ description: 'Post deleted' })
  async deletePost(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ReturnType> {
    return this.postService.deletePost(
      (user as unknown as UserDocument)._id.toString(),
      id,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated posts (newest first)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Posts retrieved' })
  async getPosts(@Query() query: PaginationQueryDto): Promise<PaginatedReturnType> {
    return this.postService.getPosts(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ description: 'Post retrieved' })
  async getPostById(@Param('id') id: string): Promise<ReturnType> {
    return this.postService.getPostById(id);
  }

   @Get('/likes/:postId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a post by postID' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Post retrieved' })
  async getPostLikedUsers(
    @Param('postId') postId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.postService.getLikedUsers(postId, query?.page, query?.limit);
  }

  @Get('/profile/:userId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Post retrieved' })
  async getPostByUserId(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.postService.getPostsByUserId(userId, query);
  }

  @Post(':postId/comment')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Comment on a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiOkResponse({ description: 'Comment created' })
  async commentOnPost(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<ReturnType> {
    return this.postService.commentOnPost(
      (user as unknown as UserDocument)._id.toString(),
      postId,
      dto,
    );
  }

  @Get(':postId/comments')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated comments for a post (newest first)' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Comments retrieved' })
  async getPostComments(
    @Param('postId') postId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.postService.getPostComments(postId, query);
  }
}
