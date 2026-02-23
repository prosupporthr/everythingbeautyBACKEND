/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '@/schemas/Notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { ReturnType } from '@/common/classes/ReturnType';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import {
  BulkMarkReadDto,
  NOTIFICATION_USER_TYPE,
} from './dto/bulk-mark-read.dto';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<ReturnType> {
    try {
      const notification = await this.notificationModel.create(dto);
      return new ReturnType({
        success: true,
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        message: error.message || 'Failed to create notification',
        data: null,
      });
    }
  }

  async getUserNotifications(
    userId: string,
    query: GetNotificationsDto,
  ): Promise<PaginatedReturnType<NotificationDocument[]>> {
    try {
      const { page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      const filter = { userId, isForAdmin: false };

      const [notifications, total] = await Promise.all([
        this.notificationModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.notificationModel.countDocuments(filter),
      ]);

      return new PaginatedReturnType<NotificationDocument[]>({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
        page,
        total,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new PaginatedReturnType<NotificationDocument[]>({
        success: false,
        message: error.message || 'Failed to retrieve notifications',
        data: [],
        page: query.page || 1,
        total: 0,
      });
    }
  }

  async markAsRead(id: string): Promise<ReturnType> {
    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true },
      );

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      return new ReturnType({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        message: error.message || 'Failed to mark notification as read',
        data: null,
      });
    }
  }

  async getAdminNotifications(
    adminId: string,
    query: GetNotificationsDto,
  ): Promise<PaginatedReturnType<NotificationDocument[]>> {
    try {
      const { page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      // Get notifications for admin that have NOT been read by this admin
      const filter = {
        isForAdmin: true,
        readBy: { $ne: adminId },
      };

      const [notifications, total] = await Promise.all([
        this.notificationModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.notificationModel.countDocuments(filter),
      ]);

      return new PaginatedReturnType<NotificationDocument[]>({
        success: true,
        message: 'Admin notifications retrieved successfully',
        data: notifications,
        page,
        total,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new PaginatedReturnType<NotificationDocument[]>({
        success: false,
        message: error.message || 'Failed to retrieve admin notifications',
        data: [],
        page: query.page || 1,
        total: 0,
      });
    }
  }

  async markAsReadForAdmin(id: string, adminId: string): Promise<ReturnType> {
    try {
      const notification = await this.notificationModel.findByIdAndUpdate(
        id,
        { $addToSet: { readBy: adminId } },
        { new: true },
      );

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      return new ReturnType({
        success: true,
        message: 'Notification marked as read for admin',
        data: notification,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        message: error.message || 'Failed to mark notification as read',
        data: null,
      });
    }
  }

  async bulkMarkAsRead(dto: BulkMarkReadDto): Promise<ReturnType> {
    try {
      const { ids, userType, adminId } = dto;

      if (!ids?.length) {
        return new ReturnType({
          success: true,
          message: 'No notifications to update',
          data: null,
        });
      }

      if (userType === NOTIFICATION_USER_TYPE.USER) {
        await this.notificationModel.updateMany(
          { _id: { $in: ids } },
          { $set: { isRead: true } },
        );
      } else if (userType === NOTIFICATION_USER_TYPE.ADMIN) {
        if (!adminId) {
          return new ReturnType({
            success: false,
            message: 'adminId is required when userType is admin',
            data: null,
          });
        }

        await this.notificationModel.updateMany(
          { _id: { $in: ids } },
          { $addToSet: { readBy: adminId } },
        );
      }

      return new ReturnType({
        success: true,
        message: 'Notifications updated successfully',
        data: null,
      });
    } catch (error: any) {
      this.logger.error(error);
      return new ReturnType({
        success: false,
        message: error.message || 'Failed to update notifications',
        data: null,
      });
    }
  }
}
