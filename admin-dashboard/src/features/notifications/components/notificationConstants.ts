import {
  NotificationStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
} from '../types/notification.types';

/**
 * Colors for notification statuses
 */
export const STATUS_COLORS: Record<NotificationStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  [NotificationStatus.SENT]: 'success',
  [NotificationStatus.DELIVERED]: 'success',
  [NotificationStatus.READ]: 'info',
  [NotificationStatus.CLICKED]: 'primary',
  [NotificationStatus.FAILED]: 'error',
  [NotificationStatus.BOUNCED]: 'error',
  [NotificationStatus.REJECTED]: 'error',
  [NotificationStatus.CANCELLED]: 'default',
  [NotificationStatus.PENDING]: 'warning',
  [NotificationStatus.QUEUED]: 'warning',
  [NotificationStatus.SENDING]: 'info',
};

/**
 * Colors for notification priorities
 */
export const PRIORITY_COLORS: Record<NotificationPriority, 'error' | 'warning' | 'info' | 'default'> = {
  [NotificationPriority.URGENT]: 'error',
  [NotificationPriority.HIGH]: 'warning',
  [NotificationPriority.MEDIUM]: 'info',
  [NotificationPriority.LOW]: 'default',
};

/**
 * Default notification values
 */
export const DEFAULT_NOTIFICATION_VALUES = {
  limit: 20,
  page: 1,
  priority: NotificationPriority.MEDIUM,
  channel: NotificationChannel.IN_APP,
  category: NotificationCategory.ORDER,
};

