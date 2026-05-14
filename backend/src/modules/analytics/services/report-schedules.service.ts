import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ReportSchedule,
  ReportScheduleDocument,
  ReportType,
  ReportFormat,
  ScheduleFrequency,
} from '../schemas/report-schedule.schema';
import { AdvancedReport, AdvancedReportDocument, ReportCategory } from '../schemas/advanced-report.schema';
import { ReportGenerationService, GenerateReportInput } from './report-generation.service';
import { ExportService, ExportResult } from './export.service';
import { ReportAuditService } from './report-audit.service';
import { AdvancedReportsService } from './advanced-reports.service';
import {
  CreateReportScheduleDto,
  UpdateReportScheduleDto,
  ScheduleFiltersDto,
  RunNowDto,
} from '../dto/report-schedules.dto';

@Injectable()
export class ReportSchedulesService {
  private readonly logger = new Logger(ReportSchedulesService.name);

  constructor(
    @InjectModel(ReportSchedule.name)
    private scheduleModel: Model<ReportScheduleDocument>,
    @InjectModel(AdvancedReport.name)
    private reportModel: Model<AdvancedReportDocument>,
    private reportGenerationService: ReportGenerationService,
    private exportService: ExportService,
    private reportAuditService: ReportAuditService,
    private advancedReportsService: AdvancedReportsService,
  ) {}

  async create(dto: CreateReportScheduleDto, userId: string): Promise<ReportScheduleDocument> {
    this.logger.log(`Creating schedule: ${dto.name} by user ${userId}`);

    const nextRun = this.calculateNextRun(dto.frequency);

    const schedule = new this.scheduleModel({
      name: dto.name,
      description: dto.description || '',
      reportType: dto.reportType,
      frequency: dto.frequency,
      formats: dto.formats || [ReportFormat.PDF],
      recipients: dto.recipients || [],
      filters: dto.filters || {},
      config: dto.config || {},
      isActive: true,
      nextRun,
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      createdBy: new Types.ObjectId(userId),
    });

    await schedule.save();

    await this.reportAuditService.logAudit({
      action: 'schedule.created',
      reportId: schedule._id.toString(),
      userId: userId,
      details: JSON.stringify({ scheduleId: schedule._id.toString(), name: schedule.name, frequency: schedule.frequency }),
    });

    this.logger.log(`Schedule created: ${schedule._id}, nextRun: ${nextRun}`);
    return schedule;
  }

