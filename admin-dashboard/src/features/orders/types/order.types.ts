import { BaseEntity, ListParams } from '@/shared/types/common.types';

// Order Status - متطابق مع Backend
export enum OrderStatus {
  // eslint-disable-next-line no-unused-vars
  DRAFT = 'draft',
  // eslint-disable-next-line no-unused-vars
  PENDING_PAYMENT = 'pending_payment',
  // eslint-disable-next-line no-unused-vars
  CONFIRMED = 'confirmed',
  // eslint-disable-next-line no-unused-vars
  PAYMENT_FAILED = 'payment_failed',
  // eslint-disable-next-line no-unused-vars
  PROCESSING = 'processing',
  // eslint-disable-next-line no-unused-vars
  READY_TO_SHIP = 'ready_to_ship',
  // eslint-disable-next-line no-unused-vars
  SHIPPED = 'shipped',
  // eslint-disable-next-line no-unused-vars
  OUT_FOR_DELIVERY = 'out_for_delivery',
  // eslint-disable-next-line no-unused-vars
  DELIVERED = 'delivered',
  // eslint-disable-next-line no-unused-vars
  COMPLETED = 'completed',
  // eslint-disable-next-line no-unused-vars
  ON_HOLD = 'on_hold',
  // eslint-disable-next-line no-unused-vars
  CANCELLED = 'cancelled',
  // eslint-disable-next-line no-unused-vars
  REFUNDED = 'refunded',
  // eslint-disable-next-line no-unused-vars
  PARTIALLY_REFUNDED = 'partially_refunded',
  // eslint-disable-next-line no-unused-vars
  RETURNED = 'returned',
}

export enum PaymentStatus {
  // eslint-disable-next-line no-unused-vars
  PENDING = 'pending',
  // eslint-disable-next-line no-unused-vars
  AUTHORIZED = 'authorized',
  // eslint-disable-next-line no-unused-vars
  PAID = 'paid',
  // eslint-disable-next-line no-unused-vars
  FAILED = 'failed',
  // eslint-disable-next-line no-unused-vars
  REFUNDED = 'refunded',
  // eslint-disable-next-line no-unused-vars
  PARTIALLY_REFUNDED = 'partially_refunded',
  // eslint-disable-next-line no-unused-vars
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  // eslint-disable-next-line no-unused-vars
  COD = 'COD',
  // eslint-disable-next-line no-unused-vars
  ONLINE = 'ONLINE',
  // eslint-disable-next-line no-unused-vars
  WALLET = 'WALLET',
  // eslint-disable-next-line no-unused-vars
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum ShippingMethod {
  // eslint-disable-next-line no-unused-vars
  STANDARD = 'standard',
  // eslint-disable-next-line no-unused-vars
  EXPRESS = 'express',
  // eslint-disable-next-line no-unused-vars
  SAME_DAY = 'same_day',
  // eslint-disable-next-line no-unused-vars
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

// Status History Entry
export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
  changedBy: string;
  changedByRole: 'customer' | 'admin' | 'system';
  notes?: string;
}

// Delivery Address
export interface DeliveryAddress {
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
}

// Coupon Details
export interface CouponDetails {
  code: string;
  title: string;
  type: string;
  discountPercentage?: number;
  discountAmount?: number;
}

// Return Info
export interface ReturnInfo {
  isRefunded: boolean;
  refundAmount: number;
  refundReason?: string;
  refundedAt?: Date;
  refundedBy?: string;
  isReturned: boolean;
  returnReason?: string;
  returnedAt?: Date;
}

// Rating Info
export interface RatingInfo {
  rating?: number;
  review?: string;
  ratedAt?: Date;
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
  statusHistory: StatusHistoryEntry[];

  // Delivery Address
  deliveryAddress: DeliveryAddress;

  // Items
  items: OrderItem[];

  // Pricing
  currency: string;
  subtotal: number;
  itemsDiscount: number;
  appliedCouponCode?: string;
  couponDiscount: number;
  couponDetails?: CouponDetails;
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
  paymentMethod: PaymentMethod;
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
  returnInfo: ReturnInfo;

  // Notes
  customerNotes?: string;
  adminNotes?: string;
  internalNotes?: string;

  // Invoices
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;

  // Rating
  ratingInfo: RatingInfo;

  // Metadata
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
  estimatedDeliveryDate?: string;
  notes?: string;
}

export interface RefundOrderDto {
  amount: number;
  reason: string;
  items?: Array<{
    variantId: string;
    qty: number;
  }>;
}

export interface CancelOrderDto {
  reason: string;
}

export interface AddOrderNotesDto {
  notes: string;
  type?: 'customer' | 'admin' | 'internal';
}

export interface BulkOrderUpdateDto {
  orderIds: string[];
  status: OrderStatus;
  notes?: string;
}

export interface ListOrdersParams extends ListParams {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
}

export interface OrderAnalyticsParams {
  days?: number;
  groupBy?: 'day' | 'week' | 'month';
  status?: OrderStatus;
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

// Order Analytics
export interface OrderAnalytics {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
  recentOrders: Order[];
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

// Order Tracking
export interface OrderTracking {
  orderNumber: string;
  currentStatus: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  timeline: Array<{
    status: OrderStatus;
    title: string;
    icon: string;
    completed: boolean;
    timestamp?: Date;
    notes?: string;
  }>;
}

// Revenue Analytics
export interface RevenueAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    orders: number;
  }>;
}

// Performance Analytics
export interface PerformanceAnalytics {
  averageProcessingTime: number;
  averageShippingTime: number;
  averageDeliveryTime: number;
  cancellationRate: number;
  refundRate: number;
  customerSatisfactionScore: number;
}
