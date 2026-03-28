import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';
import { User, UserStatus } from '../schemas/user.schema';
import { UserCacheService } from './user-cache.service';
import { AuditAction, AuditLog, AuditLogDocument } from '../../audit/schemas/audit-log.schema';

interface UserDocument extends User, Document {
  _id: any;
  createdAt: Date;
}

export interface ActiveUser {
  userId: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  lastActivityAt: Date;
  minutesSinceActivity: number;
  roles: string[];
}

export interface InactiveUser {
  userId: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  lastActivityAt: Date;
  daysSinceActivity: number;
  createdAt: Date;
  roles: string[];
}

export interface NeverLoggedInUser {
  userId: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  daysSinceRegistration: number;
  roles: string[];
}

export interface UserActivityStats {
  totalUsers: number;
  activeNow: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  inactiveUsers: number;
  neverLoggedIn: number;
  activityRate: number;
  distribution: {
    active: number;
    recentlyActive: number;
    inactive: number;
    neverLoggedIn: number;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class UserActivityTrackingService {
  private readonly logger = new Logger(UserActivityTrackingService.name);

  private readonly ACTIVE_NOW_MINUTES = 15;
  private readonly ACTIVE_TODAY_HOURS = 24;
  private readonly ACTIVE_WEEK_DAYS = 7;
  private readonly ACTIVE_MONTH_DAYS = 30;
  private readonly INACTIVE_DAYS = 30;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private readonly userCacheService: UserCacheService,
  ) {}

  private async getLoginSuccessUserIds(): Promise<Types.ObjectId[]> {
    const cacheKey = this.userCacheService.createAnalyticsKey('activity-login-success-user-ids-v1');
    const cached = this.userCacheService.get<string[]>(cacheKey);

    if (cached) {
      return cached
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
    }

    const ids = (await this.auditLogModel.distinct('userId', {
      action: AuditAction.LOGIN_SUCCESS,
    })) as unknown[];

    const normalized = ids
      .map((id) => String(id))
      .filter((id) => Types.ObjectId.isValid(id));

    this.userCacheService.set(cacheKey, normalized, 300);

    return normalized.map((id) => new Types.ObjectId(id));
  }

  private async getEnteredAppFilter(oneMinute: number): Promise<Record<string, unknown>> {
    const loginSuccessUserIds = await this.getLoginSuccessUserIds();

    if (loginSuccessUserIds.length === 0) {
      return {
        $expr: {
          $gt: [
            { $abs: { $subtract: ['$lastActivityAt', '$createdAt'] } },
            oneMinute,
          ],
        },
      };
    }

    return {
      $or: [
        { _id: { $in: loginSuccessUserIds } },
        {
          $expr: {
            $gt: [
              { $abs: { $subtract: ['$lastActivityAt', '$createdAt'] } },
              oneMinute,
            ],
          },
        },
      ],
    };
  }

  private async getNeverEnteredAppFilter(oneMinute: number): Promise<Record<string, unknown>> {
    const loginSuccessUserIds = await this.getLoginSuccessUserIds();

    if (loginSuccessUserIds.length === 0) {
      return {
        $expr: {
          $lte: [
            { $abs: { $subtract: ['$lastActivityAt', '$createdAt'] } },
            oneMinute,
          ],
        },
      };
    }

    return {
      _id: { $nin: loginSuccessUserIds },
      $expr: {
        $lte: [
          { $abs: { $subtract: ['$lastActivityAt', '$createdAt'] } },
          oneMinute,
        ],
      },
    };
  }

  async getActiveUsersNow(
    minutes: number = this.ACTIVE_NOW_MINUTES,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedResult<ActiveUser>> {
    const cacheKey = this.userCacheService.createUserKey('active-now', `${minutes}-${page}-${limit}`);
    const cached = this.userCacheService.get<PaginatedResult<ActiveUser>>(cacheKey);
    
    if (cached) {
      this.logger.debug(`Cache hit for active users: ${minutes} minutes`);
      return cached;
    }

    const threshold = new Date(Date.now() - minutes * 60 * 1000);
    const oneMinute = 60 * 1000;
    const skip = (page - 1) * limit;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const enteredAppFilter = await this.getEnteredAppFilter(oneMinute);

    const [users, total] = await Promise.all([
      this.userModel
        .find({
          lastActivityAt: { $gte: threshold },
          ...notDeletedFilter,
          ...enteredAppFilter,
        })
        .select('_id phone firstName lastName lastActivityAt roles createdAt')
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments({
        lastActivityAt: { $gte: threshold },
        ...notDeletedFilter,
        ...enteredAppFilter,
      }),
    ]);

    const now = new Date();
    const data: ActiveUser[] = users.map((user: any) => ({
      userId: user._id.toString(),
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      lastActivityAt: user.lastActivityAt,
      minutesSinceActivity: Math.floor((now.getTime() - new Date(user.lastActivityAt).getTime()) / (1000 * 60)),
      roles: user.roles || [],
    }));

    const result: PaginatedResult<ActiveUser> = {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    this.userCacheService.set(cacheKey, result, 60);

    return result;
  }

  async getRecentlyActiveUsers(
    days: number = this.ACTIVE_WEEK_DAYS,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedResult<ActiveUser>> {
    const cacheKey = this.userCacheService.createUserKey('recently-active', `${days}-${page}-${limit}`);
    const cached = this.userCacheService.get<PaginatedResult<ActiveUser>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const oneMinute = 60 * 1000;
    const skip = (page - 1) * limit;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const enteredAppFilter = await this.getEnteredAppFilter(oneMinute);

    const [users, total] = await Promise.all([
      this.userModel
        .find({
          lastActivityAt: { $gte: threshold },
          ...notDeletedFilter,
          ...enteredAppFilter,
        })
        .select('_id phone firstName lastName lastActivityAt roles createdAt')
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments({
        lastActivityAt: { $gte: threshold },
        ...notDeletedFilter,
        ...enteredAppFilter,
      }),
    ]);

    const now = new Date();
    const data: ActiveUser[] = users.map((user: any) => ({
      userId: user._id.toString(),
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      lastActivityAt: user.lastActivityAt,
      minutesSinceActivity: Math.floor((now.getTime() - new Date(user.lastActivityAt).getTime()) / (1000 * 60)),
      roles: user.roles || [],
    }));

    const result: PaginatedResult<ActiveUser> = {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    this.userCacheService.set(cacheKey, result, 300);

    return result;
  }

  async getInactiveUsers(
    days: number = this.INACTIVE_DAYS,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedResult<InactiveUser>> {
    const cacheKey = this.userCacheService.createUserKey('inactive-v2', `${days}-${page}-${limit}`);
    const cached = this.userCacheService.get<PaginatedResult<InactiveUser>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const skip = (page - 1) * limit;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const oneMinute = 60 * 1000;
    const enteredAppFilter = await this.getEnteredAppFilter(oneMinute);

    const [users, total] = await Promise.all([
      this.userModel
        .find({
          lastActivityAt: { $lt: threshold },
          ...notDeletedFilter,
          ...enteredAppFilter,
        })
        .select('_id phone firstName lastName lastActivityAt createdAt roles')
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments({
        lastActivityAt: { $lt: threshold },
        ...notDeletedFilter,
        ...enteredAppFilter,
      }),
    ]);

    const now = new Date();
    const data: InactiveUser[] = users.map((user: any) => ({
      userId: user._id.toString(),
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      lastActivityAt: user.lastActivityAt,
      daysSinceActivity: Math.floor((now.getTime() - new Date(user.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)),
      createdAt: user.createdAt,
      roles: user.roles || [],
    }));

    const result: PaginatedResult<InactiveUser> = {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    this.userCacheService.set(cacheKey, result, 600);

    return result;
  }

  async getNeverLoggedInUsers(
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedResult<NeverLoggedInUser>> {
    const cacheKey = this.userCacheService.createUserKey('never-logged-in-v2', `${page}-${limit}`);
    const cached = this.userCacheService.get<PaginatedResult<NeverLoggedInUser>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;
    const oneMinute = 60 * 1000;
    const now = new Date();

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const neverEnteredFilter = await this.getNeverEnteredAppFilter(oneMinute);
    const matchCondition = {
      ...notDeletedFilter,
      ...neverEnteredFilter,
    };

    const [users, total] = await Promise.all([
      this.userModel
        .find(matchCondition)
        .select('_id phone firstName lastName createdAt roles')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(matchCondition),
    ]);

    const data: NeverLoggedInUser[] = users.map((user: any) => ({
      userId: user._id.toString(),
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      daysSinceRegistration: Math.floor((now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      roles: user.roles || [],
    }));

    const result: PaginatedResult<NeverLoggedInUser> = {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    this.userCacheService.set(cacheKey, result, 900);

    return result;
  }

  async getActivityStats(): Promise<UserActivityStats> {
    const cacheKey = this.userCacheService.createOverviewKey('activity-stats-v2');
    const cached = this.userCacheService.get<UserActivityStats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const now = new Date();
    const activeNowThreshold = new Date(now.getTime() - this.ACTIVE_NOW_MINUTES * 60 * 1000);
    const activeTodayThreshold = new Date(now.getTime() - this.ACTIVE_TODAY_HOURS * 60 * 60 * 1000);
    const activeWeekThreshold = new Date(now.getTime() - this.ACTIVE_WEEK_DAYS * 24 * 60 * 60 * 1000);
    const activeMonthThreshold = new Date(now.getTime() - this.ACTIVE_MONTH_DAYS * 24 * 60 * 60 * 1000);
    const inactiveThreshold = new Date(now.getTime() - this.INACTIVE_DAYS * 24 * 60 * 60 * 1000);
    const oneMinute = 60 * 1000;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const enteredAppFilter = await this.getEnteredAppFilter(oneMinute);
    const neverEnteredFilter = await this.getNeverEnteredAppFilter(oneMinute);

    const neverLoggedInQuery = {
      ...notDeletedFilter,
      ...neverEnteredFilter,
    };

    const [
      totalUsers,
      activeNow,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      inactiveUsers,
      neverLoggedIn,
    ] = await Promise.all([
      this.userModel.countDocuments(notDeletedFilter),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $gte: activeNowThreshold },
        ...enteredAppFilter,
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $gte: activeTodayThreshold },
        ...enteredAppFilter,
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $gte: activeWeekThreshold },
        ...enteredAppFilter,
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $gte: activeMonthThreshold },
        ...enteredAppFilter,
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $lt: inactiveThreshold },
        ...enteredAppFilter,
      }),
      this.userModel.countDocuments(neverLoggedInQuery),
    ]);

    const recentlyActive = Math.max(activeThisWeek - activeToday, 0);
    const trulyActive = activeToday;
    const trulyInactive = inactiveUsers;
    const neverLoggedInCount = neverLoggedIn;

    const result: UserActivityStats = {
      totalUsers,
      activeNow,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      inactiveUsers,
      neverLoggedIn: neverLoggedInCount,
      activityRate: totalUsers > 0 ? Math.round((activeThisWeek / totalUsers) * 100) : 0,
      distribution: {
        active: trulyActive,
        recentlyActive,
        inactive: trulyInactive,
        neverLoggedIn: neverLoggedInCount,
      },
    };

    this.userCacheService.set(cacheKey, result, 300);

    return result;
  }
}
