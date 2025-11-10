import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { EditOrderDto } from './dto/edit-order.dto';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiOkResponse({ description: 'Order created' })
  async createOrder(@Body() dto: CreateOrderDto): Promise<ReturnType> {
    return this.orderService.createOrder(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'Order fetched' })
  async getOrderById(@Param('id') id: string): Promise<ReturnType> {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an order' })
  @ApiParam({ name: 'id', description: 'Order ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiBody({ type: EditOrderDto })
  @ApiOkResponse({ description: 'Order updated' })
  async editOrder(
    @Param('id') id: string,
    @Body() dto: EditOrderDto,
  ): Promise<ReturnType> {
    return this.orderService.editOrder(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'Order deleted' })
  async softDeleteOrder(@Param('id') id: string): Promise<ReturnType> {
    return this.orderService.softDeleteOrder(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user orders (paginated)' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'User orders fetched' })
  async getUserOrders(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.orderService.getUserOrders(userId, query);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get business orders (paginated)' })
  @ApiParam({ name: 'businessId', description: 'Business ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Business orders fetched' })
  async getBusinessOrders(
    @Param('businessId') businessId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.orderService.getBusinessOrders(businessId, query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product orders (paginated)' })
  @ApiParam({ name: 'productId', description: 'Product ID', example: '64f7c2d91c2f4a00fedcba98' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Product orders fetched' })
  async getProductOrders(
    @Param('productId') productId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.orderService.getProductOrders(productId, query);
  }
}
