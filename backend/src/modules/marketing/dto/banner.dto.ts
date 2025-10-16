import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsArray, IsBoolean, IsUrl } from 'class-validator';
import { BannerLocation, BannerPromotionType } from '../schemas/banner.schema';

export class CreateBannerDto {
  @IsString() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsUrl() imageUrl!: string;
  @IsUrl() @IsOptional() linkUrl?: string;
  @IsString() @IsOptional() altText?: string;
  
  @IsEnum(BannerLocation) location!: BannerLocation;
  @IsEnum(BannerPromotionType) @IsOptional() promotionType?: BannerPromotionType;
  
  @IsBoolean() @IsOptional() isActive?: boolean = true;
  @IsNumber() @IsOptional() sortOrder?: number = 0;
  
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsNumber() @IsOptional() displayDuration?: number;
  
  @IsArray() @IsOptional() targetAudiences?: string[];
  @IsArray() @IsOptional() targetCategories?: string[];
  @IsArray() @IsOptional() targetProducts?: string[];
}

export class UpdateBannerDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsUrl() @IsOptional() imageUrl?: string;
  @IsUrl() @IsOptional() linkUrl?: string;
  @IsString() @IsOptional() altText?: string;
  
  @IsEnum(BannerLocation) @IsOptional() location?: BannerLocation;
  @IsEnum(BannerPromotionType) @IsOptional() promotionType?: BannerPromotionType;
  
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsNumber() @IsOptional() sortOrder?: number;
  
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsNumber() @IsOptional() displayDuration?: number;
  
  @IsArray() @IsOptional() targetAudiences?: string[];
  @IsArray() @IsOptional() targetCategories?: string[];
  @IsArray() @IsOptional() targetProducts?: string[];
}

export class ListBannersDto {
  @IsNumber() @IsOptional() page?: number = 1;
  @IsNumber() @IsOptional() limit?: number = 20;
  @IsString() @IsOptional() search?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsEnum(BannerLocation) @IsOptional() location?: BannerLocation;
  @IsString() @IsOptional() sortBy?: string = 'sortOrder';
  @IsString() @IsOptional() sortOrder?: 'asc' | 'desc' = 'asc';
}
