import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument } from './schemas/exchange-rate.schema';
import {
  ExchangeRateHistory,
  ExchangeRateHistoryDocument,
} from './schemas/exchange-rate-history.schema';
import {
  CreateExchangeRateDto,
  UpdateExchangeRateDto,
  ConvertCurrencyDto,
  ExchangeRateQueryDto,
  ExchangeRateHistoryQueryDto,
  BulkUpdateExchangeRatesDto,
  ExchangeRateStatisticsDto,
} from './dto/exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(
    @InjectModel(ExchangeRate.name) private exchangeRateModel: Model<ExchangeRateDocument>,
    @InjectModel(ExchangeRateHistory.name) private historyModel: Model<ExchangeRateHistoryDocument>,
  ) {}

  /**
   * Create new exchange rate
   */
  async createExchangeRate(
    createDto: CreateExchangeRateDto,
    updatedBy: string,
  ): Promise<ExchangeRateDocument> {
    try {
      // Check if rate already exists
      const existingRate = await this.exchangeRateModel.findOne({
        fromCurrency: createDto.fromCurrency,
        toCurrency: createDto.toCurrency,
        isActive: true,
      });

      if (existingRate) {
        throw new BadRequestException('Exchange rate already exists for this currency pair');
      }

      const exchangeRate = new this.exchangeRateModel({
        ...createDto,
        lastUpdatedBy: updatedBy,
        lastUpdatedAt: new Date(),
        effectiveDate: createDto.effectiveDate ? new Date(createDto.effectiveDate) : new Date(),
      });

      await exchangeRate.save();
      this.logger.log(
        `Exchange rate created: ${createDto.fromCurrency}/${createDto.toCurrency} = ${createDto.rate}`,
      );

      return exchangeRate;
    } catch (error) {
      this.logger.error('Failed to create exchange rate:', error);
      throw error;
    }
  }

  /**
   * Update exchange rate
   */
  async updateExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    updateDto: UpdateExchangeRateDto,
    updatedBy: string,
    reason?: string,
  ): Promise<ExchangeRateDocument> {
    try {
      const exchangeRate = await this.exchangeRateModel.findOne({
        fromCurrency,
        toCurrency,
        isActive: true,
      });

      if (!exchangeRate) {
        throw new NotFoundException('Exchange rate not found');
      }

      const oldRate = exchangeRate.rate;
      const oldBaseRate = exchangeRate.baseRate;

      // Update the rate
      Object.assign(exchangeRate, updateDto);
      exchangeRate.lastUpdatedBy = updatedBy;
      exchangeRate.lastUpdatedAt = new Date();

      await exchangeRate.save();

      // Create history record
      await this.createHistoryRecord(
        fromCurrency,
        toCurrency,
        oldRate,
        exchangeRate.rate,
        oldBaseRate,
        exchangeRate.baseRate,
        updatedBy,
        'manual',
        reason,
      );

      this.logger.log(
        `Exchange rate updated: ${fromCurrency}/${toCurrency} from ${oldRate} to ${exchangeRate.rate}`,
      );

      return exchangeRate;
    } catch (error) {
      this.logger.error('Failed to update exchange rate:', error);
      throw error;
    }
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRateDocument> {
    const exchangeRate = await this.exchangeRateModel.findOne({
      fromCurrency,
      toCurrency,
      isActive: true,
      $or: [{ effectiveDate: { $lte: new Date() } }, { effectiveDate: { $exists: false } }],
    });

    if (!exchangeRate) {
      throw new NotFoundException(`Exchange rate not found for ${fromCurrency}/${toCurrency}`);
    }

    return exchangeRate;
  }

  /**
   * Get all exchange rates
   */
  async getAllExchangeRates(query: ExchangeRateQueryDto): Promise<{
    rates: ExchangeRateDocument[];
    total: number;
  }> {
    const filter: Record<string, unknown> = {};

    if (query.fromCurrency) filter.fromCurrency = query.fromCurrency;
    if (query.toCurrency) filter.toCurrency = query.toCurrency;
    if (query.source) filter.source = query.source;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    const [rates, total] = await Promise.all([
      this.exchangeRateModel
        .find(filter)
        .sort({ lastUpdatedAt: -1 })
        .limit(query.limit || 50)
        .skip(query.offset || 0)
        .lean(),
      this.exchangeRateModel.countDocuments(filter),
    ]);

    return { rates, total };
  }

  /**
   * Convert currency
   */
  async convertCurrency(convertDto: ConvertCurrencyDto): Promise<{
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    rate: number;
    result: number;
    rateType: string;
  }> {
    try {
      const exchangeRate = await this.getExchangeRate(
        convertDto.fromCurrency,
        convertDto.toCurrency,
      );

      let rate = exchangeRate.rate;
      if (convertDto.rateType === 'buy' && exchangeRate.buyRate) {
        rate = exchangeRate.buyRate;
      } else if (convertDto.rateType === 'sell' && exchangeRate.sellRate) {
        rate = exchangeRate.sellRate;
      }

      const result = convertDto.amount * rate;

      this.logger.log(
        `Currency conversion: ${convertDto.amount} ${convertDto.fromCurrency} = ${result} ${convertDto.toCurrency}`,
      );

      return {
        fromCurrency: convertDto.fromCurrency,
        toCurrency: convertDto.toCurrency,
        amount: convertDto.amount,
        rate,
        result: Math.round(result * 100) / 100, // Round to 2 decimal places
        rateType: convertDto.rateType || 'mid',
      };
    } catch (error) {
      this.logger.error('Failed to convert currency:', error);
      throw error;
    }
  }

  /**
   * Bulk update exchange rates
   */
  async bulkUpdateExchangeRates(
    bulkUpdateDto: BulkUpdateExchangeRatesDto,
    updatedBy: string,
    reason?: string,
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{ success: boolean; error?: string; fromCurrency: string; toCurrency: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      results: [] as Array<{
        success: boolean;
        error?: string;
        fromCurrency: string;
        toCurrency: string;
      }>,
    };

    for (const update of bulkUpdateDto.updates) {
      try {
        await this.updateExchangeRate(
          update.fromCurrency,
          update.toCurrency,
          { rate: update.rate },
          updatedBy,
          update.reason || reason,
        );
        results.success++;
        results.results.push({
          success: true,
          fromCurrency: update.fromCurrency,
          toCurrency: update.toCurrency,
        });
      } catch (error) {
        results.failed++;
        results.results.push({
          success: false,
          error: (error as Error).message,
          fromCurrency: update.fromCurrency,
          toCurrency: update.toCurrency,
        });
      }
    }

    this.logger.log(`Bulk update completed: ${results.success} success, ${results.failed} failed`);

    return results;
  }

  /**
   * Get exchange rate history
   */
  async getExchangeRateHistory(query: ExchangeRateHistoryQueryDto): Promise<{
    history: ExchangeRateHistoryDocument[];
    total: number;
  }> {
    const filter: Record<string, unknown> = {};

    if (query.fromCurrency) filter.fromCurrency = query.fromCurrency;
    if (query.toCurrency) filter.toCurrency = query.toCurrency;
    if (query.updatedBy) filter.updatedBy = query.updatedBy;
    if (query.changeType) filter.changeType = query.changeType;
    if (query.source) filter.source = query.source;

    if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    const [history, total] = await Promise.all([
      this.historyModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(query.limit || 50)
        .skip(query.offset || 0)
        .lean(),
      this.historyModel.countDocuments(filter),
    ]);

    return { history, total };
  }

  /**
   * Get exchange rate statistics
   */
  async getExchangeRateStatistics(query: ExchangeRateStatisticsDto): Promise<{
    totalRates: number;
    activeRates: number;
    inactiveRates: number;
    bySource: Record<string, number>;
    byCurrency: Record<string, number>;
    recentChanges: number;
    averageChange: number;
    topChanges: Array<{
      fromCurrency: string;
      toCurrency: string;
      changePercentage: number;
      changeAmount: number;
    }>;
  }> {
    const filter: Record<string, unknown> = {};
    if (query.fromCurrency) filter.fromCurrency = query.fromCurrency;
    if (query.toCurrency) filter.toCurrency = query.toCurrency;

    if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }

    const [rates, history] = await Promise.all([
      this.exchangeRateModel.find(filter).lean(),
      this.historyModel.find(filter).lean(),
    ]);

    const stats = {
      totalRates: rates.length,
      activeRates: rates.filter((r) => r.isActive).length,
      inactiveRates: rates.filter((r) => !r.isActive).length,
      bySource: {} as Record<string, number>,
      byCurrency: {} as Record<string, number>,
      recentChanges: history.length,
      averageChange: 0,
      topChanges: [] as Array<{
        fromCurrency: string;
        toCurrency: string;
        changePercentage: number;
        changeAmount: number;
      }>,
    };

    // Calculate by source
    rates.forEach((rate) => {
      stats.bySource[rate.source] = (stats.bySource[rate.source] || 0) + 1;
      stats.byCurrency[rate.fromCurrency] = (stats.byCurrency[rate.fromCurrency] || 0) + 1;
    });

    // Calculate average change
    if (history.length > 0) {
      stats.averageChange =
        history.reduce((sum, h) => sum + h.changePercentage, 0) / history.length;
    }

    // Get top changes
    stats.topChanges = history
      .sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage))
      .slice(0, 10)
      .map((h) => ({
        fromCurrency: h.fromCurrency,
        toCurrency: h.toCurrency,
        changePercentage: h.changePercentage,
        changeAmount: h.changeAmount,
      }));

    return stats;
  }

  /**
   * Create history record
   */
  private async createHistoryRecord(
    fromCurrency: string,
    toCurrency: string,
    oldRate: number,
    newRate: number,
    oldBaseRate: number,
    newBaseRate: number,
    updatedBy: string,
    source: string,
    reason?: string,
  ): Promise<void> {
    const changeAmount = newRate - oldRate;
    const changePercentage = oldRate > 0 ? (changeAmount / oldRate) * 100 : 0;
    const changeType = changeAmount > 0 ? 'increase' : changeAmount < 0 ? 'decrease' : 'no_change';

    const historyRecord = new this.historyModel({
      fromCurrency,
      toCurrency,
      oldRate,
      newRate,
      changeAmount,
      changePercentage,
      changeType,
      updatedBy,
      reason,
      source,
    });

    await historyRecord.save();
  }

  /**
   * Deactivate exchange rate
   */
  async deactivateExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    updatedBy: string,
  ): Promise<boolean> {
    const exchangeRate = await this.exchangeRateModel.findOne({
      fromCurrency,
      toCurrency,
      isActive: true,
    });

    if (!exchangeRate) {
      throw new NotFoundException('Exchange rate not found');
    }

    exchangeRate.isActive = false;
    exchangeRate.lastUpdatedBy = updatedBy;
    exchangeRate.lastUpdatedAt = new Date();

    await exchangeRate.save();

    this.logger.log(`Exchange rate deactivated: ${fromCurrency}/${toCurrency}`);

    return true;
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<{
    currencies: string[];
    pairs: Array<{ from: string; to: string; rate: number }>;
  }> {
    const rates = await this.exchangeRateModel.find({ isActive: true }).lean();

    const currencies = [
      ...new Set([...rates.map((r) => r.fromCurrency), ...rates.map((r) => r.toCurrency)]),
    ];

    const pairs = rates.map((r) => ({
      from: r.fromCurrency,
      to: r.toCurrency,
      rate: r.rate,
    }));

    return { currencies, pairs };
  }
}
