import { BaseEntity, ListParams } from '@/shared/types/common.types';

export interface PriceRule extends BaseEntity {
  active: boolean;
  priority: number;
  startAt: Date;
  endAt: Date;
  conditions: {
    categoryId?: string;
    productId?: string;
    variantId?: string;
    brandId?: string;
    currency?: string;
    minQty?: number;
    accountType?: string;
  };
  effects: {
    percentOff?: number;
    amountOff?: number;
    specialPrice?: number;
    badge?: string;
    giftSku?: string;
  };
  usageLimits?: {
    maxUses?: number;
    maxUsesPerUser?: number;
    currentUses: number;
  };
  metadata?: {
    title?: string;
    description?: string;
    termsAndConditions?: string;
  };
  stats: {
    views: number;
    appliedCount: number;
    revenue: number;
    savings: number;
  };
  couponCode?: string;
}

export interface CreatePriceRuleDto {
  active?: boolean;
  priority?: number;
  startAt: string;
  endAt: string;
  conditions?: PriceRule['conditions'];
  effects: PriceRule['effects'];
  usageLimits?: PriceRule['usageLimits'];
  metadata?: PriceRule['metadata'];
  couponCode?: string;
}

export interface UpdatePriceRuleDto extends Partial<CreatePriceRuleDto> {}

export interface ListPriceRulesParams extends ListParams {
  active?: boolean;
}

