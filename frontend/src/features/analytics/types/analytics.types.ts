// Analytics Types - متطابق 100% مع Backend

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum ReportType {
  DAILY_REPORT = 'daily_report',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  QUARTERLY_REPORT = 'quarterly_report',
  YEARLY_REPORT = 'yearly_report',
  CUSTOM_REPORT = 'custom_report',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum ReportCategory {
  SALES = 'sales',
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  INVENTORY = 'inventory',
  FINANCIAL = 'financial',
  MARKETING = 'marketing',
}

// Dashboard Data
export interface DashboardData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  kpis: {
    revenueGrowth: number;
    userGrowth: number;
    orderGrowth: number;
    conversionRate: number;
  };
  revenueCharts: {
    daily: Array<{ date: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
    byCategory: Array<{ category: string; revenue: number }>;
    byPaymentMethod: Array<{ method: string; amount: number }>;
  };
  userCharts: {
    registrations: Array<{ date: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    activeUsers: Array<{ date: string; count: number }>;
  };
  productCharts: {
    topSelling: Array<{ product: string; sales: number; revenue: number }>;
    byCategory: Array<{ category: string; count: number }>;
    lowStock: Array<{ product: string; stock: number }>;
  };
  serviceCharts?: {
    requests: Array<{ date: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    topEngineers: Array<{ name: string; jobs: number; rating: number }>;
  };
  supportCharts?: {
    tickets: Array<{ date: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
    satisfactionRate: number;
  };
}

// Query DTOs
export interface AnalyticsQueryDto {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
  compareWithPrevious?: boolean;
}

export interface ReportGenerationDto {
  reportType: ReportType;
  formats?: ReportFormat[];
  startDate?: string;
  endDate?: string;
  filters?: Record<string, unknown>;
  includeCharts?: boolean;
  includeRawData?: boolean;
}

// Sales Analytics
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDate: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  salesByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  topProducts: Array<{
    product: string;
    sales: number;
    revenue: number;
  }>;
}

// Product Performance
export interface ProductPerformance {
  totalProducts: number;
  totalSales: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    rating: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    sales: number;
  }>;
}

// Customer Analytics
export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerLifetimeValue: number;
  topCustomers: Array<{
    id: string;
    name: string;
    orders: number;
    totalSpent: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
}

// Inventory Report
export interface InventoryReport {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
  byCategory: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  movements: Array<{
    date: string;
    type: 'in' | 'out';
    quantity: number;
  }>;
}

// Financial Report
export interface FinancialReport {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  cashFlow: Array<{
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }>;
  revenueBySource: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
}

// Cart Analytics
export interface CartAnalytics {
  totalCarts: number;
  activeCarts: number;
  abandonedCarts: number;
  conversionRate: number;
  averageCartValue: number;
  abandonedRevenue: number;
  topAbandonedProducts: Array<{
    product: string;
    count: number;
  }>;
}

// Marketing Report
export interface MarketingReport {
  totalCampaigns: number;
  activeCampaigns: number;
  totalCoupons: number;
  totalDiscountGiven: number;
  roi: number;
  conversionRate: number;
  topCoupons: Array<{
    code: string;
    uses: number;
    revenue: number;
  }>;
  campaignPerformance: Array<{
    campaign: string;
    reach: number;
    conversions: number;
    revenue: number;
  }>;
}

// Real-Time Metrics
export interface RealTimeMetrics {
  activeUsers: number;
  todaySales: number;
  monthSales: number;
  todayOrders: number;
  todayNewCustomers: number;
  activeOrders: number;
  pendingOrders: number;
  todayAbandonedCarts: number;
  lowStockAlerts: number;
  pendingSupportTickets: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  lastUpdated: Date;
}

// Advanced Report
export interface AdvancedReport {
  reportId: string;
  category: ReportCategory;
  title: string;
  description: string;
  generatedBy: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  data: Record<string, unknown>;
  insights: string[];
  recommendations: string[];
  fileUrls?: string[];
  isArchived: boolean;
}

// Performance Metrics
export interface PerformanceMetrics {
  averageApiResponseTime: number;
  slowestApiResponseTime: number;
  fastestApiResponseTime: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  databaseStats: {
    totalCollections: number;
    totalDocuments: number;
    databaseSize: number;
    indexSize: number;
  };
  slowestEndpoints: Array<{
    endpoint: string;
    method: string;
    averageTime: number;
    maxTime: number;
    callCount: number;
  }>;
}

// Export DTO
export interface ExportReportDto {
  format: ReportFormat;
  includeCharts?: boolean;
  includeRawData?: boolean;
}

// List Params
export interface ListReportsParams {
  page?: number;
  limit?: number;
  category?: ReportCategory;
}
