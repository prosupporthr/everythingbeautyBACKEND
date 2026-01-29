import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { User, UserSchema } from '@/schemas/User.schema';
import { Wallet, WalletSchema } from '@/schemas/Wallet.schema';
import { Payment, PaymentSchema } from '@/schemas/Payment.schema';
import { Booking, BookingSchema } from '@/schemas/Booking.schema';
import { Order, OrderSchema } from '@/schemas/Order.schema';
import { Product, ProductSchema } from '@/schemas/Product.schema';
import { Business, BusinessSchema } from '@/schemas/Business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, ConfigService, JwtService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
