import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

/**
 * حالات الطلب - نظام مبسط
 */
export enum OrderStatus {
  // المسار الأساسي
  PENDING_PAYMENT = 'pending_payment', // في انتظار الدفع
  CONFIRMED = 'confirmed', // مؤكد ومدفوع
  PROCESSING = 'processing', // قيد التجهيز
  COMPLETED = 'completed', // مكتمل

  // حالات استثنائية
  ON_HOLD = 'on_hold', // معلق
  CANCELLED = 'cancelled', // ملغي
  RETURNED = 'returned', // مرتجع
  REFUNDED = 'refunded', // مسترد
  OUT_OF_STOCK = 'out_of_stock', // غير متوفر (مخزون غير كافٍ)
}

/**
 * حالات الدفع - نظام موحد
 */
export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}

/**
 * طرق الشحن - نظام موحد
 */
export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  PICKUP = 'pickup',
}

/**
 * طرق الدفع - نظام مبسط
 */
export enum PaymentMethod {
  COD = 'COD', // الدفع عند الاستلام
  BANK_TRANSFER = 'BANK_TRANSFER', // تحويل بنكي محلي
}

/**
 * State Machine للطلبات - مبسط
 */
export const ORDER_STATE_MACHINE = {
  [OrderStatus.PENDING_PAYMENT]: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
    OrderStatus.OUT_OF_STOCK,
  ],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [
    OrderStatus.COMPLETED,
    OrderStatus.RETURNED,
    OrderStatus.ON_HOLD,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.ON_HOLD]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.OUT_OF_STOCK]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
};

/**
 * عنصر الطلب - منتج واحد في الطلب
 */
@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Variant' })
  variantId?: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  qty!: number;

  // الأسعار التفصيلية
  @Prop({ required: true })
  basePrice!: number; // السعر الأصلي

  @Prop({ default: 0 })
  discount!: number; // الخصم على المنتج

  @Prop({ required: true })
  finalPrice!: number; // السعر النهائي للوحدة

  @Prop({ required: true })
  lineTotal!: number; // المجموع (finalPrice × qty)

  @Prop({ required: true })
  currency!: string;

  // العروض المطبقة
  @Prop({ type: Types.ObjectId, ref: 'PriceRule' })
  appliedPromotionId?: Types.ObjectId;

  @Prop({ default: 0 })
  promotionDiscount!: number;

  // معلومات المنتج الكاملة (snapshot)
  @Prop({ type: Object, required: true })
  snapshot!: {
    name: string;
    sku?: string;
    slug: string;
    image?: string;
    brandId?: string;
    brandName?: string;
    categoryId?: string;
    categoryName?: string;
    attributes?: Record<string, string>; // اللون، الحجم، إلخ
  };

  // حالة المنتج في الطلب
  @Prop({ default: 'pending' })
  itemStatus!: 'pending' | 'fulfilled' | 'cancelled' | 'returned';

  // معلومات الإرجاع
  @Prop({ default: false })
  isReturned!: boolean;

  @Prop({ default: 0 })
  returnQty!: number;

  @Prop()
  returnReason?: string;

  @Prop({ type: Date })
  returnedAt?: Date;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/**
 * سجل تغيير الحالة
 */
@Schema({ _id: false })
export class StatusHistoryEntry {
  @Prop({ type: String, enum: Object.values(OrderStatus), required: true })
  status!: OrderStatus;

  @Prop({ type: Date, required: true })
  changedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  changedBy!: Types.ObjectId;

  @Prop({ type: String, enum: ['customer', 'admin', 'system'], required: true })
  changedByRole!: 'customer' | 'admin' | 'system';

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const StatusHistoryEntrySchema = SchemaFactory.createForClass(StatusHistoryEntry);

/**
 * عنوان التوصيل
 */
@Schema({ _id: false })
export class DeliveryAddress {
  @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
  addressId!: Types.ObjectId;

  @Prop({ required: true })
  label!: string;

  @Prop()
  recipientName?: string;

  @Prop()
  recipientPhone?: string;

  @Prop({ required: true })
  line1!: string;

  @Prop()
  line2?: string;

  @Prop({ required: true })
  city!: string;

  @Prop()
  region?: string;

  @Prop()
  country?: string;

