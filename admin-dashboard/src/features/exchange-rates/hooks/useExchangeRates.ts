import { useState, useEffect, useCallback } from 'react';
import { ExchangeRatesApiService, ExchangeRatesData, UpdateExchangeRatesRequest, ConvertCurrencyRequest, ConvertCurrencyResponse } from '../api/exchangeRatesApi';

interface UseExchangeRatesReturn {
  // Data
  rates: ExchangeRatesData | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRates: () => Promise<void>;
  updateRates: (data: UpdateExchangeRatesRequest) => Promise<void>;
  convertCurrency: (data: ConvertCurrencyRequest) => Promise<ConvertCurrencyResponse>;
  
  // State
  isUpdating: boolean;
  isConverting: boolean;
}

export const useExchangeRates = (): UseExchangeRatesReturn => {
  const [rates, setRates] = useState<ExchangeRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExchangeRatesApiService.getCurrentRates();
      setRates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في جلب أسعار الصرف';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRates = useCallback(async (data: UpdateExchangeRatesRequest) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedRates = await ExchangeRatesApiService.updateRates(data);
      setRates(updatedRates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحديث أسعار الصرف';
      setError(errorMessage);
      throw err; // Re-throw to allow component to handle
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const convertCurrency = useCallback(async (data: ConvertCurrencyRequest): Promise<ConvertCurrencyResponse> => {
    try {
      setIsConverting(true);
      setError(null);
      const result = await ExchangeRatesApiService.convertCurrency(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحويل العملة';
      setError(errorMessage);
      throw err; // Re-throw to allow component to handle
    } finally {
      setIsConverting(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    fetchRates,
    updateRates,
    convertCurrency,
    isUpdating,
    isConverting,
  };
};

export default useExchangeRates;
