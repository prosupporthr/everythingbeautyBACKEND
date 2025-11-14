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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
    BusinessModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, JwtService, UploadService, BusinessService],
  exports: [ProductService],
})
export class ProductModule {}
