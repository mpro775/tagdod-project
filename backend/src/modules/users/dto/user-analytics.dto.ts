import { IsOptional, IsString, IsNumber, IsArray, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ==================== Request DTOs ====================

export class GetUserStatsDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  @IsString()
  userId!: string;
}

export class GetCustomerRankingsDto {
  @ApiPropertyOptional({ description: 'عدد العملاء المراد عرضهم', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 50;
}

export class GetUserAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'تاريخ البداية للتحليل' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'تاريخ النهاية للتحليل' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'نوع التحليل', enum: ['orders', 'favorites', 'support', 'all'] })
  @IsOptional()
  @IsEnum(['orders', 'favorites', 'support', 'all'])
  analyticsType?: 'orders' | 'favorites' | 'support' | 'all' = 'all';
}

// ==================== Response DTOs ====================

export class UserInfoDto {
  @ApiProperty({ description: 'رقم الهاتف' })
  phone!: string;

  @ApiPropertyOptional({ description: 'الاسم الأول' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'الاسم الأخير' })
  lastName?: string;

  @ApiProperty({ description: 'حالة الحساب', enum: ['active', 'suspended', 'pending', 'deleted'] })
  status!: string;

  @ApiProperty({ description: 'أدوار المستخدم' })
  roles!: string[];

  @ApiProperty({ description: 'تاريخ إنشاء الحساب' })
  createdAt!: Date;

  @ApiPropertyOptional({ description: 'آخر تسجيل دخول' })
  lastLogin?: Date;
}

export class OrderStatsDto {
  @ApiProperty({ description: 'إجمالي الطلبات' })
  total!: number;

  @ApiProperty({ description: 'الطلبات المكتملة' })
  completed!: number;

  @ApiProperty({ description: 'الطلبات المعلقة' })
  pending!: number;

  @ApiProperty({ description: 'الطلبات الملغية' })
  cancelled!: number;

  @ApiProperty({ description: 'إجمالي المبلغ المنفق' })
  totalSpent!: number;

  @ApiProperty({ description: 'متوسط قيمة الطلب' })
  averageOrderValue!: number;

  @ApiPropertyOptional({ description: 'تاريخ أول طلب' })
  firstOrderDate?: Date;

  @ApiPropertyOptional({ description: 'تاريخ آخر طلب' })
  lastOrderDate?: Date;

  @ApiProperty({ description: 'الفئات المفضلة' })
  favoriteCategories!: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
}

export class FavoriteStatsDto {
  @ApiProperty({ description: 'إجمالي المفضلة' })
  total!: number;

  @ApiProperty({ description: 'الفئات في المفضلة' })
  categories!: Array<{
    category: string;
    count: number;
  }>;

  @ApiProperty({ description: 'آخر المفضلة المضافة' })
  recentFavorites!: Array<{
    productId: string;
    productName: string;
    addedAt: Date;
  }>;
}

export class SupportStatsDto {
  @ApiProperty({ description: 'إجمالي تذاكر الدعم' })
  totalTickets!: number;

  @ApiProperty({ description: 'التذاكر المفتوحة' })
  openTickets!: number;

  @ApiProperty({ description: 'التذاكر المحلولة' })
  resolvedTickets!: number;

  @ApiPropertyOptional({ description: 'متوسط وقت الاستجابة (بالدقائق)' })
  averageResponseTime?: number;
}

export class UserScoreDto {
  @ApiProperty({ description: 'نقاط الولاء (0-100)' })
  loyaltyScore!: number;

  @ApiProperty({ description: 'نقاط القيمة المالية (0-100)' })
  valueScore!: number;

  @ApiProperty({ description: 'نقاط النشاط (0-100)' })
  activityScore!: number;

  @ApiProperty({ description: 'نقاط خدمة العملاء (0-100)' })
  supportScore!: number;

  @ApiProperty({ description: 'النقاط الإجمالية (0-100)' })
  overallScore!: number;

  @ApiProperty({ description: 'الترتيب بين العملاء' })
  rank!: number;
}

export class UserBehaviorDto {
  @ApiProperty({ description: 'طريقة الدفع المفضلة' })
  preferredPaymentMethod!: string;

  @ApiProperty({ description: 'متوسط تكرار الطلبات (بالأيام)' })
  averageOrderFrequency!: number;

  @ApiProperty({ description: 'الأنماط الموسمية' })
  seasonalPatterns!: Array<{
    month: string;
    orders: number;
    amount: number;
  }>;

  @ApiProperty({ description: 'تفضيلات المنتجات' })
  productPreferences!: Array<{
    category: string;
    percentage: number;
  }>;
}

