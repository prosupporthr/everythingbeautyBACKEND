import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OTP_TYPE } from '@/schemas/Otp.schema';
import { EmailService } from '../email/email.service';
import { User } from '@schemas/User.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { Admin } from '@/schemas/Admin.schema';

@Injectable()
export class OtpService {
  private logger = new Logger(OtpService.name);
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private emailService: EmailService,
  ) {}

  private generateOtpCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }
    console.log('otp =>', otp);

    return otp;
  }

  async createOtp({
    userId,
    adminId,
    type,
  }: {
    userId?: string;
    adminId?: string;
    type: OTP_TYPE;
  }) {
    try {
      if (type === OTP_TYPE.USER) {
        if (!userId) throw new NotFoundException('User not found!');
        const user = await this.userModel.findById(userId);
        if (!user || user === undefined) {
          throw new NotFoundException('User not found!');
        }
        // generate OTP code
        const otp = this.generateOtpCode();
        // save the OTP
        const data = await this.otpModel.create({
          code: otp,
          userId,
          type,
        });
        await data.save();
        // send out emailService
        await this.emailService.sendConfirmationMail({
          code: otp,
          email: user?.email,
          name: user.firstName,
        });
      } else if (type === OTP_TYPE.ADMIN) {
        if (!adminId) throw new NotFoundException('Admin not found!');
        const admin = await this.adminModel.findById(adminId);
        if (!admin || admin === undefined) {
          throw new NotFoundException('Admin not found!');
        }
        const otp = this.generateOtpCode();
        const data = await this.otpModel.create({
          code: otp,
          adminId,
          type,
        });
        await data.save();
        await this.emailService.sendConfirmationMail({
          code: otp,
          email: admin.email,
          name: admin.fullname,
        });
      } else {
        throw new BadRequestException('Invalid OTP type');
      }

      this.logger.debug('OTP SENT OUT!!!');

      return new ReturnType({
        message: 'OTP SENT',
        success: true,
        data: null,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyOtp({ code }: { code: string }) {
    try {
      // Find the most recent OTP for this user
      const otp = await this.otpModel
        .findOne({
          code,
        })
        .sort({ createdAt: -1 });

      if (!otp || otp.expired) {
        throw new BadRequestException('Invalid OTP code');
      }

      // Check if OTP has expired (15 minutes)
      const otpCreatedTime = new Date(otp.createdAt).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = (currentTime - otpCreatedTime) / (1000 * 60); // Convert to minutes

      // if (timeDiff > 100 || otp.isExpired) {
      //     await this.otpModel.updateOne({
      //         _id: otp._id,
      //     }, {
      //         isExpired: true
      //     })
      //     throw new BadRequestException('OTP has expired');
      // }

      if (otp.expired) {
        await this.otpModel.updateOne(
          {
            _id: otp._id,
          },
          {
            isExpired: true,
          },
        );
        throw new BadRequestException('OTP has expired');
      }

      // If OTP is valid, mark it as used
      otp.expired = true;
      await otp.save();

      return new ReturnType({
        message: 'OTP verified successfully',
        success: true,
        data: {
          user: otp.type === OTP_TYPE.USER ? otp.userId : null,
          otp,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
