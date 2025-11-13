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
  ApiTags,
} from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { EditServiceDto } from './dto/edit-service.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiBearerAuth('JWT-auth')
@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: 'Create a service' })
  @ApiBody({ type: CreateServiceDto })
  @ApiOkResponse({ description: 'Service created' })
  async createService(@Body() dto: CreateServiceDto): Promise<ReturnType> {
    return this.serviceService.createService(dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all services for a business (paginated)' })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business services fetched (paginated)' })
  async getAllServices(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.serviceService.getAllServices(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Service fetched' })
  async getServiceById(@Param('id') id: string): Promise<ReturnType> {
    return this.serviceService.getServiceById(id);
  }

  @Patch(':id')
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: 'Edit a service' })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiBody({ type: EditServiceDto })
  @ApiOkResponse({ description: 'Service updated' })
  async editService(
    @Param('id') id: string,
    @Body() dto: EditServiceDto,
  ): Promise<ReturnType> {
    return this.serviceService.editService(id, dto);
  }

  @Delete(':id')
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: 'Soft delete a service' })
  @ApiParam({
    name: 'id',
    description: 'Service ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Service deleted' })
  async softDeleteService(@Param('id') id: string): Promise<ReturnType> {
    return this.serviceService.softDeleteService(id);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all services for a business (paginated)' })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business services fetched (paginated)' })
  async getBusinessServices(
    @Param('businessId') businessId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.serviceService.getBusinessServices(businessId, query);
  }
}
