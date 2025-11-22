/**
 * Unified Notification Interfaces
 * واجهات موحدة للإشعارات
 */

import { Types } from 'mongoose';
import { 
  NotificationType, 
  NotificationStatus, 
  NotificationChannel, 
  NotificationPriority,
  NotificationCategory,
  DevicePlatform 
} from '../enums/notification.enums';

// ===== Core Notification Interface =====
export interface INotification {
  _id?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  messageEn: string;
  data: Record<string, unknown>;
  actionUrl?: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  category: NotificationCategory;
  
  // Recipient information
  recipientId?: Types.ObjectId;
  recipientEmail?: string;
  recipientPhone?: string;
  
  // Template information
  templateId?: Types.ObjectId;
  templateKey?: string;
  
  // Timing
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  failedAt?: Date;
  
  // Error handling
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  nextRetryAt?: Date;
  
  // Tracking
  trackingId?: string;
  externalId?: string;
  
  // Metadata
  metadata: {
    provider?: string;
    cost?: number;
    credits?: number;
    campaign?: string;
    tags?: string[];
    userAgent?: string;
    ipAddress?: string;
  };
  
  // System fields
  createdBy?: Types.ObjectId;
  isSystemGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Notification Template Interface =====
export interface INotificationTemplate {
  _id?: Types.ObjectId;
  name: string;
  key: string;
  title: string;
  message: string;
  messageEn: string;
  template?: string;
  
  // Channels
  channels: {
    inApp: boolean;
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  
  // Classification
  type: string;
  category: NotificationCategory;
  description?: string;
  isActive: boolean;
  
  // Variables
  variables?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    defaultValue?: unknown;
    description?: string;
  }>;
  
  // Usage tracking
  usageCount: number;
  lastUsedAt?: Date;
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
}

// ===== User Preferences Interface =====
export interface INotificationPreference {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  
  // Global settings
  enableNotifications: boolean;
  enableInApp: boolean;
  enablePush: boolean;
  enableSms: boolean;
  enableEmail: boolean;
  
  // Quiet hours
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    days: number[];
  };
  
  // Category preferences
  categoryPreferences: Record<NotificationCategory, {
    inApp: boolean;
    push: boolean;
    sms: boolean;
    email: boolean;
  }>;
  
  // Specific settings
  mutedTemplates: string[];
  priorityTemplates: string[];
  
  // Delivery preferences
  deliveryPreferences: {
    groupNotifications: boolean;
    batchInterval?: number;
    instantDelivery: boolean;
  };
  
  // Contact preferences
  preferredEmail?: string;
  preferredPhone?: string;
  preferredLanguage: 'ar' | 'en';
  
  // Marketing preferences
  receiveMarketingEmails: boolean;
  receiveMarketingSms: boolean;
  receivePromotionalPush: boolean;
  receiveNewsletter: boolean;
  
  // Frequency limits
  frequencyLimits: {
    maxNotificationsPerDay?: number;
    maxEmailsPerWeek?: number;
    maxSmsPerMonth?: number;
    maxPushPerHour?: number;
  };
  
  // System fields
  lastModifiedAt?: Date;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Device Token Interface =====
export interface IDeviceToken {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  platform: DevicePlatform;
  userAgent?: string;
  appVersion?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===== Notification Log Interface =====
export interface INotificationLog {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  notificationId: Types.ObjectId;
  templateId?: Types.ObjectId;
  templateKey: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  
  // Content
  title: string;
  body: string;
  data: Record<string, unknown>;
  actionUrl?: string;
  imageUrl?: string;
  
  // Delivery info
  recipientEmail?: string;
  recipientPhone?: string;
  deviceToken?: string;
  platform?: DevicePlatform;
  
  // Timestamps
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  failedAt?: Date;
  
  // Error handling
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  nextRetryAt?: Date;
  
  // Tracking
  trackingId?: string;
  externalId?: string;
  
  // Metadata
  metadata: {
    provider?: string;
    providerResponse?: Record<string, unknown>;
    cost?: number;
    credits?: number;
    campaign?: string;
    tags?: string[];
  };
  
  // Priority & Grouping
  priority: NotificationPriority;
  groupId?: string;
  batchId?: string;
  
  // User interaction
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
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
}

// ===== Service Interfaces =====
export interface INotificationService {
  createNotification(dto: CreateNotificationDto): Promise<INotification>;
  getUserNotifications(userId: string, limit?: number, offset?: number): Promise<{
    notifications: INotification[];
    total: number;
  }>;
  markAsRead(notificationId: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
  deleteOldNotifications(olderThanDays?: number): Promise<number>;
}

export interface INotificationTemplateService {
  getTemplates(): Promise<INotificationTemplate[]>;
  getTemplateById(id: string): Promise<INotificationTemplate>;
  createTemplate(dto: CreateTemplateDto): Promise<INotificationTemplate>;
  updateTemplate(id: string, dto: UpdateTemplateDto): Promise<INotificationTemplate>;
  deleteTemplate(id: string): Promise<boolean>;
  renderTemplate(templateKey: string, data: Record<string, unknown>): Promise<{
    title: string;
    message: string;
    messageEn: string;
  }>;
}

export interface INotificationPreferenceService {
  getUserPreferences(userId: string): Promise<INotificationPreference>;
  updateUserPreferences(userId: string, dto: UpdatePreferenceDto): Promise<INotificationPreference>;
  createDefaultPreferences(userId: string): Promise<INotificationPreference>;
}

// ===== DTO Interfaces =====
export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  messageEn: string;
  actionUrl?: string;
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
}

export interface CreateTemplateDto {
  name: string;
  key: string;
  title: string;
  message: string;
  messageEn: string;
  template?: string;
  channels: {
    inApp: boolean;
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  type: string;
  category: NotificationCategory;
  description?: string;
  variables?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    defaultValue?: unknown;
    description?: string;
  }>;
}

export interface UpdateTemplateDto {
  name?: string;
  title?: string;
  message?: string;
  messageEn?: string;
  template?: string;
  channels?: {
    inApp?: boolean;
    push?: boolean;
    sms?: boolean;
    email?: boolean;
  };
  description?: string;
  isActive?: boolean;
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
  categoryPreferences?: Partial<Record<NotificationCategory, {
    inApp?: boolean;
    push?: boolean;
    sms?: boolean;
    email?: boolean;
  }>>;
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
