import {
  IsIn,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  MinLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, ShippingMethod, PaymentMethod } from '../schemas/order.schema';
import {
  PaymentAccountNumberingMode,
  PaymentAccountType,
} from '../../system-settings/schemas/local-payment-account.schema';

/**
 * DTOs للطلبات - نظام موحد
 */

// ===== Checkout DTOs =====

export class CheckoutPreviewDto {
  @ApiProperty({ example: 'YER', enum: ['YER', 'SAR', 'USD'] })
  @IsString()
  currency!: string;

  @ApiPropertyOptional({ 
    description: 'كوبون واحد - مؤقت: النظام يقبل كوبون واحد فقط حالياً. إذا تم إرسال couponCode وcouponCodes معاً، سيتم استخدام couponCode فقط.',
    example: 'WELCOME10'
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ 
    description: 'مصفوفة كوبونات - مؤقت: النظام يقبل كوبون واحد فقط حالياً. سيتم استخدام أول كوبون صالح من المصفوفة وتجاهل الباقي. يفضل استخدام couponCode بدلاً منها.',
    type: [String], 
    example: ['COUPON10']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  couponCodes?: string[];
}

export class CheckoutSessionAddressDto {
  @ApiProperty({ example: '65abc123def4567890' })
  id!: string;

  @ApiProperty({ example: 'المنزل' })
  label!: string;

  @ApiProperty({ example: 'صنعاء - شارع تعز' })
  line1!: string;

  @ApiProperty({ example: 'صنعاء' })
  city!: string;

  @ApiProperty({
    type: 'object',
    example: { lat: 15.3694, lng: 44.1910 },
  })
  coords!: { lat: number; lng: number };

  @ApiPropertyOptional({ example: 'يرجى الاتصال قبل الوصول' })
  notes?: string;

  @ApiProperty({ example: true })
  isDefault!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class CheckoutSessionTotalsDto {
  @ApiProperty({ example: 120000 })
  subtotal!: number;

  @ApiProperty({ example: 0 })
  shipping!: number;

  @ApiProperty({ example: 120000 })
  total!: number;

  @ApiProperty({ example: 'YER' })
  currency!: string;
}

export class CheckoutSessionAppliedCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  code!: string;

  @ApiProperty({ example: 'خصم الترحيب' })
  name!: string;

  @ApiProperty({ example: 10 })
  discountValue!: number;

  @ApiProperty({ example: 'percentage', enum: ['percentage', 'fixed_amount'] })
  type!: string;

  @ApiProperty({ example: 5000 })
  discount!: number;
}

export class CheckoutSessionDiscountsDto {
  @ApiProperty({ example: 2000 })
  itemsDiscount!: number;

  @ApiProperty({ example: 5000 })
  couponDiscount!: number;

  @ApiProperty({ example: 7000 })
  totalDiscount!: number;

  @ApiProperty({ type: [CheckoutSessionAppliedCouponDto] })
  appliedCoupons!: CheckoutSessionAppliedCouponDto[];
}

export class CheckoutSessionCartPreviewDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  pricingSummaryByCurrency?: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true, required: false })
  totalsInAllCurrencies?: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true, required: false })
  meta?: Record<string, unknown>;

  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  items!: unknown[];
}

export class CheckoutSessionExchangeRatesDto {
  @ApiProperty({ example: 250 })
  usdToYer!: number;

  @ApiProperty({ example: 3.75 })
  usdToSar!: number;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  lastUpdatedAt?: Date;
}

export class CheckoutConfirmDto {
  @ApiProperty({ example: '65abc123def456789' })
  @IsString()
  deliveryAddressId!: string;

  @ApiProperty({ example: 'YER' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 'COD', enum: Object.values(PaymentMethod) })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentProvider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localPaymentAccountId?: string; // معرف الحساب المحلي

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentReference?: string; // رقم الحوالة (يُطلب عند اختيار حساب محلي)

