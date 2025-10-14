import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AdvancedReportDocument = HydratedDocument<AdvancedReport>;

export enum ReportCategory {
  SALES = 'sales',
  PRODUCTS = 'products',
  CUSTOMERS = 'customers',
  FINANCIAL = 'financial',
  MARKETING = 'marketing',
  OPERATIONS = 'operations',
  INVENTORY = 'inventory',
  CUSTOM = 'custom',
}

export enum ReportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({ timestamps: true })
export class AdvancedReport {
  @Prop({ required: true })
  reportId!: string; // REP-2024-00001

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  titleEn!: string;

  @Prop()
  description?: string;

  @Prop()
  descriptionEn?: string;

  @Prop({ type: String, enum: Object.values(ReportCategory), required: true, index: true })
  category!: ReportCategory;

  @Prop({ type: String, enum: Object.values(ReportPriority), default: ReportPriority.MEDIUM })
  priority!: ReportPriority;

  // ===== Date Range =====
  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  @Prop({ type: Date, required: true })
  generatedAt!: Date;

  // ===== Creator Info =====
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop()
  creatorName?: string;

  // ===== Report Data =====
  @Prop({ type: Object, required: true })
  summary!: {
    totalRecords: number;
    totalValue: number;
    currency: string;
    growth?: number; // نسبة النمو
    comparison?: {
      previousPeriod: number;
      difference: number;
      percentageChange: number;
    };
  };

  // ===== Sales Analytics =====
  @Prop({ type: Object })
  salesAnalytics?: {
    totalSales: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalDiscount: number;
    netRevenue: number;
    topSellingProducts: Array<{
      productId: string;
      name: string;
      quantity: number;
      revenue: number;
    }>;
    salesByDate: Array<{
      date: string;
      sales: number;
      orders: number;
      revenue: number;
    }>;
    salesByCategory: Array<{
      categoryId: string;
      categoryName: string;
      sales: number;
      revenue: number;
      percentage: number;
    }>;
    salesByRegion: Array<{
      region: string;
      city: string;
      sales: number;
      revenue: number;
    }>;
    paymentMethods: Array<{
      method: string;
      count: number;
      amount: number;
      percentage: number;
    }>;
  };

  // ===== Product Analytics =====
  @Prop({ type: Object })
  productAnalytics?: {
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    lowStock: number;
    topPerformers: Array<{
      productId: string;
      name: string;
      views: number;
      sales: number;
      revenue: number;
      rating: number;
    }>;
    underPerformers: Array<{
      productId: string;
      name: string;
      views: number;
      sales: number;
      lastSold?: Date;
    }>;
    categoryBreakdown: Array<{
      categoryId: string;
      name: string;
      productCount: number;
      totalSales: number;
      revenue: number;
    }>;
    brandBreakdown: Array<{
      brandId: string;
      name: string;
      productCount: number;
      totalSales: number;
      revenue: number;
    }>;
    inventoryValue: number;
    averageProductRating: number;
  };

