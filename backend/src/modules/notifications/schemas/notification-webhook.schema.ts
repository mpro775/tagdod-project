import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationWebhookDocument = HydratedDocument<NotificationWebhook>;

export enum WebhookEvent {
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_DELIVERED = 'notification.delivered',
  NOTIFICATION_READ = 'notification.read',
  NOTIFICATION_CLICKED = 'notification.clicked',
  NOTIFICATION_FAILED = 'notification.failed',
  NOTIFICATION_BOUNCED = 'notification.bounced',
}

@Schema({ timestamps: true })
export class NotificationWebhook {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ type: [String], enum: Object.values(WebhookEvent), required: true })
  events!: WebhookEvent[];

  @Prop({ default: true })
  isActive!: boolean;

  // ===== Authentication =====
  @Prop({ type: Object })
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'hmac';
    username?: string;
    password?: string;
    token?: string;
    secret?: string;
  };

  // ===== Filters =====
  @Prop({ type: Object })
  filters?: {
    channels?: Array<'inApp' | 'push' | 'sms' | 'email'>;
    templateKeys?: string[];
    userIds?: string[];
    minPriority?: string;
  };

  // ===== Retry Configuration =====
  @Prop({ type: Object, default: { enabled: true, maxAttempts: 3, backoffMultiplier: 2 } })
  retryConfig!: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number; // Exponential backoff
    initialDelaySeconds: number;
  };

  // ===== Headers =====
  @Prop({ type: Object, default: {} })
  customHeaders?: Record<string, string>;

  // ===== Statistics =====
  @Prop({ type: Object, default: { totalCalls: 0, successfulCalls: 0, failedCalls: 0 } })
  stats!: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    lastCallAt?: Date;
    lastSuccessAt?: Date;
    lastFailureAt?: Date;
    averageResponseTime?: number; // in ms
  };

  // ===== Health Check =====
  @Prop({ type: Object })
  healthCheck?: {
    enabled: boolean;
    lastCheckAt?: Date;
    lastStatus?: 'healthy' | 'unhealthy';
    consecutiveFailures: number;
  };

  // ===== Metadata =====
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  metadata?: {
    tags?: string[];
    notes?: string;
    environment?: 'development' | 'staging' | 'production';
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationWebhookSchema = SchemaFactory.createForClass(NotificationWebhook);

// Indexes
NotificationWebhookSchema.index({ isActive: 1, events: 1 });
NotificationWebhookSchema.index({ createdAt: -1 });
NotificationWebhookSchema.index({ 'stats.lastCallAt': -1 });

