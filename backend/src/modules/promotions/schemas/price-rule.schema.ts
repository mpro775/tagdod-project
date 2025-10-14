import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PriceRuleDocument = HydratedDocument<PriceRule>;

@Schema({ timestamps: true })
export class PriceRule {
  @Prop({ default: true }) active!: boolean;
  @Prop({ required: true, default: 0 }) priority!: number;
  @Prop({ required: true }) startAt!: Date;
  @Prop({ required: true }) endAt!: Date;

  @Prop({
    type: {
      categoryId: String,
      productId: String,
      variantId: String,
      brandId: String,
      currency: String,
      minQty: Number,
      accountType: String,
    },
    default: {},
  })
  conditions!: {
    categoryId?: string;
    productId?: string;
    variantId?: string;
    brandId?: string;
    currency?: string;
    minQty?: number;
    accountType?: string;
  };

  @Prop({
    type: {
      percentOff: Number,
      amountOff: Number,
      specialPrice: Number,
      badge: String,
      giftSku: String,
    },
    default: {},
  })
  effects!: {
    percentOff?: number;
    amountOff?: number;
    specialPrice?: number;
    badge?: string;
    giftSku?: string;
  };

  @Prop({
    type: {
      maxUses: Number,
      maxUsesPerUser: Number,
      currentUses: { type: Number, default: 0 },
    },
  })
  usageLimits?: {
    maxUses?: number;
    maxUsesPerUser?: number;
    currentUses: number;
  };

  @Prop({
    type: {
      title: String,
      description: String,
      termsAndConditions: String,
    },
  })
  metadata?: {
    title?: string;
    description?: string;
    termsAndConditions?: string;
  };

  @Prop({
    type: {
      views: { type: Number, default: 0 },
      appliedCount: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      savings: { type: Number, default: 0 },
    },
    default: { views: 0, appliedCount: 0, revenue: 0, savings: 0 },
  })
  stats!: {
    views: number;
    appliedCount: number;
    revenue: number;
    savings: number;
  };

  @Prop()
  couponCode?: string;
}

export const PriceRuleSchema = SchemaFactory.createForClass(PriceRule);
PriceRuleSchema.index({ active: 1, startAt: 1, endAt: 1 });
PriceRuleSchema.index({ priority: -1 });
PriceRuleSchema.index({ couponCode: 1 });
