import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
  HttpException,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,

} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { UserAnalyticsService } from '../services/user-analytics.service';
import { ScoringConfig, UserScoringService } from '../services/user-scoring.service';
import { UserBehaviorService } from '../services/user-behavior.service';
import { UserCacheService } from '../services/user-cache.service';
import { UserErrorService } from '../services/user-error.service';
import {
  GetCustomerRankingsDto,
  UserDetailedStatsDto,
  CustomerRankingDto,
  OverallUserAnalyticsDto,
  UserStatsFilterDto,
  PaginatedUserStatsDto,
} from '../dto/user-analytics.dto';

@ApiTags('تحليلات-المستخدمين')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/user-analytics')
export class UserAnalyticsController {
  constructor(
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly userScoringService: UserScoringService,
    private readonly userBehaviorService: UserBehaviorService,
    private readonly userCacheService: UserCacheService,
    private readonly userErrorService: UserErrorService,
  ) {}

  // ==================== تفاصيل مستخدم واحد ====================

  @Get('user/:userId')
  @ApiOperation({
    summary: 'تحليلات مستخدم مفصلة',
    description: 'استرداد تحليلات شاملة لمستخدم محدد تشمل السلوكيات والإحصائيات والتقييمات'
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب بيانات المستخدم بنجاح',
    type: UserDetailedStatsDto,
  })
  @ApiResponse({ status: 404, description: 'المستخدم غير موجود' })
  async getUserDetailedStats(@Param('userId') userId: string): Promise<UserDetailedStatsDto> {
    try {
      return await this.userAnalyticsService.getUserDetailedStats(userId);
    } catch (error) {
      throw this.userErrorService.handleAnalyticsError(error as Error, {
        userId,
        operation: 'getUserDetailedStats',
      });
    }
  }

  // ==================== ترتيب العملاء ====================

  @Get('rankings')
  @ApiOperation({
    summary: 'ترتيب العملاء حسب القيمة والأداء',
    description: 'يعرض قائمة مرتبة للعملاء حسب المبلغ المنفق وعدد الطلبات',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب ترتيب العملاء بنجاح',
    type: [CustomerRankingDto],
  })
  async getCustomerRankings(@Query() dto: GetCustomerRankingsDto): Promise<CustomerRankingDto[]> {
    try {
      return await this.userAnalyticsService.getCustomerRankings(dto.limit || 50);
    } catch (error) {
      throw this.userErrorService.handleAnalyticsError(error as Error, {
        operation: 'getCustomerRankings',
        additionalInfo: { limit: dto.limit },
      });
    }
  }

  // ==================== إحصائيات عامة ====================

  @Get('overview')
  @ApiOperation({
    summary: 'الإحصائيات العامة للمستخدمين',
    description: 'يعرض إحصائيات شاملة عن جميع المستخدمين في النظام',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب الإحصائيات العامة بنجاح',
    type: OverallUserAnalyticsDto,
  })
  async getOverallAnalytics(): Promise<OverallUserAnalyticsDto> {
    try {
      return await this.userAnalyticsService.getOverallUserAnalytics();
    } catch (error) {
      throw this.userErrorService.handleAnalyticsError(error as Error, {
        operation: 'getOverallAnalytics',
      });
    }
  }

  // ==================== تحليل متقدم ====================

