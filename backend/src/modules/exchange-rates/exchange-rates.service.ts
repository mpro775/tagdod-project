import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CurrencyNotSupportedException } from '../../shared/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument } from './schemas/exchange-rate.schema';
import { UpdateExchangeRateDto, ConvertCurrencyDto, CurrencyConversionResult } from './dto/exchange-rate.dto';
import { ExchangeRateSyncService } from './exchange-rate-sync.service';
import { ExchangeRateSyncJobReason } from './schemas/exchange-rate-sync-job.schema';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private readonly ratesCacheTtlMs = 60_000;
  private readonly conversionCacheTtlMs = 30_000;
  private currentRatesCache?: { data: ExchangeRate; expiresAt: number };
  private readonly conversionCache = new Map<
    string,
    { data: CurrencyConversionResult; expiresAt: number }
  >();

  constructor(
    @InjectModel(ExchangeRate.name) 
    private exchangeRateModel: Model<ExchangeRateDocument>,
    @Inject(forwardRef(() => ExchangeRateSyncService))
    private readonly exchangeRateSyncService: ExchangeRateSyncService,
  ) {}

  /**
   * الحصول على أسعار الصرف الحالية
   */
  async getCurrentRates(): Promise<ExchangeRate> {
    const now = Date.now();
    if (this.currentRatesCache && this.currentRatesCache.expiresAt > now) {
      return this.currentRatesCache.data;
    }

    let rates = await this.exchangeRateModel
      .findOne()
      .sort({ lastUpdatedAt: -1 })
      .lean<ExchangeRate>();

    // إذا لم توجد أسعار، أنشئ أسعار افتراضية
    if (!rates) {
      const newRates = new this.exchangeRateModel({
        usdToYer: 250, // سعر افتراضي
        usdToSar: 3.75, // سعر افتراضي
        lastUpdatedBy: 'system',
        lastUpdatedAt: new Date(),
        notes: 'أسعار افتراضية'
      });
      await newRates.save();
      rates = newRates.toObject();
      this.logger.log('تم إنشاء أسعار افتراضية');
    }

    this.currentRatesCache = {
      data: rates,
      expiresAt: now + this.ratesCacheTtlMs,
    };

    return rates;
  }

  /**
   * تحديث أسعار الصرف
   */
  async updateRates(
    updateDto: UpdateExchangeRateDto,
    updatedBy: string,
  ): Promise<ExchangeRateDocument> {
    try {
      // احذف الأسعار القديمة
      await this.exchangeRateModel.deleteMany({});
      
      // أنشئ سعر جديد
      const newRates = new this.exchangeRateModel({
        ...updateDto,
        lastUpdatedBy: updatedBy,
        lastUpdatedAt: new Date(),
      });

      await newRates.save();
      
      this.logger.log(
        `تم تحديث أسعار الصرف: USD->YER: ${updateDto.usdToYer}, USD->SAR: ${updateDto.usdToSar}`
      );

      this.currentRatesCache = {
        data: newRates.toObject(),
        expiresAt: Date.now() + this.ratesCacheTtlMs,
      };
      this.conversionCache.clear();

      this.scheduleSyncJob(updatedBy);

      return newRates;
    } catch (error) {
      this.logger.error('فشل في تحديث أسعار الصرف:', error);
      throw error;
    }
  }

  private scheduleSyncJob(updatedBy: string): void {
    this.exchangeRateSyncService
      .triggerSync(updatedBy, ExchangeRateSyncJobReason.RATE_UPDATE)
      .catch((error) => {
        this.logger.error(
          `Failed to trigger exchange rate pricing sync after rates update`,
          error instanceof Error ? error.stack : String(error),
        );
      });
  }

  /**
   * تحويل العملة
   */
  async convertCurrency(convertDto: ConvertCurrencyDto): Promise<CurrencyConversionResult> {
    try {
      const rates = await this.getCurrentRates();

      const cacheKey = this.buildConversionCacheKey(convertDto, rates);
      const now = Date.now();
      const cached = this.conversionCache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }

      const conversion = this.performConversion(convertDto, rates);

      this.logger.log(
        `تحويل العملة: ${convertDto.amount} ${convertDto.fromCurrency} = ${conversion.result} ${convertDto.toCurrency}`
      );

      this.conversionCache.set(cacheKey, {
        data: conversion,
        expiresAt: now + this.conversionCacheTtlMs,
      });

      return conversion;
    } catch (error) {
      this.logger.error('فشل في تحويل العملة:', error);
      throw error;
    }
  }

  private performConversion(
    convertDto: ConvertCurrencyDto,
    rates: ExchangeRate,
  ): CurrencyConversionResult {
    let rate: number;
    let formatted: string;

    if (convertDto.fromCurrency === 'USD' && convertDto.toCurrency === 'YER') {
      rate = rates.usdToYer;
      formatted = `${Math.round(convertDto.amount * rate).toLocaleString()} $`;
    } else if (convertDto.fromCurrency === 'USD' && convertDto.toCurrency === 'SAR') {
      rate = rates.usdToSar;
      formatted = `${(convertDto.amount * rate).toFixed(2)} $`;
    } else if (convertDto.fromCurrency === 'YER' && convertDto.toCurrency === 'USD') {
      rate = 1 / rates.usdToYer;
      formatted = `$${(convertDto.amount * rate).toFixed(2)}`;
    } else if (convertDto.fromCurrency === 'SAR' && convertDto.toCurrency === 'USD') {
      rate = 1 / rates.usdToSar;
      formatted = `$${(convertDto.amount * rate).toFixed(2)}`;
    } else if (convertDto.fromCurrency === 'YER' && convertDto.toCurrency === 'SAR') {
      rate = rates.usdToSar / rates.usdToYer;
      formatted = `${(convertDto.amount * rate).toFixed(2)} $`;
    } else if (convertDto.fromCurrency === 'SAR' && convertDto.toCurrency === 'YER') {
      rate = rates.usdToYer / rates.usdToSar;
      formatted = `${Math.round(convertDto.amount * rate).toLocaleString()} $`;
    } else if (convertDto.fromCurrency === convertDto.toCurrency) {
      rate = 1;
      const symbol = convertDto.fromCurrency === 'USD' ? '$' : '$';
      const decimals =
        convertDto.fromCurrency === 'USD'
          ? 2
          : convertDto.fromCurrency === 'SAR'
          ? 2
          : 0;
      formatted = `${symbol}${(convertDto.amount * rate).toFixed(decimals)}`;
    } else {
      throw new CurrencyNotSupportedException({
        from: convertDto.fromCurrency,
        to: convertDto.toCurrency,
      });
    }

    const result = convertDto.amount * rate;

    return {
      fromCurrency: convertDto.fromCurrency,
      toCurrency: convertDto.toCurrency,
      amount: convertDto.amount,
      rate,
      result: Math.round(result * 100) / 100,
      formatted,
    };
  }

  calculateConversionWithRates(
    convertDto: ConvertCurrencyDto,
    rates: ExchangeRate,
  ): CurrencyConversionResult {
    return this.performConversion(convertDto, rates);
  }

  private buildConversionCacheKey(
    convertDto: ConvertCurrencyDto,
    rates: ExchangeRate,
  ): string {
    const amountKey = Number.isInteger(convertDto.amount)
      ? convertDto.amount.toString()
      : convertDto.amount.toFixed(6);
    const lastUpdated =
      rates.lastUpdatedAt instanceof Date
        ? rates.lastUpdatedAt.getTime()
        : rates.lastUpdatedAt
        ? new Date(rates.lastUpdatedAt).getTime()
        : 0;
    return [
      convertDto.fromCurrency,
      convertDto.toCurrency,
      amountKey,
      lastUpdated,
      rates.usdToYer,
      rates.usdToSar,
    ].join(':');
  }

  /**
   * تحويل من الدولار إلى الريال اليمني
   */
  async convertFromUSDToYER(amountUSD: number): Promise<CurrencyConversionResult> {
    return this.convertCurrency({
      amount: amountUSD,
      fromCurrency: 'USD',
      toCurrency: 'YER'
    });
  }

  /**
   * تحويل من الدولار إلى الريال السعودي
   */
  async convertFromUSDToSAR(amountUSD: number): Promise<CurrencyConversionResult> {
    return this.convertCurrency({
      amount: amountUSD,
      fromCurrency: 'USD',
      toCurrency: 'SAR'
    });
  }

  /**
   * الحصول على السعر الحالي للدولار مقابل الريال اليمني
   */
  async getUSDToYERRate(): Promise<number> {
    const rates = await this.getCurrentRates();
    return rates.usdToYer;
  }

  /**
   * الحصول على السعر الحالي للدولار مقابل الريال السعودي
   */
  async getUSDToSARRate(): Promise<number> {
    const rates = await this.getCurrentRates();
    return rates.usdToSar;
  }

  /**
   * تحويل مبلغ من أي عملة إلى الدولار
   */
  async convertToUSD(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === 'USD') {
      return amount;
    }
    
    const result = await this.convertCurrency({
      amount,
      fromCurrency,
      toCurrency: 'USD',
    });
    
    return result.result;
  }

  /**
   * حساب الإجماليات بالعملات الثلاث (USD, YER, SAR)
   */
  async calculateTotalsInAllCurrencies(
    usdSubtotal: number,
    usdShipping: number = 0,
    usdTax: number = 0,
    usdDiscount: number = 0,
  ): Promise<{
    USD: { subtotal: number; shippingCost: number; tax: number; totalDiscount: number; total: number };
    YER: { subtotal: number; shippingCost: number; tax: number; totalDiscount: number; total: number };
    SAR: { subtotal: number; shippingCost: number; tax: number; totalDiscount: number; total: number };
  }> {
    const rates = await this.getCurrentRates();
    const usdTotal = usdSubtotal + usdShipping + usdTax - usdDiscount;

    const toYer = (amount: number): number =>
      Math.round((amount || 0) * (rates.usdToYer || 0));
    const toSar = (amount: number): number =>
      Math.round(((amount || 0) * (rates.usdToSar || 0)) * 100) / 100;

    return {
      USD: {
        subtotal: Math.round(usdSubtotal * 100) / 100,
        shippingCost: Math.round(usdShipping * 100) / 100,
        tax: Math.round(usdTax * 100) / 100,
        totalDiscount: Math.round(usdDiscount * 100) / 100,
        total: Math.round(usdTotal * 100) / 100,
      },
      YER: {
        subtotal: toYer(usdSubtotal),
        shippingCost: toYer(usdShipping),
        tax: toYer(usdTax),
        totalDiscount: toYer(usdDiscount),
        total: toYer(usdTotal),
      },
      SAR: {
        subtotal: toSar(usdSubtotal),
        shippingCost: toSar(usdShipping),
        tax: toSar(usdTax),
        totalDiscount: toSar(usdDiscount),
        total: toSar(usdTotal),
      },
    };
  }
}