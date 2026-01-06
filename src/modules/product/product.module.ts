import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from '@schemas/Product.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { BusinessService } from '../business/business.service';
import { BusinessModule } from '../business/business.module';
import { EmailService } from '@/common/services/email/email.service';
import { OtpService } from '@/common/services/otp/otp.service';
import { ConfigService } from 'aws-sdk';
import { UserService } from '../user/user.service';
import { Bookmark, BookmarkSchema } from '@/schemas/Bookmark.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
    BusinessModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    JwtService,
    UploadService,
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
  exports: [ProductService],
})
export class ProductModule {}
