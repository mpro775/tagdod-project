import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import {
  CreateExchangeRateDto,
  UpdateExchangeRateDto,
  ConvertCurrencyDto,
  ExchangeRateQueryDto,
  ExchangeRateHistoryQueryDto,
  BulkUpdateExchangeRatesDto,
  ExchangeRateStatisticsDto,
} from './dto/exchange-rate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('exchange-rates')
@Controller('exchange-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new exchange rate' })
  @ApiResponse({ status: 201, description: 'Exchange rate created successfully' })
  async createExchangeRate(
    @Body() createDto: CreateExchangeRateDto,
    @Request() req: { user: { userId: string } },
  ) {
    return await this.exchangeRatesService.createExchangeRate(createDto, req.user.userId);
  }

  @Put(':fromCurrency/:toCurrency')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update exchange rate' })
  @ApiResponse({ status: 200, description: 'Exchange rate updated successfully' })
  async updateExchangeRate(
    @Param('fromCurrency') fromCurrency: string,
    @Param('toCurrency') toCurrency: string,
    @Body() updateDto: UpdateExchangeRateDto,
    @Request() req: { user: { userId: string } },
    @Query('reason') reason?: string,
  ) {
    return await this.exchangeRatesService.updateExchangeRate(
      fromCurrency,
      toCurrency,
      updateDto,
      req.user.userId,
      reason,
    );
  }

  @Get(':fromCurrency/:toCurrency')
  @ApiOperation({ summary: 'Get exchange rate' })
  @ApiResponse({ status: 200, description: 'Exchange rate retrieved successfully' })
  async getExchangeRate(
    @Param('fromCurrency') fromCurrency: string,
    @Param('toCurrency') toCurrency: string,
  ) {
    return await this.exchangeRatesService.getExchangeRate(fromCurrency, toCurrency);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exchange rates' })
  @ApiResponse({ status: 200, description: 'Exchange rates retrieved successfully' })
  async getAllExchangeRates(@Query() query: ExchangeRateQueryDto) {
    return await this.exchangeRatesService.getAllExchangeRates(query);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert currency' })
  @ApiResponse({ status: 200, description: 'Currency converted successfully' })
  async convertCurrency(@Body() convertDto: ConvertCurrencyDto) {
    return await this.exchangeRatesService.convertCurrency(convertDto);
  }

  @Post('bulk-update')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bulk update exchange rates' })
  @ApiResponse({ status: 200, description: 'Exchange rates updated successfully' })
  async bulkUpdateExchangeRates(
    @Body() bulkUpdateDto: BulkUpdateExchangeRatesDto,
    @Request() req: { user: { userId: string } },
    @Query('reason') reason?: string,
  ) {
    return await this.exchangeRatesService.bulkUpdateExchangeRates(
      bulkUpdateDto,
      req.user.userId,
      reason,
    );
  }

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get exchange rate history' })
  @ApiResponse({ status: 200, description: 'Exchange rate history retrieved successfully' })
  async getExchangeRateHistory(@Query() query: ExchangeRateHistoryQueryDto) {
    return await this.exchangeRatesService.getExchangeRateHistory(query);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get exchange rate statistics' })
  @ApiResponse({ status: 200, description: 'Exchange rate statistics retrieved successfully' })
  async getExchangeRateStatistics(@Query() query: ExchangeRateStatisticsDto) {
    return await this.exchangeRatesService.getExchangeRateStatistics(query);
  }

  @Delete(':fromCurrency/:toCurrency')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate exchange rate' })
  @ApiResponse({ status: 200, description: 'Exchange rate deactivated successfully' })
  async deactivateExchangeRate(
    @Param('fromCurrency') fromCurrency: string,
    @Param('toCurrency') toCurrency: string,
    @Request() req: { user: { userId: string } },
  ) {
    return await this.exchangeRatesService.deactivateExchangeRate(
      fromCurrency,
      toCurrency,
      req.user.userId,
    );
  }

  @Get('currencies/supported')
  @ApiOperation({ summary: 'Get supported currencies' })
  @ApiResponse({ status: 200, description: 'Supported currencies retrieved successfully' })
  async getSupportedCurrencies() {
    return await this.exchangeRatesService.getSupportedCurrencies();
  }
}
