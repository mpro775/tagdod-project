import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsArray, IsBoolean, IsUrl, IsMongoId, ValidateIf } from 'class-validator';
import { BannerLocation, BannerPromotionType } from '../schemas/banner.schema';
import { UserRole } from '../../users/schemas/user.schema';

export class CreateBannerDto {
  @IsString() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsMongoId() imageId!: string; // Media ID
  @ValidateIf((o) => o.linkUrl !== undefined && o.linkUrl !== null && o.linkUrl !== '')
  @IsUrl()
  @IsOptional()
  linkUrl?: string;
  @IsString() @IsOptional() altText?: string;
  
  @IsEnum(BannerLocation) location!: BannerLocation;
  @IsEnum(BannerPromotionType) @IsOptional() promotionType?: BannerPromotionType;
  
  @IsBoolean() @IsOptional() isActive?: boolean = true;
  @IsNumber() @IsOptional() sortOrder?: number = 0;
  
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsNumber() @IsOptional() displayDuration?: number;
  
  @IsArray() @IsOptional() targetAudiences?: string[];
  @IsArray() @IsEnum(UserRole, { each: true }) @IsOptional() targetUserTypes?: UserRole[];
  @IsArray() @IsOptional() targetCategories?: string[];
  @IsArray() @IsOptional() targetProducts?: string[];
}

export class UpdateBannerDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsMongoId() @IsOptional() imageId?: string; // Media ID
  @ValidateIf((o) => o.linkUrl !== undefined && o.linkUrl !== null && o.linkUrl !== '')
  @IsUrl()
  @IsOptional()
  linkUrl?: string;
  @IsString() @IsOptional() altText?: string;
  
  @IsEnum(BannerLocation) @IsOptional() location?: BannerLocation;
  @IsEnum(BannerPromotionType) @IsOptional() promotionType?: BannerPromotionType;
  
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsNumber() @IsOptional() sortOrder?: number;
  
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsNumber() @IsOptional() displayDuration?: number;
  
  @IsArray() @IsOptional() targetAudiences?: string[];
  @IsArray() @IsEnum(UserRole, { each: true }) @IsOptional() targetUserTypes?: UserRole[];
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
