import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Variant', required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  qty!: number;

  @Prop({ required: true })
  basePrice!: number;

  @Prop({ default: 0 })
  discount!: number;

  @Prop({ required: true })
  finalPrice!: number;

  @Prop({ required: true })
  lineTotal!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({ type: Types.ObjectId, ref: 'PriceRule' })
  appliedPromotionId?: Types.ObjectId;

  @Prop({ type: Object, required: true })
  snapshot!: {
    name: string;
    sku?: string;
    slug: string;
    image?: string;
    brandName?: string;
    categoryName?: string;
    attributes?: Record<string, string>;
  };
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  orderNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING, index: true })
  status!: OrderStatus;

  @Prop({ type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Prop({ type: [Object], default: [] })
  statusHistory!: Array<{
    status: OrderStatus;
    changedAt: Date;
    changedBy?: Types.ObjectId;
    changedByRole?: string;
    notes?: string;
  }>;

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
    coords?: { lat: number; lng: number };
    notes?: string;
  };

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItem[];

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  subtotal!: number;

  @Prop({ default: 0 })
  itemsDiscount!: number;

  @Prop()
  appliedCouponCode?: string;

  @Prop({ default: 0 })
  couponDiscount!: number;

  @Prop({ type: Object })
  couponDetails?: {
    code: string;
    title: string;
    type: string;
  };

  @Prop({ default: 0 })
  shippingCost!: number;

  @Prop({ default: 0 })
  tax!: number;

  @Prop({ default: 0 })
  totalDiscount!: number;

  @Prop({ required: true })
  total!: number;

  @Prop({ default: 'COD' })
  paymentMethod!: string;

  @Prop()
  paymentProvider?: string;

  @Prop({ index: true, sparse: true })
  paymentIntentId?: string;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop()
  shippingMethod?: string;

  @Prop()
  trackingNumber?: string;

  @Prop()
  trackingUrl?: string;

  @Prop({ type: Date })
  estimatedDeliveryDate?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop()
  customerNotes?: string;

  @Prop()
  adminNotes?: string;

  @Prop({ default: false })
  isRefunded!: boolean;

  @Prop({ default: 0 })
  refundAmount!: number;

  @Prop()
  refundReason?: string;

  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Object, default: {} })
  metadata?: {
    cartId?: string;
    source?: string;
  };
}
export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ paymentIntentId: 1 }, { sparse: true, unique: true });
OrderSchema.index({ createdAt: -1 });
