import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { Business, BusinessSchema } from '@schemas/Business.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';
import { Service, ServiceSchema } from '@/schemas/Service.Schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService, JwtService, UploadService],
  exports: [BusinessService, MongooseModule],
})
export class BusinessModule {}
