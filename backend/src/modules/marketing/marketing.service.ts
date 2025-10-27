import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceRule, PriceRuleDocument } from './schemas/price-rule.schema';
import { Coupon, CouponDocument, CouponStatus } from './schemas/coupon.schema';
import { Banner, BannerDocument, BannerLocation } from './schemas/banner.schema';
import { Variant, VariantDocument } from '../products/schemas/variant.schema';

// DTOs
import { CreatePriceRuleDto, UpdatePriceRuleDto, PreviewPriceRuleDto, PricingQueryDto } from './dto/price-rule.dto';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, ListCouponsDto } from './dto/coupon.dto';
import { CreateBannerDto, UpdateBannerDto, ListBannersDto } from './dto/banner.dto';

// Types
import { EffectivePriceResult } from './types';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    @InjectModel(PriceRule.name) private priceRuleModel: Model<PriceRuleDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
  ) {}

  // ==================== PRICE RULES ====================

  async createPriceRule(dto: CreatePriceRuleDto): Promise<PriceRule> {
    return this.priceRuleModel.create({
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      usageLimits: dto.usageLimits ? {
        ...dto.usageLimits,
        currentUses: 0,
      } : undefined,
      metadata: dto.metadata || undefined,
      couponCode: dto.couponCode || undefined,
    });
  }

  async updatePriceRule(id: string, dto: UpdatePriceRuleDto): Promise<PriceRule | null> {
    const updateData: Record<string, unknown> = { ...dto };
    if (dto.startAt) updateData.startAt = new Date(dto.startAt);
    if (dto.endAt) updateData.endAt = new Date(dto.endAt);
    return this.priceRuleModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getPriceRule(id: string): Promise<PriceRule | null> {
    return this.priceRuleModel.findById(id);
  }

  async listPriceRules(): Promise<PriceRule[]> {
    return this.priceRuleModel.find().sort({ priority: -1 });
  }

  async togglePriceRule(id: string): Promise<PriceRule | null> {
    const rule = await this.priceRuleModel.findById(id);
    if (!rule) return null;
    rule.active = !rule.active;
    return rule.save();
  }

  async deletePriceRule(id: string): Promise<boolean> {
    const result = await this.priceRuleModel.findByIdAndDelete(id);
    return !!result;
  }

  async previewPriceRule(dto: PreviewPriceRuleDto): Promise<EffectivePriceResult | null> {
    const rule = await this.priceRuleModel.findById(dto.ruleId);
    if (!rule || !rule.active) return null;

    // Get actual base price from catalog
    if (!dto.variantId) {
      throw new Error('Variant ID is required for price preview');
    }
    const basePrice = await this.getBasePrice(dto.variantId, dto.currency || 'YER');
    if (basePrice === null) return null;

    // Calculate effective price based on rule effects
    const effectivePrice = this.calculateEffectivePriceFromRule(basePrice, rule);

    return {
      originalPrice: basePrice,
      effectivePrice,
      appliedRule: rule,
      savings: basePrice - effectivePrice,
    };
  }

  async calculateEffectivePrice(dto: PricingQueryDto): Promise<EffectivePriceResult> {
    const now = new Date();
    const { variantId, currency = 'YER', qty = 1, accountType } = dto;

    // Get actual base price from catalog
    const originalPrice = await this.getBasePrice(variantId, currency);
    if (originalPrice === null) {
      throw new Error(`Price not found for variant ${variantId} in currency ${currency}`);
    }

    // Find applicable rules
    const applicableRules = await this.priceRuleModel.find({
      active: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).sort({ priority: -1 });

    // Filter rules based on conditions
    const matchingRules = applicableRules.filter(rule => {
      const cond = rule.conditions;
      if (cond.variantId && cond.variantId !== variantId) return false;
      if (cond.currency && cond.currency !== currency) return false;
      if (cond.minQty && qty < cond.minQty) return false;
      if (cond.accountType && cond.accountType !== accountType) return false;
      return true;
    });

    // Apply the highest priority rule
    const appliedRule = matchingRules[0];
    if (!appliedRule) {
      return { originalPrice, effectivePrice: originalPrice };
    }

    const effectivePrice = this.calculateEffectivePriceFromRule(originalPrice, appliedRule);

    return {
      originalPrice,
      effectivePrice,
      appliedRule,
      savings: originalPrice - effectivePrice,
      badge: appliedRule.effects.badge,
      giftSku: appliedRule.effects.giftSku,
    };
  }

  // ==================== COUPONS ====================

  async createCoupon(dto: CreateCouponDto, adminId?: string): Promise<Coupon> {
    // Check if code already exists
    const existing = await this.couponModel.findOne({
      code: dto.code.toUpperCase(),
      deletedAt: null,
    });

    if (existing) {
      throw new Error('Coupon code already exists');
    }

    const coupon = new this.couponModel({
      ...dto,
      code: dto.code.toUpperCase(),
      createdBy: adminId,
    });

    return await coupon.save();
  }

  async updateCoupon(id: string, dto: UpdateCouponDto, adminId?: string): Promise<Coupon | null> {
    return this.couponModel.findByIdAndUpdate(
      id,
      { ...dto, lastModifiedBy: adminId },
      { new: true }
    );
  }

  async getCoupon(id: string): Promise<Coupon | null> {
    return this.couponModel.findById(id);
  }

  async listCoupons(dto: ListCouponsDto) {
    const { page = 1, limit = 20, search, status, type, visibility } = dto;
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { deletedAt: null };

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (visibility) query.visibility = visibility;

    const [coupons, total] = await Promise.all([
      this.couponModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.couponModel.countDocuments(query),
    ]);

    return {
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteCoupon(id: string, adminId?: string): Promise<boolean> {
    const result = await this.couponModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), deletedBy: adminId }
    );
    return !!result;
  }

  async validateCoupon(dto: ValidateCouponDto) {
    const coupon = await this.couponModel.findOne({
      code: dto.code.toUpperCase(),
      status: CouponStatus.ACTIVE,
      deletedAt: null,
    });

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return { valid: false, message: 'Coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit exceeded' };
    }

    return { valid: true, coupon };
  }

  async getCouponsAnalytics(period: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [totalCoupons, activeCoupons, expiredCoupons, coupons] = await Promise.all([
      this.couponModel.countDocuments({ deletedAt: null }),
      this.couponModel.countDocuments({ 
        deletedAt: null, 
        status: CouponStatus.ACTIVE,
        validUntil: { $gte: new Date() }
      }),
      this.couponModel.countDocuments({ 
        deletedAt: null, 
        status: CouponStatus.ACTIVE,
        validUntil: { $lt: new Date() }
      }),
      this.couponModel.find({ deletedAt: null }).lean()
    ]);

    const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const totalLimit = coupons.reduce((sum, c) => sum + (c.usageLimit || 0), 0);
    
    return {
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUses,
        totalLimit,
        usageRate: totalLimit > 0 ? ((totalUses / totalLimit) * 100).toFixed(2) : 0,
        period,
      }
    };
  }

  async getCouponsStatistics(period: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const coupons = await this.couponModel.find({ 
      deletedAt: null,
      createdAt: { $gte: startDate }
    }).lean();

    const statusBreakdown = {
      active: 0,
      inactive: 0,
      expired: 0,
      scheduled: 0
    };

    const typeBreakdown = {
      percentage: 0,
      fixed: 0,
      freeShipping: 0
    };

    const now = new Date();
    coupons.forEach(coupon => {
      // Status breakdown
      if (coupon.status === CouponStatus.ACTIVE) {
        if (now < coupon.validFrom) {
          statusBreakdown.scheduled++;
        } else if (now > coupon.validUntil) {
          statusBreakdown.expired++;
        } else {
          statusBreakdown.active++;
        }
      } else {
        statusBreakdown.inactive++;
      }

      // Type breakdown
      if (coupon.type === 'percentage') {
        typeBreakdown.percentage++;
      } else if (coupon.type === 'fixed_amount') {
        typeBreakdown.fixed++;
      } else if (coupon.type === 'free_shipping') {
        typeBreakdown.freeShipping++;
      }
    });

    const topUsedCoupons = await this.couponModel
      .find({ deletedAt: null })
      .sort({ usedCount: -1 })
      .limit(10)
      .select('code type discountValue usedCount usageLimit')
      .lean();

    return {
      success: true,
      data: {
        statusBreakdown,
        typeBreakdown,
        topUsedCoupons,
        period,
        totalInPeriod: coupons.length
      }
    };
  }

  // ==================== BANNERS ====================

  async createBanner(dto: CreateBannerDto): Promise<Banner> {
    const banner = new this.bannerModel({
      ...dto,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      clickCount: 0,
      viewCount: 0,
    });

    return await banner.save();
  }

  async updateBanner(id: string, dto: UpdateBannerDto): Promise<Banner | null> {
    return this.bannerModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async getBanner(id: string): Promise<Banner | null> {
    return this.bannerModel.findById(id);
  }

  async listBanners(dto: ListBannersDto) {
    const { page = 1, limit = 20, search, isActive, location, sortBy = 'sortOrder', sortOrder = 'asc' } = dto;
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { deletedAt: null };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (typeof isActive === 'boolean') query.isActive = isActive;
    if (location) query.location = location;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [banners, total] = await Promise.all([
      this.bannerModel.find(query).skip(skip).limit(limit).sort(sort),
      this.bannerModel.countDocuments(query),
    ]);

    return {
      data: banners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteBanner(id: string): Promise<boolean> {
    const result = await this.bannerModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() }
    );
    return !!result;
  }

  async getActiveBanners(location?: BannerLocation): Promise<Banner[]> {
    const now = new Date();
    const query: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
      $or: [
        { startDate: { $exists: false } }, { startDate: { $lte: now } },
        { endDate: { $exists: false } }, { endDate: { $gte: now } },
      ],
    };

    if (location) query.location = location;

    return this.bannerModel.find(query).sort({ sortOrder: 1 });
  }

  async incrementBannerView(id: string): Promise<void> {
    await this.bannerModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  async incrementBannerClick(id: string): Promise<void> {
    await this.bannerModel.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
  }

  async getBannersAnalytics() {
    const totalBanners = await this.bannerModel.countDocuments({ deletedAt: null });
    const activeBanners = await this.bannerModel.countDocuments({ 
      deletedAt: null, 
      isActive: true 
    });

    // Get aggregated stats
    const stats = await this.bannerModel.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalClicks: { $sum: '$clickCount' },
        }
      }
    ]);

    const totalViews = stats[0]?.totalViews || 0;
    const totalClicks = stats[0]?.totalClicks || 0;
    const averageCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Get top performing banners
    const topPerforming = await this.bannerModel
      .find({ deletedAt: null })
      .select('_id title viewCount clickCount')
      .sort({ clickCount: -1 })
      .limit(5)
      .lean();

    const topPerformingFormatted = topPerforming.map(banner => ({
      id: banner._id.toString(),
      title: banner.title,
      views: banner.viewCount || 0,
      clicks: banner.clickCount || 0,
      ctr: banner.viewCount > 0 ? ((banner.clickCount || 0) / banner.viewCount) * 100 : 0
    }));

    return {
      success: true,
      data: {
        totalBanners,
        activeBanners,
        totalViews,
        totalClicks,
        averageCTR: parseFloat(averageCTR.toFixed(2)),
        topPerforming: topPerformingFormatted
      }
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Get base price for a variant in specific currency
   */
  private async getBasePrice(variantId: string, _currency: string): Promise<number | null> {
    try {
      const variant = await this.variantModel.findById(variantId).lean();
      
      void _currency;
      if (!variant || variant.deletedAt) {
        return null;
      }

      // For now, return basePriceUSD regardless of currency
      // In a real implementation, you would have currency conversion logic
      return variant.basePriceUSD;
    } catch (error) {
      this.logger.error(`Error getting base price for variant ${variantId}:`, error);
      return null;
    }
  }

  /**
   * Calculate effective price based on rule effects
   */
  private calculateEffectivePriceFromRule(originalPrice: number, rule: PriceRule): number {
    const effects = rule.effects;
    let effectivePrice = originalPrice;

    if (effects.specialPrice) {
      effectivePrice = effects.specialPrice;
    } else if (effects.percentOff) {
      effectivePrice = originalPrice * (1 - effects.percentOff / 100);
    } else if (effects.amountOff) {
      effectivePrice = Math.max(0, originalPrice - effects.amountOff);
    }

    return Math.round(effectivePrice * 100) / 100; // Round to 2 decimal places
  }

  // ==================== Export Coupons Data ====================
  async exportCouponsData(format: string, period?: number) {
    this.logger.log('Exporting coupons data:', { format, period });

    // Get coupons data
    const coupons = await this.couponModel
      .find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();

    // Get analytics
    const analytics = await this.getCouponsAnalytics(period || 30);
    const statistics = await this.getCouponsStatistics(period || 30);

    // In a real implementation, this would generate and store the actual file
    // For now, return URL pointing to where file would be stored
    const fileName = `coupons_data_${Date.now()}.${format}`;

    return {
      success: true,
      data: {
        fileUrl: `https://api.example.com/exports/${fileName}`,
        format,
        exportedAt: new Date().toISOString(),
        fileName,
        recordCount: coupons.length,
        summary: {
          totalCoupons: analytics.data.totalCoupons,
          activeCoupons: analytics.data.activeCoupons,
          expiredCoupons: analytics.data.expiredCoupons,
          totalUses: analytics.data.totalUses,
          usageRate: analytics.data.usageRate,
          statusBreakdown: statistics.data.statusBreakdown,
          typeBreakdown: statistics.data.typeBreakdown,
        },
      }
    };
  }
}
