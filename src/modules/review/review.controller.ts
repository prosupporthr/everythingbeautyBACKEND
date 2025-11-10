import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review for a business' })
  @ApiBody({ type: CreateReviewDto })
  @ApiOkResponse({ description: 'Review created' })
  async createReview(@Body() dto: CreateReviewDto): Promise<ReturnType> {
    return this.reviewService.createReview(dto);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get paginated list of reviews for a business' })
  @ApiParam({ name: 'businessId', description: 'Business ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Business reviews fetched (paginated)' })
  async getBusinessReviews(
    @Param('businessId') businessId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.reviewService.getBusinessReviews(businessId, query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get paginated list of user reviews' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'User reviews fetched (paginated)' })
  async getUserReviews(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.reviewService.getUserReviews(userId, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'Review deleted' })
  async softDeleteReview(@Param('id') id: string): Promise<ReturnType> {
    return this.reviewService.softDeleteReview(id);
  }
}
