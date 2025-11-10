// Cart Types - متوافقة مع Backend Schema
export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted',
  EXPIRED = 'expired',
}

export interface CartItem {
  _id?: string;
  variantId: string;
  productId?: string;
  qty: number;
  addedAt: Date;
  productSnapshot?: {
    name: string;
    slug: string;
    image?: string;
    brandId?: string;
    brandName?: string;
    categoryId?: string;
    variantAttributes?: Array<{
      attributeId?: string;
      attributeName?: string;
      attributeNameEn?: string;
      valueId?: string;
      value?: string;
      valueEn?: string;
    }>;
  };
  pricing?: {
    appliedPromotionId?: string;
    currencies: Record<
      string,
      {
        base: number;
        final: number;
        discount: number;
      }
    >;
  };
}

export interface PricingSummary {
  currency: string;
  itemsCount: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  merchantDiscountAmount: number;
  couponDiscount: number;
  promotionDiscount: number;
  autoDiscount: number;
  totalDiscount: number;
  total: number;
  lastCalculatedAt?: Date;
}

export interface CartMetadata {
  source?: string;
  campaign?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface UserInfo {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  storeName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface Cart {
  _id: string;
  userId?: string;
  deviceId?: string;
  status: CartStatus;
  items: CartItem[];
  currency: string;
  accountType?: string;
  appliedCouponCode?: string;
  appliedCoupons?: string[];
  couponDiscount: number;
  autoAppliedCouponCodes?: string[];
  autoAppliedDiscounts?: number[];
  pricingSummaryByCurrency?: Record<string, PricingSummary>;
  pricingSummary?: PricingSummary;
  meta?: {
    count?: number;
    quantity?: number;
    merchantDiscountPercent?: number;
    merchantDiscountAmount?: number;
  };
  lastActivityAt?: Date;
  isAbandoned: boolean;
  abandonmentEmailsSent: number;
  lastAbandonmentEmailAt?: Date;
  convertedToOrderId?: string;
  convertedAt?: Date;
  isMerged: boolean;
  mergedIntoUserId?: string;
  mergedAt?: Date;
  metadata?: CartMetadata;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: UserInfo;
}

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: {
    data: T;
    meta?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    };
  };
  message?: string;
  error?: string;
}

// Cart Filters
export interface CartFilters {
  status?: CartStatus;
  isAbandoned?: boolean;
  userId?: string;
  deviceId?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  hasItems?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'total';
  sortOrder?: 'asc' | 'desc';
}

// Analytics Types
export interface CartAnalyticsOverview {
  totalCarts: number;
  activeCarts: number;
  abandonedCarts: number;
  convertedCarts: number;
  avgCartValue: number;
  avgItemsPerCart: number;
  conversionRate: number;
  abandonmentRate: number;
}

export interface CartAnalyticsTrends {
  recentActivity: Array<Record<string, unknown>>;
  hourlyActivity: Array<Record<string, unknown>>;
}

export interface CartAnalyticsInsights {
  topProducts: Array<Record<string, unknown>>;
  cartValueDistribution: Array<Record<string, unknown>>;
}

export interface CartAnalytics {
  overview: CartAnalyticsOverview;
  trends: CartAnalyticsTrends;
  insights: CartAnalyticsInsights;
  period: number;
}

export interface CartPeriodStatistics {
  total: number;
  active: number;
  abandoned: number;
  converted: number;
  totalValue: number;
  conversionRate: number;
  abandonmentRate: number;
}

export interface CartStatistics {
  today: CartPeriodStatistics;
  yesterday: CartPeriodStatistics;
  lastWeek: CartPeriodStatistics;
  allTime: CartPeriodStatistics;
}

export interface ConversionRates {
  daily: Array<{
    date: string;
    conversionRate: number;
    abandonedCarts: number;
    convertedCarts: number;
  }>;
  weekly: Array<{
    week: string;
    conversionRate: number;
    abandonedCarts: number;
    convertedCarts: number;
  }>;
  monthly: Array<{
    month: string;
    conversionRate: number;
    abandonedCarts: number;
    convertedCarts: number;
  }>;
}

export interface RecoveryCampaignAnalytics {
  totalEmailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  cartsRecovered: number;
  revenueRecovered: number;
  openRate: number;
  clickRate: number;
  recoveryRate: number;
  campaigns: Array<{
    campaignId: string;
    name: string;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    cartsRecovered: number;
    revenueRecovered: number;
    openRate: number;
    clickRate: number;
    recoveryRate: number;
  }>;
}

export interface CustomerBehaviorAnalytics {
  averageSessionDuration: number;
  averagePagesPerSession: number;
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
    averageCartValue: number;
    conversionRate: number;
  }>;
  timeBasedAnalysis: Array<{
    hour: number;
    cartAbandonmentRate: number;
    conversionRate: number;
    averageCartValue: number;
  }>;
  repeatCustomerAnalysis: {
    newCustomers: {
      count: number;
      averageCartValue: number;
      conversionRate: number;
    };
    repeatCustomers: {
      count: number;
      averageCartValue: number;
      conversionRate: number;
    };
  };
}

export interface RevenueImpactAnalytics {
  totalPotentialRevenue: number;
  recoveredRevenue: number;
  lostRevenue: number;
  recoveryEfficiency: number;
  topRecoverySources: Array<{
    source: string;
    recoveredRevenue: number;
    recoveryRate: number;
  }>;
  revenueTrends: Array<{
    date: string;
    potentialRevenue: number;
    recoveredRevenue: number;
    lostRevenue: number;
  }>;
}

// Bulk Actions
export interface BulkActionRequest {
  action: 'delete' | 'clear' | 'update_status';
  cartIds: string[];
  status?: CartStatus;
}

export interface BulkActionResponse {
  processed: number;
  failed: number;
  errors: Array<{
    cartId: string;
    error: string;
  }>;
}

// Cart Operations
export interface ConvertToOrderRequest {
  cartId: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface SendReminderRequest {
  cartId: string;
  reminderType?: 'first' | 'second' | 'final';
  customMessage?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// Table Row Types
export interface CartTableRow extends Cart {
  userDisplayName: string;
  userContact: string;
  totalFormatted: string;
  statusColor: string;
  lastActivityFormatted: string;
  actions: string[];
}

// Form Types
export interface CartFiltersForm {
  status: CartStatus | '';
  isAbandoned: boolean | '';
  dateFrom: string;
  dateTo: string;
  minTotal: string;
  maxTotal: string;
  hasItems: boolean | '';
  sortBy: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'total';
  sortOrder: 'asc' | 'desc';
}

// Export/Import Types
export interface CartExportData {
  carts: Cart[];
  filters: CartFilters;
  exportedAt: Date;
  exportedBy: string;
}

// Dashboard Widget Types
export interface CartDashboardWidget {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  link?: string;
}

export interface CartDashboardStats {
  totalCarts: CartDashboardWidget;
  activeCarts: CartDashboardWidget;
  abandonedCarts: CartDashboardWidget;
  conversionRate: CartDashboardWidget;
  totalValue: CartDashboardWidget;
  averageCartValue: CartDashboardWidget;
  recoveryRate: CartDashboardWidget;
  revenueRecovered: CartDashboardWidget;
}