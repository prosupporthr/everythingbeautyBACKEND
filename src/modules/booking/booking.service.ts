import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '@schemas/Booking.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ChangeBookingStatusDto } from './dto/change-booking-status.dto';
import { BookingBusinessQueryDto } from './dto/booking-business-query.dto';
import { Service, ServiceDocument } from '@/schemas/Service.Schema';
import { User } from '@/schemas/User.schema';
import { UserService } from '../user/user.service';
import { ServiceService } from '../service/service.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '@/common/services/email/email.service';
import { Staff, StaffDocument } from '@schemas/Staff.schema';

@Injectable()
export class BookingService {
  private logger = new Logger(BookingService.name);
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
    private userService: UserService,
    private serviceService: ServiceService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<ReturnType> {
    try {
      const booking = await this.bookingModel.create({
        userId: dto.userId,
        businessId: dto.businessId,
        serviceId: dto.serviceId,
        totalPrice: dto.totalPrice,
        bookingDate: dto.bookingDate,
        staffId: dto?.staffId ?? null,
      });
      const enrichedBooking = await this.endrichBooking(booking);

      // Notification to business owner
      const businessOwnerId = enrichedBooking.service?.business?.creator?.id;
      if (businessOwnerId) {
        await this.notificationsService.createNotification({
          userId: businessOwnerId.toString(),
          title: 'New Booking Received',
          description: `You have received a new booking for ${enrichedBooking.service?.name} from ${enrichedBooking.user?.firstName}.`,
        });
      }

      // Email to user
      if (enrichedBooking.user?.email) {
        await this.emailService.sendGeneralMail({
          email: enrichedBooking.user.email,
          subject: 'Booking Confirmation',
          body: `<p>Thank you for your booking of ${enrichedBooking.service?.name}. Your booking ID is ${enrichedBooking._id.toString()}.</p>`,
        });
      }

      return new ReturnType({
        success: true,
        message: 'Booking created',
        data: enrichedBooking,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async changeBookingStatus(
    id: string,
    { status }: ChangeBookingStatusDto,
  ): Promise<ReturnType> {
    const updated = await this.bookingModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status, updatedAt: new Date().toISOString() },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Booking not found');
    const enrichedBooking = await this.endrichBooking(updated);
    return new ReturnType({
      success: true,
      message: 'Booking status updated',
      data: enrichedBooking,
    });
  }

  async getBookingById(id: string): Promise<ReturnType> {
    const booking = await this.bookingModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    const enrichedBooking = await this.endrichBooking(booking);
    return new ReturnType({
      success: true,
      message: 'Booking fetched',
      data: enrichedBooking,
    });
  }

  async getBookingsByUserId(userId: string): Promise<ReturnType> {
    const bookings = await this.bookingModel
      .find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => await this.endrichBooking(booking)),
    );
    return new ReturnType({
      success: true,
      message: 'User bookings fetched',
      data: enrichedBookings,
    });
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
      const dateFilter: Record<string, string> = {};
      if (startDate) dateFilter['$gte'] = startDate;
      if (endDate) dateFilter['$lte'] = endDate;
      filter.bookingDate = dateFilter;
    }

    const bookings = await this.bookingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => await this.endrichBooking(booking)),
    );

    return new ReturnType({
      success: true,
      message: 'Business bookings fetched',
      data: enrichedBookings,
    });
  }

  public async transferBooking(
    bookingId: string,
    newStaffId: string,
  ): Promise<ReturnType> {
    try {
      const booking = await this.bookingModel.findOne({
        _id: bookingId,
        isDeleted: false,
      });

      if (!booking) throw new NotFoundException('Booking not found');

      const currentStaffId = booking.staffId ? booking.staffId.toString() : '';
      if (currentStaffId === newStaffId) {
        const enrichedBooking = await this.endrichBooking(booking);
        return new ReturnType({
          success: true,
          message: 'Booking already assigned to this staff',
          data: enrichedBooking,
        });
      }

      booking.staffId = newStaffId;
      booking.updatedAt = new Date().toISOString();
      const updatedBooking = await booking.save();
      const enrichedBooking = await this.endrichBooking(updatedBooking);

      if (enrichedBooking.user?.email) {
        const staffName = enrichedBooking.staff?.name
          ? ` Your new staff is ${enrichedBooking.staff.name}.`
          : '';

        await this.emailService.sendGeneralMail({
          email: enrichedBooking.user.email,
          subject: 'Booking Staff Updated',
          body: `<p>The staff assigned to handle your booking for ${enrichedBooking.service?.name} has been changed.${staffName}</p>`,
        });
      }

      return new ReturnType({
        success: true,
        message: 'Booking staff updated',
        data: enrichedBooking,
      });
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error);
    }
  }

  private async endrichBooking(booking: BookingDocument) {
    try {
      const service = await this.serviceModel.findById(booking.serviceId);
      const user = await this.userModel.findById(booking.userId);
      let staff;
      if (booking?.staffId) {
        staff = await this.staffModel.findById(booking?.staffId);
      }

      if (!service) throw new NotFoundException('Service not found');
      if (!user) throw new NotFoundException('User not found');
      return {
        ...booking.toObject(),
        service: await this.serviceService.enrichService(service),
        user: await this.userService.enrichUser(user),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        staff,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'An error occured while getting booking details',
      );
    }
  }
}
