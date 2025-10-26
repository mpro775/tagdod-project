import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserAnalyticsService } from './user-analytics.service';
import { User } from '../schemas/user.schema';
import { Order } from '../../checkout/schemas/order.schema';
import { Favorite } from '../../favorites/schemas/favorite.schema';
import { SupportTicket } from '../../support/schemas/support-ticket.schema';
import { UserScoringService } from './user-scoring.service';
import { UserBehaviorService } from './user-behavior.service';
import { UserCacheService } from './user-cache.service';
import { UserErrorService } from './user-error.service';
import { UserQueryService } from './user-query.service';

describe('UserAnalyticsService', () => {
  let service: UserAnalyticsService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    phone: '+966501234567',
    firstName: 'أحمد',
    lastName: 'محمد',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-01-15'),
    roles: ['customer'],
    status: 'active',
  };

  const mockUserModel = {
    find: jest.fn(),
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUser),
    }),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockOrderModel = {
    find: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockFavoriteModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockSupportModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockUserScoringService = {
    calculateUserScore: jest.fn().mockReturnValue({
      loyaltyScore: 80,
      valueScore: 90,
      activityScore: 75,
      supportScore: 85,
      overallScore: 82.5,
      rank: 1,
    }),
    calculateCustomerScore: jest.fn().mockReturnValue(85),
  };

  const mockUserBehaviorService = {
    analyzeUserBehavior: jest.fn().mockReturnValue({
      preferredPaymentMethod: 'credit_card',
      averageOrderFrequency: 30,
      seasonalPatterns: [],
      productPreferences: [],
    }),
    analyzeChurnRisk: jest.fn().mockReturnValue('low'),
    calculateNextPurchaseProbability: jest.fn().mockReturnValue(0.85),
    calculateEstimatedLifetimeValue: jest.fn().mockReturnValue(5000),
    generateRecommendations: jest.fn().mockReturnValue(['تقديم عروض خاصة']),
  };

  const mockUserCacheService = {
    createUserKey: jest.fn().mockReturnValue('user-key'),
    createRankingKey: jest.fn().mockReturnValue('ranking-key'),
    createOverviewKey: jest.fn().mockReturnValue('overview-key'),
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
  };

  const mockUserErrorService = {
    handleAnalyticsError: jest.fn().mockImplementation((error) => error),
  };

  const mockUserQueryService = {
    getOptimizedOrders: jest.fn().mockResolvedValue({
      data: [],
      executionTime: 10,
      count: 0,
    }),
    getOptimizedFavorites: jest.fn().mockResolvedValue({
      data: [],
      executionTime: 10,
      count: 0,
    }),
    getOptimizedSupportTickets: jest.fn().mockResolvedValue({
      data: [],
      executionTime: 10,
      count: 0,
    }),
    getOptimizedAggregation: jest.fn().mockResolvedValue({
      data: [],
      executionTime: 10,
      count: 0,
    }),
    analyzeQueryPerformance: jest.fn().mockReturnValue({
      performance: 'excellent',
      score: 95,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAnalyticsService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Favorite.name),
          useValue: mockFavoriteModel,
        },
        {
          provide: getModelToken(SupportTicket.name),
          useValue: mockSupportModel,
        },
        {
          provide: UserScoringService,
          useValue: mockUserScoringService,
        },
        {
          provide: UserBehaviorService,
          useValue: mockUserBehaviorService,
        },
        {
          provide: UserCacheService,
          useValue: mockUserCacheService,
        },
        {
          provide: UserErrorService,
          useValue: mockUserErrorService,
        },
        {
          provide: UserQueryService,
          useValue: mockUserQueryService,
        },
      ],
    }).compile();

    service = module.get<UserAnalyticsService>(UserAnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDetailedStats', () => {
    it('should return detailed user statistics', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const result = await service.getUserDetailedStats(userId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.userInfo).toBeDefined();
      expect(result.orders).toBeDefined();
      expect(result.favorites).toBeDefined();
      expect(result.support).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.behavior).toBeDefined();
      expect(result.predictions).toBeDefined();
    });

    it('should use cache when available', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const cachedData = {
        userId,
        userInfo: mockUser,
        orders: {},
        favorites: {},
        support: {},
        score: {},
        behavior: {},
        predictions: {},
      };

      mockUserCacheService.get.mockReturnValueOnce(cachedData);

      const result = await service.getUserDetailedStats(userId);

      expect(result).toEqual(cachedData);
      expect(mockUserModel.findById).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      const userId = 'invalid-id';
      mockUserModel.findById.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getUserDetailedStats(userId)).rejects.toThrow('User not found');
    });
  });

  describe('getCustomerRankings', () => {
    it('should return customer rankings', async () => {
      const mockRankings = [
        {
          userId: '1',
          userInfo: { phone: '+966501111111', firstName: 'أحمد', lastName: 'محمد' },
          totalSpent: 10000,
          totalOrders: 50,
        },
      ];

      mockUserQueryService.getOptimizedAggregation.mockResolvedValueOnce({
        data: mockRankings,
        executionTime: 15,
        count: 1,
      });

      const result = await service.getCustomerRankings(10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should use cache when available', async () => {
      const cachedRankings = [
        { userId: '1', rank: 1, score: 95, totalSpent: 10000, totalOrders: 50, userInfo: {} },
      ];

      mockUserCacheService.get.mockReturnValueOnce(cachedRankings);

      const result = await service.getCustomerRankings(10);

      expect(result).toEqual(cachedRankings);
    });
  });

  describe('getOverallUserAnalytics', () => {
    it('should return overall analytics', async () => {
      mockUserModel.countDocuments.mockResolvedValue(100);
      mockOrderModel.aggregate.mockResolvedValue([{ _id: null, averageValue: 500 }]);

      const result = await service.getOverallUserAnalytics();

      expect(result).toBeDefined();
      expect(result.totalUsers).toBeDefined();
      expect(result.activeUsers).toBeDefined();
      expect(result.newUsersThisMonth).toBeDefined();
      expect(result.averageOrderValue).toBeDefined();
    });
  });
});
