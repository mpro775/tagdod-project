import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TejoMessageDocument = HydratedDocument<TejoMessage>;

export enum TejoMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class TejoMessage {
  @Prop({ type: Types.ObjectId, ref: 'TejoSession', required: true, index: true })
  sessionId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: string;

  @Prop({
    type: String,
    enum: TejoMessageRole,
    required: true,
  })
  role!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({ type: Object, default: null })
  payload?: Record<string, unknown> | null;
}

export const TejoMessageSchema = SchemaFactory.createForClass(TejoMessage);

TejoMessageSchema.index({ sessionId: 1, createdAt: 1 });
TejoMessageSchema.index({ userId: 1, createdAt: -1 });
TejoMessageSchema.index({ role: 1, createdAt: -1 });