  async findAll(filters: ScheduleFiltersDto, userId?: string): Promise<{
    data: ReportScheduleDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters.reportType) {
      query.reportType = filters.reportType;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (userId) {
      query.createdBy = new Types.ObjectId(userId);
    }

    const [data, total] = await Promise.all([
      this.scheduleModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName phone'),
      this.scheduleModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ReportScheduleDocument> {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('createdBy', 'firstName lastName phone');

    if (!schedule) {
      throw new NotFoundException(`Report schedule not found: ${id}`);
    }

    return schedule;
  }

  async update(id: string, dto: UpdateReportScheduleDto, userId: string): Promise<ReportScheduleDocument> {
    const schedule = await this.findById(id);

    const updateFields: Record<string, unknown> = {};

    if (dto.name !== undefined) updateFields.name = dto.name;
    if (dto.description !== undefined) updateFields.description = dto.description;
    if (dto.reportType !== undefined) updateFields.reportType = dto.reportType;
    if (dto.formats !== undefined) updateFields.formats = dto.formats;
    if (dto.recipients !== undefined) updateFields.recipients = dto.recipients;
    if (dto.filters !== undefined) updateFields.filters = dto.filters;
    if (dto.config !== undefined) updateFields.config = dto.config;

    if (dto.frequency !== undefined) {
      updateFields.frequency = dto.frequency;
      updateFields.nextRun = this.calculateNextRun(dto.frequency);
    }

    Object.assign(schedule, updateFields);
    await schedule.save();

    await this.reportAuditService.logAudit({
      action: 'schedule.updated',
      reportId: id,
      userId: userId,
      details: JSON.stringify({ scheduleId: id, changes: Object.keys(updateFields) }),
    });

    return schedule;
  }

  async toggle(id: string, isActive: boolean, userId: string): Promise<ReportScheduleDocument> {
    const schedule = await this.findById(id);

    schedule.isActive = isActive;

    if (isActive && (!schedule.nextRun || schedule.nextRun <= new Date())) {
      schedule.nextRun = this.calculateNextRun(schedule.frequency);
    }

    await schedule.save();

    await this.reportAuditService.logAudit({
      action: isActive ? 'schedule.enabled' : 'schedule.disabled',
      reportId: id,
      userId: userId,
      details: JSON.stringify({ scheduleId: id }),
    });

    return schedule;
  }

  async remove(id: string, userId: string): Promise<void> {
    const schedule = await this.findById(id);

    await this.scheduleModel.findByIdAndDelete(id);

    await this.reportAuditService.logAudit({
      action: 'schedule.deleted',
      reportId: id,
      userId: userId,
      details: JSON.stringify({ scheduleId: id, name: schedule.name }),
    });

    this.logger.log(`Schedule deleted: ${id}`);
  }

  async runNow(id: string, dto: RunNowDto, userId: string): Promise<{
    schedule: ReportScheduleDocument;
    report: AdvancedReportDocument;
    exports: ExportResult[];
  }> {
    const schedule = await this.findById(id);

    this.logger.log(`Running schedule now: ${schedule.name} (${id})`);

    const formats = dto.formats || schedule.formats;
    const recipients = dto.recipients || schedule.recipients;

    const { report, exports } = await this.executeSchedule(schedule, formats, userId);

    await this.reportAuditService.logAudit({
      action: 'schedule.run_now',
      reportId: report._id.toString(),
      userId: userId,
      details: JSON.stringify({ scheduleId: id, reportId: report._id.toString() }),
    });

    return { schedule, report, exports };
  }

  async processDueSchedules(): Promise<void> {
    const now = new Date();

    const dueSchedules = await this.scheduleModel.find({
      isActive: true,
      nextRun: { $lte: now },
    });

    this.logger.log(`Found ${dueSchedules.length} due schedules to process`);

    for (const schedule of dueSchedules) {
      try {
        await this.executeSingleSchedule(schedule);
      } catch (error) {
        this.logger.error(`Failed to execute schedule ${schedule._id}: ${error instanceof Error ? error.message : String(error)}`);
        await this.recordFailure(schedule, error instanceof Error ? error.message : String(error));
      }
    }
  }

  private async executeSingleSchedule(schedule: ReportScheduleDocument): Promise<void> {
    const startTime = Date.now();

    try {
      const { report, exports } = await this.executeSchedule(schedule, schedule.formats, schedule.createdBy.toString());

      await this.scheduleModel.findByIdAndUpdate(schedule._id, {
        lastRun: new Date(),
        nextRun: this.calculateNextRun(schedule.frequency),
        runCount: schedule.runCount + 1,
        successCount: schedule.successCount + 1,
        lastResult: {
          success: true,
          executionTime: Date.now() - startTime,
          fileUrls: exports.map((e) => e.url),
          reportId: report._id.toString(),
          sentAt: new Date(),
        },
      });

      this.logger.log(`Schedule executed successfully: ${schedule.name}`);
    } catch (error) {
      await this.recordFailure(schedule, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async executeSchedule(
    schedule: ReportScheduleDocument,
    formats: ReportFormat[],
    userId: string,
  ): Promise<{ report: AdvancedReportDocument; exports: ExportResult[] }> {
    const dateRange = this.getDateRangeForSchedule(schedule);
    const category = this.mapReportTypeToCategory(schedule.reportType);

    const analyticsData = await this.generateAnalyticsForCategory(
      category,
      dateRange.startDate,
      dateRange.endDate,
    );

    const reportInput: GenerateReportInput = {
      title: `${schedule.name} - ${dateRange.label}`,
      titleEn: `${schedule.name} - ${dateRange.label}`,
      description: schedule.description,
      category: category as ReportCategory,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      createdBy: userId,
      filters: schedule.filters,
      exportSettings: {
        formats: formats as Array<'pdf' | 'xlsx' | 'csv' | 'json'>,
        includeCharts: (schedule.config?.includeCharts as boolean) ?? true,
        includeRawData: (schedule.config?.includeRawData as boolean) ?? false,
      },
      analyticsData,
      dataQuality: {
        overall: 'real',
        sources: {
          sales: 'real',
          products: 'real',
          customers: 'real',
          marketing: 'not_connected',
          inventoryAccuracy: 'estimated',
        },
        notes: [],
      },
    };

    const report = await this.reportGenerationService.createReport(reportInput);

    const exports: ExportResult[] = [];

    for (const format of formats) {
      try {
        const exportResult = await this.reportGenerationService.exportReport({
          reportId: report._id.toString(),
          format: format as 'pdf' | 'xlsx' | 'csv' | 'json',
          exportedBy: userId,
        });
        exports.push(exportResult);
      } catch (error) {
        this.logger.error(`Failed to export ${format}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return { report, exports };
  }

  private async generateAnalyticsForCategory(
    category: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, unknown>> {
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    switch (category) {
      case ReportCategory.SALES:
        return {
          salesAnalytics: await this.advancedReportsService.generateSalesAnalytics({
            startDate: startStr,
            endDate: endStr,
          }),
        };
      case ReportCategory.PRODUCTS:
      case ReportCategory.INVENTORY:
        return {
          productAnalytics: await this.advancedReportsService.generateProductAnalytics({
            startDate: startStr,
            endDate: endStr,
          }),
        };
      case ReportCategory.CUSTOMERS:
        return {
          customerAnalytics: await this.advancedReportsService.generateCustomerAnalytics({
            startDate: startStr,
            endDate: endStr,
          }),
        };
      case ReportCategory.FINANCIAL:
        return {
          financialAnalytics: await this.advancedReportsService.generateFinancialAnalytics({
            startDate: startStr,
            endDate: endStr,
            includeProjections: false,
            includeCashFlow: true,
            groupBy: 'monthly',
          }),
        };
      case ReportCategory.MARKETING:
        return {
          marketingAnalytics: await this.advancedReportsService.generateMarketingAnalytics({
            startDate: startStr,
            endDate: endStr,
          }),
        };
      case ReportCategory.OPERATIONS:
        return {
          operationalAnalytics: await this.advancedReportsService.generateOperationalAnalytics(
            startDate,
            endDate,
          ),
        };
      default:
        return {
          salesAnalytics: await this.advancedReportsService.generateSalesAnalytics({
            startDate: startStr,
            endDate: endStr,
          }),
        };
    }
  }

  private async recordFailure(schedule: ReportScheduleDocument, error: string): Promise<void> {
    await this.scheduleModel.findByIdAndUpdate(schedule._id, {
      lastRun: new Date(),
      runCount: schedule.runCount + 1,
      failureCount: schedule.failureCount + 1,
      lastResult: {
        success: false,
        executionTime: 0,
        fileUrls: [],
        error,
      },
    });
  }

  private calculateNextRun(frequency: ScheduleFrequency): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case ScheduleFrequency.DAILY:
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        break;
      case ScheduleFrequency.WEEKLY:
        next.setDate(next.getDate() + (7 - next.getDay()));
        next.setHours(0, 0, 0, 0);
        break;
      case ScheduleFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(0, 0, 0, 0);
        break;
      case ScheduleFrequency.QUARTERLY:
        const currentQuarter = Math.floor(next.getMonth() / 3);
        next.setMonth((currentQuarter + 1) * 3);
        next.setDate(1);
        next.setHours(0, 0, 0, 0);
        break;
    }

    return next;
  }

  private getDateRangeForSchedule(schedule: ReportScheduleDocument): {
    startDate: Date;
    endDate: Date;
    label: string;
  } {
    const now = new Date();
    let startDate: Date;
    let label: string;

    switch (schedule.frequency) {
      case ScheduleFrequency.DAILY:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        label = 'Daily Report';
        break;
      case ScheduleFrequency.WEEKLY:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        label = 'Weekly Report';
        break;
      case ScheduleFrequency.MONTHLY:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        label = 'Monthly Report';
        break;
      case ScheduleFrequency.QUARTERLY:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        label = 'Quarterly Report';
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        label = 'Report';
    }

    return { startDate, endDate: now, label };
  }

  private mapReportTypeToCategory(reportType: ReportType): ReportCategory {
    const mapping: Record<ReportType, ReportCategory> = {
      daily_summary: ReportCategory.SALES,
      weekly_report: ReportCategory.SALES,
      monthly_report: ReportCategory.SALES,
      revenue_report: ReportCategory.FINANCIAL,
      user_activity: ReportCategory.CUSTOMERS,
      product_performance: ReportCategory.PRODUCTS,
      service_analytics: ReportCategory.OPERATIONS,
      support_metrics: ReportCategory.OPERATIONS,
      custom_report: ReportCategory.SALES,
    };

    return mapping[reportType] || ReportCategory.SALES;
  }

  async getScheduleStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byFrequency: Record<string, number>;
  }> {
    const result = await this.scheduleModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
        },
      },
    ]);

    const stats = result[0] || { total: 0, active: 0, inactive: 0 };

    const byFreq = await this.scheduleModel.aggregate([
      { $group: { _id: '$frequency', count: { $sum: 1 } } },
    ]);

    const byFrequency: Record<string, number> = {};
    byFreq.forEach((item) => {
      byFrequency[item._id] = item.count;
    });

    return { ...stats, byFrequency };
  }
}
