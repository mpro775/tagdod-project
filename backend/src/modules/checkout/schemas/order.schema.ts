import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

/**
 * حالات الطلب - نظام موحد شامل
 */
export enum OrderStatus {
  // مراحل الإنشاء
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  
  // مراحل التأكيد
  CONFIRMED = 'confirmed',
  PAYMENT_FAILED = 'payment_failed',
  
  // مراحل التنفيذ
  PROCESSING = 'processing',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  
  // مراحل التسليم
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  
  // حالات خاصة
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  RETURNED = 'returned',
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
 * طرق الدفع - نظام موحد
 */
export enum PaymentMethod {
  COD = 'COD',
  ONLINE = 'ONLINE',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

/**
 * State Machine للطلبات
 */
export const ORDER_STATE_MACHINE = {
  [OrderStatus.DRAFT]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CONFIRMED, OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.READY_TO_SHIP, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
  [OrderStatus.READY_TO_SHIP]: [OrderStatus.SHIPPED, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.ON_HOLD]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.PARTIALLY_REFUNDED]: [OrderStatus.REFUNDED],
  [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
  [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
};

/**
 * عنصر الطلب - منتج واحد في الطلب
 */
@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Variant', required: true })
  variantId!: Types.ObjectId;

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

  @Prop({ required: true })
  line1!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ type: Object, required: true })
  coords!: { lat: number; lng: number };

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
  accountType?: string; // retail/wholesale/engineer

  @Prop({ default: 'web' })
  source!: string; // web/mobile/app

  // ===== الحالة =====
  @Prop({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING_PAYMENT, index: true })
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

  // الكوبون
  @Prop()
  appliedCouponCode?: string;

  @Prop({ default: 0 })
  couponDiscount!: number;

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

/**
 * Helper functions للـ State Machine
 */
export class OrderStateMachine {
  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return (ORDER_STATE_MACHINE as Record<OrderStatus, OrderStatus[]>)[from]?.includes(to) || false;
  }

  static getNextStates(current: OrderStatus): OrderStatus[] {
    return (ORDER_STATE_MACHINE as Record<OrderStatus, OrderStatus[]>)[current] || [];
  }

  static isTerminalState(status: OrderStatus): boolean {
    return [
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
      OrderStatus.REFUNDED,
      OrderStatus.RETURNED
    ].includes(status);
  }

  static isActiveState(status: OrderStatus): boolean {
    return !this.isTerminalState(status);
  }
}