import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TejoIntent } from '../tejo.types';

export type TejoConversationDocument = HydratedDocument<TejoConversation>;

@Schema({ timestamps: true })
export class TejoConversation {
  @Prop({ type: Types.ObjectId, ref: 'SupportTicket', required: true, index: true })
  ticketId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  userMessage!: string;

  @Prop({ required: true })
  reply!: string;

  @Prop({
    type: String,
    enum: ['product_search', 'order_help', 'human_handoff', 'general_support'],
    default: 'general_support',
    index: true,
  })
  intent!: TejoIntent;

  @Prop({ type: [String], default: [] })
  entities!: string[];

  @Prop({ default: 0 })
  confidence!: number;

  @Prop({ default: false, index: true })
  handoffSuggested!: boolean;

  @Prop({ default: false, index: true })
  handoffTriggered!: boolean;

  @Prop({ default: 0 })
  latencyMs!: number;

  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true })
  model!: string;

  @Prop({ type: [Object], default: [] })
  cards!: Record<string, unknown>[];

  @Prop({ type: [String], default: [] })
  suggestions!: string[];

  @Prop({ type: [Object], default: [] })
  actions!: Record<string, unknown>[];

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const TejoConversationSchema = SchemaFactory.createForClass(TejoConversation);
TejoConversationSchema.index({ ticketId: 1, createdAt: -1 });
TejoConversationSchema.index({ intent: 1, createdAt: -1 });
TejoConversationSchema.index({ handoffTriggered: 1, createdAt: -1 });

