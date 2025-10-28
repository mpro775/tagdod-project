import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/core/api/client';

export type Currency = 'USD' | 'YER' | 'SAR';

interface ExchangeRates {
  usdToYer: number;
  usdToSar: number;
  lastUpdated?: Date;
}

interface CurrencyContextType {
  selectedCurrency: Currency;
  // eslint-disable-next-line no-unused-vars
  setSelectedCurrency: (currency: Currency) => void;
  exchangeRates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  // eslint-disable-next-line no-unused-vars
  convertFromUSD: (amountUSD: number) => { amount: number; formatted: string };
  // eslint-disable-next-line no-unused-vars
  formatPrice: (amount: number, currency?: Currency) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function useSimpleCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useSimpleCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export function useCurrencyProvider() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // جلب أسعار الصرف عند تحميل الصفحة
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/exchange-rates');
      const data = response.data;
      setExchangeRates({
        usdToYer: data.usdToYer,
        usdToSar: data.usdToSar,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : undefined,
      });
    } catch  {
      setError('فشل في تحديث أسعار الصرف');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRates = async () => {
    await fetchExchangeRates();
  };

  const convertFromUSD = (amountUSD: number) => {
    if (!exchangeRates) {
      return { amount: amountUSD, formatted: `$${amountUSD}` };
    }

    let amount: number;
    let formatted: string;

    switch (selectedCurrency) {
      case 'YER':
        amount = amountUSD * exchangeRates.usdToYer;
        formatted = `${Math.round(amount).toLocaleString()} $`;
        break;
      case 'SAR':
        amount = amountUSD * exchangeRates.usdToSar;
        formatted = `${amount.toFixed(2)} $`;
        break;
      default:
        amount = amountUSD;
        formatted = `$${amountUSD}`;
    }

    return { amount, formatted };
  };

  const formatPrice = (amount: number, currency?: Currency) => {
    const targetCurrency = currency || selectedCurrency;
    
    switch (targetCurrency) {
      case 'YER':
        return `${Math.round(amount).toLocaleString()} $`;
      case 'SAR':
        return `${amount.toFixed(2)} $`;
      default:
        return `$${amount}`;
    }
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    isLoading,
    error,
    convertFromUSD,
    formatPrice,
    refreshRates,
  };
}

export { CurrencyContext };
