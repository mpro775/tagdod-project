import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationPreferenceDocument = HydratedDocument<NotificationPreference>;

@Schema({ timestamps: true })
export class NotificationPreference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  // ===== Global Settings =====
  @Prop({ default: true })
  enableNotifications!: boolean;

  @Prop({ default: true })
  enableInApp!: boolean;

  @Prop({ default: true })
  enablePush!: boolean;

  @Prop({ default: false })
  enableSms!: boolean;

  @Prop({ default: true })
  enableEmail!: boolean;

  // ===== Quiet Hours =====
  @Prop({ type: Object })
  quietHours?: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
    timezone: string;
    days: number[]; // 0-6 (Sunday-Saturday)
  };

  // ===== Category Preferences =====
  @Prop({ type: Object, default: {} })
  categoryPreferences!: {
    order?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    product?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    promotion?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    account?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    system?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    service?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    support?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
    payment?: {
      inApp: boolean;
      push: boolean;
      sms: boolean;
      email: boolean;
    };
  };

  // ===== Specific Notifications =====
  @Prop({ type: [String], default: [] })
  mutedTemplates!: string[]; // List of template keys to mute

  @Prop({ type: [String], default: [] })
  priorityTemplates!: string[]; // Always receive these, even during quiet hours

  // ===== Delivery Preferences =====
  @Prop({ type: Object })
  deliveryPreferences?: {
    groupNotifications: boolean; // Group similar notifications
    batchInterval?: number; // Minutes to batch notifications
    instantDelivery: boolean; // Deliver immediately or batch
  };

  // ===== Contact Information =====
  @Prop()
  preferredEmail?: string; // Override user's default email

  @Prop()
  preferredPhone?: string; // Override user's default phone

  @Prop()
  preferredLanguage?: 'ar' | 'en';

  // ===== Marketing & Promotions =====
  @Prop({ default: true })
  receiveMarketingEmails!: boolean;

  @Prop({ default: false })
  receiveMarketingSms!: boolean;

  @Prop({ default: true })
  receivePromotionalPush!: boolean;

  @Prop({ default: true })
  receiveNewsletter!: boolean;

  // ===== Frequency Limits =====
  @Prop({ type: Object })
  frequencyLimits?: {
    maxNotificationsPerDay?: number;
    maxEmailsPerWeek?: number;
    maxSmsPerMonth?: number;
    maxPushPerHour?: number;
  };

  // ===== Last Updated =====
  @Prop({ type: Date })
  lastModifiedAt?: Date;

  @Prop()
  lastModifiedBy?: string; // 'user' or 'admin'

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(NotificationPreference);

// Indexes
NotificationPreferenceSchema.index({ userId: 1 }, { unique: true });
NotificationPreferenceSchema.index({ enableNotifications: 1 });
NotificationPreferenceSchema.index({ updatedAt: -1 });

