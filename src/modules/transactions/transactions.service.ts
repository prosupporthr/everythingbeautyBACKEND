import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { ReturnType } from '@/common/classes/ReturnType';

@Injectable()
export class TransactionsService {
  private stripe: Stripe;
  private logger = new Logger(TransactionsService.name);

  constructor(private configService: ConfigService) {
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
