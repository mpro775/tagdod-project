import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Enums matching backend
export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_REFUNDED = 'ORDER_REFUNDED',
  ORDER_RATED = 'ORDER_RATED',
  SERVICE_REQUEST_OPENED = 'SERVICE_REQUEST_OPENED',
  NEW_ENGINEER_OFFER = 'NEW_ENGINEER_OFFER',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  SERVICE_RATED = 'SERVICE_RATED',
  SERVICE_REQUEST_CANCELLED = 'SERVICE_REQUEST_CANCELLED',
  PRODUCT_BACK_IN_STOCK = 'PRODUCT_BACK_IN_STOCK',
  PRODUCT_PRICE_DROP = 'PRODUCT_PRICE_DROP',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PROMOTION_STARTED = 'PROMOTION_STARTED',
  PROMOTION_ENDING = 'PROMOTION_ENDING',
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  NEW_USER_REGISTERED = 'NEW_USER_REGISTERED',
  VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED = 'VERIFICATION_REJECTED',
  VERIFICATION_REQUEST_PENDING = 'VERIFICATION_REQUEST_PENDING',
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_UPDATED = 'TICKET_UPDATED',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  SUPPORT_MESSAGE_RECEIVED = 'SUPPORT_MESSAGE_RECEIVED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  NEW_FEATURE = 'NEW_FEATURE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  WELCOME_NEW_USER = 'WELCOME_NEW_USER',
  BIRTHDAY_GREETING = 'BIRTHDAY_GREETING',
  CART_ABANDONMENT = 'CART_ABANDONMENT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  INVOICE_CREATED = 'INVOICE_CREATED',
  COUPON_USED = 'COUPON_USED',
}

export enum NotificationStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  CLICKED = 'clicked',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum NotificationChannel {
  IN_APP = 'inApp',
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  DASHBOARD = 'dashboard',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  ORDER = 'order',
  PRODUCT = 'product',
  SERVICE = 'service',
  PROMOTION = 'promotion',
  ACCOUNT = 'account',
  SYSTEM = 'system',
  SUPPORT = 'support',
  PAYMENT = 'payment',
  MARKETING = 'marketing',
}

export enum NotificationNavigationType {
  NONE = 'none',
  EXTERNAL_URL = 'external_url',
  CATEGORY = 'category',
  PRODUCT = 'product',
  SECTION = 'section',
  ORDER = 'order',
  SERVICE_REQUEST = 'service_request',
}

