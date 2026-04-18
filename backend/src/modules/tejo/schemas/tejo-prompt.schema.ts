import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TejoPromptDocument = HydratedDocument<TejoPrompt>;

export enum TejoPromptStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class TejoPrompt {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ required: false })
  modelHint?: string;

  @Prop({
    type: String,
    enum: Object.values(TejoPromptStatus),
    default: TejoPromptStatus.DRAFT,
    index: true,
  })
  status!: TejoPromptStatus;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ default: 1 })
  version!: number;

  @Prop({ required: false })
  activatedBy?: string;

  @Prop({ required: false })
  activatedAt?: Date;
}

export const TejoPromptSchema = SchemaFactory.createForClass(TejoPrompt);
TejoPromptSchema.index({ status: 1, updatedAt: -1 });
TejoPromptSchema.index({ name: 1, version: 1 }, { unique: true });

