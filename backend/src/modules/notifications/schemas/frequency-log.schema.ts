import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationChannel } from '../enums/notification.enums';

export type FrequencyLogDocument = HydratedDocument<FrequencyLog>;

/**
 * Schema for tracking notification frequency per user
 * Used for persistent history and analytics
 */
@Schema({
  timestamps: true,
  collection: 'notification_frequency_logs',
  versionKey: false,
})
export class FrequencyLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(NotificationChannel),
    required: true,
    index: true,
  })
  channel!: NotificationChannel;

  @Prop({ type: Date, required: true, index: true })
  sentAt!: Date;

  @Prop({ maxlength: 100, index: true })
  templateKey?: string;

  @Prop({ maxlength: 100 })
  notificationType?: string;

  // System fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const FrequencyLogSchema = SchemaFactory.createForClass(FrequencyLog);

// ===== Indexes for Performance =====

// Compound index for user frequency queries
FrequencyLogSchema.index({ userId: 1, sentAt: -1 });
FrequencyLogSchema.index({ userId: 1, channel: 1, sentAt: -1 });

// Index for analytics queries
FrequencyLogSchema.index({ channel: 1, sentAt: -1 });
FrequencyLogSchema.index({ templateKey: 1, sentAt: -1 });

// TTL Index: Auto-delete logs older than 90 days
FrequencyLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

