import { Module } from '@nestjs/common';
import { ShippoController } from './shippo/shippo.controller';

@Module({
  controllers: [ShippoController]
})
export class WebhooksModule {}
