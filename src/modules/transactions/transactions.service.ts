import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { ReturnType } from '@/common/classes/ReturnType';
import { User, UserDocument } from '@/schemas/User.schema';

@Injectable()
export class TransactionsService {
  private stripe: Stripe;
  private logger = new Logger(TransactionsService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
}
