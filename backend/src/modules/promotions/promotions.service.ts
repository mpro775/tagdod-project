import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceRule, PriceRuleDocument } from './schemas/price-rule.schema';
import { CreatePriceRuleDto, UpdatePriceRuleDto, PreviewPriceRuleDto, PricingQueryDto } from './dto/price-rule.dto';
import { EffectivePriceResult } from './types';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(PriceRule.name) private priceRuleModel: Model<PriceRuleDocument>,
  ) {}

  // CRUD operations for PriceRules
  async createPriceRule(dto: CreatePriceRuleDto): Promise<PriceRule> {
    return this.priceRuleModel.create({
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
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

  // Preview price rule effect on a variant
  async previewPriceRule(dto: PreviewPriceRuleDto): Promise<EffectivePriceResult | null> {
    const rule = await this.priceRuleModel.findById(dto.ruleId);
    if (!rule || !rule.active) return null;

    // This would need integration with catalog service to get variant details
    // For now, return a mock result
    return {
      originalPrice: 100, // This should come from catalog service
      effectivePrice: 80, // This should be calculated based on rule
      appliedRule: rule,
      savings: 20,
    };
  }

  // Calculate effective price for a variant with promotions applied
  async calculateEffectivePrice(dto: PricingQueryDto): Promise<EffectivePriceResult> {
    const now = new Date();
    const { variantId, currency = 'YER', qty = 1, accountType } = dto;

    // Get base price from catalog service (mock for now)
    const originalPrice = 100; // This should come from VariantPrice

    // Find applicable rules
    const applicableRules = await this.priceRuleModel.find({
      active: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).sort({ priority: -1 });

    // Filter rules based on conditions
    const matchingRules = applicableRules.filter(rule => {
      const cond = rule.conditions;

      // Check variant-specific conditions
      if (cond.variantId && cond.variantId !== variantId) return false;
      // Note: productId, categoryId, brandId checks would require catalog service integration

      // Check currency
      if (cond.currency && cond.currency !== currency) return false;

      // Check quantity
      if (cond.minQty && qty < cond.minQty) return false;

      // Check account type
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
}
