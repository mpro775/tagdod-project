import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  SmsCampaignStatus,
  SmsCampaignTarget,
  SmsProviderName,
} from '../sms-campaign.constants';

export type SmsCampaignDocument = HydratedDocument<SmsCampaign>;

@Schema({ timestamps: true, collection: 'sms_campaigns' })
export class SmsCampaign {
  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  message!: string;

  @Prop({ required: true, enum: SmsCampaignTarget })
  target!: SmsCampaignTarget;

  @Prop({ type: Object, default: {} })
  filters!: Record<string, unknown>;

  @Prop({
    required: true,
    enum: SmsCampaignStatus,
    default: SmsCampaignStatus.DRAFT,
    index: true,
  })
  status!: SmsCampaignStatus;

  @Prop({ required: true, enum: SmsProviderName, default: SmsProviderName.ALAWAEL })
  provider!: SmsProviderName;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop({ default: 0 }) totalMatchedUsers!: number;
  @Prop({ default: 0 }) totalRecipients!: number;
  @Prop({ default: 0 }) validRecipients!: number;
  @Prop({ default: 0 }) invalidRecipients!: number;
  @Prop({ default: 0 }) duplicatePhones!: number;

  @Prop({ default: 0 }) queuedCount!: number;
  @Prop({ default: 0 }) sendingCount!: number;
  @Prop({ default: 0 }) sentCount!: number;
  @Prop({ default: 0 }) failedCount!: number;
  @Prop({ default: 0 }) skippedCount!: number;

  @Prop({ default: 'UCS_2' }) encoding!: 'GSM_7' | 'UCS_2';
  @Prop({ default: 0 }) messageLength!: number;
  @Prop({ default: 0 }) segmentsPerMessage!: number;
  @Prop({ default: 0 }) estimatedTotalSmsParts!: number;

  @Prop({ default: false }) testSent!: boolean;
  @Prop() lastTestPhone?: string;
  @Prop() lastTestSentAt?: Date;

  @Prop() startedAt?: Date;
  @Prop() completedAt?: Date;
  @Prop() pausedAt?: Date;
  @Prop() cancelledAt?: Date;
  @Prop() failedAt?: Date;

  @Prop({ maxlength: 500 }) errorMessage?: string;

  @Prop({ default: 0 }) jobRunCount!: number;
  @Prop() lastJobId?: string;
}

export const SmsCampaignSchema = SchemaFactory.createForClass(SmsCampaign);

SmsCampaignSchema.index({ status: 1, createdAt: -1 });
SmsCampaignSchema.index({ createdBy: 1, createdAt: -1 });
SmsCampaignSchema.index({ target: 1, createdAt: -1 });
