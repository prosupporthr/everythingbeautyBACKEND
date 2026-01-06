import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Service as ServiceEntity,
  ServiceDocument,
} from '@schemas/Service.Schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { EditServiceDto } from './dto/edit-service.dto';
import { User, UserDocument } from '@/schemas/User.schema';
import { Business } from '@/schemas/Business.schema';
import { UploadService } from '../upload/upload.service';
import { BusinessService } from '../business/business.service';
import {
  Bookmark,
  BookmarkDocument,
  BOOKMARK_TYPE,
} from '@/schemas/Bookmark.schema';

@Injectable()
export class ServiceService {
  private logger = new Logger(ServiceService.name);
  constructor(
    @InjectModel(ServiceEntity.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Business.name) private readonly businessModel: Model<Business>,
    @InjectModel(Bookmark.name)
    private readonly bookmarkModel: Model<BookmarkDocument>,
    private uploadService: UploadService,
    private businessService: BusinessService,
  ) {}

  async createService(dto: CreateServiceDto): Promise<ReturnType> {
    const created = await this.serviceModel.create({ ...dto });
    const enriched = await this.enrichService(created);
    return new ReturnType({
      success: true,
      message: 'Service created',
      data: enriched,
    });
  }

  async getServiceById(id: string, user?: UserDocument): Promise<ReturnType> {
    const service = await this.serviceModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!service) throw new NotFoundException('Service not found');
    const enriched = await this.enrichService(service, user);
    return new ReturnType({
      success: true,
      message: 'Service fetched',
      data: enriched,
    });
  }

  async editService(id: string, dto: EditServiceDto): Promise<ReturnType> {
    const updated = await this.serviceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...dto, updatedAt: new Date().toISOString() },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Service not found');
    const enriched = await this.enrichService(updated);
    return new ReturnType({
      success: true,
      message: 'Service updated',
      data: enriched,
    });
  }

  async softDeleteService(id: string): Promise<ReturnType> {
    const deleted = await this.serviceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { new: true },
    );
    if (!deleted) throw new NotFoundException('Service not found');
    return new ReturnType({
      success: true,
      message: 'Service deleted',
      data: deleted,
    });
  }

  async getBusinessServices(
    businessId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
    user?: UserDocument,
  ): Promise<PaginatedReturnType<ServiceDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.serviceModel
        .find({ businessId, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.serviceModel.countDocuments({
        businessId,
        isDeleted: false,
        enabled: true,
      }),
    ]);

    const enrichedServices = await Promise.all(
      data.map((o) => this.enrichService(o, user)),
    );

    return new PaginatedReturnType<ServiceDocument[]>({
      success: true,
      message: 'Business services fetched',
      data: enrichedServices,
      page,
      total,
    });
  }

  async getAllServices(
    { page = 1, limit = 10 }: PaginationQueryDto,
    user?: UserDocument,
  ): Promise<PaginatedReturnType<ServiceDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.serviceModel
        .find({ isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.serviceModel.countDocuments({
        isDeleted: false,
        enabled: true,
      }),
    ]);

    const enrichedServices = await Promise.all(
      data.map((o) => this.enrichService(o, user)),
    );

    return new PaginatedReturnType<ServiceDocument[]>({
      success: true,
      message: 'All services fetched',
      data: enrichedServices,
      page,
      total,
    });
  }

  public async enrichService(service: ServiceDocument, user?: UserDocument) {
    try {
      const business = await this.businessModel.findById(service.businessId);
      const productImages = await this.uploadService.getSignedUrl(
        service.pictures,
      );
      const businessData = await this.businessService.enrichedBusiness(
        business as any,
      );
      let hasBookmarked = false;
      if (user) {
        const bookmark = await this.bookmarkModel.findOne({
          userId: user._id,
          serviceId: service._id,
          type: BOOKMARK_TYPE.SERVICE,
          isDeleted: false,
        });
        if (bookmark) hasBookmarked = true;
      }

      return {
        ...service.toObject(),
        business: businessData,
        pictures: productImages,
        hasBookmarked,
      };
    } catch (error) {
      this.logger.error('Error enriching service business name', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }
}
