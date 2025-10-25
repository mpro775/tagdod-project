import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { ConvertCurrencyDto } from './dto/exchange-rate.dto';

@ApiTags('أسعار-الصرف')
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  @ApiOperation({
    summary: 'الحصول على أسعار الصرف الحالية',
    description: 'استرداد أسعار صرف العملات الحالية (دولار أمريكي إلى ريال يمني وريال سعودي)'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد أسعار الصرف بنجاح',
    schema: {
      type: 'object',
      properties: {
        usdToYer: { type: 'number', example: 250.50, description: 'سعر الدولار مقابل الريال اليمني' },
        usdToSar: { type: 'number', example: 3.75, description: 'سعر الدولار مقابل الريال السعودي' },
        lastUpdated: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z', description: 'تاريخ آخر تحديث' }
      }
    }
  })
  async getCurrentRates() {
    const rates = await this.exchangeRatesService.getCurrentRates();
    return {
      usdToYer: rates.usdToYer,
      usdToSar: rates.usdToSar,
      lastUpdated: rates.lastUpdatedAt,
    };
  }

  @Post('convert')
  @ApiOperation({
    summary: 'تحويل العملة',
    description: 'تحويل مبلغ من عملة إلى أخرى باستخدام أسعار الصرف الحالية'
  })
  @ApiBody({ type: ConvertCurrencyDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحويل العملة بنجاح',
    schema: {
      type: 'object',
      properties: {
        fromCurrency: { type: 'string', example: 'USD', description: 'العملة المصدر' },
        toCurrency: { type: 'string', example: 'YER', description: 'العملة الهدف' },
        amount: { type: 'number', example: 100, description: 'المبلغ الأصلي' },
        convertedAmount: { type: 'number', example: 25050, description: 'المبلغ المحول' },
        rate: { type: 'number', example: 250.50, description: 'سعر الصرف المستخدم' },
        timestamp: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z', description: 'تاريخ التحويل' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة أو عملة غير مدعومة'
  })
  async convertCurrency(@Body() convertDto: ConvertCurrencyDto) {
    return this.exchangeRatesService.convertCurrency(convertDto);
  }

  @Get('usd-to-yer')
  @ApiOperation({
    summary: 'الحصول على سعر الدولار مقابل الريال اليمني',
    description: 'استرداد سعر صرف الدولار الأمريكي مقابل الريال اليمني الحالي'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد سعر الصرف بنجاح',
    schema: {
      type: 'object',
      properties: {
        rate: { type: 'number', example: 250.50, description: 'سعر الصرف الحالي' },
        currency: { type: 'string', example: 'YER', description: 'رمز العملة' },
        formatted: { type: 'string', example: '1 USD = 250.50 ر.ي', description: 'السعر منسق للعرض' }
      }
    }
  })
  async getUSDToYERRate() {
    const rate = await this.exchangeRatesService.getUSDToYERRate();
    return { rate, currency: 'YER', formatted: `1 USD = ${rate} ر.ي` };
  }

  @Get('usd-to-sar')
  @ApiOperation({
    summary: 'الحصول على سعر الدولار مقابل الريال السعودي',
    description: 'استرداد سعر صرف الدولار الأمريكي مقابل الريال السعودي الحالي'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد سعر الصرف بنجاح',
    schema: {
      type: 'object',
      properties: {
        rate: { type: 'number', example: 3.75, description: 'سعر الصرف الحالي' },
        currency: { type: 'string', example: 'SAR', description: 'رمز العملة' },
        formatted: { type: 'string', example: '1 USD = 3.75 ر.س', description: 'السعر منسق للعرض' }
      }
    }
  })
  async getUSDToSARRate() {
    const rate = await this.exchangeRatesService.getUSDToSARRate();
    return { rate, currency: 'SAR', formatted: `1 USD = ${rate} ر.س` };
  }
}
