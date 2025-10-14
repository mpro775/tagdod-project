import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

export enum BannerType {
  IMAGE = 'image',
  VIDEO = 'video',
  CAROUSEL = 'carousel',
}

export enum BannerLocation {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  HOME_BOTTOM = 'home_bottom',
  CATEGORY_TOP = 'category_top',
  PRODUCT_SIDEBAR = 'product_sidebar',
  CUSTOM = 'custom',
}

export enum BannerPromotionType {
  NONE = 'none',           // إعلان عادي
  PRICE_RULE = 'price_rule', // مرتبط بعرض حقيقي
  COUPON = 'coupon',       // مرتبط بكوبون
}

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ type: String, enum: Object.values(BannerType), default: BannerType.IMAGE })
  type!: BannerType;

  @Prop({ type: String, enum: Object.values(BannerLocation), default: BannerLocation.HOME_TOP })
  location!: BannerLocation;

  @Prop({ default: '' })
  linkUrl?: string;

  @Prop({ default: '' })
  linkText?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ default: 0 })
  clickCount!: number;

  @Prop({ default: 0 })
  viewCount!: number;

  @Prop({ type: String, enum: Object.values(BannerPromotionType), default: BannerPromotionType.NONE })
  promotionType!: BannerPromotionType;

  @Prop({ type: Types.ObjectId, ref: 'PriceRule' })
  linkedPriceRuleId?: Types.ObjectId;

  @Prop()
  linkedCouponCode?: string;

  @Prop({ default: 0 })
  conversionCount!: number;

  @Prop({ default: 0 })
  revenue!: number;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

// Indexes
BannerSchema.index({ isActive: 1, location: 1, sortOrder: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });

