import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

export enum CouponType {
  PERCENTAGE = 'percentage',           // خصم نسبة مئوية
  FIXED_AMOUNT = 'fixed_amount',       // خصم مبلغ ثابت
  FREE_SHIPPING = 'free_shipping',     // شحن مجاني
  BUY_X_GET_Y = 'buy_x_get_y',        // اشتر X واحصل على Y
  FIRST_ORDER = 'first_order',         // خصم الطلب الأول
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  EXHAUSTED = 'exhausted',             // انتهت الاستخدامات
}

export enum CouponVisibility {
  PUBLIC = 'public',                   // متاح للجميع
  PRIVATE = 'private',                 // يحتاج دعوة
  AUTO_APPLY = 'auto_apply',           // يطبق تلقائياً
}

export enum DiscountAppliesTo {
  ENTIRE_ORDER = 'entire_order',       // على الطلب كله
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  SPECIFIC_BRANDS = 'specific_brands',
  CHEAPEST_ITEM = 'cheapest_item',     // على أرخص منتج
  MOST_EXPENSIVE = 'most_expensive',   // على أغلى منتج
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: Object.values(CouponType), required: true })
  type!: CouponType;

  @Prop({ type: String, enum: Object.values(CouponStatus), default: CouponStatus.ACTIVE })
  status!: CouponStatus;

  @Prop({ type: String, enum: Object.values(CouponVisibility), default: CouponVisibility.PUBLIC })
  visibility!: CouponVisibility;

  // ===== Discount Configuration =====
  @Prop()
  discountPercentage?: number;         // للنسبة المئوية (0-100)

  @Prop()
  discountAmount?: number;             // للمبلغ الثابت

  @Prop()
  maxDiscountAmount?: number;          // الحد الأقصى للخصم (cap)

  @Prop({ type: String, enum: Object.values(DiscountAppliesTo), default: DiscountAppliesTo.ENTIRE_ORDER })
  appliesTo!: DiscountAppliesTo;

  @Prop({ type: [String], default: [] })
  applicableProductIds?: string[];     // منتجات محددة

  @Prop({ type: [String], default: [] })
  applicableCategoryIds?: string[];    // فئات محددة

  @Prop({ type: [String], default: [] })
  applicableBrandIds?: string[];       // براندات محددة

  // ===== Conditions =====
  @Prop()
  minOrderAmount?: number;             // الحد الأدنى لقيمة الطلب

  @Prop()
  minQuantity?: number;                // الحد الأدنى لعدد المنتجات

  @Prop({ type: String })
  currency?: string;                   // العملة (YER, SAR, USD)

  @Prop({ type: [String], enum: ['retail', 'wholesale', 'engineer'], default: [] })
  allowedAccountTypes?: string[];      // أنواع الحسابات المسموحة

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  allowedUserIds?: Types.ObjectId[];   // مستخدمين محددين

  @Prop({ default: false })
  firstOrderOnly!: boolean;            // للطلب الأول فقط

  @Prop({ default: false })
  newUsersOnly!: boolean;              // للمستخدمين الجدد فقط

  // ===== Usage Limits =====
  @Prop()
  maxTotalUses?: number;               // الحد الأقصى للاستخدام الكلي

  @Prop({ default: 0 })
  currentUses!: number;                // عدد الاستخدامات الحالية

  @Prop({ default: 1 })
  maxUsesPerUser!: number;             // الحد الأقصى لكل مستخدم

  @Prop({ default: false })
  oneTimeUse!: boolean;                // استخدام مرة واحدة فقط

  // ===== Date Range =====
  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  // ===== Buy X Get Y Configuration =====
  @Prop({ type: Object })
  buyXGetY?: {
    buyQuantity: number;               // اشتر كم
    getQuantity: number;               // احصل على كم
    productId?: string;                // منتج محدد
    categoryId?: string;               // أو فئة محددة
  };

  // ===== Advanced Features =====
  @Prop({ default: false })
  stackable!: boolean;                 // يمكن دمجه مع كوبونات أخرى

  @Prop({ default: false })
  excludeSaleItems!: boolean;          // استبعاد المنتجات المخفضة

  @Prop({ type: [String], default: [] })
  excludedProductIds?: string[];       // منتجات مستثناة

  @Prop({ type: [String], default: [] })
  excludedCategoryIds?: string[];      // فئات مستثناة

  // ===== Tracking & Analytics =====
  @Prop({ type: Object, default: { views: 0, applies: 0, successfulOrders: 0, failedAttempts: 0, totalRevenue: 0, totalDiscount: 0 } })
  stats!: {
    views: number;                     // عدد المشاهدات
    applies: number;                   // عدد مرات التطبيق
    successfulOrders: number;          // الطلبات الناجحة
    failedAttempts: number;            // المحاولات الفاشلة
    totalRevenue: number;              // إجمالي الإيرادات
    totalDiscount: number;             // إجمالي الخصومات
  };

  // ===== User Tracking =====
  @Prop({ type: [{ userId: Types.ObjectId, usedAt: Date, orderId: Types.ObjectId }], default: [] })
  usageHistory?: Array<{
    userId: Types.ObjectId;
    usedAt: Date;
    orderId: Types.ObjectId;
  }>;

  // ===== Metadata =====
  @Prop({ type: Object, default: {} })
  metadata?: {
    campaign?: string;                 // الحملة الإعلانية
    source?: string;                   // المصدر
    notes?: string;                    // ملاحظات
    tags?: string[];                   // وسوم
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// Indexes
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ status: 1, visibility: 1 });
CouponSchema.index({ startDate: 1, endDate: 1 });
CouponSchema.index({ type: 1 });
CouponSchema.index({ deletedAt: 1 });
CouponSchema.index({ 'stats.successfulOrders': -1 });

