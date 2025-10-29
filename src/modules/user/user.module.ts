import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '@/schemas/User.schema';
import { Otp, OtpSchema } from '@/schemas/Otp.schema';
import { Admin, AdminSchema } from '@schemas/Admin.schema';
import { OtpService } from '@/common/services/otp/otp.service';
import { EmailService } from '@/common/services/email/email.service';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, OtpService, EmailService, JwtService, UploadService],
})
export class UserModule {}
