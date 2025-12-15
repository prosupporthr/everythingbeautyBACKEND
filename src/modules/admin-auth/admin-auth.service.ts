/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Admin,
  AdminDocument,
  ADMIN_ROLE,
  ACCESS,
} from '@/schemas/Admin.schema';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAdminDto } from './dto/Create-admin-dto';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { OtpService } from '@/common/services/otp/otp.service';
import { OTP_TYPE } from '@/schemas/Otp.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { isValidObjectId, Types } from 'mongoose';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { SuspendAdminDto } from './dto/suspend-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { VerifyAdminOtpDto } from './dto/verify-admin-otp.dto';

@Injectable()
export class AdminAuthService {
  private logger = new Logger(AdminAuthService.name);

  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginAdmin({ email }: LoginAdminDto): Promise<ReturnType> {
    try {
      const normalizedEmail = email.toLowerCase();
      const admin = await this.adminModel.findOne({
        email: normalizedEmail,
        isDeleted: false,
      });
      if (!admin) throw new NotFoundException('Admin not found');
      if (admin.suspended)
        throw new BadRequestException('Admin account is suspended');
      if (admin.isDeleted) throw new BadRequestException('Admin account not');
      await this.otpService.createOtp({
        adminId: String(admin._id),
        type: OTP_TYPE.ADMIN,
      });
      return new ReturnType({
        success: true,
        message: 'Login initiated. OTP sent to email.',
        data: null,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyAdminOtp({ code }: VerifyAdminOtpDto): Promise<ReturnType> {
    try {
      const result = await this.otpService.verifyOtp({ code });
      const otpRecord = result?.data?.otp;
      const adminId: string | null = otpRecord?.adminId ?? null;
      if (!adminId)
        throw new BadRequestException('Invalid OTP or admin not found');
      const admin = await this.adminModel.findById(adminId);
      if (!admin) throw new NotFoundException('Admin not found');
      const token = await this.jwtService.signAsync(
        {
          id: String(admin._id),
          email: admin.email,
          role: admin.role,
        },
        {
          expiresIn: '7d',
          secret: this.configService.get('JWT_SECRET'),
        },
      );
      return new ReturnType({
        success: true,
        message: 'OTP verified successfully',
        data: { admin, token },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('An error occured while validating OTP');
    }
  }

  async createAdmin(dto: CreateAdminDto): Promise<ReturnType> {
    try {
      const normalizedEmail = dto.email.toLowerCase();
      const exists = await this.adminModel.findOne({
        email: normalizedEmail,
        isDeleted: false,
      });
      if (exists)
        return new ReturnType({
          success: true,
          message: 'Admin already exists',
          data: exists,
        });
      const admin = await this.adminModel.create({
        fullname: dto.fullName,
        email: normalizedEmail,
        role: ADMIN_ROLE.ADMIN,
        access: [ACCESS.DASHBOARD],
      });
      return new ReturnType({
        success: true,
        message: 'Admin created successfully',
        data: admin,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllAdmins({
    page = 1,
    limit = 10,
  }: PaginationQueryDto): Promise<PaginatedReturnType<AdminDocument[]>> {
    try {
      const skip = (page - 1) * limit;
      const [admins, total] = await Promise.all([
        this.adminModel
          .find({ isDeleted: false })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.adminModel.countDocuments({ isDeleted: false }),
      ]);
      return new PaginatedReturnType({
        success: true,
        message: 'Admins fetched successfully',
        data: admins,
        page,
        total,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAdminById(id: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(id))
        throw new BadRequestException('Invalid adminId');
      const admin = await this.adminModel.findOne({
        _id: new Types.ObjectId(id),
        isDeleted: false,
      });
      if (!admin) throw new NotFoundException('Admin not found');
      return new ReturnType({
        success: true,
        message: 'Admin fetched successfully',
        data: admin,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(error);
    }
  }

  async updateAdmin(id: string, dto: UpdateAdminDto): Promise<ReturnType> {
    try {
      if (!isValidObjectId(id))
        throw new BadRequestException('Invalid adminId');
      const update: any = { ...dto };
      if (update.fullName) {
        update.fullname = update.fullName;
        delete update.fullName;
      }
      const admin = await this.adminModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        { ...update, updatedAt: new Date().toISOString() },
        { new: true },
      );
      if (!admin) throw new NotFoundException('Admin not found');
      return new ReturnType({
        success: true,
        message: 'Admin updated successfully',
        data: admin,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(error);
    }
  }

  async softDeleteAdmin(id: string): Promise<ReturnType> {
    try {
      if (!isValidObjectId(id))
        throw new BadRequestException('Invalid adminId');
      const updated = await this.adminModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { new: true },
      );
      if (!updated) throw new NotFoundException('Admin not found');
      return new ReturnType({
        success: true,
        message: 'Admin deleted successfully',
        data: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(error);
    }
  }

  async suspendAdmin(id: string, dto: SuspendAdminDto): Promise<ReturnType> {
    try {
      if (!isValidObjectId(id))
        throw new BadRequestException('Invalid adminId');
      const admin = await this.adminModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id), isDeleted: false },
        { suspended: dto.suspended, updatedAt: new Date().toISOString() },
        { new: true },
      );
      if (!admin) throw new NotFoundException('Admin not found');
      return new ReturnType({
        success: true,
        message: dto.suspended ? 'Admin suspended' : 'Admin unsuspended',
        data: admin,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(error);
    }
  }
}
