import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
@Controller('admin/exchange-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  /**
   * الحصول على أسعار الصرف الحالية
   */
  @RequirePermissions(AdminPermission.EXCHANGE_RATES_READ, AdminPermission.ADMIN_ACCESS)
  @Get()
  async getCurrentRates() {
    return this.exchangeRatesService.getCurrentRates();
  }

  /**
   * تحديث أسعار الصرف
   */
  @Post('update')
  async updateRates(
    @Body() updateDto: UpdateExchangeRateDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.exchangeRatesService.updateRates(updateDto, req.user.id);
  }

  /**
   * تحويل العملة (للتجربة)
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
