import { IsEnum, IsOptional, IsDateString, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export class CommissionsReportQueryDto {
  @ApiProperty({
    description: 'نوع الفترة الزمنية',
    enum: ReportPeriod,
    example: ReportPeriod.MONTHLY,
  })
  @IsEnum(ReportPeriod)
  @IsNotEmpty()
  period!: ReportPeriod;

  @ApiPropertyOptional({
    description: 'تاريخ البداية (مطلوب للفترة المخصصة)',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'تاريخ النهاية (مطلوب للفترة المخصصة)',
    example: '2025-01-31',
  })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'معرف المهندس (اختياري - للفلترة)',
    example: '64user123',
  })
  @IsString()
  @IsOptional()
  engineerId?: string;
}

export class CommissionsReportParams {
  period!: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  dateFrom?: Date;
  dateTo?: Date;
  engineerId?: string;
}

export interface CommissionsReportResponse {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  dateFrom: Date;
  dateTo: Date;
  summary: {
    totalEngineers: number;
    totalCommissions: number;
    totalSales: number;
    totalRevenue: number;
  };
  engineers: Array<{
    engineerId: string;
    engineerName: string;
    engineerPhone: string;
    coupons: Array<{
      couponCode: string;
      couponName: string;
      commissionRate: number;
      totalCommission: number;
      totalSales: number;
      totalRevenue: number;
      transactions: Array<{
        transactionId: string;
        orderId: string;
        amount: number;
        createdAt: Date;
      }>;
    }>;
    totals: {
      totalCommission: number;
      totalSales: number;
      totalRevenue: number;
    };
  }>;
  periodBreakdown: Array<{
    period: string;
    totalCommission: number;
    totalSales: number;
    totalRevenue: number;
  }>;
}

export class AccountStatementQueryDto {
  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  dateFrom!: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2025-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  dateTo!: string;
}

export class AccountStatementParams {
  dateFrom!: Date;
  dateTo!: Date;
}

export interface AccountStatementResponse {
  engineerId: string;
  engineerName: string;
  engineerPhone: string;
  dateFrom: Date;
  dateTo: Date;
  openingBalance: number;
  closingBalance: number;
  summary: {
    totalCommissions: number;
    totalWithdrawals: number;
    totalRefunds: number;
    netAmount: number;
  };
  transactions: Array<{
    transactionId: string;
    type: 'commission' | 'withdrawal' | 'refund';
    amount: number;
    orderId?: string;
    couponCode?: string;
    description?: string;
    createdAt: Date;
  }>;
  couponBreakdown: Array<{
    couponCode: string;
    couponName: string;
    commissionRate: number;
    totalCommission: number;
    transactionCount: number;
  }>;
}

