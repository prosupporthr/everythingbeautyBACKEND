import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TransactionsController } from './transactions.controller';
import { TransactionsWebhookController } from './transactions.webhook.controller';
import { TransactionsService } from './transactions.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailService } from '@/common/services/email/email.service';
import { User, UserSchema } from '@/schemas/User.schema';
import { Wallet, WalletSchema } from '@/schemas/Wallet.schema';
import { Payment, PaymentSchema } from '@/schemas/Payment.schema';
import { Booking, BookingSchema } from '@/schemas/Booking.schema';
import { Order, OrderSchema } from '@/schemas/Order.schema';
import { Product, ProductSchema } from '@/schemas/Product.schema';
import { Business, BusinessSchema } from '@/schemas/Business.schema';
import { Escrow, EscrowSchema } from '@/schemas/Escrow.schema';

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
      { name: Escrow.name, schema: EscrowSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [TransactionsController, TransactionsWebhookController],
  providers: [TransactionsService, ConfigService, JwtService, EmailService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
