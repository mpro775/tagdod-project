export interface Cart {
  _id: string;
  userId?: string;
  deviceId?: string;
  status: CartStatus;
  items: CartItem[];
  pricingSummary?: PricingSummary;
  lastActivityAt?: Date;
  isAbandoned?: boolean;
  abandonmentEmailsSent?: number;
  lastAbandonmentEmailAt?: Date;
  convertedToOrderId?: string;
  convertedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface CartItem {
  _id: string;
  variantId: string;
  qty: number;
  addedAt: Date;
  variant?: {
    _id: string;
    name: string;
    product?: {
      _id: string;
      name: string;
      images?: string[];
    };
  };
}

export interface PricingSummary {
  subtotal: number;
  total: number;
  itemsCount: number;
  currency: string;
  wholesaleDiscountAmount?: number;
  wholesaleDiscountPercent?: number;
}

export enum CartStatus {
  // eslint-disable-next-line no-unused-vars
  ACTIVE = 'active',
  // eslint-disable-next-line no-unused-vars
  ABANDONED = 'abandoned',
  // eslint-disable-next-line no-unused-vars
  CONVERTED = 'converted',
  // eslint-disable-next-line no-unused-vars
  EXPIRED = 'expired',
}

export interface CartFilters {
  status?: CartStatus;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CartAnalytics {
  overview: {
    totalCarts: number;
    activeCarts: number;
    abandonedCarts: number;
    convertedCarts: number;
    avgCartValue: number;
    avgItemsPerCart: number;
    conversionRate: number;
    abandonmentRate: number;
  };
  trends: {
    recentActivity: Array<{
      _id: {
        year: number;
        month: number;
        day: number;
      };
      count: number;
      totalValue: number;
    }>;
    hourlyActivity: Array<{
      _id: number;
      count: number;
      totalValue: number;
    }>;
  };
  insights: {
    topProducts: Array<{
      _id: string;
      totalQuantity: number;
      cartCount: number;
    }>;
    cartValueDistribution: Array<{
      _id: string;
      count: number;
      totalValue: number;
    }>;
  };
  period: number;
}

export interface CartStatistics {
  today: PeriodStats;
  yesterday: PeriodStats;
  lastWeek: PeriodStats;
  allTime: PeriodStats;
}

export interface PeriodStats {
  total: number;
  active: number;
  abandoned: number;
  converted: number;
  totalValue: number;
  conversionRate: number;
  abandonmentRate: number;
}

export interface ConversionRates {
  dailyRates: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    totalCarts: number;
    convertedCarts: number;
    totalValue: number;
    convertedValue: number;
    conversionRate: number;
    date: Date;
  }>;
  averageRate: number;
  period: number;
}

export interface CartPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CartListResponse {
  carts: Cart[];
  pagination: CartPagination;
}

export interface AbandonedCartResponse {
  data: Cart[];
  count: number;
  totalCarts: number;
  totalValue: number;
}

export interface SendReminderResponse {
  success: boolean;
  message: string;
  data: {
    processed: number;
    emailsSent: number;
  };
}
