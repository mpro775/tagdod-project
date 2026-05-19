// Analytics Types - متطابق 100% مع Backend

export enum PeriodType {
  // eslint-disable-next-line no-unused-vars
  DAILY = 'daily',
  // eslint-disable-next-line no-unused-vars
  WEEKLY = 'weekly',
  // eslint-disable-next-line no-unused-vars
  MONTHLY = 'monthly',
  // eslint-disable-next-line no-unused-vars
  QUARTERLY = 'quarterly',
  // eslint-disable-next-line no-unused-vars
  YEARLY = 'yearly',
}

export enum ReportType {
  // eslint-disable-next-line no-unused-vars
  DAILY_REPORT = 'daily_report',
  // eslint-disable-next-line no-unused-vars
  WEEKLY_REPORT = 'weekly_report',
  // eslint-disable-next-line no-unused-vars
  MONTHLY_REPORT = 'monthly_report',
  // eslint-disable-next-line no-unused-vars
  QUARTERLY_REPORT = 'quarterly_report',
  // eslint-disable-next-line no-unused-vars
  YEARLY_REPORT = 'yearly_report',
  // eslint-disable-next-line no-unused-vars
  CUSTOM_REPORT = 'custom_report',
}

export enum ReportFormat {
  // eslint-disable-next-line no-unused-vars
  PDF = 'pdf',
  // eslint-disable-next-line no-unused-vars
  EXCEL = 'xlsx',
  // eslint-disable-next-line no-unused-vars
  XLSX = 'xlsx',
  // eslint-disable-next-line no-unused-vars
  CSV = 'csv',
  // eslint-disable-next-line no-unused-vars
  JSON = 'json',
}

export enum ReportCategory {
  // eslint-disable-next-line no-unused-vars
  SALES = 'sales',
  // eslint-disable-next-line no-unused-vars
  PRODUCTS = 'products',
  // eslint-disable-next-line no-unused-vars
  CUSTOMERS = 'customers',
  // eslint-disable-next-line no-unused-vars
  INVENTORY = 'inventory',
  // eslint-disable-next-line no-unused-vars
  FINANCIAL = 'financial',
  // eslint-disable-next-line no-unused-vars
  MARKETING = 'marketing',
}

// Dashboard Data
export interface DashboardData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    activeServices?: number;
    openSupportTickets?: number;
    systemHealth?: {
      status: 'healthy' | 'warning' | 'critical' | 'unknown';
      score?: number | null;
      uptime?: number;
      responseTime?: number;
      errorRate?: number;
      lastCheckedAt?: string;
    } | null;
  };
  kpis: {
    revenueGrowth: number;
    userGrowth: number;
    orderGrowth: number;
    conversionRate: number;
    orderConversion?: number;
    customerSatisfaction?: number;
    serviceEfficiency?: number;
    supportResolution?: number;
    systemUptime?: number;
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
  currency?: 'YER' | 'USD' | 'SAR';
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
  salesGrowth?: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  currency?: string;
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
  averageRating: number;
  totalProductsGrowth?: number;
  totalSalesGrowth?: number;
  averageRatingGrowth?: number;
  lowStockGrowth?: number;
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
    minStock?: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    sales: number;
    revenue?: number;
  }>;
}

