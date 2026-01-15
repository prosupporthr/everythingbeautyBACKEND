import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '@schemas/Product.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { EditProductDto } from './dto/edit-product.dto';
import { ProductFilterQueryDto } from './dto/product-filter-query.dto';
import { Business } from '@/schemas/Business.schema';
import { BusinessDocument } from '@/schemas/Business.schema';
import { UploadService } from '../upload/upload.service';
import { UserDocument } from '@/schemas/User.schema';
import { BusinessService } from '../business/business.service';
import {
  Bookmark,
  BookmarkDocument,
  BOOKMARK_TYPE,
} from '@/schemas/Bookmark.schema';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Bookmark.name)
    private readonly bookmarkModel: Model<BookmarkDocument>,
    private uploadService: UploadService,
    private businessService: BusinessService,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ReturnType> {
    const created = await this.productModel.create({ ...dto });
    const enrichedProduct = await this.enrichProduct(created);
    return new ReturnType({
      success: true,
      message: 'Product created',
      data: enrichedProduct,
    });
  }

  async getProductById(id: string, user?: UserDocument): Promise<ReturnType> {
    const product = await this.productModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!product) throw new NotFoundException('Product not found');
    const enrichedProduct = await this.enrichProduct(product, user);
    return new ReturnType({
      success: true,
      message: 'Product fetched',
      data: enrichedProduct,
    });
  }

  async editProduct(id: string, dto: EditProductDto): Promise<ReturnType> {
    const updated = await this.productModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...dto, updatedAt: new Date().toISOString() },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Product not found');
    const enrichedProduct = await this.enrichProduct(updated);
    return new ReturnType({
      success: true,
      message: 'Product updated',
      data: enrichedProduct,
    });
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
    return new ReturnType({
      success: true,
      message: 'Product deleted',
      data: deleted,
    });
  }

  async getBusinessProducts(
    businessId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
    user?: UserDocument,
  ): Promise<PaginatedReturnType<ProductDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel
        .find({ businessId, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments({
        businessId,
        isDeleted: false,
        enabled: true,
      }),
    ]);

    const enrichedProducts = await Promise.all(
      data.map(async (product) => this.enrichProduct(product, user)),
    );

    return new PaginatedReturnType<ProductDocument[]>({
      success: true,
      message: 'Business products fetched',
      data: enrichedProducts,
      page,
      total,
    });
  }

  async getFilteredProducts(
    {
      page = 1,
      limit = 10,
      q,
      // businessId,
      // allowReview,
      // minPrice,
      // maxPrice,
      // color,
    }: ProductFilterQueryDto,
    user?: UserDocument,
  ): Promise<PaginatedReturnType<ProductDocument[]>> {
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = { isDeleted: false };

    // if (businessId) filter.businessId = businessId;
    // if (allowReview !== undefined) filter.allowReview = allowReview;
    // if (color) filter.colors = { $in: [color] };

    // if (minPrice !== undefined || maxPrice !== undefined) {
    //   filter.price = {};
    //   if (minPrice !== undefined) filter.price.$gte = minPrice;
    //   if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    // }

    const textFilter = q ? { $text: { $search: q } } : {};
    const finalFilter = { ...filter, ...textFilter };

    const [data, total] = await Promise.all([
      this.productModel
        .find(finalFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments(finalFilter),
    ]);

    const enrichedProducts = await Promise.all(
      data.map(async (product) => this.enrichProduct(product, user)),
    );

    return new PaginatedReturnType<ProductDocument[]>({
      success: true,
      message: 'Filtered products fetched',
      data: enrichedProducts,
      page,
      total,
    });
  }

  async getAllProducts(
    { page = 1, limit = 10 }: PaginationQueryDto,
    user?: UserDocument,
  ): Promise<PaginatedReturnType<ProductDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel
        .find({ isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments({ isDeleted: false }),
    ]);

    const enrichedProducts = await Promise.all(
      data.map(async (product) => this.enrichProduct(product, user)),
    );

    return new PaginatedReturnType<ProductDocument[]>({
      success: true,
      message: 'All products fetched',
      data: enrichedProducts,
      page,
      total,
    });
  }

  public async enrichProduct(product: ProductDocument, user?: UserDocument) {
    try {
      const business = await this.businessModel.findById(product.businessId);
      const productImages = await this.uploadService.getSignedUrl(
        product.pictures,
      );
      const businessData = await this.businessService.enrichedBusiness(
        business as any,
      );

      let hasBookmarked = false;
      if (user) {
        const bookmark = await this.bookmarkModel.findOne({
          userId: user._id,
          productId: product._id,
          type: BOOKMARK_TYPE.PRODUCT,
          isDeleted: false,
        });
        if (bookmark) hasBookmarked = true;
      }

      return {
        ...product.toObject(),
        business: businessData,
        pictures: productImages,
        hasBookmarked,
      };
    } catch (error) {
      this.logger.error('Error enriching product business name', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }
}
