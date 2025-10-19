import { Injectable, Logger } from '@nestjs/common';
import { Model, Types, PipelineStage } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Order } from '../../checkout/schemas/order.schema';
import { Favorite } from '../../favorites/schemas/favorite.schema';
import { SupportTicket } from '../../support/schemas/support-ticket.schema';

export interface UserQueryFilter {
  deletedAt?: Date | null;
  status?: string;
  roles?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface MongoFilter {
  deletedAt?: Date | null | { $ne: null };
  status?: string;
  roles?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  userId?: Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface QueryOptimizationOptions {
  useIndexes: boolean;
  limitResults: boolean;
  maxLimit: number;
  cacheResults: boolean;
  cacheTTL: number;
}

export interface OptimizedQueryResult<T> {
  data: T[];
  total: number;
  executionTime: number;
  indexesUsed: string[];
  optimized: boolean;
}

@Injectable()
export class UserQueryService {
  private readonly logger = new Logger(UserQueryService.name);
  private readonly defaultOptions: QueryOptimizationOptions = {
    useIndexes: true,
    limitResults: true,
    maxLimit: 1000,
    cacheResults: true,
    cacheTTL: 300,
  };

  /**
   * تحسين استعلام جلب المستخدمين
   */
  async getOptimizedUsers(
    userModel: Model<User>,
    query: UserQueryFilter = {},
    options: Partial<QueryOptimizationOptions> = {},
  ): Promise<OptimizedQueryResult<User>> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      // تحسين الاستعلام
      const optimizedQuery = this.optimizeUserQuery(query, opts);
      
      // تنفيذ الاستعلام
      const [data, total] = await Promise.all([
        userModel.find(optimizedQuery.filter)
          .select(optimizedQuery.select)
          .sort(optimizedQuery.sort)
          .limit(optimizedQuery.limit)
          .lean()
          .exec(),
        userModel.countDocuments(optimizedQuery.filter),
      ]);

      const executionTime = Date.now() - startTime;

      return {
        data,
        total,
        executionTime,
        indexesUsed: optimizedQuery.indexesUsed,
        optimized: optimizedQuery.optimized,
      };
    } catch (error) {
      this.logger.error('Error in optimized user query:', error);
      throw error;
    }
  }

  /**
   * تحسين استعلام جلب الطلبات
   */
  async getOptimizedOrders(
    orderModel: Model<Order>,
    userId: string,
    options: Partial<QueryOptimizationOptions> = {},
  ): Promise<OptimizedQueryResult<Order>> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      // تحسين الاستعلام
      const optimizedQuery = this.optimizeOrderQuery(userId, opts);
      
      // تنفيذ الاستعلام
      const [data, total] = await Promise.all([
        orderModel.find(optimizedQuery.filter)
          .select(optimizedQuery.select)
          .sort(optimizedQuery.sort)
          .limit(optimizedQuery.limit)
          .lean()
          .exec(),
        orderModel.countDocuments(optimizedQuery.filter),
      ]);

      const executionTime = Date.now() - startTime;

