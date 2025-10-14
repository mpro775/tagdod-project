import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReportScheduleDocument = HydratedDocument<ReportSchedule>;

export enum ReportType {
  DAILY_SUMMARY = 'daily_summary',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  REVENUE_REPORT = 'revenue_report',
  USER_ACTIVITY = 'user_activity',
  PRODUCT_PERFORMANCE = 'product_performance',
  SERVICE_ANALYTICS = 'service_analytics',
  SUPPORT_METRICS = 'support_metrics',
  CUSTOM_REPORT = 'custom_report',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
  HTML = 'html',
}

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

@Schema({ timestamps: true })
export class ReportSchedule {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({
    type: String,
    enum: ReportType,
    required: true,
    index: true
  })
  reportType!: ReportType;

  @Prop({
    type: [String],
    enum: ReportFormat,
    default: [ReportFormat.PDF]
  })
  formats!: ReportFormat[];

  @Prop({
    type: String,
    enum: ScheduleFrequency,
    required: true,
    index: true
  })
  frequency!: ScheduleFrequency;

  @Prop({ required: true })
  nextRun!: Date;

  @Prop()
  lastRun?: Date;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  recipients!: string[]; // Email addresses

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy!: string;

  @Prop({ type: Object, default: {} })
  filters!: Record<string, unknown>; // Custom filters for the report

  @Prop({ type: Object, default: {} })
  config!: {
    includeCharts?: boolean;
    includeRawData?: boolean;
    dateRange?: {
      start: Date;
      end: Date;
    };
    customMetrics?: string[];
    branding?: {
      logo?: string;
      companyName?: string;
      colors?: {
        primary: string;
        secondary: string;
      };
    };
  };

  @Prop({ type: Object, default: {} })
  lastResult?: {
    success: boolean;
    executionTime: number;
    fileUrls: string[];
    error?: string;
    sentAt?: Date;
  };

  @Prop({ default: 0 })
  runCount!: number;

  @Prop({ default: 0 })
  successCount!: number;

  @Prop({ default: 0 })
  failureCount!: number;
}

export const ReportScheduleSchema = SchemaFactory.createForClass(ReportSchedule);

// Indexes for better query performance
ReportScheduleSchema.index({ isActive: 1, nextRun: 1 });
ReportScheduleSchema.index({ createdBy: 1 });
ReportScheduleSchema.index({ reportType: 1, frequency: 1 });
