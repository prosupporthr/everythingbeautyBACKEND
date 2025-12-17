import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { EditBusinessDto } from './dto/edit-business.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { BusinessFilterQueryDto } from './dto/business-filter-query.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { AuthGuard } from '@/common/guards/auth/auth.guard';

@ApiBearerAuth('JWT-auth')
@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a business' })
  @ApiCreatedResponse({ description: 'Business created successfully' })
  async createBusiness(@Body() dto: CreateBusinessDto): Promise<ReturnType> {
    return this.businessService.createBusiness(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Edit a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business updated successfully' })
  async editBusiness(
    @Param('id') id: string,
    @Body() dto: EditBusinessDto,
  ): Promise<ReturnType> {
    return this.businessService.editBusiness(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Soft delete a business' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business soft-deleted successfully' })
  async softDeleteBusiness(@Param('id') id: string): Promise<ReturnType> {
    return this.businessService.softDeleteBusiness(id);
  }

  @Get('filter')
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get filtered businesses (paginated)' })
  @ApiOkResponse({ description: 'Filtered businesses fetched' })
  async getFilteredBusinesses(
    @Query() query: BusinessFilterQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.businessService.getFilteredBusinesses(query);
  }

  @Get(':id')
  // @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get business by ID' })
  @ApiParam({
    name: 'id',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business fetched' })
  async getBusinessById(@Param('id') id: string): Promise<ReturnType> {
    return this.businessService.getBusinessById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all businesses for a user (paginated)' })
  @ApiParam({
    name: 'userId',
    description: 'Owner user ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'User businesses fetched' })
  async getUserBusinesses(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.businessService.getUserBusinesses(userId, query);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all businesses (paginated)' })
  @ApiOkResponse({ description: 'Businesses fetched' })
  async getAllBusinesses(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.businessService.getAllBusinesses(query);
  }
}
