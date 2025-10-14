import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationLogDocument = HydratedDocument<NotificationLog>;

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
}

@Schema({ timestamps: true })
export class NotificationLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'NotificationTemplate', index: true })
  templateId?: Types.ObjectId;

  @Prop({ index: true })
  templateKey!: string;

  @Prop({ required: true, index: true })
  channel!: 'inApp' | 'push' | 'sms' | 'email';

  @Prop({ type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.PENDING, index: true })
  status!: NotificationStatus;

  // ===== Content =====
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ type: Object, default: {} })
  data!: Record<string, unknown>; // Additional data/payload

  @Prop()
  actionUrl?: string;

  @Prop()
  imageUrl?: string;

  // ===== Delivery Information =====
  @Prop()
  recipientEmail?: string;

  @Prop()
  recipientPhone?: string;

  @Prop()
  deviceToken?: string;

  @Prop()
  platform?: 'ios' | 'android' | 'web';

  // ===== Timestamps =====
  @Prop({ type: Date })
  scheduledAt?: Date;

  @Prop({ type: Date, index: true })
  sentAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: Date })
  clickedAt?: Date;

  @Prop({ type: Date })
  failedAt?: Date;

  // ===== Error Handling =====
  @Prop()
  errorMessage?: string;

  @Prop()
  errorCode?: string;

  @Prop({ default: 0 })
  retryCount!: number;

  @Prop({ type: Date })
  nextRetryAt?: Date;

  // ===== Tracking =====
  @Prop()
  trackingId?: string; // Unique ID for tracking across services

  @Prop()
  externalId?: string; // ID from external service (e.g., SendGrid, Twilio)

  @Prop({ type: Object, default: {} })
  metadata!: {
    provider?: string; // SMS/Email provider name
    providerResponse?: Record<string, unknown>;
    cost?: number; // Cost of sending (e.g., SMS cost)
    credits?: number; // Credits consumed
    campaign?: string;
    tags?: string[];
  };

  // ===== Priority & Grouping =====
  @Prop({ type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;

  @Prop()
  groupId?: string; // For grouping related notifications

  @Prop()
  batchId?: string; // For batch sending

  // ===== User Interaction =====
  @Prop()
  dismissedAt?: Date;

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({ type: Object })
  interaction?: {
    opened: boolean;
    clicked: boolean;
    converted: boolean;
    conversionValue?: number;
    clickCount?: number;
    lastInteractionAt?: Date;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);

// Indexes for performance
NotificationLogSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationLogSchema.index({ templateKey: 1, channel: 1, createdAt: -1 });
NotificationLogSchema.index({ status: 1, scheduledAt: 1 });
NotificationLogSchema.index({ status: 1, sentAt: -1 }, { sparse: true });
NotificationLogSchema.index({ channel: 1, status: 1, createdAt: -1 });
NotificationLogSchema.index({ trackingId: 1 }, { sparse: true, unique: true });
NotificationLogSchema.index({ groupId: 1 }, { sparse: true });
NotificationLogSchema.index({ batchId: 1 }, { sparse: true });
NotificationLogSchema.index({ createdAt: -1 });
NotificationLogSchema.index({ readAt: 1 }, { sparse: true });

// TTL Index: Auto-delete old notifications after 90 days
NotificationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

