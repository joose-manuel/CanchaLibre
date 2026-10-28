import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification as NotificationModel, NotificationType } from '@canchalibre/shared-domain';
import { toNotificationModel } from '../../common/mappers/api.mapper';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
  ): Promise<NotificationModel> {
    const notification = this.notifications.create({
      user: { id: userId },
      userId,
      type,
      title,
      body,
    });
    return toNotificationModel(await this.notifications.save(notification));
  }

  async createMany(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
  ): Promise<void> {
    const unique = [...new Set(userIds)].filter(Boolean);
    if (!unique.length) {
      return;
    }

    const rows = unique.map((userId) =>
      this.notifications.create({ user: { id: userId }, userId, type, title, body }),
    );
    await this.notifications.save(rows);
  }

  async findMine(userId: string): Promise<NotificationModel[]> {
    const rows = await this.notifications.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return rows.map(toNotificationModel);
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notifications.count({
      where: { user: { id: userId }, readAt: IsNull() },
    });
    return { count };
  }

  async markRead(id: string, userId: string): Promise<NotificationModel> {
    const notification = await this.notifications.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notifications.save(notification);
    }

    return toNotificationModel(notification);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notifications
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('read_at IS NULL')
      .execute();

    return { updated: result.affected ?? 0 };
  }
}
