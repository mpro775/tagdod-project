import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ReportCategory, ReportPriority } from '../schemas/advanced-report.schema';
import { PeriodType } from '../schemas/analytics-snapshot.schema';

// ===== Generate Advanced Report DTO =====
export class GenerateAdvancedReportDto {
  @ApiProperty({
    description: 'عنوان التقرير',
    example: 'تقرير المبيعات الشهري',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'عنوان التقرير بالإنجليزية',
    example: 'Monthly Sales Report',
  })
  @IsString()
  titleEn!: string;

  @ApiProperty({
    description: 'وصف التقرير',
    example: 'تقرير شامل للمبيعات والإيرادات خلال الشهر',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'فئة التقرير',
    enum: ReportCategory,
    example: ReportCategory.SALES,
  })
  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @ApiProperty({
    description: 'أولوية التقرير',
    enum: ReportPriority,
    example: ReportPriority.MEDIUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReportPriority)
  priority?: ReportPriority;

  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'الفلاتر المطبقة',
    example: { categories: ['solar_panels'], brands: ['brand1'] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  filters?: {
    categories?: string[];
    brands?: string[];
    regions?: string[];
    channels?: string[];
    status?: string[];
    customFilters?: Record<string, unknown>;
  };

  @ApiProperty({
    description: 'إعدادات التصدير',
    example: {
      formats: ['pdf', 'excel'],
      includeCharts: true,
      includeRawData: false,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
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

  @ApiProperty({
    description: 'مقارنة مع الفترة السابقة',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  compareWithPrevious?: boolean;

  @ApiProperty({
    description: 'تضمين توصيات',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean;

  @ApiProperty({
    description: 'إنشاء رسوم بيانية',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  generateCharts?: boolean;
}

// ===== Sales Report Query DTO =====
export class SalesReportQueryDto {
  @ApiProperty({
    description: 'الفترة الزمنية',
    enum: PeriodType,
    example: PeriodType.MONTHLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(PeriodType)
  period?: PeriodType;

  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'التصنيفات',
    type: [String],
    example: ['solar_panels', 'inverters'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({
    description: 'البراندات',
    type: [String],
    example: ['brand1', 'brand2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];

  @ApiProperty({
    description: 'المناطق',
    type: [String],
    example: ['Riyadh', 'Jeddah'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiProperty({
    description: 'طريقة الدفع',
    type: [String],
    example: ['COD', 'ONLINE'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethods?: string[];

  @ApiProperty({
    description: 'حالة الطلب',
    type: [String],
    example: ['COMPLETED', 'DELIVERED'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  orderStatus?: string[];

  @ApiProperty({
    description: 'تجميع البيانات حسب',
    example: 'daily',
    enum: ['daily', 'weekly', 'monthly'],
    required: false,
  })
  @IsOptional()
  @IsString()
  groupBy?: 'daily' | 'weekly' | 'monthly';
}

// ===== Product Performance Query DTO =====
export class ProductPerformanceQueryDto {
  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'عدد النتائج',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'الترتيب حسب',
    example: 'sales',
    enum: ['sales', 'revenue', 'views', 'rating'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'sales' | 'revenue' | 'views' | 'rating';

  @ApiProperty({
    description: 'اتجاه الترتيب',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    description: 'التصنيف',
    example: 'solar_panels',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'البراند',
    example: 'brand1',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({
    description: 'الحالة',
    example: 'active',
    enum: ['active', 'inactive', 'out_of_stock'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

// ===== Customer Analytics Query DTO =====
export class CustomerAnalyticsQueryDto {
  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'نوع العميل',
    example: 'retail',
    enum: ['retail', 'wholesale', 'engineer'],
    required: false,
  })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiProperty({
    description: 'المنطقة',
    example: 'Riyadh',
    required: false,
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({
    description: 'القطاع',
    example: 'new',
    enum: ['new', 'returning', 'vip', 'churned'],
    required: false,
  })
  @IsOptional()
  @IsString()
  segment?: string;

  @ApiProperty({
    description: 'عدد النتائج',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ===== Inventory Report Query DTO =====
export class InventoryReportQueryDto {
  @ApiProperty({
    description: 'التصنيف',
    example: 'solar_panels',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'البراند',
    example: 'brand1',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({
    description: 'حالة المخزون',
    example: 'low',
    enum: ['all', 'in_stock', 'low', 'out_of_stock'],
    required: false,
  })
  @IsOptional()
  @IsString()
  stockStatus?: 'all' | 'in_stock' | 'low' | 'out_of_stock';

  @ApiProperty({
    description: 'قيمة المخزون الدنيا',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiProperty({
    description: 'قيمة المخزون القصوى',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiProperty({
    description: 'تضمين المنتجات المتوقفة',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeDiscontinued?: boolean;
}

// ===== Financial Report Query DTO =====
export class FinancialReportQueryDto {
  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'العملة',
    example: 'YER',
    enum: ['YER', 'SAR', 'USD'],
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'تضمين التوقعات',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeProjections?: boolean;

  @ApiProperty({
    description: 'تضمين تحليل التدفق النقدي',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeCashFlow?: boolean;

  @ApiProperty({
    description: 'تجميع البيانات حسب',
    example: 'monthly',
    enum: ['daily', 'weekly', 'monthly', 'quarterly'],
    required: false,
  })
  @IsOptional()
  @IsString()
  groupBy?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

// ===== Cart Analytics Query DTO =====
export class CartAnalyticsQueryDto {
  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'حالة السلة',
    example: 'abandoned',
    enum: ['all', 'active', 'abandoned', 'converted'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: 'all' | 'active' | 'abandoned' | 'converted';

  @ApiProperty({
    description: 'تضمين تحليل الإسترداد',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeRecovery?: boolean;

  @ApiProperty({
    description: 'عدد المنتجات الأكثر إهمالاً',
    example: 10,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  topAbandonedLimit?: number;
}

// ===== Marketing Report Query DTO =====
export class MarketingReportQueryDto {
  @ApiProperty({
    description: 'تاريخ البداية',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'تاريخ النهاية',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'نوع الحملة',
    example: 'email',
    enum: ['all', 'email', 'social', 'search', 'display'],
    required: false,
  })
  @IsOptional()
  @IsString()
  campaignType?: string;

  @ApiProperty({
    description: 'تضمين تحليل الكوبونات',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeCoupons?: boolean;

  @ApiProperty({
    description: 'تضمين مصادر الزيارات',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeTrafficSources?: boolean;

  @ApiProperty({
    description: 'تضمين حساب ROI',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  calculateROI?: boolean;
}

// ===== Export Report DTO =====
export class ExportReportDto {
  @ApiProperty({
    description: 'معرف التقرير',
    example: 'REP-2024-00001',
  })
  @IsString()
  reportId!: string;

  @ApiProperty({
    description: 'التنسيق',
    example: 'pdf',
    enum: ['pdf', 'excel', 'csv', 'json'],
  })
  @IsEnum(['pdf', 'excel', 'csv', 'json'])
  format!: 'pdf' | 'excel' | 'csv' | 'json';

  @ApiProperty({
    description: 'تضمين الرسوم البيانية',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @ApiProperty({
    description: 'تضمين البيانات الخام',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;
}

// ===== Real-Time Metrics DTO =====
export class RealTimeMetricsDto {
  @ApiProperty({
    description: 'المستخدمون النشطون الآن',
    example: 150,
  })
  activeUsers!: number;

  @ApiProperty({
    description: 'الطلبات النشطة',
    example: 25,
  })
  activeOrders!: number;

  @ApiProperty({
    description: 'المبيعات اليوم',
    example: 125000,
  })
  todaySales!: number;

  @ApiProperty({
    description: 'المبيعات هذا الشهر',
    example: 2500000,
  })
  monthSales!: number;

  @ApiProperty({
    description: 'الطلبات اليوم',
    example: 45,
  })
  todayOrders!: number;

  @ApiProperty({
    description: 'العملاء الجدد اليوم',
    example: 12,
  })
  todayNewCustomers!: number;

  @ApiProperty({
    description: 'معدل التحويل الحالي',
    example: 3.5,
  })
  currentConversionRate!: number;

  @ApiProperty({
    description: 'متوسط قيمة الطلب الحالي',
    example: 2777.78,
  })
  currentAverageOrderValue!: number;

  @ApiProperty({
    description: 'السلل المهجورة اليوم',
    example: 18,
  })
  todayAbandonedCarts!: number;

  @ApiProperty({
    description: 'آخر 10 طلبات',
  })
  recentOrders!: Array<{
    orderId: string;
    orderNumber: string;
    amount: number;
    status: string;
    createdAt: Date;
  }>;

  @ApiProperty({
    description: 'المنتجات الأكثر مشاهدة اليوم',
  })
  topViewedProducts!: Array<{
    productId: string;
    name: string;
    views: number;
  }>;

  @ApiProperty({
    description: 'صحة النظام',
    example: 98.5,
  })
  systemHealth!: number;

  @ApiProperty({
    description: 'آخر تحديث',
  })
  lastUpdated!: Date;
}

