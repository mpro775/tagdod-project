import { apiClient } from '@/core/api/client';

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
  fromCurrency: 'USD';
  toCurrency: 'YER' | 'SAR';
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

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: {
    data: T;
    meta?: any;
  };
  message?: string;
}

// Exchange Rates API Service
export class ExchangeRatesApiService {
  /**
   * Get current exchange rates
   */
  static async getCurrentRates(): Promise<ExchangeRatesData> {
    try {
      const response = await apiClient.get<ApiResponse<ExchangeRatesData>>('/admin/exchange-rates');
      return response.data.data.data;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error('فشل في جلب أسعار الصرف');
    }
  }

  /**
   * Update exchange rates
   */
  static async updateRates(data: UpdateExchangeRatesRequest): Promise<ExchangeRatesData> {
    try {
      const response = await apiClient.post<ApiResponse<ExchangeRatesData>>('/admin/exchange-rates/update', data);
      return response.data.data.data;
    } catch (error) {
      console.error('Error updating exchange rates:', error);
      throw new Error('فشل في تحديث أسعار الصرف');
    }
  }

  /**
   * Convert currency
   */
  static async convertCurrency(data: ConvertCurrencyRequest): Promise<ConvertCurrencyResponse> {
    try {
      const response = await apiClient.post<ApiResponse<ConvertCurrencyResponse>>('/admin/exchange-rates/convert', data);
      return response.data.data.data;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw new Error('فشل في تحويل العملة');
    }
  }

  /**
   * Get USD to YER rate
   */
  static async getUSDToYERRate(): Promise<ExchangeRateResponse> {
    try {
      const response = await apiClient.get<ApiResponse<ExchangeRateResponse>>('/admin/exchange-rates/usd-to-yer');
      return response.data.data.data;
    } catch (error) {
      console.error('Error fetching USD to YER rate:', error);
      throw new Error('فشل في جلب سعر الدولار للريال اليمني');
    }
  }

  /**
   * Get USD to SAR rate
   */
  static async getUSDToSARRate(): Promise<ExchangeRateResponse> {
    try {
      const response = await apiClient.get<ApiResponse<ExchangeRateResponse>>('/admin/exchange-rates/usd-to-sar');
      return response.data.data.data;
    } catch (error) {
      console.error('Error fetching USD to SAR rate:', error);
      throw new Error('فشل في جلب سعر الدولار للريال السعودي');
    }
  }
}

export default ExchangeRatesApiService;
