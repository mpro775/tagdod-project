import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ==================== Request DTOs ====================

export class GetActiveUsersDto {
  @ApiPropertyOptional({ description: 'عدد الدقائق للاعتبار نشط', default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(60)
  minutes?: number = 15;

  @ApiPropertyOptional({ description: 'عدد النتائج', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

export class GetInactiveUsersDto {
  @ApiPropertyOptional({ description: 'عدد الأيام للاعتبار غير نشط', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(7)
  @Max(365)
  days?: number = 30;

  @ApiPropertyOptional({ description: 'عدد النتائج', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

export class GetRecentlyActiveUsersDto {
  @ApiPropertyOptional({ description: 'عدد الأيام', default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(90)
  days?: number = 7;

  @ApiPropertyOptional({ description: 'عدد النتائج', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

// ==================== Response DTOs ====================

export class ActiveUserDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  userId!: string;

  @ApiProperty({ description: 'رقم الهاتف' })
  phone!: string;

  @ApiPropertyOptional({ description: 'الاسم الأول' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'الاسم الأخير' })
  lastName?: string;

  @ApiProperty({ description: 'آخر نشاط' })
  lastActivityAt!: Date;

  @ApiProperty({ description: 'الدقائق منذ آخر نشاط' })
  minutesSinceActivity!: number;

  @ApiProperty({ description: 'أدوار المستخدم' })
  roles!: string[];
}

export class InactiveUserDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  userId!: string;

  @ApiProperty({ description: 'رقم الهاتف' })
  phone!: string;

  @ApiPropertyOptional({ description: 'الاسم الأول' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'الاسم الأخير' })
  lastName?: string;

  @ApiProperty({ description: 'آخر نشاط' })
  lastActivityAt!: Date;

  @ApiProperty({ description: 'الأيام منذ آخر نشاط' })
  daysSinceActivity!: number;

  @ApiProperty({ description: 'تاريخ التسجيل' })
  createdAt!: Date;

  @ApiProperty({ description: 'أدوار المستخدم' })
  roles!: string[];
}

export class NeverLoggedInUserDto {
  @ApiProperty({ description: 'معرف المستخدم' })
  userId!: string;

  @ApiProperty({ description: 'رقم الهاتف' })
  phone!: string;

  @ApiPropertyOptional({ description: 'الاسم الأول' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'الاسم الأخير' })
  lastName?: string;

  @ApiProperty({ description: 'تاريخ التسجيل' })
  createdAt!: Date;

  @ApiProperty({ description: 'الأيام منذ التسجيل' })
  daysSinceRegistration!: number;

  @ApiProperty({ description: 'أدوار المستخدم' })
  roles!: string[];
}

export class UserActivityStatsDto {
  @ApiProperty({ description: 'إجمالي المستخدمين' })
  totalUsers!: number;

  @ApiProperty({ description: 'المستخدمين النشطين الآن (آخر 15 دقيقة)' })
  activeNow!: number;

  @ApiProperty({ description: 'المستخدمين النشطين اليوم' })
  activeToday!: number;

  @ApiProperty({ description: 'المستخدمين النشطين هذا الأسبوع (آخر 7 أيام)' })
  activeThisWeek!: number;

  @ApiProperty({ description: 'المستخدمين غير النشطين (أكثر من 30 يوم)' })
  inactiveUsers!: number;

  @ApiProperty({ description: 'المستخدمين الذين لم يدخلوا أبداً' })
  neverLoggedIn!: number;

  @ApiProperty({ description: 'نسبة النشاط (0-100)' })
  activityRate!: number;

  @ApiProperty({ description: 'توزيع المستخدمين حسب النشاط' })
  distribution!: {
    active: number;
    recentlyActive: number;
    inactive: number;
    neverLoggedIn: number;
  };
}

export class PaginatedActiveUsersDto {
  @ApiProperty({ description: 'قائمة المستخدمين النشطين', type: [ActiveUserDto] })
  data!: ActiveUserDto[];

  @ApiProperty({ description: 'معلومات الصفحة' })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PaginatedInactiveUsersDto {
  @ApiProperty({ description: 'قائمة المستخدمين غير النشطين', type: [InactiveUserDto] })
  data!: InactiveUserDto[];

  @ApiProperty({ description: 'معلومات الصفحة' })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PaginatedNeverLoggedInUsersDto {
  @ApiProperty({ description: 'قائمة المستخدمين الذين لم يدخلوا أبداً', type: [NeverLoggedInUserDto] })
  data!: NeverLoggedInUserDto[];

  @ApiProperty({ description: 'معلومات الصفحة' })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
