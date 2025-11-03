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
  LogsExportDto,
  ErrorLevel,
  ErrorCategory,
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

    const filter: Record<string, unknown> = {};

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
      filter.createdAt = {} as Record<string, Date>;
      if (startDate) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    // Build MongoDB query
    const mongoQuery = this.errorLogModel.find(filter);

    // When using text search, sort by text score first, then by createdAt
    if (filter.$text) {
      mongoQuery.sort({ score: { $meta: 'textScore' }, createdAt: -1 });
    } else {
      mongoQuery.sort({ createdAt: -1 });
    }

    const [logs, total] = await Promise.all([
      mongoQuery.skip(skip).limit(limit).lean(),
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

    // Calculate error rate (errors per hour for last 24h)
    // Note: For accurate error rate (errors/total requests), integration with 
    // request tracking system is needed. Currently showing errors per hour.
    const errorRate = errors24h > 0 ? Number((errors24h / 24).toFixed(2)) : 0;

    return {
      totalErrors,
      last24Hours: errors24h,
      last7Days: errors7d,
      errorRate, // Errors per hour in last 24 hours
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
    const dataMap = new Map<string, { date: string; total: number; byLevel: { error: number; warn: number; fatal: number; debug: number } }>();

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
        const levelKey = error.level as 'error' | 'warn' | 'fatal' | 'debug';
        if (data.byLevel[levelKey] !== undefined) {
          data.byLevel[levelKey]++;
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
    data?: Record<string, unknown>,
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
    const filter: Record<string, unknown> = {};

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

    const filter: Record<string, unknown> = {};

    if (level) {
      filter.level = level;
    }

    if (startDate || endDate) {
      filter.createdAt = {} as Record<string, Date>;
      if (startDate) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    const logs = await this.errorLogModel.find(filter).lean();

    // Generate file based on format (content not used currently, would be uploaded to storage)
    switch (format) {
      case 'csv':
        this.generateCSV(logs);
        break;
      case 'txt':
        this.generateTXT(logs);
        break;
      case 'json':
      default:
        JSON.stringify(logs, null, 2);
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
      if (byLevel[r._id as keyof typeof byLevel] !== undefined) {
        byLevel[r._id as keyof typeof byLevel] = r.count;
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
      level: e.level as ErrorLevel,
      category: e.category as ErrorCategory,
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

  private mapToDto(log: ErrorLog & { _id: unknown; createdAt?: Date }): ErrorLogDto {
    return {
      id: String(log._id),
      level: log.level as ErrorLevel,
      category: log.category as ErrorCategory,
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

  private generateCSV(logs: Array<ErrorLog & { _id: unknown }>): string {
    const headers = ['ID', 'Level', 'Category', 'Message', 'Endpoint', 'Occurrences', 'Last Occurrence'];
    const rows = logs.map((log) => [
      String(log._id),
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

  private generateTXT(logs: ErrorLog[]): string {
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

