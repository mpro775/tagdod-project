// ==================== User Analytics Types ====================

export interface UserInfo {
  phone: string;
  firstName?: string;
  lastName?: string;
  status: string;
  roles: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface OrderStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate?: string;
  lastOrderDate?: string;
  favoriteCategories: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
}

export interface FavoriteStats {
  total: number;
  categories: Array<{
    category: string;
    count: number;
  }>;
  recentFavorites: Array<{
    productId: string;
    productName: string;
    addedAt: string;
  }>;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime?: number;
}

export interface UserScore {
  loyaltyScore: number;
  valueScore: number;
  activityScore: number;
  supportScore: number;
  overallScore: number;
  rank: number;
}

export interface UserBehavior {
  preferredPaymentMethod: string;
  averageOrderFrequency: number;
  seasonalPatterns: Array<{
    month: string;
    orders: number;
    amount: number;
  }>;
  productPreferences: Array<{
    category: string;
    percentage: number;
  }>;
}

export interface UserPredictions {
  churnRisk: 'low' | 'medium' | 'high';
  nextPurchaseProbability: number;
  estimatedLifetimeValue: number;
  recommendedActions: string[];
}

export interface UserDetailedStats {
  userId: string;
  userInfo: UserInfo;
  orders: OrderStats;
  favorites: FavoriteStats;
  support: SupportStats;
  score: UserScore;
  behavior: UserBehavior;
  predictions: UserPredictions;
}

export interface CustomerRanking {
  userId: string;
  userInfo: {
    phone: string;
    firstName?: string;
    lastName?: string;
  };
  totalSpent: number;
  totalOrders: number;
  rank: number;
  score: number;
}

export interface OverallUserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topSpenders: Array<{
    userId: string;
    totalSpent: number;
  }>;
  userGrowth: Array<{
    month: string;
    newUsers: number;
  }>;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

// ==================== API Response Types ====================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserStatsFilter {
  minScore?: number;
  maxScore?: number;
  churnRisk?: 'low' | 'medium' | 'high';
  status?: string;
  roles?: string[];
}

// ==================== Chart Data Types ====================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface UserAnalyticsChartData {
  userGrowth: TimeSeriesData[];
  revenueByMonth: TimeSeriesData[];
  orderStatusDistribution: ChartDataPoint[];
  customerSegments: ChartDataPoint[];
  topCategories: ChartDataPoint[];
}

// ==================== Report Types ====================

export interface CustomerSegment {
  name: string;
  count: number;
  percentage: number;
  averageValue: number;
  description: string;
}

export interface ChurnRiskAlert {
  userId: string;
  userInfo: {
    phone: string;
    firstName?: string;
    lastName?: string;
  };
  churnRisk: 'low' | 'medium' | 'high';
  lastOrderDays: number;
  recommendedAction: string;
  score: number;
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

export interface CustomerSegmentsReport {
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

// ==================== Component Props Types ====================

export interface UserStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export interface UserChartProps {
  data: ChartDataPoint[] | TimeSeriesData[];
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  height?: number;
  showLegend?: boolean;
}

export interface UserDetailsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface CustomerRankingTableProps {
  data: CustomerRanking[];
  onUserClick: (userId: string) => void;
  loading?: boolean;
}

// ==================== Hook Return Types ====================

export interface UseUserAnalyticsReturn {
  userStats: UserDetailedStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCustomerRankingsReturn {
  rankings: CustomerRanking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseOverallAnalyticsReturn {
  analytics: OverallUserAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
