import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from '@/common/services/shippo/dto/CreateShippmentDto';
import { AuthGuard } from '@/common/guards/auth/auth.guard';

@ApiBearerAuth('JWT-auth')
@ApiTags('Shipment')
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post(':orderId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a shipment for an order' })
  @ApiBody({ type: CreateShipmentDto })
  @ApiOkResponse({ description: 'Shipment created successfully' })
  async createShipment(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.shipmentService.createShipment(orderId, dto);
  }
}
