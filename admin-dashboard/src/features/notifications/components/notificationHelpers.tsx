import React from 'react';
import {
  CheckCircle,
  Error,
  Pending,
  Cancel,
  Schedule,
  Info,
  Notifications,
  PhoneAndroid,
  Sms,
  Email,
  Dashboard,
} from '@mui/icons-material';
import {
  NotificationStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  NotificationType,
} from '../types/notification.types';
import { STATUS_COLORS, PRIORITY_COLORS } from './notificationConstants';

/**
 * Get color for notification status
 */
export const getStatusColor = (
  status: NotificationStatus
): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  return STATUS_COLORS[status] || 'default';
};

/**
 * Get label for notification status (requires translation function)
 */
export const getStatusLabel = (status: NotificationStatus, t: (key: string) => string): string => {
  const labels: Record<NotificationStatus, string> = {
    [NotificationStatus.SENT]: t('statuses.sent'),
    [NotificationStatus.DELIVERED]: t('statuses.delivered'),
    [NotificationStatus.READ]: t('statuses.read'),
    [NotificationStatus.CLICKED]: t('statuses.clicked'),
    [NotificationStatus.FAILED]: t('statuses.failed'),
    [NotificationStatus.BOUNCED]: t('statuses.bounced'),
    [NotificationStatus.REJECTED]: t('statuses.rejected'),
    [NotificationStatus.CANCELLED]: t('statuses.cancelled'),
    [NotificationStatus.PENDING]: t('statuses.pending'),
    [NotificationStatus.QUEUED]: t('statuses.queued'),
    [NotificationStatus.SENDING]: t('statuses.sending'),
  };
  return labels[status] || status;
};

/**
 * Get icon for notification status
 */
export const getStatusIcon = (status: NotificationStatus): React.ReactElement => {
  switch (status) {
    case NotificationStatus.SENT:
    case NotificationStatus.DELIVERED:
      return <CheckCircle />;
    case NotificationStatus.READ:
    case NotificationStatus.CLICKED:
      return <CheckCircle />;
    case NotificationStatus.FAILED:
    case NotificationStatus.BOUNCED:
    case NotificationStatus.REJECTED:
      return <Error />;
    case NotificationStatus.CANCELLED:
      return <Cancel />;
    case NotificationStatus.PENDING:
    case NotificationStatus.QUEUED:
      return <Pending />;
    case NotificationStatus.SENDING:
      return <Schedule />;
    default:
      return <Info />;
  }
};

/**
 * Get label for notification channel (requires translation function)
 */
export const getChannelLabel = (channel: NotificationChannel, t: (key: string) => string): string => {
  const labels: Record<NotificationChannel, string> = {
    [NotificationChannel.IN_APP]: t('channels.IN_APP'),
    [NotificationChannel.PUSH]: t('channels.PUSH'),
    [NotificationChannel.SMS]: t('channels.SMS'),
    [NotificationChannel.EMAIL]: t('channels.EMAIL'),
    [NotificationChannel.DASHBOARD]: t('channels.DASHBOARD'),
  };
  return labels[channel] || channel;
};

/**
 * Get icon for notification channel
 */
export const getChannelIcon = (channel: NotificationChannel): React.ReactElement => {
  switch (channel) {
    case NotificationChannel.IN_APP:
      return <Notifications />;
    case NotificationChannel.PUSH:
      return <PhoneAndroid />;
    case NotificationChannel.SMS:
      return <Sms />;
    case NotificationChannel.EMAIL:
      return <Email />;
    case NotificationChannel.DASHBOARD:
      return <Dashboard />;
    default:
      return <Notifications />;
  }
};

/**
 * Get color for notification priority
 */
export const getPriorityColor = (
  priority: NotificationPriority
): 'error' | 'warning' | 'info' | 'default' => {
  return PRIORITY_COLORS[priority] || 'default';
};

/**
 * Get label for notification priority (requires translation function)
 */
export const getPriorityLabel = (priority: NotificationPriority, t: (key: string) => string): string => {
  const labels: Record<NotificationPriority, string> = {
    [NotificationPriority.URGENT]: t('priorities.urgent'),
    [NotificationPriority.HIGH]: t('priorities.high'),
    [NotificationPriority.MEDIUM]: t('priorities.medium'),
    [NotificationPriority.LOW]: t('priorities.low'),
  };
  return labels[priority] || priority;
};

/**
 * Get label for notification category (requires translation function)
 */
export const getCategoryLabel = (category: NotificationCategory, t: (key: string) => string): string => {
  const labels: Record<NotificationCategory, string> = {
    [NotificationCategory.ORDER]: t('categories.ORDER'),
    [NotificationCategory.PRODUCT]: t('categories.PRODUCT'),
    [NotificationCategory.SERVICE]: t('categories.SERVICE'),
    [NotificationCategory.PROMOTION]: t('categories.PROMOTION'),
    [NotificationCategory.ACCOUNT]: t('categories.ACCOUNT'),
    [NotificationCategory.SYSTEM]: t('categories.SYSTEM'),
    [NotificationCategory.SUPPORT]: t('categories.SUPPORT'),
    [NotificationCategory.PAYMENT]: t('categories.PAYMENT'),
    [NotificationCategory.MARKETING]: t('categories.MARKETING'),
  };
  return labels[category] || category;
};

/**
 * Get label for notification type (requires translation function)
 */
export const getNotificationTypeLabel = (type: string, t: (key: string) => string): string => {
  return t(`types.${type}`) || type;
};

/**
 * Check if notification can be edited
 */
export const canEditNotification = (status: NotificationStatus): boolean => {
  return status === NotificationStatus.PENDING || status === NotificationStatus.QUEUED;
};

/**
 * Check if notification can be sent
 */
export const canSendNotification = (status: NotificationStatus): boolean => {
  return status === NotificationStatus.QUEUED || status === NotificationStatus.PENDING;
};

