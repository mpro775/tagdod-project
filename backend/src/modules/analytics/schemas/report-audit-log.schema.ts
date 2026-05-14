import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReportAuditLogDocument = HydratedDocument<ReportAuditLog>;

@Schema({ timestamps: true })
export class ReportAuditLog {
  @Prop({ required: true })
  action!: string;

  @Prop({ type: Types.ObjectId, ref: 'AdvancedReport', required: true, index: true })
  reportId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop()
  format?: string;

  @Prop({ type: Object })
  filters?: Record<string, unknown>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  details?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReportAuditLogSchema = SchemaFactory.createForClass(ReportAuditLog);

ReportAuditLogSchema.index({ reportId: 1, createdAt: -1 });
ReportAuditLogSchema.index({ userId: 1, createdAt: -1 });
ReportAuditLogSchema.index({ action: 1, createdAt: -1 });
