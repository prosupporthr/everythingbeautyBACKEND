import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Staff, StaffDocument } from '@schemas/Staff.schema';
import { Model } from 'mongoose';
import { CreateStaffDto } from '@modules/staff/dto/Create-staff-dto';
import { Business, BusinessDocument } from '@schemas/Business.schema';
import { User, UserDocument } from '@schemas/User.schema';
import { ReturnType } from '@common/classes/ReturnType';

@Injectable()
export class StaffService {
  private logger = new Logger('StaffService');

  constructor(
    @InjectModel(Staff.name) private readonly staffModel: Model<StaffDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  public async CreateStaff(
    businessId: string,
    userId: string,
    staff: CreateStaffDto,
  ) {
    try {
      const business = await this.businessModel.findById(businessId);
      if (!business) {
        throw new NotFoundException(`Business with id not found`);
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      if (business?.userId.toString() !== userId) {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          `Business with id ${business.userId.toString()} not found`,
        );
      }

      // create the staff
      const newstaff = await this.staffModel.create({
        businessId: businessId,
        name: staff.name.toLowerCase(),
        image: staff.image as string,
      });

      await newstaff.save();

      return new ReturnType({
        data: newstaff,
        success: true,
        message: 'Staff created successfully',
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getBusinessStaff(businessId: string) {
    try {
      const business = await this.businessModel.findById(businessId);
      if (!business) {
        throw new NotFoundException(`Business with id not found`);
      }

      const allStaff = await this.staffModel.find({
        businessId: businessId,
        deletedAt: null,
      });

      const totalStaff = await this.staffModel.countDocuments({
        businessId: businessId,
        deletedAt: null,
      });

      return new ReturnType({
        success: true,
        data: {
          data: allStaff,
          total: totalStaff,
        },
        message: 'Staff found successfully',
      });
    } catch (error) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        message: 'Staff not found for this business',
        error: error,
      });
    }
  }

  public async getStaffById(id: string) {
    try {
      const staff = await this.staffModel.findById(id);
      if (!staff) {
        throw new NotFoundException(`Business with id ${id} not found`);
      }

      return new ReturnType({
        data: staff,
        success: true,
        message: 'Staff found successfully',
      })
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        message: 'Staff not found for this business',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: error,
      });
    }
  }
}
