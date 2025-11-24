import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
export class CreateServiceRequestDto {
  @IsString() @MaxLength(140) title!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() images?: string[];

  @IsMongoId() addressId!: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
}

export class AcceptOfferDto {
  @IsMongoId() offerId!: string;
}

export class RateServiceDto {
  @Type(() => Number) @IsNumber() @Min(1) @Max(5) score!: number;
  @IsOptional() @IsString() @MaxLength(500) comment?: string;
}

export class UpdateServiceRequestDto {
  @IsOptional() @IsString() @MaxLength(140) title?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsMongoId() addressId?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
}

export class NearbyQueryDto {
  @Type(() => Number) @IsNumber() lat!: number;
  @Type(() => Number) @IsNumber() lng!: number;
  @Type(() => Number) @IsNumber() @Min(1) @Max(200) radiusKm: number = 10;
}

export class CancelServiceRequestDto {
  @IsString() @MaxLength(500) reason!: string;
}