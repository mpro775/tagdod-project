import { useState, useEffect, useCallback } from 'react';
import { Currency, CurrencyInfo, PriceInfo } from '../types/currency.types';

const CURRENCY_STORAGE_KEY = 'selected_currency';

export const CURRENCY_INFO: Record<Currency, CurrencyInfo> = {
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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.USD);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // تحميل العملة المحفوظة عند بدء التطبيق
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency;
    if (savedCurrency && Object.values(Currency).includes(savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // حفظ العملة المختارة
  const changeCurrency = useCallback((currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  }, []);

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

  // تحويل السعر
  const convertPrice = useCallback((amountUSD: number, targetCurrency: Currency): PriceInfo => {
    if (targetCurrency === Currency.USD) {
      return {
        amount: amountUSD,
        currency: Currency.USD,
        originalAmountUSD: amountUSD,
        exchangeRate: 1,
        formatted: formatPrice(amountUSD, Currency.USD),
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
      formatted: formatPrice(convertedAmount, targetCurrency),
    };
  }, [exchangeRates]);

  // تنسيق السعر
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
    convertPrice,
    formatPrice,
    getCurrentCurrencyInfo,
    getSupportedCurrencies,
    exchangeRates,
    loadExchangeRates,
    isLoading,
  };
};
