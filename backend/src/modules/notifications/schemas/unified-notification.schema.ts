import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  NotificationType,
  NotificationStatus,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  NotificationNavigationType,
} from '../enums/notification.enums';
import { UserRole } from '../../users/schemas/user.schema';

export type UnifiedNotificationDocument = HydratedDocument<UnifiedNotification>;

@Schema({
  timestamps: true,
  collection: 'notifications',
  versionKey: false,
})
export class UnifiedNotification {
  @Prop({ required: true, enum: Object.values(NotificationType), index: true })
  type!: NotificationType;

  @Prop({ required: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, maxlength: 1000 })
  message!: string;

  @Prop({ required: true, maxlength: 1000 })
  messageEn!: string;

  @Prop({ type: Object, default: {} })
  data!: Record<string, unknown>;

  @Prop({ maxlength: 500 })
  actionUrl?: string;

  // ===== Navigation Settings =====
  @Prop({
    type: String,
    enum: Object.values(NotificationNavigationType),
    default: NotificationNavigationType.NONE,
  })
  navigationType!: NotificationNavigationType;

  @Prop({ maxlength: 500 })
  navigationTarget?: string; // Category ID, Product ID, Order ID, Section name, or external URL

  @Prop({ type: Object })
  navigationParams?: Record<string, unknown>; // Additional parameters for navigation

  @Prop({
    type: String,
    enum: Object.values(NotificationChannel),
    default: NotificationChannel.IN_APP,
    index: true,
  })
  channel!: NotificationChannel;

  @Prop({
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING,
    index: true,
  })
  status!: NotificationStatus;

  @Prop({
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM,
  })
  priority!: NotificationPriority;

  @Prop({
    type: String,
    enum: Object.values(NotificationCategory),
    required: true,
    index: true,
  })
  category!: NotificationCategory;

  // ===== Target Roles =====
  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    default: [],
    index: true,
  })
  targetRoles!: UserRole[];

  // ===== Recipient Information =====
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  recipientId?: Types.ObjectId;

  @Prop({ maxlength: 255 })
  recipientEmail?: string;

  @Prop({ maxlength: 20 })
  recipientPhone?: string;

  // ===== Template Information =====
  @Prop({ type: Types.ObjectId, ref: 'NotificationTemplate' })
  templateId?: Types.ObjectId;

  @Prop({ maxlength: 100, index: true })
  templateKey?: string;

  // ===== Timing =====
  @Prop({ type: Date, index: true })
  scheduledFor?: Date;

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

  // ===== Analytics =====
  @Prop({ type: Number, default: 0 })
  openCount!: number;

  @Prop({ type: Number, default: 0 })
  clickCount!: number;

  @Prop({
    type: [
      {
        url: { type: String, maxlength: 500 },
        buttonId: { type: String, maxlength: 50 },
        clickedAt: { type: Date },
      },
    ],
    default: [],
  })
  clickHistory!: Array<{
    url: string;
    buttonId?: string;
    clickedAt: Date;
  }>;

  // ===== Metadata =====
  @Prop({
    type: Object,
    default: {},
  })
  metadata!: {
    provider?: string;
    cost?: number;
    credits?: number;
    campaign?: string;
    tags?: string[];
    userAgent?: string;
    ipAddress?: string;
  };

  // ===== System Fields =====
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ default: false })
  isSystemGenerated!: boolean;

  // ===== Timestamps (handled by timestamps: true) =====
  createdAt?: Date;
  updatedAt?: Date;
}

export const UnifiedNotificationSchema = SchemaFactory.createForClass(UnifiedNotification);

// ===== Indexes for Performance =====
UnifiedNotificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
UnifiedNotificationSchema.index({ type: 1, status: 1, createdAt: -1 });
UnifiedNotificationSchema.index({ channel: 1, status: 1, createdAt: -1 });
UnifiedNotificationSchema.index({ category: 1, status: 1, createdAt: -1 });
UnifiedNotificationSchema.index({ status: 1, scheduledFor: 1 });
UnifiedNotificationSchema.index({ trackingId: 1 }, { sparse: true, unique: true });
UnifiedNotificationSchema.index({ templateKey: 1, channel: 1 });
UnifiedNotificationSchema.index({ createdAt: -1 });
UnifiedNotificationSchema.index({ readAt: 1 }, { sparse: true });
UnifiedNotificationSchema.index({ targetRoles: 1, recipientId: 1 });
UnifiedNotificationSchema.index({ targetRoles: 1, status: 1 });

// ===== TTL Index: Auto-delete old notifications after 90 days =====
UnifiedNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// ===== Virtual Fields =====
UnifiedNotificationSchema.virtual('isRead').get(function () {
  return this.status === NotificationStatus.READ;
});

UnifiedNotificationSchema.virtual('isDelivered').get(function () {
  return this.status === NotificationStatus.DELIVERED;
});

UnifiedNotificationSchema.virtual('isFailed').get(function () {
  return this.status === NotificationStatus.FAILED;
});

// ===== Methods =====
UnifiedNotificationSchema.methods.markAsRead = function () {
  this.status = NotificationStatus.READ;
  this.readAt = new Date();
  return this.save();
};

