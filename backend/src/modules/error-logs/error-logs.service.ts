import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  ErrorLog,
  ErrorLogDocument,
} from './schemas/error-log.schema';
import {
  SystemLog,
  SystemLogDocument,
} from './schemas/system-log.schema';
import {
  ErrorLogsQueryDto,
  CreateErrorLogDto,
  ErrorStatisticsDto,
  ErrorTrendDto,
  ErrorLogDto,
  SystemLogDto,
  LogsExportDto,
} from './dto/error-logs.dto';

@Injectable()
export class ErrorLogsService {
  private readonly logger = new Logger(ErrorLogsService.name);

  constructor(
    @InjectModel(ErrorLog.name)
    private errorLogModel: Model<ErrorLogDocument>,
    @InjectModel(SystemLog.name)
    private systemLogModel: Model<SystemLogDocument>,
  ) {}

  // ==================== Error Logs ====================

  async createErrorLog(dto: CreateErrorLogDto): Promise<ErrorLogDto> {
    // Create hash for deduplication
    const hash = this.createErrorHash(dto.message, dto.endpoint, dto.stack);

    // Check if similar error already exists (same hash, within last hour, not resolved)
    const existingError = await this.errorLogModel.findOne({
      hash,
      resolved: false,
      lastOccurrence: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (existingError) {
      // Update existing error
      existingError.occurrences += 1;
      existingError.lastOccurrence = new Date();
      if (dto.metadata) {
        existingError.metadata = { ...existingError.metadata, ...dto.metadata };
      }
      await existingError.save();
      
      return this.mapToDto(existingError);
    }

    // Create new error log
    const errorLog = new this.errorLogModel({
      ...dto,
      hash,
      firstOccurrence: new Date(),
      lastOccurrence: new Date(),
    });

    await errorLog.save();
    return this.mapToDto(errorLog);
  }

  async getErrorLogs(query: ErrorLogsQueryDto) {
    const { level, category, search, startDate, endDate, page = 1, limit = 20 } = query;

    const filter: any = {};

    if (level) {
      filter.level = level;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.errorLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.errorLogModel.countDocuments(filter),
    ]);

    return {
      data: logs.map((log) => this.mapToDto(log)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getErrorById(id: string): Promise<ErrorLogDto> {
    const error = await this.errorLogModel.findById(id).lean();
    if (!error) {
      throw new Error('Error log not found');
    }
    return this.mapToDto(error);
  }

  async getErrorStatistics(): Promise<ErrorStatisticsDto> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalErrors,
      errors24h,
      errors7d,
      byLevel,
      byCategory,
      topErrors,
      byEndpoint,
    ] = await Promise.all([
      this.errorLogModel.countDocuments(),
      this.errorLogModel.countDocuments({ createdAt: { $gte: last24Hours } }),
      this.errorLogModel.countDocuments({ createdAt: { $gte: last7Days } }),
      this.getErrorsByLevel(),
      this.getErrorsByCategory(),
      this.getTopErrors(),
      this.getErrorsByEndpoint(),
    ]);

    // Calculate error rate (errors per total requests)
    // This would need to be calculated from actual request counts
    const errorRate = 2.5; // Mock value

    return {
      totalErrors,
      last24Hours: errors24h,
      last7Days: errors7d,
      errorRate,
      byLevel,
      byCategory,
      topErrors,
      byEndpoint,
    };
  }

  async getErrorTrend(days: number = 7): Promise<ErrorTrendDto> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const errors = await this.errorLogModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ createdAt: 1 })
      .lean();

