import { IsBoolean, IsDateString, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePriceRuleDto {
  @IsBoolean() @IsOptional() active?: boolean = true;
  @IsNumber() priority!: number;
  @IsDateString() startAt!: string;
  @IsDateString() endAt!: string;

  @IsObject() @IsOptional() conditions?: {
    categoryId?: string;
    productId?: string;
    variantId?: string;
    brandId?: string;
    currency?: string;
    minQty?: number;
    accountType?: string;
  };

  @IsObject() effects!: {
    percentOff?: number;
    amountOff?: number;
    specialPrice?: number;
    badge?: string;
    giftSku?: string;
  };
}

export class UpdatePriceRuleDto {
  @IsBoolean() @IsOptional() active?: boolean;
  @IsNumber() @IsOptional() priority?: number;
  @IsDateString() @IsOptional() startAt?: string;
  @IsDateString() @IsOptional() endAt?: string;

  @IsObject() @IsOptional() conditions?: {
    categoryId?: string;
    productId?: string;
    variantId?: string;
    brandId?: string;
    currency?: string;
    minQty?: number;
    accountType?: string;
  };

  @IsObject() @IsOptional() effects?: {
    percentOff?: number;
    amountOff?: number;
    specialPrice?: number;
    badge?: string;
    giftSku?: string;
  };
}

export class PreviewPriceRuleDto {
  @IsString() ruleId!: string;
  @IsString() variantId!: string;
  @IsString() @IsOptional() currency?: string;
  @IsNumber() @IsOptional() qty?: number = 1;
  @IsString() @IsOptional() accountType?: string;
}

export class PricingQueryDto {
  @IsString() variantId!: string;
  @IsString() @IsOptional() currency?: string;
  @IsNumber() @IsOptional() qty?: number = 1;
  @IsString() @IsOptional() accountType?: string;
}
