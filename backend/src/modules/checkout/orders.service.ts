import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus } from './schemas/order.schema';
import { RateOrderDto } from './dto/checkout.dto';
import { AppException } from '../../shared/exceptions/app.exception';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  /**
   * Get order by ID and user
   */
  async getOrderByIdAndUser(orderId: string, userId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new AppException('الطلب غير موجود', 404);
    }

    return order;
  }

  /**
   * Get order tracking info
   */
  async getOrderTracking(orderId: string, userId: string) {
    const order = await this.getOrderByIdAndUser(orderId, userId);

    // Build timeline
    const timeline = this.buildOrderTimeline(order);

    return {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDeliveryDate,
      actualDelivery: order.deliveredAt,
      timeline,
    };
  }

  /**
   * Rate order
   */
  async rateOrder(orderId: string, userId: string, dto: RateOrderDto) {
    const order = await this.getOrderByIdAndUser(orderId, userId);

    // Check if order is delivered/completed
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
      throw new AppException('يمكنك التقييم فقط بعد استلام الطلب', 400);
    }

    // Update rating
    order.status = OrderStatus.COMPLETED; // Auto-complete on rating
    order.metadata = {
      ...order.metadata,
      rating: dto.rating,
      review: dto.review,
      ratedAt: new Date().toISOString(),
    };

    order.statusHistory.push({
      status: OrderStatus.COMPLETED,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(userId),
      changedByRole: 'customer',
      notes: `تم التقييم: ${dto.rating}/5`,
    });

    await order.save();

    this.logger.log(`Order ${order.orderNumber} rated: ${dto.rating}/5`);

    return order;
  }

  /**
   * Add admin notes
   */
  async addAdminNotes(orderId: string, notes: string, adminId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new AppException('الطلب غير موجود', 404);
    }

    order.adminNotes = notes;

    order.statusHistory.push({
      status: order.status,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(adminId),
      changedByRole: 'admin',
      notes: 'تم إضافة ملاحظات',
    });

    await order.save();

    return order;
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(userId: string) {
    const [totalOrders, completedOrders, cancelledOrders, totalSpent] = await Promise.all([
      this.orderModel.countDocuments({
        userId: new Types.ObjectId(userId),
      }),
      this.orderModel.countDocuments({
        userId: new Types.ObjectId(userId),
        status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      }),
      this.orderModel.countDocuments({
        userId: new Types.ObjectId(userId),
        status: OrderStatus.CANCELLED,
      }),
      this.orderModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
    ]);

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalSpent: totalSpent[0]?.total || 0,
    };
  }

  /**
   * Get admin analytics
   */
  async getAdminAnalytics(days = 7) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      this.orderModel.countDocuments({
        createdAt: { $gte: fromDate },
      }),
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate },
            status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: { createdAt: { $gte: fromDate } },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      this.orderModel
        .find({ createdAt: { $gte: fromDate } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const avgOrderValue = totalOrders > 0 
      ? (totalRevenue[0]?.total || 0) / totalOrders 
      : 0;

    return {
      period: `Last ${days} days`,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgOrderValue,
      ordersByStatus,
      recentOrders,
    };
  }

  // ===== Helper Methods =====

  private buildOrderTimeline(order: Order) {
    const allStatuses = [
      { status: OrderStatus.PENDING, title: 'تم إنشاء الطلب', icon: '📝' },
      { status: OrderStatus.CONFIRMED, title: 'تم التأكيد', icon: '✅' },
      { status: OrderStatus.PROCESSING, title: 'قيد التجهيز', icon: '📦' },
      { status: OrderStatus.READY_TO_SHIP, title: 'جاهز للشحن', icon: '🎁' },
      { status: OrderStatus.SHIPPED, title: 'تم الشحن', icon: '🚚' },
      { status: OrderStatus.OUT_FOR_DELIVERY, title: 'جاري التوصيل', icon: '🏃' },
      { status: OrderStatus.DELIVERED, title: 'تم التسليم', icon: '🎉' },
      { status: OrderStatus.COMPLETED, title: 'مكتمل', icon: '✨' },
    ];

    return allStatuses.map(statusInfo => {
      const historyEntry = order.statusHistory.find(h => h.status === statusInfo.status);

      return {
        status: statusInfo.status,
        title: statusInfo.title,
        icon: statusInfo.icon,
        completed: !!historyEntry,
        timestamp: historyEntry?.changedAt,
        notes: historyEntry?.notes,
      };
    });
  }
}