  // ===== Customer Analytics =====
  @Prop({ type: Object })
  customerAnalytics?: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
    averageLifetimeValue: number;
    topCustomers: Array<{
      userId: string;
      name: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: Date;
    }>;
    customersByRegion: Array<{
      region: string;
      count: number;
      percentage: number;
    }>;
    customerSegmentation: Array<{
      segment: string;
      count: number;
      revenue: number;
      averageOrderValue: number;
    }>;
    churnRate: number;
    newVsReturning: {
      new: number;
      returning: number;
      newPercentage: number;
      returningPercentage: number;
    };
  };

  // ===== Financial Analytics =====
  @Prop({ type: Object })
  financialAnalytics?: {
    grossRevenue: number;
    netRevenue: number;
    totalCosts: number;
    grossProfit: number;
    grossMargin: number;
    totalDiscounts: number;
    totalRefunds: number;
    totalShipping: number;
    totalTax: number;
    revenueByChannel: Array<{
      channel: string;
      revenue: number;
      percentage: number;
    }>;
    profitByCategory: Array<{
      categoryId: string;
      name: string;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }>;
    cashFlow: Array<{
      date: string;
      inflow: number;
      outflow: number;
      net: number;
    }>;
    projections: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
    };
  };

  // ===== Marketing Analytics =====
  @Prop({ type: Object })
  marketingAnalytics?: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalCouponsUsed: number;
    couponDiscounts: number;
    conversionRate: number;
    topCoupons: Array<{
      code: string;
      uses: number;
      discount: number;
      revenue: number;
    }>;
    trafficSources: Array<{
      source: string;
      visits: number;
      conversions: number;
      revenue: number;
    }>;
    campaignPerformance: Array<{
      campaignId: string;
      name: string;
      impressions: number;
      clicks: number;
      conversions: number;
      cost: number;
      revenue: number;
      roi: number;
    }>;
    emailMarketing: {
      sent: number;
      opened: number;
      clicked: number;
      converted: number;
      revenue: number;
    };
  };

  // ===== Operational Analytics =====
  @Prop({ type: Object })
  operationalAnalytics?: {
    orderFulfillment: {
      averageProcessingTime: number; // hours
      averageDeliveryTime: number; // days
      onTimeDeliveryRate: number; // percentage
      totalShipments: number;
      pendingShipments: number;
    };
    returnAnalytics: {
      totalReturns: number;
      returnRate: number;
      topReturnReasons: Array<{
        reason: string;
        count: number;
        percentage: number;
      }>;
      returnsByProduct: Array<{
        productId: string;
        name: string;
        returns: number;
        rate: number;
      }>;
    };
    supportMetrics: {
      totalTickets: number;
      openTickets: number;
      resolvedTickets: number;
      averageResolutionTime: number;
      customerSatisfaction: number;
    };
    inventoryMetrics: {
      turnoverRate: number;
      stockoutRate: number;
      excessInventory: number;
      inventoryAccuracy: number;
    };
  };

  // ===== Cart & Checkout Analytics =====
  @Prop({ type: Object })
  cartAnalytics?: {
    totalCarts: number;
    activeCarts: number;
    abandonedCarts: number;
    abandonmentRate: number;
    recoveredCarts: number;
    recoveryRate: number;
    averageCartValue: number;
    averageCartItems: number;
    conversionRate: number;
    checkoutDropoffRate: number;
    abandonedCartValue: number;
    topAbandonedProducts: Array<{
      productId: string;
      name: string;
      abandonedCount: number;
      lostRevenue: number;
    }>;
  };

  // ===== Insights & Recommendations =====
  @Prop({ type: [String], default: [] })
  insights!: string[];

  @Prop({ type: [String], default: [] })
  insightsEn!: string[];

  @Prop({ type: [String], default: [] })
  recommendations!: string[];

  @Prop({ type: [String], default: [] })
  recommendationsEn!: string[];

  @Prop({ type: [Object], default: [] })
  alerts!: Array<{
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    messageEn: string;
    severity: 'low' | 'medium' | 'high';
    actionRequired?: boolean;
  }>;

  // ===== Charts Data =====
  @Prop({ type: Object })
  chartsData?: {
    timeSeries: Array<{
      date: string;
      value: number;
      label?: string;
    }>;
    pieCharts: Array<{
      label: string;
      value: number;
      percentage: number;
      color?: string;
    }>;
    barCharts: Array<{
      label: string;
      value: number;
      category?: string;
    }>;
    lineCharts: Array<{
      date: string;
      series: Array<{
        name: string;
        value: number;
      }>;
    }>;
  };

  // ===== Export Files =====
  @Prop({ type: [String], default: [] })
  exportedFiles!: Array<string>; // URLs to PDF, Excel, CSV files

  @Prop({ type: Object })
  exportSettings?: {
    formats: Array<'pdf' | 'excel' | 'csv' | 'json'>;
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

  // ===== Filters Applied =====
  @Prop({ type: Object })
  filters?: {
    dateRange: {
      start: Date;
      end: Date;
    };
    categories?: string[];
    brands?: string[];
    regions?: string[];
    channels?: string[];
    status?: string[];
    customFilters?: Record<string, unknown>;
  };

  // ===== Status & Sharing =====
  @Prop({ default: 'completed' })
  status!: 'generating' | 'completed' | 'failed' | 'scheduled';

  @Prop()
  failureReason?: string;

  @Prop({ default: false })
  isPublic!: boolean;

  @Prop({ default: false })
  isArchived!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  sharedWith!: Types.ObjectId[];

  @Prop({ type: [Object], default: [] })
  accessLog!: Array<{
    userId: Types.ObjectId;
    accessedAt: Date;
    action: string;
  }>;

  // ===== Metadata =====
  @Prop({ type: Object })
  metadata?: {
    processingTime: number; // milliseconds
    dataSourceVersion: string;
    reportVersion: string;
    generationMode: 'manual' | 'scheduled' | 'automated';
    tags?: string[];
    notes?: string;
  };

  // ===== Comparison with Previous Period =====
  @Prop({ type: Object })
  previousPeriodComparison?: {
    enabled: boolean;
    startDate: Date;
    endDate: Date;
    metrics: Record<string, {
      current: number;
      previous: number;
      change: number;
      percentageChange: number;
    }>;
  };

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const AdvancedReportSchema = SchemaFactory.createForClass(AdvancedReport);

// Indexes for better performance
AdvancedReportSchema.index({ reportId: 1 }, { unique: true });
AdvancedReportSchema.index({ createdBy: 1, createdAt: -1 });
AdvancedReportSchema.index({ category: 1, createdAt: -1 });
AdvancedReportSchema.index({ priority: 1, status: 1 });
AdvancedReportSchema.index({ startDate: 1, endDate: 1 });
AdvancedReportSchema.index({ status: 1, createdAt: -1 });
AdvancedReportSchema.index({ isArchived: 1, createdAt: -1 });
AdvancedReportSchema.index({ 'metadata.tags': 1 });

