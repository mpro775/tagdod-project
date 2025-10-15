import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsObject,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BannerType, BannerLocation, BannerPromotionType } from '../schemas/banner.schema';

export class CreateBannerDto {
  @ApiProperty({ example: 'Summer Sale 2024', description: 'Banner title' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Get up to 50% off on selected items', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'https://example.com/banner.jpg', description: 'Banner image URL' })
  @IsString()
  image!: string;

  @ApiProperty({ enum: BannerType, example: BannerType.IMAGE, required: false })
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @ApiProperty({ enum: BannerLocation, example: BannerLocation.HOME_TOP, required: false })
  @IsOptional()
  @IsEnum(BannerLocation)
  location?: BannerLocation;

  @ApiProperty({ example: 'https://example.com/sale', required: false })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiProperty({ example: 'Shop Now', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  linkText?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ enum: BannerPromotionType, example: BannerPromotionType.NONE, required: false })
  @IsOptional()
  @IsEnum(BannerPromotionType)
  promotionType?: BannerPromotionType;

  @ApiProperty({ example: '65abc123def456789', required: false, description: 'PriceRule ID if promotionType is price_rule' })
  @IsOptional()
  @IsString()
  linkedPriceRuleId?: string;

  @ApiProperty({ example: 'SUMMER2024', required: false, description: 'Coupon code if promotionType is coupon' })
  @IsOptional()
  @IsString()
  linkedCouponCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateBannerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ enum: BannerType, required: false })
  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;

  @ApiProperty({ enum: BannerLocation, required: false })
  @IsOptional()
  @IsEnum(BannerLocation)
  location?: BannerLocation;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  linkText?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ enum: BannerPromotionType, required: false })
  @IsOptional()
  @IsEnum(BannerPromotionType)
  promotionType?: BannerPromotionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkedPriceRuleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkedCouponCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListBannersDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ example: 'Summer Sale', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: BannerLocation, required: false })
  @IsOptional()
  @IsEnum(BannerLocation)
  location?: BannerLocation;

  @ApiProperty({ example: 'sortOrder', enum: ['title', 'createdAt', 'sortOrder', 'startDate'], required: false })
  @IsOptional()
  @IsIn(['title', 'createdAt', 'sortOrder', 'startDate'])
  sortBy?: 'title' | 'createdAt' | 'sortOrder' | 'startDate' = 'sortOrder';

  @ApiProperty({ example: 'asc', enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

