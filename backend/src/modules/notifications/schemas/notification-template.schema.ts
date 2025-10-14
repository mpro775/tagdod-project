import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationTemplateDocument = HydratedDocument<NotificationTemplate>;

export enum TemplateCategory {
  ORDER = 'order',
  PRODUCT = 'product',
  PROMOTION = 'promotion',
  ACCOUNT = 'account',
  SYSTEM = 'system',
  SERVICE = 'service',
  SUPPORT = 'support',
  PAYMENT = 'payment',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ timestamps: true })
export class NotificationTemplate {
  @Prop({ required: true, unique: true, index: true })
  key!: string; // order.created, order.shipped, etc.

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  nameEn!: string;

  @Prop()
  description?: string;

  @Prop()
  descriptionEn?: string;

  @Prop({ type: String, enum: Object.values(TemplateCategory), required: true, index: true })
  category!: TemplateCategory;

  @Prop({ type: String, enum: Object.values(NotificationPriority), default: NotificationPriority.MEDIUM })
  priority!: NotificationPriority;

  // ===== Multi-Channel Templates =====
  
  // In-App Notification
  @Prop({ type: Object })
  inApp?: {
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    actionUrl?: string;
    actionText?: string;
    actionTextEn?: string;
    icon?: string;
    image?: string;
    color?: string;
  };

  // Push Notification
  @Prop({ type: Object })
  push?: {
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    sound?: string;
    badge?: number;
    data?: Record<string, unknown>;
    actionUrl?: string;
    imageUrl?: string;
  };

  // SMS
  @Prop({ type: Object })
  sms?: {
    messageAr: string;
    messageEn: string;
    senderId?: string;
  };

  // Email
  @Prop({ type: Object })
  email?: {
    subjectAr: string;
    subjectEn: string;
    htmlAr: string;
    htmlEn: string;
    textAr?: string;
    textEn?: string;
    from?: string;
    replyTo?: string;
    attachments?: Array<{
      filename: string;
      path: string;
    }>;
  };

  // ===== Variables & Placeholders =====
  @Prop({ type: [String], default: [] })
  variables!: string[]; // e.g., ['orderNumber', 'customerName', 'amount']

  @Prop({ type: Object, default: {} })
  variableDescriptions?: Record<string, string>; // { orderNumber: 'رقم الطلب' }

  // ===== Channels Configuration =====
  @Prop({ type: [String], default: ['inApp'] })
  enabledChannels!: Array<'inApp' | 'push' | 'sms' | 'email'>;

  @Prop({ default: true })
  isActive!: boolean;

  // ===== Targeting & Conditions =====
  @Prop({ type: [String], default: [] })
  targetRoles?: string[]; // ['customer', 'admin', 'engineer']

  @Prop({ type: [String], default: [] })
  targetUserIds?: string[]; // Specific user IDs

  @Prop({ type: Object })
  conditions?: {
    minOrderAmount?: number;
    maxOrderAmount?: number;
    orderStatus?: string[];
    productCategories?: string[];
    customConditions?: Record<string, unknown>;
  };

  // ===== Scheduling =====
  @Prop({ type: Object })
  scheduling?: {
    delayMinutes?: number; // Delay notification by X minutes
    sendAfterEvent?: string; // Send after specific event
    sendAt?: string; // Specific time (HH:mm format)
    timezone?: string;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  };

  // ===== Rate Limiting =====
  @Prop({ type: Object })
  rateLimiting?: {
    maxPerUser?: number; // Max notifications per user
    maxPerUserPerDay?: number;
    cooldownMinutes?: number; // Cooldown between notifications
  };

  // ===== Analytics & Tracking =====
  @Prop({ type: Object, default: {} })
  stats!: {
    totalSent: number;
    totalRead: number;
    totalClicked: number;
    totalFailed: number;
    lastSentAt?: Date;
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
    version?: number;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);

// Indexes
NotificationTemplateSchema.index({ key: 1 }, { unique: true });
NotificationTemplateSchema.index({ category: 1, isActive: 1 });
NotificationTemplateSchema.index({ isActive: 1, priority: 1 });
NotificationTemplateSchema.index({ 'stats.totalSent': -1 });
NotificationTemplateSchema.index({ createdAt: -1 });

