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
import { ReturnType } from '@common/classes/ReturnType';
import { UpdateStaffDto } from './dto/Update-staff-dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class StaffService {
  private logger = new Logger('StaffService');

  constructor(
    @InjectModel(Staff.name) private readonly staffModel: Model<StaffDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    private readonly uploadService: UploadService,
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
        email: staff.email.toLowerCase(),
        address: staff.address,
        porfolioLink: staff.porfolioLink,
        primarySpeciality: staff.primarySpeciality,
        yearsOfExperience: staff.yearsOfExperience,
        skills: staff.skills as string[],
      });

      await newstaff.save();

      return new ReturnType({
        data: await this.enrichStaff(newstaff),
        success: true,
        message: 'Staff created successfully',
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateStaff(id: string, payload: UpdateStaffDto) {
    try {
      const staff = await this.staffModel.findById(id);
      if (!staff) {
        throw new NotFoundException(`Staff with id not found`);
      }

     if (payload.name) {
      staff.name = payload.name.toLowerCase();
     }
     if (payload.email) {
      staff.email = payload.email.toLowerCase();
     }
     if (payload.address) {
      staff.address = payload.address.toLowerCase();
     }
     if (payload.porfolioLink) {
      staff.porfolioLink = payload.porfolioLink.toLowerCase();
     }
     if (payload.primarySpeciality) {
      staff.primarySpeciality = payload.primarySpeciality.toLowerCase();
     }
     if (payload.yearsOfExperience) {
      staff.yearsOfExperience = payload.yearsOfExperience;
     }
     if (payload.skills) {
      staff.skills = payload.skills as string[];
     }
     if (payload.image) {
      staff.image = payload.image as string;
     }


      await staff.save();

      return new ReturnType({
        data: await this.enrichStaff(staff),
        success: true,
        message: 'Staff updated successfully',
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async softDeleteStaff(id: string, userId: string) {
    try {
      const staff = await this.staffModel.findById(id);
      if (!staff) {
        throw new NotFoundException(`Staff with id not found`);
      }

      const business = await this.businessModel.findOne({
        userId: userId,
      })
      if (!business) {
        throw new NotFoundException(`Business with id not found`);
      }



      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      if (staff?.businessId.toString() !== business?._id.toString()) {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          `You can not perform this action`,
        );
      }



      staff.deletedAt = new Date().toISOString();
      staff.isDeleted = true;
      await staff.save();

      return new ReturnType({
        success: true,
        message: 'Staff Deleted',
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

  public async getBusinessStaff(businessId: string) {
    try {
      const staff = await this.staffModel.find({
        businessId,
        isDeleted: false,
      });

      return new ReturnType({
        data: await this.enrichStaff(staff),
        success: true,
        message: 'Business staff fetched',
      });
    } catch (error: any) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getStaffById(id: string) {
    try {
      const staff = await this.staffModel.findOne({
        _id: id,
        isDeleted: false,
      });
      if (!staff) {
        throw new NotFoundException(`Business with id ${id} not found`);
      }

      return new ReturnType({
        data: await this.enrichStaff(staff),
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

  private async enrichStaff(staff: StaffDocument | StaffDocument[] | any) {
    const items = Array.isArray(staff) ? staff : [staff];
    const enriched = await Promise.all(
      items.map(async (s) => {
        const obj = typeof s?.toObject === 'function' ? s.toObject() : s;
        const image = obj?.image
          ? ((await this.uploadService.getSignedUrl(obj.image)) as string)
          : obj?.image ?? null;
        return { ...obj, image };
      }),
    );

    return Array.isArray(staff) ? enriched : enriched[0];
  }
}