export class UserPredictionsDto {
  @ApiProperty({ description: 'مخاطر فقدان العميل', enum: ['low', 'medium', 'high'] })
  churnRisk!: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'احتمالية الشراء القادم (0-1)' })
  nextPurchaseProbability!: number;

  @ApiProperty({ description: 'القيمة المتوقعة للعميل' })
  estimatedLifetimeValue!: number;

  @ApiProperty({ description: 'التوصيات المقترحة' })
  recommendedActions!: string[];
}

export class UserDetailedStatsDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  userId!: string;

  @ApiProperty({ description: 'معلومات المستخدم الأساسية' })
  userInfo!: UserInfoDto;

  @ApiProperty({ description: 'إحصائيات الطلبات' })
  orders!: OrderStatsDto;

  @ApiProperty({ description: 'إحصائيات المفضلة' })
  favorites!: FavoriteStatsDto;

  @ApiProperty({ description: 'إحصائيات الدعم' })
  support!: SupportStatsDto;

  @ApiProperty({ description: 'نقاط التقييم' })
  score!: UserScoreDto;

  @ApiProperty({ description: 'تحليل السلوك' })
  behavior!: UserBehaviorDto;

  @ApiProperty({ description: 'التنبؤات والتوصيات' })
  predictions!: UserPredictionsDto;
}

export class CustomerRankingDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  userId!: string;

  @ApiProperty({ description: 'معلومات المستخدم' })
  userInfo!: {
    phone: string;
    firstName?: string;
    lastName?: string;
  };

  @ApiProperty({ description: 'إجمالي المبلغ المنفق' })
  totalSpent!: number;

  @ApiProperty({ description: 'إجمالي الطلبات' })
  totalOrders!: number;

  @ApiPropertyOptional({ description: 'تاريخ آخر طلب' })
  lastOrderDate?: Date;

  @ApiProperty({ description: 'الترتيب' })
  rank!: number;

  @ApiProperty({ description: 'النقاط الإجمالية' })
  score!: number;
}

export class OverallUserAnalyticsDto {
  @ApiProperty({ description: 'إجمالي المستخدمين' })
  totalUsers!: number;

  @ApiProperty({ description: 'المستخدمين النشطين' })
  activeUsers!: number;

  @ApiProperty({ description: 'المستخدمين الجدد هذا الشهر' })
  newUsersThisMonth!: number;

  @ApiProperty({ description: 'أعلى العملاء إنفاقاً' })
  topSpenders!: Array<{
    userId: string;
    totalSpent: number;
  }>;

  @ApiProperty({ description: 'نمو المستخدمين' })
  userGrowth!: Array<{
    month: string;
    newUsers: number;
  }>;

  @ApiProperty({ description: 'متوسط قيمة الطلب' })
  averageOrderValue!: number;

  @ApiProperty({ description: 'القيمة المتوقعة للعميل' })
  customerLifetimeValue!: number;
}

// ==================== Pagination DTOs ====================

export class PaginatedUserStatsDto {
  @ApiProperty({ description: 'بيانات المستخدمين' })
  data!: UserDetailedStatsDto[];

  @ApiProperty({ description: 'معلومات الصفحة' })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class PaginatedCustomerRankingsDto {
  @ApiProperty({ description: 'ترتيب العملاء' })
  data!: CustomerRankingDto[];

  @ApiProperty({ description: 'معلومات الصفحة' })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ==================== Scoring Configuration DTOs ====================

export class ScoringConfigDto {
  @ApiPropertyOptional({ description: 'إعدادات نقاط الولاء' })
  loyalty?: {
    orderWeight?: number;
    completedOrderWeight?: number;
    maxScore?: number;
  };

  @ApiPropertyOptional({ description: 'إعدادات نقاط القيمة' })
  value?: {
    spendingThreshold?: number;
    scorePerThreshold?: number;
    maxScore?: number;
  };

  @ApiPropertyOptional({ description: 'إعدادات نقاط النشاط' })
  activity?: {
    orderWeight?: number;
    noSupportBonus?: number;
    maxScore?: number;
  };

  @ApiPropertyOptional({ description: 'إعدادات نقاط الدعم' })
  support?: {
    ticketPenalty?: number;
    maxScore?: number;
  };
}

// ==================== Filter DTOs ====================

export class UserStatsFilterDto {
  @ApiPropertyOptional({ description: 'تصفية حسب النقاط الدنيا' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @ApiPropertyOptional({ description: 'تصفية حسب النقاط العليا' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore?: number;

  @ApiPropertyOptional({ description: 'تصفية حسب مخاطر فقدان العميل', enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  churnRisk?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ description: 'تصفية حسب حالة الحساب', enum: ['active', 'suspended', 'pending', 'deleted'] })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'pending', 'deleted'])
  status?: 'active' | 'suspended' | 'pending' | 'deleted';

  @ApiPropertyOptional({ description: 'تصفية حسب الدور' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
