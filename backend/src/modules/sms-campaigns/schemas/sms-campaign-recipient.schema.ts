import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SmsProviderName, SmsRecipientStatus } from '../sms-campaign.constants';

export type SmsCampaignRecipientDocument = HydratedDocument<SmsCampaignRecipient>;

@Schema({ timestamps: true, collection: 'sms_campaign_recipients' })
export class SmsCampaignRecipient {
  @Prop({ type: Types.ObjectId, ref: 'SmsCampaign', required: true, index: true })
  campaignId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: Types.ObjectId;

  @Prop({ trim: true })
  userName?: string;

  @Prop({ trim: true })
  phone!: string;

  @Prop({ required: true, trim: true, index: true })
  normalizedPhone!: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  message!: string;

  @Prop({
    required: true,
    enum: SmsRecipientStatus,
    default: SmsRecipientStatus.QUEUED,
    index: true,
  })
  status!: SmsRecipientStatus;

  @Prop({ required: true, enum: SmsProviderName, default: SmsProviderName.ALAWAEL })
  provider!: SmsProviderName;

  @Prop() providerMessageId?: string;
  @Prop() providerResponseNo?: number;
  @Prop() providerResponseMessage?: string;
  @Prop({ type: Object }) providerRawResponse?: Record<string, unknown>;

  @Prop({ default: 0 }) attempts!: number;
  @Prop() lastAttemptAt?: Date;
  @Prop() sentAt?: Date;
  @Prop() failedAt?: Date;
  @Prop() skippedAt?: Date;

  @Prop({ maxlength: 500 }) errorMessage?: string;
  @Prop({ maxlength: 100 }) errorCode?: string;
}

export const SmsCampaignRecipientSchema =
  SchemaFactory.createForClass(SmsCampaignRecipient);

SmsCampaignRecipientSchema.index({ campaignId: 1, normalizedPhone: 1 }, { unique: true });
SmsCampaignRecipientSchema.index({ campaignId: 1, status: 1, createdAt: 1 });
SmsCampaignRecipientSchema.index({ providerMessageId: 1 });
SmsCampaignRecipientSchema.index({ normalizedPhone: 1, createdAt: -1 });
