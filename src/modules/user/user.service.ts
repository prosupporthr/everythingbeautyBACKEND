import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@schemas/User.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { SignupEmailDto } from './dto/signup-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { OtpService } from '@/common/services/otp/otp.service';
import { OTP_TYPE } from '@schemas/Otp.schema';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private uploadService: UploadService,
  ) {}

  async signUpWithEmail({ email }: SignupEmailDto): Promise<ReturnType> {
    try {
      const normalizedEmail = email.toLowerCase();
      let user = await this.userModel.findOne({ email: normalizedEmail });

      if (!user) {
        user = await this.userModel.create({
          firstName: '',
          lastName: '',
          email: normalizedEmail,
          emailVerified: false,
        });
        await user.save();
      }

      await this.otpService.createOtp({
        userId: String(user._id),
        type: OTP_TYPE.USER,
      });

      return new ReturnType({
        success: true,
        message: 'Signup initiated. OTP sent to email.',
        data: null,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyOtp({ code }: VerifyOtpDto): Promise<ReturnType> {
    try {
      const result = await this.otpService.verifyOtp({ code });
      const userId = result?.data?.user;
      if (!userId) {
        throw new BadRequestException('Invalid OTP or user not found');
      }

      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { emailVerified: true },
        { new: true },
      );
      if (!user) throw new NotFoundException('User not found');

      const token = await this.jwtService.signAsync({
        id: String(user._id),
        email: user.email,
      });

      return new ReturnType({
        success: true,
        message: 'OTP verified successfully',
        data: { user, token },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async editUser(id: string, dto: EditUserDto): Promise<ReturnType> {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
      if (!user) throw new NotFoundException('User not found');

      return new ReturnType({
        success: true,
        message: 'User details updated',
        data: user,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async loginWithEmail({ email }: LoginEmailDto): Promise<ReturnType> {
    try {
      const normalizedEmail = email.toLowerCase();
      const user = await this.userModel.findOne({ email: normalizedEmail });
      if (!user) throw new NotFoundException('User not found');

      await this.otpService.createOtp({
        userId: String(user._id),
        type: OTP_TYPE.USER,
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

  async getUserById(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) throw new NotFoundException('User not found');
      const data = await this.enrichUser(user);
      return new ReturnType({
        message: 'User details fetched successfully',
        data,
        success: true,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  private async enrichUser(user: UserDocument) {
    const profilePicture = user.profilePicture
      ? await this.uploadService.getSignedUrl(user.profilePicture)
      : null;
    return {
      ...user.toJSON(),
      id: user._id,
      profilePicture,
    };
  }
}
