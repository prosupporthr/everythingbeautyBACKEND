import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/schemas/User.schema';
import { Business, BusinessDocument } from '@/schemas/Business.schema';
import { Product, ProductDocument } from '@/schemas/Product.schema';
import { Service, ServiceDocument } from '@/schemas/Service.Schema';
import { Order, OrderDocument } from '@/schemas/Order.schema';
import { Booking, BookingDocument } from '@/schemas/Booking.schema';
import { ReturnType } from '@/common/classes/ReturnType';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async getGlobalStats(): Promise<ReturnType> {
    const [
      totalUsers,
      totalBusinesses,
      totalProducts,
      totalServices,
      totalProductSold,
      totalDeletedProducts,
      totalServiceRendered,
      totalDeletedServices,
      totalDeletedUsers,
    ] = await Promise.all([
      this.userModel.countDocuments({ isDeleted: false }),
      this.businessModel.countDocuments({ isDeleted: false }),
      this.productModel.countDocuments({ isDeleted: false }),
      this.serviceModel.countDocuments({ isDeleted: false }),
      this.orderModel.countDocuments({ isDeleted: false }), // Assuming every order is a sold product
      this.productModel.countDocuments({ isDeleted: true }),
      this.bookingModel.countDocuments({ isDeleted: false }), // Assuming every booking is a rendered service
      this.serviceModel.countDocuments({ isDeleted: true }),
      this.userModel.countDocuments({ isDeleted: true }),
    ]);

    return new ReturnType({
      success: true,
      message: 'Global analytics fetched',
      data: {
        totalUsers,
        totalDeletedUsers,
        totalBusinesses,
        products: {
          total: totalProducts,
          sold: totalProductSold,
          deleted: totalDeletedProducts,
        },
        services: {
          total: totalServices,
          rendered: totalServiceRendered,
          deleted: totalDeletedServices,
        },
      },
    });
  }

  async getBusinessStats(businessId: string): Promise<ReturnType> {
    const [totalProducts, totalServices, totalBookings, totalOrders] =
      await Promise.all([
        this.productModel.countDocuments({
          businessId,
          isDeleted: false,
        }),
        this.serviceModel.countDocuments({
          businessId,
          isDeleted: false,
        }),
        this.bookingModel.countDocuments({
          businessId,
          isDeleted: false,
        }),
        this.orderModel.countDocuments({
          businessId,
          isDeleted: false,
        }),
      ]);

    return new ReturnType({
      success: true,
      message: 'Business analytics fetched',
      data: {
        totalProducts,
        totalServices,
        totalBookings,
        totalOrders,
      },
    });
  }
}
