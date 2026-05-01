import { Module } from '@nestjs/common';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ShippoService } from '@/common/services/shippo/shippo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Shipment, ShipmentSchema } from '@/schemas/Shipment.schema';
import { Order, OrderSchema } from '@/schemas/Order.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';
import { JwtService } from '@nestjs/jwt';
import { Address, AddressSchema } from '@/schemas/Address.schema';
import { Business, BusinessSchema } from '@/schemas/Business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService, ConfigService, ShippoService, JwtService],
})
export class ShipmentModule {}
