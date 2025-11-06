import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking, BookingSchema } from '@schemas/Booking.schema';
import { User, UserSchema } from '@schemas/User.schema';
import { Service, ServiceSchema } from '@/schemas/Service.Schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService, JwtService],
})
export class BookingModule {}
