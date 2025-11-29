import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { User, UserDocument, UserRole, UserStatus } from '../../users/schemas/user.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { Variant, VariantDocument } from '../../products/schemas/variant.schema';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../../checkout/schemas/order.schema';
import { ServiceRequest, ServiceRequestDocument } from '../../services/schemas/service-request.schema';
import { SupportTicket, SupportTicketDocument } from '../../support/schemas/support-ticket.schema';
import {
  AnalyticsUserCalculationFailedException,
  AnalyticsProductCalculationFailedException,
  AnalyticsOrderCalculationFailedException,
  AnalyticsServiceCalculationFailedException,
  AnalyticsSupportCalculationFailedException,
  AnalyticsException,
} from '../../../shared/exceptions';

@Injectable()
export class AnalyticsCalculationService {
  private readonly logger = new Logger(AnalyticsCalculationService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(ServiceRequest.name) private serviceModel: Model<ServiceRequestDocument>,
    @InjectModel(SupportTicket.name) private supportModel: Model<SupportTicketDocument>,
  ) {}

  /**
   * Calculate user analytics for a date range
   */
  async calculateUserAnalytics(startDate: Date, endDate: Date) {
    try {
      const notDeletedFilter = {
        $or: [
          { deletedAt: null },
          { deletedAt: { $exists: false } }
        ]
      };

      const [
        totalUsers,
        activeUsers,
        newUsers,
        customers,
        engineers,
        admins,
        verifiedUsers,
        suspendedUsers,
      ] = await Promise.all([
        this.userModel.countDocuments(notDeletedFilter),
        this.userModel.countDocuments({ 
          lastActivityAt: { $gte: startDate, $lte: endDate },
          ...notDeletedFilter
        }),
        this.userModel.countDocuments({ 
          createdAt: { $gte: startDate, $lte: endDate },
          ...notDeletedFilter
        }),
        this.userModel.countDocuments({ 
          roles: { $in: [UserRole.USER] },
          status: UserStatus.ACTIVE,
          ...notDeletedFilter
        }),
        this.userModel.countDocuments({ 
          roles: { $in: [UserRole.ENGINEER] },
          ...notDeletedFilter
        }),
        this.userModel.countDocuments({ 
          roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
          ...notDeletedFilter
        }),
        // All active users are considered verified
        this.userModel.countDocuments({ 
          status: UserStatus.ACTIVE,
          ...notDeletedFilter
        }),
        this.userModel.countDocuments({ 
          status: UserStatus.SUSPENDED,
          ...notDeletedFilter
        }),
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        customers,
        engineers,
        admins,
        verified: verifiedUsers,
        suspended: suspendedUsers,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to calculate user analytics', {
        error: err.message,
        stack: err.stack,
        startDate,
        endDate,
      });

      if (error instanceof AnalyticsException) {
        throw error;
      }

      throw new AnalyticsUserCalculationFailedException({
        startDate,
        endDate,
        error: err.message,
      });
    }
  }

