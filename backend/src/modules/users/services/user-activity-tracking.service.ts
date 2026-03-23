import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { User, UserStatus } from '../schemas/user.schema';
import { UserCacheService } from './user-cache.service';

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
  private readonly INACTIVE_DAYS = 30;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly userCacheService: UserCacheService,
  ) {}

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
    const skip = (page - 1) * limit;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const [users, total] = await Promise.all([
      this.userModel
        .find({
          lastActivityAt: { $gte: threshold },
          ...notDeletedFilter,
        })
        .select('_id phone firstName lastName lastActivityAt roles createdAt')
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments({
        lastActivityAt: { $gte: threshold },
        ...notDeletedFilter,
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
    const skip = (page - 1) * limit;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const [users, total] = await Promise.all([
      this.userModel
        .find({
          lastActivityAt: { $gte: threshold },
          ...notDeletedFilter,
        })
        .select('_id phone firstName lastName lastActivityAt roles createdAt')
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments({
        lastActivityAt: { $gte: threshold },
        ...notDeletedFilter,
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
    const cacheKey = this.userCacheService.createUserKey('inactive', `${days}-${page}-${limit}`);
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

    const [users, total] = await Promise.all([
      this.userModel
        .find({
          lastActivityAt: { $lt: threshold },
          ...notDeletedFilter,
        })
        .select('_id phone firstName lastName lastActivityAt createdAt roles')
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments({
        lastActivityAt: { $lt: threshold },
        ...notDeletedFilter,
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
    const cacheKey = this.userCacheService.createUserKey('never-logged-in', `${page}-${limit}`);
    const cached = this.userCacheService.get<PaginatedResult<NeverLoggedInUser>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;
    const oneMinute = 60 * 1000;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const matchCondition = {
      $expr: {
        $lt: [
          { $abs: { $subtract: ['$lastActivityAt', '$createdAt'] } },
          oneMinute,
        ],
      },
      ...notDeletedFilter,
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

    const now = new Date();
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
    const cacheKey = this.userCacheService.createOverviewKey('activity-stats');
    const cached = this.userCacheService.get<UserActivityStats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const now = new Date();
    const activeNowThreshold = new Date(now.getTime() - this.ACTIVE_NOW_MINUTES * 60 * 1000);
    const activeTodayThreshold = new Date(now.getTime() - this.ACTIVE_TODAY_HOURS * 60 * 60 * 1000);
    const activeWeekThreshold = new Date(now.getTime() - this.ACTIVE_WEEK_DAYS * 24 * 60 * 60 * 1000);
    const inactiveThreshold = new Date(now.getTime() - this.INACTIVE_DAYS * 24 * 60 * 60 * 1000);
    const oneMinute = 60 * 1000;

    const notDeletedFilter = {
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const [
      totalUsers,
      activeNow,
      activeToday,
      activeThisWeek,
      inactiveUsers,
      neverLoggedIn,
    ] = await Promise.all([
      this.userModel.countDocuments(notDeletedFilter),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $gte: activeNowThreshold },
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $gte: activeTodayThreshold },
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $gte: activeWeekThreshold },
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        lastActivityAt: { $lt: inactiveThreshold },
      }),
      this.userModel.countDocuments({
        ...notDeletedFilter,
        $expr: {
          $lt: [
            { $abs: { $subtract: ['$lastActivityAt', '$createdAt'] } },
            oneMinute,
          ],
        },
      }),
    ]);

    const recentlyActive = activeThisWeek - activeToday;
    const trulyActive = activeToday;
    const trulyInactive = inactiveUsers;
    const neverLoggedInCount = neverLoggedIn;

    const result: UserActivityStats = {
      totalUsers,
      activeNow,
      activeToday,
      activeThisWeek,
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
