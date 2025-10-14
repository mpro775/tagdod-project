import { 
  IsIn, 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsEnum,
  IsArray,
  ValidateNested,
  MinLength,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../schemas/order.schema';

export class CheckoutPreviewDto {
  @ApiProperty({ example: 'YER', enum: ['YER', 'SAR', 'USD'] })
  @IsString()
  currency!: string;

  @ApiProperty({ required: false })
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

  @ApiProperty({ example: 'COD', enum: ['COD', 'ONLINE'] })
  @IsIn(['COD', 'ONLINE'])
  paymentMethod!: 'COD' | 'ONLINE';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentProvider?: string;

  @ApiProperty({ required: false, example: 'standard' })
  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiProperty({ required: false })
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

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  estimatedDeliveryDate?: string;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
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
  rating!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  review?: string;
}

export class ListOrdersDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
