import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions Webhook')
@Controller('transactions/stripe')
export class TransactionsWebhookController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: any,
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.transactionsService.handleStripeWebhook(req, body, signature);
  }
}

