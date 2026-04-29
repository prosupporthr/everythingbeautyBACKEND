import { ReturnType } from '@/common/classes/ReturnType';
import { ShippoService } from '@/common/services/shippo/shippo.service';
import { Order, OrderDocument } from '@/schemas/Order.schema';
import { Shipment, ShipmentDocument } from '@/schemas/Shipment.schema';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateShipmentDto } from '@/common/services/shippo/dto/CreateShippmentDto';

@Injectable()
export class ShipmentService {
    constructor(private shippoService: ShippoService, 
            @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
            @InjectModel(Shipment.name) private readonly shipmentModel: Model<ShipmentDocument>,
    ) {}

    async createShipment(orderId: string, payload: CreateShipmentDto) {
        try {
            // Verify order exists
            const order = await this.orderModel.findById(orderId);
            if (!order) {
                throw new NotFoundException(`Order with ID ${orderId} not found`);
            }

            // Create shipment via Shippo service
            const shippoShipment = await this.shippoService.createShippment({ payload });
            
            if (!shippoShipment || !shippoShipment.object_id) {
                throw new BadRequestException('Failed to create shipment via Shippo');
            }

            // Store shipment in our database
            const shipment = await this.shipmentModel.create({
                orderId: order._id,
                shippoObjectId: shippoShipment.object_id,
                status: shippoShipment.status,
                address: payload.address_to.street,
                city: payload.address_to.city,
                state: payload.address_to.state,
                country: payload.address_to.country,
            });

            return new ReturnType({
                message: 'Shipment created successfully',
                data: shipment,
                success: true,
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message || 'Error creating shipment');
        }
    }

    async getShipmentById(id: string) {
        try {
            const shipment = await this.shippoService.getShipmentById(id);
            return new ReturnType({
                message: 'Shippment',
                data: shipment,
                success: true,
            })
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    
}
