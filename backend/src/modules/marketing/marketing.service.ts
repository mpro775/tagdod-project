import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceRule, PriceRuleDocument } from './schemas/price-rule.schema';
import { Coupon, CouponDocument, CouponStatus, CouponType } from './schemas/coupon.schema';
import { Banner, BannerDocument, BannerLocation } from './schemas/banner.schema';

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

    // Mock calculation - should integrate with catalog service
    return {
      originalPrice: 100,
      effectivePrice: 80,
      appliedRule: rule,
      savings: 20,
    };
  }

  async calculateEffectivePrice(dto: PricingQueryDto): Promise<EffectivePriceResult> {
    const now = new Date();
    const { variantId, currency = 'YER', qty = 1, accountType } = dto;

    // Get base price from catalog service (mock for now)
    const originalPrice = 100;

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

    let effectivePrice = originalPrice;
    const effects = appliedRule.effects;

    if (effects.specialPrice) {
      effectivePrice = effects.specialPrice;
    } else if (effects.percentOff) {
      effectivePrice = originalPrice * (1 - effects.percentOff / 100);
    } else if (effects.amountOff) {
      effectivePrice = Math.max(0, originalPrice - effects.amountOff);
    }

    return {
      originalPrice,
      effectivePrice,
      appliedRule,
      savings: originalPrice - effectivePrice,
      badge: effects.badge,
      giftSku: effects.giftSku,
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
        { startDate: { $exists: false } || { startDate: { $lte: now } },
        { endDate: { $exists: false } || { endDate: { $gte: now } },
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
}
