import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business, BusinessDocument } from '@schemas/Business.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { CreateBusinessDto } from './dto/create-business.dto';
import { EditBusinessDto } from './dto/edit-business.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { BusinessFilterQueryDto } from './dto/business-filter-query.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
  ) {}

  async createBusiness(dto: CreateBusinessDto): Promise<ReturnType> {
    const business = await this.businessModel.findOne({
      isDeleted: false,
      userId: dto.userId,
    });
    if (business) {
      throw new NotFoundException('You already have a business');
    }
    const created = await this.businessModel.create({ ...dto });
    return new ReturnType({
      success: true,
      message: 'Business created successfully',
      data: created,
    });
  }

  async editBusiness(id: string, dto: EditBusinessDto): Promise<ReturnType> {
    const updated = await this.businessModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...dto, updatedAt: new Date().toISOString() },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Business not found');
    }

    return new ReturnType({
      success: true,
      message: 'Business updated successfully',
      data: updated,
    });
  }

  async softDeleteBusiness(id: string): Promise<ReturnType> {
    const deleted = await this.businessModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        enabled: false,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { new: true },
    );

    if (!deleted) {
      throw new NotFoundException('Business not found');
    }

    return new ReturnType({
      success: true,
      message: 'Business soft-deleted successfully',
      data: deleted,
    });
  }

  async getBusinessById(id: string): Promise<ReturnType> {
    const business = await this.businessModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return new ReturnType({
      success: true,
      message: 'Business fetched',
      data: business,
    });
  }

  async getUserBusinesses(
    userId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<Business[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.businessModel
        .find({ userId, enabled: true, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.businessModel.countDocuments({
        userId,
        enabled: true,
        isDeleted: false,
      }),
    ]);

    return new PaginatedReturnType<BusinessDocument[]>({
      success: true,
      message: 'User businesses fetched',
      data,
      page,
      total,
    });
  }

  async getAllBusinesses({
    page = 1,
    limit = 10,
  }: PaginationQueryDto): Promise<PaginatedReturnType<BusinessDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.businessModel
        .find({ enabled: true, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.businessModel.countDocuments({ enabled: true, isDeleted: false }),
    ]);

    return new PaginatedReturnType<BusinessDocument[]>({
      success: true,
      message: 'Businesses fetched',
      data,
      page,
      total,
    });
  }

  async getFilteredBusinesses({
    page = 1,
    limit = 10,
    q,
    chargeTiming,
    approved,
    enabled = true,
    minRating,
    maxRating,
    day,
    userId,
  }: BusinessFilterQueryDto): Promise<PaginatedReturnType<BusinessDocument[]>> {
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = { isDeleted: false };

    // Default enabled true unless explicitly provided
    if (enabled !== undefined) filter.enabled = enabled;
    if (approved !== undefined) filter.approved = approved;
    if (chargeTiming) filter.chargeTiming = chargeTiming;
    if (userId) filter.userId = userId;
    if (typeof day === 'number') filter.days = { $in: [day] };
    if (minRating !== undefined || maxRating !== undefined) {
      filter.rating = {};
      if (minRating !== undefined) filter.rating.$gte = minRating;
      if (maxRating !== undefined) filter.rating.$lte = maxRating;
    }

    // Text search across name and location
    const textFilter = q ? { $text: { $search: q } } : {};
    const finalFilter = { ...filter, ...textFilter };

    const [data, total] = await Promise.all([
      this.businessModel
        .find(finalFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.businessModel.countDocuments(finalFilter),
    ]);

    return new PaginatedReturnType<BusinessDocument[]>({
      success: true,
      message: 'Filtered businesses fetched',
      data,
      page,
      total,
    });
  }
}
