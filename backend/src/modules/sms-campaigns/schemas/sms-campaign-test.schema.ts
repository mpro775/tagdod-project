import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SmsCampaignTestDocument = HydratedDocument<SmsCampaignTest>;

@Schema({ timestamps: true, collection: 'sms_campaign_tests' })
export class SmsCampaignTest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  normalizedPhone!: string;

  @Prop({ required: true, maxlength: 1000 })
  message!: string;

  @Prop({ default: false })
  success!: boolean;

  @Prop()
  providerMessageId?: string;

  @Prop()
  errorMessage?: string;
}

export const SmsCampaignTestSchema = SchemaFactory.createForClass(SmsCampaignTest);
