import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
// import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateAccountLinkDto } from './dto/create-account-link.dto';
import { ReturnType } from '@/common/classes/ReturnType';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiTags('Transactions')
@Controller('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

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
