import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateExchangeRateDto {
  @IsNumber()
  @Min(0.01)
  usdToYer!: number;

  @IsNumber()
  @Min(0.01)
  usdToSar!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConvertCurrencyDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  fromCurrency!: string; // 'USD'

  @IsString()
  toCurrency!: string; // 'YER' أو 'SAR'
}

export class CurrencyConversionResult {
  fromCurrency!: string;
  toCurrency!: string;
  amount!: number;
  rate!: number;
  result!: number;
  formatted!: string;
}
