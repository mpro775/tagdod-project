import { useState, useEffect, useCallback } from 'react';
import { Currency, CurrencyInfo, PriceInfo } from '../types/currency.types';
import { useAuth } from '../../features/auth/hooks/useAuth';

const CURRENCY_INFO: Record<Currency, CurrencyInfo> = {
  [Currency.USD]: {
    code: Currency.USD,
    symbol: '$',
    name: 'دولار أمريكي',
    decimalPlaces: 2,
  },
  [Currency.YER]: {
    code: Currency.YER,
    symbol: 'ر.ي',
    name: 'ريال يمني',
    decimalPlaces: 0,
  },
  [Currency.SAR]: {
    code: Currency.SAR,
    symbol: 'ر.س',
    name: 'ريال سعودي',
    decimalPlaces: 2,
  },
};

export const useCurrency = () => {
  const { user, updateUser } = useAuth();
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // الحصول على العملة المفضلة من بيانات المستخدم
  const selectedCurrency = user?.preferredCurrency || Currency.USD;

  // تحميل أسعار الصرف
  const loadExchangeRates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/exchange-rates');
      const data = await response.json();
      
      const rates: Record<string, number> = {};
      data.forEach((rate: any) => {
        if (rate.isActive) {
          const key = `${rate.fromCurrency}_${rate.toCurrency}`;
          rates[key] = rate.rate;
        }
      });
      
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تحميل أسعار الصرف عند بدء التطبيق
  useEffect(() => {
    loadExchangeRates();
  }, [loadExchangeRates]);

  // تغيير العملة المفضلة
  const changeCurrency = useCallback(async (currency: Currency) => {
    try {
      const response = await fetch('/api/auth/preferred-currency', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ currency })
      });

      if (response.ok) {
        // تحديث بيانات المستخدم في الـ context
        updateUser({ preferredCurrency: currency });
      } else {
        throw new Error('Failed to update currency');
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  }, [updateUser]);

  // تحويل سعر من الدولار إلى عملة أخرى
  const convertFromUSD = useCallback((amountUSD: number, targetCurrency: Currency): PriceInfo => {
    if (targetCurrency === Currency.USD) {
      return {
        amount: amountUSD,
        currency: Currency.USD,
        originalAmountUSD: amountUSD,
        exchangeRate: 1,
        formatted: formatPrice(amountUSD, Currency.USD)
      };
    }

    const rateKey = `USD_${targetCurrency}`;
    const rate = exchangeRates[rateKey] || 1;
    const convertedAmount = amountUSD * rate;

    return {
      amount: convertedAmount,
      currency: targetCurrency,
      originalAmountUSD: amountUSD,
      exchangeRate: rate,
      formatted: formatPrice(convertedAmount, targetCurrency)
    };
  }, [exchangeRates]);

  // تحويل سعر من أي عملة إلى الدولار
  const convertToUSD = useCallback((amount: number, fromCurrency: Currency): number => {
    if (fromCurrency === Currency.USD) {
      return amount;
    }

    const rateKey = `${fromCurrency}_USD`;
    const rate = exchangeRates[rateKey] || 1;
    return amount / rate;
  }, [exchangeRates]);

  // تحويل سعر بين أي عملتين
  const convertPrice = useCallback((amount: number, fromCurrency: Currency, toCurrency: Currency): PriceInfo => {
    if (fromCurrency === toCurrency) {
      return {
        amount,
        currency: toCurrency,
        originalAmountUSD: fromCurrency === Currency.USD ? amount : convertToUSD(amount, fromCurrency),
        exchangeRate: 1,
        formatted: formatPrice(amount, toCurrency)
      };
    }

    // تحويل إلى الدولار أولاً ثم إلى العملة المطلوبة
    const amountUSD = fromCurrency === Currency.USD ? amount : convertToUSD(amount, fromCurrency);
    return convertFromUSD(amountUSD, toCurrency);
  }, [convertFromUSD, convertToUSD]);

  // تنسيق السعر حسب العملة
  const formatPrice = useCallback((amount: number, currency: Currency): string => {
    const info = CURRENCY_INFO[currency];
    const roundedAmount = Math.round(amount * Math.pow(10, info.decimalPlaces)) / Math.pow(10, info.decimalPlaces);
    
    return `${info.symbol}${roundedAmount.toFixed(info.decimalPlaces)}`;
  }, []);

  // الحصول على معلومات العملة الحالية
  const getCurrentCurrencyInfo = useCallback((): CurrencyInfo => {
    return CURRENCY_INFO[selectedCurrency];
  }, [selectedCurrency]);

  // الحصول على جميع العملات المدعومة
  const getSupportedCurrencies = useCallback((): CurrencyInfo[] => {
    return Object.values(CURRENCY_INFO);
  }, []);

  return {
    selectedCurrency,
    changeCurrency,
    convertFromUSD,
    convertToUSD,
    convertPrice,
    formatPrice,
    getCurrentCurrencyInfo,
    getSupportedCurrencies,
    exchangeRates,
    loadExchangeRates,
    isLoading,
  };
};
