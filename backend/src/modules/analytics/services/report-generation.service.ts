import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AdvancedReport,
  AdvancedReportDocument,
  ReportCategory,
  ReportPriority,
} from '../schemas/advanced-report.schema';
import { ReportIdService } from './report-id.service';
import { ExportService, ExportResult } from './export.service';
import { FileStorageService } from './file-storage.service';

export interface GenerateReportInput {
  title: string;
  titleEn: string;
  description?: string;
  descriptionEn?: string;
  category: ReportCategory;
  priority?: ReportPriority;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  creatorName?: string;
  filters?: Record<string, unknown>;
  exportSettings?: {
    formats: Array<'pdf' | 'xlsx' | 'csv' | 'json'>;
    includeCharts: boolean;
    includeRawData: boolean;
  };
  analyticsData: Record<string, unknown>;
  dataQuality?: {
    overall: 'real' | 'mixed' | 'estimated' | 'incomplete';
    sources: Record<string, 'real' | 'estimated' | 'not_connected'>;
    notes: string[];
  };
}

export interface ExportReportInput {
  reportId: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  exportedBy: string;
}

@Injectable()
export class ReportGenerationService {
  private readonly logger = new Logger(ReportGenerationService.name);

  constructor(
    @InjectModel(AdvancedReport.name) private reportModel: Model<AdvancedReportDocument>,
    private reportIdService: ReportIdService,
    private exportService: ExportService,
    private fileStorageService: FileStorageService,
  ) {}

  async createReport(input: GenerateReportInput): Promise<AdvancedReportDocument> {
    const startTime = Date.now();
    this.logger.log(`Creating report: ${input.title}`);

    const reportId = await this.reportIdService.generateReportId();

    const report = new this.reportModel({
      reportId,
      title: input.title,
      titleEn: input.titleEn,
      description: input.description,
      descriptionEn: input.descriptionEn,
      category: input.category,
      priority: input.priority || ReportPriority.MEDIUM,
      startDate: input.startDate,
      endDate: input.endDate,
      generatedAt: new Date(),
      createdBy: new Types.ObjectId(input.createdBy),
      createdByType: 'user',
      creatorName: input.creatorName,
      filters: input.filters,
      exportSettings: input.exportSettings,
      status: 'processing',
      startedAt: new Date(),
      dataQuality: input.dataQuality || {
        overall: 'real',
        sources: {},
        notes: [],
      },
    });

    Object.assign(report, input.analyticsData);

    report.status = 'completed';
    report.completedAt = new Date();
    report.generationDurationMs = Date.now() - startTime;
    report.metadata = {
      processingTime: report.generationDurationMs,
      dataSourceVersion: '1.0.0',
      reportVersion: '1.0.0',
      generationMode: 'manual',
      tags: ((input.filters?.customFilters as any)?.tags as string[]) || [],
    };

    await report.save();
    this.logger.log(`Report created successfully: ${reportId}`);
    return report;
  }

  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived',
    options?: { failureReason?: string },
  ): Promise<AdvancedReportDocument | null> {
    const update: Record<string, unknown> = { status };

    if (status === 'processing') {
      update.startedAt = new Date();
    } else if (status === 'completed') {
      update.completedAt = new Date();
    } else if (status === 'failed') {
      update.failedAt = new Date();
      if (options?.failureReason) {
        update.failureReason = options.failureReason;
      }
    } else if (status === 'archived') {
      update.isArchived = true;
    }

    return this.reportModel.findByIdAndUpdate(reportId, update, { new: true });
  }

  async exportReport(input: ExportReportInput): Promise<ExportResult> {
    const report = await this.reportModel.findById(input.reportId);
    if (!report) {
      throw new Error(`Report not found: ${input.reportId}`);
    }

    const exportData = this.prepareExportData(report);
    const fileName = `${report.reportId}_${input.format}_${Date.now()}.${input.format === 'xlsx' ? 'xlsx' : input.format}`;

    const exportResult = await this.exportService.exportData({
      format: input.format,
      filename: fileName,
      folder: 'reports',
      title: report.title,
      data: exportData,
    });

    const exportEntry = {
      format: input.format,
      fileUrl: exportResult.url,
      fileName: exportResult.filename,
      fileSize: exportResult.size,
      generatedAt: new Date(),
      generatedBy: new Types.ObjectId(input.exportedBy),
    };

    report.exports.push(exportEntry);
    await report.save();

    this.logger.log(
      `Exported report ${report._id} as ${input.format}: ${exportResult.filename}`,
    );
    return exportResult;
  }

  async getReport(reportId: string): Promise<AdvancedReportDocument | null> {
    return this.reportModel.findById(reportId);
  }

  async listReports(query: {
    page?: number;
    limit?: number;
    category?: ReportCategory;
    status?: string;
    search?: string;
    createdBy?: string;
  }): Promise<{ data: AdvancedReportDocument[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.category) {
      filter.category = query.category;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.createdBy) {
      filter.createdBy = new Types.ObjectId(query.createdBy);
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { titleEn: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { reportId: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName phone'),
      this.reportModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async archiveReport(reportId: string): Promise<AdvancedReportDocument | null> {
    return this.updateReportStatus(reportId, 'archived');
  }

  async deleteReport(reportId: string): Promise<boolean> {
    const result = await this.reportModel.findByIdAndDelete(reportId);
    return !!result;
  }

  private prepareExportData(report: AdvancedReportDocument): Record<string, unknown> {
    const data: Record<string, unknown> = {
      reportId: report.reportId,
      title: report.title,
      titleEn: report.titleEn,
      category: report.category,
      period: `${report.startDate?.toLocaleDateString()} - ${report.endDate?.toLocaleDateString()}`,
      generatedAt: report.generatedAt,
      summary: report.summary,
    };

    if (report.salesAnalytics) {
      data.salesAnalytics = report.salesAnalytics;
    }
    if (report.productAnalytics) {
      data.productAnalytics = report.productAnalytics;
    }
    if (report.customerAnalytics) {
      data.customerAnalytics = report.customerAnalytics;
    }
    if (report.financialAnalytics) {
      data.financialAnalytics = report.financialAnalytics;
    }
    if (report.marketingAnalytics) {
      data.marketingAnalytics = report.marketingAnalytics;
    }
    if (report.operationalAnalytics) {
      data.operationalAnalytics = report.operationalAnalytics;
    }
    if (report.cartAnalytics) {
      data.cartAnalytics = report.cartAnalytics;
    }
    if (report.insights && report.insights.length > 0) {
      data.insights = report.insights;
    }
    if (report.recommendations && report.recommendations.length > 0) {
      data.recommendations = report.recommendations;
    }
    if (report.chartsData) {
      data.chartsData = report.chartsData;
    }
    if (report.dataQuality) {
      data.dataQuality = report.dataQuality;
    }

    return data;
  }
}
