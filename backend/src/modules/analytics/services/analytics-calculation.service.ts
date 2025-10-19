import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { Order, OrderDocument } from '../../checkout/schemas/order.schema';
import { ServiceRequest, ServiceRequestDocument } from '../../services/schemas/service-request.schema';
import { SupportTicket, SupportTicketDocument } from '../../support/schemas/support-ticket.schema';

@Injectable()
export class AnalyticsCalculationService {
  private readonly logger = new Logger(AnalyticsCalculationService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(ServiceRequest.name) private serviceModel: Model<ServiceRequestDocument>,
    @InjectModel(SupportTicket.name) private supportModel: Model<SupportTicketDocument>,
  ) {}

  /**
   * Calculate user analytics for a date range
   */
  async calculateUserAnalytics(startDate: Date, endDate: Date) {
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
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ 
        lastLogin: { $gte: startDate, $lte: endDate } 
      }),
      this.userModel.countDocuments({ 
        createdAt: { $gte: startDate, $lte: endDate } 
      }),
      this.userModel.countDocuments({ role: 'customer' }),
      this.userModel.countDocuments({ role: 'engineer' }),
      this.userModel.countDocuments({ role: 'admin' }),
      this.userModel.countDocuments({ isVerified: true }),
      this.userModel.countDocuments({ isSuspended: true }),
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
  }

  /**
   * Calculate product analytics for a date range
   */
  async calculateProductAnalytics(startDate: Date, endDate: Date) {
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

    return {
      total: totalProducts,
      active: activeProducts,
      featured: featuredProducts,
      new: newProducts,
      byCategory,
      averageRating: averageRating[0]?.avgRating || 0,
      topRated: [],
      lowStock: [],
    };
  }

  /**
   * Calculate order analytics for a date range
   */
  async calculateOrderAnalytics(startDate: Date, endDate: Date) {
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
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
        status: 'shipped',
        createdAt: { $gte: startDate, $lte: endDate } 
      }),
      this.orderModel.countDocuments({ 
        status: 'delivered',
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
        status: { $in: ['completed', 'delivered'] },
        createdAt: { $gte: startDate, $lte: endDate } 
      }},
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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
      topProducts: [],
      revenueByCategory: {},
    };
  }

  /**
   * Calculate service analytics for a date range
   */
  async calculateServiceAnalytics(startDate: Date, endDate: Date) {
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
      this.serviceModel.countDocuments({ status: 'open' }),
      this.serviceModel.countDocuments({ status: 'assigned' }),
      this.serviceModel.countDocuments({ status: 'completed' }),
      this.serviceModel.countDocuments({ status: 'cancelled' }),
      this.serviceModel.aggregate([
        { $group: { _id: '$serviceType', count: { $sum: 1 } } }
      ]),
      this.serviceModel.aggregate([
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

    return {
      totalRequests,
      open: openRequests,
      assigned: assignedRequests,
      completed: completedRequests,
      cancelled: cancelledRequests,
      averageRating: 0,
      byType,
      byStatus,
      topEngineers: [],
      responseTime: { average: 0, fastest: 0, slowest: 0 },
      completionTime: { average: 0, fastest: 0, slowest: 0 },
    };
  }

  /**
   * Calculate support analytics for a date range
   */
  async calculateSupportAnalytics(startDate: Date, endDate: Date) {
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
      this.supportModel.countDocuments({ status: 'open' }),
      this.supportModel.countDocuments({ status: 'in_progress' }),
      this.supportModel.countDocuments({ status: 'resolved' }),
      this.supportModel.countDocuments({ status: 'closed' }),
      this.supportModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      this.supportModel.aggregate([
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

    return {
      totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      byCategory,
      byPriority,
      averageResolutionTime: 0,
      customerSatisfaction: 0,
      firstResponseTime: 0,
      topAgents: [],
      backlogTrend: [],
    };
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
