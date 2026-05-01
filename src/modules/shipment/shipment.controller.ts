import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from '@/common/services/shippo/dto/CreateShippmentDto';
import { AuthGuard } from '@/common/guards/auth/auth.guard';
import { CreateShipmentPayloadDto } from './dto/CreateShipmentPayloadDto';

@ApiBearerAuth('JWT-auth')
@ApiTags('Shipment')
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post(':orderId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a shipment for an order' })
  @ApiBody({ type: CreateShipmentPayloadDto })
  @ApiOkResponse({ description: 'Shipment created successfully' })
  async createShipment(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentPayloadDto,
  ) {
    return this.shipmentService.createShipment(orderId, dto);
  }
}
