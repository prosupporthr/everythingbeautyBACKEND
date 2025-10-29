import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '@schemas/Booking.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ChangeBookingStatusDto } from './dto/change-booking-status.dto';
import { BookingBusinessQueryDto } from './dto/booking-business-query.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<ReturnType> {
    try {
      const booking = await this.bookingModel.create({
        userId: dto.userId,
        businessId: dto.businessId,
        serviceId: dto.serviceId,
        totalPrice: dto.totalPrice,
        bookingDate: dto.bookingDate,
      });
      return new ReturnType({
        success: true,
        message: 'Booking created',
        data: booking,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async changeBookingStatus(id: string, { status }: ChangeBookingStatusDto): Promise<ReturnType> {
    const updated = await this.bookingModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status, updatedAt: new Date().toISOString() },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Booking not found');
    return new ReturnType({ success: true, message: 'Booking status updated', data: updated });
  }

  async getBookingById(id: string): Promise<ReturnType> {
    const booking = await this.bookingModel.findOne({ _id: id, isDeleted: false });
    if (!booking) throw new NotFoundException('Booking not found');
    return new ReturnType({ success: true, message: 'Booking fetched', data: booking });
  }

  async getBookingsByUserId(userId: string): Promise<ReturnType> {
    const bookings = await this.bookingModel
      .find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
    return new ReturnType({ success: true, message: 'User bookings fetched', data: bookings });
  }

  async getBookingsByBusinessId(
    businessId: string,
    { serviceId, startDate, endDate, time }: BookingBusinessQueryDto,
  ): Promise<ReturnType> {
    const filter: Record<string, any> = { businessId, isDeleted: false };
    if (serviceId) filter.serviceId = serviceId;

    // bookingDate is stored as ISO string; lexical comparison works for ranges
    if (time) {
      filter.bookingDate = time;
    } else if (startDate || endDate) {
      filter.bookingDate = {};
      if (startDate) filter.bookingDate.$gte = startDate;
      if (endDate) filter.bookingDate.$lte = endDate;
    }

    const bookings = await this.bookingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return new ReturnType({ success: true, message: 'Business bookings fetched', data: bookings });
  }
}
