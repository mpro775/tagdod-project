import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Order, OrderStatus } from '../../checkout/schemas/order.schema';
import { Favorite } from '../../favorites/schemas/favorite.schema';
import { SupportTicket } from '../../support/schemas/support-ticket.schema';

export interface UserStats {
  // معلومات أساسية
  userId: string;
  userInfo: {
    phone: string;
    firstName?: string;
    lastName?: string;
    status: string;
    role: string[];
    createdAt: Date;
    lastLogin?: Date;
  };
  
  // إحصائيات الطلبات
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    totalSpent: number;
    averageOrderValue: number;
    firstOrderDate?: Date;
    lastOrderDate?: Date;
    favoriteCategories: Array<{ category: string; count: number; amount: number }>;
  };
  
  // إحصائيات المفضلة
  favorites: {
    total: number;
    categories: Array<{ category: string; count: number }>;
    recentFavorites: Array<{
      productId: string;
      productName: string;
      addedAt: Date;
    }>;
  };
  
  // إحصائيات الدعم
  support: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime?: number;
  };
  
  // نقاط التقييم
  score: {
    loyaltyScore: number; // نقاط الولاء
    valueScore: number; // نقاط القيمة المالية
    activityScore: number; // نقاط النشاط
    supportScore: number; // نقاط خدمة العملاء
    overallScore: number; // النقاط الإجمالية
    rank: number; // الترتيب بين العملاء
  };
  
  // تحليل السلوك
  behavior: {
    preferredPaymentMethod: string;
    averageOrderFrequency: number; // أيام بين الطلبات
    seasonalPatterns: Array<{ month: string; orders: number; amount: number }>;
    productPreferences: Array<{ category: string; percentage: number }>;
  };
  
  // التنبؤات
  predictions: {
    churnRisk: 'low' | 'medium' | 'high';
    nextPurchaseProbability: number;
    estimatedLifetimeValue: number;
    recommendedActions: string[];
  };
}

@Injectable()
export class UserAnalyticsService {
  private readonly logger = new Logger(UserAnalyticsService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    @InjectModel(SupportTicket.name) private supportModel: Model<SupportTicket>,
  ) {}