  @Prop({ type: Object, required: true })
  coords!: { lat: number; lng: number };

  @Prop()
  postalCode?: string;

  @Prop()
  notes?: string;
}

export const DeliveryAddressSchema = SchemaFactory.createForClass(DeliveryAddress);

/**
 * تفاصيل الكوبون
 */
@Schema({ _id: false })
export class CouponDetails {
  @Prop({ required: true })
  code!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  type!: string;

  @Prop()
  discountPercentage?: number;

  @Prop()
  discountAmount?: number;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const CouponDetailsSchema = SchemaFactory.createForClass(CouponDetails);

/**
 * معلومات الإرجاع
 */
@Schema({ _id: false })
export class ReturnInfo {
  @Prop({ default: false })
  isReturned!: boolean;

  @Prop({ default: 0 })
  returnAmount!: number;

  @Prop()
  returnReason?: string;

  @Prop({ type: Date })
  returnedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  returnedBy?: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  returnItems?: Array<{
    variantId: Types.ObjectId;
    qty: number;
    reason: string;
    requestedAt: Date;
    approvedAt?: Date;
    approvedBy?: Types.ObjectId;
  }>;
}

export const ReturnInfoSchema = SchemaFactory.createForClass(ReturnInfo);

/**
 * معلومات التقييم
 */
@Schema({ _id: false })
export class RatingInfo {
  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop()
  review?: string;

  @Prop({ type: Date })
  ratedAt?: Date;
}

export const RatingInfoSchema = SchemaFactory.createForClass(RatingInfo);

/**
 * الطلب الرئيسي - نظام موحد شامل
 */
@Schema({ timestamps: true })
export class Order {
  _id?: Types.ObjectId;

  // ===== معلومات أساسية =====
  @Prop({ required: true, unique: true, index: true })
  orderNumber!: string; // ORD-2024-00001

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop()
  customerName?: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  accountType?: string; // retail/merchant/engineer

  @Prop({ default: 'web' })
  source!: string; // web/mobile/app

  // ===== الحالة =====
  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING_PAYMENT,
    index: true,
  })
  status!: OrderStatus;

