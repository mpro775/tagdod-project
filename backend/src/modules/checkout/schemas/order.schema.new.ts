import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

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

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}

export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  PICKUP = 'pickup',
}

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
  @Prop({ type: [Object], default: [] })
  statusHistory!: Array<{
    status: OrderStatus;
    changedAt: Date;
    changedBy: Types.ObjectId;
    changedByRole: 'customer' | 'admin' | 'system';
    notes?: string;
    metadata?: Record<string, unknown>;
  }>;

  // ===== عنوان التوصيل الكامل =====
  @Prop({ type: Object, required: true })
  deliveryAddress!: {
    addressId: Types.ObjectId;
    recipientName: string;
    recipientPhone: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    country: string;
    postalCode?: string;
    coords?: { lat: number; lng: number };
    notes?: string;
  };

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

  @Prop({ type: Object })
  couponDetails?: {
    code: string;
    title: string;
    type: string;
    discountPercentage?: number;
    discountAmount?: number;
  };

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
  @Prop({ default: 'COD' })
  paymentMethod!: 'COD' | 'ONLINE' | 'WALLET' | 'BANK_TRANSFER';

  @Prop()
  paymentProvider?: string; // moyasar/stripe/etc

  @Prop({ index: true, sparse: true })
  paymentIntentId?: string;

  @Prop()
  paymentTransactionId?: string;

  @Prop({ type: Date })
  paidAt?: Date;

  // ===== الشحن =====
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

  // ===== الإرجاع والاسترداد =====
  @Prop({ default: false })
  isRefunded!: boolean;

  @Prop({ default: 0 })
  refundAmount!: number;

  @Prop()
  refundReason?: string;

  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  refundedBy?: Types.ObjectId;

  @Prop({ default: false })
  isReturned!: boolean;

  @Prop()
  returnReason?: string;

  @Prop({ type: Date })
  returnedAt?: Date;

  @Prop({ type: [Object], default: [] })
  returnItems?: Array<{
    variantId: Types.ObjectId;
    qty: number;
    reason: string;
    requestedAt: Date;
    approvedAt?: Date;
    approvedBy?: Types.ObjectId;
  }>;

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
  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop()
  review?: string;

  @Prop({ type: Date })
  ratedAt?: Date;

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

