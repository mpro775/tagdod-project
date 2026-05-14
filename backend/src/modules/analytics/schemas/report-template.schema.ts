import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportTemplateDocument = HydratedDocument<ReportTemplate>;

@Schema({ timestamps: true })
export class ReportTemplate {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  nameEn!: string;

  @Prop()
  description?: string;

  @Prop()
  descriptionEn?: string;

  @Prop({ type: String, enum: ['sales', 'orders', 'products', 'customers', 'inventory', 'financial', 'marketing', 'support', 'system', 'tejo', 'custom'], required: true })
  category!: string;

  @Prop({ type: [String], default: [] })
  availableSections!: string[];

  @Prop({ type: [String], default: [] })
  availableMetrics!: string[];

  @Prop({ type: [String], default: [] })
  availableCharts!: string[];

  @Prop({ type: [String], default: [] })
  availableFilters!: string[];

  @Prop({ type: [String], default: [] })
  defaultSections!: string[];

  @Prop({ type: Object })
  defaultFilters?: Record<string, unknown>;

  @Prop({ type: [String], default: [] })
  defaultMetrics!: string[];

  @Prop({ type: [String], default: [] })
  defaultCharts!: string[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Object })
  icon?: {
    name: string;
    color: string;
  };

  @Prop({ default: 0 })
  usageCount!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReportTemplateSchema = SchemaFactory.createForClass(ReportTemplate);
ReportTemplateSchema.index({ key: 1 }, { unique: true });
ReportTemplateSchema.index({ category: 1, isActive: 1 });
