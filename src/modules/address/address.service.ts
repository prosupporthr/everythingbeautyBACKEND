import { Address, AddressDocument } from '@/schemas/Address.schema';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReturnType } from '@common/classes/ReturnType';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';

@Injectable()
export class AddressService {
  private logger = new Logger(AddressService.name);

  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async createAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<ReturnType> {
    try {
      if (dto.isPrimary) {
        // Unset other primary addresses for this user
        await this.addressModel.updateMany(
          { userId, isPrimary: true },
          { $set: { isPrimary: false } },
        );
      }

      const address = await this.addressModel.create({ ...dto, userId });
      return new ReturnType({
        success: true,
        message: 'Address created successfully',
        data: address,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to create address');
    }
  }

  async getAllUserAddresses(
    userId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<AddressDocument[]>> {
    try {
      const skip = (page - 1) * limit;
      const [addresses, total] = await Promise.all([
        this.addressModel
          .find({
            userId,
            isDeleted: false,
          })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.addressModel.countDocuments({
          userId,
          isDeleted: false,
        }),
      ]);

      return new PaginatedReturnType({
        success: true,
        message: 'Addresses fetched successfully',
        data: addresses,
        page,
        total,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to fetch addresses');
    }
  }

  async getAddressById(id: string): Promise<ReturnType> {
    try {
      const address = await this.addressModel.findOne({
        _id: id,
        isDeleted: false,
      });
      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return new ReturnType({
        success: true,
        message: 'Address fetched successfully',
        data: address,
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch address');
    }
  }

  async markAsPrimary(userId: string, addressId: string): Promise<ReturnType> {
    try {
      const address = await this.addressModel.findOne({
        _id: addressId,
        userId,
        isDeleted: false,
      });
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // Unset other primary addresses
      await this.addressModel.updateMany(
        { userId, isPrimary: true },
        { $set: { isPrimary: false } },
      );

      address.isPrimary = true;
      await address.save();

      return new ReturnType({
        success: true,
        message: 'Address marked as primary successfully',
        data: address,
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to mark address as primary');
    }
  }

  async editAddress(
    id: string,
    dto: UpdateAddressDto,
    userId: string,
  ): Promise<ReturnType> {
    try {
      const address = await this.addressModel.findOne({
        _id: id,
        userId,
        isDeleted: false,
      });
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      if (dto.isPrimary) {
        await this.addressModel.updateMany(
          { userId, isPrimary: true },
          { $set: { isPrimary: false } },
        );
      }

      Object.assign(address, dto);
      await address.save();

      return new ReturnType({
        success: true,
        message: 'Address updated successfully',
        data: address,
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update address');
    }
  }

  async softDeleteAddress(id: string, userId: string): Promise<ReturnType> {
    try {
      const address = await this.addressModel.findOne({
        _id: id,
        userId,
        isDeleted: false,
      });
      if (!address) {
        throw new NotFoundException('Address not found');
      }

      address.isDeleted = true;
      address.deletedAt = new Date().toISOString();
      await address.save();

      return new ReturnType({
        success: true,
        message: 'Address deleted successfully',
        data: null,
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete address');
    }
  }
}
