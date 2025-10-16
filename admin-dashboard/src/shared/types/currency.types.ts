export enum Currency {
  USD = 'USD',
  YER = 'YER', // الريال اليمني
  SAR = 'SAR', // الريال السعودي
}

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

export interface PriceInfo {
  amount: number;
  currency: Currency;
  originalAmountUSD: number;
  exchangeRate: number;
  formatted: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  isActive: boolean;
  effectiveDate?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
