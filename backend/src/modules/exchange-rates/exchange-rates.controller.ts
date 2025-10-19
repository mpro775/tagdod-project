import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { ConvertCurrencyDto } from './dto/exchange-rate.dto';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  /**
   * الحصول على أسعار الصرف الحالية (للعملاء)
   */
  @Get()
  async getCurrentRates() {
    const rates = await this.exchangeRatesService.getCurrentRates();
    return {
      usdToYer: rates.usdToYer,
      usdToSar: rates.usdToSar,
      lastUpdated: rates.lastUpdatedAt,
    };
  }

  /**
   * تحويل العملة
   */
  @Post('convert')
  async convertCurrency(@Body() convertDto: ConvertCurrencyDto) {
    return this.exchangeRatesService.convertCurrency(convertDto);
  }

  /**
   * الحصول على السعر الحالي للدولار مقابل الريال اليمني
   */
  @Get('usd-to-yer')
  async getUSDToYERRate() {
    const rate = await this.exchangeRatesService.getUSDToYERRate();
    return { rate, currency: 'YER', formatted: `1 USD = ${rate} ر.ي` };
  }

  /**
   * الحصول على السعر الحالي للدولار مقابل الريال السعودي
   */
  @Get('usd-to-sar')
  async getUSDToSARRate() {
    const rate = await this.exchangeRatesService.getUSDToSARRate();
    return { rate, currency: 'SAR', formatted: `1 USD = ${rate} ر.س` };
  }
}
