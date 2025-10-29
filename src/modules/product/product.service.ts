import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '@schemas/Product.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { EditProductDto } from './dto/edit-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ReturnType> {
    const created = await this.productModel.create({ ...dto });
    return new ReturnType({ success: true, message: 'Product created', data: created });
  }

  async getProductById(id: string): Promise<ReturnType> {
    const product = await this.productModel.findOne({ _id: id, isDeleted: false });
    if (!product) throw new NotFoundException('Product not found');
    return new ReturnType({ success: true, message: 'Product fetched', data: product });
  }

  async editProduct(id: string, dto: EditProductDto): Promise<ReturnType> {
    const updated = await this.productModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...dto, updatedAt: new Date().toISOString() },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Product not found');
    return new ReturnType({ success: true, message: 'Product updated', data: updated });
  }

  async softDeleteProduct(id: string): Promise<ReturnType> {
    const deleted = await this.productModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { new: true },
    );
    if (!deleted) throw new NotFoundException('Product not found');
    return new ReturnType({ success: true, message: 'Product deleted', data: deleted });
  }

  async getBusinessProducts(
    businessId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<ProductDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel
        .find({ businessId, isDeleted: false, enabled: true })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments({ businessId, isDeleted: false, enabled: true }),
    ]);

    return new PaginatedReturnType<ProductDocument[]>({
      success: true,
      message: 'Business products fetched',
      data,
      page,
      total,
    });
  }
}
