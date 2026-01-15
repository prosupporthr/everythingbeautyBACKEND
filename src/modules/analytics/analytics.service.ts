import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/schemas/User.schema';
import { Business } from '@/schemas/Business.schema';
import { Product } from '@/schemas/Product.schema';
import { Service } from '@/schemas/Service.Schema';
import { Booking } from '@/schemas/Booking.schema';
import { Order } from '@/schemas/Order.schema';
import { ReturnType } from '@/common/classes/ReturnType';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<Business>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<Booking>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  async getGlobalStats(): Promise<ReturnType> {
    const [totalUsers, totalBusinesses, totalProducts, totalServices] =
      await Promise.all([
        this.userModel.countDocuments({ isDeleted: false }),
        this.businessModel.countDocuments({ isDeleted: false }),
        this.productModel.countDocuments({ isDeleted: false }),
        this.serviceModel.countDocuments({ isDeleted: false }),
      ]);

    return new ReturnType({
      success: true,
      message: 'Global analytics fetched',
      data: {
        totalUsers,
        totalBusinesses,
        totalProducts,
        totalServices,
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