  @Post('analyze')
  @ApiOperation({
    summary: 'تحليل متقدم للمستخدمين',
    description: 'تحليل شامل للمستخدمين حسب المعايير المحددة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم التحليل بنجاح',
    type: PaginatedUserStatsDto,
  })
  async analyzeUsers(
    @Body() filter: UserStatsFilterDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<PaginatedUserStatsDto> {
    try {
      // تطبيق الفلاتر والتحليل المتقدم
      // سيتم تطوير هذا الجزء لاحقاً
      console.log('Filter:', filter, 'Page:', page, 'Limit:', limit); // استخدام المعاملات لتجنب التحذير
      throw new HttpException('هذه الميزة قيد التطوير', HttpStatus.NOT_IMPLEMENTED);
    } catch (error) {
      throw new HttpException(
        `خطأ في التحليل المتقدم: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== تقارير مخصصة ====================

  @Get('reports/top-customers')
  @ApiOperation({
    summary: 'تقرير أفضل العملاء',
    description: 'تقرير مفصل عن أفضل العملاء حسب معايير متعددة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم إنشاء التقرير بنجاح',
  })
  async getTopCustomersReport(
    @Query('period') period: string = 'all', // all, month, quarter, year
    @Query('metric') metric: string = 'spending', // spending, orders, frequency
  ) {
    try {
      // تطبيق معايير التقرير
      const rankings = await this.userAnalyticsService.getCustomerRankings(100);

      return {
        period,
        metric,
        data: rankings,
        generatedAt: new Date(),
        summary: {
          totalCustomers: rankings.length,
          totalValue: rankings.reduce((sum, customer) => sum + customer.totalSpent, 0),
          averageValue:
            rankings.length > 0
              ? rankings.reduce((sum, customer) => sum + customer.totalSpent, 0) / rankings.length
              : 0,
        },
      };
    } catch (error) {
      throw new HttpException(
        `خطأ في إنشاء التقرير: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('reports/customer-segments')
  @ApiOperation({
    summary: 'تقرير شرائح العملاء',
    description: 'تقرير تحليلي لشرائح العملاء المختلفة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم إنشاء التقرير بنجاح',
  })
  async getCustomerSegmentsReport() {
    try {
      const rankings = await this.userAnalyticsService.getCustomerRankings(1000);

      // تقسيم العملاء إلى شرائح
      const segments = {
        vip: rankings.filter((c) => c.totalSpent >= 5000).length,
        premium: rankings.filter((c) => c.totalSpent >= 2000 && c.totalSpent < 5000).length,
        regular: rankings.filter((c) => c.totalSpent >= 500 && c.totalSpent < 2000).length,
        new: rankings.filter((c) => c.totalSpent < 500).length,
      };

      return {
        segments,
        totalCustomers: rankings.length,
        generatedAt: new Date(),
        recommendations: this.generateSegmentRecommendations(segments),
      };
    } catch (error) {
      throw new HttpException(
        `خطأ في إنشاء التقرير: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== تنبيهات وتحذيرات ====================

  @Get('alerts/churn-risk')
  @ApiOperation({
    summary: 'تنبيهات مخاطر فقدان العملاء',
    description: 'قائمة العملاء المعرضين لخطر فقدانهم',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب التنبيهات بنجاح',
  })
  async getChurnRiskAlerts() {
    try {
      // جلب العملاء المعرضين لخطر الفقدان
      const rankings = await this.userAnalyticsService.getCustomerRankings(100);

      const now = new Date();

      // تحليل مخاطر الفقدان بناءً على البيانات الفعلية
      const churnRiskCustomers = rankings.map((customer) => {
        // حساب الأيام منذ آخر طلب
        let lastOrderDays = 0;
        if (customer.lastOrderDate) {
          const lastOrderDate = typeof customer.lastOrderDate === 'string' 
            ? new Date(customer.lastOrderDate) 
            : customer.lastOrderDate;
          const diffTime = now.getTime() - lastOrderDate.getTime();
          lastOrderDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        // تحديد مستوى المخاطرة بناءً على الأيام منذ آخر طلب
        let churnRisk: 'low' | 'medium' | 'high' = 'low';
        let recommendedAction = 'لا يوجد إجراء مطلوب';

        if (lastOrderDays > 90) {
          churnRisk = 'high';
          recommendedAction = 'إرسال عرض خاص أو كوبون خصم لاستعادة العميل';
        } else if (lastOrderDays > 30) {
          churnRisk = 'medium';
          recommendedAction = 'تواصل شخصي مع العميل وإرسال تذكير بالمنتجات الجديدة';
        } else if (lastOrderDays > 14) {
          churnRisk = 'low';
          recommendedAction = 'إرسال تذكير لطيف بالمنتجات الجديدة';
        } else {
          churnRisk = 'low';
          recommendedAction = 'العميل نشط - لا يوجد إجراء مطلوب';
        }

        return {
          ...customer,
          churnRisk,
          lastOrderDays,
          recommendedAction,
        };
      });

      // ترتيب العملاء حسب مستوى المخاطرة (الأعلى أولاً)
      churnRiskCustomers.sort((a, b) => {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        if (riskOrder[a.churnRisk] !== riskOrder[b.churnRisk]) {
          return riskOrder[b.churnRisk] - riskOrder[a.churnRisk];
        }
        return b.lastOrderDays - a.lastOrderDays;
      });

      // إرجاع أفضل 10 عملاء معرضين للخطر
      const topAtRisk = churnRiskCustomers.slice(0, 10);

      return {
        alertType: 'churn_risk',
        customers: topAtRisk,
        totalAtRisk: churnRiskCustomers.filter(c => c.churnRisk !== 'low').length,
        generatedAt: now,
      };
    } catch (error) {
      throw new HttpException(
        `خطأ في جلب التنبيهات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== إدارة إعدادات التقييم ====================

  @Get('scoring/config')
  @ApiOperation({
    summary: 'الحصول على إعدادات التقييم الحالية',
    description: 'يعرض الإعدادات المستخدمة في حساب نقاط المستخدمين',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب إعدادات التقييم بنجاح',
  })
  async getScoringConfig() {
    return this.userScoringService.getConfig();
  }

  @Post('scoring/config')
  @ApiOperation({
    summary: 'تحديث إعدادات التقييم',
    description: 'تحديث الإعدادات المستخدمة في حساب نقاط المستخدمين',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث إعدادات التقييم بنجاح',
  })
  async updateScoringConfig(@Body() config: Partial<ScoringConfig>) {
    this.userScoringService.updateConfig(config);
    return {
      config: this.userScoringService.getConfig(),
      message: 'تم تحديث إعدادات التقييم بنجاح'
    };
  }

  // ==================== إدارة التخزين المؤقت ====================

  @Get('cache/stats')
  @ApiOperation({
    summary: 'الحصول على إحصائيات التخزين المؤقت',
    description: 'يعرض إحصائيات نظام التخزين المؤقت',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب إحصائيات التخزين المؤقت بنجاح',
  })
  async getCacheStats() {
    return this.userCacheService.getStats();
  }

  @Post('cache/clear')
  @ApiOperation({
    summary: 'مسح جميع البيانات من التخزين المؤقت',
    description: 'مسح جميع البيانات المخزنة مؤقتاً',
  })
  @ApiResponse({
    status: 200,
    description: 'تم مسح التخزين المؤقت بنجاح',
  })
  async clearCache() {
    this.userCacheService.clear();
    return {
      message: 'تم مسح التخزين المؤقت بنجاح'
    };
  }

  @Delete('cache/user/:userId')
  @ApiOperation({
    summary: 'مسح بيانات مستخدم من التخزين المؤقت',
    description: 'مسح جميع البيانات المخزنة مؤقتاً لمستخدم معين',
  })
  @ApiResponse({
    status: 200,
    description: 'تم مسح بيانات المستخدم من التخزين المؤقت بنجاح',
  })
  async clearUserCache(@Param('userId') userId: string) {
    const cacheKey = this.userCacheService.createUserKey(userId, 'detailed-stats');
    this.userCacheService.delete(cacheKey);

    return {
      message: `تم مسح بيانات المستخدم ${userId} من التخزين المؤقت بنجاح`
    };
  }

  // ==================== Private Methods ====================

  private generateSegmentRecommendations(segments: {
    vip: number;
    premium: number;
    regular: number;
    new: number;
  }) {
    const recommendations = [];

    if (segments.vip > 0) {
      recommendations.push('العملاء VIP يحتاجون خدمة مخصصة واهتمام خاص');
    }

    if (segments.premium > segments.vip) {
      recommendations.push('فرصة لترقية العملاء Premium إلى VIP');
    }

    if (segments.new > segments.regular) {
      recommendations.push('حملات ترحيبية للعملاء الجدد لزيادة الولاء');
    }

    return recommendations;
  }
}
