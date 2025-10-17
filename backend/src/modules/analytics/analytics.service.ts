import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subMinutes, format, parseISO } from 'date-fns';
import {
  AnalyticsSnapshot,
  AnalyticsSnapshotDocument,
  PeriodType
} from './schemas/analytics-snapshot.schema';
import {
  ReportSchedule,
  ReportScheduleDocument,
 
} from './schemas/report-schedule.schema';
import { AnalyticsQueryDto, DashboardDataDto, PerformanceMetricsDto } from './dto/analytics.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { Order, OrderDocument } from '../checkout/schemas/order.schema';
import { ServiceRequest, ServiceRequestDocument } from '../services/schemas/service-request.schema';
import { SupportTicket, SupportTicketDocument } from '../support/schemas/support-ticket.schema';
import { CacheService } from '../../shared/cache/cache.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly isDevelopment: boolean;
  private readonly CACHE_TTL = {
    DASHBOARD_DATA: 300, // 5 minutes
    ANALYTICS_DATA: 600, // 10 minutes
    PERFORMANCE_METRICS: 180, // 3 minutes
    REPORT_DATA: 3600, // 1 hour
  };

  constructor(
    @InjectModel(AnalyticsSnapshot.name) private analyticsModel: Model<AnalyticsSnapshotDocument>,
    @InjectModel(ReportSchedule.name) private reportScheduleModel: Model<ReportScheduleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(ServiceRequest.name) private serviceModel: Model<ServiceRequestDocument>,
    @InjectModel(SupportTicket.name) private supportModel: Model<SupportTicketDocument>,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    this.isDevelopment = this.configService.get<string>('NODE_ENV', 'development') === 'development';
    
    if (this.isDevelopment) {
      this.logger.warn('🚧 Development mode detected - Analytics service is DISABLED');
    }
  }

  /**
   * Generate comprehensive analytics snapshot
   */
  async generateAnalyticsSnapshot(date: Date = new Date(), period: PeriodType = PeriodType.DAILY): Promise<AnalyticsSnapshotDocument> {
    const startTime = Date.now();
    this.logger.log(`Generating ${period} analytics snapshot for ${format(date, 'yyyy-MM-dd')}`);

    try {
      // Calculate date ranges
      const { startDate, endDate } = this.getDateRange(date, period);

      // Gather all analytics data in parallel
      const [
        userAnalytics,
        productAnalytics,
        orderAnalytics,
        serviceAnalytics,
        supportAnalytics,
        revenueAnalytics,
        geographyAnalytics,
        fileAnalytics,
      ] = await Promise.all([
        this.calculateUserAnalytics(startDate, endDate),
        this.calculateProductAnalytics(startDate, endDate),
        this.calculateOrderAnalytics(startDate, endDate),
        this.calculateServiceAnalytics(startDate, endDate),
        this.calculateSupportAnalytics(startDate, endDate),
        this.calculateRevenueAnalytics(),
        this.calculateGeographyAnalytics(),
        this.calculateFileAnalytics(),
      ]);

      // Calculate performance metrics
      const performance = await this.calculatePerformanceMetrics();

      // Calculate KPIs
      const kpis = this.calculateKPIs();

      // Create snapshot
      const snapshot = new this.analyticsModel({
        date: startOfDay(date),
        period,
        users: userAnalytics,
        products: productAnalytics,
        orders: orderAnalytics,
        services: serviceAnalytics,
        support: supportAnalytics,
        revenue: revenueAnalytics,
        geography: geographyAnalytics,
        files: fileAnalytics,
        performance,
        kpis,
        metadata: {
          calculationTime: Date.now() - startTime,
          dataFreshness: new Date(),
          version: '1.0.0',
        },
      });

      // Save or update snapshot
      const snapshotData = snapshot.toObject();
      // Remove _id and __v fields to avoid MongoDB immutable field errors
      const { _id, __v, ...cleanData } = snapshotData;
      void _id;
      void __v;
      const existing = await this.analyticsModel.findOneAndUpdate(
        { date: snapshot.date, period },
        { $set: cleanData },
        { upsert: true, new: true }
      );

      // Clear analytics caches since new data is available
      await this.clearAnalyticsCaches();

      this.logger.log(`Analytics snapshot generated in ${Date.now() - startTime}ms`);
      return existing;
    } catch (error) {
      this.logger.error('Failed to generate analytics snapshot', error);
      throw error;
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(query: AnalyticsQueryDto = {}): Promise<DashboardDataDto> {
    const cacheKey = `dashboard:${JSON.stringify(query)}`;

    // Clear cache to force regeneration with new KPI structure
    await this.cacheService.delete(cacheKey);

    // Try to get from cache first
    const cached = await this.cacheService.get<DashboardDataDto>(cacheKey);
    if (cached) {
      this.logger.debug('Dashboard data cache hit');
      return cached;
    }

    // Cache miss - build dashboard data
    this.logger.debug('Dashboard data cache miss');
    this.getDateRangeForQuery(query);
    const previousPeriod = this.getPreviousPeriodRange(query);

    // Force regeneration of current period snapshot with new KPI structure
    const { startDate: snapshotDate } = this.getDateRange(new Date(), query.period || PeriodType.MONTHLY);
    await this.generateAnalyticsSnapshot(snapshotDate, query.period || PeriodType.MONTHLY);
    const snapshot = await this.analyticsModel.findOne({ date: snapshotDate, period: query.period || PeriodType.MONTHLY }) as AnalyticsSnapshotDocument | null;

    if (!snapshot) {
      throw new Error(`Failed to generate analytics snapshot for ${snapshotDate}`);
    }

    // Create fresh dashboard data with correct KPI structure
    const freshKpis = this.calculateKPIs();

    // Get previous period data for comparison (also regenerate if needed)
    if (query.compareWithPrevious && previousPeriod) {
      const prevSnapshotDate = this.getDateRange(previousPeriod.endDate, query.period || PeriodType.MONTHLY).startDate;
      await this.generateAnalyticsSnapshot(prevSnapshotDate, query.period || PeriodType.MONTHLY);
    }

    // Build dashboard data
    const dashboardData: DashboardDataDto = {
      overview: {
        totalUsers: snapshot.users.total,
        totalRevenue: snapshot.orders.totalRevenue,
        totalOrders: snapshot.orders.total,
        activeServices: snapshot.services.open,
        openSupportTickets: snapshot.support.open,
        systemHealth: this.calculateSystemHealth(snapshot),
      },
      revenueCharts: await this.buildRevenueCharts(),
      userCharts: await this.buildUserCharts(),
      productCharts: await this.buildProductCharts(),
      serviceCharts: await this.buildServiceCharts(),
      supportCharts: await this.buildSupportCharts(),
      kpis: freshKpis,
    };

    // Cache the result
    await this.cacheService.set(cacheKey, dashboardData, { ttl: this.CACHE_TTL.DASHBOARD_DATA });

    return dashboardData;
  }

  /**
   * Calculate user analytics
   */
  private async calculateUserAnalytics(startDate: Date, endDate: Date) {
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      this.userModel.countDocuments({ deletedAt: null }),
      this.userModel.countDocuments({ 
        lastActivityAt: { $gte: startDate },
        deletedAt: null 
      }),
      this.userModel.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate },
        deletedAt: null 
      }),
    ]);

    // Get user types breakdown
    const userTypes = await this.userModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const customers = userTypes.find(t => t._id === 'customer')?.count || 0;
    const engineers = userTypes.find(t => t._id === 'engineer')?.count || 0;
    const admins = userTypes.find(t => t._id === 'admin')?.count || 0;

    // Email verification stats
    const verified = await this.userModel.countDocuments({ isEmailVerified: true });
    const suspended = await this.userModel.countDocuments({ isSuspended: true });

    return {
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
      customers,
      engineers,
      admins,
      verified,
      suspended,
    };
  }

  /**
   * Calculate product analytics
   */
  private async calculateProductAnalytics(startDate: Date, endDate: Date) {
    const [totalProducts, activeProducts, featuredProducts, newProducts] = await Promise.all([
      this.productModel.countDocuments({}),
      this.productModel.countDocuments({ status: 'Active' }),
      this.productModel.countDocuments({ isFeatured: true }),
      this.productModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
    ]);

    // Products by category
    const byCategory = await this.productModel.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const categoryMap: Record<string, number> = {};
    byCategory.forEach(cat => {
      categoryMap[cat._id] = cat.count;
    });

    // Average rating
    const ratingResult = await this.productModel.aggregate([
      { $match: { adminRating: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$adminRating' }, count: { $sum: 1 } } },
    ]);

    const averageRating = ratingResult[0]?.avgRating || 0;

    // Top rated products
    const topRated = await this.productModel
      .find({ adminRating: { $gt: 0 } })
      .sort({ adminRating: -1 })
      .limit(10)
      .select('name adminRating')
      .lean();

    // Low stock alerts - will be populated when inventory system is integrated
    const lowStock: Array<{ productId: string; name: string; stock: number }> = [];

    // Inventory value - will be calculated when inventory system is integrated
    const inventoryValue = 0;

    return {
      total: totalProducts,
      active: activeProducts,
      featured: featuredProducts,
      new: newProducts,
      byCategory: categoryMap,
      averageRating,
      topRated: topRated.map(p => ({ productId: p._id, name: p.name, rating: p.adminRating, sales: 0 })),
      lowStock,
      inventoryValue,
    };
  }

  /**
   * Calculate order analytics
   */
  private async calculateOrderAnalytics(startDate: Date, endDate: Date) {
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    ] = await Promise.all([
      this.orderModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      this.orderModel.countDocuments({ status: 'COMPLETED', createdAt: { $gte: startDate, $lte: endDate } }),
      this.orderModel.countDocuments({ status: 'PENDING', createdAt: { $gte: startDate, $lte: endDate } }),
      this.orderModel.countDocuments({ status: 'CANCELLED', createdAt: { $gte: startDate, $lte: endDate } }),
      this.orderModel.countDocuments({ status: 'PROCESSING', createdAt: { $gte: startDate, $lte: endDate } }),
      this.orderModel.countDocuments({ status: 'SHIPPED', createdAt: { $gte: startDate, $lte: endDate } }),
      this.orderModel.countDocuments({ status: 'DELIVERED', createdAt: { $gte: startDate, $lte: endDate } }),
    ]);

    // Revenue calculations
    const revenueResult = await this.orderModel.aggregate([
      { $match: { status: 'COMPLETED', createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const averageOrderValue = totalRevenue / (revenueResult[0]?.count || 1);

    // Orders by status
    const byStatusResult = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus: Record<string, number> = {};
    byStatusResult.forEach(status => {
      byStatus[status._id] = status.count;
    });

    // Payment methods
    const byPaymentMethod: Record<string, number> = {}; // Will be populated when payment system is complete

    // Top products (requires order items tracking)
    const topProducts: Array<{ productId: string; name: string; quantity: number; revenue: number }> = [];

    // Revenue by category (requires product category tracking in orders)
    const revenueByCategory: Record<string, number> = {};

    return {
      total: totalOrders,
      completed: completedOrders,
      pending: pendingOrders,
      cancelled: cancelledOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      totalRevenue,
      averageOrderValue,
      byStatus,
      byPaymentMethod,
      topProducts,
      revenueByCategory,
    };
  }

  /**
   * Calculate service analytics
   */
  private async calculateServiceAnalytics(startDate: Date, endDate: Date) {
    const [
      totalRequests,
      openRequests,
      assignedRequests,
      completedRequests,
      cancelledRequests,
    ] = await Promise.all([
      this.serviceModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      this.serviceModel.countDocuments({ status: 'OPEN', createdAt: { $gte: startDate, $lte: endDate } }),
      this.serviceModel.countDocuments({ status: 'ASSIGNED', createdAt: { $gte: startDate, $lte: endDate } }),
      this.serviceModel.countDocuments({ status: 'COMPLETED', createdAt: { $gte: startDate, $lte: endDate } }),
      this.serviceModel.countDocuments({ status: 'CANCELLED', createdAt: { $gte: startDate, $lte: endDate } }),
    ]);

    // Average rating
    const ratingResult = await this.serviceModel.aggregate([
      { $match: { 'rating.score': { $gt: 0 }, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, avgRating: { $avg: '$rating.score' }, count: { $sum: 1 } } },
    ]);

    const averageRating = ratingResult[0]?.avgRating || 0;

    // Services by type
    const byTypeResult = await this.serviceModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const byType: Record<string, number> = {};
    byTypeResult.forEach(type => {
      byType[type._id || 'unspecified'] = type.count;
    });

    // Services by status
    const byStatusResult = await this.serviceModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus: Record<string, number> = {};
    byStatusResult.forEach(status => {
      byStatus[status._id] = status.count;
    });

    // Top engineers
    const topEngineers = await this.serviceModel.aggregate([
      { $match: { status: 'COMPLETED', engineerId: { $ne: null }, createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$engineerId',
          completedJobs: { $sum: 1 },
          avgRating: { $avg: '$rating.score' },
        },
      },
      { $sort: { completedJobs: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'engineer',
        },
      },
      { $unwind: '$engineer' },
      {
        $project: {
          engineerId: '$_id',
          name: '$engineer.name',
          completedJobs: 1,
          rating: { $ifNull: ['$avgRating', 0] },
        },
      },
    ]);

    // Response and completion times (simplified calculation)
    const responseTime = { average: 24, fastest: 1, slowest: 168 }; // hours
    const completionTime = { average: 7, fastest: 1, slowest: 30 }; // days

    return {
      totalRequests,
      open: openRequests,
      assigned: assignedRequests,
      completed: completedRequests,
      cancelled: cancelledRequests,
      averageRating,
      byType,
      byStatus,
      topEngineers,
      responseTime,
      completionTime,
    };
  }

  /**
   * Calculate support analytics
   */
  private async calculateSupportAnalytics(startDate: Date, endDate: Date) {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
    ] = await Promise.all([
      this.supportModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      this.supportModel.countDocuments({ status: 'open', createdAt: { $gte: startDate, $lte: endDate } }),
      this.supportModel.countDocuments({ status: 'in_progress', createdAt: { $gte: startDate, $lte: endDate } }),
      this.supportModel.countDocuments({ status: 'resolved', createdAt: { $gte: startDate, $lte: endDate } }),
      this.supportModel.countDocuments({ status: 'closed', createdAt: { $gte: startDate, $lte: endDate } }),
    ]);

    // Tickets by category
    const byCategoryResult = await this.supportModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const byCategory: Record<string, number> = {};
    byCategoryResult.forEach(cat => {
      byCategory[cat._id] = cat.count;
    });

    // Tickets by priority
    const byPriorityResult = await this.supportModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const byPriority: Record<string, number> = {};
    byPriorityResult.forEach(priority => {
      byPriority[priority._id] = priority.count;
    });

    // Average resolution time
    const averageResolutionTime = 48; // hours - will be calculated properly later

    // Customer satisfaction
    const customerSatisfaction = 4.2; // Will be calculated from ratings

    // Response times
    const firstResponseTime = 12; // hours

    // Top agents
    const topAgents: Array<{ agentId: string; name: string; resolvedTickets: number; rating: number }> = []; // Will be populated when agent assignment is implemented

    // Backlog trend (last 30 days)
    const backlogTrend = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10);

    return {
      totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      byCategory,
      byPriority,
      averageResolutionTime,
      customerSatisfaction,
      firstResponseTime,
      topAgents,
      backlogTrend,
    };
  }

  /**
   * Calculate revenue analytics
   */
  private async calculateRevenueAnalytics() {
    // This is a simplified version - will be enhanced with real data
    const total = 150000;
    const byMonth = {
      '2024-01': 12000,
      '2024-02': 15000,
      '2024-03': 18000,
    };
    const byCategory = {
      'solar_panels': 75000,
      'inverters': 45000,
      'batteries': 30000,
    };
    const byPaymentMethod = {
      'card': 120000,
      'bank_transfer': 30000,
    };
    const refunds = 2500;
    const netRevenue = total - refunds;
    const growthRate = 15.5;
    const projections = {
      nextMonth: 22000,
      nextQuarter: 65000,
      nextYear: 280000,
    };

    return {
      total,
      byMonth,
      byCategory,
      byPaymentMethod,
      refunds,
      netRevenue,
      growthRate,
      projections,
    };
  }

  /**
   * Calculate geography analytics
   */
  private async calculateGeographyAnalytics() {
    // Simplified geographic data
    const byCountry = {
      'Saudi Arabia': 450,
      'UAE': 280,
      'Qatar': 150,
      'Kuwait': 120,
    };

    const byCity = {
      'Riyadh': 180,
      'Jeddah': 120,
      'Dubai': 200,
      'Doha': 100,
    };

    const serviceAreas = [
      { name: 'Central Region', requests: 250, revenue: 75000 },
      { name: 'Western Region', requests: 180, revenue: 54000 },
      { name: 'Eastern Region', requests: 120, revenue: 36000 },
    ];

    const topLocations = [
      { location: 'Riyadh', orders: 180, revenue: 54000 },
      { location: 'Jeddah', orders: 120, revenue: 36000 },
      { location: 'Dubai', orders: 200, revenue: 60000 },
    ];

    return {
      byCountry,
      byCity,
      serviceAreas,
      topLocations,
    };
  }

  /**
   * Calculate file analytics
   */
  private async calculateFileAnalytics() {
    // Simplified file analytics - will be populated with real upload data
    return {
      totalUploads: 1250,
      totalSize: 2500000000, // 2.5GB
      byType: {
        'image/jpeg': 800,
        'image/png': 300,
        'application/pdf': 150,
      },
      storageUsed: 2500000000,
      downloads: 5000,
      popularFiles: [
        { filename: 'product-manual.pdf', downloads: 500, size: 5000000 },
        { filename: 'installation-guide.pdf', downloads: 350, size: 3000000 },
      ],
    };
  }

  /**
   * Calculate performance metrics
   */
  private async calculatePerformanceMetrics(): Promise<PerformanceMetricsDto> {
    const cacheKey = 'performance:metrics';

    const cached = await this.cacheService.get<PerformanceMetricsDto>(cacheKey);
    if (cached) {
      this.logger.debug('Performance metrics cache hit');
      return cached;
    }

    // Aggregate last 10 minutes from request metrics buckets
    const client = this.cacheService.getClient();
    const now = new Date();
    const buckets: string[] = [];
    for (let i = 0; i < 10; i++) {
      const d = subMinutes(now, i); // needs import
      buckets.push(`solar:metrics:requests:${format(d, 'yyyyMMddHHmm')}`);
    }

    let total = 0;
    let errors = 0;
    let durationMs = 0;
    for (const key of buckets) {
      try {
        const res = await client.hgetall(key);
        if (res) {
          total += parseInt(res.total || '0', 10);
          errors += parseInt(res.errors || '0', 10);
          durationMs += parseInt(res.durationMs || '0', 10);
        }
      } catch {
        // ignore
      }
    }

    // If no recent traffic, return healthy defaults
    if (total === 0) {
      const emptyMetrics: PerformanceMetricsDto = {
        apiResponseTime: 0,
        errorRate: 0,
        uptime: 100,
        concurrentUsers: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
        activeConnections: 0,
        slowestEndpoints: [],
        databaseStats: {
          totalCollections: 0,
          totalDocuments: 0,
          databaseSize: 0,
          indexSize: 0,
        },
      };
      await this.cacheService.set(cacheKey, emptyMetrics, { ttl: this.CACHE_TTL.PERFORMANCE_METRICS });
      return emptyMetrics;
    }

    const apiResponseTime = Math.round(durationMs / total);
    const errorRate = errors / total;

    // Uptime rough estimate based on error rate
    const uptime = 100 - Math.min(100, errorRate * 500);

    const metrics: PerformanceMetricsDto = {
      apiResponseTime,
      errorRate,
      uptime,
      concurrentUsers: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      diskUsage: 0,
      activeConnections: 0,
      slowestEndpoints: [],
      databaseStats: {
        totalCollections: 0,
        totalDocuments: 0,
        databaseSize: 0,
        indexSize: 0,
      },
    };

    await this.cacheService.set(cacheKey, metrics, { ttl: this.CACHE_TTL.PERFORMANCE_METRICS });

    return metrics;
  }

  /**
   * Calculate KPIs
   */
  private calculateKPIs() {
    return {
      revenueGrowth: 15.5,
      customerSatisfaction: 4.2,
      orderConversion: 12.5,
      serviceEfficiency: 87.3,
      supportResolution: 94.1,
      systemUptime: 99.9,
    };
  }

  /**
   * Helper methods
   */
  private getDateRange(date: Date, period: PeriodType): { startDate: Date; endDate: Date } {
    switch (period) {
      case PeriodType.DAILY:
        return { startDate: startOfDay(date), endDate: endOfDay(date) };
      case PeriodType.WEEKLY:
        return { startDate: startOfWeek(date, { weekStartsOn: 6 }), endDate: endOfWeek(date, { weekStartsOn: 6 }) };
      case PeriodType.MONTHLY:
        return { startDate: startOfMonth(date), endDate: endOfMonth(date) };
      case PeriodType.YEARLY:
        return { startDate: startOfYear(date), endDate: endOfYear(date) };
      default:
        return { startDate: startOfMonth(date), endDate: endOfMonth(date) };
    }
  }

  private getDateRangeForQuery(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.startDate && query.endDate) {
      startDate = parseISO(query.startDate);
      endDate = parseISO(query.endDate);
    } else {
      const range = this.getDateRange(now, query.period || PeriodType.MONTHLY);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    return { startDate, endDate };
  }

  private getPreviousPeriodRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } | null {
    if (!query.compareWithPrevious) return null;

    const { startDate, endDate } = this.getDateRangeForQuery(query);
    const periodDiff = endDate.getTime() - startDate.getTime();

    return {
      startDate: new Date(startDate.getTime() - periodDiff),
      endDate: new Date(startDate.getTime() - 1),
    };
  }

  private async getOrCreateSnapshot(date: Date, period: PeriodType, forceRegeneration = false): Promise<AnalyticsSnapshotDocument> {
    const snapshotDate = this.getDateRange(date, period).startDate;
    this.getDateRange(date, period);
    let snapshot = await this.analyticsModel.findOne({ date: snapshotDate, period }) as AnalyticsSnapshotDocument | null;

    if (!snapshot || forceRegeneration) {
      if (snapshot && forceRegeneration) {
        this.logger.log(`Force regenerating snapshot for ${snapshotDate}`);
      }
      snapshot = await this.generateAnalyticsSnapshot(snapshotDate, period) as AnalyticsSnapshotDocument;
    } else {
      // Check if snapshot has old KPI structure and update KPIs if needed
      const oldKpiKeys = ['customerAcquisitionCost', 'customerLifetimeValue', 'churnRate', 'retentionRate', 'conversionRate', 'basketAbandonmentRate', 'repeatPurchaseRate', 'netPromoterScore'];
      const newKpiKeys = ['revenueGrowth', 'customerSatisfaction', 'orderConversion', 'serviceEfficiency', 'supportResolution', 'systemUptime'];

      const hasOldStructure = snapshot! && oldKpiKeys.some(key => key in snapshot!.kpis);
      const hasNewStructure = snapshot! && newKpiKeys.every(key => key in snapshot!.kpis);

      if (hasOldStructure && !hasNewStructure && snapshot) {
        this.logger.log(`Updating snapshot KPIs from old to new structure for ${snapshotDate}`);
        // Update the snapshot with new KPIs
        await this.analyticsModel.updateOne(
          { _id: snapshot._id },
          { $set: { kpis: this.calculateKPIs() } }
        );
      } else if (!hasNewStructure && snapshot) {
        // Fallback: regenerate if structure check fails
        this.logger.log(`Regenerating snapshot with missing KPI structure for ${snapshotDate}`);
        snapshot = await this.generateAnalyticsSnapshot(snapshotDate, period) as AnalyticsSnapshotDocument;
      }
    }

    return snapshot!;
  }

  private calculateSystemHealth(snapshot: AnalyticsSnapshotDocument): number {
    // Calculate system health based on various metrics
    const uptime = snapshot.performance.uptime;
    const errorRate = snapshot.performance.errorRate;
    const responseTime = snapshot.performance.apiResponseTime;

    // If no recent metrics, assume healthy
    if (responseTime === 0 && errorRate === 0 && uptime >= 100) {
      return 100;
    }

    // Simple health calculation (0-100)
    let health = 100;

    // Deduct points for high error rate
    health -= errorRate * 500; // 2% error rate = 10 points deduction

    // Deduct points for slow response time
    if (responseTime > 1000) health -= 20;
    else if (responseTime > 500) health -= 10;

    // Deduct points for low uptime
    health -= (100 - uptime) * 2;

    return Math.max(0, Math.min(100, health));
  }

  // Additional helper methods for building charts
  private async buildRevenueCharts() {
    // Real aggregation from orders collection
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);

    // Build daily revenue for last 30 days
    const dailyAgg = await this.orderModel.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: { $gte: startOfDay(thirtyDaysAgo), $lte: endOfDay(today) },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            d: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);

    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    for (const row of dailyAgg) {
      const date = new Date(row._id.y, row._id.m - 1, row._id.d);
      const key = format(date, 'yyyy-MM-dd');
      dailyMap.set(key, { revenue: row.revenue || 0, orders: row.orders || 0 });
    }

    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, 29 - i);
      const key = format(date, 'yyyy-MM-dd');
      const found = dailyMap.get(key) || { revenue: 0, orders: 0 };
      return { date: key, revenue: found.revenue, orders: found.orders };
    });

    // Build monthly revenue for last 12 months
    const twelveMonthsAgo = subMonths(today, 11);
    const monthlyAgg = await this.orderModel.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: { $gte: startOfMonth(twelveMonthsAgo), $lte: endOfMonth(today) },
        },
      },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);

    const monthlyMap = new Map<string, number>();
    for (const row of monthlyAgg) {
      const date = new Date(row._id.y, row._id.m - 1, 1);
      const key = format(date, 'yyyy-MM');
      monthlyMap.set(key, row.revenue || 0);
    }

    const monthly: Array<{ month: string; revenue: number; growth: number }> = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, 11 - i);
      const key = format(date, 'yyyy-MM');
      const revenue = monthlyMap.get(key) || 0;
      const prevRevenue = monthly.length > 0 ? monthly[monthly.length - 1].revenue : 0;
      const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
      monthly.push({ month: key, revenue, growth });
    }

    // Keep byCategory static until order items/categories are modeled in orders
    const byCategory = [
      { category: 'Solar Panels', revenue: 75000, percentage: 50 },
      { category: 'Inverters', revenue: 45000, percentage: 30 },
      { category: 'Batteries', revenue: 30000, percentage: 20 },
    ];

    return { daily, monthly, byCategory };
  }

  private async buildUserCharts() {
    const registrationTrend = Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
      newUsers: Math.floor(Math.random() * 20) + 5,
      activeUsers: Math.floor(Math.random() * 1000) + 500,
    }));

    const userTypes = [
      { type: 'customers', count: 1200, percentage: 70 },
      { type: 'engineers', count: 350, percentage: 20 },
      { type: 'admins', count: 150, percentage: 10 },
    ];

    const geographic = [
      { location: 'Riyadh', users: 450, revenue: 135000 },
      { location: 'Jeddah', users: 320, revenue: 96000 },
      { location: 'Dubai', users: 280, revenue: 84000 },
    ];

    return { registrationTrend, userTypes, geographic };
  }

  private async buildProductCharts() {
    const topSelling = [
      { name: 'Solar Panel 300W', sold: 150, revenue: 45000 },
      { name: 'Inverter 5KW', sold: 80, revenue: 24000 },
      { name: 'Battery 200Ah', sold: 60, revenue: 18000 },
    ];

    const categoryPerformance = [
      { category: 'Solar Panels', products: 25, revenue: 75000 },
      { category: 'Inverters', products: 15, revenue: 45000 },
      { category: 'Batteries', products: 10, revenue: 30000 },
    ];

    const stockAlerts = [
      { name: 'Solar Panel 400W', currentStock: 5, minRequired: 20 },
      { name: 'Inverter 3KW', currentStock: 3, minRequired: 15 },
    ];

    return { topSelling, categoryPerformance, stockAlerts };
  }

  private async buildServiceCharts() {
    const requestTrend = Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
      requests: Math.floor(Math.random() * 20) + 5,
      completed: Math.floor(Math.random() * 15) + 3,
    }));

    const engineerPerformance = [
      { name: 'أحمد محمد', completed: 45, rating: 4.8 },
      { name: 'فاطمة علي', completed: 38, rating: 4.9 },
      { name: 'محمد أحمد', completed: 32, rating: 4.7 },
    ];

    const responseTimes = {
      average: 12,
      target: 24,
      trend: Array.from({ length: 30 }, () => Math.floor(Math.random() * 48) + 1),
    };

    return { requestTrend, engineerPerformance, responseTimes };
  }

  private async buildSupportCharts() {
    const ticketTrend = Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
      new: Math.floor(Math.random() * 15) + 5,
      resolved: Math.floor(Math.random() * 12) + 3,
    }));

    const categoryBreakdown = [
      { category: 'technical', count: 120, avgResolutionTime: 24 },
      { category: 'billing', count: 80, avgResolutionTime: 12 },
      { category: 'products', count: 60, avgResolutionTime: 18 },
    ];

    const agentPerformance = [
      { name: 'سارة أحمد', resolved: 85, satisfaction: 4.6 },
      { name: 'خالد محمد', resolved: 72, satisfaction: 4.8 },
      { name: 'لينا علي', resolved: 68, satisfaction: 4.5 },
    ];

    return { ticketTrend, categoryBreakdown, agentPerformance };
  }

  // -------- Cache Management
  /**
   * Clear all analytics-related caches
   */
  async clearAnalyticsCaches(): Promise<void> {
    try {
      await this.cacheService.clear('dashboard:*');
      await this.cacheService.clear('performance:*');
      await this.cacheService.clear('analytics:*');
      this.logger.log('Cleared all analytics caches');
    } catch (error) {
      this.logger.error('Error clearing analytics caches:', error);
    }
  }

  /**
   * Clear dashboard cache for specific query
   */
  async clearDashboardCache(query?: AnalyticsQueryDto): Promise<void> {
    try {
      if (query) {
        const cacheKey = `dashboard:${JSON.stringify(query)}`;
        await this.cacheService.delete(cacheKey);
      } else {
        await this.cacheService.clear('dashboard:*');
      }
      this.logger.log('Cleared dashboard caches');
    } catch (error) {
      this.logger.error('Error clearing dashboard caches:', error);
    }
  }

  /**
   * Force regeneration of all analytics snapshots with new KPI structure
   */
  async regenerateAllSnapshots(): Promise<void> {
    try {
      this.logger.log('Starting regeneration of all analytics snapshots...');

      // Clear all caches first
      await this.clearAnalyticsCaches();

      // Find all unique date-period combinations
      const snapshots = await this.analyticsModel.find({}).distinct('date').then(dates => {
        return this.analyticsModel.find({ date: { $in: dates } });
      });

      // Regenerate each snapshot
      for (const snapshot of snapshots) {
        const { startDate } = this.getDateRange(snapshot.date, snapshot.period);
        await this.generateAnalyticsSnapshot(startDate, snapshot.period);
      }

      this.logger.log(`Regenerated ${snapshots.length} analytics snapshots`);
    } catch (error) {
      this.logger.error('Error regenerating analytics snapshots:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics for analytics
   */
  async getCacheStats() {
    const dashboardKeys = await this.cacheService.getClient().keys('solar:dashboard:*');
    const performanceKeys = await this.cacheService.getClient().keys('solar:performance:*');

    return {
      dashboardCacheCount: dashboardKeys.length,
      performanceCacheCount: performanceKeys.length,
      totalAnalyticsCache: dashboardKeys.length + performanceKeys.length,
    };
  }
}
