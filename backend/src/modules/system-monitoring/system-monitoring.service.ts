import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  HealthCheckService, 
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '../../health/redis-health.indicator';
import { SystemMetric, SystemMetricDocument } from './schemas/system-metric.schema';
import { SystemAlert, SystemAlertDocument } from './schemas/system-alert.schema';
import {
  SystemHealthDto,
  ResourceUsageDto,
  DatabaseMetricsDto,
  ApiPerformanceDto,
  RedisMetricsDto,
  SystemAlertsDto,
  SystemMetricsHistoryDto,
  MetricType,
  TimeRange,
  SystemMetricsQueryDto,
} from './dto/system-monitoring.dto';
import * as os from 'os';

@Injectable()
export class SystemMonitoringService {
  private readonly logger = new Logger(SystemMonitoringService.name);
  private apiMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [] as number[],
    endpointStats: new Map<string, { count: number; totalTime: number; maxTime: number }>(),
  };

  constructor(
    @InjectModel(SystemMetric.name)
    private systemMetricModel: Model<SystemMetricDocument>,
    @InjectModel(SystemAlert.name)
    private systemAlertModel: Model<SystemAlertDocument>,
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private redis: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  // ==================== Real-time Metrics ====================

  async getSystemHealth(): Promise<SystemHealthDto> {
    const [resourceUsage, dbMetrics, redisMetrics] = await Promise.all([
      this.getResourceUsage(),
      this.getDatabaseMetrics(),
      this.getRedisMetrics(),
    ]);

    const apiPerformance = this.getApiPerformance();
    const errorRate = this.calculateErrorRate();

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (
      resourceUsage.cpu.usage > 90 ||
      resourceUsage.memory.usagePercentage > 90 ||
      resourceUsage.disk.usagePercentage > 90 ||
      errorRate > 10
    ) {
      status = 'critical';
    } else if (
      resourceUsage.cpu.usage > 70 ||
      resourceUsage.memory.usagePercentage > 70 ||
      resourceUsage.disk.usagePercentage > 80 ||
      errorRate > 5
    ) {
      status = 'warning';
    }

    return {
      status,
      uptime: process.uptime(),
      cpuUsage: resourceUsage.cpu.usage,
      memoryUsage: resourceUsage.memory.usagePercentage,
      diskUsage: resourceUsage.disk.usagePercentage,
      databaseStatus: {
        connected: dbMetrics.connected,
        responseTime: dbMetrics.responseTime,
        collections: dbMetrics.collectionsCount,
        totalSize: dbMetrics.databaseSize,
      },
      redisStatus: {
        connected: redisMetrics.connected,
        responseTime: redisMetrics.responseTime,
        memoryUsage: redisMetrics.memoryUsagePercentage,
        hitRate: redisMetrics.hitRate,
      },
      avgApiResponseTime: apiPerformance.avgResponseTime,
      activeRequests: 0, // Would be tracked via middleware
      errorRate,
      lastUpdated: new Date(),
    };
  }

  async getResourceUsage(): Promise<ResourceUsageDto> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Calculate CPU usage
    const cpuUsage = this.calculateCPUUsage(cpus);

    // Get disk usage
    const diskUsage = await this.getDiskUsage();

    return {
      timestamp: new Date(),
      cpu: {
        usage: cpuUsage,
        cores: cpus.length,
        load: os.loadavg(),
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercentage: (usedMem / totalMem) * 100,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
      },
      disk: diskUsage,
    };
  }

  async getDatabaseMetrics(): Promise<DatabaseMetricsDto> {
    try {
      const startTime = Date.now();
      const healthCheck = await this.db.pingCheck('database');
      const responseTime = Date.now() - startTime;

      // Get database stats from MongoDB
      const connection = this.systemMetricModel.db;
      const admin = connection.db.admin();
      const dbStats = await admin.listDatabases();
      
      // Get collection stats
      const collections = await connection.db.listCollections().toArray();
      
      // Count total documents (this is approximate and might be slow on large databases)
      let totalDocuments = 0;
      try {
        const collectionsData = await connection.db.collections();
        for (const collection of collectionsData) {
          const count = await collection.countDocuments();
          totalDocuments += count;
        }
      } catch (error) {
        this.logger.warn('Could not count documents:', error);
      }

      return {
        connected: healthCheck.database.status === 'up',
        responseTime,
        collectionsCount: collections.length,
        totalDocuments,
        databaseSize: dbStats.totalSize || 0,
        indexSize: 0, // Would need to calculate from each collection
        activeOperations: 0, // Would get from db.currentOp()
        slowQueries: [], // Would get from system.profile collection
      };
    } catch (error) {
      this.logger.error('Error getting database metrics:', error);
      return {
        connected: false,
        responseTime: 0,
        collectionsCount: 0,
        totalDocuments: 0,
        databaseSize: 0,
        indexSize: 0,
        activeOperations: 0,
        slowQueries: [],
      };
    }
  }

  async getRedisMetrics(): Promise<RedisMetricsDto> {
    try {
      const startTime = Date.now();
      const healthCheck = await this.redis.isHealthy('redis');
      const responseTime = Date.now() - startTime;

      // These would come from actual Redis INFO command
      // For now, returning mock data
      return {
        connected: healthCheck.redis.status === 'up',
        responseTime,
        memoryUsage: 50 * 1024 * 1024, // 50 MB
        maxMemory: 256 * 1024 * 1024, // 256 MB
        memoryUsagePercentage: 19.5,
        keysCount: 1000,
        hitRate: 95.5,
        missRate: 4.5,
        operationsPerSecond: 1000,
      };
    } catch (error) {
      this.logger.error('Error getting Redis metrics:', error);
      return {
        connected: false,
        responseTime: 0,
        memoryUsage: 0,
        maxMemory: 0,
        memoryUsagePercentage: 0,
        keysCount: 0,
        hitRate: 0,
        missRate: 0,
        operationsPerSecond: 0,
      };
    }
  }

  getApiPerformance(): ApiPerformanceDto {
    const total = this.apiMetrics.totalRequests || 1;
    const avgResponseTime = this.apiMetrics.responseTimes.length
      ? this.apiMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.apiMetrics.responseTimes.length
      : 0;

    const slowestEndpoints = Array.from(this.apiMetrics.endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        method: 'GET',
        avgTime: stats.totalTime / stats.count,
        maxTime: stats.maxTime,
        callCount: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    return {
      totalRequests: this.apiMetrics.totalRequests,
      successfulRequests: this.apiMetrics.successfulRequests,
      failedRequests: this.apiMetrics.failedRequests,
      avgResponseTime,
      minResponseTime: Math.min(...this.apiMetrics.responseTimes, 0),
      maxResponseTime: Math.max(...this.apiMetrics.responseTimes, 0),
      requestsPerMinute: this.apiMetrics.totalRequests / (process.uptime() / 60),
      errorRate: (this.apiMetrics.failedRequests / total) * 100,
      slowestEndpoints,
    };
  }

  // ==================== Historical Data ====================

  async getMetricsHistory(query: SystemMetricsQueryDto): Promise<SystemMetricsHistoryDto> {
    const { metricType, timeRange, startDate, endDate } = query;
    
    const dateFilter = this.buildDateFilter(timeRange, startDate, endDate);
    
    const filter: Record<string, unknown> = {
      timestamp: dateFilter,
    };

    if (metricType) {
      filter.metricType = metricType;
    }

    const metrics = await this.systemMetricModel
      .find(filter)
      .sort({ timestamp: 1 })
      .lean();

    const data = metrics.map((m) => ({
      timestamp: m.timestamp,
      value: m.value,
      metadata: m.metadata,
    }));

    const values = data.map((d) => d.value);
    const statistics = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
      current: values[values.length - 1] || 0,
    };

    return {
      metricType: metricType || MetricType.CPU,
      data,
      statistics,
    };
  }

  async getSystemAlerts(): Promise<SystemAlertsDto> {
    const alerts = await this.systemAlertModel
      .find({ resolved: false })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    const mapped = alerts.map((alert) => ({
      id: alert._id.toString(),
      type: alert.type as 'warning' | 'critical' | 'info',
      category: alert.category,
      message: alert.message,
      details: alert.details,
      timestamp: alert.timestamp,
      resolved: alert.resolved,
    }));

    return {
      alerts: mapped,
      activeAlertsCount: alerts.length,
      criticalAlertsCount: alerts.filter((a) => a.type === 'critical').length,
    };
  }

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    await this.systemAlertModel.findByIdAndUpdate(alertId, {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: userId,
    });
  }

  // ==================== Metric Collection (Cron Jobs) ====================

  @Cron(CronExpression.EVERY_MINUTE)
  async collectSystemMetrics() {
    try {
      const resourceUsage = await this.getResourceUsage();

      // Save CPU metrics
      await this.systemMetricModel.create({
        metricType: MetricType.CPU,
        value: resourceUsage.cpu.usage,
        metadata: { cores: resourceUsage.cpu.cores, load: resourceUsage.cpu.load },
        details: { cpu: resourceUsage.cpu },
      });

      // Save Memory metrics
      await this.systemMetricModel.create({
        metricType: MetricType.MEMORY,
        value: resourceUsage.memory.usagePercentage,
        metadata: { total: resourceUsage.memory.total, used: resourceUsage.memory.used },
        details: { memory: resourceUsage.memory },
      });

      // Save Disk metrics
      await this.systemMetricModel.create({
        metricType: MetricType.DISK,
        value: resourceUsage.disk.usagePercentage,
        metadata: { total: resourceUsage.disk.total, used: resourceUsage.disk.used },
        details: { disk: resourceUsage.disk },
      });

      // Check for alerts
      await this.checkForAlerts(resourceUsage);
    } catch (error) {
      this.logger.error('Error collecting system metrics:', error);
    }
  }

  // ==================== Helper Methods ====================

  private calculateCPUUsage(cpus: os.CpuInfo[]): number {
    const cpuUsage = cpus.map((cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return ((total - idle) / total) * 100;
    });

    return cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length;
  }

  private async getDiskUsage(): Promise<{
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  }> {
    // This is platform-specific. On Windows, might need different approach
    // For now, returning mock data
    return {
      total: 500 * 1024 * 1024 * 1024, // 500 GB
      used: 300 * 1024 * 1024 * 1024, // 300 GB
      free: 200 * 1024 * 1024 * 1024, // 200 GB
      usagePercentage: 60,
    };
  }

  private calculateErrorRate(): number {
    const total = this.apiMetrics.totalRequests || 1;
    return (this.apiMetrics.failedRequests / total) * 100;
  }

  private buildDateFilter(
    timeRange?: TimeRange,
    startDate?: string,
    endDate?: string,
  ): Record<string, unknown> {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (timeRange === TimeRange.CUSTOM && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (timeRange) {
        case TimeRange.LAST_HOUR:
          start = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case TimeRange.LAST_7_DAYS:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case TimeRange.LAST_30_DAYS:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case TimeRange.LAST_24_HOURS:
        default:
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
      }
    }

    return { $gte: start, $lte: end };
  }

  private async checkForAlerts(resourceUsage: ResourceUsageDto) {
    // CPU Alert
    if (resourceUsage.cpu.usage > 90) {
      await this.createAlert('critical', 'cpu', 'استخدام CPU مرتفع جداً', `الاستخدام الحالي: ${resourceUsage.cpu.usage.toFixed(2)}%`);
    } else if (resourceUsage.cpu.usage > 70) {
      await this.createAlert('warning', 'cpu', 'استخدام CPU مرتفع', `الاستخدام الحالي: ${resourceUsage.cpu.usage.toFixed(2)}%`);
    }

    // Memory Alert
    if (resourceUsage.memory.usagePercentage > 90) {
      await this.createAlert('critical', 'memory', 'استخدام الذاكرة مرتفع جداً', `الاستخدام الحالي: ${resourceUsage.memory.usagePercentage.toFixed(2)}%`);
    } else if (resourceUsage.memory.usagePercentage > 70) {
      await this.createAlert('warning', 'memory', 'استخدام الذاكرة مرتفع', `الاستخدام الحالي: ${resourceUsage.memory.usagePercentage.toFixed(2)}%`);
    }

    // Disk Alert
    if (resourceUsage.disk.usagePercentage > 90) {
      await this.createAlert('critical', 'disk', 'مساحة القرص منخفضة جداً', `الاستخدام الحالي: ${resourceUsage.disk.usagePercentage.toFixed(2)}%`);
    } else if (resourceUsage.disk.usagePercentage > 80) {
      await this.createAlert('warning', 'disk', 'مساحة القرص منخفضة', `الاستخدام الحالي: ${resourceUsage.disk.usagePercentage.toFixed(2)}%`);
    }
  }

  private async createAlert(type: string, category: string, message: string, details: string) {
    // Check if similar alert already exists in last hour
    const existingAlert = await this.systemAlertModel.findOne({
      type,
      category,
      message,
      resolved: false,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (!existingAlert) {
      await this.systemAlertModel.create({
        type,
        category,
        message,
        details,
      });
    }
  }

  // Public methods to track API metrics (to be called from middleware)
  trackRequest(endpoint: string, responseTime: number, success: boolean) {
    this.apiMetrics.totalRequests++;
    
    if (success) {
      this.apiMetrics.successfulRequests++;
    } else {
      this.apiMetrics.failedRequests++;
    }

    this.apiMetrics.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times to prevent memory issues
    if (this.apiMetrics.responseTimes.length > 1000) {
      this.apiMetrics.responseTimes = this.apiMetrics.responseTimes.slice(-1000);
    }

    // Track endpoint stats
    const stats = this.apiMetrics.endpointStats.get(endpoint) || {
      count: 0,
      totalTime: 0,
      maxTime: 0,
    };

    stats.count++;
    stats.totalTime += responseTime;
    stats.maxTime = Math.max(stats.maxTime, responseTime);

    this.apiMetrics.endpointStats.set(endpoint, stats);
  }
}

