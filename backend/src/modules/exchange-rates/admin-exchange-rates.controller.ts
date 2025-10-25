import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { ExchangeRatesService } from './exchange-rates.service';
import { AdminPermission } from '../../shared/constants/permissions';
import { UpdateExchangeRateDto, ConvertCurrencyDto } from './dto/exchange-rate.dto';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

interface AuthenticatedRequest extends ExpressRequest {
  user: RequestUser;
}

interface RequestUser {
  id: string;
  sub: string;
  userId: string;
  phone: string;
  isAdmin: boolean;
  role?: string;
}
@ApiTags('إدارة-أسعار-الصرف')
@ApiBearerAuth()
@Controller('admin/exchange-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @RequirePermissions(AdminPermission.EXCHANGE_RATES_READ, AdminPermission.ADMIN_ACCESS)
  @Get()
  @ApiOperation({
    summary: 'الحصول على أسعار الصرف الحالية (إداري)',
    description: 'استرداد أسعار صرف العملات الحالية مع تفاصيل إضافية للإداريين'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد أسعار الصرف بنجاح',
    schema: {
      type: 'object',
      properties: {
        usdToYer: { type: 'number', example: 250.50, description: 'سعر الدولار مقابل الريال اليمني' },
        usdToSar: { type: 'number', example: 3.75, description: 'سعر الدولار مقابل الريال السعودي' },
        lastUpdatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z', description: 'تاريخ آخر تحديث' },
        lastUpdatedBy: { type: 'string', example: 'user123', description: 'معرف المستخدم الذي قام بآخر تحديث' }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذه البيانات'
  })
  async getCurrentRates() {
    return this.exchangeRatesService.getCurrentRates();
  }

  @Post('update')
  @ApiOperation({
    summary: 'تحديث أسعار الصرف',
    description: 'تحديث أسعار صرف العملات الجديدة في النظام'
  })
  @ApiBody({ type: UpdateExchangeRateDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث أسعار الصرف بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم تحديث أسعار الصرف بنجاح' },
        data: {
          type: 'object',
          properties: {
            usdToYer: { type: 'number', example: 251.00, description: 'السعر الجديد للدولار مقابل الريال اليمني' },
            usdToSar: { type: 'number', example: 3.76, description: 'السعر الجديد للدولار مقابل الريال السعودي' },
            lastUpdatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' },
            lastUpdatedBy: { type: 'string', example: 'admin123' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة أو أسعار غير صالحة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بتحديث أسعار الصرف'
  })
  async updateRates(
    @Body() updateDto: UpdateExchangeRateDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.exchangeRatesService.updateRates(updateDto, req.user.id);
  }

  @Post('convert')
  @ApiOperation({
    summary: 'تحويل العملة (إداري)',
    description: 'تحويل مبلغ من عملة إلى أخرى للاختبار والتحقق من أسعار الصرف'
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
    summary: 'الحصول على سعر الدولار مقابل الريال اليمني (إداري)',
    description: 'استرداد سعر صرف الدولار الأمريكي مقابل الريال اليمني الحالي مع تفاصيل إضافية'
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
    summary: 'الحصول على سعر الدولار مقابل الريال السعودي (إداري)',
    description: 'استرداد سعر صرف الدولار الأمريكي مقابل الريال السعودي الحالي مع تفاصيل إضافية'
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
