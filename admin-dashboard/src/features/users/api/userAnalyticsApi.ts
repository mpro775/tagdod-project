import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

// ==================== Types ====================

export interface OverallUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageOrderValue: number;
  totalRevenue: number;
  averageOrdersPerUser: number;
}

export interface CustomerRanking {
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
  rank: number;
  tier: string;
}

export interface UserDetailedStats {
  userId: string;
  basicInfo: {
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lifetimeValue: number;
  };
  behavior: {
    lastOrderDate: string;
    daysSinceLastOrder: number;
    orderFrequency: number;
    favoriteCategories: string[];
  };
  scoring: {
    score: number;
    tier: string;
    rank: number;
  };
}

export interface CustomerSegments {
  segments: {
    vip: number;
    premium: number;
    regular: number;
    new: number;
  };
  totalCustomers: number;
  generatedAt: string;
  recommendations: string[];
}

export interface ChurnRiskCustomer {
  userId: string;
  name: string;
  email: string;
  churnRisk: 'high' | 'medium' | 'low';
  lastOrderDays: number;
  recommendedAction: string;
  totalSpent: number;
  orderCount: number;
}

export interface ChurnRiskAlert {
  alertType: string;
  customers: ChurnRiskCustomer[];
  totalAtRisk: number;
  generatedAt: string;
}

export interface TopCustomersReport {
  period: string;
  metric: string;
  data: CustomerRanking[];
  generatedAt: string;
  summary: {
    totalCustomers: number;
    totalValue: number;
    averageValue: number;
  };
}

export interface ScoringConfig {
  orderWeight: number;
  spendingWeight: number;
  frequencyWeight: number;
  recencyWeight: number;
  tierThresholds: {
    vip: number;
    premium: number;
    regular: number;
  };
}

export interface CacheStats {
  totalKeys: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: string;
}

// ==================== API Functions ====================

export const userAnalyticsApi = {
  /**
   * Get overall user analytics
   */
  getOverallAnalytics: async (): Promise<OverallUserAnalytics> => {
    const response = await apiClient.get<ApiResponse<OverallUserAnalytics>>(
      '/admin/user-analytics/overview'
    );
    return response.data.data;
  },

  /**
   * Get detailed stats for a specific user
   */
  getUserDetailedStats: async (userId: string): Promise<UserDetailedStats> => {
    const response = await apiClient.get<ApiResponse<UserDetailedStats>>(
      `/admin/user-analytics/user/${userId}`
    );
    return response.data.data;
  },

  /**
   * Get customer rankings
   */
  getCustomerRankings: async (limit: number = 50): Promise<CustomerRanking[]> => {
    const response = await apiClient.get<ApiResponse<CustomerRanking[]>>(
      '/admin/user-analytics/rankings',
      { params: { limit } }
    );
    return response.data.data;
  },

  /**
   * Get top customers report
   */
  getTopCustomersReport: async (
    period: string = 'all',
    metric: string = 'spending'
  ): Promise<TopCustomersReport> => {
    const response = await apiClient.get<ApiResponse<TopCustomersReport>>(
      '/admin/user-analytics/reports/top-customers',
      { params: { period, metric } }
    );
    return response.data.data || response.data;
  },

  /**
   * Get customer segments report
   */
  getCustomerSegments: async (): Promise<CustomerSegments> => {
    const response = await apiClient.get<ApiResponse<CustomerSegments>>(
      '/admin/user-analytics/reports/customer-segments'
    );
    return response.data.data || response.data;
  },

  /**
   * Get churn risk alerts
   */
  getChurnRiskAlerts: async (): Promise<ChurnRiskAlert> => {
    const response = await apiClient.get<ApiResponse<ChurnRiskAlert>>(
      '/admin/user-analytics/alerts/churn-risk'
    );
    return response.data.data || response.data;
  },

  /**
   * Get scoring configuration
   */
  getScoringConfig: async (): Promise<ScoringConfig> => {
    const response = await apiClient.get<ApiResponse<ScoringConfig>>(
      '/admin/user-analytics/scoring/config'
    );
    return response.data.data || response.data;
  },

  /**
   * Update scoring configuration
   */
  updateScoringConfig: async (config: Partial<ScoringConfig>): Promise<{ config: ScoringConfig; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ config: ScoringConfig; message: string }>>(
      '/admin/user-analytics/scoring/config',
      config
    );
    return response.data.data || response.data;
  },

  /**
   * Get cache statistics
   */
  getCacheStats: async (): Promise<CacheStats> => {
    const response = await apiClient.get<ApiResponse<CacheStats>>(
      '/admin/user-analytics/cache/stats'
    );
    return response.data.data || response.data;
  },

  /**
   * Clear all cache
   */
  clearCache: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/admin/user-analytics/cache/clear'
    );
    return response.data.data || response.data;
  },

  /**
   * Clear user cache
   */
  clearUserCache: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/user-analytics/cache/user/${userId}`
    );
    return response.data.data || response.data;
  },
};

