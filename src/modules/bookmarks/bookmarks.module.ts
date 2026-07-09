import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Bookmark, BookmarkSchema } from '@/schemas/Bookmark.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';
import { Product, ProductSchema } from '@/schemas/Product.schema';
import { Service, ServiceSchema } from '@/schemas/Service.Schema';
import { ProductService } from '../product/product.service';
import { ServiceService } from '../service/service.service';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { BusinessService } from '../business/business.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserService } from '../user/user.service';
import { Notification, NotificationSchema } from '@/schemas/Notification.schema';
import { OtpService } from '@/common/services/otp/otp.service';
import { Otp, OtpSchema } from '@/schemas/Otp.schema';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';
import { EmailService } from '@/common/services/email/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Admin.name, schema: AdminSchema }
    ]),
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService, JwtService, UploadService, ProductService, BusinessService, NotificationsService, ServiceService, UserService, OtpService, EmailService],
})
export class BookmarksModule {}
