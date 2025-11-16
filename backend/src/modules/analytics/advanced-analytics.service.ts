import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../checkout/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Variant, VariantDocument } from '../products/schemas/variant.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { AdvancedReport, AdvancedReportDocument, ReportCategory, ReportPriority } from './schemas/advanced-report.schema';
import { SystemMonitoringService } from '../system-monitoring/system-monitoring.service';

const COMPLETED_STATUSES = ['completed'] as const;

/**
 * Advanced Analytics Service
 * 
 * NOTE: All monetary values are in USD (US Dollars)
 * All revenue, pricing, and financial calculations use USD as the base currency
 */

interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  period?: string;
  limit?: number;
  page?: number;
}

interface ProductAggregateResult {
  _id: Types.ObjectId;
  product: string;
  sales: number;
  revenue: number;
}

interface CustomerAggregateResult {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
}

interface InventoryAggregateResult {
  _id: Types.ObjectId;
  categoryName: string;
  count: number;
  totalStock: number;
}

interface RevenueSourceResult {
  _id: string;
  amount: number;
}

interface TopProductDetailResult {
  _id: Types.ObjectId;
  id: Types.ObjectId;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  rating: number;
}

interface CategoryPerformanceResult {
  _id: Types.ObjectId;
  category: string;
  count: number;
  sales: number;
  revenue: number;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  customerIds?: Types.ObjectId[];
}

interface ReportDocument {
  reportId: string;
  title: string;
  titleEn: string;
  category: string;
  priority: string;
  status: string;
  generatedAt: Date;
  summary: {
    totalRecords: number;
    totalValue: number;
    currency: string;
    growth?: number;
  };
  createdBy: Types.ObjectId | string;
  creatorName?: string;
}

export interface TopCustomerResult {
  id: string;
  name: string;
  orders: number;
  totalSpent: number;
}

export interface MetricTrendDataPoint {
  date: string;
  value: number;
  change: number;
}

export interface LowStockProductResult {
  _id: Types.ObjectId;
  name: string;
  stock: number;
  minStock: number;
}

@Injectable()
export class AdvancedAnalyticsService {
  private readonly logger = new Logger(AdvancedAnalyticsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(AdvancedReport.name) private advancedReportModel: Model<AdvancedReportDocument>,
    private systemMonitoring: SystemMonitoringService,
  ) {}

  // ==================== Helper Methods ====================

  /**
   * Generate sales data by date
   */
  private async generateSalesByDate(startDate: Date, endDate: Date) {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const salesByDate = [];

    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const dayOrders = await this.orderModel
        .find({
          createdAt: { $gte: date, $lt: nextDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        })
        .lean();

      const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const orders = dayOrders.length;

      salesByDate.push({
        date: date.toISOString().split('T')[0],
        revenue,
        orders,
      });
    }

    return salesByDate;
  }

