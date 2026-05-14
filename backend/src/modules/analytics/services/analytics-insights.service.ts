import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../checkout/schemas/order.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Cart, CartDocument } from '../../cart/schemas/cart.schema';
import { Coupon, CouponDocument } from '../../marketing/schemas/coupon.schema';
import { SupportTicket, SupportTicketDocument } from '../../support/schemas/support-ticket.schema';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface Insight {
  id: string;
  type: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  source: string;
  value?: number;
  change?: number;
  icon?: string;
  color?: string;
}

@Injectable()
export class AnalyticsInsightsService {
  private readonly logger = new Logger(AnalyticsInsightsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(SupportTicket.name) private supportModel: Model<SupportTicketDocument>,
  ) {}

  async generateInsights(days = 30): Promise<Insight[]> {
    const insights: Insight[] = [];

    const salesInsights = await this.generateSalesInsights(days);
    insights.push(...salesInsights);

    const productInsights = await this.generateProductInsights(days);
    insights.push(...productInsights);

    const customerInsights = await this.generateCustomerInsights(days);
    insights.push(...customerInsights);

    const cartInsights = await this.generateCartInsights(days);
    insights.push(...cartInsights);

    const supportInsights = await this.generateSupportInsights(days);
    insights.push(...supportInsights);

    const couponInsights = await this.generateCouponInsights(days);
    insights.push(...couponInsights);

    return insights.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
      return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
    });
  }

  private async generateSalesInsights(days: number): Promise<Insight[]> {
    const insights: Insight[] = [];
    const now = new Date();
    const currentStart = startOfDay(subDays(now, days));
    const previousStart = startOfDay(subDays(now, days * 2));
    const previousEnd = endOfDay(subDays(now, days + 1));

    const [currentOrders, previousOrders] = await Promise.all([
      this.orderModel.find({ createdAt: { $gte: currentStart, $lte: now }, status: OrderStatus.COMPLETED, paymentStatus: 'paid' }).exec(),
      this.orderModel.find({ createdAt: { $gte: previousStart, $lte: previousEnd }, status: OrderStatus.COMPLETED, paymentStatus: 'paid' }).exec(),
    ]);

    const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);

    if (previousRevenue > 0) {
      const change = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

      if (change < -15) {
        insights.push({
          id: 'sales_drop',
          type: 'sales_drop',
          title: 'انخفاض ملحوظ في المبيعات',
          titleEn: 'Significant sales decline detected',
          description: `انخفضت المبيعات بنسبة ${Math.abs(change).toFixed(1)}% مقارنة بالفترة السابقة`,
          descriptionEn: `Sales decreased by ${Math.abs(change).toFixed(1)}% compared to the previous period`,
          severity: 'critical',
          source: 'sales',
          value: currentRevenue,
          change,
          icon: 'trending_down',
          color: '#F44336',
        });
      } else if (change > 15) {
        insights.push({
          id: 'sales_growth',
          type: 'sales_growth',
          title: 'نمو إيجابي في المبيعات',
          titleEn: 'Positive sales growth',
          description: `ارتفعت المبيعات بنسبة ${change.toFixed(1)}% مقارنة بالفترة السابقة`,
          descriptionEn: `Sales increased by ${change.toFixed(1)}% compared to the previous period`,
          severity: 'success',
          source: 'sales',
          value: currentRevenue,
          change,
          icon: 'trending_up',
          color: '#4CAF50',
        });
      }
    }

    const currentAvgOrderValue = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;
    const previousAvgOrderValue = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0;

    if (previousAvgOrderValue > 0 && currentAvgOrderValue < previousAvgOrderValue * 0.8) {
      const drop = ((previousAvgOrderValue - currentAvgOrderValue) / previousAvgOrderValue) * 100;
      insights.push({
        id: 'avg_order_drop',
        type: 'avg_order_value_drop',
        title: 'انخفاض متوسط قيمة الطلب',
        titleEn: 'Average order value decreased',
        description: `انخفض متوسط قيمة الطلب بنسبة ${drop.toFixed(1)}%`,
        descriptionEn: `Average order value decreased by ${drop.toFixed(1)}%`,
        severity: 'warning',
        source: 'sales',
        value: currentAvgOrderValue,
        change: -drop,
        icon: 'shopping_cart',
        color: '#FF9800',
      });
    }

    const cancelledOrders = await this.orderModel.countDocuments({
      createdAt: { $gte: currentStart, $lte: now },
      status: OrderStatus.CANCELLED,
    }).exec();

    const totalOrdersInPeriod = await this.orderModel.countDocuments({
      createdAt: { $gte: currentStart, $lte: now },
    }).exec();

    if (totalOrdersInPeriod > 0) {
      const cancellationRate = (cancelledOrders / totalOrdersInPeriod) * 100;
      if (cancellationRate > 10) {
        insights.push({
          id: 'high_cancellation',
          type: 'high_cancellation_rate',
          title: 'معدل إلغاء الطلبات مرتفع',
          titleEn: 'High order cancellation rate',
          description: `معدل إلغاء الطلبات ${cancellationRate.toFixed(1)}% (${cancelledOrders} من ${totalOrdersInPeriod})`,
          descriptionEn: `Order cancellation rate is ${cancellationRate.toFixed(1)}% (${cancelledOrders} out of ${totalOrdersInPeriod})`,
          severity: cancellationRate > 20 ? 'critical' : 'warning',
          source: 'orders',
          value: cancellationRate,
          icon: 'cancel',
          color: '#F44336',
        });
      }
    }

    return insights;
  }

  private async generateProductInsights(days: number): Promise<Insight[]> {
    const insights: Insight[] = [];

    const lowStockProducts = await this.productModel.countDocuments({
      status: 'active',
      isActive: true,
      deletedAt: null,
      quantity: { $gt: 0, $lte: 10 },
    }).exec();

    if (lowStockProducts > 0) {
      insights.push({
        id: 'low_stock',
        type: 'low_stock',
        title: `${lowStockProducts} منتجات قريبة من النفاد`,
        titleEn: `${lowStockProducts} products running low on stock`,
        description: `يوجد ${lowStockProducts} منتج بكمية أقل من 10 وحدات`,
        descriptionEn: `There are ${lowStockProducts} products with less than 10 units in stock`,
        severity: lowStockProducts > 20 ? 'critical' : 'warning',
        source: 'inventory',
        value: lowStockProducts,
        icon: 'warning',
        color: '#FF9800',
      });
    }

    const outOfStockProducts = await this.productModel.countDocuments({
      status: 'out_of_stock',
      deletedAt: null,
    }).exec();

    if (outOfStockProducts > 0) {
      insights.push({
        id: 'out_of_stock',
        type: 'out_of_stock',
        title: `${outOfStockProducts} منتجات غير متوفرة`,
        titleEn: `${outOfStockProducts} products out of stock`,
        description: `يوجد ${outOfStockProducts} منتج غير متوفر حاليًا`,
        descriptionEn: `There are ${outOfStockProducts} products currently out of stock`,
        severity: outOfStockProducts > 10 ? 'critical' : 'warning',
        source: 'inventory',
        value: outOfStockProducts,
        icon: 'block',
        color: '#F44336',
      });
    }

    const now = new Date();
    const startDate = subDays(now, days);
    const topProducts = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: now }, status: OrderStatus.COMPLETED, paymentStatus: 'paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', name: { $first: '$items.snapshot.name' }, quantity: { $sum: '$items.qty' }, revenue: { $sum: '$items.lineTotal' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]).exec();

    if (topProducts.length > 0) {
      const topProduct = topProducts[0];
      insights.push({
        id: 'top_product',
        type: 'top_product',
        title: `المنتج الأكثر مبيعًا: ${topProduct.name}`,
        titleEn: `Top selling product: ${topProduct.name}`,
        description: `حقق ${topProduct.quantity} مبيعة بإيرادات ${topProduct.revenue.toLocaleString()} ريال`,
        descriptionEn: `Achieved ${topProduct.quantity} sales with revenue of ${topProduct.revenue.toLocaleString()} YER`,
        severity: 'success',
        source: 'products',
        value: topProduct.revenue,
        icon: 'emoji_events',
        color: '#4CAF50',
      });
    }

    return insights;
  }

  private async generateCustomerInsights(days: number): Promise<Insight[]> {
    const insights: Insight[] = [];
    const now = new Date();
    const startDate = subDays(now, days);

    const totalCustomers = await this.userModel.countDocuments({ roles: { $in: ['user'] }, deletedAt: null, status: 'active' }).exec();
    const newCustomers = await this.userModel.countDocuments({ roles: { $in: ['user'] }, deletedAt: null, status: 'active', createdAt: { $gte: startDate } }).exec();

    if (newCustomers > 0) {
      const newCustomerPercentage = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;
      insights.push({
        id: 'new_customers',
        type: 'new_customers',
        title: `${newCustomers} عميل جديد`,
        titleEn: `${newCustomers} new customers`,
        description: `انضم ${newCustomers} عميل جديد خلال آخر ${days} يوم (${newCustomerPercentage.toFixed(1)}% من إجمالي العملاء)`,
        descriptionEn: `${newCustomers} new customers joined in the last ${days} days (${newCustomerPercentage.toFixed(1)}% of total customers)`,
        severity: 'info',
        source: 'customers',
        value: newCustomers,
        icon: 'person_add',
        color: '#2196F3',
      });
    }

    const topCustomersByRevenue = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: now }, status: OrderStatus.COMPLETED, paymentStatus: 'paid' } },
      { $group: { _id: '$userId', totalSpent: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]).exec();

    if (topCustomersByRevenue.length > 0) {
      const totalRevenue = topCustomersByRevenue.reduce((sum, c) => sum + c.totalSpent, 0);
      const allRevenue = await this.orderModel.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: now }, status: OrderStatus.COMPLETED, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).exec();

      const allRevenueTotal = allRevenue[0]?.total || 0;
      const topCustomersPercentage = allRevenueTotal > 0 ? (totalRevenue / allRevenueTotal) * 100 : 0;

      if (topCustomersPercentage > 40) {
        insights.push({
          id: 'customer_concentration',
          type: 'high_value_customer_concentration',
          title: 'تركيز عالي للعملاء ذوي القيمة العالية',
          titleEn: 'High concentration of high-value customers',
          description: `أعلى 10 عملاء حققوا ${topCustomersPercentage.toFixed(1)}% من الإيرادات`,
          descriptionEn: `Top 10 customers achieved ${topCustomersPercentage.toFixed(1)}% of revenue`,
          severity: 'warning',
          source: 'customers',
          value: topCustomersPercentage,
          icon: 'groups',
          color: '#9C27B0',
        });
      }
    }

    return insights;
  }

  private async generateCartInsights(days: number): Promise<Insight[]> {
    const insights: Insight[] = [];
    const now = new Date();
    const startDate = subDays(now, days);

    const [totalCarts, abandonedCarts] = await Promise.all([
      this.cartModel.countDocuments({ createdAt: { $gte: startDate, $lte: now } }).exec(),
      this.cartModel.countDocuments({ createdAt: { $gte: startDate, $lte: now }, status: 'abandoned' }).exec(),
    ]);

    if (totalCarts > 0) {
      const abandonmentRate = (abandonedCarts / totalCarts) * 100;
      if (abandonmentRate > 60) {
        insights.push({
          id: 'high_cart_abandonment',
          type: 'high_cart_abandonment',
          title: 'معدل هجر السلات مرتفع',
          titleEn: 'High cart abandonment rate',
          description: `معدل هجر السلات ${abandonmentRate.toFixed(1)}% (${abandonedCarts} من ${totalCarts})`,
          descriptionEn: `Cart abandonment rate is ${abandonmentRate.toFixed(1)}% (${abandonedCarts} out of ${totalCarts})`,
          severity: abandonmentRate > 80 ? 'critical' : 'warning',
          source: 'orders',
          value: abandonmentRate,
          icon: 'shopping_cart',
          color: '#FF9800',
        });
      }
    }

    return insights;
  }

  private async generateSupportInsights(days: number): Promise<Insight[]> {
    const insights: Insight[] = [];
    const now = new Date();
    const startDate = subDays(now, days);

    const openTickets = await this.supportModel.countDocuments({ status: { $in: ['open', 'new'] } }).exec();

    if (openTickets > 20) {
      insights.push({
        id: 'support_backlog',
        type: 'support_ticket_backlog',
        title: `تراكم التذاكر: ${openTickets} تذكرة مفتوحة`,
        titleEn: `Support backlog: ${openTickets} open tickets`,
        description: `يوجد ${openTickets} تذكرة دعم مفتوحة تحتاج إلى معالجة`,
        descriptionEn: `There are ${openTickets} open support tickets that need attention`,
        severity: openTickets > 50 ? 'critical' : 'warning',
        source: 'support',
        value: openTickets,
        icon: 'confirmation_number',
        color: '#FF9800',
      });
    }

    const resolvedTickets = await this.supportModel.countDocuments({ status: 'resolved', updatedAt: { $gte: startDate, $lte: now } }).exec();
    const totalTicketsInPeriod = await this.supportModel.countDocuments({ createdAt: { $gte: startDate, $lte: now } }).exec();

    if (totalTicketsInPeriod > 0) {
      const resolutionRate = (resolvedTickets / totalTicketsInPeriod) * 100;
      if (resolutionRate < 50) {
        insights.push({
          id: 'low_resolution_rate',
          type: 'low_resolution_rate',
          title: 'معدل حل التذاكر منخفض',
          titleEn: 'Low ticket resolution rate',
          description: `تم حل ${resolutionRate.toFixed(1)}% فقط من التذاكر`,
          descriptionEn: `Only ${resolutionRate.toFixed(1)}% of tickets have been resolved`,
          severity: 'warning',
          source: 'support',
          value: resolutionRate,
          icon: 'slow_motion_video',
          color: '#F44336',
        });
      }
    }

    return insights;
  }

  private async generateCouponInsights(days: number): Promise<Insight[]> {
    const insights: Insight[] = [];
    const now = new Date();
    const startDate = subDays(now, days);

    const topCoupons = await this.couponModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: now }, status: 'active' } },
      { $sort: { usedCount: -1 } },
      { $limit: 5 },
      { $project: { code: 1, usedCount: 1, totalDiscountGiven: 1, totalRevenue: 1 } },
    ]).exec();

    if (topCoupons.length > 0 && topCoupons[0].usedCount > 50) {
      const topCoupon = topCoupons[0];
      insights.push({
        id: 'top_coupon',
        type: 'top_coupon',
        title: `الكوبون الأكثر استخدامًا: ${topCoupon.code}`,
        titleEn: `Most used coupon: ${topCoupon.code}`,
        description: `استُخدم ${topCoupon.usedCount} مرة بخصم إجمالي ${topCoupon.totalDiscountGiven?.toLocaleString() || 0} ريال`,
        descriptionEn: `Used ${topCoupon.usedCount} times with total discount of ${topCoupon.totalDiscountGiven?.toLocaleString() || 0} YER`,
        severity: 'info',
        source: 'marketing',
        value: topCoupon.usedCount,
        icon: 'local_offer',
        color: '#E91E63',
      });
    }

    return insights;
  }
}
