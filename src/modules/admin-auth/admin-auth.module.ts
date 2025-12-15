import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Otp, OtpSchema } from '@/schemas/Otp.schema';
import { OtpService } from '@/common/services/otp/otp.service';
import { EmailService } from '@/common/services/email/email.service';
import { User, UserSchema } from '@/schemas/User.schema';

@Module({
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    JwtService,
    ConfigService,
    OtpService,
    EmailService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
export class AdminAuthModule {}
