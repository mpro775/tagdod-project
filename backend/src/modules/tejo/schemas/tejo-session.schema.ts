import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TejoSessionDocument = HydratedDocument<TejoSession>;

export enum TejoSessionStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ESCALATION_SUGGESTED = 'escalation_suggested',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

export enum TejoChannel {
  WEB = 'web',
  WHATSAPP = 'whatsapp',
  MESSENGER = 'messenger',
  INSTAGRAM = 'instagram',
  MOBILE = 'mobile',
}

@Schema({ timestamps: true })
export class TejoSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: string;

  @Prop({
    type: String,
    enum: TejoChannel,
    default: TejoChannel.WEB,
    index: true,
  })
  channel!: string;

  @Prop({
    type: String,
    enum: TejoSessionStatus,
    default: TejoSessionStatus.ACTIVE,
    index: true,
  })
  status!: string;

  @Prop({ default: 'ar' })
  locale!: string;

  @Prop()
  storefrontHost?: string;

  @Prop({ type: Types.ObjectId, ref: 'SupportTicket', default: null })
  supportTicketId?: string | null;

  @Prop()
  lastMessageAt?: Date;

  @Prop({ default: 0 })
  messageCount!: number;

  @Prop({ default: false })
  handoffSuggested!: boolean;

  @Prop({ default: false })
  handoffTriggered!: boolean;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const TejoSessionSchema = SchemaFactory.createForClass(TejoSession);

TejoSessionSchema.index({ userId: 1, createdAt: -1 });
TejoSessionSchema.index({ status: 1, createdAt: -1 });
TejoSessionSchema.index({ channel: 1, status: 1 });
TejoSessionSchema.index({ supportTicketId: 1 });
