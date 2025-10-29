import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ChangeBookingStatusDto } from './dto/change-booking-status.dto';
import { BookingBusinessQueryDto } from './dto/booking-business-query.dto';
import { ReturnType } from '@common/classes/ReturnType';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';

@ApiBearerAuth('JWT-auth')
@UseGuards(UserAuthGuard)
@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking' })
  @ApiBody({ type: CreateBookingDto })
  @ApiOkResponse({ description: 'Booking created' })
  async createBooking(@Body() dto: CreateBookingDto): Promise<ReturnType> {
    return this.bookingService.createBooking(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change booking status' })
  @ApiParam({ name: 'id', description: 'Booking ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiBody({ type: ChangeBookingStatusDto })
  @ApiOkResponse({ description: 'Booking status updated' })
  async changeBookingStatus(
    @Param('id') id: string,
    @Body() dto: ChangeBookingStatusDto,
  ): Promise<ReturnType> {
    return this.bookingService.changeBookingStatus(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'Booking fetched' })
  async getBookingById(@Param('id') id: string): Promise<ReturnType> {
    return this.bookingService.getBookingById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get bookings by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiOkResponse({ description: 'User bookings fetched' })
  async getBookingsByUserId(@Param('userId') userId: string): Promise<ReturnType> {
    return this.bookingService.getBookingsByUserId(userId);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get bookings by business ID with filters' })
  @ApiParam({ name: 'businessId', description: 'Business ID', example: '64f7c2d91c2f4a0012345678' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Filter by service ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date/time (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date/time (ISO)' })
  @ApiQuery({ name: 'time', required: false, description: 'Exact booking date/time (ISO)' })
  @ApiOkResponse({ description: 'Business bookings fetched' })
  async getBookingsByBusinessId(
    @Param('businessId') businessId: string,
    @Query() query: BookingBusinessQueryDto,
  ): Promise<ReturnType> {
    return this.bookingService.getBookingsByBusinessId(businessId, query);
  }
}