    // Group by date
    const dataMap = new Map<string, any>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dataMap.set(dateStr, {
        date: dateStr,
        total: 0,
        byLevel: { error: 0, warn: 0, fatal: 0, debug: 0 },
      });
    }

    errors.forEach((error) => {
      const dateStr = error.createdAt.toISOString().split('T')[0];
      const data = dataMap.get(dateStr);
      if (data) {
        data.total++;
        if (data.byLevel[error.level] !== undefined) {
          data.byLevel[error.level]++;
        }
      }
    });

    const data = Array.from(dataMap.values());

    // Calculate trend
    const firstHalf = data.slice(0, Math.floor(days / 2));
    const secondHalf = data.slice(Math.floor(days / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b.total, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.total, 0) / secondHalf.length;

    const changePercentage = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(changePercentage) < 10) {
      trend = 'stable';
    } else if (changePercentage > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return {
      data,
      trend,
      changePercentage,
    };
  }

  async resolveError(id: string, userId: string, notes?: string): Promise<void> {
    await this.errorLogModel.findByIdAndUpdate(id, {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: userId,
      notes,
    });
  }

  async deleteError(id: string): Promise<void> {
    await this.errorLogModel.findByIdAndDelete(id);
  }

  async clearOldErrors(days: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.errorLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });
    return result.deletedCount || 0;
  }

  // ==================== System Logs ====================

  async createSystemLog(
    level: string,
    message: string,
    context?: string,
    data?: Record<string, any>,
  ): Promise<void> {
    await this.systemLogModel.create({
      level,
      message,
      context,
      data,
      timestamp: new Date(),
    });
  }

  async getSystemLogs(
    level?: string,
    context?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const filter: any = {};

    if (level) {
      filter.level = level;
    }

    if (context) {
      filter.context = context;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.systemLogModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.systemLogModel.countDocuments(filter),
    ]);

    return {
      data: logs.map((log) => ({
        id: log._id.toString(),
        level: log.level,
        message: log.message,
        context: log.context,
        data: log.data,
        timestamp: log.timestamp,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportLogs(dto: LogsExportDto): Promise<string> {
    const { format, startDate, endDate, level } = dto;

    const filter: any = {};

    if (level) {
      filter.level = level;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const logs = await this.errorLogModel.find(filter).lean();

    // Generate file based on format
    let content: string;

    switch (format) {
      case 'csv':
        content = this.generateCSV(logs);
        break;
      case 'txt':
        content = this.generateTXT(logs);
        break;
      case 'json':
      default:
        content = JSON.stringify(logs, null, 2);
        break;
    }

    // In real implementation, would save to S3/storage and return URL
    const filename = `error-logs-${Date.now()}.${format}`;
    const fileUrl = `https://cdn.example.com/exports/${filename}`;

    this.logger.log(`Exported ${logs.length} error logs to ${fileUrl}`);

    return fileUrl;
  }

  // ==================== Helper Methods ====================

  private createErrorHash(message: string, endpoint?: string, stack?: string): string {
    const content = `${message}-${endpoint || ''}-${stack?.split('\n')[0] || ''}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  private async getErrorsByLevel() {
    const results = await this.errorLogModel.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
        },
      },
    ]);

    const byLevel = { error: 0, warn: 0, fatal: 0, debug: 0 };
    results.forEach((r) => {
      if (byLevel[r._id] !== undefined) {
        byLevel[r._id] = r.count;
      }
    });

    return byLevel;
  }

  private async getErrorsByCategory(): Promise<Record<string, number>> {
    const results = await this.errorLogModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const byCategory: Record<string, number> = {};
    results.forEach((r) => {
      byCategory[r._id] = r.count;
    });

    return byCategory;
  }

  private async getTopErrors() {
    const errors = await this.errorLogModel
      .find()
      .sort({ occurrences: -1 })
      .limit(10)
      .lean();

    return errors.map((e) => ({
      message: e.message,
      count: e.occurrences,
      level: e.level as any,
      category: e.category as any,
      lastOccurrence: e.lastOccurrence,
    }));
  }

  private async getErrorsByEndpoint() {
    const results = await this.errorLogModel.aggregate([
      {
        $match: { endpoint: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: '$endpoint',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return results.map((r) => ({
      endpoint: r._id,
      count: r.count,
      errorRate: 0, // Would calculate from actual request counts
    }));
  }

  private mapToDto(log: any): ErrorLogDto {
    return {
      id: log._id.toString(),
      level: log.level,
      category: log.category,
      message: log.message,
      stack: log.stack,
      metadata: log.metadata,
      userId: log.userId,
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
      occurrences: log.occurrences,
      firstOccurrence: log.firstOccurrence,
      lastOccurrence: log.lastOccurrence,
      resolved: log.resolved,
      createdAt: log.createdAt,
    };
  }

  private generateCSV(logs: any[]): string {
    const headers = ['ID', 'Level', 'Category', 'Message', 'Endpoint', 'Occurrences', 'Last Occurrence'];
    const rows = logs.map((log) => [
      log._id,
      log.level,
      log.category,
      log.message.replace(/"/g, '""'),
      log.endpoint || '',
      log.occurrences,
      log.lastOccurrence,
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  }

  private generateTXT(logs: any[]): string {
    return logs
      .map(
        (log) =>
          `[${log.lastOccurrence}] ${log.level.toUpperCase()} - ${log.category}\n` +
          `Message: ${log.message}\n` +
          `Endpoint: ${log.endpoint || 'N/A'}\n` +
          `Occurrences: ${log.occurrences}\n` +
          `---\n`,
      )
      .join('\n');
  }
}

