import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  IsObject,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CouponType,
  CouponStatus,
  CouponVisibility,
  DiscountAppliesTo,
} from '../schemas/coupon.schema';

export class BuyXGetYDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  buyQuantity!: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  getQuantity!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'خصم الصيف 2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type!: CouponType;

  @ApiProperty({ enum: CouponVisibility, required: false })
  @IsOptional()
  @IsEnum(CouponVisibility)
  visibility?: CouponVisibility;

  // Discount Configuration
  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ enum: DiscountAppliesTo, required: false })
  @IsOptional()
  @IsEnum(DiscountAppliesTo)
  appliesTo?: DiscountAppliesTo;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProductIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategoryIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableBrandIds?: string[];

  // Conditions
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @ApiProperty({ required: false, example: 'YER' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedAccountTypes?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedUserIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  firstOrderOnly?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  newUsersOnly?: boolean;

  // Usage Limits
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTotalUses?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  oneTimeUse?: boolean;

  // Date Range
  @ApiProperty({ example: '2024-06-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-08-31T23:59:59Z' })
  @IsDateString()
  endDate!: string;

  // Buy X Get Y
  @ApiProperty({ required: false, type: BuyXGetYDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BuyXGetYDto)
  buyXGetY?: BuyXGetYDto;

  // Advanced Features
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  excludeSaleItems?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProductIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategoryIds?: string[];

  // Metadata
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    campaign?: string;
    source?: string;
    notes?: string;
    tags?: string[];
  };
}

export class UpdateCouponDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: CouponStatus, required: false })
  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;

  @ApiProperty({ enum: CouponVisibility, required: false })
  @IsOptional()
  @IsEnum(CouponVisibility)
  visibility?: CouponVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ enum: DiscountAppliesTo, required: false })
  @IsOptional()
  @IsEnum(DiscountAppliesTo)
  appliesTo?: DiscountAppliesTo;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProductIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategoryIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableBrandIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedAccountTypes?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedUserIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  firstOrderOnly?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  newUsersOnly?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTotalUses?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  oneTimeUse?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, type: BuyXGetYDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BuyXGetYDto)
  buyXGetY?: BuyXGetYDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  excludeSaleItems?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProductIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategoryIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    campaign?: string;
    source?: string;
    notes?: string;
    tags?: string[];
  };
}

export class ListCouponsDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: CouponStatus, required: false })
  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;

  @ApiProperty({ enum: CouponType, required: false })
  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @ApiProperty({ enum: CouponVisibility, required: false })
  @IsOptional()
  @IsEnum(CouponVisibility)
  visibility?: CouponVisibility;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDeleted?: boolean;

  @ApiProperty({ required: false, example: 'code' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, example: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsString()
  @MinLength(3)
  code!: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  orderAmount!: number;

  @ApiProperty({ example: 'YER' })
  @IsString()
  currency!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}

export class ApplyCouponDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsString()
  code!: string;
}

export class BulkGenerateCouponsDto {
  @ApiProperty({ example: 'SALE' })
  @IsString()
  @MaxLength(20)
  prefix!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  @Max(10000)
  count!: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage!: number;

  @ApiProperty({ example: '2024-06-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-08-31T23:59:59Z' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerUser?: number;
}

