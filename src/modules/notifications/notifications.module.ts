import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from '@/schemas/Notification.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { Admin, AdminSchema } from '@/schemas/Admin.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, JwtService, ConfigService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
