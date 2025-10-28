import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, format, parseISO } from 'date-fns';

/**
 * Analytics Service
 * 
 * NOTE: All monetary values are in USD (US Dollars)
 * All revenue, pricing, and financial calculations use USD as the base currency
 */
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
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Variant, VariantDocument } from '../products/schemas/variant.schema';
import { Order, OrderDocument } from '../checkout/schemas/order.schema';
import { ServiceRequest, ServiceRequestDocument } from '../services/schemas/service-request.schema';
import { SupportTicket, SupportTicketDocument } from '../support/schemas/support-ticket.schema';
import { CacheService } from '../../shared/cache/cache.service';
import { SystemMonitoringService } from '../system-monitoring/system-monitoring.service';
import { ErrorLogsService } from '../error-logs/error-logs.service';

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
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(ServiceRequest.name) private serviceModel: Model<ServiceRequestDocument>,
    @InjectModel(SupportTicket.name) private supportModel: Model<SupportTicketDocument>,
    private cacheService: CacheService,
    private configService: ConfigService,
    private systemMonitoring: SystemMonitoringService,
    private errorLogsService: ErrorLogsService,
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
      const kpis = await this.calculateKPIs();

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

    // Try to get from cache first (don't clear cache to prevent forcing regeneration)
    const cached = await this.cacheService.get<DashboardDataDto>(cacheKey);
    if (cached) {
      this.logger.debug('Dashboard data cache hit');
      return cached;
    }

    this.logger.debug('Dashboard data cache miss');

    const period = query.period || PeriodType.MONTHLY;
    const { startDate } = this.getDateRange(new Date(), period);

    // ثبّت التاريخ (بداية اليوم UTC) حتى يطابق المستند
    const snapshotDate = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    ));

    // جرّب توليد السناپشوت لكن بمهلة 3s
    try {
      await Promise.race([
        this.generateAnalyticsSnapshot(snapshotDate, period),
        new Promise((_, rej) => setTimeout(() => rej(new Error('SNAPSHOT_TIMEOUT')), 3000))
      ]).catch(() => this.logger.warn('Snapshot generation timed out — serving last available snapshot'));
    } catch (error) {
      this.logger.warn('Snapshot generation failed, proceeding with existing data');
    }

    // حاول تجيب نفس التاريخ؛ وإلا خُذ آخر واحد
    let snapshot = await this.analyticsModel.findOne({ date: snapshotDate, period }).lean();
    if (!snapshot) {
      snapshot = await this.analyticsModel.findOne({ period }).sort({ date: -1 }).lean();
    }

    if (!snapshot) {
      // رجّع هيكل خفيف بدل التعليق
      const empty: DashboardDataDto = {
        overview: { totalUsers: 0, totalRevenue: 0, totalOrders: 0, activeServices: 0, openSupportTickets: 0, systemHealth: 0 },
        revenueCharts: {
          daily: [],
          monthly: [],
          byCategory: []
        },
        userCharts: {
          registrationTrend: [],
          userTypes: [],
          geographic: []
        },
        productCharts: {
          topSelling: [],
          categoryPerformance: [],
          stockAlerts: []
        },
        serviceCharts: {
          requestTrend: [],
          engineerPerformance: [],
          responseTimes: { average: 0, target: 0, trend: [] }
        },
        supportCharts: {
          ticketTrend: [],
          categoryBreakdown: [],
          agentPerformance: []
        },
        kpis: {
          revenueGrowth: 0,
          customerSatisfaction: 0,
          orderConversion: 0,
          serviceEfficiency: 0,
          supportResolution: 0,
          systemUptime: 0
        }
      };
      await this.cacheService.set(cacheKey, empty, { ttl: this.CACHE_TTL.DASHBOARD_DATA });
      return empty;
    }

    // قياسات زمنية لمعرفة موضع البطء
    const t0 = Date.now();
    const freshKpis = await this.calculateKPIs();
    this.logger.debug(`calculateKPIs took ${Date.now() - t0}ms`);

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
      this.productModel.countDocuments({ deletedAt: null }),
      this.productModel.countDocuments({ status: 'active', deletedAt: null }),
      this.productModel.countDocuments({ isFeatured: true, deletedAt: null }),
      this.productModel.countDocuments({ createdAt: { $gte: startDate, $lte: endDate }, deletedAt: null }),
    ]);

    // Products by category
    const byCategory = await this.productModel.aggregate([
      { $match: { status: 'active', deletedAt: null } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const categoryMap: Record<string, number> = {};
    byCategory.forEach(cat => {
      categoryMap[cat._id] = cat.count;
    });

    // Average rating
    const ratingResult = await this.productModel.aggregate([
      { $match: { averageRating: { $gt: 0 }, deletedAt: null } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' }, count: { $sum: 1 } } },
    ]);

    const averageRating = ratingResult[0]?.avgRating || 0;

    // Top rated products
    const topRated = await this.productModel
      .find({ averageRating: { $gt: 0 }, deletedAt: null })
      .sort({ averageRating: -1 })
      .limit(10)
      .select('name averageRating')
      .lean();

    // Low stock alerts - البحث في Variants
    const lowStockVariants = await this.variantModel.aggregate([
      {
        $match: {
          trackInventory: true,
          deletedAt: null,
          isActive: true,
          $expr: { $lte: ['$stock', '$minStock'] }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productId: '$productId',
          name: '$product.name',
          stock: '$stock'
        }
      }
    ]);

    const lowStock = lowStockVariants.map(v => ({
      productId: v.productId.toString(),
      name: v.name,
      stock: v.stock
    }));

    // Inventory value - حساب من Variants
    const inventoryResult = await this.variantModel.aggregate([
      {
        $match: {
          trackInventory: true,
          deletedAt: null,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: ['$stock', '$basePriceUSD']
            }
          }
        }
      }
    ]);

    const inventoryValue = inventoryResult[0]?.totalValue || 0;

    return {
      total: totalProducts,
      active: activeProducts,
      featured: featuredProducts,
      new: newProducts,
      byCategory: categoryMap,
      averageRating,
      topRated: topRated.map(p => ({ productId: p._id, name: p.name, rating: p.averageRating, sales: 0 })),
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

    // Payment methods - حساب من البيانات الحقيقية
    const paymentMethodResult = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
    ]);

    const byPaymentMethod: Record<string, number> = {};
    paymentMethodResult.forEach(method => {
      byPaymentMethod[method._id || 'unknown'] = method.count;
    });

    // Top products - حساب من بيانات الطلبات الفعلية
    const topProductsResult = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.snapshot.name' },
          quantity: { $sum: '$items.qty' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

    const topProducts = topProductsResult.map(product => ({
      productId: product._id.toString(),
      name: product.name,
      quantity: product.quantity,
      revenue: product.revenue,
    }));

    // Revenue by category - حساب من بيانات الطلبات الفعلية
    const categoryRevenueResult = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.snapshot.categoryName',
          revenue: { $sum: '$items.lineTotal' },
        },
      },
    ]);

    const revenueByCategory: Record<string, number> = {};
    categoryRevenueResult.forEach(cat => {
      revenueByCategory[cat._id || 'غير محدد'] = cat.revenue;
    });

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

    // Calculate response and completion times from actual data
    const timeMetricsResult = await this.serviceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'COMPLETED',
          assignedAt: { $exists: true },
          completedAt: { $exists: true },
        },
      },
      {
        $project: {
          responseTimeHours: {
            $divide: [
              { $subtract: ['$assignedAt', '$createdAt'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
          completionTimeDays: {
            $divide: [
              { $subtract: ['$completedAt', '$assignedAt'] },
              1000 * 60 * 60 * 24, // Convert to days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTimeHours' },
          minResponseTime: { $min: '$responseTimeHours' },
          maxResponseTime: { $max: '$responseTimeHours' },
          avgCompletionTime: { $avg: '$completionTimeDays' },
          minCompletionTime: { $min: '$completionTimeDays' },
          maxCompletionTime: { $max: '$completionTimeDays' },
        },
      },
    ]);

    const timeMetrics = timeMetricsResult[0];
    const responseTime = {
      average: Math.round((timeMetrics?.avgResponseTime || 24) * 100) / 100,
      fastest: Math.round((timeMetrics?.minResponseTime || 1) * 100) / 100,
      slowest: Math.round((timeMetrics?.maxResponseTime || 168) * 100) / 100,
    };

    const completionTime = {
      average: Math.round((timeMetrics?.avgCompletionTime || 7) * 100) / 100,
      fastest: Math.round((timeMetrics?.minCompletionTime || 1) * 100) / 100,
      slowest: Math.round((timeMetrics?.maxCompletionTime || 30) * 100) / 100,
    };

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

    // Calculate average resolution time from actual data
    const resolutionTimeResult = await this.supportModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['resolved', 'closed'] },
          resolvedAt: { $exists: true },
        },
      },
      {
        $project: {
          resolutionTimeHours: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTimeHours' },
        },
      },
    ]);

    const averageResolutionTime = Math.round((resolutionTimeResult[0]?.avgResolutionTime || 48) * 100) / 100;

    // Calculate customer satisfaction from ratings
    const satisfactionResult = await this.supportModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'rating.score': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          avgSatisfaction: { $avg: '$rating.score' },
        },
      },
    ]);

    const customerSatisfaction = Math.round((satisfactionResult[0]?.avgSatisfaction || 4.2) * 100) / 100;

    // Calculate first response time
    const firstResponseResult = await this.supportModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'messages.createdAt': { $exists: true },
        },
      },
      {
        $project: {
          firstResponseTimeHours: {
            $divide: [
              { $subtract: ['$messages.createdAt', '$createdAt'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgFirstResponseTime: { $avg: '$firstResponseTimeHours' },
        },
      },
    ]);

    const firstResponseTime = Math.round((firstResponseResult[0]?.avgFirstResponseTime || 12) * 100) / 100;

    // Get top agents (if agent assignment is implemented)
    const topAgentsResult = await this.supportModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          assignedTo: { $exists: true, $ne: null },
          status: { $in: ['resolved', 'closed'] },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          resolvedTickets: { $sum: 1 },
          avgRating: { $avg: '$rating.score' },
        },
      },
      { $sort: { resolvedTickets: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      {
        $project: {
          agentId: '$_id',
          name: { $concat: ['$agent.firstName', ' ', '$agent.lastName'] },
          resolvedTickets: 1,
          rating: { $ifNull: ['$avgRating', 0] },
        },
      },
    ]);

    const topAgents = topAgentsResult.map(agent => ({
      agentId: agent.agentId.toString(),
      name: agent.name.trim() || 'Unknown Agent',
      resolvedTickets: agent.resolvedTickets,
      rating: Math.round(agent.rating * 100) / 100,
    }));

    // Generate backlog trend from actual data (last 30 days)
    const backlogTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const dayBacklog = await this.supportModel.countDocuments({
        createdAt: { $lt: nextDate },
        status: { $in: ['open', 'in_progress'] },
      });
      
      backlogTrend.push(dayBacklog);
    }

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
    // Get real revenue data from completed orders
    const totalRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const total = totalRevenueResult[0]?.totalRevenue || 0;

    // Get revenue by month for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const byMonth: Record<string, number> = {};
    monthlyRevenueResult.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      byMonth[monthKey] = item.revenue;
    });

    // Get revenue by category
    const categoryRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          revenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
        },
      },
    ]);

    const byCategory: Record<string, number> = {};
    categoryRevenueResult.forEach(item => {
      byCategory[item._id] = item.revenue;
    });

    // Get revenue by payment method
    const paymentMethodResult = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const byPaymentMethod: Record<string, number> = {};
    paymentMethodResult.forEach(item => {
      byPaymentMethod[item._id || 'unknown'] = item.revenue;
    });

    // Calculate refunds (orders with refund status)
    const refundsResult = await this.orderModel.aggregate([
      {
        $match: {
          status: 'REFUNDED',
        },
      },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: '$totalAmount' },
        },
      },
    ]);

    const refunds = refundsResult[0]?.totalRefunds || 0;
    const netRevenue = total - refunds;

    // Calculate growth rate (compare last 30 days with previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [currentPeriodRevenue, previousPeriodRevenue] = await Promise.all([
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ['COMPLETED', 'DELIVERED'] },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
            status: { $in: ['COMPLETED', 'DELIVERED'] },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const currentRevenue = currentPeriodRevenue[0]?.revenue || 0;
    const previousRevenue = previousPeriodRevenue[0]?.revenue || 0;
    const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Simple projections based on current growth rate
    const projections = {
      nextMonth: currentRevenue * (1 + growthRate / 100),
      nextQuarter: currentRevenue * 3 * (1 + growthRate / 100),
      nextYear: currentRevenue * 12 * (1 + growthRate / 100),
    };

    return {
      total,
      byMonth,
      byCategory,
      byPaymentMethod,
      refunds,
      netRevenue,
      growthRate: Math.round(growthRate * 100) / 100,
      projections,
    };
  }

  /**
   * Calculate geography analytics
   */
  private async calculateGeographyAnalytics() {
    // Get users by country
    const usersByCountryResult = await this.userModel.aggregate([
      {
        $match: {
          deletedAt: null,
          'address.country': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$address.country',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byCountry: Record<string, number> = {};
    usersByCountryResult.forEach(item => {
      byCountry[item._id] = item.count;
    });

    // Get users by city
    const usersByCityResult = await this.userModel.aggregate([
      {
        $match: {
          deletedAt: null,
          'address.city': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const byCity: Record<string, number> = {};
    usersByCityResult.forEach(item => {
      byCity[item._id] = item.count;
    });

    // Get service areas from service requests
    const serviceAreasResult = await this.serviceModel.aggregate([
      {
        $match: {
          deletedAt: null,
          'address.city': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$address.city',
          requests: { $sum: 1 },
        },
      },
      { $sort: { requests: -1 } },
      { $limit: 5 },
    ]);

    const serviceAreas = serviceAreasResult.map(area => ({
      name: area._id,
      requests: area.requests,
      revenue: 0, // Would need to calculate from completed services
    }));

    // Get top locations by orders and revenue
    const topLocationsResult = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
          'shippingAddress.city': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$shippingAddress.city',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    const topLocations = topLocationsResult.map(location => ({
      location: location._id,
      orders: location.orders,
      revenue: location.revenue,
    }));

    return {
      byCountry,
      byCity,
      serviceAreas,
      topLocations,
    };
  }

  /**
   * Calculate file analytics from actual media data
   */
  private async calculateFileAnalytics() {
    try {
      // Import Media schema dynamically to avoid circular dependency
      const { MediaSchema } = await import('../upload/schemas/media.schema');
      const mediaModel = this.orderModel.db.model('Media', MediaSchema);
    
    // Get total uploads
    const totalUploads = await mediaModel.countDocuments({ deletedAt: null });
    
    // Get total size
    const sizeResult = await mediaModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } },
    ]);
    const totalSize = sizeResult[0]?.totalSize || 0;
    
    // Get files by type
    const byTypeResult = await mediaModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$mimeType', count: { $sum: 1 } } },
    ]);
    
    const byType: Record<string, number> = {};
    byTypeResult.forEach(type => {
      byType[type._id] = type.count;
    });
    
    // Get storage used (same as total size for now)
    const storageUsed = totalSize;
    
    // Get downloads/usage count
    const usageResult = await mediaModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } },
    ]);
    const downloads = usageResult[0]?.totalUsage || 0;
    
    // Get popular files (most used)
    const popularFilesResult = await mediaModel
      .find({ deletedAt: null })
      .sort({ usageCount: -1 })
      .limit(10)
      .select('name usageCount mimeType size')
      .lean();
    
      const popularFiles = popularFilesResult.map(file => ({
        name: file.name,
        usageCount: file.usageCount,
        mimeType: file.mimeType,
        size: file.size,
      }));
      
      return {
        totalUploads,
        totalSize,
        byType,
        storageUsed,
        downloads,
        popularFiles,
      };
    } catch (error) {
      this.logger.warn('Error calculating file analytics, returning empty data', error);
      return {
        totalUploads: 0,
        totalSize: 0,
        byType: {},
        storageUsed: 0,
        downloads: 0,
        popularFiles: [],
      };
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    const snapshot = await this.generateAnalyticsSnapshot();
    return snapshot.performance;
  }

  /**
   * Refresh analytics data
   */
  async refreshAnalytics() {
    const now = new Date();
    await this.generateAnalyticsSnapshot(now, PeriodType.DAILY);
    await this.generateAnalyticsSnapshot(now, PeriodType.WEEKLY);
    await this.generateAnalyticsSnapshot(now, PeriodType.MONTHLY);
  }

  /**
   * Calculate performance metrics - Using Real System Monitoring Data
   */
  private async calculatePerformanceMetrics(): Promise<PerformanceMetricsDto> {
    const cacheKey = 'performance:metrics';

    const cached = await this.cacheService.get<PerformanceMetricsDto>(cacheKey);
    if (cached) {
      this.logger.debug('Performance metrics cache hit');
      return cached;
    }

    // Get real system metrics from SystemMonitoringService
    const [resourceUsage, apiPerformance] = await Promise.all([
      this.systemMonitoring.getResourceUsage(),
      this.systemMonitoring.getApiPerformance(),
    ]);

    // Get concurrent users (active users in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const concurrentUsers = await this.userModel.countDocuments({
      lastActivityAt: { $gte: fiveMinutesAgo },
      deletedAt: null,
    });

    // Get database stats
    const dbStats = await this.getDatabaseStats();

    // Calculate uptime percentage from actual uptime tracking
    const uptimePercentage = await this.systemMonitoring.calculateUptimePercentage(30); // Last 30 days

    const metrics: PerformanceMetricsDto = {
      apiResponseTime: Math.round(apiPerformance.avgResponseTime),
      errorRate: Math.round(apiPerformance.errorRate * 100) / 100,
      uptime: Math.round(uptimePercentage * 100) / 100,
      concurrentUsers,
      memoryUsage: Math.round(resourceUsage.memory.heapUsed / 1024 / 1024), // Convert to MB
      cpuUsage: Math.round(resourceUsage.cpu.usage * 100) / 100,
      diskUsage: Math.round(resourceUsage.disk.usagePercentage * 100) / 100,
      activeConnections: apiPerformance.totalRequests, // Current active requests
      slowestEndpoints: apiPerformance.slowestEndpoints.map(endpoint => ({
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        averageTime: endpoint.avgTime,
        maxTime: endpoint.maxTime,
        callCount: endpoint.callCount,
      })),
      databaseStats: dbStats,
    };

    await this.cacheService.set(cacheKey, metrics, { ttl: this.CACHE_TTL.PERFORMANCE_METRICS });

    return metrics;
  }

  /**
   * Get database statistics
   */
  private async getDatabaseStats() {
    try {
      // Get collection counts
      const collections = await Promise.all([
        this.userModel.countDocuments(),
        this.productModel.countDocuments(),
        this.orderModel.countDocuments(),
        this.serviceModel.countDocuments(),
        this.supportModel.countDocuments(),
      ]);

      const totalDocuments = collections.reduce((sum, count) => sum + count, 0);

      return {
        totalCollections: 5, // Main collections
        totalDocuments,
        databaseSize: 0, // Would need actual database size calculation
        indexSize: 0, // Would need actual index size calculation
      };
    } catch (error) {
      this.logger.error('Error getting database stats:', error);
      return {
        totalCollections: 0,
        totalDocuments: 0,
        databaseSize: 0,
        indexSize: 0,
      };
    }
  }
  private async calculateKPIs() {
    // Calculate revenue growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [currentRevenue, previousRevenue] = await Promise.all([
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ['COMPLETED', 'DELIVERED'] },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
            status: { $in: ['COMPLETED', 'DELIVERED'] },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const currentRev = currentRevenue[0]?.revenue || 0;
    const previousRev = previousRevenue[0]?.revenue || 0;
    const revenueGrowth = previousRev > 0 ? ((currentRev - previousRev) / previousRev) * 100 : 0;

    // Calculate customer satisfaction from service ratings
    const satisfactionResult = await this.serviceModel.aggregate([
      {
        $match: {
          'rating.score': { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating.score' },
          count: { $sum: 1 },
        },
      },
    ]);

    const customerSatisfaction = satisfactionResult[0]?.avgRating || 0;

    // Calculate order conversion rate (orders per customer)
    const [totalOrders, totalCustomers] = await Promise.all([
      this.orderModel.countDocuments({
        status: { $in: ['COMPLETED', 'DELIVERED'] },
        paymentStatus: 'paid',
      }),
      this.userModel.countDocuments({
        roles: { $in: ['customer'] },
        deletedAt: null,
      }),
    ]);

    const orderConversion = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    // Calculate service efficiency (completed services / total services)
    const [completedServices, totalServices] = await Promise.all([
      this.serviceModel.countDocuments({
        status: 'COMPLETED',
      }),
      this.serviceModel.countDocuments({}),
    ]);

    const serviceEfficiency = totalServices > 0 ? (completedServices / totalServices) * 100 : 0;

    // Calculate support resolution rate
    const [resolvedTickets, totalTickets] = await Promise.all([
      this.supportModel.countDocuments({
        status: { $in: ['resolved', 'closed'] },
      }),
      this.supportModel.countDocuments({}),
    ]);

    const supportResolution = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

    // Calculate system uptime based on actual performance metrics
    const performanceMetrics = await this.calculatePerformanceMetrics();
    const systemUptime = performanceMetrics.uptime;

    return {
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      customerSatisfaction: Math.round(customerSatisfaction * 100) / 100,
      orderConversion: Math.round(orderConversion * 100) / 100,
      serviceEfficiency: Math.round(serviceEfficiency * 100) / 100,
      supportResolution: Math.round(supportResolution * 100) / 100,
      systemUptime,
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
          { $set: { kpis: await this.calculateKPIs() } }
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

    // Calculate revenue by category from actual order data
    const categoryRevenueAgg = await this.orderModel.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: { $gte: startOfMonth(twelveMonthsAgo), $lte: endOfMonth(today) },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.snapshot.categoryName',
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalCategoryRevenue = categoryRevenueAgg.reduce((sum, cat) => sum + cat.revenue, 0);
    const byCategory = categoryRevenueAgg.map(cat => ({
      category: cat._id || 'غير محدد',
      revenue: cat.revenue,
      percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0,
    }));

    return { daily, monthly, byCategory };
  }

  private async buildUserCharts() {
    // Generate registration trend from actual data
    const registrationTrend = [];
    
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), 29 - i);
      const nextDate = subDays(new Date(), 28 - i);
      
      const [newUsers, activeUsers] = await Promise.all([
        this.userModel.countDocuments({
          createdAt: { $gte: date, $lt: nextDate },
          deletedAt: null,
        }),
        this.userModel.countDocuments({
          lastActivityAt: { $gte: date },
          deletedAt: null,
        }),
      ]);
      
      registrationTrend.push({
        date: format(date, 'yyyy-MM-dd'),
        newUsers,
        activeUsers,
      });
    }

    // Get user types from actual data
    const userTypesResult = await this.userModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalUsers = userTypesResult.reduce((sum, type) => sum + type.count, 0);
    const userTypes = userTypesResult.map(type => ({
      type: type._id || 'unknown',
      count: type.count,
      percentage: totalUsers > 0 ? Math.round((type.count / totalUsers) * 100) : 0,
    }));

    // Get geographic data from actual user addresses
    const geographicResult = await this.userModel.aggregate([
      {
        $match: {
          deletedAt: null,
          'address.city': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$address.city',
          users: { $sum: 1 },
        },
      },
      { $sort: { users: -1 } },
      { $limit: 5 },
    ]);

    // Get revenue by location from orders
    const revenueByLocation = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
          'shippingAddress.city': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$shippingAddress.city',
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const revenueMap = new Map();
    revenueByLocation.forEach(item => {
      revenueMap.set(item._id, item.revenue);
    });

    const geographic = geographicResult.map(location => ({
      location: location._id,
      users: location.users,
      revenue: revenueMap.get(location._id) || 0,
    }));

    return { registrationTrend, userTypes, geographic };
  }

  private async buildProductCharts() {
    // Get top selling products from actual order data
    const topSellingResult = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product._id',
          name: { $first: '$product.name' },
          sold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]);

    const topSelling = topSellingResult.map(product => ({
      name: product.name,
      sold: product.sold,
      revenue: product.revenue,
    }));

    // Get category performance from actual data
    const categoryPerformanceResult = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          category: { $first: '$category.name' },
          products: { $addToSet: '$product._id' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
        },
      },
      {
        $project: {
          category: 1,
          products: { $size: '$products' },
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const categoryPerformance = categoryPerformanceResult.map(cat => ({
      category: cat.category,
      products: cat.products,
      revenue: cat.revenue,
    }));

    // Get stock alerts from actual product data
    const stockAlertsResult = await this.productModel.aggregate([
      {
        $match: {
          deletedAt: null,
          trackStock: true,
          $expr: { $lt: ['$stock', '$minStock'] },
        },
      },
      {
        $project: {
          name: 1,
          currentStock: '$stock',
          minRequired: '$minStock',
        },
      },
      { $sort: { currentStock: 1 } },
      { $limit: 10 },
    ]);

    const stockAlerts = stockAlertsResult.map(product => ({
      name: product.name,
      currentStock: product.currentStock,
      minRequired: product.minRequired,
    }));

    return { topSelling, categoryPerformance, stockAlerts };
  }

  private async buildServiceCharts() {
    // Generate request trend from actual service data
    const requestTrend = [];
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), 29 - i);
      const nextDate = subDays(new Date(), 28 - i);
      
      const [requests, completed] = await Promise.all([
        this.serviceModel.countDocuments({
          createdAt: { $gte: date, $lt: nextDate },
        }),
        this.serviceModel.countDocuments({
          createdAt: { $gte: date, $lt: nextDate },
          status: 'COMPLETED',
        }),
      ]);
      
      requestTrend.push({
        date: format(date, 'yyyy-MM-dd'),
        requests,
        completed,
      });
    }

    // Get engineer performance from actual data
    const engineerPerformanceResult = await this.serviceModel.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          engineerId: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$engineerId',
          completed: { $sum: 1 },
          avgRating: { $avg: '$rating.score' },
        },
      },
      { $sort: { completed: -1 } },
      { $limit: 5 },
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
          name: { $concat: ['$engineer.firstName', ' ', '$engineer.lastName'] },
          completed: 1,
          rating: { $ifNull: ['$avgRating', 0] },
        },
      },
    ]);

    const engineerPerformance = engineerPerformanceResult.map(engineer => ({
      name: engineer.name.trim() || 'Unknown Engineer',
      completed: engineer.completed,
      rating: Math.round(engineer.rating * 100) / 100,
    }));

    // Calculate response times trend from actual data
    const responseTimesResult = await this.serviceModel.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          assignedAt: { $exists: true },
        },
      },
      {
        $project: {
          responseTimeHours: {
            $divide: [
              { $subtract: ['$assignedAt', '$createdAt'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTimeHours' },
        },
      },
    ]);

    const averageResponseTime = Math.round((responseTimesResult[0]?.avgResponseTime || 12) * 100) / 100;

    // Calculate daily response times from actual data
    const dailyResponseTimes = [];
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), 29 - i);
      const nextDate = subDays(new Date(), 28 - i);
      
      const dayResponseResult = await this.serviceModel.aggregate([
        {
          $match: {
            createdAt: { $gte: date, $lt: nextDate },
            status: 'COMPLETED',
            assignedAt: { $exists: true },
          },
        },
        {
          $project: {
            responseTimeHours: {
              $divide: [
                { $subtract: ['$assignedAt', '$createdAt'] },
                1000 * 60 * 60, // Convert to hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTimeHours' },
          },
        },
      ]);

      dailyResponseTimes.push(Math.round((dayResponseResult[0]?.avgResponseTime || averageResponseTime) * 100) / 100);
    }

    const responseTimes = {
      average: averageResponseTime,
      target: 24,
      trend: dailyResponseTimes,
    };

    return { requestTrend, engineerPerformance, responseTimes };
  }

  private async buildSupportCharts() {
    // Generate ticket trend from actual support data
    const ticketTrend = [];
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), 29 - i);
      const nextDate = subDays(new Date(), 28 - i);
      
      const [newTickets, resolvedTickets] = await Promise.all([
        this.supportModel.countDocuments({
          createdAt: { $gte: date, $lt: nextDate },
        }),
        this.supportModel.countDocuments({
          createdAt: { $gte: date, $lt: nextDate },
          status: { $in: ['resolved', 'closed'] },
        }),
      ]);
      
      ticketTrend.push({
        date: format(date, 'yyyy-MM-dd'),
        new: newTickets,
        resolved: resolvedTickets,
      });
    }

    // Get category breakdown from actual data
    const categoryBreakdownResult = await this.supportModel.aggregate([
      {
        $match: {
          category: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Calculate average resolution time by category
    const categoryResolutionResult = await this.supportModel.aggregate([
      {
        $match: {
          category: { $exists: true, $ne: null },
          status: { $in: ['resolved', 'closed'] },
          resolvedAt: { $exists: true },
        },
      },
      {
        $project: {
          category: 1,
          resolutionTimeHours: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          avgResolutionTime: { $avg: '$resolutionTimeHours' },
        },
      },
    ]);

    const resolutionMap = new Map();
    categoryResolutionResult.forEach(item => {
      resolutionMap.set(item._id, Math.round(item.avgResolutionTime));
    });

    const categoryBreakdown = categoryBreakdownResult.map(cat => ({
      category: cat._id,
      count: cat.count,
      avgResolutionTime: resolutionMap.get(cat._id) || 24,
    }));

    // Get agent performance from actual data
    const agentPerformanceResult = await this.supportModel.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: null },
          status: { $in: ['resolved', 'closed'] },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          resolved: { $sum: 1 },
          avgSatisfaction: { $avg: '$rating.score' },
        },
      },
      { $sort: { resolved: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      {
        $project: {
          name: { $concat: ['$agent.firstName', ' ', '$agent.lastName'] },
          resolved: 1,
          satisfaction: { $ifNull: ['$avgSatisfaction', 0] },
        },
      },
    ]);

    const agentPerformance = agentPerformanceResult.map(agent => ({
      name: agent.name.trim() || 'Unknown Agent',
      resolved: agent.resolved,
      satisfaction: Math.round(agent.satisfaction * 100) / 100,
    }));

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
