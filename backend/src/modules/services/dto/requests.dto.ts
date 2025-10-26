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
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { YEMENI_CITIES, DEFAULT_CITY } from '../enums/yemeni-cities.enum';

export class CreateServiceRequestDto {
  @IsString() @MaxLength(140) title!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() images?: string[];

  @IsNotEmpty({ message: 'المدينة مطلوبة' })
  @IsString({ message: 'المدينة يجب أن تكون نصاً' })
  @IsIn(YEMENI_CITIES, { message: 'المدينة يجب أن تكون من المدن اليمنية المدعومة' })
  city: string = DEFAULT_CITY;

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

export class NearbyQueryDto {
  @Type(() => Number) @IsNumber() lat!: number;
  @Type(() => Number) @IsNumber() lng!: number;
  @Type(() => Number) @IsNumber() @Min(1) @Max(200) radiusKm: number = 10;
}
