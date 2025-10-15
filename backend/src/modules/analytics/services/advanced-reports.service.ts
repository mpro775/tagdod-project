import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AdvancedReport,
  AdvancedReportDocument,
  ReportCategory,
} from '../schemas/advanced-report.schema';
import {
  GenerateAdvancedReportDto,
  SalesReportQueryDto,
  ProductPerformanceQueryDto,
  CustomerAnalyticsQueryDto,
  InventoryReportQueryDto,
  FinancialReportQueryDto,
  CartAnalyticsQueryDto,
  MarketingReportQueryDto,
  RealTimeMetricsDto,
} from '../dto/advanced-analytics.dto';
import { Order, OrderDocument, OrderStatus } from '../../checkout/schemas/order.schema.new';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Coupon, CouponDocument } from '../../coupons/schemas/coupon.schema';
import { startOfDay, subMonths, parseISO } from 'date-fns';

// Local interfaces to replace any types
interface TopSellingProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface SalesByDateEntry {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

interface SalesByCategoryEntry {
  categoryId: string;
  categoryName: string;
  sales: number;
  revenue: number;
  percentage: number;
}

interface SalesByRegionEntry {
  region: string;
  city: string;
  sales: number;
  revenue: number;
}

interface PaymentMethodBreakdownEntry {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

interface ProductPerformanceItem {
  productId: string;
  name: string;
  views: number;
  sales: number;
  revenue?: number;
  rating?: number;
  lastSold?: Date | undefined;
}

interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  productCount: number;
  totalSales: number;
  revenue: number;
}

interface BrandBreakdownItem {
  brandId: string;
  name: string;
  productCount: number;
  totalSales: number;
  revenue: number;
}

interface CampaignPerformanceItem {
  // Placeholder for future campaign performance structure
}

interface TrafficSourceItem {
  // Placeholder for future traffic source structure
}

interface MarketingTopCoupon {
  code: string;
  uses: number;
  discount: number;
  revenue: number;
}

interface OperationalOrderFulfillmentMetrics {
  averageProcessingTime: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  totalShipments: number;
  pendingShipments: number;
}

interface ReturnAnalyticsItem {
  reason: string;
  count: number;
  percentage: number;
}

interface ReturnAnalyticsMetrics {
  totalReturns: number;
  returnRate: number;
  topReturnReasons: ReturnAnalyticsItem[];
  returnsByProduct: Array<unknown>;
}

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
}

interface InventoryMetrics {
  turnoverRate: number;
  stockoutRate: number;
  excessInventory: number;
  inventoryAccuracy: number;
}

interface ChartTimeSeriesPoint {
  date: string;
  value: number;
  label: string;
}

interface ChartPieSlice {
  label: string;
  value: number;
  percentage: number;
}

interface BarChartItem {
  label: string;
  value: number;
  category?: string;
}

interface LineChartSeriesPoint {
  name: string;
  value: number;
}

interface LineChartEntry {
  date: string;
  series: LineChartSeriesPoint[];
}

interface ChartData {
  timeSeries: ChartTimeSeriesPoint[];
  pieCharts: ChartPieSlice[];
  barCharts: BarChartItem[];
  lineCharts: LineChartEntry[];
}

interface AlertItem {
  type: 'info' | 'warning' | 'error';
  message: string;
  messageEn: string;
  severity: 'low' | 'medium' | 'high';
  actionRequired: boolean;
}

interface InsightsRecommendationsResult {
  insights: { ar: string[]; en: string[] };
  recommendations: { ar: string[]; en: string[] };
  alerts: AlertItem[];
}

interface RevenueByChannelItem {
  channel: string;
  revenue: number;
  percentage: number;
}

