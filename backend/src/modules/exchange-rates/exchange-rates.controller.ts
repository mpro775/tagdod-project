import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto, UpdateExchangeRateDto, ConvertCurrencyDto } from './dto/exchange-rate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  /**
   * إنشاء سعر صرف جديد (للمدير فقط)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() createExchangeRateDto: CreateExchangeRateDto) {
    return this.exchangeRatesService.create(createExchangeRateDto);
  }

  /**
   * الحصول على جميع أسعار الصرف
   */
  @Get()
  async findAll() {
    return this.exchangeRatesService.findAll();
  }

  /**
   * الحصول على سعر صرف محدد
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.exchangeRatesService.findOne(id);
  }

  /**
   * تحويل عملة (متاح للجميع)
   */
  @Post('convert')
  @HttpCode(HttpStatus.OK)
  async convertCurrency(@Body() convertDto: ConvertCurrencyDto) {
    return this.exchangeRatesService.convertCurrency(convertDto);
  }

  /**
   * الحصول على العملات المدعومة
   */
  @Get('currencies/supported')
  getSupportedCurrencies() {
    return {
      currencies: this.exchangeRatesService.getSupportedCurrencies()
    };
  }

  /**
   * تحديث سعر صرف (للمدير فقط)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(
    @Param('id') id: string, 
    @Body() updateExchangeRateDto: UpdateExchangeRateDto
  ) {
    return this.exchangeRatesService.update(id, updateExchangeRateDto);
  }

  /**
   * حذف سعر صرف (للمدير فقط)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.exchangeRatesService.remove(id);
    return { message: 'Exchange rate deleted successfully' };
  }
}
