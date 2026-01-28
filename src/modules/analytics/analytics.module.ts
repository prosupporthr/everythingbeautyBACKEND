import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { User, UserSchema } from '@/schemas/User.schema';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { Product, ProductSchema } from '@/schemas/Product.schema';
import { Service, ServiceSchema } from '@/schemas/Service.Schema';
import { Order, OrderSchema } from '@/schemas/Order.schema';
import { Booking, BookingSchema } from '@/schemas/Booking.schema';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, UploadService],
})
export class AnalyticsModule {}
