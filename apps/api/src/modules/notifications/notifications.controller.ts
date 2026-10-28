import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Notification as NotificationModel } from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findMine(@CurrentUser('id') userId: string): Promise<NotificationModel[]> {
    return this.notifications.findMine(userId);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser('id') userId: string): Promise<{ count: number }> {
    return this.notifications.unreadCount(userId);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser('id') userId: string): Promise<{ updated: number }> {
    return this.notifications.markAllRead(userId);
  }

  @Patch(':id/read')
  markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<NotificationModel> {
    return this.notifications.markRead(id, userId);
  }
}