export interface Notification extends BaseEntity {
  userId?: string;
  notificationId?: string;
  templateId?: string;
  templateKey: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  messageEn: string;
  data: Record<string, unknown>;
  actionUrl?: string;
  navigationType?: NotificationNavigationType;
  navigationTarget?: string;
  navigationParams?: Record<string, unknown>;
  imageUrl?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  deviceToken?: string;
  platform?: 'ios' | 'android' | 'web';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  nextRetryAt?: Date;
  trackingId?: string;
  externalId?: string;
  metadata: {
    provider?: string;
    providerResponse?: Record<string, unknown>;
    cost?: number;
    credits?: number;
    campaign?: string;
    tags?: string[];
  };
  groupId?: string;
  batchId?: string;
  dismissedAt?: Date;
  isArchived: boolean;
  interaction?: {
    opened: boolean;
    clicked: boolean;
    converted: boolean;
    conversionValue?: number;
    clickCount?: number;
    lastInteractionAt?: Date;
  };
  // Populated fields
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

/**
 * API response format for templates (backend returns id, name, description, category, variables[])
 */
export interface ApiTemplateResponse {
  id: string;
  name: string;
  description?: string;
  category: string;
  variables?: string[];
}

export interface NotificationTemplate {
  _id?: string;
  id?: string;
  name: string;
  key: string;
  title: string;
  body: string;
  message: string;
  messageEn: string;
  template?: string;
  channels?: {
    inApp: boolean;
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  type?: string;
  category: NotificationCategory | string;
  description?: string;
  hasLink?: boolean;
  variables?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'date';
      required: boolean;
      defaultValue?: unknown;
      description?: string;
    }
  > | string[];
  exampleData?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  messageEn: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  templateKey?: string;
  scheduledFor?: Date;
  createdBy?: string;
  isSystemGenerated?: boolean;
  actionUrl?: string;
  navigationType?: NotificationNavigationType;
  navigationTarget?: string;
  navigationParams?: Record<string, unknown>;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  messageEn?: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  scheduledFor?: Date;
  actionUrl?: string;
  navigationType?: NotificationNavigationType;
  navigationTarget?: string;
  navigationParams?: Record<string, unknown>;
}

export interface SendNotificationDto {
  targetUsers?: string[];
  scheduledAt?: string;
}

export interface BulkSendNotificationDto extends CreateNotificationDto {
  targetUserIds: string[];
}

export interface NotificationDeliveryLog {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: NotificationStatus;
  channel: NotificationChannel;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  errorCode?: string;
  deviceToken?: string;
  platform?: string;
  createdAt: Date;
}

export interface NotificationDeliveryDetails {
  notification: Notification | null;
  logs: NotificationDeliveryLog[];
  summary: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
}

export interface ListNotificationsParams extends ListParams {
  recipientId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  search?: string;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  queued: number;
  read: number;
  recent24h: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byChannel: Record<string, number>;
  byCategory: Record<string, number>;
  unreadCount: number;
  readRate: number;
  deliveryRate: number;
}

export interface NotificationStatsParams {
  startDate?: string;
  endDate?: string;
  channel?: NotificationChannel;
  category?: NotificationCategory;
  userId?: string;
}

export interface MarkAsReadDto {
  notificationIds: string[];
}

/**
 * Create template DTO - matches backend API (key, title, message, messageEn, type - no channels)
 */
export interface CreateTemplateDto {
  key: string;
  title: string;
  message: string;
  messageEn: string;
  type: string;
}

/**
 * Update template DTO - matches backend API
 */
export interface UpdateTemplateDto {
  title?: string;
  message?: string;
  messageEn?: string;
  type?: string;
}

export interface UpdatePreferenceDto {
  enableNotifications?: boolean;
  enableInApp?: boolean;
  enablePush?: boolean;
  enableSms?: boolean;
  enableEmail?: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    days: number[];
  };
  categoryPreferences?: Partial<
    Record<
      NotificationCategory,
      {
        inApp?: boolean;
        push?: boolean;
        sms?: boolean;
        email?: boolean;
      }
    >
  >;
  mutedTemplates?: string[];
  priorityTemplates?: string[];
  deliveryPreferences?: {
    groupNotifications?: boolean;
    batchInterval?: number;
    instantDelivery?: boolean;
  };
  preferredEmail?: string;
  preferredPhone?: string;
  preferredLanguage?: 'ar' | 'en';
  receiveMarketingEmails?: boolean;
  receiveMarketingSms?: boolean;
  receivePromotionalPush?: boolean;
  receiveNewsletter?: boolean;
  frequencyLimits?: {
    maxNotificationsPerDay?: number;
    maxEmailsPerWeek?: number;
    maxSmsPerMonth?: number;
    maxPushPerHour?: number;
  };
}

export interface RegisterDeviceDto {
  platform: 'ios' | 'android' | 'web';
  token: string;
  userAgent?: string;
  appVersion?: string;
}

export interface UpdateDeviceTokenDto {
  token?: string;
  isActive?: boolean;
}

// ===== Channel Config Types =====
export interface NotificationChannelConfig extends BaseEntity {
  notificationType: NotificationType;
  allowedChannels: NotificationChannel[];
  defaultChannel: NotificationChannel;
  targetRoles: string[];
  isActive: boolean;
  updatedBy?: string;
}

export interface CreateChannelConfigDto {
  notificationType: NotificationType;
  allowedChannels: NotificationChannel[];
  defaultChannel: NotificationChannel;
  targetRoles: string[];
  isActive?: boolean;
}

export interface UpdateChannelConfigDto {
  allowedChannels?: NotificationChannel[];
  defaultChannel?: NotificationChannel;
  targetRoles?: string[];
  isActive?: boolean;
}

export interface InitializeChannelConfigsResponse {
  created: number;
  updated: number;
}

// ===== Navigation Type Options =====
export const NOTIFICATION_NAVIGATION_TYPE_OPTIONS = [
  { value: NotificationNavigationType.NONE, label: 'بدون تنقل' },
  { value: NotificationNavigationType.EXTERNAL_URL, label: 'رابط خارجي' },
  { value: NotificationNavigationType.CATEGORY, label: 'فئة' },
  { value: NotificationNavigationType.PRODUCT, label: 'منتج' },
  { value: NotificationNavigationType.SECTION, label: 'قسم في التطبيق' },
  { value: NotificationNavigationType.ORDER, label: 'طلب' },
  { value: NotificationNavigationType.SERVICE_REQUEST, label: 'طلب خدمة' },
];