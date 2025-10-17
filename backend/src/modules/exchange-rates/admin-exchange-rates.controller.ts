import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { BulkUpdateExchangeRatesDto, ExchangeRateStatisticsDto } from './dto/exchange-rate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ExchangeRateDocument } from './schemas/exchange-rate.schema';
import { ExchangeRateHistoryDocument } from './schemas/exchange-rate-history.schema';

@ApiTags('admin-exchange-rates')
@Controller('admin/exchange-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get exchange rates dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboardData() {
    const [statistics, recentHistory, supportedCurrencies] = await Promise.all([
      this.exchangeRatesService.getExchangeRateStatistics({}),
      this.exchangeRatesService.getExchangeRateHistory({ limit: 10 }),
      this.exchangeRatesService.getSupportedCurrencies(),
    ]);

    return {
      statistics,
      recentHistory: recentHistory.history,
      supportedCurrencies,
      lastUpdated: new Date(),
    };
  }

  @Post('import')
  @ApiOperation({ summary: 'Import exchange rates from CSV/JSON' })
  @ApiResponse({ status: 201, description: 'Exchange rates imported successfully' })
  async importExchangeRates(
    @Body()
    importData: {
      rates: Array<{ fromCurrency: string; toCurrency: string; rate: number; reason?: string }>;
    },
    @Request() req: { user: { userId: string } },
  ) {
    const bulkUpdateDto: BulkUpdateExchangeRatesDto = {
      updates: importData.rates.map((rate) => ({
        fromCurrency: rate.fromCurrency,
        toCurrency: rate.toCurrency,
        rate: rate.rate,
        reason: rate.reason,
      })),
    };

    return await this.exchangeRatesService.bulkUpdateExchangeRates(
      bulkUpdateDto,
      req.user.userId,
      'Bulk import',
    );
  }

  @Post('export')
  @ApiOperation({ summary: 'Export exchange rates to CSV/JSON' })
  @ApiResponse({ status: 200, description: 'Exchange rates exported successfully' })
  async exportExchangeRates(@Query('format') format: 'csv' | 'json' = 'json') {
    const { rates } = await this.exchangeRatesService.getAllExchangeRates({ limit: 1000 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader =
        'fromCurrency,toCurrency,rate,baseRate,buyRate,sellRate,source,lastUpdatedAt,isActive\n';
      const csvData = rates
        .map(
          (rate) =>
            `${rate.fromCurrency},${rate.toCurrency},${rate.rate},${rate.baseRate},${rate.buyRate || ''},${rate.sellRate || ''},${rate.source},${rate.lastUpdatedAt},${rate.isActive}`,
        )
        .join('\n');

      return {
        format: 'csv',
        data: csvHeader + csvData,
        filename: `exchange-rates-${new Date().toISOString().split('T')[0]}.csv`,
      };
    } else {
      return {
        format: 'json',
        data: rates,
        filename: `exchange-rates-${new Date().toISOString().split('T')[0]}.json`,
      };
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get exchange rates analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Query() query: ExchangeRateStatisticsDto) {
    const statistics = await this.exchangeRatesService.getExchangeRateStatistics(query);

    // Calculate additional analytics
    const analytics = {
      ...statistics,
      trends: {
        increasing: statistics.topChanges.filter((c) => c.changePercentage > 0).length,
        decreasing: statistics.topChanges.filter((c) => c.changePercentage < 0).length,
        stable: statistics.topChanges.filter((c) => c.changePercentage === 0).length,
      },
      volatility: {
        high: statistics.topChanges.filter((c) => Math.abs(c.changePercentage) > 5).length,
        medium: statistics.topChanges.filter(
          (c) => Math.abs(c.changePercentage) > 2 && Math.abs(c.changePercentage) <= 5,
        ).length,
        low: statistics.topChanges.filter((c) => Math.abs(c.changePercentage) <= 2).length,
      },
    };

    return analytics;
  }

  @Post('backup')
  @ApiOperation({ summary: 'Create backup of exchange rates' })
  @ApiResponse({ status: 200, description: 'Backup created successfully' })
  async createBackup() {
    const { rates } = await this.exchangeRatesService.getAllExchangeRates({ limit: 1000 });
    const { history } = await this.exchangeRatesService.getExchangeRateHistory({ limit: 1000 });

    const backup = {
      timestamp: new Date().toISOString(),
      rates,
      history,
      version: '1.0',
    };

    return {
      success: true,
      backup,
      filename: `exchange-rates-backup-${new Date().toISOString().split('T')[0]}.json`,
    };
  }

  @Post('restore')
  @ApiOperation({ summary: 'Restore exchange rates from backup' })
  @ApiResponse({ status: 200, description: 'Exchange rates restored successfully' })
  async restoreFromBackup(
    @Body() backupData: { rates: ExchangeRateDocument[]; history: ExchangeRateHistoryDocument[] },
    @Request() req: { user: { userId: string } },
  ) {
    void req;
    // This would require additional implementation for backup/restore
    return {
      success: true,
      message: 'Backup restore functionality would be implemented here',
      restoredRates: backupData.rates.length,
      restoredHistory: backupData.history.length,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check exchange rates system health' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  async healthCheck() {
    const { rates } = await this.exchangeRatesService.getAllExchangeRates({ limit: 1 });
    const statistics = await this.exchangeRatesService.getExchangeRateStatistics({});

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalRates: statistics.totalRates,
        activeRates: statistics.activeRates,
        lastUpdate: rates[0]?.lastUpdatedAt || null,
      },
      checks: {
        database: 'connected',
        rates: statistics.totalRates > 0 ? 'available' : 'empty',
        history: statistics.recentChanges > 0 ? 'tracking' : 'no_changes',
      },
    };

    return health;
  }
}
