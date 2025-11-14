import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { Business, BusinessSchema } from '@schemas/Business.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';
import { Service, ServiceSchema } from '@/schemas/Service.Schema';
import { UserService } from '../user/user.service';
import { OtpService } from '@/common/services/otp/otp.service';
import { Otp, OtpSchema } from '@/schemas/Otp.schema';
import { UserModule } from '../user/user.module';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';
import { EmailService } from '@/common/services/email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
    UserModule,
  ],
  controllers: [BusinessController],
  providers: [
    BusinessService,
    JwtService,
    UploadService,
    UserService,
    OtpService,
    UserService,
    OtpService,
    EmailService,
    UploadService,
    ConfigService,
    UserService,
  ],
  exports: [BusinessService, MongooseModule],
})
export class BusinessModule {}
