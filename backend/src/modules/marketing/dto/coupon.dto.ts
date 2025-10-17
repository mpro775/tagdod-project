import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { CouponType, CouponStatus, CouponVisibility, DiscountAppliesTo } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsString() @IsOptional() description?: string;
  
  @IsEnum(CouponType) @IsOptional() type?: CouponType = CouponType.PERCENTAGE;
  @IsEnum(CouponStatus) @IsOptional() status?: CouponStatus = CouponStatus.ACTIVE;
  @IsEnum(CouponVisibility) @IsOptional() visibility?: CouponVisibility = CouponVisibility.PUBLIC;

  @IsNumber() @IsOptional() discountValue?: number;
  @IsNumber() @IsOptional() minimumOrderAmount?: number;
  @IsNumber() @IsOptional() maximumDiscountAmount?: number;
  
  @IsNumber() @IsOptional() usageLimit?: number;
  @IsNumber() @IsOptional() usageLimitPerUser?: number;
  
  @IsDateString() validFrom!: string;
  @IsDateString() validUntil!: string;
  
  @IsEnum(DiscountAppliesTo) @IsOptional() appliesTo?: DiscountAppliesTo = DiscountAppliesTo.ALL_PRODUCTS;
  @IsArray() @IsOptional() applicableProductIds?: string[];
  @IsArray() @IsOptional() applicableCategoryIds?: string[];
  @IsArray() @IsOptional() applicableBrandIds?: string[];
  @IsArray() @IsOptional() applicableUserIds?: string[];
  @IsArray() @IsOptional() excludedUserIds?: string[];
  
  @IsNumber() @IsOptional() buyXQuantity?: number;
  @IsNumber() @IsOptional() getYQuantity?: number;
  @IsString() @IsOptional() getYProductId?: string;
}

export class UpdateCouponDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
  
  @IsEnum(CouponType) @IsOptional() type?: CouponType;
  @IsEnum(CouponStatus) @IsOptional() status?: CouponStatus;
  @IsEnum(CouponVisibility) @IsOptional() visibility?: CouponVisibility;

  @IsNumber() @IsOptional() discountValue?: number;
  @IsNumber() @IsOptional() minimumOrderAmount?: number;
  @IsNumber() @IsOptional() maximumDiscountAmount?: number;
  
  @IsNumber() @IsOptional() usageLimit?: number;
  @IsNumber() @IsOptional() usageLimitPerUser?: number;
  
  @IsDateString() @IsOptional() validFrom?: string;
  @IsDateString() @IsOptional() validUntil?: string;
  
  @IsEnum(DiscountAppliesTo) @IsOptional() appliesTo?: DiscountAppliesTo;
  @IsArray() @IsOptional() applicableProductIds?: string[];
  @IsArray() @IsOptional() applicableCategoryIds?: string[];
  @IsArray() @IsOptional() applicableBrandIds?: string[];
  @IsArray() @IsOptional() applicableUserIds?: string[];
  @IsArray() @IsOptional() excludedUserIds?: string[];
  
  @IsNumber() @IsOptional() buyXQuantity?: number;
  @IsNumber() @IsOptional() getYQuantity?: number;
  @IsString() @IsOptional() getYProductId?: string;
}

export class ListCouponsDto {
  @IsNumber() @IsOptional() page?: number = 1;
  @IsNumber() @IsOptional() limit?: number = 20;
  @IsString() @IsOptional() search?: string;
  @IsEnum(CouponStatus) @IsOptional() status?: CouponStatus;
  @IsEnum(CouponType) @IsOptional() type?: CouponType;
  @IsEnum(CouponVisibility) @IsOptional() visibility?: CouponVisibility;
}

export class ValidateCouponDto {
  @IsString() code!: string;
  @IsString() @IsOptional() userId?: string;
  @IsNumber() @IsOptional() orderAmount?: number;
  @IsArray() @IsOptional() productIds?: string[];
}
