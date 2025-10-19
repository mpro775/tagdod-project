import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DevicePlatform } from '../enums/notification.enums';

export type DeviceTokenDocument = HydratedDocument<DeviceToken>;

@Schema({ 
  timestamps: true,
  collection: 'device_tokens',
  versionKey: false
})
export class DeviceToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, maxlength: 500, index: true })
  token!: string;

  @Prop({ 
    type: String, 
    enum: Object.values(DevicePlatform), 
    required: true,
    index: true 
  })
  platform!: DevicePlatform;

  @Prop({ maxlength: 500 })
  userAgent?: string;

  @Prop({ maxlength: 50 })
  appVersion?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date })
  lastUsedAt?: Date;

  // System fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);

// Indexes
DeviceTokenSchema.index({ userId: 1, platform: 1 });
DeviceTokenSchema.index({ token: 1 }, { unique: true });
DeviceTokenSchema.index({ isActive: 1, lastUsedAt: -1 });
DeviceTokenSchema.index({ createdAt: -1 });

// TTL Index: Auto-delete inactive tokens after 30 days
DeviceTokenSchema.index({ lastUsedAt: 1 }, { expireAfterSeconds: 2592000, sparse: true }); // 30 days