UnifiedNotificationSchema.methods.markAsDelivered = function () {
  this.status = NotificationStatus.DELIVERED;
  this.deliveredAt = new Date();
  return this.save();
};

UnifiedNotificationSchema.methods.markAsFailed = function (
  errorMessage: string,
  errorCode?: string,
) {
  this.status = NotificationStatus.FAILED;
  this.failedAt = new Date();
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  this.retryCount += 1;
  return this.save();
};

// ===== Pre-save Middleware =====
UnifiedNotificationSchema.pre('save', function (next) {
  // Auto-generate tracking ID if not provided
  if (!this.trackingId) {
    this.trackingId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set category based on type if not provided
  if (!this.category) {
    const typeToCategoryMap: Record<NotificationType, NotificationCategory> = {
      [NotificationType.ORDER_CREATED]: NotificationCategory.ORDER,
      [NotificationType.ORDER_CONFIRMED]: NotificationCategory.ORDER,
      [NotificationType.ORDER_CANCELLED]: NotificationCategory.ORDER,
      [NotificationType.ORDER_REFUNDED]: NotificationCategory.ORDER,
      [NotificationType.ORDER_RATED]: NotificationCategory.ORDER,
      [NotificationType.SERVICE_REQUEST_OPENED]: NotificationCategory.SERVICE,
      [NotificationType.NEW_ENGINEER_OFFER]: NotificationCategory.SERVICE,
      [NotificationType.OFFER_ACCEPTED]: NotificationCategory.SERVICE,
      [NotificationType.OFFER_REJECTED]: NotificationCategory.SERVICE,
      [NotificationType.OFFER_CANCELLED]: NotificationCategory.SERVICE,
      [NotificationType.SERVICE_STARTED]: NotificationCategory.SERVICE,
      [NotificationType.SERVICE_COMPLETED]: NotificationCategory.SERVICE,
      [NotificationType.SERVICE_RATED]: NotificationCategory.SERVICE,
      [NotificationType.SERVICE_REQUEST_CANCELLED]: NotificationCategory.SERVICE,
      [NotificationType.PRODUCT_BACK_IN_STOCK]: NotificationCategory.PRODUCT,
      [NotificationType.PRODUCT_PRICE_DROP]: NotificationCategory.PRODUCT,
      [NotificationType.LOW_STOCK]: NotificationCategory.PRODUCT,
      [NotificationType.OUT_OF_STOCK]: NotificationCategory.PRODUCT,
      [NotificationType.PROMOTION_STARTED]: NotificationCategory.PROMOTION,
      [NotificationType.PROMOTION_ENDING]: NotificationCategory.PROMOTION,
      [NotificationType.ACCOUNT_VERIFIED]: NotificationCategory.ACCOUNT,
      [NotificationType.PASSWORD_CHANGED]: NotificationCategory.ACCOUNT,
      [NotificationType.LOGIN_ATTEMPT]: NotificationCategory.ACCOUNT,
      [NotificationType.NEW_USER_REGISTERED]: NotificationCategory.ACCOUNT,
      [NotificationType.VERIFICATION_APPROVED]: NotificationCategory.ACCOUNT,
      [NotificationType.VERIFICATION_REJECTED]: NotificationCategory.ACCOUNT,
      [NotificationType.TICKET_CREATED]: NotificationCategory.SUPPORT,
      [NotificationType.TICKET_UPDATED]: NotificationCategory.SUPPORT,
      [NotificationType.TICKET_RESOLVED]: NotificationCategory.SUPPORT,
      [NotificationType.SUPPORT_MESSAGE_RECEIVED]: NotificationCategory.SUPPORT,
      [NotificationType.SYSTEM_MAINTENANCE]: NotificationCategory.SYSTEM,
      [NotificationType.NEW_FEATURE]: NotificationCategory.SYSTEM,
      [NotificationType.SYSTEM_ALERT]: NotificationCategory.SYSTEM,
      [NotificationType.WELCOME_NEW_USER]: NotificationCategory.MARKETING,
      [NotificationType.BIRTHDAY_GREETING]: NotificationCategory.MARKETING,
      [NotificationType.CART_ABANDONMENT]: NotificationCategory.MARKETING,
      [NotificationType.PAYMENT_FAILED]: NotificationCategory.PAYMENT,
      [NotificationType.PAYMENT_SUCCESS]: NotificationCategory.PAYMENT,
      [NotificationType.ENGINEER_WALLET_WITHDRAWN]: NotificationCategory.PAYMENT,
      [NotificationType.ENGINEER_WALLET_DEPOSITED]: NotificationCategory.PAYMENT,
      [NotificationType.ENGINEER_COMMISSION_ADDED]: NotificationCategory.PAYMENT,
      [NotificationType.INVOICE_CREATED]: NotificationCategory.ORDER,
      [NotificationType.COUPON_USED]: NotificationCategory.PROMOTION,
    };

    this.category = typeToCategoryMap[this.type] || NotificationCategory.SYSTEM;
  }

  next();
});
