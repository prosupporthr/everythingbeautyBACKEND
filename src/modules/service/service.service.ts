import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(ServiceEntity.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async createService(dto: CreateServiceDto): Promise<ReturnType> {
    const created = await this.serviceModel.create({ ...dto });
    return new ReturnType({
      success: true,
      message: 'Service created',
      data: created,
    });
  }

  async getServiceById(id: string): Promise<ReturnType> {
    const service = await this.serviceModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!service) throw new NotFoundException('Service not found');
    return new ReturnType({
      success: true,
      message: 'Service fetched',
      data: service,
    });
  }

  async editService(id: string, dto: EditServiceDto): Promise<ReturnType> {
    const updated = await this.serviceModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...dto, updatedAt: new Date().toISOString() },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Service not found');
    return new ReturnType({
      success: true,
      message: 'Service updated',
      data: updated,
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

    return new PaginatedReturnType<ServiceDocument[]>({
      success: true,
      message: 'Business services fetched',
      data,
      page,
      total,
    });
  }
}
