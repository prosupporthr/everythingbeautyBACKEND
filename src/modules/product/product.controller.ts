/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { EditProductDto } from './dto/edit-product.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { ProductFilterQueryDto } from './dto/product-filter-query.dto';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { UserAuthCheckGuard } from '@/common/guards/user-auth-check/user-auth-check.guard';
import express from 'express';
import { UserDocument } from '@/schemas/User.schema';

@ApiBearerAuth('JWT-auth')
@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({ description: 'Product created' })
  async createProduct(@Body() dto: CreateProductDto): Promise<ReturnType> {
    return this.productService.createProduct(dto);
  }

  @Get('filter')
  @UseGuards(UserAuthCheckGuard)
  @ApiOperation({ summary: 'Get filtered products (paginated)' })
  @ApiOkResponse({ description: 'Filtered products fetched' })
  async getFilteredProducts(
    @Query() query: ProductFilterQueryDto,
    @Req() req: express.Request,
  ): Promise<PaginatedReturnType> {
    const user = req['user'] as UserDocument;
    if (user) {
      return this.productService.getFilteredProducts(query, user);
    }
    return this.productService.getFilteredProducts(query);
  }

  @Get(':id')
  @UseGuards(UserAuthCheckGuard)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Product fetched' })
  async getProductById(
    @Param('id') id: string,
    @Req() req: express.Request,
  ): Promise<ReturnType> {
    const user = req['user'];

    if (user) {
      return this.productService.getProductById(id, user as UserDocument);
    }
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Edit a product' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiBody({ type: EditProductDto })
  @ApiOkResponse({ description: 'Product updated' })
  async editProduct(
    @Param('id') id: string,
    @Body() dto: EditProductDto,
  ): Promise<ReturnType> {
    return this.productService.editProduct(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Product deleted' })
  async softDeleteProduct(@Param('id') id: string): Promise<ReturnType> {
    return this.productService.softDeleteProduct(id);
  }

  @Get('business/:businessId')
  @UseGuards(UserAuthCheckGuard)
  @ApiOperation({ summary: 'Get all products for a business (paginated)' })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    example: '64f7c2d91c2f4a0012345678',
  })
  @ApiOkResponse({ description: 'Business products fetched (paginated)' })
  async getBusinessProducts(
    @Param('businessId') businessId: string,
    @Query() query: PaginationQueryDto,
    @Req() req: express.Request,
  ): Promise<PaginatedReturnType> {
    const user = req['user'] as UserDocument;
    if (user) {
      return this.productService.getBusinessProducts(businessId, query, user);
    }
    return this.productService.getBusinessProducts(businessId, query);
  }
}
