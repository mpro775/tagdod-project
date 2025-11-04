import { Injectable, Logger } from '@nestjs/common';
import { CurrencyNotSupportedException } from '../../shared/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument } from './schemas/exchange-rate.schema';
import { UpdateExchangeRateDto, ConvertCurrencyDto, CurrencyConversionResult } from './dto/exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(
    @InjectModel(ExchangeRate.name) 
    private exchangeRateModel: Model<ExchangeRateDocument>,
  ) {}

  /**
   * الحصول على أسعار الصرف الحالية
   */
  async getCurrentRates(): Promise<ExchangeRateDocument> {
    let rates = await this.exchangeRateModel.findOne().sort({ lastUpdatedAt: -1 });
    
    // إذا لم توجد أسعار، أنشئ أسعار افتراضية
    if (!rates) {
      rates = new this.exchangeRateModel({
        usdToYer: 250, // سعر افتراضي
        usdToSar: 3.75, // سعر افتراضي
        lastUpdatedBy: 'system',
        lastUpdatedAt: new Date(),
        notes: 'أسعار افتراضية'
      });
      await rates.save();
      this.logger.log('تم إنشاء أسعار افتراضية');
    }

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

      return newRates;
    } catch (error) {
      this.logger.error('فشل في تحديث أسعار الصرف:', error);
      throw error;
    }
  }

  /**
   * تحويل العملة
   */
  async convertCurrency(convertDto: ConvertCurrencyDto): Promise<CurrencyConversionResult> {
    try {
      const rates = await this.getCurrentRates();
      
      let rate: number;
      let formatted: string;

      // التحويل من USD
      if (convertDto.fromCurrency === 'USD' && convertDto.toCurrency === 'YER') {
        rate = rates.usdToYer;
        formatted = `${Math.round(convertDto.amount * rate).toLocaleString()} $`;
      } else if (convertDto.fromCurrency === 'USD' && convertDto.toCurrency === 'SAR') {
        rate = rates.usdToSar;
        formatted = `${(convertDto.amount * rate).toFixed(2)} $`;
      } 
      // التحويل العكسي إلى USD
      else if (convertDto.fromCurrency === 'YER' && convertDto.toCurrency === 'USD') {
        rate = 1 / rates.usdToYer;
        formatted = `$${(convertDto.amount * rate).toFixed(2)}`;
      } else if (convertDto.fromCurrency === 'SAR' && convertDto.toCurrency === 'USD') {
        rate = 1 / rates.usdToSar;
        formatted = `$${(convertDto.amount * rate).toFixed(2)}`;
      }
      // التحويل بين YER و SAR (عبر USD)
      else if (convertDto.fromCurrency === 'YER' && convertDto.toCurrency === 'SAR') {
        // أولاً تحويل YER إلى USD ثم USD إلى SAR
        rate = rates.usdToSar / rates.usdToYer;
        formatted = `${(convertDto.amount * rate).toFixed(2)} $`;
      } else if (convertDto.fromCurrency === 'SAR' && convertDto.toCurrency === 'YER') {
        // أولاً تحويل SAR إلى USD ثم USD إلى YER
        rate = rates.usdToYer / rates.usdToSar;
        formatted = `${Math.round(convertDto.amount * rate).toLocaleString()} $`;
      }
      // نفس العملة
      else if (convertDto.fromCurrency === convertDto.toCurrency) {
        rate = 1;
        const symbol = convertDto.fromCurrency === 'USD' ? '$' : '$';
        const decimals = convertDto.fromCurrency === 'USD' ? 2 : (convertDto.fromCurrency === 'SAR' ? 2 : 0);
        formatted = `${symbol}${(convertDto.amount * rate).toFixed(decimals)}`;
      } else {
        throw new CurrencyNotSupportedException({ from: convertDto.fromCurrency, to: convertDto.toCurrency });
      }

      const result = convertDto.amount * rate;

      this.logger.log(
        `تحويل العملة: ${convertDto.amount} ${convertDto.fromCurrency} = ${result} ${convertDto.toCurrency}`
      );

      return {
        fromCurrency: convertDto.fromCurrency,
        toCurrency: convertDto.toCurrency,
        amount: convertDto.amount,
        rate,
        result: Math.round(result * 100) / 100,
        formatted,
      };
    } catch (error) {
      this.logger.error('فشل في تحويل العملة:', error);
      throw error;
    }
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
    const usdTotal = usdSubtotal + usdShipping + usdTax - usdDiscount;

    // تحويل إلى YER
    const yerSubtotal = await this.convertFromUSDToYER(usdSubtotal);
    const yerShipping = usdShipping > 0 ? await this.convertFromUSDToYER(usdShipping) : { result: 0 } as CurrencyConversionResult;
    const yerTax = usdTax > 0 ? await this.convertFromUSDToYER(usdTax) : { result: 0 } as CurrencyConversionResult;
    const yerDiscount = usdDiscount > 0 ? await this.convertFromUSDToYER(usdDiscount) : { result: 0 } as CurrencyConversionResult;
    const yerTotal = await this.convertFromUSDToYER(usdTotal);

    // تحويل إلى SAR
    const sarSubtotal = await this.convertFromUSDToSAR(usdSubtotal);
    const sarShipping = usdShipping > 0 ? await this.convertFromUSDToSAR(usdShipping) : { result: 0 } as CurrencyConversionResult;
    const sarTax = usdTax > 0 ? await this.convertFromUSDToSAR(usdTax) : { result: 0 } as CurrencyConversionResult;
    const sarDiscount = usdDiscount > 0 ? await this.convertFromUSDToSAR(usdDiscount) : { result: 0 } as CurrencyConversionResult;
    const sarTotal = await this.convertFromUSDToSAR(usdTotal);

    return {
      USD: {
        subtotal: Math.round(usdSubtotal * 100) / 100,
        shippingCost: Math.round(usdShipping * 100) / 100,
        tax: Math.round(usdTax * 100) / 100,
        totalDiscount: Math.round(usdDiscount * 100) / 100,
        total: Math.round(usdTotal * 100) / 100,
      },
      YER: {
        subtotal: Math.round(yerSubtotal.result),
        shippingCost: Math.round(yerShipping.result),
        tax: Math.round(yerTax.result),
        totalDiscount: Math.round(yerDiscount.result),
        total: Math.round(yerTotal.result),
      },
      SAR: {
        subtotal: Math.round(sarSubtotal.result * 100) / 100,
        shippingCost: Math.round(sarShipping.result * 100) / 100,
        tax: Math.round(sarTax.result * 100) / 100,
        totalDiscount: Math.round(sarDiscount.result * 100) / 100,
        total: Math.round(sarTotal.result * 100) / 100,
      },
    };
  }
}