  @Prop({ type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  // ===== سجل الحالات =====
  @Prop({ type: [StatusHistoryEntrySchema], default: [] })
  statusHistory!: StatusHistoryEntry[];

  // ===== عنوان التوصيل =====
  @Prop({ type: DeliveryAddressSchema, required: true })
  deliveryAddress!: DeliveryAddress;

  // ===== المنتجات =====
  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItem[];

  // ===== الأسعار والخصومات =====
  @Prop({ required: true })
  currency!: string; // YER/SAR/USD

  @Prop({ required: true })
  subtotal!: number; // مجموع المنتجات الأصلي

  @Prop({ default: 0 })
  itemsDiscount!: number; // خصم المنتجات (من العروض)

  // الكوبون - Multiple Coupons Support
  @Prop({ type: [String], default: [] })
  appliedCouponCodes!: string[];

  @Prop({ type: [Object], default: [] })
  appliedCoupons!: Array<{
    code: string;
    discount: number;
    details: CouponDetails;
  }>;

  @Prop({ default: 0 })
  couponDiscount!: number;

  // Keep old fields for backward compatibility (deprecated)
  @Prop()
  appliedCouponCode?: string;

  @Prop({ type: CouponDetailsSchema })
  couponDetails?: CouponDetails;

  // كوبونات تلقائية
  @Prop({ type: [Object], default: [] })
  autoAppliedCoupons?: Array<{
    code: string;
    discount: number;
  }>;

  @Prop({ default: 0 })
  autoDiscountsTotal!: number;

  // الشحن
  @Prop({ default: 0 })
  shippingCost!: number;

  @Prop({ default: 0 })
  shippingDiscount!: number;

  @Prop({ type: String, enum: Object.values(ShippingMethod), default: ShippingMethod.STANDARD })
  shippingMethod!: ShippingMethod;

  @Prop()
  shippingCompany?: string; // DHL/Aramex/SMSA/etc

  @Prop()
  trackingNumber?: string;

  @Prop()
  trackingUrl?: string;

  @Prop({ type: Date })
  estimatedDeliveryDate?: Date;

  @Prop({ type: Date })
  actualDeliveryDate?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  // الضريبة
  @Prop({ default: 0 })
  tax!: number;

  @Prop({ default: 0 })
  taxRate!: number; // نسبة الضريبة

  // المجاميع
  @Prop({ default: 0 })
  totalDiscount!: number; // الخصم الكلي

  @Prop({ required: true })
  total!: number; // المجموع النهائي

  // 🆕 إجماليات بالعملات الثلاث (USD, YER, SAR)
  @Prop({ type: Object })
  totalsInAllCurrencies?: {
    USD: {
      subtotal: number;
      shippingCost: number;
      tax: number;
      totalDiscount: number;
      total: number;
    };
    YER: {
      subtotal: number;
      shippingCost: number;
      tax: number;
      totalDiscount: number;
      total: number;
    };
    SAR: {
      subtotal: number;
      shippingCost: number;
      tax: number;
      totalDiscount: number;
      total: number;
    };
  };

  // ===== الدفع =====
  @Prop({ type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.COD })
  paymentMethod!: PaymentMethod;

  @Prop()
  paymentProvider?: string; // moyasar/stripe/etc

  @Prop({ index: true, sparse: true })
  paymentIntentId?: string;

  @Prop()
  paymentTransactionId?: string;

  @Prop({ type: Date })
  paidAt?: Date;

  // ===== الدفع المحلي =====
  @Prop({ type: String })
  localPaymentAccountId?: string; // معرف الحساب المحلي المختار (قد يكون معرف المزود أو المركب)

  @Prop()
  paymentReference?: string; // رقم الحوالة/المرجع من العميل

  // معلومات المطابقة من الإدارة
  @Prop()
  verifiedPaymentAmount?: number; // المبلغ المطابق

  @Prop()
  verifiedPaymentCurrency?: string; // العملة المطابقة

  @Prop({ type: Date })
  paymentVerifiedAt?: Date; // تاريخ المطابقة

  @Prop({ type: Types.ObjectId, ref: 'User' })
  paymentVerifiedBy?: Types.ObjectId; // من قام بالمطابقة

  @Prop()
  paymentVerificationNotes?: string; // ملاحظات المطابقة

  // ===== الإرجاع والاسترداد =====
  @Prop({ type: ReturnInfoSchema, default: {} })
  returnInfo!: ReturnInfo;

  // ===== الملاحظات =====
  @Prop()
  customerNotes?: string; // ملاحظات العميل

  @Prop()
  adminNotes?: string; // ملاحظات الأدمن

  @Prop()
  internalNotes?: string; // ملاحظات داخلية (لا يراها العميل)

  // ===== الفواتير =====
  @Prop()
  invoiceNumber?: string; // INV-2024-00001

  @Prop()
  invoiceUrl?: string;

  @Prop()
  receiptUrl?: string;

  @Prop({ type: Date })
  invoiceSentAt?: Date; // تاريخ إرسال الفاتورة للمبيعات

  // ===== فاتورة الإرجاع =====
  @Prop()
  returnInvoiceNumber?: string; // RET-2024-00001

  @Prop()
  returnInvoiceUrl?: string;

  // ===== التقييم =====
  @Prop({ type: RatingInfoSchema, default: {} })
  ratingInfo!: RatingInfo;

  // ===== Metadata =====
  @Prop({ type: Object, default: {} })
  metadata?: {
    cartId?: string;
    campaign?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
  };

  // ===== التواريخ الهامة =====
  @Prop({ type: Date })
  confirmedAt?: Date;

  @Prop({ type: Date })
  processingStartedAt?: Date;

  @Prop({ type: Date })
  shippedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancellationReason?: string;

  // Timestamps (auto)
  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Performance indexes
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentIntentId: 1 }, { sparse: true, unique: true });
OrderSchema.index({ trackingNumber: 1 }, { sparse: true });
OrderSchema.index({ paidAt: 1 }, { sparse: true });
OrderSchema.index({ deliveredAt: 1 }, { sparse: true });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ updatedAt: -1 });
OrderSchema.index({ 'deliveryAddress.city': 1, status: 1 });
OrderSchema.index({ total: -1, currency: 1 });

// ملاحظة: OrderStateMachine تم نقلها إلى utils/order-state-machine.ts
// استخدم: import { OrderStateMachine } from '../utils/order-state-machine';
