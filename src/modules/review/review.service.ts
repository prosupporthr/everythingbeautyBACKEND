/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '@/schemas/Review.schema';
import { Order, OrderDocument } from '@/schemas/Order.schema';
import { Booking, BookingDocument } from '@/schemas/Booking.schema';
import { Business, BusinessDocument } from '@/schemas/Business.schema';
import { User, UserDocument } from '@/schemas/User.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createReview(dto: CreateReviewDto): Promise<ReturnType> {
    try {
      // Validate ObjectId formats
      if (!Types.ObjectId.isValid(dto.userId)) {
        throw new BadRequestException('Invalid userId');
      }
      if (!Types.ObjectId.isValid(dto.businessId)) {
        throw new BadRequestException('Invalid businessId');
      }

      // Ensure referenced documents exist
      const [userExists, businessExists] = await Promise.all([
        this.userModel.exists({ _id: dto.userId }),
        this.businessModel.exists({ _id: dto.businessId }),
      ]);
      if (!userExists) {
        throw new NotFoundException('User not found');
      }
      if (!businessExists) {
        throw new NotFoundException('Business not found');
      }

      const created = await this.reviewModel.create({ ...dto });
      await this.recalculateBusinessRating(dto.businessId);
      const enriched = await this.enrichReview(created);
      return new ReturnType({
        success: true,
        message: 'Review created',
        data: enriched,
      });
    } catch (error) {
      this.logger.error('Error creating review', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  /**
   * Get businesses a user should review based on their orders and bookings.
   * Returns a grouped summary per business with related order/booking IDs.
   */
  async getPendingReviewTargets(userId: string): Promise<ReturnType> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid userId');
      }

      const userObjId = new Types.ObjectId(userId);

      const [orders, bookings, existingReviews] = await Promise.all([
        this.orderModel
          .find({ userId: userObjId, isDeleted: false })
          .select('_id businessId')
          .exec(),
        this.bookingModel
          .find({ userId: userObjId, isDeleted: false })
          .select('_id businessId')
          .exec(),
        this.reviewModel
          .find({ userId: userObjId, isDeleted: false })
          .select('businessId')
          .exec(),
      ]);

      const reviewedBusinessIds = new Set<string>(
        existingReviews.map((r) => String(r.businessId)),
      );

      type PendingGroup = {
        businessId: Types.ObjectId;
        orders: Types.ObjectId[];
        bookings: Types.ObjectId[];
      };

      const groups = new Map<string, PendingGroup>();

      for (const o of orders) {
        const bId = String(o.businessId);
        if (reviewedBusinessIds.has(bId)) continue;
        const key = bId;
        const group = groups.get(key) ?? {
          businessId: new Types.ObjectId(bId),
          orders: [],
          bookings: [],
        };
        group.orders.push(new Types.ObjectId(String(o._id)));
        groups.set(key, group);
      }

      for (const b of bookings) {
        const bId = String(b.businessId);
        if (reviewedBusinessIds.has(bId)) continue;
        const key = bId;
        const group = groups.get(key) ?? {
          businessId: new Types.ObjectId(bId),
          orders: [],
          bookings: [],
        };
        group.bookings.push(new Types.ObjectId(String(b._id)));
        groups.set(key, group);
      }

      const businessIds = Array.from(groups.values()).map((g) => g.businessId);

      const businesses = await this.businessModel
        .find({ _id: { $in: businessIds }, isDeleted: false })
        .select('_id name location pictures rating approved enabled')
        .exec();

      const businessMap = new Map<string, BusinessDocument>();
      for (const biz of businesses)
        businessMap.set(String(biz._id), biz as BusinessDocument);

      const result = Array.from(groups.values()).map((g) => {
        const biz = businessMap.get(String(g.businessId));
        return {
          business: biz
            ? {
                _id: biz._id,
                name: biz.name,
                location: biz.location,
                pictures: biz.pictures,
                rating: biz.rating,
                approved: biz.approved,
                enabled: biz.enabled,
              }
            : { _id: g.businessId },
          orders: g.orders,
          bookings: g.bookings,
        };
      });

      return new ReturnType({
        success: true,
        message: 'Pending reviews fetched',
        data: result,
      });
    } catch (error) {
      this.logger.error('Error fetching pending reviews', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  async getBusinessReviews(
    businessId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<ReviewDocument[]>> {
    try {
      const skip = (page - 1) * limit;
      const [raw, total] = await Promise.all([
        this.reviewModel
          .find({ businessId, isDeleted: false })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.reviewModel.countDocuments({ businessId, isDeleted: false }),
      ]);

      const data = await this.enrichReviews(raw);

      return new PaginatedReturnType({
        success: true,
        message: 'Business reviews fetched',
        data,
        page,
        total,
      });
    } catch (error) {
      this.logger.error('Error fetching business reviews', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  async getUserReviews(
    userId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<ReviewDocument[]>> {
    try {
      const skip = (page - 1) * limit;
      const [raw, total] = await Promise.all([
        this.reviewModel
          .find({ userId, isDeleted: false })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.reviewModel.countDocuments({ userId, isDeleted: false }),
      ]);

      const data = await this.enrichReviews(raw);

      return new PaginatedReturnType({
        success: true,
        message: 'User reviews fetched',
        data,
        page,
        total,
      });
    } catch (error) {
      this.logger.error('Error fetching user reviews', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  async softDeleteReview(id: string): Promise<ReturnType> {
    try {
      const deleted = await this.reviewModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { new: true },
      );
      if (!deleted) throw new NotFoundException('Review not found');
      await this.recalculateBusinessRating(String(deleted.businessId));
      const enriched = await this.enrichReview(deleted);
      return new ReturnType({
        success: true,
        message: 'Review deleted',
        data: enriched,
      });
    } catch (error) {
      this.logger.error('Error deleting review', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  private async recalculateBusinessRating(businessId: string): Promise<void> {
    try {
      const result = await this.reviewModel.aggregate<{
        _id: Types.ObjectId;
        avgRating: number;
      }>([
        {
          $match: {
            businessId: new Types.ObjectId(businessId),
            isDeleted: false,
          },
        },
        { $group: { _id: '$businessId', avgRating: { $avg: '$rating' } } },
      ]);
      const avgRating = result?.[0]?.avgRating ?? 0;
      await this.businessModel.findByIdAndUpdate(businessId, {
        rating: avgRating,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error recalculating business rating', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  private async enrichReview(review: ReviewDocument): Promise<any> {
    try {
      const obj =
        typeof review.toObject === 'function' ? review.toObject() : review;
      const [user, business] = await Promise.all([
        this.userModel
          .findById(obj.userId)
          .select('firstName lastName email profilePicture plan isSuspended')
          .lean(),
        this.businessModel
          .findById(obj.businessId)
          .select('name location pictures rating approved enabled')
          .lean(),
      ]);

      return {
        ...obj,
        user: user
          ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profilePicture: user.profilePicture,
              plan: user.plan,
              isSuspended: user.isSuspended,
            }
          : null,
        business: business
          ? {
              _id: business._id,
              name: business.name,
              location: business.location,
              pictures: business.pictures,
              rating: business.rating,
              approved: business.approved,
              enabled: business.enabled,
            }
          : null,
      };
    } catch (error) {
      this.logger.error('Error enriching review', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }

  private async enrichReviews(reviews: ReviewDocument[]): Promise<any[]> {
    try {
      return Promise.all(reviews.map((r) => this.enrichReview(r)));
    } catch (error) {
      this.logger.error('Error enriching reviews', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }
}
