import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument, Currency } from './schemas/exchange-rate.schema';
import { CreateExchangeRateDto, UpdateExchangeRateDto, ConvertCurrencyDto } from './dto/exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(
    @InjectModel(ExchangeRate.name)
    private exchangeRateModel: Model<ExchangeRateDocument>,
  ) {}

  /**
   * إنشاء سعر صرف جديد
   */
  async create(createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    try {
      const exchangeRate = new this.exchangeRateModel(createExchangeRateDto);
      const saved = await exchangeRate.save();
      
      this.logger.log(`Created exchange rate: ${saved.fromCurrency} -> ${saved.toCurrency} = ${saved.rate}`);
      return saved;
    } catch (error) {
      this.logger.error('Error creating exchange rate:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع أسعار الصرف
   */
  async findAll(): Promise<ExchangeRate[]> {
    return this.exchangeRateModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * الحصول على سعر صرف محدد
   */
  async findOne(id: string): Promise<ExchangeRate> {
    const exchangeRate = await this.exchangeRateModel.findById(id).exec();
    if (!exchangeRate) {
      throw new NotFoundException('Exchange rate not found');
    }
    return exchangeRate;
  }

  /**
   * الحصول على سعر الصرف الحالي بين عملتين
   */
  async getCurrentRate(fromCurrency: Currency, toCurrency: Currency): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const now = new Date();
    const exchangeRate = await this.exchangeRateModel
      .findOne({
        fromCurrency,
        toCurrency,
        isActive: true,
        $or: [
          { effectiveDate: { $lte: now } },
          { effectiveDate: { $exists: false } }
        ],
        $or: [
          { expiryDate: { $gte: now } },
          { expiryDate: { $exists: false } }
        ]
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!exchangeRate) {
      throw new NotFoundException(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    return exchangeRate.rate;
  }

  /**
   * تحويل مبلغ من عملة إلى أخرى
   */
  async convertCurrency(convertDto: ConvertCurrencyDto): Promise<{
    originalAmount: number;
    convertedAmount: number;
    fromCurrency: Currency;
    toCurrency: Currency;
    rate: number;
  }> {
    const { amount, fromCurrency, toCurrency } = convertDto;

    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        fromCurrency,
        toCurrency,
        rate: 1
      };
    }

    const rate = await this.getCurrentRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;

    this.logger.log(`Converted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency} (rate: ${rate})`);

    return {
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // تقريب إلى رقمين عشريين
      fromCurrency,
      toCurrency,
      rate
    };
  }

  /**
   * تحديث سعر صرف
   */
  async update(id: string, updateDto: UpdateExchangeRateDto): Promise<ExchangeRate> {
    try {
      const updated = await this.exchangeRateModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .exec();

      if (!updated) {
        throw new NotFoundException('Exchange rate not found');
      }

      this.logger.log(`Updated exchange rate ${id}`);
      return updated;
    } catch (error) {
      this.logger.error('Error updating exchange rate:', error);
      throw error;
    }
  }

  /**
   * حذف سعر صرف (soft delete)
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.exchangeRateModel
        .findByIdAndUpdate(id, { isActive: false })
        .exec();

      if (!result) {
        throw new NotFoundException('Exchange rate not found');
      }

      this.logger.log(`Deactivated exchange rate ${id}`);
    } catch (error) {
      this.logger.error('Error removing exchange rate:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع العملات المدعومة
   */
  getSupportedCurrencies(): Currency[] {
    return Object.values(Currency);
  }

  /**
   * تحديث أسعار الصرف من مصدر خارجي (يمكن ربطه بـ API خارجي)
   */
  async updateRatesFromExternalSource(): Promise<void> {
    // TODO: ربط هذا بـ API خارجي مثل Fixer.io أو CurrencyLayer
    this.logger.log('Updating exchange rates from external source...');
    
    // مثال على التحديث التلقائي
    // يمكن إضافة cron job لهذا الغرض
  }
}
