import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @IsMongoId() requestId!: string;
  @Type(() => Number) @IsNumber() @Min(0) amount!: number;
  @IsOptional() @IsString() note?: string;

  // موقع المهندس لحساب المسافة
  @Type(() => Number) @IsNumber() lat!: number;
  @Type(() => Number) @IsNumber() lng!: number;
}

export class UpdateOfferDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() note?: string;
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