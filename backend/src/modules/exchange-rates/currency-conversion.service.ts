import { Injectable, Logger } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';

export interface ConversionResult {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: number;
  result: number;
  rateType: string;
  timestamp: Date;
  fees?: number;
  totalAmount?: number;
}

export interface MultiCurrencyConversion {
  baseCurrency: string;
  baseAmount: number;
  conversions: Array<{
    toCurrency: string;
    rate: number;
    result: number;
  }>;
}

@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);

  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  /**
   * Convert currency with advanced options
   */
  async convertCurrencyAdvanced(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    options: {
      rateType?: 'buy' | 'sell' | 'mid';
      fees?: number;
      feesPercentage?: number;
      roundTo?: number;
    } = {}
  ): Promise<ConversionResult> {
    try {
      // Get exchange rate
      const exchangeRate = await this.exchangeRatesService.getExchangeRate(fromCurrency, toCurrency);
      
      let rate = exchangeRate.rate;
      if (options.rateType === 'buy' && exchangeRate.buyRate) {
        rate = exchangeRate.buyRate;
      } else if (options.rateType === 'sell' && exchangeRate.sellRate) {
        rate = exchangeRate.sellRate;
      }

      // Calculate base conversion
      let result = amount * rate;

      // Apply fees
      let fees = 0;
      if (options.fees) {
        fees = options.fees;
      } else if (options.feesPercentage) {
        fees = (result * options.feesPercentage) / 100;
      }

      // Apply rounding
      if (options.roundTo !== undefined) {
        result = Math.round(result * Math.pow(10, options.roundTo)) / Math.pow(10, options.roundTo);
        fees = Math.round(fees * Math.pow(10, options.roundTo)) / Math.pow(10, options.roundTo);
      } else {
        result = Math.round(result * 100) / 100; // Default to 2 decimal places
        fees = Math.round(fees * 100) / 100;
      }

      const totalAmount = result + fees;

      this.logger.log(`Advanced conversion: ${amount} ${fromCurrency} = ${result} ${toCurrency} (fees: ${fees})`);

      return {
        fromCurrency,
        toCurrency,
        amount,
        rate,
        result,
        rateType: options.rateType || 'mid',
        timestamp: new Date(),
        fees,
        totalAmount
      };
    } catch (error) {
      this.logger.error('Failed to convert currency:', error);
      throw error;
    }
  }

  /**
   * Convert to multiple currencies
   */
  async convertToMultipleCurrencies(
    fromCurrency: string,
    amount: number,
    targetCurrencies: string[],
    rateType: 'buy' | 'sell' | 'mid' = 'mid'
  ): Promise<MultiCurrencyConversion> {
    try {
      const conversions = [];

      for (const toCurrency of targetCurrencies) {
        try {
          const result = await this.convertCurrencyAdvanced(
            fromCurrency,
            toCurrency,
            amount,
            { rateType }
          );

          conversions.push({
            toCurrency,
            rate: result.rate,
            result: result.result
          });
        } catch (error) {
          this.logger.warn(`Failed to convert ${fromCurrency} to ${toCurrency}:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return {
        baseCurrency: fromCurrency,
        baseAmount: amount,
        conversions
      };
    } catch (error) {
      this.logger.error('Failed to convert to multiple currencies:', error);
      throw error;
    }
  }

  /**
   * Calculate conversion with spread
   */
  async calculateSpread(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<{
    buyRate: number;
    sellRate: number;
    midRate: number;
    spread: number;
    buyResult: number;
    sellResult: number;
    midResult: number;
  }> {
    try {
      const exchangeRate = await this.exchangeRatesService.getExchangeRate(fromCurrency, toCurrency);
      
      const buyRate = exchangeRate.buyRate || exchangeRate.rate;
      const sellRate = exchangeRate.sellRate || exchangeRate.rate;
      const midRate = exchangeRate.rate;
      
      const spread = Math.abs(buyRate - sellRate);
      
      const buyResult = amount * buyRate;
      const sellResult = amount * sellRate;
      const midResult = amount * midRate;

      return {
        buyRate,
        sellRate,
        midRate,
        spread,
        buyResult: Math.round(buyResult * 100) / 100,
        sellResult: Math.round(sellResult * 100) / 100,
        midResult: Math.round(midResult * 100) / 100
      };
    } catch (error) {
      this.logger.error('Failed to calculate spread:', error);
      throw error;
    }
  }

  /**
   * Get conversion rate between any two currencies
   */
  async getConversionRate(
    fromCurrency: string,
    toCurrency: string,
    rateType: 'buy' | 'sell' | 'mid' = 'mid'
  ): Promise<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    rateType: string;
    lastUpdated: Date;
  }> {
    try {
      const exchangeRate = await this.exchangeRatesService.getExchangeRate(fromCurrency, toCurrency);
      
      let rate = exchangeRate.rate;
      if (rateType === 'buy' && exchangeRate.buyRate) {
        rate = exchangeRate.buyRate;
      } else if (rateType === 'sell' && exchangeRate.sellRate) {
        rate = exchangeRate.sellRate;
      }

      return {
        fromCurrency,
        toCurrency,
        rate,
        rateType,
        lastUpdated: exchangeRate.lastUpdatedAt || exchangeRate.updatedAt
      };
    } catch (error) {
      this.logger.error('Failed to get conversion rate:', error);
      throw error;
    }
  }

  /**
   * Calculate cross rates (A/B = A/C * C/B)
   */
  async calculateCrossRate(
    fromCurrency: string,
    toCurrency: string,
    baseCurrency: string = 'USD'
  ): Promise<{
    fromCurrency: string;
    toCurrency: string;
    baseCurrency: string;
    rate: number;
    method: string;
  }> {
    try {
      // Get rates through base currency
      const fromToBase = await this.getConversionRate(fromCurrency, baseCurrency);
      const baseToTarget = await this.getConversionRate(baseCurrency, toCurrency);
      
      const crossRate = fromToBase.rate * baseToTarget.rate;

      this.logger.log(`Cross rate calculated: ${fromCurrency}/${toCurrency} = ${crossRate} (via ${baseCurrency})`);

      return {
        fromCurrency,
        toCurrency,
        baseCurrency,
        rate: Math.round(crossRate * 1000000) / 1000000, // 6 decimal places for precision
        method: `via ${baseCurrency}`
      };
    } catch (error) {
      this.logger.error('Failed to calculate cross rate:', error);
      throw error;
    }
  }

  /**
   * Get currency conversion matrix
   */
  async getConversionMatrix(
    currencies: string[],
    rateType: 'buy' | 'sell' | 'mid' = 'mid'
  ): Promise<{
    currencies: string[];
    matrix: Array<Array<{ rate: number; available: boolean }>>;
    lastUpdated: Date;
  }> {
    try {
      const matrix = [];
      const lastUpdated = new Date();

      for (let i = 0; i < currencies.length; i++) {
        const row = [];
        for (let j = 0; j < currencies.length; j++) {
          if (i === j) {
            row.push({ rate: 1, available: true });
          } else {
            try {
              const rate = await this.getConversionRate(currencies[i], currencies[j], rateType);
              row.push({ rate: rate.rate, available: true });
            } catch (error) {
              row.push({ rate: 0, available: false });
            }
          }
        }
        matrix.push(row);
      }

      return {
        currencies,
        matrix,
        lastUpdated
      };
    } catch (error) {
      this.logger.error('Failed to get conversion matrix:', error);
      throw error;
    }
  }

  /**
   * Validate currency pair
   */
  async validateCurrencyPair(fromCurrency: string, toCurrency: string): Promise<{
    valid: boolean;
    available: boolean;
    message?: string;
  }> {
    try {
      if (fromCurrency === toCurrency) {
        return {
          valid: false,
          available: false,
          message: 'Source and target currencies cannot be the same'
        };
      }

      await this.exchangeRatesService.getExchangeRate(fromCurrency, toCurrency);
      
      return {
        valid: true,
        available: true
      };
    } catch (error) {
      return {
        valid: false,
        available: false,
        message: `Currency pair ${fromCurrency}/${toCurrency} not available`
      };
    }
  }
}