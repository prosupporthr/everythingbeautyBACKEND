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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [ShipmentController],
  providers: [ShipmentService, ConfigService, ShippoService, JwtService],
})
export class ShipmentModule {}