  /**
   * الحصول على إحصائيات شاملة لمستخدم واحد
   */
  async getUserDetailedStats(userId: string): Promise<UserStats> {
    try {
      // جلب بيانات المستخدم الأساسية
      const user = await this.userModel.findById(userId).lean();
      if (!user) {
        throw new Error('User not found');
      }

      // جلب جميع البيانات المتعلقة بالمستخدم
      const [orders, favorites, supportTickets] = await Promise.all([
        this.getUserOrders(userId),
        this.getUserFavorites(userId),
        this.getUserSupportTickets(userId),
      ]);

      // حساب الإحصائيات
      const orderStats = this.calculateOrderStats(orders);
      const favoriteStats = this.calculateFavoriteStats(favorites);
      const supportStats = this.calculateSupportStats(supportTickets);
      const behaviorAnalysis = this.analyzeUserBehavior(orders);
      const score = await this.calculateUserScore(userId, orderStats, supportStats);
      const predictions = this.generatePredictions(orders, behaviorAnalysis);

      return {
        userId,
        userInfo: {
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          role: user.roles || [],
          createdAt: user.createdAt,
        },
        orders: orderStats,
        favorites: favoriteStats,
        support: supportStats,
        score,
        behavior: behaviorAnalysis,
        predictions,
      };
    } catch (error) {
      this.logger.error(`Error getting user stats for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على ترتيب العملاء حسب القيمة
   */
  async getCustomerRankings(limit: number = 50): Promise<Array<{
    userId: string;
    userInfo: { phone: string; firstName?: string; lastName?: string };
    totalSpent: number;
    totalOrders: number;
    rank: number;
    score: number;
  }>> {
    try {
      // تجميع بيانات العملاء
      const customerStats = await this.orderModel.aggregate([
        {
          $match: {
            status: { $in: ['COMPLETED', 'DELIVERED'] },
          },
        },
        {
          $group: {
            _id: '$userId',
            totalSpent: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            lastOrderDate: { $max: '$createdAt' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            userId: '$_id',
            userInfo: {
              phone: '$user.phone',
              firstName: '$user.firstName',
              lastName: '$user.lastName',
            },
            totalSpent: 1,
            totalOrders: 1,
            lastOrderDate: 1,
          },
        },
        {
          $sort: { totalSpent: -1, totalOrders: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      // إضافة الترتيب والنقاط
      return customerStats.map((customer, index) => ({
        ...customer,
        rank: index + 1,
        score: this.calculateCustomerScore(customer.totalSpent, customer.totalOrders),
      }));
    } catch (error) {
      this.logger.error('Error getting customer rankings:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات عامة للمستخدمين
   */
  async getOverallUserAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    topSpenders: Array<{ userId: string; totalSpent: number }>;
    userGrowth: Array<{ month: string; newUsers: number }>;
    averageOrderValue: number;
    customerLifetimeValue: number;
  }> {
    try {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        topSpenders,
        userGrowth,
        averageOrderValue,
      ] = await Promise.all([
        this.userModel.countDocuments({ deletedAt: null }),
        this.userModel.countDocuments({ 
          deletedAt: null, 
          lastLogin: { $gte: thisMonth } 
        }),
        this.userModel.countDocuments({ 
          deletedAt: null, 
          createdAt: { $gte: thisMonth } 
        }),
        this.getTopSpenders(10),
        this.getUserGrowthData(12),
        this.getAverageOrderValue(),
      ]);

      const customerLifetimeValue = averageOrderValue * 2.5; // تقدير بسيط

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        topSpenders,
        userGrowth,
        averageOrderValue,
        customerLifetimeValue,
      };
    } catch (error) {
      this.logger.error('Error getting overall user analytics:', error);
      throw error;
    }
  }

  // ==================== Private Methods ====================

  private async getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  private async getUserFavorites(userId: string) {
    return this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('productId', 'name category')
      .sort({ createdAt: -1 })
      .lean();
  }

  private async getUserSupportTickets(userId: string) {
    return this.supportModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  private calculateOrderStats(orders: any[]) {
    const completedOrders = orders.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status));
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;

    // تحليل الفئات المفضلة
    const categoryStats = new Map<string, { count: number; amount: number }>();
    completedOrders.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.snapshot?.categoryName || 'غير محدد';
        const current = categoryStats.get(category) || { count: 0, amount: 0 };
        categoryStats.set(category, {
          count: current.count + 1,
          amount: current.amount + item.lineTotal,
        });
      });
    });

    const favoriteCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      total: orders.length,
      completed: completedOrders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
      totalSpent,
      averageOrderValue,
      firstOrderDate: orders.length > 0 ? orders[orders.length - 1].createdAt : undefined,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : undefined,
      favoriteCategories,
    };
  }

  private calculateFavoriteStats(favorites: any[]) {
    const categoryStats = new Map<string, number>();
    favorites.forEach(fav => {
      if (fav.productId?.category) {
        const current = categoryStats.get(fav.productId.category) || 0;
        categoryStats.set(fav.productId.category, current + 1);
      }
    });

    const categories = Array.from(categoryStats.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentFavorites = favorites.slice(0, 10).map(fav => ({
      productId: fav.productId._id,
      productName: fav.productId?.name || 'منتج محذوف',
      addedAt: fav.createdAt,
    }));

    return {
      total: favorites.length,
      categories,
      recentFavorites,
    };
  }

  private calculateSupportStats(tickets: any[]) {
    const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED');
    const openTickets = tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status));

    return {
      totalTickets: tickets.length,
      openTickets: openTickets.length,
      resolvedTickets: resolvedTickets.length,
    };
  }

  private analyzeUserBehavior(orders: any[]) {
    const completedOrders = orders.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status));
    
    // طريقة الدفع المفضلة
    const paymentMethods = new Map<string, number>();
    completedOrders.forEach(order => {
      const method = order.paymentMethod || 'COD';
      paymentMethods.set(method, (paymentMethods.get(method) || 0) + 1);
    });
    const preferredPaymentMethod = Array.from(paymentMethods.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'COD';

    // تكرار الطلبات
    let averageOrderFrequency = 0;
    if (completedOrders.length > 1) {
      const firstOrder = completedOrders[completedOrders.length - 1];
      const lastOrder = completedOrders[0];
      const daysDiff = (lastOrder.createdAt - firstOrder.createdAt) / (1000 * 60 * 60 * 24);
      averageOrderFrequency = daysDiff / (completedOrders.length - 1);
    }

    // الأنماط الموسمية
    const monthlyStats = new Map<string, { orders: number; amount: number }>();
    completedOrders.forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const current = monthlyStats.get(month) || { orders: 0, amount: 0 };
      monthlyStats.set(month, {
        orders: current.orders + 1,
        amount: current.amount + order.total,
      });
    });

    const seasonalPatterns = Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      preferredPaymentMethod,
      averageOrderFrequency,
      seasonalPatterns,
      productPreferences: [], // سيتم تطويره لاحقاً
    };
  }

  private async calculateUserScore(userId: string, orderStats: any, supportStats: any) {
    // حساب نقاط الولاء
    const loyaltyScore = Math.min(100, (orderStats.total * 10) + (orderStats.completed * 15));
    
    // حساب نقاط القيمة المالية
    const valueScore = Math.min(100, (orderStats.totalSpent / 1000) * 10);
    
    // حساب نقاط النشاط
    const activityScore = Math.min(100, 
      (orderStats.total * 5) + 
      (supportStats.totalTickets === 0 ? 20 : 0) // نقاط إضافية لعدم وجود مشاكل
    );
    
    // حساب نقاط خدمة العملاء
    const supportScore = supportStats.totalTickets === 0 ? 100 : 
      Math.max(0, 100 - (supportStats.openTickets * 20));

    const overallScore = (loyaltyScore + valueScore + activityScore + supportScore) / 4;

    // حساب الترتيب
    const rankings = await this.getCustomerRankings(1000);
    const userRank = rankings.findIndex(r => r.userId === userId) + 1;

    return {
      loyaltyScore,
      valueScore,
      activityScore,
      supportScore,
      overallScore,
      rank: userRank || 0,
    };
  }

  private generatePredictions(orders: any[], behavior: any) {
    const completedOrders = orders.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status));
    
    // تحليل مخاطر فقدان العميل
    let churnRisk: 'low' | 'medium' | 'high' = 'low';
    if (completedOrders.length > 0) {
      const lastOrder = completedOrders[0];
      const daysSinceLastOrder = (Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastOrder > 90) churnRisk = 'high';
      else if (daysSinceLastOrder > 30) churnRisk = 'medium';
    }

    // احتمالية الشراء القادم
    const nextPurchaseProbability = Math.max(0, Math.min(1, 
      1 - (completedOrders.length === 0 ? 0.5 : 0.1) - (churnRisk === 'high' ? 0.3 : 0)
    ));

    // القيمة المتوقعة للعميل
    const estimatedLifetimeValue = completedOrders.reduce((sum, order) => sum + order.total, 0) * 1.5;

    // التوصيات
    const recommendedActions: string[] = [];
    if (churnRisk === 'high') recommendedActions.push('تواصل مع العميل لاستعادة الثقة');
    if (completedOrders.length === 0) recommendedActions.push('ارسل عروض ترحيبية');
    if (behavior.averageOrderFrequency > 60) recommendedActions.push('ارسل تذكيرات منتظمة');

    return {
      churnRisk,
      nextPurchaseProbability,
      estimatedLifetimeValue,
      recommendedActions,
    };
  }

  private calculateCustomerScore(totalSpent: number, totalOrders: number): number {
    // خوارزمية بسيطة لحساب النقاط
    const valueScore = Math.min(50, (totalSpent / 1000) * 25);
    const loyaltyScore = Math.min(50, totalOrders * 5);
    return Math.round(valueScore + loyaltyScore);
  }

  private async getTopSpenders(limit: number) {
    return this.orderModel.aggregate([
      { $match: { status: { $in: ['COMPLETED', 'DELIVERED'] } } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          userId: '$_id',
          totalSpent: 1,
        },
      },
    ]);
  }

  private async getUserGrowthData(months: number) {
    const now = new Date();
    const growthData = [];

    for (let i = months - 1; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const newUsers = await this.userModel.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      growthData.push({
        month: startOfMonth.toISOString().substring(0, 7),
        newUsers,
      });
    }

    return growthData;
  }

  private async getAverageOrderValue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $in: ['COMPLETED', 'DELIVERED'] } } },
      {
        $group: {
          _id: null,
          averageValue: { $avg: '$total' },
        },
      },
    ]);

    return result[0]?.averageValue || 0;
  }
}
