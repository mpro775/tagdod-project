import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { PricingQueryDto, ValidateCouponDto } from './dto/price-rule.dto';
import { BannerLocation } from './schemas/banner.schema';

@ApiTags('marketing-public')
@Controller('marketing')
export class MarketingPublicController {
  constructor(private svc: MarketingService) {}

  // ==================== PRICING ====================

  @Get('pricing/variant')
  async getVariantPrice(@Query() query: PricingQueryDto) {
    const result = await this.svc.calculateEffectivePrice(query);
    return { data: result };
  }

  // ==================== COUPONS ====================

  @Get('coupons/validate')
  async validateCoupon(@Query() dto: ValidateCouponDto) {
    const result = await this.svc.validateCoupon(dto);
    return { data: result };
  }

  // ==================== BANNERS ====================

  @Get('banners')
  async getActiveBanners(@Query('location') location?: BannerLocation) {
    const banners = await this.svc.getActiveBanners(location);
    return { data: banners };
  }

  @Get('banners/:id/view')
  async trackBannerView(@Param('id') id: string) {
    await this.svc.incrementBannerView(id);
    return { success: true };
  }

  @Get('banners/:id/click')
  async trackBannerClick(@Param('id') id: string) {
    await this.svc.incrementBannerClick(id);
    return { success: true };
  }
}
