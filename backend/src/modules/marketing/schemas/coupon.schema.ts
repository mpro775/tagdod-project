import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  EXHAUSTED = 'exhausted',
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
}

export enum CouponVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  HIDDEN = 'hidden',
}

export enum DiscountAppliesTo {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  SPECIFIC_BRANDS = 'specific_brands',
  MINIMUM_ORDER_AMOUNT = 'minimum_order_amount',
}

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true }) code!: string;
  @Prop({ required: true }) name!: string;
  @Prop() description?: string;

  @Prop({ type: String, enum: CouponType, default: CouponType.PERCENTAGE })
  type!: CouponType;

  @Prop({ type: String, enum: CouponStatus, default: CouponStatus.ACTIVE })
  status!: CouponStatus;

  @Prop({ type: String, enum: CouponVisibility, default: CouponVisibility.PUBLIC })
  visibility!: CouponVisibility;

  // Discount configuration
  @Prop() discountValue?: number; // Percentage or fixed amount
  @Prop() minimumOrderAmount?: number;
  @Prop() maximumDiscountAmount?: number;

  // Usage limits
  @Prop() usageLimit?: number; // Total usage limit
  @Prop() usageLimitPerUser?: number; // Per user limit
  @Prop({ default: 0 }) usedCount!: number; // Current usage count

  // Validity
  @Prop({ required: true }) validFrom!: Date;
  @Prop() validUntil?: Date; // Nullable for engineer coupons (unlimited)

  // Product restrictions
  @Prop({ type: String, enum: DiscountAppliesTo, default: DiscountAppliesTo.ALL_PRODUCTS })
  appliesTo!: DiscountAppliesTo;

  @Prop({ type: [String], default: [] })
  applicableProductIds!: string[];

  @Prop({ type: [String], default: [] })
  applicableCategoryIds!: string[];

  @Prop({ type: [String], default: [] })
  applicableBrandIds!: string[];

  // User restrictions
  @Prop({ type: [String], default: [] })
  applicableUserIds!: string[];

  @Prop({ type: [String], default: [] })
  excludedUserIds!: string[];

  // Buy X Get Y configuration
  @Prop() buyXQuantity?: number;
  @Prop() getYQuantity?: number;
  @Prop() getYProductId?: string;

  // Statistics
  @Prop({ default: 0 }) totalRedemptions!: number;
  @Prop({ default: 0 }) totalDiscountGiven!: number;
  @Prop({ default: 0 }) totalRevenue!: number;

  // Soft delete
  @Prop() deletedAt?: Date;
  @Prop() deletedBy?: string;

  // Admin tracking
  @Prop() createdBy?: string;
  @Prop() lastModifiedBy?: string;

  // Engineer Coupon Fields
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  engineerId?: Types.ObjectId; // معرف المهندس المالك للكوبون

  @Prop({ min: 0, max: 100 })
  commissionRate?: number; // نسبة العمولة (0-100)

  // تتبع الاستخدامات
  @Prop({ type: [Object], default: [] })
  usageHistory!: Array<{
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    discountAmount: number;
    commissionAmount: number;
    usedAt: Date;
  }>;

  // إحصائيات الكوبون
  @Prop({ default: 0 })
  totalCommissionEarned!: number; // إجمالي العمولات المكتسبة
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
CouponSchema.index({ code: 1 });
CouponSchema.index({ status: 1, validFrom: 1, validUntil: 1 });
CouponSchema.index({ visibility: 1 });
CouponSchema.index({ deletedAt: 1 });
CouponSchema.index({ engineerId: 1 }); // Index for engineer coupons
