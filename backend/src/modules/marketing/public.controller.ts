import { Controller, Get, Query, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth
} from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { PricingQueryDto } from './dto/price-rule.dto';
import { ValidateCouponDto } from './dto/coupon.dto';
import { BannerLocation, BannerNavigationType } from './schemas/banner.schema';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@ApiTags('التسويق-العام')
@Controller('marketing')
export class MarketingPublicController {
  constructor(private svc: MarketingService) { }

  @Get('pricing/variant')
  @ApiOperation({
    summary: 'الحصول على سعر المتغير',
    description: 'استرداد السعر الفعال لمتغير منتج مع تطبيق قواعد التسعير'
  })
  @ApiQuery({ type: PricingQueryDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد السعر الفعال بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            originalPrice: { type: 'number', example: 100, description: 'السعر الأصلي' },
            effectivePrice: { type: 'number', example: 85, description: 'السعر الفعال بعد الخصم' },
            discountAmount: { type: 'number', example: 15, description: 'مبلغ الخصم' },
            discountPercent: { type: 'number', example: 15, description: 'نسبة الخصم' },
            appliedRules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ruleId: { type: 'string', example: 'rule123' },
                  ruleName: { type: 'string', example: 'خصم عيد الفطر' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getVariantPrice(@Query() query: PricingQueryDto) {
    const result = await this.svc.calculateEffectivePrice(query);
    return result;
  }

  @Get('coupons/validate')
  @ApiOperation({
    summary: 'التحقق من صحة كوبون',
    description: 'التحقق من صحة كوبون الخصم وإمكانية استخدامه'
  })
  @ApiQuery({ type: ValidateCouponDto })
  @ApiResponse({
    status: 200,
    description: 'تم التحقق من الكوبون بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true, description: 'صحة الكوبون' },
            discountType: { type: 'string', enum: ['percentage', 'fixed'], example: 'percentage', description: 'نوع الخصم' },
            discountValue: { type: 'number', example: 15, description: 'قيمة الخصم' },
            minimumAmount: { type: 'number', example: 100, description: 'الحد الأدنى للطلب' },
            message: { type: 'string', example: 'كوبون صالح', description: 'رسالة التحقق' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'كوبون غير صحيح أو منتهي الصلاحية'
  })
  async validateCoupon(@Query() dto: ValidateCouponDto) {
    const result = await this.svc.validateCoupon(dto);
    return result;
  }

  @Get('banners')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'الحصول على البانرات النشطة',
    description: 'استرداد قائمة البانرات الإعلانية النشطة حسب الموقع ونوع المستخدم. يتطلب توكن مصادقة لتحديد نوع المستخدم وعرض البانرات المناسبة له.'
  })
  @ApiQuery({
    name: 'location',
    required: false,
    enum: BannerLocation,
    description: 'موقع عرض البانر',
    example: 'home_top'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد البانرات النشطة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'banner123', description: 'معرف البانر' },
              image: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'img123' },
                  url: { type: 'string', example: 'https://cdn.example.com/banner.jpg' }
                }
              },
              linkUrl: { type: 'string', example: 'https://example.com/special-offer', description: 'رابط البانر (للتوافق مع الإصدارات القديمة)' },
              navigationType: { type: 'string', enum: Object.values(BannerNavigationType), example: 'category', description: 'نوع التنقل: external_url, category, product, section, none' },
              navigationTarget: { type: 'string', example: 'category123', description: 'الهدف من التنقل: معرف الفئة، معرف المنتج، اسم القسم، أو رابط خارجي' },
              navigationParams: { type: 'object', example: {}, description: 'معاملات إضافية للتنقل' },
              location: { type: 'string', enum: Object.values(BannerLocation), example: 'home_top', description: 'موقع البانر' },
              sortOrder: { type: 'number', example: 1, description: 'ترتيب العرض' },
              isActive: { type: 'boolean', example: true, description: 'حالة البانر' },
              altText: { type: 'string', example: 'عرض خاص', description: 'النص البديل للصورة' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'توكن غير صالح أو منتهي الصلاحية'
  })
  async getActiveBanners(
    @Query('location') location?: BannerLocation,
    @Req() req?: { user?: { roles?: string[] } }
  ) {
    // تعديل: بدلاً من عمل return، نقوم بتعريف الأدوار كقائمة فارغة في حال عدم وجود مستخدم
    const userRoles = req?.user?.roles || [];

    // الان نقوم بجلب البانرات سواء كان هناك مستخدم أم لا
    // يجب أن تتأكد أن الدالة getActiveBanners في السيرفس تقبل roles فارغة
    const banners = await this.svc.getActiveBanners(location, userRoles);
    return banners;
  }

  @Get('banners/:id/view')
  @ApiOperation({
    summary: 'تتبع مشاهدة البانر',
    description: 'تسجيل مشاهدة لبانر معين (يستخدم للإحصائيات)'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف البانر',
    example: 'banner123'
  })
  @ApiResponse({
    status: 200,
    description: 'تم تسجيل المشاهدة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true, description: 'نجاح العملية' }
      }
    }
  })
  async trackBannerView(@Param('id') id: string) {
    await this.svc.incrementBannerView(id);
    return { viewed: true };
  }

  @Get('banners/:id/click')
  @ApiOperation({
    summary: 'تتبع نقر البانر',
    description: 'تسجيل نقرة لبانر معين (يستخدم للإحصائيات)'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف البانر',
    example: 'banner123'
  })
  @ApiResponse({
    status: 200,
    description: 'تم تسجيل النقرة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true, description: 'نجاح العملية' }
      }
    }
  })
  async trackBannerClick(@Param('id') id: string) {
    await this.svc.incrementBannerClick(id);
    return { clicked: true };
  }
}
