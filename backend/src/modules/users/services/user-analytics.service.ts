import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { User, UserStatus } from '../schemas/user.schema';
import { Order, OrderItem, OrderStatus } from '../../checkout/schemas/order.schema';
import { Favorite } from '../../favorites/schemas/favorite.schema';
import { SupportTicket } from '../../support/schemas/support-ticket.schema';
import { UserScoringService, UserStats as ScoringUserStats } from './user-scoring.service';
import { UserBehaviorService, UserBehavior } from './user-behavior.service';
import { UserCacheService } from './user-cache.service';
import { UserErrorService } from './user-error.service';
import { UserQueryService } from './user-query.service';

interface PopulatedProduct {
  _id: string;
  name: string;
  category: string;
}

export interface UserStats {
  // معلومات أساسية
  userId: string;
  userInfo: {
    phone: string;
    firstName?: string;
    lastName?: string;
    status: string;
    roles: string[];
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
    private readonly userScoringService: UserScoringService,
    private readonly userBehaviorService: UserBehaviorService,
    private readonly userCacheService: UserCacheService,
    private readonly userErrorService: UserErrorService,
    private readonly userQueryService: UserQueryService,
  ) {}

  /**
   * الحصول على إحصائيات شاملة لمستخدم واحد
   */
  async getUserDetailedStats(userId: string): Promise<UserStats> {
    try {
      // التحقق من التخزين المؤقت
      const cacheKey = this.userCacheService.createUserKey(userId, 'detailed-stats');
      const cachedData = this.userCacheService.get<UserStats>(cacheKey);

      if (cachedData) {
        this.logger.debug(`Cache hit for user stats: ${userId}`);
        return cachedData;
      }

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

      const result = {
        userId,
        userInfo: {
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          roles: user.roles || [],
          createdAt: (user as User & { createdAt?: Date }).createdAt || new Date(),
        },
        orders: orderStats,
        favorites: favoriteStats,
        support: supportStats,
        score,
        behavior: behaviorAnalysis,
        predictions,
      };

      // حفظ البيانات في التخزين المؤقت (5 دقائق)
      this.userCacheService.set(cacheKey, result, 300);

      return result;
    } catch (error) {
      throw this.userErrorService.handleAnalyticsError(error as Error, {
        userId,
        operation: 'getUserDetailedStats',
        additionalInfo: { userId },
      });
    }
  }

