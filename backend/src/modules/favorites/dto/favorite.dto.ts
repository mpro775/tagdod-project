import { IsString, IsOptional, IsArray } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  note?: string; // ملاحظة خاصة

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // وسوم
}

export class RemoveFavoriteDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;
}

export class UpdateFavoriteDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class GuestAddFavoriteDto {
  @IsString()
  deviceId!: string; // معرف الجهاز

  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class GuestRemoveFavoriteDto {
  @IsString()
  deviceId!: string;

  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;
}

export class SyncFavoritesDto {
  @IsString()
  deviceId!: string; // معرف الجهاز للمزامنة
}
