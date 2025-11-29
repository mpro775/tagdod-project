import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationType, NotificationChannel } from '../enums/notification.enums';
import { UserRole } from '../../users/schemas/user.schema';

export type NotificationChannelConfigDocument = HydratedDocument<NotificationChannelConfig>;

@Schema({
  timestamps: true,
  collection: 'notification_channel_configs',
  versionKey: false,
})
export class NotificationChannelConfig {
  @Prop({
    required: true,
    enum: Object.values(NotificationType),
    unique: true,
    index: true,
  })
  notificationType!: NotificationType;

  @Prop({
    type: [String],
    enum: Object.values(NotificationChannel),
    required: true,
  })
  allowedChannels!: NotificationChannel[];

  @Prop({
    type: String,
    enum: Object.values(NotificationChannel),
    required: true,
  })
  defaultChannel!: NotificationChannel;

  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    required: true,
  })
  targetRoles!: UserRole[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  // ===== Timestamps (handled by timestamps: true) =====
  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationChannelConfigSchema =
  SchemaFactory.createForClass(NotificationChannelConfig);

// ===== Indexes for Performance =====
NotificationChannelConfigSchema.index({ notificationType: 1 }, { unique: true });
NotificationChannelConfigSchema.index({ isActive: 1 });
NotificationChannelConfigSchema.index({ updatedAt: -1 });

