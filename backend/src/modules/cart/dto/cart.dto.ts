import {
  IsMongoId,
  IsString,
  IsInt,
  IsOptional,
  IsObject,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({ example: '65abc123def456789', required: false })
  @ValidateIf((value: AddItemDto) => !value.productId)
  @IsMongoId()
  variantId?: string;

  @ApiProperty({ example: '65abc123def456780', required: false })
  @ValidateIf((value: AddItemDto) => !value.variantId)
  @IsMongoId()
  productId?: string;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  qty: number = 1;

  @ApiProperty({ example: 'YER', enum: ['YER', 'SAR', 'USD'], required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'retail', enum: ['retail', 'merchant', 'engineer'], required: false })
  @IsOptional()
  @IsString()
  accountType?: string;
}

export class UpdateItemDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  qty!: number;
}

export class GuestAddItemDto extends AddItemDto {
  @ApiProperty({ example: 'device_unique_id_123' })
  @IsString()
  deviceId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    source?: string;
    utmSource?: string;
    utmMedium?: string;
  };
}

export class GuestUpdateItemDto extends UpdateItemDto {
  @ApiProperty({ example: 'device_unique_id_123' })
  @IsString()
  deviceId!: string;
}

export class DeviceDto {
  @ApiProperty({ example: 'device_unique_id_123' })
  @IsString()
  deviceId!: string;
}

export class PreviewDto {
  @ApiProperty({ example: 'YER', enum: ['YER', 'SAR', 'USD'] })
  @IsString()
  currency!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class GuestPreviewDto extends PreviewDto {
  @ApiProperty({ example: 'device_unique_id_123' })
  @IsString()
  deviceId!: string;
}

export class ApplyCouponDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  couponCode!: string;
}

export class GuestApplyCouponDto extends ApplyCouponDto {
  @ApiProperty({ example: 'device_unique_id_123' })
  @IsString()
  deviceId!: string;
}

export class MergeCartDto {
  @ApiProperty({ example: 'device_unique_id_123' })
  @IsString()
  deviceId!: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  clearGuestCart?: boolean;
}

export class UpdateCartSettingsDto {
  @ApiProperty({ example: 'YER', enum: ['YER', 'SAR', 'USD'], required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'retail', enum: ['retail', 'merchant', 'engineer'], required: false })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    source?: string;
    campaign?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
}

export class PricingSummaryDto {
  @ApiProperty({ example: 100.50 })
  subtotal!: number;

  @ApiProperty({ example: 10.00 })
  promotionDiscount!: number;

  @ApiProperty({ example: 5.00 })
  couponDiscount!: number;

  @ApiProperty({ example: 2.00 })
  autoDiscount!: number;

  @ApiProperty({ example: 17.00 })
  totalDiscount!: number;

  @ApiProperty({ example: 83.50 })
  total!: number;

  @ApiProperty({ example: 3 })
  itemsCount!: number;

  @ApiProperty({ example: 'YER' })
  currency!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  lastCalculatedAt!: Date;
}
