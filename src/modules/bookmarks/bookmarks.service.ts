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

import { UploadService } from '../upload/upload.service';
import { User, UserDocument } from '@/schemas/User.schema';
import { ServiceDocument } from '@/schemas/Service.Schema';
import { ProductDocument } from '@/schemas/Product.schema';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark.name)
    private readonly bookmarkModel: Model<BookmarkDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly uploadService: UploadService,
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
          .populate({ path: 'serviceId', model: 'Service' })
          .populate({ path: 'productId', model: 'Product' })
          .populate({ path: 'userId', model: 'User' })
          .exec(),
        this.bookmarkModel.countDocuments({ userId, isDeleted: false }),
      ]);

      const enriched = await Promise.all(
        data.map(async (b) => await this.enrichBookmark(b)),
      );

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

  async enrichBookmark(bookmark: BookmarkDocument) {
    const obj = bookmark.toObject() as Record<string, any>;
    let user = obj.userId as UserDocument;

    if (user && !user.email) {
      const fetchedUser = await this.userModel.findById(user).lean().exec();
      if (fetchedUser) {
        user = fetchedUser as unknown as UserDocument;
      }
    }

    const userProfilePicture =
      user && user.profilePicture
        ? await this.uploadService.getSignedUrl(user.profilePicture)
        : null;

    const enrichedUser = user
      ? { ...user, profilePicture: userProfilePicture }
      : null;

    if (obj.type === BOOKMARK_TYPE.SERVICE) {
      const service = obj.serviceId as ServiceDocument;
      const serviceImages =
        service && service.pictures
          ? await this.uploadService.getSignedUrl(service.pictures)
          : null;

      return {
        ...obj,
        service: service ? { ...service, pictures: serviceImages } : null,
        user: enrichedUser,
      };
    }

    if (obj.type === BOOKMARK_TYPE.PRODUCT) {
      const product = obj.productId as ProductDocument;
      const productImages =
        product && product.pictures
          ? await this.uploadService.getSignedUrl(product.pictures)
          : null;

      return {
        ...obj,
        product: product ? { ...product, pictures: productImages } : null,
        user: enrichedUser,
      };
    }

    return { ...obj, user: enrichedUser };
  }
}
