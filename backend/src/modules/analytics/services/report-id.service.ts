import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdvancedReport } from '../schemas/advanced-report.schema';

@Injectable()
export class ReportIdService {
  private readonly logger = new Logger(ReportIdService.name);

  constructor(
    @InjectModel(AdvancedReport.name) private reportModel: Model<AdvancedReport>,
  ) {}

  async generateReportId(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `REP-${year}-${month}`;

    const lastReport = await this.reportModel
      .findOne({ reportId: new RegExp(`^${prefix}-`) })
      .sort({ reportId: -1 })
      .select('reportId')
      .lean();

    let sequence = 1;
    if (lastReport?.reportId) {
      const lastSequence = parseInt(lastReport.reportId.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    const reportId = `${prefix}-${String(sequence).padStart(6, '0')}`;
    this.logger.log(`Generated report ID: ${reportId}`);
    return reportId;
  }
}
