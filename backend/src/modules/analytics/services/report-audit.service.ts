import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReportAuditLog, ReportAuditLogDocument } from '../schemas/report-audit-log.schema';

export interface AuditReportInput {
  action: string;
  reportId: string;
  userId: string;
  format?: string;
  filters?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

@Injectable()
export class ReportAuditService {
  private readonly logger = new Logger(ReportAuditService.name);

  constructor(
    @InjectModel(ReportAuditLog.name)
    private auditLogModel: Model<ReportAuditLogDocument>,
  ) {}

  async logAudit(input: AuditReportInput): Promise<void> {
    try {
      const auditEntry = new this.auditLogModel({
        action: input.action,
        reportId: new Types.ObjectId(input.reportId),
        userId: new Types.ObjectId(input.userId),
        format: input.format,
        filters: input.filters,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        details: input.details,
      });

      await auditEntry.save();
      this.logger.log(
        `Audit logged: ${input.action} on report ${input.reportId} by user ${input.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to log report audit:', error);
    }
  }

  async getAuditHistory(
    reportId: string,
    limit = 50,
  ): Promise<ReportAuditLogDocument[]> {
    return this.auditLogModel
      .find({ reportId: new Types.ObjectId(reportId) })
      .populate('userId', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getUserAuditHistory(
    userId: string,
    limit = 50,
  ): Promise<ReportAuditLogDocument[]> {
    return this.auditLogModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('reportId', 'reportId title category')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
