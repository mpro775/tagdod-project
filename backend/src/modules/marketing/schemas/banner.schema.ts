import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from '../../users/schemas/user.schema';

export enum BannerLocation {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  HOME_BOTTOM = 'home_bottom',
  CATEGORY_TOP = 'category_top',
  PRODUCT_PAGE = 'product_page',
  CART_PAGE = 'cart_page',
  CHECKOUT_PAGE = 'checkout_page',
  SIDEBAR = 'sidebar',
  FOOTER = 'footer',
}

export enum BannerPromotionType {
  DISCOUNT = 'discount',
  FREE_SHIPPING = 'free_shipping',
  NEW_ARRIVAL = 'new_arrival',
  SALE = 'sale',
  SEASONAL = 'seasonal',
  BRAND_PROMOTION = 'brand_promotion',
}

export enum BannerNavigationType {
  EXTERNAL_URL = 'external_url', // رابط خارجي
  CATEGORY = 'category', // فئة معينة
  PRODUCT = 'product', // منتج معين
  SECTION = 'section', // قسم/شاشة معينة في التطبيق
  NONE = 'none', // بدون تنقل
}

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true }) title!: string;
  @Prop() description?: string;
  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  imageId!: string; // Reference to Media collection
  @Prop() linkUrl?: string; // Legacy field - kept for backward compatibility
  @Prop() altText?: string;
  
  // Navigation settings
  @Prop({ type: String, enum: BannerNavigationType, default: BannerNavigationType.NONE })
  navigationType!: BannerNavigationType;
  
  @Prop() navigationTarget?: string; // Category ID, Product ID, Section name, or external URL
  @Prop({ type: MongooseSchema.Types.Mixed }) navigationParams?: Record<string, unknown>; // Additional parameters for navigation
  
  @Prop({ type: String, enum: BannerLocation, required: true })
  location!: BannerLocation;
  
  @Prop({ type: String, enum: BannerPromotionType })
  promotionType?: BannerPromotionType;
  
  @Prop({ default: true }) isActive!: boolean;
  @Prop({ default: 0 }) sortOrder!: number;
  
  // Display settings
  @Prop() startDate?: Date;
  @Prop() endDate?: Date;
  @Prop() displayDuration?: number; // in seconds
  
  // Targeting
  @Prop({ type: [String], default: [] })
  targetAudiences!: string[];
  
  @Prop({ type: [String], enum: Object.values(UserRole), default: [] })
  targetUserTypes!: UserRole[];
  
  @Prop({ type: [String], default: [] })
  targetCategories!: string[];
  
  @Prop({ type: [String], default: [] })
  targetProducts!: string[];
  
  // Statistics
  @Prop({ default: 0 }) viewCount!: number;
  @Prop({ default: 0 }) clickCount!: number;
  @Prop({ default: 0 }) conversionCount!: number;
  
  // Admin tracking
  @Prop() createdBy?: string;
  @Prop() lastModifiedBy?: string;
  
  // Soft delete
  @Prop() deletedAt?: Date;
  @Prop() deletedBy?: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
BannerSchema.index({ location: 1, isActive: 1, sortOrder: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
BannerSchema.index({ deletedAt: 1 });
