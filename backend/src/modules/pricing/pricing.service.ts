import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { PriceRule, PriceRuleDocument } from '../promotions/schemas/price-rule.schema';
import { VariantPrice } from '../catalog/schemas/variant-price.schema';
import { Variant } from '../catalog/schemas/variant.schema';
import { Product } from '../catalog/schemas/product.schema';

export interface CalculatePriceParams {
  variantId: string;
  currency: string;
  quantity?: number;
  userId?: string;
  accountType?: string;
  couponCode?: string;
}

export interface PriceResult {
  variantId: string;
  originalPrice: number;
  finalPrice: number;
  discount: number;
  discountPercentage: number;
  appliedPromotion?: PriceRule;
  badge?: string;
  savings: number;
  currency: string;
}

export interface CartItem {
  variantId: string;
  quantity: number;
}

export interface CartPricingResult {
  items: Array<PriceResult & { quantity: number; subtotal: number; finalTotal: number }>;
  subtotal: number;
  totalDiscount: number;
  total: number;
  totalSavings: number;
  appliedPromotions: PriceRule[];
  currency: string;
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    @InjectModel(PriceRule.name) private priceRuleModel: Model<PriceRule>,
    @InjectModel(VariantPrice.name) private variantPriceModel: Model<VariantPrice>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  /**
   * Calculate price for a single variant with applicable promotions
   */
  async calculateVariantPrice(params: CalculatePriceParams): Promise<PriceResult> {
    const { variantId, currency, quantity = 1, accountType, couponCode } = params;

    try {
      // 1. Get base price
      const basePrice = await this.getBasePrice(variantId, currency, accountType);

      if (!basePrice) {
        throw new Error(`Price not found for variant ${variantId} in currency ${currency}`);
      }

      // 2. Find applicable promotions
      const applicablePromotions = await this.findApplicablePromotions({
        variantId,
        currency,
        quantity,
        accountType,
        couponCode,
      });

      // 3. Select best promotion (highest priority and most savings)
      const bestPromotion = this.selectBestPromotion(applicablePromotions, basePrice);

      // 4. Calculate final price
      const finalPrice = bestPromotion
        ? this.applyPromotionToPrice(basePrice, bestPromotion)
        : basePrice;

      const discount = basePrice - finalPrice;
      const discountPercentage = basePrice > 0 ? (discount / basePrice) * 100 : 0;

      return {
        variantId,
        originalPrice: basePrice,
        finalPrice,
        discount,
        discountPercentage,
        appliedPromotion: bestPromotion,
        badge: bestPromotion?.effects.badge,
        savings: discount,
        currency,
      };
    } catch (error) {
      this.logger.error(`Error calculating price for variant ${variantId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate total for multiple items (cart)
   */
  async calculateCartPricing(
    items: CartItem[],
    currency: string,
    userId?: string,
    accountType?: string,
    couponCode?: string,
  ): Promise<CartPricingResult> {
    try {
      // Calculate price for each item
      const itemResults = await Promise.all(
        items.map(async (item) => {
          const priceResult = await this.calculateVariantPrice({
            variantId: item.variantId,
            currency,
            quantity: item.quantity,
            userId,
            accountType,
            couponCode,
          });

          return {
            ...priceResult,
            quantity: item.quantity,
            subtotal: priceResult.originalPrice * item.quantity,
            finalTotal: priceResult.finalPrice * item.quantity,
          };
        }),
      );

      // Calculate totals
      const subtotal = itemResults.reduce((sum, item) => sum + item.subtotal, 0);
      const total = itemResults.reduce((sum, item) => sum + item.finalTotal, 0);
      const totalDiscount = subtotal - total;
      const totalSavings = totalDiscount;

      // Collect all applied promotions (unique)
      const appliedPromotionsMap = new Map<string, PriceRule>();
      itemResults.forEach((item) => {
        if (item.appliedPromotion) {
          // استخدام نوع PriceRuleDocument من Mongoose الذي يحتوي على خاصية _id
          appliedPromotionsMap.set((item.appliedPromotion as PriceRuleDocument)._id.toString(), item.appliedPromotion);
        }
      });

      return {
        items: itemResults,
        subtotal,
        totalDiscount,
        total,
        totalSavings,
        appliedPromotions: Array.from(appliedPromotionsMap.values()),
        currency,
      };
    } catch (error) {
      this.logger.error('Error calculating cart pricing:', error);
      throw error;
    }
  }

  /**
   * Get base price for a variant
   */
  private async getBasePrice(
    variantId: string,
    currency: string,
    accountType?: string,
  ): Promise<number> {
    const variantPrice = await this.variantPriceModel.findOne({ variantId, currency }).lean();

    if (!variantPrice) {
      return 0;
    }

    // Return wholesale price if account is wholesale and it's set
    if (accountType === 'wholesale' && variantPrice.wholesaleAmount) {
      return variantPrice.wholesaleAmount;
    }

    return variantPrice.amount;
  }

  /**
   * Find all applicable promotions for the given params
   */
  private async findApplicablePromotions(params: {
    variantId: string;
    currency: string;
    quantity: number;
    accountType?: string;
    couponCode?: string;
  }): Promise<PriceRule[]> {
    const { variantId, currency, quantity, accountType, couponCode } = params;
    const now = new Date();

    // Get variant details for checking conditions
    const variant = await this.variantModel.findById(variantId).lean();
    if (!variant) return [];

    const product = await this.productModel.findById(variant.productId).lean();
    if (!product) return [];

    // Build query
    const query: FilterQuery<PriceRuleDocument> = {
      active: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    };

    // If coupon code is provided, prioritize it
    if (couponCode) {
      query.couponCode = couponCode;
    }

    // Find all active rules
    const allRules = await this.priceRuleModel.find(query).sort({ priority: -1 }).lean();

    // Filter rules based on conditions
    const applicableRules = allRules.filter((rule) => {
      const cond = rule.conditions;

      // Check variant-specific
      if (cond.variantId && cond.variantId !== variantId) return false;

      // Check product-specific
      if (cond.productId && cond.productId !== variant.productId.toString()) return false;

      // Check category-specific
      if (cond.categoryId && cond.categoryId !== product.categoryId) return false;

      // Check brand-specific
      if (cond.brandId && cond.brandId !== product.brandId) return false;

      // Check currency
      if (cond.currency && cond.currency !== currency) return false;

      // Check minimum quantity
      if (cond.minQty && quantity < cond.minQty) return false;

      // Check account type
      if (cond.accountType && cond.accountType !== accountType) return false;

      // Check usage limits
      if (rule.usageLimits) {
        if (rule.usageLimits.maxUses && rule.usageLimits.currentUses >= rule.usageLimits.maxUses) {
          return false;
        }
        // TODO: Check maxUsesPerUser when we have user context
      }

      return true;
    });

    return applicableRules;
  }

  /**
   * Select the best promotion from applicable ones
   */
  private selectBestPromotion(promotions: PriceRule[], basePrice: number): PriceRule | undefined {
    if (promotions.length === 0) return undefined;

    // Calculate savings for each promotion
    const promotionsWithSavings = promotions.map((promo) => ({
      promotion: promo,
      savings: basePrice - this.applyPromotionToPrice(basePrice, promo),
    }));

    // Sort by savings (descending), then by priority (descending)
    promotionsWithSavings.sort((a, b) => {
      if (a.savings !== b.savings) {
        return b.savings - a.savings; // Higher savings first
      }
      return b.promotion.priority - a.promotion.priority; // Higher priority first
    });

    return promotionsWithSavings[0].promotion;
  }

  /**
   * Apply a promotion to a base price
   */
  private applyPromotionToPrice(basePrice: number, promotion: PriceRule): number {
    const effects = promotion.effects;

    if (effects.specialPrice !== undefined) {
      return effects.specialPrice;
    }

    if (effects.percentOff !== undefined) {
      return basePrice * (1 - effects.percentOff / 100);
    }

    if (effects.amountOff !== undefined) {
      return Math.max(0, basePrice - effects.amountOff);
    }

    return basePrice;
  }

  /**
   * Increment usage count for a promotion (called after order is placed)
   */
  async incrementPromotionUsage(promotionId: string): Promise<void> {
    try {
      await this.priceRuleModel.updateOne(
        { _id: promotionId },
        {
          $inc: {
            'usageLimits.currentUses': 1,
            'stats.appliedCount': 1,
          },
        },
      );

      this.logger.log(`Incremented usage for promotion ${promotionId}`);
    } catch (error) {
      this.logger.error(`Error incrementing promotion usage:`, error);
    }
  }

  /**
   * Update promotion statistics (revenue, savings)
   */
  async updatePromotionStats(promotionId: string, revenue: number, savings: number): Promise<void> {
    try {
      await this.priceRuleModel.updateOne(
        { _id: promotionId },
        {
          $inc: {
            'stats.revenue': revenue,
            'stats.savings': savings,
          },
        },
      );

      this.logger.log(`Updated stats for promotion ${promotionId}`);
    } catch (error) {
      this.logger.error(`Error updating promotion stats:`, error);
    }
  }

  /**
   * Validate a coupon code
   */
  async validateCoupon(couponCode: string): Promise<{
    valid: boolean;
    promotion?: PriceRule;
    message?: string;
  }> {
    const now = new Date();

    const promotion = await this.priceRuleModel
      .findOne({
        couponCode,
        active: true,
      })
      .lean();

    if (!promotion) {
      return { valid: false, message: 'Coupon code not found' };
    }

    if (promotion.startAt > now) {
      return { valid: false, message: 'Coupon not yet active' };
    }

    if (promotion.endAt < now) {
      return { valid: false, message: 'Coupon expired' };
    }

    if (promotion.usageLimits) {
      if (
        promotion.usageLimits.maxUses &&
        promotion.usageLimits.currentUses >= promotion.usageLimits.maxUses
      ) {
        return { valid: false, message: 'Coupon usage limit reached' };
      }
    }

    return { valid: true, promotion };
  }
}
