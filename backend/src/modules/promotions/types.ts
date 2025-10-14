import { PriceRule } from './schemas/price-rule.schema';

export interface EffectivePriceResult {
  originalPrice: number;
  effectivePrice: number;
  appliedRule?: PriceRule;
  savings?: number;
  badge?: string;
  giftSku?: string;
}
