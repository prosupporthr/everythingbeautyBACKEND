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
import { Business } from '@/schemas/Business.schema';
import { BusinessSchema } from '@/schemas/Business.schema';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceEntity.name, schema: ServiceSchema },
      { name: User.name, schema: UserSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [ServiceController],
  providers: [ServiceService, JwtService, UploadService],
  exports: [ServiceService],
})
export class ServiceModule {}
