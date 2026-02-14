import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
// import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { CreateAccountLinkDto } from './dto/create-account-link.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { StartSubscriptionDto } from './dto/start-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { ReturnType } from '@/common/classes/ReturnType';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiTags('Transactions')
@Controller('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiOkResponse({ description: 'Transactions retrieved' })
  async getTransactions(
    @Param('userId') userId: string,
    @Query() query: GetTransactionsDto,
  ): Promise<PaginatedReturnType> {
    return this.transactionsService.getTransactions(userId, query);
  }

  @Get('wallet/:userId')
  @ApiOperation({ summary: 'Get user wallet' })
  @ApiOkResponse({ description: 'Wallet retrieved' })
  async getWallet(@Param('userId') userId: string): Promise<ReturnType> {
    return this.transactionsService.getWallet(userId);
  }

  @Get('connect/status/:userId')
  @ApiOperation({ summary: 'Check stripe connected account status' })
  @ApiOkResponse({ description: 'Account status retrieved' })
  async checkAccountStatus(
    @Param('userId') userId: string,
  ): Promise<ReturnType> {
    return this.transactionsService.checkAccountStatus(userId);
  }

  @Get('linked-accounts/:userId')
  @ApiOperation({ summary: 'Get linked bank accounts from Stripe' })
  @ApiOkResponse({ description: 'Linked accounts retrieved' })
  async getLinkedAccounts(
    @Param('userId') userId: string,
  ): Promise<ReturnType> {
    return this.transactionsService.getLinkedAccounts(userId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new transaction (payment)' })
  @ApiOkResponse({ description: 'Transaction created' })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
  ): Promise<ReturnType> {
    return this.transactionsService.initiatePayment(dto);
  }

  @Get('verify-transaction/:id')
  @ApiOperation({
    summary: 'Verify transaction status and process if successful',
  })
  @ApiOkResponse({ description: 'Transaction verified' })
  async verifyTransaction(@Param('id') id: string): Promise<ReturnType> {
    return this.transactionsService.verifyTransaction(id);
  }

  // @Post('initiate')
  // @ApiOperation({ summary: 'Create a payment intent' })
  // @ApiOkResponse({ description: 'Payment intent created' })
  // async createPaymentIntent(
  //   @Body() dto: CreatePaymentIntentDto,
  // ): Promise<ReturnType> {
  //   return this.transactionsService.createPaymentIntent(
  //     dto.amount,
  //     dto.currency,
  //     dto.metadata,
  //   );
  // }

  @Get('verify/:id')
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiOkResponse({ description: 'Payment status retrieved' })
  async verifyPayment(@Param('id') id: string): Promise<ReturnType> {
    return this.transactionsService.verifyPayment(id);
  }

  @Post('subscription/start')
  @ApiOperation({
    summary: 'Start a recurring subscription via Stripe Checkout',
  })
  @ApiOkResponse({ description: 'Checkout session created' })
  async startSubscription(
    @Body() dto: StartSubscriptionDto,
  ): Promise<ReturnType> {
    return this.transactionsService.startSubscription(dto);
  }

  @Post('subscription/cancel')
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  @ApiOkResponse({ description: 'Subscription cancellation scheduled' })
  async cancelSubscription(
    @Body() dto: CancelSubscriptionDto,
  ): Promise<ReturnType> {
    return this.transactionsService.cancelSubscription(dto);
  }

  @Post('withdraw')
  @ApiOperation({
    summary:
      'Request a withdrawal to a linked bank account (user Stripe connected account required)',
  })
  @ApiOkResponse({ description: 'Withdrawal initiated' })
  async requestWithdrawal(
    @Body() dto: CreateWithdrawalDto,
  ): Promise<ReturnType> {
    return this.transactionsService.requestWithdrawal(dto);
  }

  // @Post('customer/:userId')
  // @ApiOperation({ summary: 'Create a stripe customer' })
  // @ApiOkResponse({ description: 'Stripe customer created' })
  // async createStripeCustomer(
  //   @Param('userId') userId: string,
  // ): Promise<ReturnType> {
  //   return this.transactionsService.createStripeCustomer(userId);
  // }

  @Post('connect/:userId')
  @ApiOperation({ summary: 'Create a stripe connected account' })
  @ApiOkResponse({ description: 'Stripe connected account created' })
  async createConnectedAccount(
    @Param('userId') userId: string,
  ): Promise<ReturnType> {
    return this.transactionsService.createConnectedAccount(userId);
  }

  @Post('connect/onboard/:userId')
  @ApiOperation({ summary: 'Create a stripe account onboarding link' })
  @ApiOkResponse({ description: 'Account link created' })
  async createAccountLink(
    @Param('userId') userId: string,
    @Body() dto: CreateAccountLinkDto,
  ): Promise<ReturnType> {
    return this.transactionsService.createAccountLink(
      userId,
      dto.refreshUrl,
      dto.returnUrl,
    );
  }
}
