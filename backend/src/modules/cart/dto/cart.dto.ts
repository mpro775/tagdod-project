import {
  IsMongoId,
  IsString,
  IsInt,
  IsOptional,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({ example: '65abc123def456789' })
  @IsMongoId()
  variantId!: string;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  qty: number = 1;
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
