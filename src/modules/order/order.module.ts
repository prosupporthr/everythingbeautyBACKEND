import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from '@/schemas/Order.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { Product, ProductSchema } from '@/schemas/Product.schema';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
    UserModule,
    ProductModule,
    BusinessModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtService],
})
export class OrderModule {}
