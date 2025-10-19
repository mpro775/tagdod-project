/**
 * Notification Ports (Interfaces)
 * واجهات للفصل بين الطبقات
 */

import { NotificationChannel, NotificationPriority } from '../enums/notification.enums';

// ===== Core Notification Port =====
export interface INotificationPort {
  send(notification: NotificationData): Promise<NotificationResult>;
  sendBulk(notifications: NotificationData[]): Promise<BulkNotificationResult>;
  getStatus(notificationId: string): Promise<NotificationStatus>;
  cancel(notificationId: string): Promise<boolean>;
}

// ===== Channel-specific Ports =====
export interface IInAppNotificationPort {
  send(notification: InAppNotificationData): Promise<InAppNotificationResult>;
  markAsRead(notificationId: string, userId: string): Promise<boolean>;
  markAsDelivered(notificationId: string): Promise<boolean>;
}

export interface IPushNotificationPort {
  send(notification: PushNotificationData): Promise<PushNotificationResult>;
  sendToDevice(deviceToken: string, notification: PushNotificationData): Promise<PushNotificationResult>;
  sendToTopic(topic: string, notification: PushNotificationData): Promise<PushNotificationResult>;
}

export interface IEmailNotificationPort {
  send(notification: EmailNotificationData): Promise<EmailNotificationResult>;
  sendBulk(notifications: EmailNotificationData[]): Promise<BulkEmailNotificationResult>;
  getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus>;
}

export interface ISmsNotificationPort {
  send(notification: SmsNotificationData): Promise<SmsNotificationResult>;
  sendBulk(notifications: SmsNotificationData[]): Promise<BulkSmsNotificationResult>;
  getDeliveryStatus(messageId: string): Promise<SmsDeliveryStatus>;
}

// ===== Data Transfer Objects =====
export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  messageEn: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  data?: Record<string, unknown>;
  scheduledFor?: Date;
  templateKey?: string;
}

export interface InAppNotificationData extends NotificationData {
  recipientId: string;
  actionUrl?: string;
  imageUrl?: string;
  expiresAt?: Date;
}

export interface PushNotificationData extends NotificationData {
  deviceToken?: string;
  topic?: string;
  actionUrl?: string;
  imageUrl?: string;
  sound?: string;
  badge?: number;
  data?: Record<string, unknown>;
}

export interface EmailNotificationData extends NotificationData {
  recipientEmail: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  attachments?: EmailAttachment[];
}

export interface SmsNotificationData extends NotificationData {
  recipientPhone: string;
  message: string;
  senderId?: string;
}

// ===== Result Objects =====
export interface NotificationResult {
  success: boolean;
  notificationId: string;
  externalId?: string;
  error?: string;
  cost?: number;
  credits?: number;
  metadata?: Record<string, unknown>;
}

export interface BulkNotificationResult {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  results: NotificationResult[];
  totalCost?: number;
  totalCredits?: number;
}

export interface InAppNotificationResult extends NotificationResult {
  deliveredAt?: Date;
  readAt?: Date;
}

export interface PushNotificationResult extends NotificationResult {
  deliveredAt?: Date;
  clickedAt?: Date;
  platform?: string;
}

export interface EmailNotificationResult extends NotificationResult {
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  provider?: string;
}

export interface SmsNotificationResult extends NotificationResult {
  deliveredAt?: Date;
  provider?: string;
  cost?: number;
}

export interface BulkEmailNotificationResult extends BulkNotificationResult {
  results: EmailNotificationResult[];
}

export interface BulkSmsNotificationResult extends BulkNotificationResult {
  results: SmsNotificationResult[];
}

// ===== Status Objects =====
export interface NotificationStatus {
  id: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
}

export interface EmailDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  errorMessage?: string;
}

export interface SmsDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed';
  deliveredAt?: Date;
  errorMessage?: string;
  cost?: number;
}

// ===== Additional Interfaces =====
export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  cid?: string;
}

export interface NotificationProvider {
  name: string;
  type: 'email' | 'sms' | 'push' | 'inapp';
  isActive: boolean;
  priority: number;
  costPerMessage?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  features: string[];
}

export interface NotificationQueue {
  enqueue(notification: NotificationData): Promise<string>;
  dequeue(): Promise<NotificationData | null>;
  getQueueStatus(): Promise<QueueStatus>;
  clearQueue(): Promise<number>;
}

export interface QueueStatus {
  total: number;
  pending: number;
  processing: number;
  failed: number;
  completed: number;
}

// ===== Configuration Interfaces =====
export interface NotificationConfig {
  providers: NotificationProvider[];
  retryPolicy: RetryPolicy;
  rateLimiting: RateLimitingConfig;
  monitoring: MonitoringConfig;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number; // in milliseconds
  exponentialBackoff: boolean;
  retryableErrors: string[];
}

export interface RateLimitingConfig {
  enabled: boolean;
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
  burstLimit: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsEndpoint?: string;
  alertThresholds: {
    failureRate: number;
    responseTime: number;
    queueSize: number;
  };
}
