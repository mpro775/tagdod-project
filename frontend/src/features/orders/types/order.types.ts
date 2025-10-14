import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Order Status - متطابق مع Backend
export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  PAYMENT_FAILED = 'payment_failed',
  PROCESSING = 'processing',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
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

// Order Item
export interface OrderItem {
  productId: string;
  variantId: string;
  qty: number;
  basePrice: number;
  discount: number;
  finalPrice: number;
  lineTotal: number;
  currency: string;
  appliedPromotionId?: string;
  promotionDiscount: number;
  snapshot: {
    name: string;
    sku?: string;
    slug: string;
    image?: string;
    brandId?: string;
    brandName?: string;
    categoryId?: string;
    categoryName?: string;
    attributes?: Record<string, string>;
  };
  itemStatus: 'pending' | 'fulfilled' | 'cancelled' | 'returned';
  isReturned: boolean;
  returnQty: number;
  returnReason?: string;
  returnedAt?: Date;
}

// Order Interface - متطابق مع Backend
export interface Order extends BaseEntity {
  orderNumber: string;
  userId: string;
  accountType?: string;
  source: string;

  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;

  // Status History
  statusHistory: Array<{
    status: OrderStatus;
    changedAt: Date;
    changedBy: string;
    changedByRole: 'customer' | 'admin' | 'system';
    notes?: string;
  }>;

  // Delivery Address
  deliveryAddress: {
    addressId: string;
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

  // Items
  items: OrderItem[];

  // Pricing
  currency: string;
  subtotal: number;
  itemsDiscount: number;
  appliedCouponCode?: string;
  couponDiscount: number;
  couponDetails?: {
    code: string;
    title: string;
    type: string;
    discountPercentage?: number;
    discountAmount?: number;
  };
  autoAppliedCoupons?: Array<{
    code: string;
    discount: number;
  }>;
  autoDiscountsTotal: number;
  shippingCost: number;
  shippingDiscount: number;
  tax: number;
  taxRate: number;
  totalDiscount: number;
  total: number;

  // Payment
  paymentMethod: 'COD' | 'ONLINE' | 'WALLET' | 'BANK_TRANSFER';
  paymentProvider?: string;
  paymentIntentId?: string;
  paymentTransactionId?: string;
  paidAt?: Date;

  // Shipping
  shippingMethod: ShippingMethod;
  shippingCompany?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  deliveredAt?: Date;

  // Return & Refund
  isRefunded: boolean;
  refundAmount: number;
  refundReason?: string;
  refundedAt?: Date;
  refundedBy?: string;
  isReturned: boolean;
  returnReason?: string;
  returnedAt?: Date;

  // Notes
  customerNotes?: string;
  adminNotes?: string;
  internalNotes?: string;

  // Invoices
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;

  // Rating
  rating?: number;
  review?: string;
  ratedAt?: Date;

  // Important Dates
  confirmedAt?: Date;
  processingStartedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

// DTOs
export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export interface ShipOrderDto {
  shippingCompany: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: Date;
}

export interface RefundOrderDto {
  reason: string;
  amount?: number;
}

export interface ListOrdersParams extends ListParams {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
  userId?: string;
  city?: string;
}

// Order Statistics
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  averageOrderValue: number;
}

