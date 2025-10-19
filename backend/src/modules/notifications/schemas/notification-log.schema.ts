import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { 
  NotificationStatus, 
  NotificationChannel, 
  NotificationPriority,
  DevicePlatform 
} from '../enums/notification.enums';

export type NotificationLogDocument = HydratedDocument<NotificationLog>;

@Schema({ 
  timestamps: true,
  collection: 'notification_logs',
  versionKey: false
})
export class NotificationLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UnifiedNotification', index: true })
  notificationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'NotificationTemplate', index: true })
  templateId?: Types.ObjectId;

  @Prop({ maxlength: 100, index: true })
  templateKey!: string;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationChannel), 
    required: true,
    index: true 
  })
  channel!: NotificationChannel;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationStatus), 
    default: NotificationStatus.PENDING,
    index: true 
  })
  status!: NotificationStatus;

  // ===== Content =====
  @Prop({ required: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, maxlength: 1000 })
  body!: string;

  @Prop({ type: Object, default: {} })
  data!: Record<string, unknown>;

  @Prop({ maxlength: 500 })
  actionUrl?: string;

  @Prop({ maxlength: 500 })
  imageUrl?: string;

  // ===== Delivery Information =====
  @Prop({ maxlength: 255 })
  recipientEmail?: string;

  @Prop({ maxlength: 20 })
  recipientPhone?: string;

  @Prop({ maxlength: 500 })
  deviceToken?: string;

  @Prop({ 
    type: String, 
    enum: Object.values(DevicePlatform) 
  })
  platform?: DevicePlatform;

  // ===== Timestamps =====
  @Prop({ type: Date, index: true })
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
  @Prop({ maxlength: 500 })
  errorMessage?: string;

  @Prop({ maxlength: 50 })
  errorCode?: string;

  @Prop({ default: 0, min: 0, max: 5 })
  retryCount!: number;

  @Prop({ type: Date })
  nextRetryAt?: Date;

  // ===== Tracking =====
  @Prop({ maxlength: 100, unique: true, sparse: true })
  trackingId?: string;

  @Prop({ maxlength: 100 })
  externalId?: string;

  @Prop({ 
    type: Object, 
    default: {} 
  })
  metadata!: {
    provider?: string;
    providerResponse?: Record<string, unknown>;
    cost?: number;
    credits?: number;
    campaign?: string;
    tags?: string[];
  };

  // ===== Priority & Grouping =====
  @Prop({ 
    type: String, 
    enum: Object.values(NotificationPriority), 
    default: NotificationPriority.MEDIUM 
  })
  priority!: NotificationPriority;

  @Prop({ maxlength: 100 })
  groupId?: string;

  @Prop({ maxlength: 100 })
  batchId?: string;

  // ===== User Interaction =====
  @Prop({ type: Date })
  dismissedAt?: Date;

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({ 
    type: Object 
  })
  interaction?: {
    opened: boolean;
    clicked: boolean;
    converted: boolean;
    conversionValue?: number;
    clickCount?: number;
    lastInteractionAt?: Date;
  };

  // System fields
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

// TTL Index: Auto-delete old logs after 90 days
NotificationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days