  /**
   * Calculate product analytics for a date range
   */
  async calculateProductAnalytics(startDate: Date, endDate: Date) {
    try {
      const [
        totalProducts,
        activeProducts,
        featuredProducts,
        newProducts,
        productsByCategory,
        averageRating,
      ] = await Promise.all([
        this.productModel.countDocuments(),
        this.productModel.countDocuments({ status: 'active' }),
        this.productModel.countDocuments({ isFeatured: true }),
        this.productModel.countDocuments({ 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.productModel.aggregate([
          { $group: { _id: '$categoryId', count: { $sum: 1 } } }
        ]),
        this.productModel.aggregate([
          { $match: { averageRating: { $exists: true } } },
          { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
        ]),
      ]);

      const byCategory = productsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      // Get top rated products
      const topRatedResult = await this.productModel
        .find({ 
          averageRating: { $gt: 0 }, 
          deletedAt: null 
        })
        .sort({ averageRating: -1 })
        .limit(10)
        .select('_id name averageRating')
        .lean();

      // Calculate actual sales from completed orders
      const productIds = topRatedResult.map(p => p._id);
      const productSalesResult = await this.orderModel.aggregate([
        {
          $match: {
            status: OrderStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
          }
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.productId': { $in: productIds }
          }
        },
        {
          $group: {
            _id: '$items.productId',
            totalSales: { $sum: '$items.qty' },
            totalRevenue: { $sum: '$items.lineTotal' }
          }
        }
      ]);

      // Create a map for quick lookup
      const salesMap = new Map(
        productSalesResult.map(item => [item._id.toString(), item])
      );

      const topRated = topRatedResult.map(p => {
        const salesData = salesMap.get(p._id.toString());
        return {
          productId: p._id.toString(),
          name: p.name,
          rating: p.averageRating || 0,
          sales: salesData?.totalSales || 0,
          revenue: salesData?.totalRevenue || 0,
        };
      });

      // Get low stock variants
      const lowStockVariants = await this.variantModel.aggregate([
        {
          $match: {
            trackInventory: true,
            deletedAt: null,
            isActive: true,
            stock: { $gt: 0 }, // Exclude out of stock (stock = 0)
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
            stock: '$stock',
            minStock: '$minStock'
          }
        }
      ]);

      const lowStock = lowStockVariants.map(v => ({
        productId: v.productId.toString(),
        name: v.name,
        stock: v.stock,
        minStock: v.minStock
      }));

      return {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts,
        new: newProducts,
        byCategory,
        averageRating: averageRating[0]?.avgRating || 0,
        topRated,
        lowStock,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to calculate product analytics', {
        error: err.message,
        stack: err.stack,
        startDate,
        endDate,
      });

      if (error instanceof AnalyticsException) {
        throw error;
      }

      throw new AnalyticsProductCalculationFailedException({
        startDate,
        endDate,
        error: err.message,
      });
    }
  }

  /**
   * Calculate order analytics for a date range
   */
  async calculateOrderAnalytics(startDate: Date, endDate: Date) {
    try {
      const [
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        processingOrders,
        onHoldOrders,
        returnedOrders,
        ordersByStatus,
        ordersByPaymentMethod,
      ] = await Promise.all([
        this.orderModel.countDocuments({ 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.orderModel.countDocuments({ 
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.orderModel.countDocuments({ 
          status: 'pending',
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.orderModel.countDocuments({ 
          status: 'cancelled',
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.orderModel.countDocuments({ 
          status: 'processing',
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.orderModel.countDocuments({ 
          status: 'on_hold',
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.orderModel.countDocuments({ 
          status: 'returned',
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.orderModel.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.orderModel.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
        ]),
      ]);

      const byStatus = ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const byPaymentMethod = ordersByPaymentMethod.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      // Calculate revenue
      const revenueData = await this.orderModel.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate } 
        }},
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]);

      const totalRevenue = revenueData[0]?.totalRevenue || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get top products from orders
      const topProductsResult = await this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: OrderStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.snapshot.name' },
            quantity: { $sum: '$items.qty' },
            revenue: { $sum: '$items.lineTotal' },
          }
        },
        { $sort: { quantity: -1 } },
        { $limit: 10 }
      ]);

      const topProducts = topProductsResult.map(product => ({
        productId: product._id.toString(),
        name: product.name,
        quantity: product.quantity,
        revenue: product.revenue,
      }));

      // Get revenue by category
      const categoryRevenueResult = await this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: OrderStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.snapshot.categoryName',
            revenue: { $sum: '$items.lineTotal' },
          }
        }
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
        onHold: onHoldOrders,
        returned: returnedOrders,
        totalRevenue,
        averageOrderValue,
        byStatus,
        byPaymentMethod,
        topProducts,
        revenueByCategory,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to calculate order analytics', {
        error: err.message,
        stack: err.stack,
        startDate,
        endDate,
      });

      if (error instanceof AnalyticsException) {
        throw error;
      }

      throw new AnalyticsOrderCalculationFailedException({
        startDate,
        endDate,
        error: err.message,
      });
    }
  }

