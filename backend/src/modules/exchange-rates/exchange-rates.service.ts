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

      if (convertDto.fromCurrency === 'USD' && convertDto.toCurrency === 'YER') {
        rate = rates.usdToYer;
        formatted = `${Math.round(convertDto.amount * rate).toLocaleString()} $`;
      } else if (convertDto.fromCurrency === 'USD' && convertDto.toCurrency === 'SAR') {
        rate = rates.usdToSar;
        formatted = `${(convertDto.amount * rate).toFixed(2)} $`;
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
}