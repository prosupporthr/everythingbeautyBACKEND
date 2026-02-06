import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from '@schemas/Booking.schema';
import { User, UserSchema } from '@schemas/User.schema';
import { Service, ServiceSchema } from '@/schemas/Service.Schema';
import { UserService } from '../user/user.service';
import { ServiceService } from '../service/service.service';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { UserModule } from '../user/user.module';
import { ServiceModule } from '../service/service.module';
import { OtpService } from '@/common/services/otp/otp.service';
import { UploadService } from '../upload/upload.service';
import { BusinessModule } from '../business/business.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailService } from '@/common/services/email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
    UserModule,
    ServiceModule,
    BusinessModule,
  ],
  controllers: [BookingController],
  providers: [
    BookingService,
    JwtService,
    UserService,
    ServiceService,
    OtpService,
    UploadService,
    EmailService,
    UploadService,
    ConfigService,
  ],
})
export class BookingModule {}
