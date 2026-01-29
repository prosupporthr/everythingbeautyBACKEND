import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { ReturnType } from '@/common/classes/ReturnType';
import { User, UserDocument } from '@/schemas/User.schema';
import { Wallet, WalletDocument } from '@/schemas/Wallet.schema';
import {
  Payment,
  PaymentDocument,
  PAYMENT_TYPE,
  PAYMENT_SOURCE,
  PAYMENT_STATUS,
} from '@/schemas/Payment.schema';
import {
  Booking,
  BookingDocument,
  STATUS as BOOKING_STATUS,
  PAYMENT_STATUS as BOOKING_PAYMENT_STATUS,
} from '@/schemas/Booking.schema';
import {
  Order,
  OrderDocument,
  ORDER_STATUS,
  PAYMENT_STATUS as ORDER_PAYMENT_STATUS,
} from '@/schemas/Order.schema';
import { Product, ProductDocument } from '@/schemas/Product.schema';
import { Business, BusinessDocument } from '@/schemas/Business.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  private stripe: Stripe;
  private logger = new Logger(TransactionsService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not defined');
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover', // Using latest API version
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {},
  ): Promise<ReturnType> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Amount in cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return new ReturnType({
        success: true,
        message: 'Payment intent created successfully',
        data: {
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id,
        },
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to create payment intent',
        data: null,
      });
    }
  }

  async createStripeCustomer(userId: string): Promise<ReturnType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((user as any).stripeCustomerId) {
        return new ReturnType({
          success: true,
          message: 'Stripe customer already exists',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          data: { stripeCustomerId: (user as any).stripeCustomerId },
        });
      }

      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: String(user._id),
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (user as any).stripeCustomerId = customer.id;
      await user.save();

      return new ReturnType({
        success: true,
        message: 'Stripe customer created successfully',
        data: { stripeCustomerId: customer.id },
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to create stripe customer',
        data: null,
      });
    }
  }

  async createConnectedAccount(userId: string): Promise<ReturnType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((user as any).stripeConnectId) {
        return new ReturnType({
          success: true,
          message: 'Stripe connected account already exists',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          data: { stripeConnectId: (user as any).stripeConnectId },
        });
      }

      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US', // You might want to make this dynamic based on user's country
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: String(user._id),
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (user as any).stripeConnectId = account.id;
      await user.save();

      return new ReturnType({
        success: true,
        message: 'Stripe connected account created',
        data: { stripeConnectId: account.id },
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to create connected account',
        data: null,
      });
    }
  }

  async createAccountLink(
    userId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<ReturnType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!(user as any).stripeConnectId) {
        // If they don't have an account yet, create one
        const accountResult = await this.createConnectedAccount(userId);
        if (!accountResult.success) {
          throw new Error(accountResult.message);
        }
      }

      const accountLink = await this.stripe.accountLinks.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        account: (user as any).stripeConnectId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return new ReturnType({
        success: true,
        message: 'Account link created',
        data: { url: accountLink.url },
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to create account link',
        data: null,
      });
    }
  }

  async checkAccountStatus(userId: string): Promise<ReturnType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!(user as any).stripeConnectId) {
        return new ReturnType({
          success: false,
          message: 'User does not have a connected account',
          data: { isConnected: false },
        });
      }

      const account = await this.stripe.accounts.retrieve(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        (user as any).stripeConnectId,
      );

      return new ReturnType({
        success: true,
        message: 'Account status retrieved',
        data: {
          isConnected: true,
          detailsSubmitted: account.details_submitted,
          payoutsEnabled: account.payouts_enabled,
          chargesEnabled: account.charges_enabled,
          requirements: account.requirements,
        },
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to check account status',
        data: null,
      });
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<ReturnType> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      let status = 'pending';
      if (paymentIntent.status === 'succeeded') {
        status = 'success';
      } else if (paymentIntent.status === 'canceled') {
        status = 'failed';
      }

      return new ReturnType({
        success: true,
        message: 'Payment status retrieved',
        data: {
          status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata,
          stripeStatus: paymentIntent.status,
        },
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to verify payment',
        data: null,
      });
    }
  }

  async getWallet(userId: string): Promise<ReturnType> {
    try {
      const wallet = await this.walletModel.findOne({ userId });
      if (!wallet) throw new NotFoundException('Wallet not found');

      return new ReturnType({
        success: true,
        message: 'Wallet retrieved',
        data: wallet,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to get wallet',
        data: null,
      });
    }
  }

  async initiatePayment(dto: CreateTransactionDto): Promise<ReturnType> {
    try {
      const { userId, amount, source, type, typeId, flow, currency } = dto;

      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // 1. Handle Stripe Payment
      if (source === PAYMENT_SOURCE.STRIPE) {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: currency || 'usd',
          metadata: {
            userId,
            type,
            typeId,
            flow,
          },
          automatic_payment_methods: { enabled: true },
        });

        const payment = await this.paymentModel.create({
          userId,
          amount,
          source,
          type,
          flow,
          typeId,
          stripeIntentId: paymentIntent.id,
          status: PAYMENT_STATUS.PENDING,
        });

        return new ReturnType({
          success: true,
          message: 'Payment initiated',
          data: {
            paymentId: payment._id,
            clientSecret: paymentIntent.client_secret,
            intentId: paymentIntent.id,
          },
        });
      }

      // 2. Handle Wallet Payment
      if (source === PAYMENT_SOURCE.WALLET) {
        const wallet = await this.walletModel.findOne({ userId });
        if (!wallet) throw new NotFoundException('Wallet not found');

        if (wallet.balance < amount) {
          throw new BadRequestException('Insufficient wallet balance');
        }

        wallet.balance -= amount;
        await wallet.save();

        const payment = await this.paymentModel.create({
          userId,
          amount,
          source,
          type,
          flow,
          typeId,
          status: PAYMENT_STATUS.SUCCESS,
        });

        await this.processSuccessfulPayment(payment);

        return new ReturnType({
          success: true,
          message: 'Payment successful',
          data: {
            paymentId: payment._id,
            status: PAYMENT_STATUS.SUCCESS,
          },
        });
      }

      throw new BadRequestException('Invalid payment source');
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to initiate payment',
        data: null,
      });
    }
  }

  async verifyTransaction(paymentId: string): Promise<ReturnType> {
    try {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment) throw new NotFoundException('Payment not found');

      if (payment.status === PAYMENT_STATUS.SUCCESS) {
        return new ReturnType({
          success: true,
          message: 'Payment already verified',
          data: payment,
        });
      }

      if (payment.source === PAYMENT_SOURCE.STRIPE && payment.stripeIntentId) {
        const intent = await this.stripe.paymentIntents.retrieve(
          payment.stripeIntentId,
        );

        if (intent.status === 'succeeded') {
          payment.status = PAYMENT_STATUS.SUCCESS;
          await payment.save();
          await this.processSuccessfulPayment(payment);
        } else if (intent.status === 'canceled') {
          payment.status = PAYMENT_STATUS.FAILED;
          await payment.save();
        }
      }

      return new ReturnType({
        success: true,
        message: 'Transaction verification status',
        data: payment,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to verify transaction',
        data: null,
      });
    }
  }

  private async processSuccessfulPayment(payment: PaymentDocument) {
    switch (payment.type) {
      case PAYMENT_TYPE.WALLET_TOP_UP:
        await this.walletModel.findOneAndUpdate(
          { userId: payment.userId },
          { $inc: { balance: payment.amount } },
          { upsert: true },
        );
        break;

      case PAYMENT_TYPE.BOOKING:
        {
          const booking = await this.bookingModel.findById(payment.typeId);
          if (booking) {
            booking.paymentStatus = BOOKING_PAYMENT_STATUS.PAID;
            booking.status = BOOKING_STATUS.APPROVED;
            await booking.save();
            const business = await this.businessModel.findById(
              booking.businessId,
            );
            if (business) {
              await this.walletModel.findOneAndUpdate(
                { userId: business.userId },
                { $inc: { balance: payment.amount } },
                { upsert: true },
              );
            }
          }
        }
        break;

      case PAYMENT_TYPE.PRODUCT: {
        const order = await this.orderModel.findById(payment.typeId);
        if (order) {
          order.paymentStatus = ORDER_PAYMENT_STATUS.PAID;
          order.status = ORDER_STATUS.COMPLETED;
          await order.save();

          await this.productModel.findByIdAndUpdate(order.productId, {
            $inc: { quantity: -order.quantity },
          });
          const business = await this.businessModel.findById(order.businessId);
          if (business) {
            await this.walletModel.findOneAndUpdate(
              { userId: business.userId },
              { $inc: { balance: payment.amount } },
              { upsert: true },
            );
          }
        }
        break;
      }

      case PAYMENT_TYPE.MONTHLY_SUBSCRIPTION: {
        const user = await this.userModel.findById(payment.userId);
        if (user) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 30);
          user.nextPaymentDate = nextDate;
          await user.save();
        }
        break;
      }

      case PAYMENT_TYPE.WITHDRAWAL:
        break;
    }
  }
}
