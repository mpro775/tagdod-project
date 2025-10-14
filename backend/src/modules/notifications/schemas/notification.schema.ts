import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  channel!: 'inapp' | 'push' | 'sms' | 'email';

  @Prop({ required: true })
  templateKey!: string;

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;

  @Prop() title?: string;
  @Prop() body?: string;
  @Prop() link?: string;

  @Prop({ default: 'queued', index: true })
  status!: 'queued' | 'sent' | 'failed' | 'read';

  @Prop() sentAt?: Date;
  @Prop() readAt?: Date;
  @Prop() error?: string;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Performance indexes
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ channel: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, sentAt: -1 }, { sparse: true });
NotificationSchema.index({ readAt: 1 }, { sparse: true });
NotificationSchema.index({ templateKey: 1 });
NotificationSchema.index({ createdAt: -1 });
