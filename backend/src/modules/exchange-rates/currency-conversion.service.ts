import { Injectable, Logger } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { Currency } from './schemas/exchange-rate.schema';

export interface PriceInfo {
  amount: number;
  currency: Currency;
  originalAmountUSD: number;
  exchangeRate: number;
  formatted: string;
}

@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);

  constructor(
    private readonly exchangeRatesService: ExchangeRatesService,
  ) {}

  /**
   * تحويل سعر من الدولار إلى عملة أخرى
   */
  async convertFromUSD(amountUSD: number, targetCurrency: Currency): Promise<PriceInfo> {
    if (targetCurrency === Currency.USD) {
      return {
        amount: amountUSD,
        currency: Currency.USD,
        originalAmountUSD: amountUSD,
        exchangeRate: 1,
        formatted: this.formatPrice(amountUSD, Currency.USD)
      };
    }

    try {
      const conversion = await this.exchangeRatesService.convertCurrency({
        amount: amountUSD,
        fromCurrency: Currency.USD,
        toCurrency: targetCurrency
      });

      return {
        amount: conversion.convertedAmount,
        currency: targetCurrency,
        originalAmountUSD: amountUSD,
        exchangeRate: conversion.rate,
        formatted: this.formatPrice(conversion.convertedAmount, targetCurrency)
      };
    } catch (error) {
      this.logger.error(`Error converting ${amountUSD} USD to ${targetCurrency}:`, error);
      throw error;
    }
  }

  /**
   * تحويل سعر من أي عملة إلى الدولار
   */
  async convertToUSD(amount: number, fromCurrency: Currency): Promise<number> {
    if (fromCurrency === Currency.USD) {
      return amount;
    }

    try {
      const conversion = await this.exchangeRatesService.convertCurrency({
        amount,
        fromCurrency,
        toCurrency: Currency.USD
      });

      return conversion.convertedAmount;
    } catch (error) {
      this.logger.error(`Error converting ${amount} ${fromCurrency} to USD:`, error);
      throw error;
    }
  }

  /**
   * تحويل سعر بين أي عملتين
   */
  async convertPrice(amount: number, fromCurrency: Currency, toCurrency: Currency): Promise<PriceInfo> {
    if (fromCurrency === toCurrency) {
      return {
        amount,
        currency: toCurrency,
        originalAmountUSD: fromCurrency === Currency.USD ? amount : await this.convertToUSD(amount, fromCurrency),
        exchangeRate: 1,
        formatted: this.formatPrice(amount, toCurrency)
      };
    }

    // تحويل إلى الدولار أولاً ثم إلى العملة المطلوبة
    const amountUSD = fromCurrency === Currency.USD ? amount : await this.convertToUSD(amount, fromCurrency);
    return this.convertFromUSD(amountUSD, toCurrency);
  }

  /**
   * تحويل عدة أسعار دفعة واحدة
   */
  async convertMultiplePrices(
    prices: Array<{ amount: number; currency: Currency }>,
    targetCurrency: Currency
  ): Promise<PriceInfo[]> {
    const results: PriceInfo[] = [];

    for (const price of prices) {
      try {
        const converted = await this.convertPrice(price.amount, price.currency, targetCurrency);
        results.push(converted);
      } catch (error) {
        this.logger.error(`Error converting price ${price.amount} ${price.currency}:`, error);
        // إضافة السعر الأصلي في حالة فشل التحويل
        results.push({
          amount: price.amount,
          currency: price.currency,
          originalAmountUSD: price.currency === Currency.USD ? price.amount : 0,
          exchangeRate: 1,
          formatted: this.formatPrice(price.amount, price.currency)
        });
      }
    }

    return results;
  }

  /**
   * تنسيق السعر حسب العملة
   */
  private formatPrice(amount: number, currency: Currency): string {
    const roundedAmount = Math.round(amount * 100) / 100;
    
    switch (currency) {
      case Currency.USD:
        return `$${roundedAmount.toFixed(2)}`;
      case Currency.YER:
        return `${roundedAmount.toFixed(0)} ريال يمني`;
      case Currency.SAR:
        return `${roundedAmount.toFixed(2)} ريال سعودي`;
      default:
        return `${roundedAmount.toFixed(2)} ${currency}`;
    }
  }

  /**
   * الحصول على معلومات العملة
   */
  getCurrencyInfo(currency: Currency): { symbol: string; name: string; decimalPlaces: number } {
    switch (currency) {
      case Currency.USD:
        return { symbol: '$', name: 'دولار أمريكي', decimalPlaces: 2 };
      case Currency.YER:
        return { symbol: 'ر.ي', name: 'ريال يمني', decimalPlaces: 0 };
      case Currency.SAR:
        return { symbol: 'ر.س', name: 'ريال سعودي', decimalPlaces: 2 };
      default:
        return { symbol: currency, name: currency, decimalPlaces: 2 };
    }
  }

  /**
   * التحقق من صحة العملة
   */
  isValidCurrency(currency: string): currency is Currency {
    return Object.values(Currency).includes(currency as Currency);
  }

  /**
   * الحصول على جميع العملات المدعومة
   */
  getSupportedCurrencies(): Currency[] {
    return this.exchangeRatesService.getSupportedCurrencies();
  }
}