  @ApiPropertyOptional({ example: 'standard', enum: Object.values(ShippingMethod) })
  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional({ 
    description: 'كوبون واحد - مؤقت: النظام يقبل كوبون واحد فقط حالياً. إذا تم إرسال couponCode وcouponCodes معاً، سيتم استخدام couponCode فقط.',
    example: 'WELCOME10'
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ 
    description: 'مصفوفة كوبونات - مؤقت: النظام يقبل كوبون واحد فقط حالياً. سيتم استخدام أول كوبون صالح من المصفوفة وتجاهل الباقي. يفضل استخدام couponCode بدلاً منها.',
    type: [String], 
    example: ['COUPON10']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  couponCodes?: string[];
}

export class CheckoutProviderIconDto {
  @ApiProperty({ example: '64f9c0b5c1a2b3d4e5f67890' })
  id!: string;

  @ApiProperty({ example: 'https://cdn.example.com/icons/provider.png' })
  url!: string;

  @ApiPropertyOptional({ example: 'مزود الدفع' })
  name?: string;
}

export class CheckoutLocalPaymentAccountDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'YER' })
  currency!: string;

  @ApiProperty({ example: '1234567890' })
  accountNumber!: string;

  @ApiProperty({ default: true })
  isActive!: boolean;

  @ApiProperty({ default: 0 })
  displayOrder!: number;

  @ApiPropertyOptional()
  notes?: string;
}

export class CheckoutLocalPaymentProviderDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  providerId!: string;

  @ApiProperty({ example: 'محفظة جيب' })
  providerName!: string;

  @ApiPropertyOptional({ type: () => CheckoutProviderIconDto })
  icon?: CheckoutProviderIconDto;

  @ApiProperty({ enum: PaymentAccountType })
  type!: PaymentAccountType;

  @ApiProperty({ enum: PaymentAccountNumberingMode })
  numberingMode!: PaymentAccountNumberingMode;

  @ApiProperty({
    type: [String],
    enum: ['YER', 'SAR', 'USD'],
    description: 'العملات التي يدعمها المزود',
  })
  supportedCurrencies!: string[];

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'رقم الحساب في وضع shared',
  })
  sharedAccountNumber?: string;

  @ApiProperty({ default: true })
  isActive!: boolean;

  @ApiProperty({ default: 0 })
  displayOrder!: number;

  @ApiProperty({
    type: [CheckoutLocalPaymentAccountDto],
    description: 'تفاصيل الحسابات لكل عملة',
  })
  accounts!: CheckoutLocalPaymentAccountDto[];
}

export class CheckoutCustomerOrderStatsDto {
  @ApiProperty({ example: 5 })
  totalOrders!: number;

  @ApiProperty({ example: 3 })
  completedOrders!: number;

  @ApiProperty({ example: 1 })
  inProgressOrders!: number;

  @ApiProperty({ example: 1 })
  cancelledOrders!: number;

  @ApiProperty({ example: 3 })
  requiredForCOD!: number;

  @ApiProperty({ example: 0 })
  remainingForCOD!: number;

  @ApiProperty({ example: true })
  codEligible!: boolean;
}

export class CheckoutCODEligibilityDto {
  @ApiProperty({ example: true })
  eligible!: boolean;

  @ApiProperty({ example: 3 })
  requiredOrders!: number;

  @ApiProperty({ example: 0 })
  remainingOrders!: number;

  @ApiProperty({ example: 5 })
  totalOrders!: number;

  @ApiProperty({ example: 3 })
  completedOrders!: number;

  @ApiProperty({ example: 1 })
  inProgressOrders!: number;

  @ApiProperty({ example: 1 })
  cancelledOrders!: number;

  @ApiProperty({ example: '3/3' })
  progress!: string;

  @ApiPropertyOptional({
    example: 'يجب إكمال 3 طلبات على الأقل لاستخدام الدفع عند الاستلام.',
  })
  message?: string;

  @ApiPropertyOptional({ example: false })
  isAdmin?: boolean;
}

