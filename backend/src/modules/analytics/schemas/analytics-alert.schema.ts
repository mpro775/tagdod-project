import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AnalyticsAlertDocument = HydratedDocument<AnalyticsAlert>;

@Schema({ timestamps: true })
export class AnalyticsAlert {
  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  titleEn!: string;

  @Prop()
  description?: string;

  @Prop()
  descriptionEn?: string;

  @Prop({ type: String, enum: ['low', 'medium', 'high', 'critical'], required: true })
  severity!: 'low' | 'medium' | 'high' | 'critical';

  @Prop({ type: String, enum: ['open', 'acknowledged', 'resolved', 'ignored'], default: 'open' })
  status!: 'open' | 'acknowledged' | 'resolved' | 'ignored';

  @Prop({ type: String, enum: ['sales', 'orders', 'products', 'customers', 'inventory', 'financial', 'marketing', 'support', 'system', 'tejo'], required: true })
  source!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  acknowledgedBy?: Types.ObjectId;

  @Prop()
  acknowledgedAt?: Date;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  resolvedBy?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Object })
  thresholds?: {
    warning?: number;
    critical?: number;
    currentValue?: number;
  };

  @Prop()
  suggestedAction?: string;

  @Prop()
  suggestedActionEn?: string;

  @Prop({ default: false })
  isRecurring!: boolean;

  @Prop()
  lastTriggeredAt?: Date;

  @Prop({ default: 1 })
  triggerCount!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AnalyticsAlertSchema = SchemaFactory.createForClass(AnalyticsAlert);
AnalyticsAlertSchema.index({ status: 1, severity: 1 });
AnalyticsAlertSchema.index({ source: 1, createdAt: -1 });
AnalyticsAlertSchema.index({ type: 1, status: 1 });
