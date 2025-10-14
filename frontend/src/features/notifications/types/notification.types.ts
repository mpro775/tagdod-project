import { BaseEntity, ListParams } from '@/shared/types/common.types';

export enum NotificationType {
  ORDER = 'order',
  PRODUCT = 'product',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Notification extends BaseEntity {
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetUsers?: string[];
  sentAt?: Date;
  isSent: boolean;
}

export interface CreateNotificationDto {
  title: string;
  body: string;
  type: NotificationType;
  priority?: NotificationPriority;
  targetUsers?: string[];
}

export interface ListNotificationsParams extends ListParams {
  type?: NotificationType;
  isSent?: boolean;
}