interface ProfitByCategoryItem {
  categoryId: string;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface CashFlowEntry {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface RevenueProjection {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
}

interface TopCustomerItem {
  userId: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
}

interface CustomerSegmentItem {
  segment: string;
  count: number;
  revenue: number;
  averageOrderValue: number;
}

interface AbandonedProductItem {
  productId: string;
  name: string;
  abandonedCount: number;
  lostRevenue: number;
}

type AnalyticsByCategory = {
  salesAnalytics?: Awaited<ReturnType<AdvancedReportsService['generateSalesAnalytics']>>;
  productAnalytics?: Awaited<ReturnType<AdvancedReportsService['generateProductAnalytics']>>;
  customerAnalytics?: Awaited<ReturnType<AdvancedReportsService['generateCustomerAnalytics']>>;
  financialAnalytics?: Awaited<ReturnType<AdvancedReportsService['generateFinancialAnalytics']>>;
  marketingAnalytics?: Awaited<ReturnType<AdvancedReportsService['generateMarketingAnalytics']>>;
  operationalAnalytics?: Awaited<
    ReturnType<AdvancedReportsService['generateOperationalAnalytics']>
  >;
};

@Injectable()
export class AdvancedReportsService {
  private readonly logger = new Logger(AdvancedReportsService.name);

  constructor(
    @InjectModel(AdvancedReport.name) private reportModel: Model<AdvancedReportDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  /**
   * Generate comprehensive advanced report
   */
  async generateAdvancedReport(
    dto: GenerateAdvancedReportDto,
    userId: string,
  ): Promise<AdvancedReportDocument> {
    const startTime = Date.now();
    this.logger.log(`Generating advanced report: ${dto.title}`);

    try {
      const startDate = parseISO(dto.startDate);
      const endDate = parseISO(dto.endDate);

      // Generate report ID
      const reportId = await this.generateReportId();

      // Initialize report
      const report = new this.reportModel({
        reportId,
        title: dto.title,
        titleEn: dto.titleEn,
        description: dto.description,
        descriptionEn: dto.description, // TODO: Add separate English description
        category: dto.category,
        priority: dto.priority || 'medium',
        startDate,
        endDate,
        generatedAt: new Date(),
        createdBy: new Types.ObjectId(userId),
        filters: dto.filters,
        exportSettings: dto.exportSettings,
        status: 'generating',
      });

      // Generate analytics based on category
      const analytics = await this.generateAnalyticsByCategory(
        dto.category,
        startDate,
        endDate,
        dto.filters,
      );

      // Update report with analytics
      Object.assign(report, analytics);

      // Generate summary
      report.summary = this.generateSummary(analytics);

      // Generate insights and recommendations
      if (dto.includeRecommendations) {
        const { insights, recommendations, alerts } =
          await this.generateInsightsAndRecommendations(analytics);
        report.insights = insights.ar;
        report.insightsEn = insights.en;
        report.recommendations = recommendations.ar;
        report.recommendationsEn = recommendations.en;
        report.alerts = alerts;
      }

      // Generate charts data
      if (dto.generateCharts) {
        report.chartsData = await this.generateChartsData(analytics);
      }

      // Add comparison with previous period
      if (dto.compareWithPrevious) {
        report.previousPeriodComparison = await this.generatePreviousPeriodComparison(
          startDate,
          endDate,
          dto.category,
          dto.filters,
        );
      }

      // Mark as completed
      report.status = 'completed';
      report.metadata = {
        processingTime: Date.now() - startTime,
        dataSourceVersion: '1.0.0',
        reportVersion: '1.0.0',
        generationMode: 'manual',
        tags: (dto.filters?.customFilters?.tags as string[]) || [],
      };

      await report.save();

      this.logger.log(`Report generated successfully: ${reportId} in ${Date.now() - startTime}ms`);
      return report;
    } catch (error) {
      this.logger.error('Failed to generate advanced report', error);
      throw error;
    }
  }

  /**
   * Generate analytics based on category
   */
  private async generateAnalyticsByCategory(
    category: ReportCategory,
    startDate: Date,
    endDate: Date,
    filters?: Record<string, unknown>,
  ): Promise<AnalyticsByCategory> {
    switch (category) {
      case ReportCategory.SALES:
        return {
          salesAnalytics: await this.generateSalesAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            ...filters,
          }),
        };
      case ReportCategory.PRODUCTS:
        return {
          productAnalytics: await this.generateProductAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        };
      case ReportCategory.CUSTOMERS:
        return {
          customerAnalytics: await this.generateCustomerAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        };
      case ReportCategory.FINANCIAL:
        return {
          financialAnalytics: await this.generateFinancialAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        };
      case ReportCategory.MARKETING:
        return {
          marketingAnalytics: await this.generateMarketingAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        };
      case ReportCategory.OPERATIONS:
        return {
          operationalAnalytics: await this.generateOperationalAnalytics(startDate, endDate),
        };
      case ReportCategory.INVENTORY:
        return {
          productAnalytics: await this.generateInventoryAnalytics({}),
        };
      default:
        // For custom reports, generate all analytics
        return {
          salesAnalytics: await this.generateSalesAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
          productAnalytics: await this.generateProductAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
          customerAnalytics: await this.generateCustomerAnalytics({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        };
    }
  }

  /**
   * Generate detailed sales analytics
   */
  async generateSalesAnalytics(query: SalesReportQueryDto): Promise<{
    totalSales: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalDiscount: number;
    netRevenue: number;
    topSellingProducts: TopSellingProduct[];
    salesByDate: SalesByDateEntry[];
    salesByCategory: SalesByCategoryEntry[];
    salesByRegion: SalesByRegionEntry[];
    paymentMethods: PaymentMethodBreakdownEntry[];
  }> {
    const startDate = query.startDate ? parseISO(query.startDate) : subMonths(new Date(), 1);
    const endDate = query.endDate ? parseISO(query.endDate) : new Date();

    // Build match query
    const matchQuery: Record<string, unknown> = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['COMPLETED', 'DELIVERED'] },
    };

    if (query.categories?.length) {
      matchQuery['items.snapshot.categoryId'] = { $in: query.categories };
    }

    if (query.paymentMethods?.length) {
      matchQuery.paymentMethod = { $in: query.paymentMethods };
    }

    // Get total sales data
    const [ordersData, topProducts, salesByDate, salesByCategory] = await Promise.all([
      this.orderModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            totalDiscount: { $sum: '$totalDiscount' },
            avgOrderValue: { $avg: '$total' },
          },
        },
      ]),
      this.getTopSellingProducts(startDate, endDate, matchQuery),
      this.getSalesByDate(startDate, endDate, matchQuery, query.groupBy || 'daily'),
      this.getSalesByCategory(startDate, endDate, matchQuery),
    ]);

    const stats = ordersData[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalDiscount: 0,
      avgOrderValue: 0,
    };

    return {
      totalSales: stats.totalRevenue,
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      averageOrderValue: stats.avgOrderValue || 0,
      totalDiscount: stats.totalDiscount,
      netRevenue: stats.totalRevenue - stats.totalDiscount,
      topSellingProducts: topProducts,
      salesByDate,
      salesByCategory,
      salesByRegion: await this.getSalesByRegion(startDate, endDate, matchQuery),
      paymentMethods: await this.getPaymentMethodBreakdown(startDate, endDate, matchQuery),
    };
  }

  /**
   * Generate product performance analytics
   */
  async generateProductAnalytics(query: ProductPerformanceQueryDto): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    lowStock: number;
    topPerformers: ProductPerformanceItem[];
    underPerformers: ProductPerformanceItem[];
    categoryBreakdown: CategoryBreakdownItem[];
    brandBreakdown: BrandBreakdownItem[];
    inventoryValue: number;
    averageProductRating: number;
  }> {
    const startDate = query.startDate ? parseISO(query.startDate) : subMonths(new Date(), 1);
    const endDate = query.endDate ? parseISO(query.endDate) : new Date();

    const [totalProducts, activeProducts, outOfStock, topPerformers, underPerformers] =
      await Promise.all([
        this.productModel.countDocuments({ deletedAt: null }),
        this.productModel.countDocuments({ status: 'active', deletedAt: null }),
        this.productModel.countDocuments({ status: 'out_of_stock', deletedAt: null }),
        this.getTopPerformingProducts(startDate, endDate, query.limit || 10),
        this.getUnderPerformingProducts(startDate, endDate, query.limit || 10),
      ]);

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock: 0, // TODO: Implement when inventory system is ready
      topPerformers,
      underPerformers,
      categoryBreakdown: await this.getCategoryBreakdown(startDate, endDate),
      brandBreakdown: await this.getBrandBreakdown(startDate, endDate),
      inventoryValue: 0, // TODO: Calculate from inventory
      averageProductRating: await this.getAverageProductRating(),
    };
  }

  /**
   * Generate customer analytics
   */
  async generateCustomerAnalytics(query: CustomerAnalyticsQueryDto): Promise<{
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
    averageLifetimeValue: number;
    topCustomers: TopCustomerItem[];
    customersByRegion: Array<unknown>;
    customerSegmentation: CustomerSegmentItem[];
    churnRate: number;
    newVsReturning: {
      new: number;
      returning: number;
      newPercentage: number;
      returningPercentage: number;
    };
  }> {
    const startDate = query.startDate ? parseISO(query.startDate) : subMonths(new Date(), 1);
    const endDate = query.endDate ? parseISO(query.endDate) : new Date();

    const [totalCustomers, newCustomers, activeCustomers] = await Promise.all([
      this.userModel.countDocuments({ deletedAt: null, roles: 'user' }),
      this.userModel.countDocuments({
        deletedAt: null,
        roles: 'user',
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      this.getActiveCustomers(startDate, endDate),
    ]);

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      returningCustomers: await this.getReturningCustomers(startDate, endDate),
      customerRetentionRate: this.calculateRetentionRate(
        totalCustomers,
        newCustomers,
        activeCustomers,
      ),
      averageLifetimeValue: await this.getAverageLifetimeValue(),
      topCustomers: await this.getTopCustomers(startDate, endDate, query.limit || 10),
      customersByRegion: await this.getCustomersByRegion(),
      customerSegmentation: await this.getCustomerSegmentation(startDate, endDate),
      churnRate: 0, // TODO: Calculate churn rate
      newVsReturning: {
        new: newCustomers,
        returning: activeCustomers - newCustomers,
        newPercentage: totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0,
        returningPercentage:
          totalCustomers > 0 ? ((activeCustomers - newCustomers) / totalCustomers) * 100 : 0,
      },
    };
  }

  /**
   * Generate financial analytics
   */
  async generateFinancialAnalytics(query: FinancialReportQueryDto): Promise<{
    grossRevenue: number;
    netRevenue: number;
    totalCosts: number;
    grossProfit: number;
    grossMargin: number;
    totalDiscounts: number;
    totalRefunds: number;
    totalShipping: number;
    totalTax: number;
    revenueByChannel: RevenueByChannelItem[];
    profitByCategory: ProfitByCategoryItem[];
    cashFlow: CashFlowEntry[];
    projections: { nextMonth: number; nextQuarter: number; nextYear: number };
  }> {
    const startDate = parseISO(query.startDate);
    const endDate = parseISO(query.endDate);

    const revenueData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: '$total' },
          totalDiscounts: { $sum: '$totalDiscount' },
          totalRefunds: { $sum: { $cond: ['$isRefunded', '$refundAmount', 0] } },
          totalShipping: { $sum: '$shippingCost' },
          totalTax: { $sum: '$tax' },
        },
      },
    ]);

    const stats = revenueData[0] || {
      grossRevenue: 0,
      totalDiscounts: 0,
      totalRefunds: 0,
      totalShipping: 0,
      totalTax: 0,
    };

    const netRevenue = stats.grossRevenue - stats.totalDiscounts - stats.totalRefunds;
    const totalCosts = 0; // TODO: Get from inventory/cost system
    const grossProfit = netRevenue - totalCosts;
    const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    return {
      grossRevenue: stats.grossRevenue,
      netRevenue,
      totalCosts,
      grossProfit,
      grossMargin,
      totalDiscounts: stats.totalDiscounts,
      totalRefunds: stats.totalRefunds,
      totalShipping: stats.totalShipping,
      totalTax: stats.totalTax,
      revenueByChannel: await this.getRevenueByChannel(startDate, endDate),
      profitByCategory: await this.getProfitByCategory(startDate, endDate),
      cashFlow: await this.getCashFlow(startDate, endDate, query.groupBy || 'monthly'),
      projections: query.includeProjections
        ? await this.generateRevenueProjections(startDate, endDate)
        : { nextMonth: 0, nextQuarter: 0, nextYear: 0 },
    };
  }

  /**
   * Generate marketing analytics
   */
  async generateMarketingAnalytics(query: MarketingReportQueryDto): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalCouponsUsed: number;
    couponDiscounts: number;
    conversionRate: number;
    topCoupons: MarketingTopCoupon[];
    trafficSources: TrafficSourceItem[];
    campaignPerformance: CampaignPerformanceItem[];
    emailMarketing: {
      sent: number;
      opened: number;
      clicked: number;
      converted: number;
      revenue: number;
    };
  }> {
    const startDate = parseISO(query.startDate);
    const endDate = parseISO(query.endDate);

    const [couponStats, topCoupons] = await Promise.all([
      this.couponModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalCoupons: { $sum: 1 },
            activeCoupons: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
            },
            totalUses: { $sum: '$currentUses' },
            totalDiscount: { $sum: '$stats.totalDiscount' },
            totalRevenue: { $sum: '$stats.totalRevenue' },
          },
        },
      ]),
      this.getTopCoupons(startDate, endDate, 10),
    ]);

    const stats = couponStats[0] || {
      totalCoupons: 0,
      activeCoupons: 0,
      totalUses: 0,
      totalDiscount: 0,
      totalRevenue: 0,
    };

    return {
      totalCampaigns: stats.totalCoupons,
      activeCampaigns: stats.activeCoupons,
      totalCouponsUsed: stats.totalUses,
      couponDiscounts: stats.totalDiscount,
      conversionRate: await this.getConversionRate(startDate, endDate),
      topCoupons,
      trafficSources: [], // TODO: Implement when analytics tracking is available
      campaignPerformance: [], // TODO: Implement campaign tracking
      emailMarketing: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0,
      }, // TODO: Implement email tracking
    };
  }

  /**
   * Generate operational analytics
   */
  async generateOperationalAnalytics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    orderFulfillment: OperationalOrderFulfillmentMetrics;
    returnAnalytics: ReturnAnalyticsMetrics;
    supportMetrics: SupportMetrics;
    inventoryMetrics: InventoryMetrics;
  }> {
    const orders = await this.orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const completedOrders = orders.filter(
      (o) => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED,
    );
    const returnedOrders = orders.filter((o) => o.isReturned);

    return {
      orderFulfillment: {
        averageProcessingTime: this.calculateAverageProcessingTime(completedOrders),
        averageDeliveryTime: this.calculateAverageDeliveryTime(completedOrders),
        onTimeDeliveryRate: this.calculateOnTimeDeliveryRate(completedOrders),
        totalShipments: completedOrders.length,
        pendingShipments: orders.filter(
          (o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.READY_TO_SHIP,
        ).length,
      },
      returnAnalytics: {
        totalReturns: returnedOrders.length,
        returnRate: orders.length > 0 ? (returnedOrders.length / orders.length) * 100 : 0,
        topReturnReasons: this.getTopReturnReasons(returnedOrders),
        returnsByProduct: [], // TODO: Implement detailed return tracking
      },
      supportMetrics: {
        totalTickets: 0, // TODO: Get from support module
        openTickets: 0,
        resolvedTickets: 0,
        averageResolutionTime: 0,
        customerSatisfaction: 0,
      },
      inventoryMetrics: {
        turnoverRate: 0, // TODO: Calculate from inventory
        stockoutRate: 0,
        excessInventory: 0,
        inventoryAccuracy: 0,
      },
    };
  }

  /**
   * Generate inventory analytics
   */
  async generateInventoryAnalytics(query: InventoryReportQueryDto): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    lowStock: number;
    topPerformers: ProductPerformanceItem[];
    underPerformers: ProductPerformanceItem[];
    categoryBreakdown: CategoryBreakdownItem[];
    brandBreakdown: BrandBreakdownItem[];
    inventoryValue: number;
    averageProductRating: number;
  }> {
    const matchQuery: Record<string, unknown> = { deletedAt: null };

    if (query.categoryId) matchQuery.categoryId = query.categoryId;
    if (query.brandId) matchQuery.brandId = query.brandId;
    if (query.stockStatus && query.stockStatus !== 'all') {
      matchQuery.status = query.stockStatus === 'out_of_stock' ? 'out_of_stock' : 'active';
    }

    const products = await this.productModel.find(matchQuery);

    return {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === 'active').length,
      outOfStock: products.filter((p) => p.status === 'out_of_stock').length,
      lowStock: 0, // TODO: Implement with inventory levels
      topPerformers: [],
      underPerformers: [],
      categoryBreakdown: await this.getCategoryBreakdown(subMonths(new Date(), 1), new Date()),
      brandBreakdown: await this.getBrandBreakdown(subMonths(new Date(), 1), new Date()),
      inventoryValue: 0,
      averageProductRating: await this.getAverageProductRating(),
    };
  }

  /**
   * Generate cart analytics
   */
  async generateCartAnalytics(query: CartAnalyticsQueryDto): Promise<{
    totalCarts: number;
    activeCarts: number;
    abandonedCarts: number;
    abandonmentRate: number;
    recoveredCarts: number;
    recoveryRate: number;
    averageCartValue: number;
    averageCartItems: number;
    conversionRate: number;
    checkoutDropoffRate: number;
    abandonedCartValue: number;
    topAbandonedProducts: AbandonedProductItem[];
  }> {
    const startDate = query.startDate ? parseISO(query.startDate) : subMonths(new Date(), 1);
    const endDate = query.endDate ? parseISO(query.endDate) : new Date();

    const matchQuery: Record<string, unknown> = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (query.status && query.status !== 'all') {
      matchQuery.status = query.status;
    }

    const [totalCarts, activeCarts, abandonedCarts, convertedCarts] = await Promise.all([
      this.cartModel.countDocuments(matchQuery),
      this.cartModel.countDocuments({ ...matchQuery, status: 'active' }),
      this.cartModel.countDocuments({ ...matchQuery, status: 'abandoned' }),
      this.cartModel.countDocuments({ ...matchQuery, status: 'converted' }),
    ]);

    const abandonmentRate = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;
    const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;

    const cartValues = await this.cartModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$pricingSummary.total' },
          avgItems: { $avg: '$pricingSummary.itemsCount' },
          totalAbandoned: {
            $sum: {
              $cond: [{ $eq: ['$status', 'abandoned'] }, '$pricingSummary.total', 0],
            },
          },
        },
      },
    ]);

    const stats = cartValues[0] || {
      avgValue: 0,
      avgItems: 0,
      totalAbandoned: 0,
    };

    return {
      totalCarts,
      activeCarts,
      abandonedCarts,
      abandonmentRate,
      recoveredCarts: 0, // TODO: Implement cart recovery tracking
      recoveryRate: 0,
      averageCartValue: stats.avgValue,
      averageCartItems: stats.avgItems,
      conversionRate,
      checkoutDropoffRate: 0, // TODO: Implement checkout funnel tracking
      abandonedCartValue: stats.totalAbandoned,
      topAbandonedProducts: await this.getTopAbandonedProducts(
        startDate,
        endDate,
        query.topAbandonedLimit || 10,
      ),
    };
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetricsDto> {
    const today = startOfDay(new Date());
    const now = new Date();

    const [todayOrders, todayNewCustomers, recentOrders, topViewedProducts] = await Promise.all([
      this.orderModel.find({
        createdAt: { $gte: today, $lte: now },
        status: { $in: ['COMPLETED', 'DELIVERED'] },
      }),
      this.userModel.countDocuments({
        createdAt: { $gte: today, $lte: now },
        roles: 'user',
      }),
      this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber total status createdAt')
        .lean(),
      this.productModel
        .find({ deletedAt: null })
        .sort({ viewsCount: -1 })
        .limit(10)
        .select('name viewsCount')
        .lean(),
    ]);

    const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = todayOrders.length > 0 ? todaySales / todayOrders.length : 0;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthOrders = await this.orderModel.find({
      createdAt: { $gte: monthStart, $lte: now },
      status: { $in: ['COMPLETED', 'DELIVERED'] },
    });
    const monthSales = monthOrders.reduce((sum, order) => sum + order.total, 0);

    const todayAbandonedCarts = await this.cartModel.countDocuments({
      lastActivityAt: { $gte: today, $lte: now },
      status: 'abandoned',
    });

    return {
      activeUsers: 0, // TODO: Implement active users tracking
      activeOrders: await this.orderModel.countDocuments({
        status: {
          $in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY],
        },
      }),
      todaySales,
      monthSales,
      todayOrders: todayOrders.length,
      todayNewCustomers,
      currentConversionRate: 0, // TODO: Calculate from analytics
      currentAverageOrderValue: avgOrderValue,
      todayAbandonedCarts,
      recentOrders: recentOrders.map((o) => ({
        orderId: o._id?.toString() || '',
        orderNumber: o.orderNumber,
        amount: o.total,
        status: o.status,
        createdAt: o.createdAt || new Date(),
      })),
      topViewedProducts: topViewedProducts.map((p) => ({
        productId: p._id?.toString() || '',
        name: p.name,
        views: p.viewsCount,
      })),
      systemHealth: 98.5, // TODO: Calculate from performance metrics
      lastUpdated: new Date(),
    };
  }

  // ========== Helper Methods ==========

  private async generateReportId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.reportModel.countDocuments({
      reportId: new RegExp(`^REP-${year}-`),
    });
    return `REP-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  private generateSummary(analytics: Record<string, unknown>): {
    totalRecords: number;
    totalValue: number;
    currency: string;
    growth: number;
  } {
    // Generate summary based on analytics data
    let totalRecords = 0;
    let totalValue = 0;

    const sales = analytics as Partial<AnalyticsByCategory>;
    if (sales.salesAnalytics) {
      totalRecords = sales.salesAnalytics.totalOrders;
      totalValue = sales.salesAnalytics.totalRevenue;
    } else if ((analytics as Partial<AnalyticsByCategory>).customerAnalytics) {
      const cust = (analytics as Partial<AnalyticsByCategory>).customerAnalytics;
      if (cust) {
        totalRecords = cust.totalCustomers;
        totalValue = cust.averageLifetimeValue * totalRecords;
      }
    }

    return {
      totalRecords,
      totalValue,
      currency: 'YER',
      growth: 0, // TODO: Calculate growth
    };
  }

  private async generateInsightsAndRecommendations(
    analytics: Record<string, unknown>,
  ): Promise<InsightsRecommendationsResult> {
    const insights = { ar: [] as string[], en: [] as string[] };
    const recommendations = { ar: [] as string[], en: [] as string[] };
    const alerts: AlertItem[] = [];

    // Generate insights based on analytics
    const sales = analytics as Partial<AnalyticsByCategory>;
    if (sales.salesAnalytics) {
      const { totalRevenue, totalOrders, averageOrderValue } = sales.salesAnalytics;
      insights.ar.push(`إجمالي الإيرادات: ${totalRevenue.toLocaleString()} ريال`);
      insights.ar.push(`إجمالي الطلبات: ${totalOrders}`);
      insights.ar.push(`متوسط قيمة الطلب: ${averageOrderValue.toFixed(2)} ريال`);

      if (averageOrderValue < 1000) {
        recommendations.ar.push('يُنصح بتقديم عروض لزيادة متوسط قيمة الطلب');
        alerts.push({
          type: 'warning',
          message: 'متوسط قيمة الطلب منخفض',
          messageEn: 'Average order value is low',
          severity: 'medium',
          actionRequired: true,
        });
      }
    }

    return { insights, recommendations, alerts };
  }

  private async generateChartsData(analytics: Record<string, unknown>): Promise<ChartData> {
    // Generate charts data based on analytics
    const chartsData: ChartData = {
      timeSeries: [],
      pieCharts: [],
      barCharts: [],
      lineCharts: [],
    };

    const sales = analytics as Partial<AnalyticsByCategory>;
    if (sales.salesAnalytics?.salesByDate) {
      chartsData.timeSeries = sales.salesAnalytics.salesByDate.map((item: SalesByDateEntry) => ({
        date: item.date,
        value: item.revenue,
        label: 'Revenue',
      }));
    }

    if (sales.salesAnalytics?.salesByCategory) {
      chartsData.pieCharts = sales.salesAnalytics.salesByCategory.map((item: SalesByCategoryEntry) => ({
        label: item.categoryName,
        value: item.revenue,
        percentage: item.percentage,
      }));
    }

    return chartsData;
  }

  private async generatePreviousPeriodComparison(
    startDate: Date,
    endDate: Date,
    category: ReportCategory,
    filters?: Record<string, unknown>,
  ): Promise<{
    enabled: boolean;
    startDate: Date;
    endDate: Date;
    metrics: Record<
      string,
      { current: number; previous: number; change: number; percentageChange: number }
    >;
  }> {
    const periodDiff = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDiff);
    const prevEndDate = new Date(startDate.getTime() - 1);

    const currentAnalytics = await this.generateAnalyticsByCategory(
      category,
      startDate,
      endDate,
      filters,
    );
    const previousAnalytics = await this.generateAnalyticsByCategory(
      category,
      prevStartDate,
      prevEndDate,
      filters,
    );

    const metrics: Record<
      string,
      { current: number; previous: number; change: number; percentageChange: number }
    > = {};

    if (currentAnalytics.salesAnalytics && previousAnalytics.salesAnalytics) {
      const current = currentAnalytics.salesAnalytics.totalRevenue;
      const previous = previousAnalytics.salesAnalytics.totalRevenue;
      metrics.revenue = {
        current,
        previous,
        change: current - previous,
        percentageChange: previous > 0 ? ((current - previous) / previous) * 100 : 0,
      };
    }

    return {
      enabled: true,
      startDate: prevStartDate,
      endDate: prevEndDate,
      metrics,
    };
  }

  // ========== Data Fetching Methods ==========

  private async getTopSellingProducts(
    startDate: Date,
    endDate: Date,
    matchQuery: Record<string, unknown>,
  ): Promise<TopSellingProduct[]> {
    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.snapshot.name' },
          quantity: { $sum: '$items.qty' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          productId: { $toString: '$_id' },
          name: 1,
          quantity: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  private async getSalesByDate(
    startDate: Date,
    endDate: Date,
    matchQuery: Record<string, unknown>,
    groupBy: string,
  ): Promise<SalesByDateEntry[]> {
    const dateFormat = groupBy === 'daily' ? '%Y-%m-%d' : groupBy === 'weekly' ? '%Y-W%U' : '%Y-%m';

    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          sales: { $sum: '$total' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          sales: 1,
          orders: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  private async getSalesByCategory(
    startDate: Date,
    endDate: Date,
    matchQuery: Record<string, unknown>,
  ): Promise<SalesByCategoryEntry[]> {
    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.snapshot.categoryId',
          categoryName: { $first: '$items.snapshot.categoryName' },
          sales: { $sum: '$items.lineTotal' },
          revenue: { $sum: '$items.lineTotal' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          categoryId: { $toString: '$_id' },
          categoryName: { $ifNull: ['$categoryName', 'Unknown'] },
          sales: 1,
          revenue: 1,
          percentage: 0, // Will calculate after getting total
          _id: 0,
        },
      },
    ]);

    // Calculate percentages
    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    return result.map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    }));
  }

  private async getSalesByRegion(
    startDate: Date,
    endDate: Date,
    matchQuery: Record<string, unknown>,
  ): Promise<SalesByRegionEntry[]> {
    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            region: '$deliveryAddress.region',
            city: '$deliveryAddress.city',
          },
          sales: { $sum: '$total' },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          region: { $ifNull: ['$_id.region', 'Unknown'] },
          city: { $ifNull: ['$_id.city', 'Unknown'] },
          sales: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  private async getPaymentMethodBreakdown(
    startDate: Date,
    endDate: Date,
    matchQuery: Record<string, unknown>,
  ): Promise<PaymentMethodBreakdownEntry[]> {
    const result = await this.orderModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$total' },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const totalAmount = result.reduce((sum, item) => sum + item.amount, 0);

    return result.map((item) => ({
      method: item._id,
      count: item.count,
      amount: item.amount,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
    }));
  }

  private async getTopPerformingProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<ProductPerformanceItem[]> {
    // This would aggregate from orders
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.snapshot.name' },
          sales: { $sum: '$items.qty' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);

    // Enrich with product data
    return Promise.all(
      result.map(async (item) => {
        const product = await this.productModel.findById(item._id).lean();
        return {
          productId: item._id.toString(),
          name: item.name,
          views: product?.viewsCount || 0,
          sales: item.sales,
          revenue: item.revenue,
          rating: product?.averageRating || 0,
        };
      }),
    );
  }

  private async getUnderPerformingProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<ProductPerformanceItem[]> {
    // Get products with low sales
    const allProducts = await this.productModel
      .find({ status: 'active', deletedAt: null })
      .sort({ salesCount: 1 })
      .limit(limit)
      .lean();

    return allProducts.map((p) => ({
      productId: p._id?.toString() || '',
      name: p.name,
      views: p.viewsCount,
      sales: p.salesCount,
      lastSold: undefined, // TODO: Get from orders
    }));
  }

  private async getCategoryBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<CategoryBreakdownItem[]> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.snapshot.categoryId',
          name: { $first: '$items.snapshot.categoryName' },
          totalSales: { $sum: '$items.qty' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Count products per category
    const categoryCounts = await this.productModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(categoryCounts.map((c) => [c._id, c.count]));

    return result.map((item) => ({
      categoryId: item._id?.toString() || '',
      name: item.name || 'Unknown',
      productCount: countMap.get(item._id) || 0,
      totalSales: item.totalSales,
      revenue: item.revenue,
    }));
  }

  private async getBrandBreakdown(startDate: Date, endDate: Date): Promise<BrandBreakdownItem[]> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.snapshot.brandId',
          name: { $first: '$items.snapshot.brandName' },
          totalSales: { $sum: '$items.qty' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { revenue: -1 } },
    ]);

    // Count products per brand
    const brandCounts = await this.productModel.aggregate([
      { $match: { deletedAt: null, brandId: { $exists: true, $ne: null } } },
      { $group: { _id: '$brandId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(brandCounts.map((c) => [c._id, c.count]));

    return result.map((item) => ({
      brandId: item._id?.toString() || '',
      name: item.name || 'Unknown',
      productCount: countMap.get(item._id) || 0,
      totalSales: item.totalSales,
      revenue: item.revenue,
    }));
  }

  private async getAverageProductRating(): Promise<number> {
    const result = await this.productModel.aggregate([
      { $match: { averageRating: { $gt: 0 }, deletedAt: null } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } },
    ]);

    return result[0]?.avgRating || 0;
  }

  private async getActiveCustomers(startDate: Date, endDate: Date): Promise<number> {
    const customers = await this.orderModel.distinct('userId', {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['COMPLETED', 'DELIVERED'] },
    });

    return customers.length;
  }

  private async getReturningCustomers(startDate: Date, endDate: Date): Promise<number> {
    const customers = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
        },
      },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'returningCustomers' },
    ]);

    return customers[0]?.returningCustomers || 0;
  }

  private calculateRetentionRate(total: number, newCust: number, active: number): number {
    if (total === 0 || newCust === 0) return 0;
    const retained = active - newCust;
    return (retained / (total - newCust)) * 100;
  }

  private async getAverageLifetimeValue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
        },
      },
      {
        $group: {
          _id: null,
          avgLifetimeValue: { $avg: '$totalSpent' },
        },
      },
    ]);

    return result[0]?.avgLifetimeValue || 0;
  }

  private async getTopCustomers(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<TopCustomerItem[]> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
    ]);

    return Promise.all(
      result.map(async (item) => {
        const user = await this.userModel.findById(item._id).lean();
        return {
          userId: item._id.toString(),
          name: user
            ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone
            : 'Unknown',
          totalOrders: item.totalOrders,
          totalSpent: item.totalSpent,
          lastOrderDate: item.lastOrderDate,
        };
      }),
    );
  }

  private async getCustomersByRegion(): Promise<Array<unknown>> {
    // This would require address data linked to users
    // Placeholder implementation
    return [];
  }

  private async getCustomerSegmentation(
    startDate: Date,
    endDate: Date,
  ): Promise<CustomerSegmentItem[]> {
    // Placeholder segmentation based on order value
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const segments = {
      vip: result.filter((c) => c.totalSpent > 10000).length,
      regular: result.filter((c) => c.totalSpent >= 3000 && c.totalSpent <= 10000).length,
      occasional: result.filter((c) => c.totalSpent < 3000).length,
    };

    return [
      { segment: 'VIP', count: segments.vip, revenue: 0, averageOrderValue: 0 },
      { segment: 'Regular', count: segments.regular, revenue: 0, averageOrderValue: 0 },
      { segment: 'Occasional', count: segments.occasional, revenue: 0, averageOrderValue: 0 },
    ];
  }

  private async getRevenueByChannel(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueByChannelItem[]> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: '$source',
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);

    return result.map((item) => ({
      channel: item._id || 'web',
      revenue: item.revenue,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    }));
  }

  private async getProfitByCategory(
    startDate: Date,
    endDate: Date,
  ): Promise<ProfitByCategoryItem[]> {
    const revenue = await this.getSalesByCategory(startDate, endDate, {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['COMPLETED', 'DELIVERED'] },
    });

    return revenue.map((item) => ({
      categoryId: item.categoryId,
      name: item.categoryName,
      revenue: item.revenue,
      cost: 0, // TODO: Get from inventory/cost system
      profit: item.revenue, // Simplified
      margin: 100, // Simplified
    }));
  }

  private async getCashFlow(
    startDate: Date,
    endDate: Date,
    groupBy: string,
  ): Promise<CashFlowEntry[]> {
    const dateFormat = groupBy === 'daily' ? '%Y-%m-%d' : groupBy === 'weekly' ? '%Y-W%U' : '%Y-%m';

    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          inflow: { $sum: '$total' },
          outflow: {
            $sum: {
              $add: ['$totalDiscount', { $cond: ['$isRefunded', '$refundAmount', 0] }],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          inflow: 1,
          outflow: 1,
          net: { $subtract: ['$inflow', '$outflow'] },
          _id: 0,
        },
      },
    ]);

    return result;
  }

  private async generateRevenueProjections(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueProjection> {
    // Simple growth-based projection
    const periodRevenue = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['COMPLETED', 'DELIVERED'] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$total' },
        },
      },
    ]);

    const revenue = periodRevenue[0]?.revenue || 0;
    const growthRate = 1.15; // Assume 15% growth

    return {
      nextMonth: revenue * growthRate,
      nextQuarter: revenue * growthRate * 3,
      nextYear: revenue * growthRate * 12,
    };
  }

  private async getTopCoupons(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<MarketingTopCoupon[]> {
    const coupons = await this.couponModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ 'stats.successfulOrders': -1 })
      .limit(limit)
      .lean();

    return coupons.map((c) => ({
      code: c.code,
      uses: c.currentUses,
      discount: c.stats.totalDiscount,
      revenue: c.stats.totalRevenue,
    }));
  }

  private async getConversionRate(startDate: Date, endDate: Date): Promise<number> {
    const [totalCarts, convertedCarts] = await Promise.all([
      this.cartModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      this.cartModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'converted',
      }),
    ]);

    return totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;
  }

  private calculateAverageProcessingTime(orders: OrderDocument[]): number {
    const processingTimes = orders
      .filter((o) => o.processingStartedAt && o.shippedAt)
      .map((o) => (o.shippedAt!.getTime() - o.processingStartedAt!.getTime()) / (1000 * 60 * 60)); // hours

    return processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;
  }

  private calculateAverageDeliveryTime(orders: OrderDocument[]): number {
    const deliveryTimes = orders
      .filter((o) => o.shippedAt && o.deliveredAt)
      .map((o) => (o.deliveredAt!.getTime() - o.shippedAt!.getTime()) / (1000 * 60 * 60 * 24)); // days

    return deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
      : 0;
  }

  private calculateOnTimeDeliveryRate(orders: OrderDocument[]): number {
    const ordersWithEstimate = orders.filter((o) => o.estimatedDeliveryDate && o.deliveredAt);
    const onTime = ordersWithEstimate.filter(
      (o) => o.deliveredAt! <= o.estimatedDeliveryDate!,
    ).length;

    return ordersWithEstimate.length > 0 ? (onTime / ordersWithEstimate.length) * 100 : 0;
  }

  private getTopReturnReasons(returnedOrders: OrderDocument[]): ReturnAnalyticsItem[] {
    const reasonCounts: Record<string, number> = {};

    returnedOrders.forEach((order) => {
      const reason = order.returnReason || 'Not specified';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const total = returnedOrders.length;
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getTopAbandonedProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<AbandonedProductItem[]> {
    const result = await this.cartModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'abandoned',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productSnapshot.name' },
          abandonedCount: { $sum: 1 },
          lostRevenue: {
            $sum: {
              $multiply: ['$items.pricing.finalPrice', '$items.qty'],
            },
          },
        },
      },
      { $sort: { lostRevenue: -1 } },
      { $limit: limit },
      {
        $project: {
          productId: { $toString: '$_id' },
          name: 1,
          abandonedCount: 1,
          lostRevenue: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId: string): Promise<AdvancedReportDocument> {
    const report = await this.reportModel.findOne({ reportId });
    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }
    return report;
  }

  /**
   * List reports with pagination
   */
  async listReports(
    page = 1,
    limit = 20,
    category?: ReportCategory,
    userId?: string,
  ): Promise<{
    reports: AdvancedReportDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { isArchived: false };

    if (category) query.category = category;
    if (userId) query.createdBy = new Types.ObjectId(userId);

    const [reports, total] = await Promise.all([
      this.reportModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.reportModel.countDocuments(query),
    ]);

    return {
      reports: reports as AdvancedReportDocument[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Archive report
   */
  async archiveReport(reportId: string): Promise<AdvancedReportDocument> {
    const report = await this.getReportById(reportId);
    report.isArchived = true;
    await report.save();
    return report;
  }

  /**
   * Delete report
   */
  async deleteReport(reportId: string): Promise<void> {
    const report = await this.getReportById(reportId);
    await report.deleteOne();
  }
}