  /**
   * Calculate service analytics for a date range
   */
  async calculateServiceAnalytics(startDate: Date, endDate: Date) {
    try {
      const [
        totalRequests,
        openRequests,
        assignedRequests,
        completedRequests,
        cancelledRequests,
        requestsByType,
        requestsByStatus,
      ] = await Promise.all([
        this.serviceModel.countDocuments({ 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.serviceModel.countDocuments({ status: 'OPEN', createdAt: { $gte: startDate, $lte: endDate } }),
        this.serviceModel.countDocuments({ status: 'ASSIGNED', createdAt: { $gte: startDate, $lte: endDate } }),
        this.serviceModel.countDocuments({ status: 'COMPLETED', createdAt: { $gte: startDate, $lte: endDate } }),
        this.serviceModel.countDocuments({ status: 'CANCELLED', createdAt: { $gte: startDate, $lte: endDate } }),
        this.serviceModel.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        this.serviceModel.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
      ]);

      const byType = requestsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const byStatus = requestsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      // Calculate average rating
      const ratingResult = await this.serviceModel.aggregate([
        { 
          $match: { 
            'rating.score': { $gt: 0 }, 
            createdAt: { $gte: startDate, $lte: endDate } 
          } 
        },
        { 
          $group: { 
            _id: null, 
            avgRating: { $avg: '$rating.score' }, 
            count: { $sum: 1 } 
          } 
        }
      ]);

      const averageRating = ratingResult[0]?.avgRating || 0;

      // Get top engineers
      const topEngineersResult = await this.serviceModel.aggregate([
        { 
          $match: { 
            status: 'COMPLETED', 
            engineerId: { $ne: null }, 
            createdAt: { $gte: startDate, $lte: endDate } 
          } 
        },
        {
          $group: {
            _id: '$engineerId',
            completedJobs: { $sum: 1 },
            avgRating: { $avg: '$rating.score' },
          }
        },
        { $sort: { completedJobs: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'engineer',
          }
        },
        { $unwind: '$engineer' },
        {
          $project: {
            engineerId: '$_id',
            name: { $concat: ['$engineer.firstName', ' ', '$engineer.lastName'] },
            completedJobs: 1,
            rating: { $ifNull: ['$avgRating', 0] },
          }
        }
      ]);

      const topEngineers = topEngineersResult.map(eng => ({
        engineerId: eng.engineerId.toString(),
        name: eng.name.trim() || 'Unknown Engineer',
        completedJobs: eng.completedJobs,
        rating: Math.round(eng.rating * 100) / 100,
      }));

      // Calculate response and completion times
      // Use EngineerOffer with status ACCEPTED to determine assignment time
      // Use ServiceRequest.updatedAt when status is COMPLETED or RATED to determine completion time
      const timeMetricsResult = await this.serviceModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['COMPLETED', 'RATED'] },
            engineerId: { $ne: null },
          }
        },
        {
          $lookup: {
            from: 'engineeroffers',
            let: { requestId: '$_id', engineerId: '$engineerId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$requestId', '$$requestId'] },
                      { $eq: ['$engineerId', '$$engineerId'] },
                      { $eq: ['$status', 'ACCEPTED'] }
                    ]
                  }
                }
              },
              { $sort: { updatedAt: 1 } },
              { $limit: 1 }
            ],
            as: 'acceptedOffer'
          }
        },
        {
          $unwind: {
            path: '$acceptedOffer',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $project: {
            responseTimeHours: {
              $divide: [
                { $subtract: ['$acceptedOffer.updatedAt', '$createdAt'] },
                1000 * 60 * 60, // Convert to hours
              ]
            },
            completionTimeDays: {
              $divide: [
                { $subtract: ['$updatedAt', '$acceptedOffer.updatedAt'] },
                1000 * 60 * 60 * 24, // Convert to days
              ]
            }
          }
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
          }
        }
      ]);

      const timeMetrics = timeMetricsResult[0];
      const responseTime = timeMetrics ? {
        average: Math.round(timeMetrics.avgResponseTime * 100) / 100,
        fastest: Math.round(timeMetrics.minResponseTime * 100) / 100,
        slowest: Math.round(timeMetrics.maxResponseTime * 100) / 100,
      } : null;

      const completionTime = timeMetrics ? {
        average: Math.round(timeMetrics.avgCompletionTime * 100) / 100,
        fastest: Math.round(timeMetrics.minCompletionTime * 100) / 100,
        slowest: Math.round(timeMetrics.maxCompletionTime * 100) / 100,
      } : null;

      return {
        totalRequests,
        open: openRequests,
        assigned: assignedRequests,
        completed: completedRequests,
        cancelled: cancelledRequests,
        averageRating: Math.round(averageRating * 100) / 100,
        byType,
        byStatus,
        topEngineers,
        responseTime,
        completionTime,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to calculate service analytics', {
        error: err.message,
        stack: err.stack,
        startDate,
        endDate,
      });

      if (error instanceof AnalyticsException) {
        throw error;
      }

      throw new AnalyticsServiceCalculationFailedException({
        startDate,
        endDate,
        error: err.message,
      });
    }
  }

  /**
   * Calculate support analytics for a date range
   */
  async calculateSupportAnalytics(startDate: Date, endDate: Date) {
    try {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        ticketsByCategory,
        ticketsByPriority,
      ] = await Promise.all([
        this.supportModel.countDocuments({ 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.supportModel.countDocuments({ 
          status: 'open', 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.supportModel.countDocuments({ 
          status: 'in_progress', 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.supportModel.countDocuments({ 
          status: 'resolved', 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.supportModel.countDocuments({ 
          status: 'closed', 
          createdAt: { $gte: startDate, $lte: endDate } 
        }),
        this.supportModel.aggregate([
          { 
            $match: { 
              createdAt: { $gte: startDate, $lte: endDate } 
            } 
          },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        this.supportModel.aggregate([
          { 
            $match: { 
              createdAt: { $gte: startDate, $lte: endDate } 
            } 
          },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
      ]);

      const byCategory = ticketsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const byPriority = ticketsByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      // Calculate average resolution time
      const resolutionTimeResult = await this.supportModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ['resolved', 'closed'] },
            resolvedAt: { $exists: true },
          }
        },
        {
          $project: {
            resolutionTimeHours: {
              $divide: [
                { $subtract: ['$resolvedAt', '$createdAt'] },
                1000 * 60 * 60, // Convert to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: '$resolutionTimeHours' },
          }
        }
      ]);

      const averageResolutionTime = resolutionTimeResult[0]?.avgResolutionTime
        ? Math.round(resolutionTimeResult[0].avgResolutionTime * 100) / 100
        : null;

      // Calculate customer satisfaction from ratings
      const satisfactionResult = await this.supportModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            rating: { $gt: 0 },
          }
        },
        {
          $group: {
            _id: null,
            avgSatisfaction: { $avg: '$rating' },
          }
        }
      ]);

      const customerSatisfaction = satisfactionResult[0]?.avgSatisfaction
        ? Math.round(satisfactionResult[0].avgSatisfaction * 100) / 100
        : null;

      // Calculate first response time
      const firstResponseResult = await this.supportModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            firstResponseAt: { $exists: true },
          }
        },
        {
          $project: {
            firstResponseTimeHours: {
              $divide: [
                { $subtract: ['$firstResponseAt', '$createdAt'] },
                1000 * 60 * 60, // Convert to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgFirstResponseTime: { $avg: '$firstResponseTimeHours' },
          }
        }
      ]);

      const firstResponseTime = firstResponseResult[0]?.avgFirstResponseTime
        ? Math.round(firstResponseResult[0].avgFirstResponseTime * 100) / 100
        : null;

      // Get top agents
      const topAgentsResult = await this.supportModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            assignedTo: { $exists: true, $ne: null },
            status: { $in: ['resolved', 'closed'] },
          }
        },
        {
          $group: {
            _id: '$assignedTo',
            resolvedTickets: { $sum: 1 },
            avgRating: { $avg: '$rating' },
          }
        },
        { $sort: { resolvedTickets: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'agent',
          }
        },
        { $unwind: '$agent' },
        {
          $project: {
            agentId: '$_id',
            name: { $concat: ['$agent.firstName', ' ', '$agent.lastName'] },
            resolvedTickets: 1,
            rating: { $ifNull: ['$avgRating', 0] },
          }
        }
      ]);

      const topAgents = topAgentsResult.map(agent => ({
        agentId: agent.agentId.toString(),
        name: agent.name.trim() || 'Unknown Agent',
        resolvedTickets: agent.resolvedTickets,
        rating: Math.round(agent.rating * 100) / 100,
      }));

      // Generate backlog trend (last 30 days)
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
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to calculate support analytics', {
        error: err.message,
        stack: err.stack,
        startDate,
        endDate,
      });

      if (error instanceof AnalyticsException) {
        throw error;
      }

      throw new AnalyticsSupportCalculationFailedException({
        startDate,
        endDate,
        error: err.message,
      });
    }
  }

  /**
   * Get date range for a specific period type
   */
  getDateRange(date: Date, period: string): { startDate: Date; endDate: Date } {
    switch (period) {
      case 'daily':
        return {
          startDate: startOfDay(date),
          endDate: endOfDay(date),
        };
      case 'weekly':
        return {
          startDate: startOfWeek(date),
          endDate: endOfWeek(date),
        };
      case 'monthly':
        return {
          startDate: startOfMonth(date),
          endDate: endOfMonth(date),
        };
      case 'yearly':
        return {
          startDate: startOfYear(date),
          endDate: endOfYear(date),
        };
      default:
        return {
          startDate: startOfMonth(date),
          endDate: endOfMonth(date),
        };
    }
  }
}