  /**
   * الحصول على ترتيب العملاء حسب القيمة
   */
  async getCustomerRankings(limit: number = 50): Promise<
    Array<{
      userId: string;
      userInfo: { phone: string; firstName?: string; lastName?: string };
      totalSpent: number;
      totalOrders: number;
      rank: number;
      score: number;
    }>
  > {
    try {
      // التحقق من التخزين المؤقت
      const cacheKey = this.userCacheService.createRankingKey(limit);
      const cachedData = this.userCacheService.get<
        Array<{
          userId: string;
          userInfo: { phone: string; firstName?: string; lastName?: string };
          totalSpent: number;
          totalOrders: number;
          rank: number;
          score: number;
        }>
      >(cacheKey);

      if (cachedData) {
        this.logger.debug(`Cache hit for customer rankings: ${limit}`);
        return cachedData;
      }

      // تجميع بيانات العملاء مع تحسين الاستعلام
      const pipeline: mongoose.PipelineStage[] = [
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
      ];

      const result = await this.userQueryService.getOptimizedAggregation(
        this.orderModel,
        pipeline,
        { maxLimit: limit },
      );

      // تحليل الأداء
      const performance = this.userQueryService.analyzeQueryPerformance(result);
      this.logger.debug(
        `Customer rankings query performance: ${performance.performance} (${performance.score}/100)`,
      );

      const customerStats = result.data as unknown as Array<{
        userId: string;
        userInfo: { phone: string; firstName?: string; lastName?: string };
        totalSpent: number;
        totalOrders: number;
        lastOrderDate?: Date;
      }>;

      // إضافة الترتيب والنقاط
      const finalResult = customerStats.map((customer, index) => ({
        ...customer,
        rank: index + 1,
        score: this.calculateCustomerScore(customer.totalSpent, customer.totalOrders),
      }));

      // حفظ البيانات في التخزين المؤقت (10 دقائق)
      this.userCacheService.set(cacheKey, finalResult, 600);

      return finalResult;
    } catch (error) {
      throw this.userErrorService.handleAnalyticsError(error as Error, {
        operation: 'getCustomerRankings',
        additionalInfo: { limit },
      });
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
      // التحقق من التخزين المؤقت
      const cacheKey = this.userCacheService.createOverviewKey();
      const cachedData = this.userCacheService.get<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisMonth: number;
        topSpenders: Array<{ userId: string; totalSpent: number }>;
        userGrowth: Array<{ month: string; newUsers: number }>;
        averageOrderValue: number;
        customerLifetimeValue: number;
      }>(cacheKey);

      if (cachedData) {
        this.logger.debug('Cache hit for overall analytics');
        return cachedData;
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        topSpenders,
        userGrowth,
        averageOrderValue,
      ] = await Promise.all([
        this.userModel.countDocuments({
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
        }),
        this.userModel.countDocuments({
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
          lastLogin: { $gte: thisMonth },
        }),
        this.userModel.countDocuments({
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
          createdAt: { $gte: thisMonth },
        }),
        this.getTopSpenders(10),
        this.getUserGrowthData(12),
        this.getAverageOrderValue(),
      ]);

      const customerLifetimeValue = averageOrderValue * 2.5; // تقدير بسيط

      const result = {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        topSpenders,
        userGrowth,
        averageOrderValue,
        customerLifetimeValue,
      };

      // حفظ البيانات في التخزين المؤقت (15 دقيقة)
      this.userCacheService.set(cacheKey, result, 900);

      return result;
    } catch (error) {
      throw this.userErrorService.handleAnalyticsError(error as Error, {
        operation: 'getOverallUserAnalytics',
      });
    }
  }

  // ==================== Private Methods ====================

  private async getUserOrders(userId: string) {
    const result = await this.userQueryService.getOptimizedOrders(this.orderModel, userId, {
      maxLimit: 100,
    });

    // تحليل الأداء
    const performance = this.userQueryService.analyzeQueryPerformance(result);
    this.logger.debug(
      `Order query performance: ${performance.performance} (${performance.score}/100)`,
    );

    return result.data;
  }

  private async getUserFavorites(userId: string) {
    const result = await this.userQueryService.getOptimizedFavorites(this.favoriteModel, userId, {
      maxLimit: 50,
    });

    // تحليل الأداء
    const performance = this.userQueryService.analyzeQueryPerformance(result);
    this.logger.debug(
      `Favorite query performance: ${performance.performance} (${performance.score}/100)`,
    );

    return result.data;
  }

  private async getUserSupportTickets(userId: string) {
    const result = await this.userQueryService.getOptimizedSupportTickets(
      this.supportModel,
      userId,
      { maxLimit: 50 },
    );

    // تحليل الأداء
    const performance = this.userQueryService.analyzeQueryPerformance(result);
    this.logger.debug(
      `Support query performance: ${performance.performance} (${performance.score}/100)`,
    );

    return result.data;
  }

  private calculateOrderStats(orders: Order[]) {
    const completedOrders = orders.filter((o) => [OrderStatus.COMPLETED, OrderStatus.DELIVERED].includes(o.status));
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;

    // تحليل الفئات المفضلة
    const categoryStats = new Map<string, { count: number; amount: number }>();
    completedOrders.forEach((order) => {
      order.items.forEach((item: OrderItem) => {
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
      pending: orders.filter((o) => o.status === OrderStatus.PENDING_PAYMENT).length,
      cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
      totalSpent,
      averageOrderValue,
      firstOrderDate:
        orders.length > 0
          ? (orders[orders.length - 1] as Order & { createdAt?: Date }).createdAt
          : undefined,
      lastOrderDate:
        orders.length > 0 ? (orders[0] as Order & { createdAt?: Date }).createdAt : undefined,
      favoriteCategories,
    };
  }

  private calculateFavoriteStats(favorites: Favorite[]) {
    const categoryStats = new Map<string, number>();
    favorites.forEach((fav) => {
      const product = fav.productId as unknown as PopulatedProduct;
      if (product?.category) {
        const current = categoryStats.get(product.category) || 0;
        categoryStats.set(product.category, current + 1);
      }
    });

    const categories = Array.from(categoryStats.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentFavorites = favorites.slice(0, 10).map((fav) => ({
      productId: (fav.productId as unknown as PopulatedProduct)?._id || '',
      productName: (fav.productId as unknown as PopulatedProduct)?.name || 'منتج محذوف',
      addedAt: (fav as Favorite & { createdAt?: Date }).createdAt || new Date(),
    }));

    return {
      total: favorites.length,
      categories,
      recentFavorites,
    };
  }

  private calculateSupportStats(tickets: SupportTicket[]) {
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved');
    const openTickets = tickets.filter((t) => ['open', 'in_progress'].includes(t.status));

    return {
      totalTickets: tickets.length,
      openTickets: openTickets.length,
      resolvedTickets: resolvedTickets.length,
    };
  }

  private analyzeUserBehavior(orders: Order[]): UserBehavior {
    // استخدام الخدمة الجديدة لتحليل السلوك
    return this.userBehaviorService.analyzeUserBehavior(orders);
  }

  private async calculateUserScore(
    userId: string,
    orderStats: { total: number; completed: number; totalSpent: number },
    supportStats: { totalTickets: number; openTickets: number },
  ) {
    // تحضير البيانات للخدمة الجديدة
    const scoringStats: ScoringUserStats = {
      totalOrders: orderStats.total,
      completedOrders: orderStats.completed,
      totalSpent: orderStats.totalSpent,
      supportTickets: supportStats.totalTickets,
      openSupportTickets: supportStats.openTickets,
    };

    // حساب الترتيب
    const rankings = await this.getCustomerRankings(1000);
    const userRank = rankings.findIndex((r) => r.userId === userId) + 1;

    // استخدام الخدمة الجديدة لحساب النقاط
    return this.userScoringService.calculateUserScore(scoringStats, userRank || 0);
  }

  private generatePredictions(orders: Order[], behavior: UserBehavior) {
    // استخدام الخدمة الجديدة لتحليل السلوك
    const churnRisk = this.userBehaviorService.analyzeChurnRisk(orders);
    const nextPurchaseProbability = this.userBehaviorService.calculateNextPurchaseProbability(
      orders,
      churnRisk,
    );
    const estimatedLifetimeValue = this.userBehaviorService.calculateEstimatedLifetimeValue(orders);
    const recommendedActions = this.userBehaviorService.generateRecommendations(
      orders,
      behavior,
      churnRisk,
    );

    return {
      churnRisk,
      nextPurchaseProbability,
      estimatedLifetimeValue,
      recommendedActions,
    };
  }

  private calculateCustomerScore(totalSpent: number, totalOrders: number): number {
    // استخدام الخدمة الجديدة لحساب النقاط
    return this.userScoringService.calculateCustomerScore(totalSpent, totalOrders);
  }

  private async getTopSpenders(limit: number) {
    return this.orderModel.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
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
        deletedAt: null,
        status: { $ne: UserStatus.DELETED },
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
      { $match: { status: { $in: ['completed', 'delivered'] } } },
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
