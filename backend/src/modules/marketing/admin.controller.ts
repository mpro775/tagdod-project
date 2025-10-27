import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CreatePriceRuleDto, UpdatePriceRuleDto, PreviewPriceRuleDto } from './dto/price-rule.dto';
import { CreateCouponDto, UpdateCouponDto, ListCouponsDto, ValidateCouponDto } from './dto/coupon.dto';
import { CreateBannerDto, UpdateBannerDto, ListBannersDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('إدارة-التسويق')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/marketing')
export class MarketingAdminController {
  constructor(private svc: MarketingService) {}

  @RequirePermissions(AdminPermission.MARKETING_CREATE, AdminPermission.ADMIN_ACCESS)
  @Post('price-rules')
  @ApiOperation({
    summary: 'إنشاء قاعدة تسعير',
    description: 'إنشاء قاعدة تسعير جديدة للتحكم في أسعار المنتجات'
  })
  @ApiBody({ type: CreatePriceRuleDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء قاعدة التسعير بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف قاعدة التسعير' },
            name: { type: 'string', example: 'خصم عيد الفطر', description: 'اسم قاعدة التسعير' },
            type: { type: 'string', enum: ['percentage', 'fixed', 'buy_x_get_y'], example: 'percentage', description: 'نوع قاعدة التسعير' },
            value: { type: 'number', example: 15, description: 'قيمة الخصم' },
            isActive: { type: 'boolean', example: true, description: 'حالة القاعدة' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول'
  })
  async createPriceRule(@Body() dto: CreatePriceRuleDto) {
    const rule = await this.svc.createPriceRule(dto);
    return rule;
  }

  @Get('price-rules')
  @ApiOperation({
    summary: 'قائمة قواعد التسعير',
    description: 'استرداد قائمة بجميع قواعد التسعير المتاحة'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة قواعد التسعير بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف قاعدة التسعير' },
              name: { type: 'string', example: 'خصم عيد الفطر', description: 'اسم قاعدة التسعير' },
              type: { type: 'string', enum: ['percentage', 'fixed', 'buy_x_get_y'], example: 'percentage', description: 'نوع قاعدة التسعير' },
              value: { type: 'number', example: 15, description: 'قيمة الخصم' },
              isActive: { type: 'boolean', example: true, description: 'حالة القاعدة' }
            }
          }
        }
      }
    }
  })
  async listPriceRules() {
    const rules = await this.svc.listPriceRules();
    return rules;
  }

  @Get('price-rules/:id')
  @ApiOperation({
    summary: 'الحصول على قاعدة تسعير',
    description: 'استرداد قاعدة تسعير محددة بالمعرف'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف قاعدة التسعير',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قاعدة التسعير بنجاح'
  })
  @ApiResponse({
    status: 404,
    description: 'قاعدة التسعير غير موجودة'
  })
  async getPriceRule(@Param('id') id: string) {
    const rule = await this.svc.getPriceRule(id);
    return rule;
  }

  @Patch('price-rules/:id')
  @ApiOperation({
    summary: 'تحديث قاعدة تسعير',
    description: 'تحديث قاعدة تسعير موجودة'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف قاعدة التسعير',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdatePriceRuleDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث قاعدة التسعير بنجاح'
  })
  async updatePriceRule(@Param('id') id: string, @Body() dto: UpdatePriceRuleDto) {
    const rule = await this.svc.updatePriceRule(id, dto);
    return rule;
  }

  @Delete('price-rules/:id')
  @ApiOperation({
    summary: 'حذف قاعدة تسعير',
    description: 'حذف قاعدة تسعير من النظام'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف قاعدة التسعير',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف قاعدة التسعير بنجاح'
  })
  async deletePriceRule(@Param('id') id: string) {
    const result = await this.svc.deletePriceRule(id);
    return result;
  }

  @Post('price-rules/:id/toggle')
  @ApiOperation({
    summary: 'تبديل حالة قاعدة تسعير',
    description: 'تفعيل أو إلغاء تفعيل قاعدة تسعير'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف قاعدة التسعير',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم تبديل حالة قاعدة التسعير بنجاح'
  })
  async togglePriceRule(@Param('id') id: string) {
    const rule = await this.svc.togglePriceRule(id);
    return rule;
  }

  @Post('price-rules/preview')
  @ApiOperation({
    summary: 'معاينة قاعدة تسعير',
    description: 'معاينة تأثير قاعدة تسعير على منتج معين'
  })
  @ApiBody({ type: PreviewPriceRuleDto })
  @ApiResponse({
    status: 200,
    description: 'تم إنشاء المعاينة بنجاح'
  })
  async previewPriceRule(@Body() dto: PreviewPriceRuleDto) {
    const result = await this.svc.previewPriceRule(dto);
    return result;
  }

  @Post('coupons')
  @ApiOperation({
    summary: 'إنشاء كوبون',
    description: 'إنشاء كوبون خصم جديد'
  })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الكوبون بنجاح'
  })
  async createCoupon(@Body() dto: CreateCouponDto) {
    const coupon = await this.svc.createCoupon(dto);
    return coupon;
  }

  @Get('coupons')
  @ApiOperation({
    summary: 'قائمة الكوبونات',
    description: 'استرداد قائمة الكوبونات مع إمكانية التصفية'
  })
  @ApiQuery({ type: ListCouponsDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة الكوبونات بنجاح'
  })
  async listCoupons(@Query() dto: ListCouponsDto) {
    const result = await this.svc.listCoupons(dto);
    return result;
  }

  @Get('coupons/analytics')
  @ApiOperation({
    summary: 'إحصائيات الكوبونات',
    description: 'استرداد إحصائيات شاملة عن الكوبونات'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'عدد الأيام للإحصائيات (افتراضي: 30)',
    example: 30
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد إحصائيات الكوبونات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalCoupons: { type: 'number', example: 25 },
            activeCoupons: { type: 'number', example: 15 },
            expiredCoupons: { type: 'number', example: 5 },
            totalUses: { type: 'number', example: 342 },
            totalLimit: { type: 'number', example: 500 },
            usageRate: { type: 'string', example: '68.40' },
            period: { type: 'number', example: 30 }
          }
        }
      }
    }
  })
  async getCouponsAnalytics(@Query('period') period?: number) {
    const analytics = await this.svc.getCouponsAnalytics(period || 30);
    return analytics;
  }

  @Get('coupons/statistics')
  @ApiOperation({
    summary: 'إحصائيات مفصلة للكوبونات',
    description: 'استرداد إحصائيات تفصيلية عن استخدام وأنواع الكوبونات'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'عدد الأيام للإحصائيات (افتراضي: 30)',
    example: 30
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات المفصلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            statusBreakdown: {
              type: 'object',
              properties: {
                active: { type: 'number', example: 15 },
                inactive: { type: 'number', example: 3 },
                expired: { type: 'number', example: 5 },
                scheduled: { type: 'number', example: 2 }
              }
            },
            typeBreakdown: {
              type: 'object',
              properties: {
                percentage: { type: 'number', example: 12 },
                fixed: { type: 'number', example: 8 },
                freeShipping: { type: 'number', example: 5 }
              }
            },
            topUsedCoupons: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  type: { type: 'string', enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'] },
                  discountValue: { type: 'number' },
                  usedCount: { type: 'number' },
                  usageLimit: { type: 'number' }
                }
              }
            },
            period: { type: 'number', example: 30 },
            totalInPeriod: { type: 'number', example: 25 }
          }
        }
      }
    }
  })
  async getCouponsStatistics(@Query('period') period?: number) {
    const statistics = await this.svc.getCouponsStatistics(period || 30);
    return statistics;
  }

  @Get('coupons/:id')
  @ApiOperation({
    summary: 'الحصول على كوبون',
    description: 'استرداد كوبون محدد بالمعرف'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الكوبون',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الكوبون بنجاح'
  })
  async getCoupon(@Param('id') id: string) {
    const coupon = await this.svc.getCoupon(id);
    return coupon;
  }

  @Patch('coupons/:id')
  @ApiOperation({
    summary: 'تحديث كوبون',
    description: 'تحديث كوبون موجود'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الكوبون',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الكوبون بنجاح'
  })
  async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    const coupon = await this.svc.updateCoupon(id, dto);
    return coupon;
  }

  @Delete('coupons/:id')
  @ApiOperation({
    summary: 'حذف كوبون',
    description: 'حذف كوبون من النظام'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الكوبون',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الكوبون بنجاح'
  })
  async deleteCoupon(@Param('id') id: string) {
    const result = await this.svc.deleteCoupon(id);
    return result;
  }

  @Post('coupons/validate')
  @ApiOperation({
    summary: 'التحقق من صحة كوبون',
    description: 'التحقق من صحة كوبون وإمكانية استخدامه'
  })
  @ApiBody({ type: ValidateCouponDto })
  @ApiResponse({
    status: 200,
    description: 'تم التحقق من الكوبون بنجاح'
  })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    const result = await this.svc.validateCoupon(dto);
    return result;
  }

  @Post('banners')
  @ApiOperation({
    summary: 'إنشاء بانر',
    description: 'إنشاء بانر إعلاني جديد'
  })
  @ApiBody({ type: CreateBannerDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء البانر بنجاح'
  })
  async createBanner(@Body() dto: CreateBannerDto) {
    const banner = await this.svc.createBanner(dto);
    return banner;
  }

  @Get('banners')
  @ApiOperation({
    summary: 'قائمة البانرات',
    description: 'استرداد قائمة البانرات الإعلانية'
  })
  @ApiQuery({ type: ListBannersDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة البانرات بنجاح'
  })
  async listBanners(@Query() dto: ListBannersDto) {
    const result = await this.svc.listBanners(dto);
    return result;
  }

  @Get('banners/analytics')
  @ApiOperation({
    summary: 'إحصائيات البانرات',
    description: 'استرداد إحصائيات الأداء للبانرات الإعلانية'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد إحصائيات البانرات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalBanners: { type: 'number', example: 10, description: 'إجمالي عدد البانرات' },
            activeBanners: { type: 'number', example: 7, description: 'عدد البانرات النشطة' },
            totalViews: { type: 'number', example: 5420, description: 'إجمالي المشاهدات' },
            totalClicks: { type: 'number', example: 342, description: 'إجمالي النقرات' },
            averageCTR: { type: 'number', example: 6.31, description: 'متوسط معدل النقر (%)' },
            topPerforming: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  views: { type: 'number' },
                  clicks: { type: 'number' },
                  ctr: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getBannersAnalytics() {
    const analytics = await this.svc.getBannersAnalytics();
    return analytics;
  }

  @Get('banners/:id')
  @ApiOperation({
    summary: 'الحصول على بانر',
    description: 'استرداد بانر محدد بالمعرف'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف البانر',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد البانر بنجاح'
  })
  async getBanner(@Param('id') id: string) {
    const banner = await this.svc.getBanner(id);
    return banner;
  }

  @Patch('banners/:id')
  @ApiOperation({
    summary: 'تحديث بانر',
    description: 'تحديث بانر موجود'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف البانر',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateBannerDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث البانر بنجاح'
  })
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    const banner = await this.svc.updateBanner(id, dto);
    return banner;
  }

  @Delete('banners/:id')
  @ApiOperation({
    summary: 'حذف بانر',
    description: 'حذف بانر من النظام'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف البانر',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف البانر بنجاح'
  })
  async deleteBanner(@Param('id') id: string) {
    const result = await this.svc.deleteBanner(id);
    return result;
  }

  // ==================== Export Coupons Data ====================
  @Post('coupons/export')
  @ApiOperation({
    summary: 'تصدير بيانات الكوبونات',
    description: 'تصدير بيانات الكوبونات وتحليلاتها بصيغ مختلفة (CSV, Excel, JSON)'
  })
  @ApiQuery({
    name: 'format',
    required: false,
    type: String,
    description: 'صيغة الملف (csv, xlsx, json)',
    example: 'csv'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    type: Number,
    description: 'عدد الأيام للتحليلات (افتراضي: 30)',
    example: 30
  })
  @ApiResponse({
    status: 200,
    description: 'تم تصدير البيانات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            fileUrl: { type: 'string', example: 'https://api.example.com/exports/coupons_data_1698765432.csv' },
            format: { type: 'string', example: 'csv' },
            exportedAt: { type: 'string', example: '2024-10-27T12:00:00.000Z' },
            fileName: { type: 'string', example: 'coupons_data_1698765432.csv' },
            recordCount: { type: 'number', example: 25 },
            summary: {
              type: 'object',
              properties: {
                totalCoupons: { type: 'number', example: 25 },
                activeCoupons: { type: 'number', example: 15 },
                expiredCoupons: { type: 'number', example: 5 },
                totalUses: { type: 'number', example: 150 },
                usageRate: { type: 'string', example: '75.00' }
              }
            }
          }
        }
      }
    }
  })
  async exportCouponsData(
    @Query('format') format?: string,
    @Query('period') period?: number
  ) {
    const exportFormat = format || 'csv';
    const exportPeriod = period || 30;
    
    return await this.svc.exportCouponsData(exportFormat, exportPeriod);
  }
}
