export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export interface CommissionsReportParams {
  period: ReportPeriod;
  dateFrom?: string;
  dateTo?: string;
  engineerId?: string;
}

export interface CommissionsReportSummary {
  totalEngineers: number;
  totalCommissions: number;
  totalSales: number;
  totalRevenue: number;
}

export interface CommissionTransaction {
  transactionId: string;
  orderId: string;
  amount: number;
  createdAt: string | Date;
}

export interface CouponCommissionData {
  couponCode: string;
  couponName: string;
  commissionRate: number;
  totalCommission: number;
  totalSales: number;
  totalRevenue: number;
  transactions: CommissionTransaction[];
}

export interface EngineerCommissionData {
  engineerId: string;
  engineerName: string;
  engineerPhone: string;
  coupons: CouponCommissionData[];
  totals: {
    totalCommission: number;
    totalSales: number;
    totalRevenue: number;
  };
}

export interface PeriodBreakdown {
  period: string;
  totalCommission: number;
  totalSales: number;
  totalRevenue: number;
}

export interface CommissionsReport {
  period: ReportPeriod;
  dateFrom: string | Date;
  dateTo: string | Date;
  summary: CommissionsReportSummary;
  engineers: EngineerCommissionData[];
  periodBreakdown: PeriodBreakdown[];
}

export interface AccountStatementParams {
  dateFrom: string;
  dateTo: string;
}

export interface AccountStatementSummary {
  totalCommissions: number;
  totalWithdrawals: number;
  totalRefunds: number;
  netAmount: number;
}

export interface AccountTransaction {
  transactionId: string;
  type: 'commission' | 'withdrawal' | 'refund';
  amount: number;
  orderId?: string;
  couponCode?: string;
  description?: string;
  createdAt: string | Date;
}

export interface CouponBreakdown {
  couponCode: string;
  couponName: string;
  commissionRate: number;
  totalCommission: number;
  transactionCount: number;
}

export interface AccountStatement {
  engineerId: string;
  engineerName: string;
  engineerPhone: string;
  dateFrom: string | Date;
  dateTo: string | Date;
  openingBalance: number;
  closingBalance: number;
  summary: AccountStatementSummary;
  transactions: AccountTransaction[];
  couponBreakdown: CouponBreakdown[];
}

