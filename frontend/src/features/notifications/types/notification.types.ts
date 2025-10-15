import { BaseEntity, ListParams } from '@/shared/types/common.types';

export type NotificationChannel = 'inapp' | 'push' | 'sms' | 'email';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'read';

export interface Notification extends BaseEntity {
  userId?: string;
  channel: NotificationChannel;
  templateKey: string;
  payload: Record<string, unknown>;
  title?: string;
  body?: string;
  link?: string;
  status: NotificationStatus;
  sentAt?: Date;
  readAt?: Date;
  error?: string;
  isAdminCreated?: boolean;
  scheduledAt?: Date;
  // Populated fields
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface NotificationTemplate {
  key: string;
  title: string;
  body: string;
  hasLink: boolean;
}

export interface CreateNotificationDto {
  title: string;
  body: string;
  channel: NotificationChannel;
  templateKey?: string;
  payload?: Record<string, unknown>;
  link?: string;
  targetUsers?: string[];
  scheduledAt?: string;
}

export interface UpdateNotificationDto {
  title?: string;
  body?: string;
  link?: string;
  payload?: Record<string, unknown>;
}

export interface SendNotificationDto {
  targetUsers?: string[];
  scheduledAt?: string;
}

export interface ListNotificationsParams extends ListParams {
  channel?: NotificationChannel;
  status?: NotificationStatus;
  search?: string;
  userId?: string;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  queued: number;
  read: number;
  byChannel: Record<string, number>;
  recent24h: number;
}
