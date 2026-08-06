import { ReturnType } from '@/common/classes/ReturnType';
import { ShippoService } from '@/common/services/shippo/shippo.service';
import { Order, OrderDocument } from '@/schemas/Order.schema';
import { Shipment, ShipmentDocument } from '@/schemas/Shipment.schema';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateShipmentDto, ShipmentAddress } from '@/common/services/shippo/dto/CreateShippmentDto';
import { Address, AddressDocument } from '@/schemas/Address.schema';
import { User } from '@/schemas/User.schema';
import { UserDocument } from '@/schemas/User.schema';
import { Business, BusinessDocument } from '@/schemas/Business.schema';
import { CreateShipmentPayloadDto } from './dto/CreateShipmentPayloadDto';

@Injectable()
export class ShipmentService {
    constructor(private shippoService: ShippoService,
        @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
        @InjectModel(Shipment.name) private readonly shipmentModel: Model<ShipmentDocument>,
        @InjectModel(Address.name) private readonly addressModel: Model<AddressDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
    ) { }

    async createShipment(orderId: string, payload: CreateShipmentPayloadDto) {
        try {
            // Verify order exists
            const order = await this.orderModel.findById(orderId);

            if (!order) {
                throw new NotFoundException(`Order with ID ${orderId} not found`);
            }

            const address = await this.addressModel.findById(order.addressId);

            if (!address) {
                throw new NotFoundException(`Address with ID ${order.addressId} not found`);
            }

            // get the users details
            const business = await this.businessModel.findById(order.businessId);
            if (!business) {
                throw new NotFoundException(`Business with ID ${order.businessId} not found`);
            }

            const user = await this.userModel.findById(business.userId);
            if (!user) {
                throw new NotFoundException(`User with ID ${business.userId} not found`);
            }

            const shipmentPayload: CreateShipmentDto = {
                address_from: payload.address_from,
                address_to: {
                    city: address.city ?? '',
                    state: address.state ?? '',
                    country: address.country ?? '',
                    street1: address.address ?? '',
                    zip: address.zip ?? '',
                    email: user.email ?? '',
                    phone: user.phoneNumber ?? '',
                    name: user.firstName + ' ' + user.lastName,
                },
                parcels: payload.parcels,
            }

            // Create shipment via Shippo service
            const shippoShipment = await this.shippoService.createShippment({ payload: shipmentPayload });

            if (!shippoShipment || !shippoShipment.object_id) {
                throw new BadRequestException('Failed to create shipment via Shippo');
            }

            // Store shipment in our database
            const shipment = await this.shipmentModel.create({
                orderId: order._id,
                shippoObjectId: shippoShipment.object_id,
                status: shippoShipment.status,
                address: shipmentPayload.address_to.street1,
                city: shipmentPayload.address_to.city,
                state: shipmentPayload.address_to.state,
                country: shipmentPayload.address_to.country,
            });

            return new ReturnType({
                message: 'Shipment created successfully',
                data: shipment,
                success: true,
            });
        } catch (error) {
            console.log(error);
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
            console.log(error);
            throw new BadRequestException(error);
        }
    }


}
