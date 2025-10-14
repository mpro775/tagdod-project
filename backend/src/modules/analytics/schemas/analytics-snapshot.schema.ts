import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnalyticsSnapshotDocument = HydratedDocument<AnalyticsSnapshot>;

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Schema({ timestamps: true })
export class AnalyticsSnapshot {
  @Prop({ required: true, index: true })
  date!: Date;

  @Prop({
    type: String,
    enum: PeriodType,
    required: true,
    index: true
  })
  period!: PeriodType;

  // User Analytics
  @Prop({ type: Object, default: {} })
  users!: {
    total: number;
    active: number;
    new: number;
    customers: number;
    engineers: number;
    admins: number;
    verified: number;
    suspended: number;
  };

  // Product Analytics
  @Prop({ type: Object, default: {} })
  products!: {
    total: number;
    active: number;
    featured: number;
    new: number;
    byCategory: Record<string, number>;
    averageRating: number;
    topRated: Array<{ productId: string; name: string; rating: number; sales: number }>;
    lowStock: Array<{ productId: string; name: string; stock: number }>;
  };

  // Order Analytics
  @Prop({ type: Object, default: {} })
  orders!: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    processing: number;
    shipped: number;
    delivered: number;
    totalRevenue: number;
    averageOrderValue: number;
    byStatus: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    topProducts: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
    revenueByCategory: Record<string, number>;
  };

  // Service Analytics
  @Prop({ type: Object, default: {} })
  services!: {
    totalRequests: number;
    open: number;
    assigned: number;
    completed: number;
    cancelled: number;
    averageRating: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    topEngineers: Array<{ engineerId: string; name: string; completedJobs: number; rating: number }>;
    responseTime: {
      average: number; // in hours
      fastest: number;
      slowest: number;
    };
    completionTime: {
      average: number; // in days
      fastest: number;
      slowest: number;
    };
  };

  // Support Analytics
  @Prop({ type: Object, default: {} })
  support!: {
    totalTickets: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    averageResolutionTime: number; // in hours
    customerSatisfaction: number; // average rating
    firstResponseTime: number; // in hours
    topAgents: Array<{ agentId: string; name: string; resolvedTickets: number; rating: number }>;
    backlogTrend: number[]; // last 30 days
  };

  // File Upload Analytics
  @Prop({ type: Object, default: {} })
  files!: {
    totalUploads: number;
    totalSize: number; // in bytes
    byType: Record<string, number>;
    storageUsed: number; // in bytes
    downloads: number;
    popularFiles: Array<{ filename: string; downloads: number; size: number }>;
  };

  // Revenue Analytics
  @Prop({ type: Object, default: {} })
  revenue!: {
    total: number;
    byMonth: Record<string, number>;
    byCategory: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    refunds: number;
    netRevenue: number;
    growthRate: number; // percentage
    projections: {
      nextMonth: number;
      nextQuarter: number;
      nextYear: number;
    };
  };

  // Geographic Analytics
  @Prop({ type: Object, default: {} })
  geography!: {
    byCountry: Record<string, number>;
    byCity: Record<string, number>;
    serviceAreas: Array<{ name: string; requests: number; revenue: number }>;
    topLocations: Array<{ location: string; orders: number; revenue: number }>;
  };

  // Performance Analytics
  @Prop({ type: Object, default: {} })
  performance!: {
    apiResponseTime: number; // in ms
    errorRate: number; // percentage
    uptime: number; // percentage
    concurrentUsers: number;
    peakHours: Array<{ hour: number; users: number; orders: number }>;
    slowestEndpoints: Array<{ endpoint: string; averageTime: number; calls: number }>;
  };

  // Custom KPIs
  @Prop({ type: Object, default: {} })
  kpis!: {
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    churnRate: number;
    retentionRate: number;
    conversionRate: number;
    basketAbandonmentRate: number;
    repeatPurchaseRate: number;
    netPromoterScore: number;
  };

  // Metadata
  @Prop({ type: Object, default: {} })
  metadata!: {
    calculationTime: number; // in ms
    dataFreshness: Date;
    version: string;
    notes?: string;
  };
}

export const AnalyticsSnapshotSchema = SchemaFactory.createForClass(AnalyticsSnapshot);

// Indexes for better query performance
AnalyticsSnapshotSchema.index({ date: 1, period: 1 }, { unique: true });
AnalyticsSnapshotSchema.index({ period: 1, date: -1 });
AnalyticsSnapshotSchema.index({ 'orders.totalRevenue': -1 });
AnalyticsSnapshotSchema.index({ 'users.total': -1 });
