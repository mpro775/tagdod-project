import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CreatePriceRuleDto, UpdatePriceRuleDto, PreviewPriceRuleDto } from './dto/price-rule.dto';
import { CreateCouponDto, UpdateCouponDto, ListCouponsDto, ValidateCouponDto } from './dto/coupon.dto';
import { CreateBannerDto, UpdateBannerDto, ListBannersDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('marketing-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/marketing')
export class MarketingAdminController {
  constructor(private svc: MarketingService) {}

  // ==================== PRICE RULES ====================

  @Post('price-rules')
  async createPriceRule(@Body() dto: CreatePriceRuleDto) {
    const rule = await this.svc.createPriceRule(dto);
    return { data: rule };
  }

  @Get('price-rules')
  async listPriceRules() {
    const rules = await this.svc.listPriceRules();
    return { data: rules };
  }

  @Get('price-rules/:id')
  async getPriceRule(@Param('id') id: string) {
    const rule = await this.svc.getPriceRule(id);
    return { data: rule };
  }

  @Patch('price-rules/:id')
  async updatePriceRule(@Param('id') id: string, @Body() dto: UpdatePriceRuleDto) {
    const rule = await this.svc.updatePriceRule(id, dto);
    return { data: rule };
  }

  @Delete('price-rules/:id')
  async deletePriceRule(@Param('id') id: string) {
    const result = await this.svc.deletePriceRule(id);
    return { data: result };
  }

  @Post('price-rules/:id/toggle')
  async togglePriceRule(@Param('id') id: string) {
    const rule = await this.svc.togglePriceRule(id);
    return { data: rule };
  }

  @Post('price-rules/preview')
  async previewPriceRule(@Body() dto: PreviewPriceRuleDto) {
    const result = await this.svc.previewPriceRule(dto);
    return { data: result };
  }

  // ==================== COUPONS ====================

  @Post('coupons')
  async createCoupon(@Body() dto: CreateCouponDto) {
    const coupon = await this.svc.createCoupon(dto);
    return { data: coupon };
  }

  @Get('coupons')
  async listCoupons(@Query() dto: ListCouponsDto) {
    const result = await this.svc.listCoupons(dto);
    return result;
  }

  @Get('coupons/:id')
  async getCoupon(@Param('id') id: string) {
    const coupon = await this.svc.getCoupon(id);
    return { data: coupon };
  }

  @Patch('coupons/:id')
  async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    const coupon = await this.svc.updateCoupon(id, dto);
    return { data: coupon };
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    const result = await this.svc.deleteCoupon(id);
    return { data: result };
  }

  @Post('coupons/validate')
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    const result = await this.svc.validateCoupon(dto);
    return { data: result };
  }

  // ==================== BANNERS ====================

  @Post('banners')
  async createBanner(@Body() dto: CreateBannerDto) {
    const banner = await this.svc.createBanner(dto);
    return { data: banner };
  }

  @Get('banners')
  async listBanners(@Query() dto: ListBannersDto) {
    const result = await this.svc.listBanners(dto);
    return result;
  }

  @Get('banners/:id')
  async getBanner(@Param('id') id: string) {
    const banner = await this.svc.getBanner(id);
    return { data: banner };
  }

  @Patch('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    const banner = await this.svc.updateBanner(id, dto);
    return { data: banner };
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    const result = await this.svc.deleteBanner(id);
    return { data: result };
  }
}
