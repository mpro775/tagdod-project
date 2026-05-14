export interface ReportTemplate {
  _id: string;
  key: string;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  category: string;
  availableSections: string[];
  availableMetrics: string[];
  availableCharts: string[];
  availableFilters: string[];
  defaultSections: string[];
  defaultFilters?: Record<string, unknown>;
  defaultMetrics: string[];
  defaultCharts: string[];
  isActive: boolean;
  icon?: {
    name: string;
    color: string;
  };
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportTemplateDto {
  key: string;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  category: string;
  availableSections?: string[];
  availableMetrics?: string[];
  availableCharts?: string[];
  availableFilters?: string[];
  defaultSections?: string[];
  defaultFilters?: Record<string, unknown>;
  defaultMetrics?: string[];
  defaultCharts?: string[];
  isActive?: boolean;
}

export interface UpdateReportTemplateDto {
  name?: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  availableSections?: string[];
  availableMetrics?: string[];
  availableCharts?: string[];
  availableFilters?: string[];
  defaultSections?: string[];
  defaultFilters?: Record<string, unknown>;
  defaultMetrics?: string[];
  defaultCharts?: string[];
  isActive?: boolean;
}

export interface GenerateCustomReportDto {
  templateKey: string;
  title: string;
  titleEn: string;
  startDate: string;
  endDate: string;
  sections?: string[];
  metrics?: string[];
  charts?: string[];
  filters?: Record<string, unknown>;
  compareWithPrevious?: boolean;
  includeRecommendations?: boolean;
}

export interface PreviewCustomReportDto {
  templateKey: string;
  startDate: string;
  endDate: string;
  sections?: string[];
  metrics?: string[];
  filters?: Record<string, unknown>;
}

export interface AnalyticsAlert {
  _id: string;
  type: string;
  title: string;
  titleEn: string;
  description?: string;
  descriptionEn?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'ignored';
  source: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: Record<string, unknown>;
  thresholds?: {
    warning?: number;
    critical?: number;
    currentValue?: number;
  };
  suggestedAction?: string;
  suggestedActionEn?: string;
  isRecurring: boolean;
  lastTriggeredAt?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateAlertStatusDto {
  status: 'open' | 'acknowledged' | 'resolved' | 'ignored';
}

export interface AlertStats {
  total: number;
  open: number;
  acknowledged: number;
  resolved: number;
  ignored: number;
  bySeverity: Record<string, number>;
  bySource: Record<string, number>;
}

export interface Insight {
  id: string;
  type: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  source: string;
  value?: number;
  change?: number;
  icon?: string;
  color?: string;
}

export const REPORT_SECTIONS = [
  'summary',
  'kpis',
  'salesTrend',
  'topProducts',
  'salesByCategory',
  'salesByRegion',
  'paymentMethods',
  'customerSegments',
  'topCustomers',
  'newVsReturning',
  'inventory',
  'financial',
  'recommendations',
  'ordersTrend',
  'ordersByStatus',
  'fulfillment',
  'cancellations',
  'underPerformers',
  'categoryBreakdown',
  'brandBreakdown',
  'lowStockAlerts',
  'outOfStockAlerts',
  'turnoverRate',
  'revenueBreakdown',
  'profitAnalysis',
  'cashFlow',
  'projections',
  'campaignPerformance',
  'couponAnalysis',
  'trafficSources',
  'emailMarketing',
  'ticketsByStatus',
  'ticketsByPriority',
  'resolutionTime',
  'satisfaction',
  'apiPerformance',
  'errorRates',
  'resourceUsage',
  'uptime',
] as const;

export const REPORT_METRICS = [
  'totalSales',
  'totalOrders',
  'totalRevenue',
  'averageOrderValue',
  'netRevenue',
  'totalDiscount',
  'growthRate',
  'totalProducts',
  'activeProducts',
  'outOfStock',
  'lowStock',
  'inventoryValue',
  'averageRating',
  'totalCustomers',
  'newCustomers',
  'activeCustomers',
  'returningCustomers',
  'retentionRate',
  'averageLifetimeValue',
  'churnRate',
  'grossRevenue',
  'netRevenue',
  'grossProfit',
  'grossMargin',
  'totalCosts',
  'totalRefunds',
  'totalCampaigns',
  'activeCampaigns',
  'totalCouponsUsed',
  'conversionRate',
  'roi',
  'totalTickets',
  'openTickets',
  'resolvedTickets',
  'averageResolutionTime',
  'customerSatisfaction',
  'apiResponseTime',
  'errorRate',
  'uptime',
] as const;

export const REPORT_CHARTS = [
  'line',
  'bar',
  'pie',
  'area',
  'doughnut',
  'scatter',
  'table',
  'gauge',
] as const;
