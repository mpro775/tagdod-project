import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';
import { ExchangeRate } from '../../exchange-rates/schemas/exchange-rate.schema';

export type MonetaryFields = {
  basePriceUSD?: number | null;
  compareAtPriceUSD?: number | null;
  costPriceUSD?: number | null;
};

export type DerivedMonetaryFields = {
  basePriceSAR?: number;
  basePriceYER?: number;
  compareAtPriceSAR?: number;
  compareAtPriceYER?: number;
  costPriceSAR?: number;
  costPriceYER?: number;
  exchangeRateVersion?: string;
  lastExchangeRateSyncAt?: Date;
};

@Injectable()
export class ProductPricingCalculatorService {
  constructor(
    @Inject(forwardRef(() => ExchangeRatesService))
    private readonly exchangeRatesService: ExchangeRatesService,
  ) {}

  async calculateProductPricing<T extends MonetaryFields>(
    product: T,
    rates?: ExchangeRate,
  ): Promise<DerivedMonetaryFields> {
    const effectiveRates = rates ?? (await this.exchangeRatesService.getCurrentRates());
    return this.calculateDerivedPricing(product, effectiveRates);
  }

  async calculateVariantPricing<T extends MonetaryFields>(
    variant: T,
    rates?: ExchangeRate,
  ): Promise<DerivedMonetaryFields> {
    const effectiveRates = rates ?? (await this.exchangeRatesService.getCurrentRates());
    return this.calculateDerivedPricing(variant, effectiveRates);
  }

  async getLatestRates(): Promise<ExchangeRate> {
    return this.exchangeRatesService.getCurrentRates();
  }

  calculateDerivedPricing(
    data: MonetaryFields,
    rates: ExchangeRate,
  ): DerivedMonetaryFields {
    const now = new Date();
    const exchangeRateVersion = this.getExchangeRateVersion(rates);

    return {
      basePriceSAR: this.convertUsdAmount(data.basePriceUSD, rates.usdToSar, 2),
      basePriceYER: this.convertUsdAmount(data.basePriceUSD, rates.usdToYer, 0, true),
      compareAtPriceSAR: this.convertUsdAmount(data.compareAtPriceUSD, rates.usdToSar, 2),
      compareAtPriceYER: this.convertUsdAmount(data.compareAtPriceUSD, rates.usdToYer, 0, true),
      costPriceSAR: this.convertUsdAmount(data.costPriceUSD, rates.usdToSar, 2),
      costPriceYER: this.convertUsdAmount(data.costPriceUSD, rates.usdToYer, 0, true),
      exchangeRateVersion,
      lastExchangeRateSyncAt: now,
    };
  }

  private convertUsdAmount(
    amount?: number | null,
    rate?: number,
    decimals = 2,
    roundToInteger = false,
  ): number | undefined {
    if (amount === undefined || amount === null) {
      return undefined;
    }

    if (typeof rate !== 'number' || Number.isNaN(rate) || rate <= 0) {
      return undefined;
    }

    const numericAmount = typeof amount === 'number' ? amount : Number(amount);

    if (Number.isNaN(numericAmount)) {
      return undefined;
    }

    const converted = numericAmount * rate;

    if (roundToInteger) {
      return Math.round(converted);
    }

    const factor = Math.pow(10, decimals);
    return Math.round(converted * factor) / factor;
  }

  private getExchangeRateVersion(rates: ExchangeRate): string | undefined {
    const candidate = (rates as Partial<ExchangeRate> & {
      updatedAt?: Date | string;
      createdAt?: Date | string;
    });

    const lastUpdated = candidate.lastUpdatedAt
      ? new Date(candidate.lastUpdatedAt)
      : candidate.updatedAt
      ? new Date(candidate.updatedAt)
      : candidate.createdAt
      ? new Date(candidate.createdAt)
      : null;

    if (lastUpdated) {
      return lastUpdated.toISOString();
    }

    return undefined;
  }
}