  /**
   * Get sales by category
   */
  private async getSalesByCategory(startDate: Date, endDate: Date) {
    // استخدام lookup من products أولاً (أكثر موثوقية)
    // ثم fallback إلى snapshot إذا كان موجوداً
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
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
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'categoryFromProduct',
        },
      },
      {
        $lookup: {
          from: 'categories',
          let: {
            snapshotCategoryId: {
              $cond: {
                if: { $ne: ['$items.snapshot.categoryId', null] },
                then: {
                  $cond: {
                    if: { $eq: [{ $type: '$items.snapshot.categoryId' }, 'string'] },
                    then: { $toObjectId: '$items.snapshot.categoryId' },
                    else: '$items.snapshot.categoryId',
                  },
                },
                else: null,
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$$snapshotCategoryId', null] },
                    { $eq: ['$_id', '$$snapshotCategoryId'] },
                  ],
                },
              },
            },
          ],
          as: 'categoryFromSnapshot',
        },
      },
      {
        $addFields: {
          // استخدام categoryName من snapshot أولاً، ثم من product
          categoryName: {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$items.snapshot.categoryName', null] },
                  { $ne: ['$items.snapshot.categoryName', ''] },
                  { $ne: ['$items.snapshot.categoryName', 'undefined'] },
                ],
              },
              then: '$items.snapshot.categoryName',
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$categoryFromSnapshot' }, 0] },
                  then: { $arrayElemAt: ['$categoryFromSnapshot.name', 0] },
                  else: {
                    $cond: {
                      if: { $gt: [{ $size: '$categoryFromProduct' }, 0] },
                      then: { $arrayElemAt: ['$categoryFromProduct.name', 0] },
                      else: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { categoryName: { $ne: null } },
            { categoryName: { $ne: '' } },
            { categoryName: { $ne: 'undefined' } },
            { categoryName: { $exists: true } },
          ],
        },
      },
      {
        $group: {
          _id: '$categoryName',
          categoryName: { $first: '$categoryName' },
          revenue: { $sum: '$items.lineTotal' },
          sales: { $sum: '$items.qty' },
        },
      },
      { $sort: { revenue: -1 as 1 | -1 } },
    ];

    try {
      // Debug: تحقق من الطلبات المطابقة
      const matchingOrdersCount = await this.orderModel.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: COMPLETED_STATUSES },
        paymentStatus: 'paid',
      });
      this.logger.debug(`getSalesByCategory: Found ${matchingOrdersCount} matching orders`);

      const results = await this.orderModel.aggregate(pipeline);
      const totalRevenue = results.reduce((sum, item) => sum + (item.revenue || 0), 0);

      this.logger.debug(`getSalesByCategory found ${results.length} categories with total revenue: ${totalRevenue}`);
      
      if (results.length === 0) {
        // Debug: تحقق من البيانات الخام
        const sampleOrder = await this.orderModel.findOne({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        }).lean();
        
        if (sampleOrder && sampleOrder.items && sampleOrder.items.length > 0) {
          const firstItem = sampleOrder.items[0];
          this.logger.debug(`Sample order item snapshot.categoryId: ${firstItem.snapshot?.categoryId}`);
          this.logger.debug(`Sample order item productId: ${firstItem.productId}`);
        }
      }

      return results.map((item) => ({
        category: item.categoryName,
        revenue: item.revenue || 0,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
        sales: item.sales || 0,
      }));
    } catch (error: any) {
      this.logger.error(`Error in getSalesByCategory: ${error?.message || String(error)}`);
      this.logger.error(`Error stack: ${error?.stack || 'No stack trace'}`);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get sales by payment method
   */
  private async getSalesByPaymentMethod(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 as 1 | -1 } },
    ];

    const results = await this.orderModel.aggregate(pipeline);

    return results.map((item) => ({
      method: item._id || 'Unknown',
      amount: item.amount,
      count: item.count,
    }));
  }

  /**
   * Get top products
   */
  private async getTopProducts(startDate: Date, endDate: Date, limit: number) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
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
          product: { $first: '$product.name' },
          sales: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
        },
      },
      { $sort: { sales: -1 as 1 | -1 } },
      { $limit: limit },
    ];

    const results = await this.orderModel.aggregate(pipeline);

    return results.map((item: ProductAggregateResult) => ({
      id: item._id.toString(),
      name: item.product,
      sales: item.sales,
      revenue: item.revenue,
    }));
  }

  // ==================== Sales Analytics ====================
  async getSalesAnalytics(params: AnalyticsParams) {
    this.logger.log('Getting sales analytics with params:', params);

    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Get real sales data from orders using correct status values
    const [orders, previousPeriodOrders] = await Promise.all([
      this.orderModel
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        })
        .lean(),
      this.orderModel
        .find({
          createdAt: {
            $gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            $lt: startDate,
          },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        })
        .lean(),
    ]);

    // Calculate real metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const previousRevenue = previousPeriodOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );
    const previousOrders = previousPeriodOrders.length;
    
    // Calculate growth metrics
    const salesGrowth =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const revenueGrowth =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersGrowth =
      previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;

    // Generate sales by date
    const salesByDate = await this.generateSalesByDate(startDate, endDate);

    // Get sales by category
    const salesByCategory = await this.getSalesByCategory(startDate, endDate);

    // Get sales by payment method
    const salesByPaymentMethod = await this.getSalesByPaymentMethod(startDate, endDate);

    // Get top products
    const topProducts = await this.getTopProducts(startDate, endDate, params.limit || 5);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      salesGrowth,
      revenueGrowth,
      ordersGrowth,
      salesByDate,
      salesByCategory,
      salesByPaymentMethod,
      topProducts,
    };
  }

  // ==================== Product Performance ====================
  async getProductPerformance(params: AnalyticsParams) {
    this.logger.log('Getting product performance with params:', params);

    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Calculate previous period for growth comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // Get actual product count for both periods
    const totalProducts = await this.productModel.countDocuments({ deletedAt: null });
    const previousTotalProducts = await this.productModel.countDocuments({
      deletedAt: null,
      createdAt: { $lt: startDate },
    });

    // Get real product performance data for both periods
    const [
      topProducts,
      lowStockProducts,
      categoryPerformance,
      totalSalesData,
      previousTotalSalesData,
    ] = await Promise.all([
      this.getTopProductsWithDetails(startDate, endDate, params.limit || 10),
      this.getLowStockProducts(),
      this.getProductPerformanceByCategory(startDate, endDate),
      this.getTotalSalesFromOrders(startDate, endDate),
      this.getTotalSalesFromOrders(previousStartDate, previousEndDate),
    ]);

    // Calculate total sales
    const totalSales = totalSalesData.totalSales || 0;
    const previousTotalSales = previousTotalSalesData.totalSales || 0;

    // Calculate growth metrics
    const totalProductsGrowth =
      previousTotalProducts > 0
        ? ((totalProducts - previousTotalProducts) / previousTotalProducts) * 100
        : 0;

    const totalSalesGrowth =
      previousTotalSales > 0
        ? ((totalSales - previousTotalSales) / previousTotalSales) * 100
        : 0;

    // Calculate average rating from all products
    const avgRatingData = await this.productModel.aggregate([
      {
        $match: {
          deletedAt: null,
          status: 'active',
          averageRating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$averageRating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const previousAvgRatingData = await this.productModel.aggregate([
      {
        $match: {
          deletedAt: null,
          status: 'active',
          averageRating: { $exists: true, $ne: null },
          createdAt: { $lt: startDate },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$averageRating' },
        },
      },
    ]);

    const averageRating = avgRatingData[0]?.averageRating || 0;
    const previousAverageRating = previousAvgRatingData[0]?.averageRating || 0;
    const averageRatingGrowth =
      previousAverageRating > 0
        ? ((averageRating - previousAverageRating) / previousAverageRating) * 100
        : 0;

    // Calculate low stock growth
    const previousLowStockCount = await this.productModel.countDocuments({
      deletedAt: null,
      trackStock: true,
      $expr: { $lt: ['$stock', '$minStock'] },
      updatedAt: { $gte: previousStartDate, $lt: startDate },
    });

    const lowStockGrowth =
      previousLowStockCount > 0
        ? ((lowStockProducts.length - previousLowStockCount) /
            previousLowStockCount) *
          100
        : 0;

    return {
      totalProducts,
      totalSales,
      averageRating: Math.round(averageRating * 10) / 10,
      totalProductsGrowth: Math.round(totalProductsGrowth * 10) / 10,
      totalSalesGrowth: Math.round(totalSalesGrowth * 10) / 10,
      averageRatingGrowth: Math.round(averageRatingGrowth * 10) / 10,
      lowStockGrowth: Math.round(lowStockGrowth * 10) / 10,
      topProducts,
      lowStockProducts,
      byCategory: categoryPerformance,
    };
  }

  // ==================== Customer Analytics ====================
  async getCustomerAnalytics(params: AnalyticsParams) {
    this.logger.log('Getting customer analytics with params:', params);

    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Calculate previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // Get actual customer counts for current period
    const totalCustomers = await this.userModel.countDocuments({
      roles: { $in: ['user'] },
      status: 'active',
      deletedAt: null,
    });

    // Get previous period total customers
    const previousTotalCustomers = await this.userModel.countDocuments({
      roles: { $in: ['user'] },
      status: 'active',
      deletedAt: null,
      createdAt: { $lt: startDate },
    });

    // Get new customers in current period
    const newCustomers = await this.userModel.countDocuments({
      roles: { $in: ['user'] },
      status: 'active',
      deletedAt: null,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Get new customers in previous period
    const previousNewCustomers = await this.userModel.countDocuments({
      roles: { $in: ['user'] },
      status: 'active',
      deletedAt: null,
      createdAt: { $gte: previousStartDate, $lt: previousEndDate },
    });

    // Get active customers (customers with orders in current period)
    const activeCustomersData = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
          'orders.createdAt': { $gte: startDate, $lte: endDate },
        },
      },
      { $count: 'activeCustomers' },
    ]);

    // Get active customers in previous period
    const previousActiveCustomersData = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
          'orders.createdAt': { $gte: previousStartDate, $lt: previousEndDate },
        },
      },
      { $count: 'activeCustomers' },
    ]);

    const activeCustomers = activeCustomersData[0]?.activeCustomers || 0;
    const previousActiveCustomers = previousActiveCustomersData[0]?.activeCustomers || 0;

    // Get top customers by spending
    const topCustomers = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
          'orders.status': { $in: COMPLETED_STATUSES },
          'orders.paymentStatus': 'paid',
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          phone: 1,
          totalSpent: { $sum: '$orders.total' },
          orderCount: { $size: '$orders' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]);

    // Calculate customer lifetime value (average spending per customer)
    const customerLifetimeValue = totalCustomers > 0 ? await this.calculateCustomerLifetimeValue() : 0;
    const previousCustomerLifetimeValue = previousTotalCustomers > 0 ? 
      await this.calculateCustomerLifetimeValueForPeriod(previousStartDate, previousEndDate) : 0;

    // Calculate growth metrics
    const totalCustomersGrowth = previousTotalCustomers > 0 
      ? ((totalCustomers - previousTotalCustomers) / previousTotalCustomers) * 100 : 0;
    const newCustomersGrowth = previousNewCustomers > 0 
      ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 : 0;
    const activeCustomersGrowth = previousActiveCustomers > 0 
      ? ((activeCustomers - previousActiveCustomers) / previousActiveCustomers) * 100 : 0;
    const customerLifetimeValueGrowth = previousCustomerLifetimeValue > 0 
      ? ((customerLifetimeValue - previousCustomerLifetimeValue) / previousCustomerLifetimeValue) * 100 : 0;

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      customerLifetimeValue,
      totalCustomersGrowth,
      newCustomersGrowth,
      activeCustomersGrowth,
      customerLifetimeValueGrowth,
      customerSegments: await this.getCustomerSegments(),
      topCustomers: topCustomers.map((customer: CustomerAggregateResult) => ({
        id: customer._id.toString(),
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.phone,
        orders: customer.orderCount,
        totalSpent: customer.totalSpent,
      })),
    };
  }

  // ==================== Inventory Report ====================
  async getInventoryReport(params: AnalyticsParams) {
    this.logger.log('Getting inventory report with params:', params);

    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Calculate previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);

    // Get current period product counts
    const totalProducts = await this.productModel.countDocuments({ deletedAt: null });
    const activeProducts = await this.productModel.countDocuments({
      status: 'active',
      isActive: true,
      deletedAt: null,
    });

    // Get low stock products (stock < minStock)
    const lowStockProducts = await this.productModel.countDocuments({
      deletedAt: null,
      trackStock: true,
      $expr: { $lt: ['$stock', '$minStock'] },
    });

    // Get out of stock products
    const outOfStockProducts = await this.productModel.countDocuments({
      deletedAt: null,
      trackStock: true,
      stock: 0,
    });

    // Get previous period counts for comparison
    const previousTotalProducts = await this.productModel.countDocuments({
      deletedAt: null,
      createdAt: { $lt: startDate },
    });

    const previousActiveProducts = await this.productModel.countDocuments({
      status: 'active',
      isActive: true,
      deletedAt: null,
      createdAt: { $lt: startDate },
    });

    const previousOutOfStockProducts = await this.productModel.countDocuments({
      deletedAt: null,
      trackStock: true,
      stock: 0,
      updatedAt: { $gte: previousStartDate, $lt: startDate },
    });

    // Calculate current and previous inventory values
    const totalValue = await this.calculateInventoryValue();
    const previousTotalValue = await this.calculateInventoryValueForDate(previousStartDate);

    // Calculate growth metrics
    const totalProductsGrowth = previousTotalProducts > 0 
      ? ((totalProducts - previousTotalProducts) / previousTotalProducts) * 100 : 0;
    const inStockGrowth = previousActiveProducts > 0 
      ? ((activeProducts - previousActiveProducts) / previousActiveProducts) * 100 : 0;
    const outOfStockGrowth = previousOutOfStockProducts > 0 
      ? ((outOfStockProducts - previousOutOfStockProducts) / previousOutOfStockProducts) * 100 : 0;
    const totalValueGrowth = previousTotalValue > 0 
      ? ((totalValue - previousTotalValue) / previousTotalValue) * 100 : 0;

    // Get inventory by category
    const inventoryByCategory = await this.productModel.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent inventory movements from orders
    const recentMovements = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
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
        $project: {
          date: '$createdAt',
          type: 'out',
          quantity: '$items.qty',
          productName: '$product.name',
        },
      },
      { $sort: { date: -1 } },
      { $limit: 20 },
    ]);

    return {
      totalProducts,
      inStock: activeProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      totalValue,
      totalProductsGrowth,
      inStockGrowth,
      outOfStockGrowth,
      totalValueGrowth,
      byCategory: inventoryByCategory.map((item: InventoryAggregateResult) => ({
        category: item.categoryName,
        count: item.count,
        value: item.totalStock * 100, // Assuming average price of $100 USD per unit
      })),
      movements: recentMovements.map((movement) => ({
        date: movement.date,
        type: movement.type,
        quantity: movement.quantity,
        product: movement.productName,
      })),
    };
  }

  // ==================== Financial Report ====================
  async getFinancialReport(params: AnalyticsParams) {
    this.logger.log('Getting financial report with params:', params);

    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Calculate previous period for comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // Get current and previous period revenue from orders
    const [currentRevenueData, previousRevenueData] = await Promise.all([
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: COMPLETED_STATUSES },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: previousStartDate, $lt: previousEndDate },
            status: { $in: COMPLETED_STATUSES },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenue = currentRevenueData[0]?.totalRevenue || 0;
    const previousRevenue = previousRevenueData[0]?.totalRevenue || 0;

    // Calculate revenue growth
    const revenueGrowth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Generate cash flow data (daily revenue)
    const cashFlow = await this.generateCashFlowData(startDate, endDate);

    // Get revenue by source (payment methods)
    const revenueBySource = await this.getRevenueBySource(startDate, endDate);

    return {
      revenue,
      revenueGrowth,
      cashFlow,
      revenueBySource,
    };
  }

  // ==================== Cart Analytics ====================
  async getCartAnalytics(params: AnalyticsParams) {
    this.logger.log('Getting cart analytics with params:', params);

    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Get total carts count
    const totalCarts = await this.cartModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Get active carts (carts with recent activity)
    const activeCarts = await this.cartModel.countDocuments({
      status: 'active',
      lastActivityAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      items: { $exists: true, $not: { $size: 0 } }, // Has items
    });

    // Get abandoned carts (carts with no activity for more than 24 hours and have items)
    const abandonedCarts = await this.cartModel.countDocuments({
      status: 'active',
      lastActivityAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // No activity for 24+ hours
      items: { $exists: true, $not: { $size: 0 } }, // Has items
      isAbandoned: false, // Not already marked as abandoned
    });

    // Get converted carts (carts that were converted to orders)
    const convertedCarts = await this.cartModel.countDocuments({
      status: 'converted',
      convertedAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate abandonment rate
    const totalActiveCarts = activeCarts + abandonedCarts;
    const abandonmentRate = totalActiveCarts > 0 ? (abandonedCarts / totalActiveCarts) * 100 : 0;

    // Calculate conversion rate
    const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;

    // Calculate average cart value from active carts
    const cartValueData = await this.cartModel.aggregate([
      {
        $match: {
          status: 'active',
          items: { $exists: true, $not: { $size: 0 } },
          'pricingSummary.total': { $exists: true, $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          averageCartValue: { $avg: '$pricingSummary.total' },
          totalCartValue: { $sum: '$pricingSummary.total' },
        },
      },
    ]);

    const averageCartValue = cartValueData[0]?.averageCartValue || 0;
    const totalCartValue = cartValueData[0]?.totalCartValue || 0;

    return {
      totalCarts,
      activeCarts,
      abandonedCarts,
      convertedCarts,
      abandonmentRate: Math.round(abandonmentRate * 100) / 100, // Round to 2 decimal places
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
      averageCartValue: Math.round(averageCartValue * 100) / 100, // Round to 2 decimal places
      totalCartValue: Math.round(totalCartValue * 100) / 100, // Round to 2 decimal places
    };
  }

  // ==================== Marketing Report ====================
  async getMarketingReport(params: AnalyticsParams) {
    this.logger.log('Getting marketing report with params:', params);

    const startDate = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Calculate previous period for growth comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    // Get current and previous period data in parallel
    const [
      couponData,
      previousCouponData,
      totalDiscountGivenData,
      previousTotalDiscountGivenData,
      currentPeriodRevenue,
      previousPeriodRevenue,
    ] = await Promise.all([
      // Current period coupon data
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            appliedCouponCode: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$appliedCouponCode',
            uses: { $sum: 1 },
            totalDiscount: { $sum: '$couponDiscount' },
            totalRevenue: { $sum: '$total' },
          },
        },
        { $sort: { uses: -1 } },
      ]),
      // Previous period coupon data
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: previousStartDate, $lt: previousEndDate },
            appliedCouponCode: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$appliedCouponCode',
            uses: { $sum: 1 },
          },
        },
      ]),
      // Current period total discount
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            couponDiscount: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            totalDiscount: { $sum: '$couponDiscount' },
          },
        },
      ]),
      // Previous period total discount
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: previousStartDate, $lt: previousEndDate },
            couponDiscount: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            totalDiscount: { $sum: '$couponDiscount' },
          },
        },
      ]),
      // Current period revenue
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: COMPLETED_STATUSES },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            ordersWithCoupons: {
              $sum: { $cond: [{ $ne: ['$appliedCouponCode', null] }, 1, 0] },
            },
          },
        },
      ]),
      // Previous period revenue
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: previousStartDate, $lt: previousEndDate },
            status: { $in: COMPLETED_STATUSES },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            ordersWithCoupons: {
              $sum: { $cond: [{ $ne: ['$appliedCouponCode', null] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Current period metrics
    const totalCoupons = couponData.length;
    const activeCoupons = couponData.filter((c) => c.uses > 0).length;
    const discount = totalDiscountGivenData[0]?.totalDiscount || 0;
    const revenue = currentPeriodRevenue[0]?.totalRevenue || 0;
    const totalOrders = currentPeriodRevenue[0]?.totalOrders || 0;
    const ordersWithCoupons = currentPeriodRevenue[0]?.ordersWithCoupons || 0;
    const conversionRate = totalOrders > 0 ? (ordersWithCoupons / totalOrders) * 100 : 0;
    const roi = discount > 0 ? ((revenue - discount) / discount) * 100 : 0;

    // Previous period metrics
    const previousTotalCoupons = previousCouponData.length;
    const previousDiscount = previousTotalDiscountGivenData[0]?.totalDiscount || 0;
    const previousRevenue = previousPeriodRevenue[0]?.totalRevenue || 0;
    const previousOrdersWithCoupons = previousPeriodRevenue[0]?.ordersWithCoupons || 0;
    const previousConversionRate =
      previousOrdersWithCoupons > 0
        ? (previousOrdersWithCoupons / (previousRevenue > 0 ? 1 : 1)) * 100
        : 0;
    const previousRoi =
      previousDiscount > 0 ? ((previousRevenue - previousDiscount) / previousDiscount) * 100 : 0;

    // Calculate growth metrics
    const totalCouponsGrowth =
      previousTotalCoupons > 0
        ? ((totalCoupons - previousTotalCoupons) / previousTotalCoupons) * 100
        : 0;
    const totalDiscountGrowth =
      previousDiscount > 0 ? ((discount - previousDiscount) / previousDiscount) * 100 : 0;
    const roiGrowth = previousRoi > 0 ? ((roi - previousRoi) / previousRoi) * 100 : 0;
    const conversionRateGrowth =
      previousConversionRate > 0
        ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100
        : 0;

    return {
      totalCampaigns: 0, // Would need campaign tracking system
      activeCampaigns: 0,
      totalCoupons,
      activeCoupons,
      roi: Math.round(roi * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalDiscountGiven: discount,
      totalCouponsGrowth: Math.round(totalCouponsGrowth * 10) / 10,
      totalDiscountGrowth: Math.round(totalDiscountGrowth * 10) / 10,
      roiGrowth: Math.round(roiGrowth * 10) / 10,
      conversionRateGrowth: Math.round(conversionRateGrowth * 10) / 10,
      campaignPerformance: [], // Would need campaign tracking system
      topCoupons: couponData.slice(0, 10).map((coupon) => ({
        code: coupon._id,
        uses: coupon.uses,
        revenue: coupon.totalRevenue,
        discount: coupon.totalDiscount,
      })),
    };
  }

  // ==================== Real-time Metrics ====================
  async getRealTimeMetrics() {
    this.logger.log('Getting real-time metrics');

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Get active users (users with activity in last 24 hours)
    const activeUsers = await this.userModel.countDocuments({
      lastActivityAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: 'active',
      deletedAt: null,
    });

    // Get today's sales and orders
    const todayOrders = await this.orderModel
      .find({
        createdAt: { $gte: todayStart, $lt: todayEnd },
        status: { $in: COMPLETED_STATUSES },
        paymentStatus: 'paid',
      })
      .lean();

    const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const todayOrdersCount = todayOrders.length;

    // Get current revenue (last 7 days)
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const currentRevenueData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);

    const currentRevenue = currentRevenueData[0]?.totalRevenue || 0;

    // Get real system health from monitoring service
    const systemHealth = await this.systemMonitoring.getSystemHealth();

    return {
      activeUsers,
      todaySales,
      todayOrders: todayOrdersCount,
      currentRevenue,
      systemHealth: {
        status: systemHealth.status,
        uptime: Math.round((systemHealth.uptime / 86400) * 1000) / 10, // Convert seconds to days, show as percentage
        responseTime: Math.round(systemHealth.avgApiResponseTime),
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  // ==================== Quick Stats ====================
  async getQuickStats() {
    this.logger.log('Getting quick stats');

    const totalCustomers = await this.userModel.countDocuments({
      roles: { $in: ['user'] },
      status: 'active',
      deletedAt: null,
    });

    const totalProducts = await this.productModel.countDocuments({
      deletedAt: null,
    });

    // Get real revenue and orders data
    const revenueData = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const totalOrders = revenueData[0]?.totalOrders || 0;
    const averageOrderValue = revenueData[0]?.averageOrderValue || 0;

    // Calculate conversion rate (simplified)
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      conversionRate,
    };
  }

  // ==================== Advanced Reports ====================

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `REP-${year}-${month}-${sequence}`;
  }

  async generateAdvancedReport(
    data: AnalyticsParams & {
      title?: string;
      type?: string;
      category?: ReportCategory;
      priority?: string;
      createdBy: string;
      creatorName?: string;
    }
  ) {
    this.logger.log('Generating advanced report:', data);

    const startDate = data.startDate ? new Date(data.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = data.endDate ? new Date(data.endDate) : new Date();
    const reportId = this.generateReportId();
    const startTime = Date.now(); // Track processing time

    try {
      // Get comprehensive analytics data
      const [salesAnalytics, productAnalytics, customerAnalytics, cartAnalytics] = await Promise.all([
        this.getSalesAnalytics(data),
        this.getProductPerformance(data),
        this.getCustomerAnalytics(data),
        this.getCartAnalytics(data),
      ]);

      // Calculate summary metrics
      const totalRevenue = salesAnalytics.totalRevenue;
      const totalOrders = salesAnalytics.totalOrders;

      // Create report data
      const reportData: Partial<AdvancedReport> = {
        reportId,
      title: data.title || 'Advanced Analytics Report',
        titleEn: data.title || 'Advanced Analytics Report',
        category: data.category || ReportCategory.CUSTOM,
        priority: data.priority ? (data.priority as ReportPriority) : ReportPriority.MEDIUM,
        startDate,
        endDate,
        generatedAt: new Date(),
        createdBy: new Types.ObjectId(data.createdBy),
        creatorName: data.creatorName,

        // Summary
        summary: {
          totalRecords: totalOrders,
          totalValue: totalRevenue,
          currency: 'USD',
          growth: salesAnalytics.salesGrowth,
        },

        // Sales Analytics
        salesAnalytics: {
          totalSales: salesAnalytics.totalOrders,
          totalOrders: salesAnalytics.totalOrders,
          totalRevenue: salesAnalytics.totalRevenue,
          averageOrderValue: salesAnalytics.averageOrderValue,
          totalDiscount: await this.calculateTotalDiscount(startDate, endDate), // Calculate from orders
          netRevenue: salesAnalytics.totalRevenue,
          topSellingProducts: salesAnalytics.topProducts.map((p) => ({
            productId: p.id || '',
            name: p.name || '',
            quantity: p.sales || 0,
            revenue: p.revenue || 0,
          })),
          salesByDate: salesAnalytics.salesByDate.map((item) => ({
            date: item.date,
            sales: item.orders,
            orders: item.orders,
            revenue: item.revenue,
          })),
          salesByCategory: salesAnalytics.salesByCategory.map((item) => ({
            categoryId: item.category,
            categoryName: item.category,
            sales: item.sales,
            revenue: item.revenue,
            percentage: item.percentage,
          })),
          salesByRegion: await this.getSalesByRegion(startDate, endDate),
          paymentMethods: await this.getPaymentMethodsWithPercentage(salesAnalytics.salesByPaymentMethod, salesAnalytics.totalRevenue),
        },

        // Product Analytics
        productAnalytics: {
          totalProducts: productAnalytics.totalProducts,
          activeProducts: await this.getActiveProductsCount(), // Filter active
          outOfStock: await this.getOutOfStockCount(), // Calculate
          lowStock: await this.getLowStockCount(), // Calculate
          topPerformers: productAnalytics.topProducts.map((p) => ({
            productId: p.id || '',
            name: p.name || '',
            views: 0, // View tracking would need to be implemented in product service
            sales: p.sales || 0,
            revenue: p.revenue || 0,
            rating: p.rating || 0,
          })),
          underPerformers: await this.getUnderPerformers(startDate, endDate),
          categoryBreakdown: productAnalytics.byCategory.map((item) => ({
            categoryId: item.category || '',
            name: item.category || '',
            productCount: item.count || 0,
            totalSales: item.sales || 0,
            revenue: item.revenue || 0,
          })),
          brandBreakdown: await this.getBrandBreakdown(),
          inventoryValue: await this.calculateInventoryValue(), // Calculate
          averageProductRating: await this.getAverageProductRating(), // Calculate
        },

        // Customer Analytics
        customerAnalytics: {
          totalCustomers: customerAnalytics.totalCustomers,
          newCustomers: customerAnalytics.newCustomers,
          activeCustomers: customerAnalytics.activeCustomers,
          returningCustomers: await this.getReturningCustomersCount(startDate, endDate), // Calculate
          customerRetentionRate: (await this.calculateRetentionRates(startDate, endDate)).retentionRate,
          averageLifetimeValue: customerAnalytics.customerLifetimeValue,
          topCustomers: await Promise.all(customerAnalytics.topCustomers.map(async (c: TopCustomerResult) => ({
            userId: c.id,
            name: c.name,
            totalOrders: c.orders,
            totalSpent: c.totalSpent,
            lastOrderDate: await this.getLastOrderDate(c.id), // Get actual last order date
          }))),
          customersByRegion: await this.getCustomersByRegion(),
          customerSegmentation: await this.getCustomerSegmentationWithMetrics(customerAnalytics.customerSegments, startDate, endDate),
          churnRate: (await this.calculateRetentionRates(startDate, endDate)).churnRate,
          newVsReturning: {
            new: customerAnalytics.newCustomers,
            returning: customerAnalytics.totalCustomers - customerAnalytics.newCustomers,
            newPercentage: customerAnalytics.totalCustomers > 0 ?
              (customerAnalytics.newCustomers / customerAnalytics.totalCustomers) * 100 : 0,
            returningPercentage: customerAnalytics.totalCustomers > 0 ?
              ((customerAnalytics.totalCustomers - customerAnalytics.newCustomers) / customerAnalytics.totalCustomers) * 100 : 0,
          },
        },

        // Cart Analytics
        cartAnalytics: {
          totalCarts: cartAnalytics.totalCarts,
          activeCarts: cartAnalytics.activeCarts,
          abandonedCarts: cartAnalytics.abandonedCarts,
          abandonmentRate: cartAnalytics.abandonmentRate,
          recoveredCarts: cartAnalytics.convertedCarts,
          recoveryRate: cartAnalytics.conversionRate,
          averageCartValue: cartAnalytics.averageCartValue,
          averageCartItems: await this.getAverageCartItems(), // Calculate
          conversionRate: cartAnalytics.conversionRate,
          checkoutDropoffRate: await this.getCheckoutDropoffRate(), // Calculate
          abandonedCartValue: await this.getAbandonedCartValue(), // Calculate
          topAbandonedProducts: await this.getTopAbandonedProducts(), // Implement
        },

        // Status
      status: 'completed',
        metadata: {
          processingTime: Date.now() - startTime, // Calculate actual processing time
          dataSourceVersion: '1.0',
          reportVersion: '1.0',
          generationMode: 'manual',
        },
      };

      // Save report to database
      const savedReport = await this.advancedReportModel.create(reportData);

      return {
        id: savedReport.reportId,
        title: savedReport.title,
        category: savedReport.category,
        status: savedReport.status,
        generatedAt: savedReport.generatedAt.toISOString(),
        summary: savedReport.summary,
      data: {
          salesAnalytics: savedReport.salesAnalytics,
          productAnalytics: savedReport.productAnalytics,
          customerAnalytics: savedReport.customerAnalytics,
          cartAnalytics: savedReport.cartAnalytics,
        },
      };

    } catch (error) {
      this.logger.error('Error generating advanced report:', error);
      throw error;
    }
  }

  async listAdvancedReports(params: AnalyticsParams & { createdBy?: string; category?: string }) {
    this.logger.log('Listing advanced reports with params:', params);

    const page = parseInt(params.page?.toString() || '1', 10);
    const limit = parseInt(params.limit?.toString() || '10', 10);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = { isArchived: false };

    if (params.createdBy) {
      filter.createdBy = params.createdBy;
    }

    if (params.category) {
      filter.category = params.category;
    }

    if (params.startDate && params.endDate) {
      filter.startDate = { $gte: new Date(params.startDate) };
      filter.endDate = { $lte: new Date(params.endDate) };
    }

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      this.advancedReportModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('reportId title titleEn category priority status generatedAt summary createdBy creatorName')
        .lean(),
      this.advancedReportModel.countDocuments(filter),
    ]);

    return {
      data: reports.map((report: ReportDocument) => ({
        id: report.reportId,
        title: report.title,
        titleEn: report.titleEn,
        category: report.category,
        priority: report.priority,
        status: report.status,
        generatedAt: report.generatedAt.toISOString(),
        summary: report.summary,
        createdBy: report.createdBy,
        creatorName: report.creatorName,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdvancedReport(reportId: string) {
    this.logger.log('Getting advanced report:', reportId);

    const report = await this.advancedReportModel
      .findOne({ reportId })
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!report) {
      throw new Error('Report not found');
    }

    return {
      id: report.reportId,
      title: report.title,
      titleEn: report.titleEn,
      category: report.category,
      priority: report.priority,
      status: report.status,
      generatedAt: report.generatedAt.toISOString(),
      startDate: report.startDate.toISOString(),
      endDate: report.endDate.toISOString(),
      summary: report.summary,
      data: {
        salesAnalytics: report.salesAnalytics,
        productAnalytics: report.productAnalytics,
        customerAnalytics: report.customerAnalytics,
        cartAnalytics: report.cartAnalytics,
        financialAnalytics: report.financialAnalytics,
        marketingAnalytics: report.marketingAnalytics,
        operationalAnalytics: report.operationalAnalytics,
      },
      insights: report.insights,
      recommendations: report.recommendations,
      alerts: report.alerts,
      chartsData: report.chartsData,
      createdBy: report.createdBy,
      creatorName: report.creatorName,
      metadata: report.metadata,
    };
  }

  async archiveReport(reportId: string) {
    this.logger.log('Archiving report:', reportId);

    const report = await this.advancedReportModel
      .findOneAndUpdate(
        { reportId },
        {
          isArchived: true,
          status: 'archived' as const,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .select('reportId title status updatedAt')
      .lean();

    if (!report) {
      throw new Error('Report not found');
    }

    return {
      id: report.reportId,
      title: report.title,
      status: report.status,
      archivedAt: report.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  async deleteReport(reportId: string) {
    this.logger.log('Deleting report:', reportId);

    const result = await this.advancedReportModel.deleteOne({ reportId });

    if (result.deletedCount === 0) {
      throw new Error('Report not found');
    }

    return { success: true, message: 'Report deleted successfully' };
  }

  async exportReport(reportId: string, data: { format?: string }) {
    this.logger.log('Exporting report:', reportId, data);

    // In a real implementation, this would generate and store the actual file
    // For now, return mock data
    const format = data.format || 'pdf';
    const fileName = `${reportId}_${Date.now()}.${format}`;

    return {
      fileUrl: `https://api.example.com/reports/exports/${fileName}`,
      format,
      exportedAt: new Date().toISOString(),
      fileName,
    };
  }

  // ==================== Data Export ====================
  async exportSalesData(format: string, startDate: string, endDate: string) {
    this.logger.log('Exporting sales data:', { format, startDate, endDate });

    // Get real sales data
    const salesData = await this.getSalesAnalytics({
      startDate,
      endDate,
      period: 'custom',
    });

    // In a real implementation, this would generate and store the actual file
    const fileName = `sales_data_${startDate}_${endDate}_${Date.now()}.${format}`;

    return {
      fileUrl: `https://api.example.com/exports/${fileName}`,
      format,
      exportedAt: new Date().toISOString(),
      fileName,
      recordCount: salesData.totalOrders,
      totalValue: salesData.totalRevenue,
      currency: 'USD',
    };
  }

  async exportProductsData(format: string, startDate?: string, endDate?: string) {
    this.logger.log('Exporting products data:', { format, startDate, endDate });

    // Get real products data
    const productsData = await this.getProductPerformance({
      startDate,
      endDate,
      period: startDate && endDate ? 'custom' : '30d',
    });

    const fileName = `products_data_${startDate || 'all'}_${endDate || 'all'}_${Date.now()}.${format}`;

    return {
      fileUrl: `https://api.example.com/exports/${fileName}`,
      format,
      exportedAt: new Date().toISOString(),
      fileName,
      recordCount: productsData.totalProducts,
      totalValue: productsData.totalSales,
      currency: 'USD',
    };
  }

  async exportCustomersData(format: string, startDate?: string, endDate?: string) {
    this.logger.log('Exporting customers data:', { format, startDate, endDate });

    // Get real customers data
    const customersData = await this.getCustomerAnalytics({
      startDate,
      endDate,
      period: startDate && endDate ? 'custom' : '30d',
    });

    const fileName = `customers_data_${startDate || 'all'}_${endDate || 'all'}_${Date.now()}.${format}`;

    return {
      fileUrl: `https://api.example.com/exports/${fileName}`,
      format,
      exportedAt: new Date().toISOString(),
      fileName,
      recordCount: customersData.totalCustomers,
      totalValue: customersData.topCustomers.reduce((sum: number, c: TopCustomerResult) => sum + c.totalSpent, 0),
      currency: 'USD',
    };
  }

  // ==================== Comparison & Trends ====================
  async comparePeriodsAdvanced(
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string,
  ) {
    this.logger.log('Comparing periods:', { currentStart, currentEnd, previousStart, previousEnd });

    // Get current period data
    const currentData = await this.getSalesAnalytics({
      startDate: currentStart,
      endDate: currentEnd,
      period: 'custom',
    });

    // Get previous period data
    const previousData = await this.getSalesAnalytics({
      startDate: previousStart,
      endDate: previousEnd,
      period: 'custom',
    });

    // Calculate changes
    const revenueChange = previousData.totalRevenue > 0
      ? ((currentData.totalRevenue - previousData.totalRevenue) / previousData.totalRevenue) * 100
      : 0;

    const ordersChange = previousData.totalOrders > 0
      ? ((currentData.totalOrders - previousData.totalOrders) / previousData.totalOrders) * 100
      : 0;

    // Get customer data for both periods
    const currentCustomers = await this.getCustomerAnalytics({
      startDate: currentStart,
      endDate: currentEnd,
      period: 'custom',
    });

    const previousCustomers = await this.getCustomerAnalytics({
      startDate: previousStart,
      endDate: previousEnd,
      period: 'custom',
    });

    const customersChange = previousCustomers.totalCustomers > 0
      ? ((currentCustomers.totalCustomers - previousCustomers.totalCustomers) / previousCustomers.totalCustomers) * 100
      : 0;

    return {
      current: {
        revenue: currentData.totalRevenue,
        orders: currentData.totalOrders,
        customers: currentCustomers.totalCustomers,
        averageOrderValue: currentData.averageOrderValue,
      },
      previous: {
        revenue: previousData.totalRevenue,
        orders: previousData.totalOrders,
        customers: previousCustomers.totalCustomers,
        averageOrderValue: previousData.averageOrderValue,
      },
      change: {
        revenue: Math.round(revenueChange * 100) / 100,
        orders: Math.round(ordersChange * 100) / 100,
        customers: Math.round(customersChange * 100) / 100,
        averageOrderValue: previousData.averageOrderValue > 0
          ? Math.round(((currentData.averageOrderValue - previousData.averageOrderValue) / previousData.averageOrderValue) * 100 * 100) / 100
          : 0,
      },
      currency: 'USD',
    };
  }

  async getMetricTrendsAdvanced(
    metric: string,
    startDate: string,
    endDate: string,
    groupBy?: string,
  ) {
    this.logger.log('Getting metric trends:', { metric, startDate, endDate, groupBy });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));

    const data: MetricTrendDataPoint[] = [];

    // Generate real trend data based on metric
    switch (metric) {
      case 'revenue':
        for (let i = 0; i < Math.min(days, 90); i++) {
          const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

          const dayOrders = await this.orderModel
            .find({
              createdAt: { $gte: date, $lt: nextDate },
              status: { $in: COMPLETED_STATUSES },
              paymentStatus: 'paid',
            })
            .lean();

          const value = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
          data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100,
            change: i > 0 ? ((value - data[i - 1]?.value || 0) / (data[i - 1]?.value || 1)) * 100 : 0,
          });
        }
        break;

      case 'orders':
        for (let i = 0; i < Math.min(days, 90); i++) {
          const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

          const orderCount = await this.orderModel.countDocuments({
            createdAt: { $gte: date, $lt: nextDate },
            status: { $in: COMPLETED_STATUSES },
            paymentStatus: 'paid',
          });

          data.push({
            date: date.toISOString().split('T')[0],
            value: orderCount,
            change: i > 0 ? ((orderCount - data[i - 1]?.value || 0) / (data[i - 1]?.value || 1)) * 100 : 0,
          });
        }
        break;

      case 'customers':
        // For customers, we'll show daily new customer registrations
        for (let i = 0; i < Math.min(days, 90); i++) {
          const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

          const customerCount = await this.userModel.countDocuments({
            roles: { $in: ['user'] },
            status: 'active',
            deletedAt: null,
            createdAt: { $gte: date, $lt: nextDate },
          });

          data.push({
            date: date.toISOString().split('T')[0],
            value: customerCount,
            change: i > 0 ? ((customerCount - data[i - 1]?.value || 0) / (data[i - 1]?.value || 1)) * 100 : 0,
          });
        }
        break;

      case 'conversion_rate':
        // Calculate daily conversion rate
        for (let i = 0; i < Math.min(days, 90); i++) {
          const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

          const [totalCarts, convertedCarts] = await Promise.all([
            this.cartModel.countDocuments({
              createdAt: { $gte: date, $lt: nextDate },
            }),
            this.cartModel.countDocuments({
              convertedAt: { $gte: date, $lt: nextDate },
              status: 'converted',
            }),
          ]);

          const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;

          data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(conversionRate * 100) / 100,
            change: i > 0 ? ((conversionRate - data[i - 1]?.value || 0) / (data[i - 1]?.value || 1)) * 100 : 0,
          });
        }
        break;

      default:
        // For other metrics, return empty data
        break;
    }

    return {
      metric,
      startDate,
      endDate,
      groupBy: groupBy || 'day',
      currency: 'USD',
      data,
    };
  }

  /**
   * Calculate customer lifetime value
   */
  private async calculateCustomerLifetimeValue() {
    const pipeline = [
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
          'orders.status': { $in: COMPLETED_STATUSES },
          'orders.paymentStatus': 'paid',
        },
      },
      {
        $project: {
          totalSpent: { $sum: '$orders.total' },
        },
      },
      {
        $group: {
          _id: null,
          averageLifetimeValue: { $avg: '$totalSpent' },
        },
      },
    ];

    const result = await this.userModel.aggregate(pipeline);
    return result[0]?.averageLifetimeValue || 0;
  }

  /**
   * Calculate customer lifetime value for a specific period
   */
  private async calculateCustomerLifetimeValueForPeriod(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
          createdAt: { $lt: endDate },
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $gte: ['$createdAt', startDate] },
                    { $lt: ['$createdAt', endDate] },
                    { $in: ['$status', COMPLETED_STATUSES] },
                    { $eq: ['$paymentStatus', 'paid'] },
                  ],
                },
              },
            },
          ],
          as: 'orders',
        },
      },
      {
        $project: {
          totalSpent: { $sum: '$orders.total' },
        },
      },
      {
        $group: {
          _id: null,
          averageLifetimeValue: { $avg: '$totalSpent' },
        },
      },
    ];

    const result = await this.userModel.aggregate(pipeline);
    return result[0]?.averageLifetimeValue || 0;
  }

  /**
   * Calculate retention and churn rates
   */
  private async calculateRetentionRates(startDate: Date, endDate: Date) {
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousPeriodStart = new Date(startDate.getTime() - periodLength);
    const previousPeriodEnd = startDate;

    // Get customers from previous period
    const previousCustomers = await this.userModel
      .find({
        roles: { $in: ['user'] },
        status: 'active',
        deletedAt: null,
        createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd },
      })
      .select('_id')
      .lean();

    // Get customers who made orders in current period
    const retainedCustomers = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $match: {
          _id: { $in: previousCustomers.map((c) => c._id) },
          'orders.createdAt': { $gte: startDate, $lte: endDate },
          'orders.status': { $in: COMPLETED_STATUSES },
        },
      },
      { $count: 'retained' },
    ]);

    const totalPreviousCustomers = previousCustomers.length;
    const retainedCount = retainedCustomers[0]?.retained || 0;

    const retentionRate =
      totalPreviousCustomers > 0 ? (retainedCount / totalPreviousCustomers) * 100 : 0;
    const churnRate = 100 - retentionRate;

    return { retentionRate, churnRate };
  }

  /**
   * Get customer segments with real data
   */
  private async getCustomerSegments() {
    // Get all customers with their spending
    const customersWithSpending = await this.userModel.aggregate([
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          lastActivityAt: 1,
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$orders',
                    as: 'order',
                    cond: {
                      $and: [
                        { $in: ['$$order.status', COMPLETED_STATUSES] },
                        { $eq: ['$$order.paymentStatus', 'paid'] },
                      ],
                    },
                  },
                },
                as: 'order',
                in: '$$order.total',
              },
            },
          },
          orderCount: {
            $size: {
              $filter: {
                input: '$orders',
                as: 'order',
                cond: {
                  $and: [
                    { $in: ['$$order.status', COMPLETED_STATUSES] },
                    { $eq: ['$$order.paymentStatus', 'paid'] },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    const totalCustomers = customersWithSpending.length;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Segment customers based on actual behavior
    const vipCustomers = customersWithSpending.slice(0, Math.floor(totalCustomers * 0.1));
    const regularCustomers = customersWithSpending.filter(
      (c) => c.orderCount >= 2 && !vipCustomers.find((v) => v._id.equals(c._id))
    );
    const newCustomers = customersWithSpending.filter(
      (c) => new Date(c.createdAt) >= thirtyDaysAgo
    );
    const inactiveCustomers = customersWithSpending.filter(
      (c) =>
        c.lastActivityAt &&
        new Date(c.lastActivityAt) < thirtyDaysAgo &&
        !newCustomers.find((n) => n._id.equals(c._id))
    );

    return [
      {
        segment: 'VIP Customers',
        count: vipCustomers.length,
        percentage: (vipCustomers.length / totalCustomers) * 100,
        customerIds: vipCustomers.map((c) => c._id),
      },
      {
        segment: 'Regular Customers',
        count: regularCustomers.length,
        percentage: (regularCustomers.length / totalCustomers) * 100,
        customerIds: regularCustomers.map((c) => c._id),
      },
      {
        segment: 'New Customers',
        count: newCustomers.length,
        percentage: (newCustomers.length / totalCustomers) * 100,
        customerIds: newCustomers.map((c) => c._id),
      },
      {
        segment: 'Inactive Customers',
        count: inactiveCustomers.length,
        percentage: (inactiveCustomers.length / totalCustomers) * 100,
        customerIds: inactiveCustomers.map((c) => c._id),
      },
    ];
  }

  /**
   * Calculate total inventory value
   */
  private async calculateInventoryValue() {
    const result = await this.variantModel.aggregate([
      {
        $match: {
          trackInventory: true,
          deletedAt: null,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: ['$stock', '$basePriceUSD'],
            },
          },
        },
      },
    ]);

    return result[0]?.totalValue || 0;
  }

  /**
   * Calculate inventory value for a specific date
   */
  private async calculateInventoryValueForDate(date: Date) {
    // For simplicity, we'll calculate based on products created before this date
    // In a real system, you'd track stock history over time
    const result = await this.variantModel.aggregate([
      {
        $match: {
          trackInventory: true,
          deletedAt: null,
          isActive: true,
          createdAt: { $lt: date },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: ['$stock', '$basePriceUSD'],
            },
          },
        },
      },
    ]);

    return result[0]?.totalValue || 0;
  }

  /**
   * Generate cash flow data
   */
  private async generateCashFlowData(startDate: Date, endDate: Date) {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cashFlow = [];
    let cumulativeBalance = 0;

    for (let i = 0; i < Math.min(daysDiff, 30); i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      // Get daily revenue from completed orders
      const dailyOrders = await this.orderModel
        .find({
          createdAt: { $gte: date, $lt: nextDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        })
        .lean();

      const dailyRevenue = dailyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      cumulativeBalance += dailyRevenue;

      cashFlow.push({
        date: date.toISOString().split('T')[0],
        revenue: dailyRevenue,
        balance: cumulativeBalance,
      });
    }

    return cashFlow;
  }

  /**
   * Get revenue by source
   */
  private async getRevenueBySource(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$total' },
        },
      },
      { $sort: { amount: -1 as 1 | -1 } },
    ];

    const results = await this.orderModel.aggregate(pipeline);
    const totalRevenue = results.reduce((sum, item: RevenueSourceResult) => sum + item.amount, 0);

    return results.map((item: RevenueSourceResult) => ({
      source: item._id || 'Unknown',
      amount: item.amount,
      percentage: totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0,
    }));
  }

  /**
   * Calculate total discount from orders
   */
  private async calculateTotalDiscount(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalDiscount: { $sum: '$totalDiscount' },
          couponDiscount: { $sum: '$couponDiscount' },
          itemsDiscount: { $sum: '$itemsDiscount' },
        },
      },
    ]);

    const data = result[0];
    return (data?.totalDiscount || 0) + (data?.couponDiscount || 0) + (data?.itemsDiscount || 0);
  }

  /**
   * Get active products count
   */
  private async getActiveProductsCount(): Promise<number> {
    return await this.productModel.countDocuments({
      status: 'active',
      isActive: true,
      deletedAt: null,
    });
  }

  /**
   * Get out of stock products count
   */
  private async getOutOfStockCount(): Promise<number> {
    return await this.productModel.countDocuments({
      deletedAt: null,
      trackStock: true,
      stock: 0,
    });
  }

  /**
   * Get low stock products count
   */
  private async getLowStockCount(): Promise<number> {
    return await this.productModel.countDocuments({
      deletedAt: null,
      trackStock: true,
      $expr: { $lt: ['$stock', '$minStock'] },
    });
  }

  /**
   * Get returning customers count
   */
  private async getReturningCustomersCount(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
          'orders.createdAt': { $gte: startDate, $lte: endDate },
          'orders.status': { $in: COMPLETED_STATUSES },
        },
      },
      {
        $project: {
          orderCount: { $size: '$orders' },
        },
      },
      {
        $match: {
          orderCount: { $gt: 1 }, // More than one order = returning customer
        },
      },
      { $count: 'returningCustomers' },
    ]);

    return result[0]?.returningCustomers || 0;
  }

  /**
   * Get average cart items count
   */
  private async getAverageCartItems(): Promise<number> {
    const result = await this.cartModel.aggregate([
      {
        $match: {
          status: 'active',
          items: { $exists: true, $not: { $size: 0 } },
        },
      },
      {
        $project: {
          itemCount: { $size: '$items' },
        },
      },
      {
        $group: {
          _id: null,
          averageItems: { $avg: '$itemCount' },
        },
      },
    ]);

    return Math.round((result[0]?.averageItems || 0) * 100) / 100;
  }

  /**
   * Get checkout dropoff rate
   */
  private async getCheckoutDropoffRate(): Promise<number> {
    const [totalCarts, convertedCarts] = await Promise.all([
      this.cartModel.countDocuments({
        status: 'active',
        items: { $exists: true, $not: { $size: 0 } },
      }),
      this.cartModel.countDocuments({
        status: 'converted',
      }),
    ]);

    return totalCarts > 0 ? Math.round(((totalCarts - convertedCarts) / totalCarts) * 100 * 100) / 100 : 0;
  }

  /**
   * Get abandoned cart value
   */
  private async getAbandonedCartValue(): Promise<number> {
    const result = await this.cartModel.aggregate([
      {
        $match: {
          status: 'active',
          lastActivityAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // No activity for 24+ hours
          items: { $exists: true, $not: { $size: 0 } },
          'pricingSummary.total': { $exists: true, $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$pricingSummary.total' },
        },
      },
    ]);

    return Math.round((result[0]?.totalValue || 0) * 100) / 100;
  }

  /**
   * Get top abandoned products
   */
  private async getTopAbandonedProducts(): Promise<Array<{ productId: string; name: string; abandonedCount: number; lostRevenue: number }>> {
    const result = await this.cartModel.aggregate([
      {
        $match: {
          status: 'active',
          lastActivityAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // No activity for 24+ hours
          items: { $exists: true, $not: { $size: 0 } },
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
          abandonedCount: { $sum: 1 },
          lostRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { abandonedCount: -1 } },
      { $limit: 5 },
    ]);

    return result.map((item) => ({
      productId: item._id.toString(),
      name: item.name,
      abandonedCount: item.abandonedCount,
      lostRevenue: Math.round((item.lostRevenue || 0) * 100) / 100,
    }));
  }

  /**
   * Get average product rating
   */
  private async getAverageProductRating(): Promise<number> {
    const result = await this.productModel.aggregate([
      {
        $match: {
          deletedAt: null,
          averageRating: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$averageRating' },
        },
      },
    ]);

    return Math.round((result[0]?.averageRating || 0) * 100) / 100;
  }

  /**
   * Get last order date for a customer
   */
  private async getLastOrderDate(customerId: string): Promise<Date> {
    const lastOrder = await this.orderModel
      .findOne({
        userId: customerId,
        status: { $in: COMPLETED_STATUSES },
      })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    return lastOrder?.createdAt || new Date();
  }

  // ==================== Additional Helper Methods ====================

  /**
   * Get top products with detailed information
   */
  private async getTopProductsWithDetails(startDate: Date, endDate: Date, limit: number) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
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
          id: { $first: '$product._id' },
          name: { $first: '$product.name' },
          sales: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
          stock: { $first: '$product.stock' },
          rating: { $first: '$product.averageRating' },
        },
      },
      { $sort: { sales: -1 as 1 | -1 } },
      { $limit: limit },
    ];

    const results = await this.orderModel.aggregate(pipeline);

    return results.map((item: TopProductDetailResult) => ({
      id: item.id.toString(),
      name: item.name,
      sales: item.sales,
      revenue: item.revenue,
      rating: item.rating || 0,
      stock: item.stock || 0,
    }));
  }

  /**
   * Get low stock products
   */
  private async getLowStockProducts() {
    const products = await this.productModel
      .find({
        deletedAt: null,
        trackStock: true,
        $expr: { $lt: ['$stock', '$minStock'] },
      })
      .select('_id name stock minStock')
      .lean<LowStockProductResult[]>();

    return products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      stock: product.stock || 0,
      minStock: product.minStock || 0,
    }));
  }

  /**
   * Get product performance by category
   */
  private async getProductPerformanceByCategory(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
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
          count: { $addToSet: '$product._id' },
          sales: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
        },
      },
      {
        $project: {
          category: 1,
          count: { $size: '$count' },
          sales: 1,
          revenue: 1,
        },
      },
      { $sort: { revenue: -1 as 1 | -1 } },
    ];

    const results = await this.orderModel.aggregate(pipeline);

    return results.map((item: CategoryPerformanceResult) => ({
      category: item.category,
      count: item.count,
      sales: item.sales,
      revenue: item.revenue,
    }));
  }

  /**
   * Get total sales from orders for a specific period
   */
  private async getTotalSalesFromOrders(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
        },
      },
    ];

    const results = await this.orderModel.aggregate(pipeline);
    return {
      totalSales: results[0]?.totalSales || 0,
      totalRevenue: results[0]?.totalRevenue || 0,
    };
  }

  // ==================== New Helper Methods for Missing Features ====================

  /**
   * Get sales by region
   */
  private async getSalesByRegion(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
          'shippingAddress.city': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$shippingAddress.city',
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { revenue: -1 as 1 | -1 } },
      { $limit: 10 },
    ];

    const results = await this.orderModel.aggregate(pipeline);

    return results.map((item) => ({
      region: item._id,
      city: item._id,
      sales: item.orders,
      revenue: item.revenue,
    }));
  }

  /**
   * Get payment methods with percentage
   */
  private async getPaymentMethodsWithPercentage(
    paymentMethods: Array<{ method: string; count: number; amount: number }>,
    totalRevenue: number,
  ) {
    return paymentMethods.map((item) => ({
      method: item.method,
      count: item.count,
      amount: item.amount,
      percentage: totalRevenue > 0 ? Math.round((item.amount / totalRevenue) * 100 * 100) / 100 : 0,
    }));
  }

  /**
   * Get under-performing products with real data
   */
  private async getUnderPerformers(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
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
          sales: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
          lastSold: { $max: '$createdAt' },
        },
      },
      { $sort: { sales: 1 as 1 | -1 } }, // Ascending to get lowest
      { $limit: 10 },
    ];

    const results = await this.orderModel.aggregate(pipeline);

    return results.map((item) => ({
      productId: item._id.toString(),
      name: item.name,
      views: 0, // View tracking not implemented yet - would need separate tracking system
      sales: item.sales,
      lastSold: item.lastSold || undefined,
    }));
  }

  /**
   * Get brand breakdown with real revenue and sales
   */
  private async getBrandBreakdown() {
    // First, get brands with product count
    const brandsWithProducts = await this.productModel.aggregate([
      {
        $match: {
          deletedAt: null,
          brand: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$brand',
          productIds: { $push: '$_id' },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 },
    ]);

    // Calculate revenue and sales for each brand
    const brandMetrics = await Promise.all(
      brandsWithProducts.map(async (brand) => {
        const salesData = await this.orderModel.aggregate([
          {
            $match: {
              status: { $in: COMPLETED_STATUSES },
              paymentStatus: 'paid',
            },
          },
          { $unwind: '$items' },
          {
            $match: {
              'items.productId': { $in: brand.productIds },
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$items.qty' },
              totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.finalPrice'] } },
            },
          },
        ]);

        return {
          brandId: brand._id,
          name: brand._id,
          productCount: brand.productCount,
          totalSales: salesData[0]?.totalSales || 0,
          revenue: Math.round((salesData[0]?.totalRevenue || 0) * 100) / 100,
        };
      })
    );

    return brandMetrics;
  }

  /**
   * Get customers by region
   */
  private async getCustomersByRegion() {
    const results = await this.userModel.aggregate([
      {
        $match: {
          roles: { $in: ['user'] },
          status: 'active',
          deletedAt: null,
          'addresses.city': { $exists: true, $ne: null },
        },
      },
      { $unwind: '$addresses' },
      {
        $group: {
          _id: '$addresses.city',
          customers: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          region: '$_id',
          count: { $size: '$customers' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const totalCustomers = results.reduce((sum, item) => sum + item.count, 0);

    return results.map((item) => ({
      region: item._id,
      count: item.count,
      percentage: totalCustomers > 0 ? Math.round((item.count / totalCustomers) * 100 * 100) / 100 : 0,
    }));
  }

  /**
   * Get customer segmentation with revenue and AOV metrics - Real calculation
   */
  private async getCustomerSegmentationWithMetrics(
    segments: CustomerSegment[],
    startDate: Date,
    endDate: Date,
  ) {
    // Calculate revenue and AOV for each segment using actual order data
    const segmentMetrics = await Promise.all(
      segments.map(async (segment) => {
        if (!segment.customerIds || segment.customerIds.length === 0) {
          return {
            segment: segment.segment,
            count: segment.count,
            revenue: 0,
            averageOrderValue: 0,
          };
        }

        // Get orders for customers in this segment
        const ordersData = await this.orderModel.aggregate([
          {
            $match: {
              userId: { $in: segment.customerIds },
              createdAt: { $gte: startDate, $lte: endDate },
              status: { $in: COMPLETED_STATUSES },
              paymentStatus: 'paid',
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total' },
              orderCount: { $sum: 1 },
            },
          },
        ]);

        const totalRevenue = ordersData[0]?.totalRevenue || 0;
        const orderCount = ordersData[0]?.orderCount || 0;
        const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        return {
          segment: segment.segment,
          count: segment.count,
          revenue: Math.round(totalRevenue * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        };
      })
    );

    return segmentMetrics;
  }
}
