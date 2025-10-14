import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

export enum CartStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  CONVERTED = 'converted',
  EXPIRED = 'expired',
}

@Schema({ _id: false })
export class CartItem {
  _id?: string;

  @Prop({ type: Types.ObjectId, ref: 'Variant', required: true })
  variantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 999, default: 1 })
  qty!: number;

  @Prop({ default: () => new Date() })
  addedAt!: Date;

  // 🆕 Cached product info (for faster display and history)
  @Prop({ type: Object })
  productSnapshot?: {
    name: string;
    slug: string;
    image?: string;
    brandId?: string;
    brandName?: string;
    categoryId?: string;
  };

  // 🆕 Cached pricing (updated on cart operations)
  @Prop({ type: Object })
  pricing?: {
    currency: string;
    basePrice: number;
    finalPrice: number;
    discount: number;
    appliedPromotionId?: string;
  };
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, sparse: true })
  userId?: Types.ObjectId;

  @Prop({ type: String, index: true, sparse: true })
  deviceId?: string;

  @Prop({ type: String, enum: Object.values(CartStatus), default: CartStatus.ACTIVE })
  status!: CartStatus;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItem[];

  // 🆕 Cart Settings
  @Prop({ default: 'YER' })
  currency!: string;

  @Prop()
  accountType?: string; // retail/wholesale/engineer

  // 🆕 Coupon Support
  @Prop()
  appliedCouponCode?: string;

  @Prop({ default: 0 })
  couponDiscount!: number;

  @Prop({ type: [String], default: [] })
  autoAppliedCouponCodes?: string[];

  @Prop({ type: [Number], default: [] })
  autoAppliedDiscounts?: number[];

  // 🆕 Pricing Summary (cached)
  @Prop({ type: Object })
  pricingSummary?: {
    subtotal: number;
    promotionDiscount: number;
    couponDiscount: number;
    autoDiscount: number;
    totalDiscount: number;
    total: number;
    itemsCount: number;
    currency: string;
    lastCalculatedAt: Date;
  };

  // 🆕 Abandoned Cart Tracking
  @Prop({ type: Date })
  lastActivityAt?: Date;

  @Prop({ default: false })
  isAbandoned!: boolean;

  @Prop({ default: 0 })
  abandonmentEmailsSent!: number;

  @Prop({ type: Date })
  lastAbandonmentEmailAt?: Date;

  // 🆕 Conversion Tracking
  @Prop({ type: Types.ObjectId, ref: 'Order' })
  convertedToOrderId?: Types.ObjectId;

  @Prop({ type: Date })
  convertedAt?: Date;

  // 🆕 Guest to User Migration
  @Prop({ default: false })
  isMerged!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  mergedIntoUserId?: Types.ObjectId;

  @Prop({ type: Date })
  mergedAt?: Date;

  // 🆕 Metadata
  @Prop({ type: Object, default: {} })
  metadata?: {
    source?: string; // web/mobile/app
    campaign?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };

  // 🆕 Expiration
  @Prop({ type: Date })
  expiresAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Performance indexes
CartSchema.index({ userId: 1, status: 1, updatedAt: -1 });
CartSchema.index({ deviceId: 1, status: 1, updatedAt: -1 });
CartSchema.index({ status: 1, lastActivityAt: -1 });
CartSchema.index({ isAbandoned: 1, abandonmentEmailsSent: 1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CartSchema.index({ createdAt: -1 });
CartSchema.index({ updatedAt: -1 });
CartSchema.index({ convertedToOrderId: 1 }, { sparse: true });
