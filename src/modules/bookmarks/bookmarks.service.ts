import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Bookmark,
  BookmarkDocument,
  BOOKMARK_TYPE,
} from '@/schemas/Bookmark.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark.name)
    private readonly bookmarkModel: Model<BookmarkDocument>,
  ) {}

  async toggleBookmark(dto: CreateBookmarkDto): Promise<ReturnType> {
    try {
      if (dto.type === BOOKMARK_TYPE.SERVICE && !dto.serviceId) {
        throw new BadRequestException(
          'serviceId is required for service bookmark',
        );
      }
      if (dto.type === BOOKMARK_TYPE.PRODUCT && !dto.productId) {
        throw new BadRequestException(
          'productId is required for product bookmark',
        );
      }

      const filter: Record<string, any> = {
        userId: dto.userId,
        type: dto.type,
        isDeleted: false,
      };
      if (dto.type === BOOKMARK_TYPE.SERVICE) filter.serviceId = dto.serviceId;
      if (dto.type === BOOKMARK_TYPE.PRODUCT) filter.productId = dto.productId;

      const existing = await this.bookmarkModel.findOne(filter);
      if (existing) {
        const removed = await this.bookmarkModel.findByIdAndUpdate(
          existing._id,
          {
            isDeleted: true,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { new: true },
        );
        return new ReturnType({
          success: true,
          message: 'Bookmark removed',
          data: removed,
        });
      }

      const created = await this.bookmarkModel.create({
        userId: dto.userId,
        type: dto.type,
        serviceId:
          dto.type === BOOKMARK_TYPE.SERVICE ? dto.serviceId : undefined,
        productId:
          dto.type === BOOKMARK_TYPE.PRODUCT ? dto.productId : undefined,
      });
      return new ReturnType({
        success: true,
        message: 'Bookmark created',
        data: created,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  async softDeleteBookmark(id: string): Promise<ReturnType> {
    try {
      const deleted = await this.bookmarkModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { new: true },
      );
      if (!deleted) throw new NotFoundException('Bookmark not found');
      return new ReturnType({
        success: true,
        message: 'Bookmark deleted',
        data: deleted,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  async getUserBookmarks(
    userId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.bookmarkModel
          .find({ userId, isDeleted: false })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          // populate both; we will expose only the relevant one based on type
          .populate({ path: 'serviceId', model: 'Service' })
          .populate({ path: 'productId', model: 'Product' })
          .exec(),
        this.bookmarkModel.countDocuments({ userId, isDeleted: false }),
      ]);

      const enriched = data.map((b) => {
        const obj = b.toObject();
        if (b.type === BOOKMARK_TYPE.SERVICE) {
          const { serviceId } = obj;
          return { ...obj, service: serviceId ?? null };
        }
        if (b.type === BOOKMARK_TYPE.PRODUCT) {
          const { productId } = obj;
          return { ...obj, product: productId ?? null };
        }
        return obj;
      });

      return new PaginatedReturnType({
        success: true,
        message: 'User bookmarks fetched',
        data: enriched,
        page,
        total,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }
}