export class CheckoutPaymentOptionStatusDto {
  @ApiProperty({ enum: PaymentMethod })
  method!: PaymentMethod;

  @ApiProperty({ example: 'available', enum: ['available', 'restricted', 'unavailable'] })
  status!: 'available' | 'restricted' | 'unavailable';

  @ApiProperty({ example: true })
  allowed!: boolean;

  @ApiPropertyOptional({
    example: 'يجب إكمال 3 طلبات لاستخدام الدفع عند الاستلام.',
  })
  reason?: string;

  @ApiPropertyOptional({ type: () => CheckoutCODEligibilityDto })
  codEligibility?: CheckoutCODEligibilityDto;
}

export class CheckoutPaymentOptionsResponseDto {
  @ApiProperty({ type: () => CheckoutPaymentOptionStatusDto })
  cod!: CheckoutPaymentOptionStatusDto;

  @ApiProperty({ type: () => CheckoutCustomerOrderStatsDto })
  customerOrderStats!: CheckoutCustomerOrderStatsDto;

  @ApiProperty({
    type: [CheckoutLocalPaymentProviderDto],
    description: 'مزودو الدفع المحليون المتاحون للتحويل البنكي أو المحافظ',
  })
  localPaymentProviders!: CheckoutLocalPaymentProviderDto[];
}

export class CheckoutSessionResponseDto {
  @ApiProperty({ type: () => CheckoutSessionCartPreviewDto })
  cart!: CheckoutSessionCartPreviewDto;

  @ApiProperty({ type: () => CheckoutSessionTotalsDto })
  totals!: CheckoutSessionTotalsDto;

  @ApiProperty({ type: () => CheckoutSessionDiscountsDto })
  discounts!: CheckoutSessionDiscountsDto;

  @ApiProperty({ type: () => CheckoutPaymentOptionsResponseDto })
  paymentOptions!: CheckoutPaymentOptionsResponseDto;

  @ApiProperty({ type: () => CheckoutCODEligibilityDto })
  codEligibility!: CheckoutCODEligibilityDto;

  @ApiProperty({ type: () => CheckoutCustomerOrderStatsDto })
  customerOrderStats!: CheckoutCustomerOrderStatsDto;

  @ApiProperty({ type: [CheckoutSessionAddressDto] })
  addresses!: CheckoutSessionAddressDto[];

  @ApiPropertyOptional({ type: () => CheckoutSessionExchangeRatesDto })
  exchangeRates?: CheckoutSessionExchangeRatesDto;
}

export class WebhookDto {
  @ApiProperty()
  @IsString()
  intentId!: string;

  @ApiProperty({ enum: ['SUCCESS', 'FAILED'] })
  @IsIn(['SUCCESS', 'FAILED'])
  status!: 'SUCCESS' | 'FAILED';

  @ApiProperty()
  @IsString()
  amount!: string;

  @ApiProperty()
  @IsString()
  signature!: string;
}

// ===== Order Management DTOs =====

export class CreateOrderDto {
  @ApiProperty({ example: '65abc123def456789' })
  @IsString()
  deliveryAddressId!: string;

  @ApiProperty({ example: 'YER' })
  @IsString()
  currency!: string;

  @ApiProperty({ example: 'COD', enum: Object.values(PaymentMethod) })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentProvider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localPaymentAccountId?: string; // معرف الحساب المحلي

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentReference?: string; // رقم الحوالة (يُطلب عند اختيار حساب محلي)

  @ApiPropertyOptional({ enum: Object.values(ShippingMethod) })
  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional({ 
    description: 'كوبون واحد - مؤقت: النظام يقبل كوبون واحد فقط حالياً. إذا تم إرسال couponCode وcouponCodes معاً، سيتم استخدام couponCode فقط.',
    example: 'WELCOME10'
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ 
    description: 'مصفوفة كوبونات - مؤقت: النظام يقبل كوبون واحد فقط حالياً. سيتم استخدام أول كوبون صالح من المصفوفة وتجاهل الباقي. يفضل استخدام couponCode بدلاً منها.',
    type: [String], 
    example: ['COUPON10']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  couponCodes?: string[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'تغيير رأيي في المنتج' })
  @IsString()
  @MinLength(5)
  reason!: string;
}

export class ShipOrderDto {
  @ApiProperty({ example: 'DHL' })
  @IsString()
  shippingCompany!: string;

