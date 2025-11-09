import { IsString, IsOptional } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  note?: string; // ملاحظة خاصة
}

export class RemoveFavoriteDto {
  @IsString()
  productId!: string;
}

export class UpdateFavoriteDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class GuestAddFavoriteDto {
  @IsString()
  deviceId!: string; // معرف الجهاز

  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class GuestRemoveFavoriteDto {
  @IsString()
  deviceId!: string;

  @IsString()
  productId!: string;
}

export class SyncFavoritesDto {
  @IsString()
  deviceId!: string; // معرف الجهاز للمزامنة
}
