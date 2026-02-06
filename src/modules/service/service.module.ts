import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  Service as ServiceEntity,
  ServiceSchema,
} from '@schemas/Service.Schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import { Business } from '@/schemas/Business.schema';
import { BusinessSchema } from '@/schemas/Business.schema';
import { UploadService } from '../upload/upload.service';
import { BusinessModule } from '../business/business.module';
import { UserService } from '../user/user.service';
import { OtpService } from '@/common/services/otp/otp.service';
import { EmailService } from '@/common/services/email/email.service';
import { ConfigService } from '@nestjs/config';
import { BookmarkSchema, Bookmark } from '@/schemas/Bookmark.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceEntity.name, schema: ServiceSchema },
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
    NotificationsModule,
    BusinessModule,
  ],
  controllers: [ServiceController],
  providers: [
    ServiceService,
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
  exports: [ServiceService, MongooseModule],
})
export class ServiceModule {}
