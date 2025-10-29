import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { EditProductDto } from './dto/edit-product.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({ description: 'Product created' })
  async createProduct(@Body() dto: CreateProductDto): Promise<ReturnType> {
    return this.productService.createProduct(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'Product fetched' })
  async getProductById(@Param('id') id: string): Promise<ReturnType> {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiBody({ type: EditProductDto })
  @ApiOkResponse({ description: 'Product updated' })
  async editProduct(
    @Param('id') id: string,
    @Body() dto: EditProductDto,
  ): Promise<ReturnType> {
    return this.productService.editProduct(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'Product deleted' })
  async softDeleteProduct(@Param('id') id: string): Promise<ReturnType> {
    return this.productService.softDeleteProduct(id);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all products for a business (paginated)' })
  @ApiParam({ name: 'businessId', description: 'Business ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'Business products fetched (paginated)' })
  async getBusinessProducts(
    @Param('businessId') businessId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    return this.productService.getBusinessProducts(businessId, query);
  }
}
