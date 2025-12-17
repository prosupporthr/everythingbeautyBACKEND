import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressSchema } from '@/schemas/Address.schema';
import { Address } from '@/schemas/Address.schema';
import { UserSchema, User } from '@/schemas/User.schema';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AddressController],
  providers: [AddressService, JwtService, ConfigService],
  imports: [
    MongooseModule.forFeature([
      { schema: AddressSchema, name: Address.name },
      { schema: UserSchema, name: User.name },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
})
export class AddressModule {}
