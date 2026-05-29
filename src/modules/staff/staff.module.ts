import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from '@schemas/Staff.schema';
import { Business, BusinessSchema } from '@schemas/Business.schema';
import { User, UserSchema } from '@schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Staff.name, schema: StaffSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [StaffController],
  providers: [StaffService, JwtService, ConfigService, UploadService],
})
export class StaffModule {}
