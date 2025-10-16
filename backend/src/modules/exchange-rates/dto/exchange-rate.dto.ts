import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Currency } from '../schemas/exchange-rate.schema';

export class CreateExchangeRateDto {
  @IsEnum(Currency)
  fromCurrency!: Currency;

  @IsEnum(Currency)
  toCurrency!: Currency;

  @IsNumber()
  @Min(0)
  rate!: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateExchangeRateDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  isActive?: boolean;
}

export class ConvertCurrencyDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(Currency)
  fromCurrency!: Currency;

  @IsEnum(Currency)
  toCurrency!: Currency;
}
