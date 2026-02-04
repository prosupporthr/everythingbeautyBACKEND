import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { ReturnType } from '@/common/classes/ReturnType';
import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { UserAuthGuard } from '@/common/guards/user-auth/user-auth.guard';
import { AdminAuthGuard } from '@/common/guards/admin-auth/admin-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiOkResponse({ description: 'Notifications retrieved' })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query() query: GetNotificationsDto,
  ): Promise<PaginatedReturnType> {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Patch('user/:id/read')
  @UseGuards(UserAuthGuard)
  @ApiOperation({ summary: 'Mark notification as read for user' })
  @ApiOkResponse({ description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string): Promise<ReturnType> {
    return this.notificationsService.markAsRead(id);
  }

  @Get('admin/:adminId')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get notifications for admin' })
  @ApiOkResponse({ description: 'Admin notifications retrieved' })
  async getAdminNotifications(
    @Param('adminId') adminId: string,
    @Query() query: GetNotificationsDto,
  ): Promise<PaginatedReturnType> {
    return this.notificationsService.getAdminNotifications(adminId, query);
  }

  @Patch('admin/:id/read/:adminId')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Mark notification as read for admin' })
  @ApiOkResponse({ description: 'Notification marked as read for admin' })
  async markAsReadForAdmin(
    @Param('id') id: string,
    @Param('adminId') adminId: string,
  ): Promise<ReturnType> {
    return this.notificationsService.markAsReadForAdmin(id, adminId);
  }
}
