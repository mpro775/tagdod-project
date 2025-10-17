import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ORDER_STATUS = 'ORDER_STATUS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  PROMOTION = 'PROMOTION',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  DASHBOARD = 'dashboard',
}

@Schema({ timestamps: true })
export class Notification {
  _id?: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(NotificationType), index: true })
  type!: NotificationType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true })
  messageEn!: string;

  @Prop({ type: Object, required: true })
  data!: {
    productId?: string;
    orderId?: string;
    userId?: string;
    [key: string]: unknown;
  };

  @Prop({ type: String, enum: Object.values(NotificationChannel), default: NotificationChannel.DASHBOARD })
  channel!: NotificationChannel;

  @Prop({ type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.PENDING })
  status!: NotificationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recipientId?: Types.ObjectId;

  @Prop()
  recipientEmail?: string;

  @Prop()
  recipientPhone?: string;

  @Prop()
  sentAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 0 })
  retryCount!: number;

  @Prop()
  scheduledFor?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ default: false })
  isSystemGenerated!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ type: 1, status: 1 });
NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ scheduledFor: 1 });