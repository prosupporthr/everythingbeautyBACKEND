/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { PAYMENT_PLAN, User, UserDocument } from '@/schemas/User.schema';
import { Wallet, WalletDocument } from '@/schemas/Wallet.schema';
import {
  Payment,
  PaymentDocument,
  PAYMENT_TYPE,
  PAYMENT_SOURCE,
  PAYMENT_STATUS,
  PAYMENT_FLOW,
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

import { GetTransactionsDto } from './dto/get-transactions.dto';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { StartSubscriptionDto } from './dto/start-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';

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

  async startSubscription(dto: StartSubscriptionDto): Promise<ReturnType> {
    try {
      const { userId, priceId, successUrl, cancelUrl } = dto;
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const res = await this.createStripeCustomer(userId);
        if (!res.success || !res.data?.stripeCustomerId)
          throw new BadRequestException('Failed to create customer');
        customerId = res.data.stripeCustomerId as string;
      }
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl,
      });
      return new ReturnType({
        success: true,
        message: 'Checkout session created',
        data: { url: session.url, id: session.id },
      });
    } catch (error: any) {
      this.logger.error(error);
      throw new BadRequestException(
        error?.message || 'Failed to start subscription',
      );
    }
  }

  async cancelSubscription(dto: CancelSubscriptionDto): Promise<ReturnType> {
    try {
      const { userId } = dto;
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      const customerId = user.stripeCustomerId;
      if (!customerId) throw new BadRequestException('No customer on file');
      const subs = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      if (!subs.data.length)
        throw new NotFoundException('No active subscription found');
      const subscription = subs.data[0];
      const updated = await this.stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      return new ReturnType({
        success: true,
        message: 'Subscription cancellation scheduled',
        data: {
          id: updated.id,
          cancelAtPeriodEnd: updated.cancel_at_period_end,
        },
      });
    } catch (error: any) {
      this.logger.error(error);
      throw new BadRequestException(
        error?.message || 'Failed to cancel subscription',
      );
    }
  }

  async handleStripeWebhook(req: any, body: any, signature: string) {
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      return { received: true };
    }
    let event: Stripe.Event;
    try {
      const rawBody = req?.rawBody ?? JSON.stringify(body);
      event = this.stripe.webhooks.constructEvent(
        typeof rawBody === 'string' ? rawBody : rawBody.toString(),
        signature,
        secret,
      );
    } catch (err: any) {
      throw new BadRequestException('Invalid signature');
    }
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const customerId = session.customer as string;
          const user = await this.userModel.findOne({
            stripeCustomerId: customerId,
          });
          if (user) {
            user.plan = PAYMENT_PLAN.PREMIUM;
            await user.save();
          }
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as any;
          const customerId = invoice.customer as string;
          const amountPaid = invoice.amount_paid as number;
          const subscriptionId = invoice.subscription as string | undefined;
          const user = await this.userModel.findOne({
            stripeCustomerId: customerId,
          });
          if (user) {
            const periodEnd =
              invoice.lines?.data?.[0]?.period?.end ||
              Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
            user.plan = PAYMENT_PLAN.PREMIUM;
            user.nextPaymentDate = new Date(periodEnd * 1000);
            await user.save();
            await this.paymentModel.create({
              userId: user._id,
              amount: (amountPaid || 0) / 100,
              source: PAYMENT_SOURCE.STRIPE,
              type: PAYMENT_TYPE.MONTHLY_SUBSCRIPTION,
              flow: PAYMENT_FLOW.INBOUND,
              typeId: subscriptionId || (invoice.id as string),
              subscriptionId: subscriptionId,
              invoiceId: invoice.id as string,
              status: PAYMENT_STATUS.SUCCESS,
            });
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          const customerId = invoice.customer as string;
          const user = await this.userModel.findOne({
            stripeCustomerId: customerId,
          });
          if (user) {
            await this.paymentModel.create({
              userId: user._id,
              amount: 0,
              source: PAYMENT_SOURCE.STRIPE,
              type: PAYMENT_TYPE.MONTHLY_SUBSCRIPTION,
              flow: PAYMENT_FLOW.INBOUND,
              typeId: (invoice.id as string) || 'invoice',
              invoiceId: invoice.id as string,
              status: PAYMENT_STATUS.FAILED,
            });
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const subs = await this.stripe.subscriptions.retrieve(
            subscription.id,
          );
          const customerId = subs.customer as string;
          const user = await this.userModel.findOne({
            stripeCustomerId: customerId,
          });
          if (user) {
            user.plan = PAYMENT_PLAN.FREE;
            user.nextPaymentDate = null;
            await user.save();
          }
          break;
        }
      }
      return { received: true };
    } catch (error: any) {
      this.logger.error(error);
      throw new BadRequestException('Webhook handling failed');
    }
  }

  async requestWithdrawal(dto: CreateWithdrawalDto): Promise<ReturnType> {
    try {
      const { userId, amount, bankAccountId, currency } = dto;
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      const wallet = await this.walletModel.findOne({ userId });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.balance < amount)
        throw new BadRequestException('Insufficient wallet balance');

      const connectId = (user as any).stripeConnectId as string | undefined;
      if (!connectId)
        throw new BadRequestException('User does not have a connected account');

      const account = await this.stripe.accounts.retrieve(connectId);
      const externalAccounts = (account.external_accounts?.data ||
        []) as unknown as Array<Record<string, unknown>>;
      const hasBank = externalAccounts.some(
        (acc: any) => acc?.id === bankAccountId,
      );
      if (!hasBank) throw new BadRequestException('Bank account not linked');

      const payout = await this.stripe.payouts.create(
        {
          amount: Math.round(amount * 100),
          currency: currency || 'usd',
          destination: bankAccountId,
        } as any,
        { stripeAccount: connectId },
      );

      await this.walletModel.findOneAndUpdate(
        { userId },
        { $inc: { balance: -amount } },
      );

      const payment = await this.paymentModel.create({
        userId,
        amount,
        source: PAYMENT_SOURCE.STRIPE,
        type: PAYMENT_TYPE.WITHDRAWAL,
        flow: PAYMENT_FLOW.OUTBOUND,
        typeId: bankAccountId,
        stripePayoutId: payout.id,
        destinationBankId: bankAccountId,
        status: PAYMENT_STATUS.PENDING,
      });

      return new ReturnType({
        success: true,
        message: 'Withdrawal initiated',
        data: payment,
      });
    } catch (error: any) {
      this.logger.error(error);
      throw new BadRequestException(
        error?.message || 'Failed to initiate withdrawal',
      );
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

  async getLinkedAccounts(userId: string): Promise<ReturnType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!(user as any).stripeConnectId) {
        return new ReturnType({
          success: false,
          message: 'User does not have a connected account',
          data: [],
        });
      }

      const account = await this.stripe.accounts.retrieve(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        (user as any).stripeConnectId,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const externalAccounts = account.external_accounts?.data || [];

      const formattedAccounts = externalAccounts.map((acc: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: acc.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        bankName: acc.bank_name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        last4: acc.last4,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        currency: acc.currency,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        status: acc.status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        isDefault: acc.default_for_currency,
      }));

      return new ReturnType({
        success: true,
        message: 'Linked accounts retrieved',
        data: formattedAccounts,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to get linked accounts',
        data: [],
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
      let wallet = await this.walletModel.findOne({ userId });
      if (!wallet) {
        wallet = await this.walletModel.create({ userId, balance: 0 });
      }

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

  async getTransactions(
    userId: string,
    query: GetTransactionsDto,
  ): Promise<PaginatedReturnType> {
    try {
      const { page = 1, limit = 10, type, source, status, flow } = query;
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = { userId };
      if (type) filter.type = type;
      if (source) filter.source = source;
      if (status) filter.status = status;
      if (flow) filter.flow = flow;

      const [transactions, total] = await Promise.all([
        this.paymentModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.paymentModel.countDocuments(filter),
      ]);

      return new PaginatedReturnType({
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions,
        page,
        total,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new PaginatedReturnType({
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message || 'Failed to retrieve transactions',
        data: [],
        page: query.page || 1,
        total: 0,
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
          user.plan = PAYMENT_PLAN.PREMIUM;
          await user.save();
        }
        break;
      }

      case PAYMENT_TYPE.WITHDRAWAL:
        break;
    }
  }
}
