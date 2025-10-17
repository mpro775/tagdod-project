import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  fromCurrency!: string;

  @IsString()
  toCurrency!: string;

  @IsNumber()
  @Min(0.0001)
  rate!: number;

  @IsNumber()
  @Min(0.0001)
  baseRate!: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  buyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  sellRate?: number;

  @IsOptional()
  @IsNumber()
  spread?: number;

  @IsOptional()
  @IsEnum(['manual', 'automatic', 'api'])
  source?: 'manual' | 'automatic' | 'api';

  @IsOptional()
  @IsString()
  apiProvider?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateExchangeRateDto {
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  rate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  baseRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  buyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  sellRate?: number;

  @IsOptional()
  @IsNumber()
  spread?: number;

  @IsOptional()
  @IsEnum(['manual', 'automatic', 'api'])
  source?: 'manual' | 'automatic' | 'api';

  @IsOptional()
  @IsString()
  apiProvider?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ConvertCurrencyDto {
  @IsString()
  fromCurrency!: string;

  @IsString()
  toCurrency!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  rateType?: 'buy' | 'sell' | 'mid'; // نوع السعر
}

export class ExchangeRateQueryDto {
  @IsOptional()
  @IsString()
  fromCurrency?: string;

  @IsOptional()
  @IsString()
  toCurrency?: string;

  @IsOptional()
  @IsEnum(['manual', 'automatic', 'api'])
  source?: 'manual' | 'automatic' | 'api';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class ExchangeRateHistoryQueryDto {
  @IsOptional()
  @IsString()
  fromCurrency?: string;

  @IsOptional()
  @IsString()
  toCurrency?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsEnum(['increase', 'decrease', 'no_change'])
  changeType?: 'increase' | 'decrease' | 'no_change';

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class BulkUpdateExchangeRatesDto {
  @IsObject()
  updates!: Array<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    reason?: string;
  }>;
}

export class ExchangeRateStatisticsDto {
  @IsOptional()
  @IsString()
  fromCurrency?: string;

  @IsOptional()
  @IsString()
  toCurrency?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
