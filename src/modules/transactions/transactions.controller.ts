import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ReturnType } from '@/common/classes/ReturnType';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiTags('Transactions')
@Controller('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiOkResponse({ description: 'Payment intent created' })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<ReturnType> {
    return this.transactionsService.createPaymentIntent(
      dto.amount,
      dto.currency,
      dto.metadata,
    );
  }

  @Get('verify/:id')
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiOkResponse({ description: 'Payment status retrieved' })
  async verifyPayment(@Param('id') id: string): Promise<ReturnType> {
    return this.transactionsService.verifyPayment(id);
  }
}
