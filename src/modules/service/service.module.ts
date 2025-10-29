import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import {
  Service as ServiceEntity,
  ServiceSchema,
} from '@schemas/Service.Schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceEntity.name, schema: ServiceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ServiceController],
  providers: [ServiceService, JwtService],
  exports: [ServiceService],
})
export class ServiceModule {}
