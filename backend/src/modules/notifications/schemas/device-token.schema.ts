import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeviceTokenDocument = HydratedDocument<DeviceToken>;

@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  platform!: 'ios'|'android'|'web';

  @Prop({ required: true, unique: true })
  token!: string;

  @Prop() userAgent?: string;
  @Prop() appVersion?: string;
}
export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);
DeviceTokenSchema.index({ userId: 1, platform: 1 });
