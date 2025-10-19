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

/**
 * DTOs للطلبات - نظام موحد
 */

// ===== Checkout DTOs =====

export class CheckoutPreviewDto {
  @ApiProperty({ example: 'YER', enum: ['YER', 'SAR', 'USD'] })
  @IsString()
  currency!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
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

  @ApiPropertyOptional({ example: 'standard', enum: Object.values(ShippingMethod) })
  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
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

  @ApiPropertyOptional({ enum: Object.values(ShippingMethod) })
  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
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

// ===== Validation Groups =====

export const ValidationGroups = {
  CREATE: 'create',
  UPDATE: 'update',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;