      return {
        data,
        total,
        executionTime,
        indexesUsed: optimizedQuery.indexesUsed,
        optimized: optimizedQuery.optimized,
      };
    } catch (error) {
      this.logger.error('Error in optimized order query:', error);
      throw error;
    }
  }

  /**
   * تحسين استعلام جلب المفضلة
   */
  async getOptimizedFavorites(
    favoriteModel: Model<Favorite>,
    userId: string,
    options: Partial<QueryOptimizationOptions> = {},
  ): Promise<OptimizedQueryResult<Favorite>> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      // تحسين الاستعلام
      const optimizedQuery = this.optimizeFavoriteQuery(userId, opts);
      
      // تنفيذ الاستعلام
      const [data, total] = await Promise.all([
        favoriteModel.find(optimizedQuery.filter)
          .populate('productId', 'name category')
          .select(optimizedQuery.select)
          .sort(optimizedQuery.sort)
          .limit(optimizedQuery.limit)
          .lean()
          .exec(),
        favoriteModel.countDocuments(optimizedQuery.filter),
      ]);

      const executionTime = Date.now() - startTime;

      return {
        data,
        total,
        executionTime,
        indexesUsed: optimizedQuery.indexesUsed,
        optimized: optimizedQuery.optimized,
      };
    } catch (error) {
      this.logger.error('Error in optimized favorite query:', error);
      throw error;
    }
  }

  /**
   * تحسين استعلام جلب تذاكر الدعم
   */
  async getOptimizedSupportTickets(
    supportModel: Model<SupportTicket>,
    userId: string,
    options: Partial<QueryOptimizationOptions> = {},
  ): Promise<OptimizedQueryResult<SupportTicket>> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      // تحسين الاستعلام
      const optimizedQuery = this.optimizeSupportQuery(userId, opts);
      
      // تنفيذ الاستعلام
      const [data, total] = await Promise.all([
        supportModel.find(optimizedQuery.filter)
          .select(optimizedQuery.select)
          .sort(optimizedQuery.sort)
          .limit(optimizedQuery.limit)
          .lean()
          .exec(),
        supportModel.countDocuments(optimizedQuery.filter),
      ]);

      const executionTime = Date.now() - startTime;

      return {
        data,
        total,
        executionTime,
        indexesUsed: optimizedQuery.indexesUsed,
        optimized: optimizedQuery.optimized,
      };
    } catch (error) {
      this.logger.error('Error in optimized support query:', error);
      throw error;
    }
  }

  /**
   * تحسين استعلام المستخدمين
   */
  private optimizeUserQuery(query: UserQueryFilter, options: QueryOptimizationOptions): {
    filter: MongoFilter;
    select: string;
    sort: Record<string, 1 | -1>;
    limit: number;
    indexesUsed: string[];
    optimized: boolean;
  } {
    const optimized: MongoFilter = { ...query };
    const indexesUsed: string[] = [];
    let optimizedFlag = false;

    // تحسين الفلترة
    if (query.deletedAt === null) {
      optimized.deletedAt = { $ne: null };
      optimizedFlag = true;
    }

    if (optimized.status) {
      indexesUsed.push('status_1');
      optimizedFlag = true;
    }

    if (optimized.roles) {
      indexesUsed.push('roles_1');
      optimizedFlag = true;
    }

    // تحسين الترتيب
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (optimized.sortBy) {
      sort = { [optimized.sortBy]: optimized.sortOrder === 'asc' ? 1 : -1 };
      indexesUsed.push(`${optimized.sortBy}_1`);
      optimizedFlag = true;
    }

    // تحسين الحد الأقصى
    let limit = options.maxLimit;
    if (optimized.limit && optimized.limit < options.maxLimit) {
      limit = optimized.limit;
      optimizedFlag = true;
    }

    // تحسين الحقول المختارة
    const select = '-passwordHash -__v';

    return {
      filter: optimized,
      select,
      sort,
      limit,
      indexesUsed,
      optimized: optimizedFlag,
    };
  }

  /**
   * تحسين استعلام الطلبات
   */
  private optimizeOrderQuery(userId: string, options: QueryOptimizationOptions): {
    filter: MongoFilter;
    select: string;
    sort: Record<string, 1 | -1>;
    limit: number;
    indexesUsed: string[];
    optimized: boolean;
  } {
    const filter: MongoFilter = {
      userId: new Types.ObjectId(userId),
    };

    const indexesUsed = ['userId_1'];
    const optimizedFlag = true;

    // تحسين الترتيب
    const sort: Record<string, 1 | -1> = { createdAt: -1 };
    indexesUsed.push('userId_1_createdAt_-1');

    // تحسين الحد الأقصى
    const limit = Math.min(options.maxLimit, 100);

    // تحسين الحقول المختارة
    const select = '-__v';

    return {
      filter,
      select,
      sort,
      limit,
      indexesUsed,
      optimized: optimizedFlag,
    };
  }

  /**
   * تحسين استعلام المفضلة
   */
  private optimizeFavoriteQuery(userId: string, options: QueryOptimizationOptions): {
    filter: MongoFilter;
    select: string;
    sort: Record<string, 1 | -1>;
    limit: number;
    indexesUsed: string[];
    optimized: boolean;
  } {
    const filter: MongoFilter = {
      userId: new Types.ObjectId(userId),
    };

    const indexesUsed = ['userId_1'];
    const optimizedFlag = true;

    // تحسين الترتيب
    const sort: Record<string, 1 | -1> = { createdAt: -1 };
    indexesUsed.push('userId_1_createdAt_-1');

    // تحسين الحد الأقصى
    const limit = Math.min(options.maxLimit, 50);

    // تحسين الحقول المختارة
    const select = '-__v';

    return {
      filter,
      select,
      sort,
      limit,
      indexesUsed,
      optimized: optimizedFlag,
    };
  }

  /**
   * تحسين استعلام تذاكر الدعم
   */
  private optimizeSupportQuery(userId: string, options: QueryOptimizationOptions): {
    filter: MongoFilter;
    select: string;
    sort: Record<string, 1 | -1>;
    limit: number;
    indexesUsed: string[];
    optimized: boolean;
  } {
    const filter: MongoFilter = {
      userId: new Types.ObjectId(userId),
    };

    const indexesUsed = ['userId_1'];
    const optimizedFlag = true;

    // تحسين الترتيب
    const sort: Record<string, 1 | -1> = { createdAt: -1 };
    indexesUsed.push('userId_1_createdAt_-1');

    // تحسين الحد الأقصى
    const limit = Math.min(options.maxLimit, 50);

    // تحسين الحقول المختارة
    const select = '-__v';

    return {
      filter,
      select,
      sort,
      limit,
      indexesUsed,
      optimized: optimizedFlag,
    };
  }

  /**
   * تحسين استعلام التجميع
   */
  async getOptimizedAggregation<T>(
    model: Model<T>,
    pipeline: PipelineStage[],
    options: Partial<QueryOptimizationOptions> = {},
  ): Promise<OptimizedQueryResult<T>> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    try {
      // تحسين خط الأنابيب
      const optimizedPipeline = this.optimizeAggregationPipeline(pipeline, opts);
      
      // تنفيذ الاستعلام
      const data = await model.aggregate(optimizedPipeline.pipeline).exec();

      const executionTime = Date.now() - startTime;

      return {
        data,
        total: data.length,
        executionTime,
        indexesUsed: optimizedPipeline.indexesUsed,
        optimized: optimizedPipeline.optimized,
      };
    } catch (error) {
      this.logger.error('Error in optimized aggregation:', error);
      throw error;
    }
  }

  /**
   * تحسين خط أنابيب التجميع
   */
  private optimizeAggregationPipeline(pipeline: PipelineStage[], options: QueryOptimizationOptions): {
    pipeline: PipelineStage[];
    indexesUsed: string[];
    optimized: boolean;
  } {
    const optimizedPipeline = [...pipeline];
    const indexesUsed: string[] = [];
    let optimizedFlag = false;

    // تحسين المراحل
    for (let i = 0; i < optimizedPipeline.length; i++) {
      const stage = optimizedPipeline[i] as PipelineStage;

      // تحسين $match
      if ('$match' in stage) {
        if (stage.$match.userId) {
          indexesUsed.push('userId_1');
          optimizedFlag = true;
        }
        if (stage.$match.status) {
          indexesUsed.push('status_1');
          optimizedFlag = true;
        }
        if (stage.$match.createdAt) {
          indexesUsed.push('createdAt_-1');
          optimizedFlag = true;
        }
      }

      // تحسين $sort
      if ('$sort' in stage) {
        const sortKeys = Object.keys(stage.$sort);
        sortKeys.forEach(key => {
          indexesUsed.push(`${key}_${stage.$sort[key]}`);
        });
        optimizedFlag = true;
      }

      // تحسين $limit
      if ('$limit' in stage && stage.$limit > options.maxLimit) {
        stage.$limit = options.maxLimit;
        optimizedFlag = true;
      }
    }

    return {
      pipeline: optimizedPipeline,
      indexesUsed,
      optimized: optimizedFlag,
    };
  }

  /**
   * تحليل أداء الاستعلام
   */
  analyzeQueryPerformance<T>(result: OptimizedQueryResult<T>): {
    performance: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
    score: number;
  } {
    const recommendations: string[] = [];
    let score = 100;

    // تحليل وقت التنفيذ
    if (result.executionTime > 1000) {
      recommendations.push('وقت التنفيذ بطيء - فكر في تحسين الفهارس');
      score -= 30;
    } else if (result.executionTime > 500) {
      recommendations.push('وقت التنفيذ متوسط - يمكن تحسينه');
      score -= 15;
    }

    // تحليل عدد النتائج
    if (result.total > 1000) {
      recommendations.push('عدد النتائج كبير - فكر في استخدام Pagination');
      score -= 20;
    }

    // تحليل الفهارس المستخدمة
    if (result.indexesUsed.length === 0) {
      recommendations.push('لم يتم استخدام فهارس - أضف فهارس للتحسين');
      score -= 25;
    }

    // تحليل التحسين
    if (!result.optimized) {
      recommendations.push('الاستعلام لم يتم تحسينه - فكر في إعادة كتابته');
      score -= 20;
    }

    // تحديد الأداء
    let performance: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) {
      performance = 'excellent';
    } else if (score >= 70) {
      performance = 'good';
    } else if (score >= 50) {
      performance = 'fair';
    } else {
      performance = 'poor';
    }

    return {
      performance,
      recommendations,
      score,
    };
  }
}