// Customer Analytics
export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerLifetimeValue: number;
  totalCustomersGrowth?: number; // نمو إجمالي العملاء
  newCustomersGrowth?: number; // نمو العملاء الجدد
  activeCustomersGrowth?: number; // نمو العملاء النشطين
  customerLifetimeValueGrowth?: number; // نمو قيمة العميل
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
  totalProductsGrowth?: number;
  inStockGrowth?: number;
  outOfStockGrowth?: number;
  totalValueGrowth?: number;
  currency?: string;
  productSummary?: {
    totalProducts: number;
    activeProducts: number;
    simpleProducts: number;
    productsWithVariants: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  variantSummary?: {
    totalVariants: number;
    activeVariants: number;
    lowStockVariants: number;
    outOfStockVariants: number;
    affectedProducts: number;
  };
  totals?: {
    lowStockItems: number;
    outOfStockItems: number;
    affectedProducts: number;
  };
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
  revenueGrowth?: number;
  currency?: string;
  cashFlow: Array<{
    date: string;
    revenue: number;
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
  activeCoupons: number;
  totalDiscountGiven: number;
  roi: number;
  conversionRate: number;
  // Growth metrics (نسب النمو مقارنة بالفترة السابقة)
  totalCouponsGrowth?: number;
  totalDiscountGrowth?: number;
  roiGrowth?: number;
  conversionRateGrowth?: number;
  topCoupons: Array<{
    code: string;
    uses: number;
    revenue: number;
    discount?: number;
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
  currentRevenue?: number;
  monthSales?: number;
  todayOrders: number;
  todayNewCustomers?: number;
  activeOrders?: number;
  pendingOrders?: number;
  todayAbandonedCarts?: number;
  lowStockAlerts?: number;
  pendingSupportTickets?: number;
  activeConnections?: number;
  systemHealth: {
    status: string;
    uptime: number;
    responseTime: number;
    apiResponseTime?: number; // backward-compatible alias
    errorRate?: number;
  };
  /** @deprecated Only available if infrastructure monitoring is explicitly configured */
  cpuUsage?: number;
  /** @deprecated Only available if infrastructure monitoring is explicitly configured */
  memoryUsage?: number;
  /** @deprecated Only available if infrastructure monitoring is explicitly configured */
  diskUsage?: number;
  lastUpdated: Date | string;
}

// Advanced Report
export interface AdvancedReport {
  id?: string;
  _id?: string;
  reportId: string;
  category: ReportCategory | string;
  type?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  generatedBy?: string;
  createdBy?: string;
  createdByType?: 'user' | 'system';
  creatorName?: string;
  generatedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  startDate?: Date | string;
  endDate?: Date | string;
  status: ReportStatus | string;
  priority: ReportPriority | string;
  isArchived?: boolean;
  archivedAt?: Date | string | null;
  dataQuality?: DataQuality;
  exports?: ReportExportEntry[];
  fileUrls?: string[];
  period?: {
    start: Date | string;
    end: Date | string;
  };
  data?: Record<string, unknown>;
  insights?: string[];
  recommendations?: string[];
  summary?: {
    totalRecords: number;
    totalValue: number;
    currency: string;
    growth?: number;
  };
  metadata?: {
    processingTime?: number;
    generationMode?: 'manual' | 'scheduled' | 'automated';
    tags?: string[];
  };
  generationDurationMs?: number;
  failureReason?: string;
}

// Performance Metrics
export interface PerformanceMetrics {
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  concurrentUsers?: number;
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
  currency?: 'YER' | 'USD' | 'SAR';
}

// List Params
export interface ListReportsParams {
  page?: number;
  limit?: number;
  category?: ReportCategory;
  search?: string;
}

// Report Priority
export enum ReportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

export enum DataQualityLevel {
  REAL = 'real',
  MIXED = 'mixed',
  ESTIMATED = 'estimated',
  INCOMPLETE = 'incomplete',
  NOT_CONNECTED = 'not_connected',
}

export interface DataQualitySource {
  sales?: 'real' | 'estimated' | 'not_connected';
  products?: 'real' | 'estimated' | 'not_connected';
  customers?: 'real' | 'estimated' | 'not_connected';
  marketing?: 'real' | 'estimated' | 'not_connected';
  inventory?: 'real' | 'estimated' | 'not_connected';
  financial?: 'real' | 'estimated' | 'not_connected';
}

export interface DataQuality {
  overall: 'real' | 'mixed' | 'estimated' | 'incomplete';
  sources: DataQualitySource;
  notes: string[];
}

export interface ReportExportEntry {
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  generatedAt: Date;
  generatedBy: string;
}

export interface ExportFile {
  id?: string;
  reportId?: string;
  reportTitle?: string;
  fileUrl: string;
  fileName: string;
  format: string;
  fileSize?: number;
  exportedAt?: string;
  generatedAt?: string;
  generatedBy?: string;
  status?: 'available' | 'expired' | 'failed' | 'processing' | string;
}

// Schedule Frequency
export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

// Generate Advanced Report DTO
export interface GenerateAdvancedReportDto {
  title: string;
  titleEn: string;
  description?: string;
  descriptionEn?: string;
  category: ReportCategory;
  priority?: ReportPriority;
  startDate: string;
  endDate: string;
  filters?: {
    categories?: string[];
    brands?: string[];
    regions?: string[];
    channels?: string[];
    status?: string[];
    customFilters?: Record<string, unknown>;
  };
  exportSettings?: {
    formats: ReportFormat[];
    includeCharts: boolean;
    includeRawData: boolean;
    customBranding?: {
      logo: string;
      companyName: string;
      colors: {
        primary: string;
        secondary: string;
      };
    };
  };
  compareWithPrevious?: boolean;
  includeRecommendations?: boolean;
  generateCharts?: boolean;
}

// Create Report Schedule DTO
export interface CreateReportScheduleDto {
  name: string;
  description?: string;
  reportType: ReportType;
  frequency: ScheduleFrequency;
  formats?: ReportFormat[];
  recipients?: string[];
  filters?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// Report Schedule interface (from backend)
export interface ReportSchedule {
  id?: string;
  _id: string;
  name: string;
  title?: string;
  description: string;
  reportType: ReportType;
  frequency: ScheduleFrequency;
  formats: ReportFormat[];
  recipients: string[];
  filters: Record<string, unknown>;
  config: Record<string, unknown>;
  isActive: boolean;
  status?: 'active' | 'paused' | 'inactive';
  nextRun?: Date;
  lastRun?: Date;
  nextRunAt?: Date | string | null;
  lastRunAt?: Date | string | null;
  lastResult?: {
    success?: boolean;
    status?: string;
    message?: string;
    executionTime?: number;
    fileUrls?: string[];
    fileUrl?: string;
    reportId?: string;
    error?: string;
    sentAt?: Date;
    generatedAt?: Date | string;
  };
  fileUrls?: string[];
  runCount: number;
  successCount: number;
  failureCount: number;
  createdBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Update Report Schedule DTO
export interface UpdateReportScheduleDto {
  name?: string;
  description?: string;
  reportType?: ReportType;
  frequency?: ScheduleFrequency;
  formats?: ReportFormat[];
  recipients?: string[];
  filters?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

// Schedule Stats
export interface ScheduleStats {
  total: number;
  active: number;
  inactive: number;
  byFrequency: Record<string, number>;
}

// Export Entry (from report)
export interface ReportExportFile {
  _id?: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  generatedAt: Date;
  generatedBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  reportId?: string;
  reportTitle?: string;
  reportType?: string;
}

// List Schedules Params
export interface ListSchedulesParams {
  page?: number;
  limit?: number;
  reportType?: ReportType;
  isActive?: boolean;
  search?: string;
}