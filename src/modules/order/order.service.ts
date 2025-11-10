import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '@/schemas/Order.schema';
import { User, UserDocument } from '@/schemas/User.schema';
import { Product, ProductDocument } from '@/schemas/Product.schema';
import { Business, BusinessDocument } from '@/schemas/Business.schema';
import { ReturnType } from '@common/classes/ReturnType';
import { PaginatedReturnType } from '@common/classes/PaginatedReturnType';
import { PaginationQueryDto } from '@modules/business/dto/pagination-query.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { EditOrderDto } from './dto/edit-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<ReturnType> {
    const created = await this.orderModel.create({ ...dto });
    const enriched = await this.enrichOrder(created);
    return new ReturnType({ success: true, message: 'Order created', data: enriched });
  }

  async getOrderById(id: string): Promise<ReturnType> {
    const order = await this.orderModel.findOne({ _id: id, isDeleted: false });
    if (!order) throw new NotFoundException('Order not found');
    const enriched = await this.enrichOrder(order);
    return new ReturnType({ success: true, message: 'Order fetched', data: enriched });
  }

  async editOrder(id: string, dto: EditOrderDto): Promise<ReturnType> {
    const updated = await this.orderModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...dto, updatedAt: new Date().toISOString() },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Order not found');
    const enriched = await this.enrichOrder(updated);
    return new ReturnType({ success: true, message: 'Order updated', data: enriched });
  }

  async softDeleteOrder(id: string): Promise<ReturnType> {
    const deleted = await this.orderModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { new: true },
    );
    if (!deleted) throw new NotFoundException('Order not found');
    const enriched = await this.enrichOrder(deleted);
    return new ReturnType({ success: true, message: 'Order deleted', data: enriched });
  }

  async getUserOrders(
    userId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<OrderDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ userId, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments({ userId, isDeleted: false }),
    ]);

    const enrichedOrders = await Promise.all(data.map((o) => this.enrichOrder(o)));

    return new PaginatedReturnType<OrderDocument[]>({
      success: true,
      message: 'User orders fetched',
      data: enrichedOrders,
      page,
      total,
    });
  }

  async getBusinessOrders(
    businessId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<OrderDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ businessId, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments({ businessId, isDeleted: false }),
    ]);

    const enrichedOrders = await Promise.all(data.map((o) => this.enrichOrder(o)));

    return new PaginatedReturnType<OrderDocument[]>({
      success: true,
      message: 'Business orders fetched',
      data: enrichedOrders,
      page,
      total,
    });
  }

  async getProductOrders(
    productId: string,
    { page = 1, limit = 10 }: PaginationQueryDto,
  ): Promise<PaginatedReturnType<OrderDocument[]>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ productId, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments({ productId, isDeleted: false }),
    ]);

    const enrichedOrders = await Promise.all(data.map((o) => this.enrichOrder(o)));

    return new PaginatedReturnType<OrderDocument[]>({
      success: true,
      message: 'Product orders fetched',
      data: enrichedOrders,
      page,
      total,
    });
  }

  private async enrichOrder(order: OrderDocument) {
    try {
      const [user, product, business] = await Promise.all([
        this.userModel.findById(order.userId),
        this.productModel.findById(order.productId),
        this.businessModel.findById(order.businessId),
      ]);
      return {
        ...order.toObject(),
        user,
        product,
        business,
      };
    } catch (error) {
      this.logger.error('Error enriching order', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }
}
