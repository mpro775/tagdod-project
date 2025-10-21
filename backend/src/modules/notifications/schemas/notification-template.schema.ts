import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationTemplateDocument = NotificationTemplate & Document;

@Schema({ timestamps: true })
export class NotificationTemplate {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true })
  messageEn!: string;
  @Prop()
  template?: string;

  @Prop({ type: Object })
  channels!: {
    push?: boolean;
    sms?: boolean;
    email?: boolean;
  };

  @Prop({ 
    enum: ['welcome', 'order', 'promotion', 'alert', 'reminder', 'custom'],
    default: 'custom'
  })
  type!: string;

  @Prop()
  category?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Object })
  variables?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    defaultValue?: unknown;
    description?: string;
  }>;

  @Prop({ type: Object })
  exampleData?: Record<string, unknown>;

  @Prop({ default: 0 })
  usageCount!: number;

  @Prop()
  lastUsedAt?: Date;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);

// Indexes
NotificationTemplateSchema.index({ name: 1 });
NotificationTemplateSchema.index({ type: 1, isActive: 1 });
NotificationTemplateSchema.index({ category: 1, isActive: 1 });
NotificationTemplateSchema.index({ usageCount: -1 });