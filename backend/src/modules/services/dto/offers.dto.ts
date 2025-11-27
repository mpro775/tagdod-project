import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { Currency } from '../../users/schemas/user.schema';

export class CreateOfferDto {
  @IsMongoId() requestId!: string;
  @Type(() => Number) @IsNumber() @Min(0) amount!: number;
  @IsOptional() @IsString() note?: string;

  // نوع العملة (YER, SAR, USD)
  @IsEnum(Currency) currency!: Currency;

  // موقع المهندس لحساب المسافة
  @Type(() => Number) @IsNumber() lat!: number;
  @Type(() => Number) @IsNumber() lng!: number;
}

export class UpdateOfferDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsEnum(Currency) currency?: Currency;
}

// === DTOs للاستجابة ===

export class OffersStatisticsDto {
  totalOffers!: number;
  acceptedOffers!: number;
  pendingOffers!: number;
  totalValue!: number;
  averageOffer!: number;
}

export class EngineersOverviewStatisticsDto {
  totalEngineers!: number;
  averageRating!: number;
  averageCompletionRate!: number;
  totalRevenue!: number;
}

export class OfferEngineerDto {
  _id!: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
}

export class OfferRequestDto {
  _id!: string;
  title!: string;
  type!: string;
  status!: string;
  createdAt!: Date;
  userId!: string;
  addressId?: string;
}

export class OfferManagementDto {
  _id!: string;
  requestId!: OfferRequestDto;
  engineerId!: OfferEngineerDto;
  amount!: number;
  currency!: Currency;
  note?: string;
  distanceKm?: number;
  status!: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt!: Date;
  updatedAt!: Date;
}

export class OffersManagementResponseDto {
  data!: OfferManagementDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
  };
}