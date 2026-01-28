/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AUTH_TYPE, User, UserDocument } from '@schemas/User.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { SignupEmailDto } from './dto/signup-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { OtpService } from '@/common/services/otp/otp.service';
import { OTP_TYPE } from '@schemas/Otp.schema';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';
import { Business } from '@/schemas/Business.schema';
import { LoginGoogleDto } from './dto/login-google.dto';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@/modules/business/dto/pagination-query.dto';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Business.name) private readonly businessModel: Model<Business>,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private uploadService: UploadService,
    private configService: ConfigService,
    private httpService: HttpService,
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
      this.logger.error(result);
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

      const token = await this.jwtService.signAsync(
        {
          id: String(user._id),
          email: user.email,
        },
        {
          expiresIn: '7d',
          secret: this.configService.get('JWT_SECRET'),
        },
      );

      return new ReturnType({
        success: true,
        message: 'OTP verified successfully',
        data: { user, token },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('An error occured while validating OTP');
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

  async resendOtp({ email }: ResendOtpDto): Promise<ReturnType> {
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
        message: 'OTP resent to email.',
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

  public async enrichUser(user: UserDocument) {
    const profilePicture = user.profilePicture
      ? await this.uploadService.getSignedUrl(user.profilePicture)
      : null;
    const business = await this.businessModel.findOne({
      isDeleted: false,
      userId: user._id,
    });
    return {
      ...user.toJSON(),
      id: user._id,
      profilePicture,
      business,
    };
  }

  async getAllUsers(
    { page = 1, limit = 10 }: PaginationQueryDto,
    search?: string,
  ): Promise<PaginatedReturnType> {
    try {
      const skip = (page - 1) * limit;

      const query: any = {};
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        this.userModel.find(query).skip(skip).limit(limit).exec(),
        this.userModel.countDocuments(query),
      ]);

      const enrichedUsers = await Promise.all(
        users.map((user) => this.enrichUser(user)),
      );

      return new PaginatedReturnType({
        success: true,
        message: 'Users fetched successfully',
        data: enrichedUsers,
        page,
        total,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async signInWithGoogle({ accessToken }: LoginGoogleDto): Promise<ReturnType> {
    try {
      if (!accessToken || typeof accessToken !== 'string') {
        throw new BadRequestException('Invalid Google access token');
      }

      const response = await firstValueFrom(
        this.httpService.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      const {
        email,
        given_name: givenName,
        family_name: familyName,
      } = response?.data || {};

      if (!email) {
        throw new BadRequestException('Google account email is missing');
      }

      const normalizedEmail = String(email).toLowerCase();
      let user = await this.userModel.findOne({
        email: normalizedEmail,
        authType: AUTH_TYPE.GOOGLE,
      });

      if (!user) {
        user = await this.userModel.create({
          firstName: givenName ?? '',
          lastName: familyName ?? '',
          email: normalizedEmail,
          emailVerified: true,
          profilePicture: '',
        });
      } else {
        const updated = await this.userModel.findByIdAndUpdate(
          user._id,
          {
            emailVerified: true,
            firstName: user.firstName || givenName || '',
            lastName: user.lastName || familyName || '',
          },
          { new: true },
        );
        if (!updated) throw new NotFoundException('User not found');
        user = updated;
      }

      const token = await this.jwtService.signAsync(
        {
          id: String(user._id),
          email: user.email,
        },
        {
          expiresIn: '7d',
          secret: this.configService.get('JWT_SECRET'),
        },
      );

      return new ReturnType({
        success: true,
        message: 'Google sign-in successful',
        data: { user, token },
      });
    } catch (error) {
      this.logger.error(error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException('What you were trying to do did not work');
    }
  }
}
