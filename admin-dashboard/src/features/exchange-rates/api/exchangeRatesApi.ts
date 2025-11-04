import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';

// Types
export interface ExchangeRatesData {
  usdToYer: number;
  usdToSar: number;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  notes?: string;
}

export interface UpdateExchangeRatesRequest {
  usdToYer: number;
  usdToSar: number;
  notes?: string;
}

export interface ConvertCurrencyRequest {
  amount: number;
  fromCurrency: 'USD' | 'YER' | 'SAR';
  toCurrency: 'USD' | 'YER' | 'SAR';
}

export interface ConvertCurrencyResponse {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: number;
  result: number;
  formatted: string;
}

export interface ExchangeRateResponse {
  rate: number;
  currency: string;
  formatted: string;
}

// Exchange Rates API Service
export class ExchangeRatesApiService {
  /**
   * Get current exchange rates
   */
  static async getCurrentRates(): Promise<ExchangeRatesData> {
    const response = await apiClient.get<ApiResponse<ExchangeRatesData>>('/admin/exchange-rates');
    return response.data.data;
  }

  /**
   * Update exchange rates
   */
  static async updateRates(data: UpdateExchangeRatesRequest): Promise<ExchangeRatesData> {
    const response = await apiClient.post<ApiResponse<ExchangeRatesData>>('/admin/exchange-rates/update', data);
    return response.data.data;
  }

  /**
   * Convert currency
   */
  static async convertCurrency(data: ConvertCurrencyRequest): Promise<ConvertCurrencyResponse> {
    const response = await apiClient.post<ApiResponse<ConvertCurrencyResponse>>('/admin/exchange-rates/convert', data);
    return response.data.data;
  }

  /**
   * Get USD to YER rate
   */
  static async getUSDToYERRate(): Promise<ExchangeRateResponse> {
    const response = await apiClient.get<ApiResponse<ExchangeRateResponse>>('/admin/exchange-rates/usd-to-yer');
    return response.data.data;
  }

  /**
   * Get USD to SAR rate
   */
  static async getUSDToSARRate(): Promise<ExchangeRateResponse> {
    const response = await apiClient.get<ApiResponse<ExchangeRateResponse>>('/admin/exchange-rates/usd-to-sar');
    return response.data.data;
  }
}

export default ExchangeRatesApiService;
