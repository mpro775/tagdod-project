import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PriceRule, PriceRuleDocument } from './schemas/price-rule.schema';
import { Coupon, CouponDocument, CouponStatus } from './schemas/coupon.schema';
import { Banner, BannerDocument, BannerLocation, BannerNavigationType } from './schemas/banner.schema';
import { Variant, VariantDocument } from '../products/schemas/variant.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Media } from '../upload/schemas/media.schema';
import { UserRole } from '../users/schemas/user.schema';

// DTOs
import { CreatePriceRuleDto, UpdatePriceRuleDto, PreviewPriceRuleDto, PricingQueryDto } from './dto/price-rule.dto';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, ListCouponsDto } from './dto/coupon.dto';
import { CreateBannerDto, UpdateBannerDto, ListBannersDto } from './dto/banner.dto';

// Types
import { EffectivePriceResult } from './types';

// Type for Banner with populated imageId (lean document)
type BannerWithPopulatedImage = Omit<Banner, 'imageId'> & {
  imageId: Media | Types.ObjectId;
  _id: Types.ObjectId;
};

type PublicBannerResponse = {
  id: string;
  image: { id?: string; url: string } | null;
  linkUrl?: string;
  navigationType: BannerNavigationType;
  navigationTarget?: string;
  navigationParams?: Record<string, unknown>;
  location: BannerLocation;
  sortOrder: number;
  isActive: boolean;
  altText?: string | null;
};

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    @InjectModel(PriceRule.name) private priceRuleModel: Model<PriceRuleDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // ==================== PRICE RULES ====================

  async createPriceRule(dto: CreatePriceRuleDto): Promise<PriceRule> {
    // Generate badge automatically based on discount type
    let badge = '';
    if (dto.effects?.percentOff) {
      badge = `خصم ${dto.effects.percentOff}%`;
    } else if (dto.effects?.amountOff) {
      badge = `خصم ${dto.effects.amountOff}$`;
    } else if (dto.effects?.specialPrice) {
      badge = 'عرض خاص';
    }

    return this.priceRuleModel.create({
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      effects: {
        ...dto.effects,
        badge: badge || undefined,
      },
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
    
    // Generate badge automatically if effects are being updated
    if (dto.effects) {
      let badge = '';
      if (dto.effects.percentOff) {
        badge = `خصم ${dto.effects.percentOff}%`;
      } else if (dto.effects.amountOff) {
        badge = `خصم ${dto.effects.amountOff}$`;
      } else if (dto.effects.specialPrice) {
        badge = 'عرض خاص';
      }
      
      updateData.effects = {
        ...dto.effects,
        badge: badge || dto.effects.badge || undefined,
      };
    }
    
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

  /**
   * Preview method for CartService - matches PromotionsLike interface
   */
  async preview(input: {
    variantId: string;
    currency: string;
    qty: number;
    accountType: 'any' | 'customer' | 'engineer' | 'merchant';
  }): Promise<{
    finalPrice: number;
    basePrice: number;
    appliedRule: unknown;
  } | null> {
    try {
      const result = await this.calculateEffectivePrice({
        variantId: input.variantId,
        currency: input.currency,
        qty: input.qty,
        accountType: input.accountType,
      });

      return {
        finalPrice: result.effectivePrice,
        basePrice: result.originalPrice,
        appliedRule: result.appliedRule,
      };
    } catch (error) {
      this.logger.error('Error in preview:', error);
      return null;
    }
  }

  /**
   * Batch preview for multiple items - optimized for cart preview
   * Accepts pre-fetched variants and products to avoid N+1 queries
   */
  async previewBatch(inputs: Array<{
    variantId?: string;
    productId?: string;
    currency: string;
    qty: number;
    accountType: 'any' | 'customer' | 'engineer' | 'merchant';
  }>, preloadedData?: {
    variants?: Map<string, unknown>;
    products?: Map<string, unknown>;
  }): Promise<Map<string, {
    finalPrice: number;
    basePrice: number;
    appliedRule: unknown;
  }>> {
    const results = new Map<string, {
      finalPrice: number;
      basePrice: number;
      appliedRule: unknown;
    }>();

    if (inputs.length === 0) {
      return results;
    }

    const now = new Date();
    
    // جلب جميع priceRules مرة واحدة فقط
    const applicableRules = await this.priceRuleModel.find({
      active: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).sort({ priority: -1 }).lean();

    // جلب جميع variants و products المطلوبة إذا لم تكن محملة مسبقاً
    const variantIds = new Set<string>();
    const productIds = new Set<string>();
    
    for (const input of inputs) {
      if (input.variantId) variantIds.add(input.variantId);
      if (input.productId) productIds.add(input.productId);
    }

    // جمع productIds من variants
    const variantsMap = preloadedData?.variants || new Map();
    const productsMap = preloadedData?.products || new Map();

    if (!preloadedData) {
      // جلب variants
      if (variantIds.size > 0) {
        const variants = await this.variantModel
          .find({ _id: { $in: Array.from(variantIds).map(id => new Types.ObjectId(id)) } })
          .lean();
        for (const variant of variants) {
          variantsMap.set(String(variant._id), variant);
          if (variant.productId) {
            productIds.add(String(variant.productId));
          }
        }
      }

      // جلب products
      if (productIds.size > 0) {
        const products = await this.productModel
          .find({ _id: { $in: Array.from(productIds).map(id => new Types.ObjectId(id)) } })
          .lean();
        for (const product of products) {
          productsMap.set(String(product._id), product);
        }
      }
    }

    // معالجة كل عنصر
    for (const input of inputs) {
      const key = input.variantId || input.productId || '';
      if (!key) continue;

      try {
        let variant: unknown = null;
        let product: unknown = null;
        let variantIdStr = input.variantId;
        let productIdStr = input.productId;

        if (input.variantId) {
          variant = variantsMap.get(input.variantId);
          if (variant) {
            const variantRecord = variant as Record<string, unknown>;
            productIdStr = String(variantRecord.productId || '');
            if (productIdStr) {
              product = productsMap.get(productIdStr);
            }
          }
        } else if (input.productId) {
          product = productsMap.get(input.productId);
        }

        if (!variant && !product) {
          // Fallback: استخدام السعر الأساسي بدون قواعد
          const basePrice = await this.getBasePrice(key, input.currency);
          if (basePrice !== null) {
            results.set(key, {
              finalPrice: basePrice,
              basePrice: basePrice,
              appliedRule: null,
            });
          }
          continue;
        }

        // الحصول على السعر الأساسي
        let originalPrice: number | null = null;
        if (variant) {
          const variantRecord = variant as Record<string, unknown>;
          if (input.currency === 'USD') {
            originalPrice = (variantRecord.basePriceUSD as number) ?? null;
          } else if (input.currency === 'SAR') {
            originalPrice = (variantRecord.basePriceSAR as number) ?? null;
          } else if (input.currency === 'YER') {
            originalPrice = (variantRecord.basePriceYER as number) ?? null;
          }
          if (originalPrice === null) {
            originalPrice = (variantRecord.basePriceUSD as number) ?? null;
          }
        } else if (product) {
          const productRecord = product as Record<string, unknown>;
          if (input.currency === 'USD') {
            originalPrice = (productRecord.basePriceUSD as number) ?? null;
          } else if (input.currency === 'SAR') {
            originalPrice = (productRecord.basePriceSAR as number) ?? null;
          } else if (input.currency === 'YER') {
            originalPrice = (productRecord.basePriceYER as number) ?? null;
          }
          if (originalPrice === null) {
            originalPrice = (productRecord.basePriceUSD as number) ?? 
                           (productRecord.basePrice as number) ?? null;
          }
        }

        if (originalPrice === null) {
          continue;
        }

        // البحث عن القواعد المطابقة
        const matchingRules = applicableRules.filter(rule => {
          const cond = rule.conditions;
          
          // Variant check
          if (cond.variantId && variantIdStr && cond.variantId !== variantIdStr) return false;
          
          // Product check
          if (cond.productId && productIdStr && cond.productId !== productIdStr) return false;
          
          // Category check
          if (cond.categoryId && product) {
            const productRecord = product as Record<string, unknown>;
            const categoryId = String(productRecord.categoryId || '');
            if (cond.categoryId !== categoryId) return false;
          }
          
          // Brand check
          if (cond.brandId && product) {
            const productRecord = product as Record<string, unknown>;
            const brandId = productRecord.brandId ? String(productRecord.brandId) : '';
            if (cond.brandId !== brandId) return false;
          }
          
          // Currency check
          if (cond.currency && cond.currency !== input.currency) return false;
          
          // Min quantity check
          if (cond.minQty && input.qty < cond.minQty) return false;
          
          // Account type check
          if (cond.accountType && cond.accountType !== input.accountType) return false;
          
          return true;
        });

        // تطبيق أعلى أولوية قاعدة
        const appliedRule = matchingRules[0];
        let effectivePrice = originalPrice;
        
        if (appliedRule) {
          effectivePrice = this.calculateEffectivePriceFromRule(originalPrice, appliedRule);
        }

        results.set(key, {
          finalPrice: effectivePrice,
          basePrice: originalPrice,
          appliedRule: appliedRule || null,
        });
      } catch (error) {
        this.logger.error(`Error in batch preview for ${key}:`, error);
        // Fallback: استخدام السعر الأساسي
        try {
          const basePrice = await this.getBasePrice(key, input.currency);
          if (basePrice !== null) {
            results.set(key, {
              finalPrice: basePrice,
              basePrice: basePrice,
              appliedRule: null,
            });
          }
        } catch {
          // ignore
        }
      }
    }

    return results;
  }

  async calculateEffectivePrice(dto: PricingQueryDto): Promise<EffectivePriceResult> {
    const now = new Date();
    const { variantId, currency = 'YER', qty = 1, accountType } = dto;

    // Get actual base price from catalog
    const originalPrice = await this.getBasePrice(variantId, currency);
    if (originalPrice === null) {
      throw new Error(`Price not found for variant ${variantId} in currency ${currency}`);
    }

    // Get variant and product info for category/product/brand checks
    const variant = await this.variantModel.findById(variantId).lean();
    if (!variant) {
      return { originalPrice, effectivePrice: originalPrice };
    }

    const product = await this.productModel.findById(variant.productId).lean();
    if (!product) {
      return { originalPrice, effectivePrice: originalPrice };
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
      
      // Variant check
      if (cond.variantId && cond.variantId !== variantId) return false;
      
      // Product check
      if (cond.productId && cond.productId !== String(variant.productId)) return false;
      
      // Category check
      if (cond.categoryId && cond.categoryId !== String(product.categoryId)) return false;
      
      // Brand check
      if (cond.brandId && product.brandId && cond.brandId !== String(product.brandId)) return false;
      
      // Currency check
      if (cond.currency && cond.currency !== currency) return false;
      
      // Min quantity check
      if (cond.minQty && qty < cond.minQty) return false;
      
      // Account type check
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
    const updateData: Record<string, unknown> = { ...dto };

    if (dto.code) {
      const normalizedCode = dto.code.toUpperCase();

      const existing = await this.couponModel.findOne({
        code: normalizedCode,
        _id: { $ne: new Types.ObjectId(id) },
        deletedAt: null,
      });

      if (existing) {
        throw new BadRequestException('Coupon code already exists');
      }

      updateData.code = normalizedCode;
    }

    if (adminId) {
      updateData.lastModifiedBy = adminId;
    }

    return this.couponModel.findByIdAndUpdate(
      id,
      updateData,
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
    const { code, userId, orderAmount, productIds } = dto;
    
    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase(),
      status: CouponStatus.ACTIVE,
      deletedAt: null,
    });

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    // Check expiry
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit exceeded' };
    }

    // Check minimum order amount
    if (coupon.minimumOrderAmount && orderAmount && orderAmount < coupon.minimumOrderAmount) {
      return { 
        valid: false, 
        message: `Minimum order amount is ${coupon.minimumOrderAmount}` 
      };
    }

    // Check user restrictions
    if (userId) {
      // Check if user is excluded
      if (coupon.excludedUserIds && coupon.excludedUserIds.includes(userId)) {
        return { valid: false, message: 'This coupon is not available for your account' };
      }

      // Check if coupon is restricted to specific users
      if (coupon.applicableUserIds && coupon.applicableUserIds.length > 0) {
        if (!coupon.applicableUserIds.includes(userId)) {
          return { valid: false, message: 'This coupon is not available for your account' };
        }
      }
    }

    // Check product restrictions if productIds are provided (can be variantIds or productIds)
    if (productIds && productIds.length > 0 && coupon.appliesTo !== 'all_products' && coupon.appliesTo !== 'minimum_order_amount') {
      let isValidForProducts = false;

      const { combinedProductIds } = await this.extractProductIdsFromCartItems(productIds);

      if (coupon.appliesTo === 'specific_products' && coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
        // Check if at least one product in cart matches
        isValidForProducts = combinedProductIds.some(id => coupon.applicableProductIds.includes(id));
      } else if (coupon.appliesTo === 'specific_categories' && coupon.applicableCategoryIds && coupon.applicableCategoryIds.length > 0) {
        const products = await this.productModel
          .find({
            _id: { $in: combinedProductIds.map(id => new Types.ObjectId(id)) },
          })
          .select('categoryId')
          .lean();

        const categoryIds = products.map(p => String(p.categoryId));
        isValidForProducts = categoryIds.some(catId => coupon.applicableCategoryIds.includes(catId));
      } else if (coupon.appliesTo === 'specific_brands' && coupon.applicableBrandIds && coupon.applicableBrandIds.length > 0) {
        const products = await this.productModel
          .find({
            _id: { $in: combinedProductIds.map(id => new Types.ObjectId(id)) },
          })
          .select('brandId')
          .lean();

        const brandIds = products
          .map(p => p.brandId)
          .filter(Boolean)
          .map(id => String(id));
        isValidForProducts = brandIds.some(brandId => coupon.applicableBrandIds.includes(brandId));
      }

      if (!isValidForProducts) {
        return { valid: false, message: 'This coupon is not applicable to the products in your cart' };
      }
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

  private async extractProductIdsFromCartItems(ids: string[]): Promise<{
    variants: Array<{ _id: Types.ObjectId; productId: Types.ObjectId }>;
    combinedProductIds: string[];
  }> {
    const normalizedVariantIds: Types.ObjectId[] = [];
    for (const id of ids) {
      try {
        normalizedVariantIds.push(new Types.ObjectId(id));
      } catch {
        // ignore invalid ObjectId formats for variant lookup
      }
    }

    const variants = await this.variantModel
      .find({ _id: { $in: normalizedVariantIds } })
      .select('_id productId')
      .lean();

    const variantIdSet = new Set(variants.map(v => String(v._id)));
    const directProductIds = ids.filter(id => !variantIdSet.has(id));

    const validDirectProductIds: string[] = [];
    for (const id of directProductIds) {
      try {
        // Ensure the id can be interpreted as ObjectId
        void new Types.ObjectId(id);
        validDirectProductIds.push(id);
      } catch {
        // ignore invalid ids
      }
    }

    const combinedProductIds = Array.from(
      new Set([
        ...variants.map(v => String(v.productId)),
        ...validDirectProductIds,
      ]),
    );

    const typedVariants: Array<{ _id: Types.ObjectId; productId: Types.ObjectId }> = [];
    for (const variant of variants) {
      try {
        typedVariants.push({
          _id: new Types.ObjectId(variant._id),
          productId: new Types.ObjectId(variant.productId),
        });
      } catch {
        this.logger.warn(
          `Skipping variant ${variant._id?.toString?.() ?? String(variant._id)} due to invalid ObjectId formatting`,
        );
      }
    }

    return { variants: typedVariants, combinedProductIds };
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
    // Handle backward compatibility: if linkUrl is provided but navigationType is not set, use external_url
    let navigationType = dto.navigationType ?? BannerNavigationType.NONE;
    let navigationTarget = dto.navigationTarget;
    
    if (dto.linkUrl && !dto.navigationType && !dto.navigationTarget) {
      navigationType = BannerNavigationType.EXTERNAL_URL;
      navigationTarget = dto.linkUrl;
    }
    
    const banner = new this.bannerModel({
      ...dto,
      navigationType,
      navigationTarget,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      clickCount: 0,
      viewCount: 0,
    });

    const savedBanner = await banner.save();
    const populatedBanner = await this.bannerModel.findById(savedBanner._id).populate('imageId').lean<BannerWithPopulatedImage>();
    if (!populatedBanner) throw new Error('Failed to create banner');
    return this.formatBannerForResponse(populatedBanner);
  }

  async updateBanner(id: string, dto: UpdateBannerDto): Promise<Banner | null> {
    // Handle backward compatibility: if linkUrl is provided but navigationType is not set, use external_url
    const updateData: Record<string, unknown> = { ...dto };
    
    if (dto.linkUrl && !dto.navigationType && !dto.navigationTarget) {
      updateData.navigationType = BannerNavigationType.EXTERNAL_URL;
      updateData.navigationTarget = dto.linkUrl;
    }
    
    const updated = await this.bannerModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return null;
    const banner = await this.bannerModel.findById(id).populate('imageId').lean<BannerWithPopulatedImage>();
    if (!banner) return null;
    return this.formatBannerForResponse(banner);
  }

  async getBanner(id: string): Promise<Banner | null> {
    const banner = await this.bannerModel.findById(id).populate('imageId').lean<BannerWithPopulatedImage>();
    if (!banner) return null;
    return this.formatBannerForResponse(banner);
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
      this.bannerModel.find(query).populate('imageId').skip(skip).limit(limit).sort(sort).lean<BannerWithPopulatedImage[]>(),
      this.bannerModel.countDocuments(query),
    ]);

    return {
      data: banners.map(banner => this.formatBannerForResponse(banner)),
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

  /**
   * Deactivate expired banners automatically
   * Called by cron job to update banners that have passed their endDate
   */
  async deactivateExpiredBanners(): Promise<{ deactivated: number }> {
    const now = new Date();
    
    const result = await this.bannerModel.updateMany(
      {
        isActive: true,
        deletedAt: null,
        endDate: { $exists: true, $lt: now },
      },
      {
        $set: { isActive: false },
      },
    );

    return { deactivated: result.modifiedCount };
  }

  async getActiveBanners(
    location?: BannerLocation,
    userRoles?: string[],
  ): Promise<PublicBannerResponse[]> {
    if (!userRoles || userRoles.length === 0) {
      // No user roles provided - return empty array (authentication required)
      return [];
    }

    const now = new Date();
    const query: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } },
          ],
        },
      ],
    };

    if (location) query.location = location;

    // Get all banners that match the query
    const allBanners = await this.bannerModel.find(query).populate('imageId').sort({ sortOrder: 1 }).lean<BannerWithPopulatedImage[]>();

    // Filter by user types
    // If banner has no targetUserTypes (empty array), it's visible to everyone
    // If banner has targetUserTypes, it's visible only if user has one of the target roles
    const visibleBanners = allBanners.filter((banner) => {
      // Banner with no targeting is visible to everyone
      if (!banner.targetUserTypes || banner.targetUserTypes.length === 0) {
        return true;
      }

      // Check if user has matching roles
      return banner.targetUserTypes.some((targetType) => userRoles.includes(targetType));
    });

    return visibleBanners.map((banner) => this.mapPublicBannerResponse(banner));
  }

  /**
   * Format banner for API response with navigation information
   */
  private formatBannerForResponse(banner: BannerWithPopulatedImage): Banner {
    // Ensure navigation information is properly structured
    const formatted: Banner = { ...banner } as unknown as Banner;
    
    // Backward compatibility: if navigationType is not set but linkUrl exists, use it
    if (!formatted.navigationType && formatted.linkUrl) {
      formatted.navigationType = BannerNavigationType.EXTERNAL_URL;
      formatted.navigationTarget = formatted.linkUrl;
    }
    
    // If navigationType is NONE, ensure navigationTarget is not set
    if (formatted.navigationType === BannerNavigationType.NONE) {
      formatted.navigationTarget = undefined;
    }
    
    return formatted;
  }

  private mapPublicBannerResponse(banner: BannerWithPopulatedImage): PublicBannerResponse {
    const formatted = this.formatBannerForResponse(banner);

    const imageRecord =
      formatted.imageId && typeof formatted.imageId === 'object'
        ? (formatted.imageId as Media)
        : null;

    const imageIdValue = (imageRecord as unknown as { _id?: Types.ObjectId | string })?._id;

    const image = imageRecord?.url
      ? {
          ...(imageIdValue ? { id: imageIdValue.toString() } : {}),
          url: imageRecord.url,
        }
      : null;

    const navigationParams =
      formatted.navigationParams && Object.keys(formatted.navigationParams).length > 0
        ? formatted.navigationParams
        : undefined;

    const id = banner._id?.toString?.() ?? '';

    return {
      id,
      image,
      ...(formatted.linkUrl ? { linkUrl: formatted.linkUrl } : {}),
      navigationType: formatted.navigationType ?? BannerNavigationType.NONE,
      ...(formatted.navigationTarget ? { navigationTarget: formatted.navigationTarget } : {}),
      ...(navigationParams ? { navigationParams } : {}),
      location: formatted.location,
      sortOrder: formatted.sortOrder ?? 0,
      isActive: !!formatted.isActive,
      ...(formatted.altText ? { altText: formatted.altText } : {}),
    };
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