  @ApiProperty({ example: 'DHL123456789' })
  @IsString()
  trackingNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RefundOrderDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: 'عطل في المنتج' })
  @IsString()
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  items?: Array<{
    variantId: string;
    qty: number;
  }>;
}

export class RateOrderDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  review?: string;
}

export class AddOrderNotesDto {
  @ApiProperty({ example: 'ملاحظات إضافية للطلب' })
  @IsString()
  @MinLength(3)
  notes!: string;

  @ApiPropertyOptional({ example: 'internal' })
  @IsOptional()
  @IsIn(['customer', 'admin', 'internal'])
  type?: 'customer' | 'admin' | 'internal';
}

// ===== Query DTOs =====

export class ListOrdersDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'فلترة الطلبات التي لديها تقييم', type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  hasRating?: boolean;

  @ApiPropertyOptional({ description: 'الحد الأدنى للتقييم (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;
}

export class ListRatingsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'الحد الأدنى للتقييم (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'الحد الأعلى للتقييم (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class OrderAnalyticsDto {
  @ApiPropertyOptional({ default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  days?: number = 7;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: OrderStatus;
}

// ===== Response DTOs =====

export class OrderResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiPropertyOptional()
  data?: unknown;

  @ApiPropertyOptional()
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class OrderTrackingDto {
  @ApiProperty()
  orderNumber!: string;

  @ApiProperty({ enum: OrderStatus })
  currentStatus!: OrderStatus;

  @ApiPropertyOptional()
  trackingNumber?: string;

  @ApiPropertyOptional()
  trackingUrl?: string;

  @ApiPropertyOptional()
  estimatedDelivery?: Date;

  @ApiPropertyOptional()
  actualDelivery?: Date;

  @ApiProperty()
  timeline!: Array<{
    status: OrderStatus;
    title: string;
    icon: string;
    completed: boolean;
    timestamp?: Date;
    notes?: string;
  }>;
}

export class OrderStatisticsDto {
  @ApiProperty()
  totalOrders!: number;

  @ApiProperty()
  completedOrders!: number;

  @ApiProperty()
  cancelledOrders!: number;

  @ApiProperty()
  totalSpent!: number;

  @ApiProperty()
  averageOrderValue!: number;

  @ApiProperty()
  ordersByStatus!: Array<{
    status: OrderStatus;
    count: number;
  }>;
}

export class OrderAnalyticsResponseDto {
  @ApiProperty()
  period!: string;

  @ApiProperty()
  totalOrders!: number;

  @ApiProperty()
  totalRevenue!: number;

  @ApiProperty()
  averageOrderValue!: number;

  @ApiProperty()
  ordersByStatus!: Array<{
    status: OrderStatus;
    count: number;
  }>;

  @ApiProperty()
  recentOrders!: unknown[];

  @ApiProperty()
  revenueByDay!: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

// ===== Admin DTOs =====

export class AdminOrderUpdateDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;
}

export class BulkOrderUpdateDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  orderIds!: string[];

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 50000, description: 'المبلغ المطابق' })
  @IsNumber()
  @Min(0)
  verifiedAmount!: number;

  @ApiProperty({ example: 'YER', enum: ['YER', 'SAR', 'USD'], description: 'العملة المطابقة' })
  @IsString()
  verifiedCurrency!: string;

  @ApiPropertyOptional({ description: 'ملاحظات المطابقة' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ===== Validation Groups =====

export const ValidationGroups = {
  CREATE: 'create',
  UPDATE: 'update',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;
