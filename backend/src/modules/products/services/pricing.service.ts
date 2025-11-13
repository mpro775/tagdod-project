import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Variant } from '../schemas/variant.schema';
import { 
  VariantNotFoundException,
  ProductException,
  ErrorCode 
} from '../../../shared/exceptions';
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';
import { ExchangeRate } from '../../exchange-rates/schemas/exchange-rate.schema';

export interface PriceWithDiscount {
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  exchangeRate?: number;
  formattedPrice?: string;
  formattedFinalPrice?: string;
}

export interface PriceWithDiscountAndVariantId extends PriceWithDiscount {
  variantId: string;
}

type VariantPricingSnapshot = {
  _id: Types.ObjectId | string;
  basePriceUSD: number;
  basePriceSAR?: number;
  basePriceYER?: number;
  compareAtPriceUSD?: number;
  compareAtPriceSAR?: number;
  compareAtPriceYER?: number;
  costPriceUSD?: number;
  costPriceSAR?: number;
  costPriceYER?: number;
  exchangeRateVersion?: string;
  lastExchangeRateSyncAt?: Date | string;
};

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  // ==================== Price Conversion ====================

  async getVariantPrice(
    variantId: string, 
    currency: string = 'USD'
  ): Promise<{
    basePrice: number;
    compareAtPrice?: number;
    costPrice?: number;
    currency: string;
    exchangeRate?: number;
    formattedPrice?: string;
  }> {
    const variant = await this.variantModel.findById(variantId).lean();

    if (!variant) {
      throw new VariantNotFoundException({ variantId });
    }

    const normalizedCurrency = (currency || 'USD').toUpperCase();

    let rates: ExchangeRate | undefined;
    const ensureRates = async (): Promise<ExchangeRate> => {
      if (!rates) {
        rates = await this.exchangeRatesService.getCurrentRates();
      }
      return rates;
    };

    const storedBasePrice = this.pickStoredAmount(normalizedCurrency, {
      usd: variant.basePriceUSD,
      sar: (variant as unknown as { basePriceSAR?: number }).basePriceSAR,
      yer: (variant as unknown as { basePriceYER?: number }).basePriceYER,
    });

    let basePrice =
      normalizedCurrency === 'USD'
        ? variant.basePriceUSD
        : storedBasePrice !== undefined
        ? storedBasePrice
        : undefined;
    let exchangeRate =
      normalizedCurrency === 'USD'
        ? undefined
        : this.computeStoredExchangeRate(normalizedCurrency, variant.basePriceUSD, basePrice);
    let formattedPrice =
      normalizedCurrency === 'USD' ? undefined : this.formatStoredPrice(normalizedCurrency, basePrice);

    const resolveFallbackConversion = async (
      amountUSD: number | undefined,
    ): Promise<{ value?: number; formatted?: string; rate?: number }> => {
      if (amountUSD === undefined || amountUSD === null) {
        return { value: undefined, formatted: undefined, rate: undefined };
      }
      const currentRates = await ensureRates();
      return this.convertUsdAmount(amountUSD, normalizedCurrency, currentRates);
    };

    if (basePrice === undefined) {
      try {
        const converted = await resolveFallbackConversion(variant.basePriceUSD);
        basePrice = converted.value ?? 0;
        exchangeRate = converted.rate;
        formattedPrice = converted.formatted ?? this.formatStoredPrice(normalizedCurrency, basePrice);
      } catch (error) {
        this.logger.error(`Error converting base price for variant ${variantId}:`, error);
        throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, {
          variantId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const pickStored = (field: 'compareAtPrice' | 'costPrice'): number | undefined => {
      if (normalizedCurrency === 'USD') {
        return field === 'compareAtPrice' ? variant.compareAtPriceUSD : variant.costPriceUSD;
      }

      const castVariant = variant as unknown as {
        compareAtPriceSAR?: number;
        compareAtPriceYER?: number;
        costPriceSAR?: number;
        costPriceYER?: number;
      };

      return this.pickStoredAmount(normalizedCurrency, {
        usd:
          field === 'compareAtPrice' ? variant.compareAtPriceUSD : variant.costPriceUSD,
        sar:
          field === 'compareAtPrice'
            ? castVariant.compareAtPriceSAR
            : castVariant.costPriceSAR,
        yer:
          field === 'compareAtPrice'
            ? castVariant.compareAtPriceYER
            : castVariant.costPriceYER,
      });
    };

    let compareAtPrice = pickStored('compareAtPrice');
    let costPrice = pickStored('costPrice');

    const needsCompareConversion =
      compareAtPrice === undefined && variant.compareAtPriceUSD !== undefined && normalizedCurrency !== 'USD';
    const needsCostConversion =
      costPrice === undefined && variant.costPriceUSD !== undefined && normalizedCurrency !== 'USD';

    try {
      if (needsCompareConversion) {
        const converted = await resolveFallbackConversion(variant.compareAtPriceUSD);
        compareAtPrice = converted.value;
      }

      if (needsCostConversion) {
        const converted = await resolveFallbackConversion(variant.costPriceUSD);
        costPrice = converted.value;
      }
    } catch (error) {
      this.logger.error(`Error converting comparison prices for variant ${variantId}:`, error);
      throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, {
        variantId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const safeBasePrice = basePrice ?? 0;

    return {
      basePrice: safeBasePrice,
      compareAtPrice,
      costPrice,
      currency: normalizedCurrency,
      exchangeRate,
      formattedPrice,
    };
  }

  async getProductPrices(
    productId: string,
    currency: string = 'USD'
  ): Promise<Array<{
    variantId: string;
    basePrice: number;
    compareAtPrice?: number;
    costPrice?: number;
    currency: string;
    exchangeRate?: number;
    formattedPrice?: string;
  }>> {
    const variants = await this.variantModel
      .find({ productId, deletedAt: null, isActive: true })
      .select(
        '_id basePriceUSD basePriceSAR basePriceYER compareAtPriceUSD compareAtPriceSAR compareAtPriceYER costPriceUSD costPriceSAR costPriceYER',
      )
      .lean();

    const normalizedCurrency = (currency || 'USD').toUpperCase();

    if (normalizedCurrency === 'USD') {
      return variants.map(variant => ({
        variantId: variant._id.toString(),
        basePrice: variant.basePriceUSD,
        compareAtPrice: variant.compareAtPriceUSD,
        costPrice: variant.costPriceUSD,
        currency: 'USD',
      }));
    }

    try {
      const needsConversion =
        normalizedCurrency !== 'USD' &&
        variants.some((variant) => {
          const variantSnapshot = variant as VariantPricingSnapshot;

          const hasBaseStored = this.hasStoredAmount(normalizedCurrency, {
            sar: variantSnapshot.basePriceSAR,
            yer: variantSnapshot.basePriceYER,
          });

          const hasCompareStored =
            variantSnapshot.compareAtPriceUSD === undefined
              ? true
              : this.hasStoredAmount(normalizedCurrency, {
                  sar: variantSnapshot.compareAtPriceSAR,
                  yer: variantSnapshot.compareAtPriceYER,
                });

          const hasCostStored =
            variantSnapshot.costPriceUSD === undefined
              ? true
              : this.hasStoredAmount(normalizedCurrency, {
                  sar: variantSnapshot.costPriceSAR,
                  yer: variantSnapshot.costPriceYER,
                });

          return !hasBaseStored || !hasCompareStored || !hasCostStored;
        });

      const rates = needsConversion
        ? await this.exchangeRatesService.getCurrentRates()
        : undefined;

      return variants.map((variant) => {
        const variantSnapshot = variant as VariantPricingSnapshot;

        const storedBase = this.pickStoredAmount(normalizedCurrency, {
          usd: variantSnapshot.basePriceUSD,
          sar: variantSnapshot.basePriceSAR,
          yer: variantSnapshot.basePriceYER,
        });

        let basePrice =
          normalizedCurrency === 'USD'
            ? variantSnapshot.basePriceUSD
            : storedBase !== undefined
            ? storedBase
            : undefined;
        let exchangeRate =
          normalizedCurrency === 'USD'
            ? undefined
            : this.computeStoredExchangeRate(
                normalizedCurrency,
                variantSnapshot.basePriceUSD,
                basePrice,
              );
        let formattedPrice =
          normalizedCurrency === 'USD'
            ? undefined
            : this.formatStoredPrice(normalizedCurrency, basePrice);

        if (basePrice === undefined && rates) {
          const converted = this.convertUsdAmount(
            variantSnapshot.basePriceUSD,
            normalizedCurrency,
            rates,
          );
          basePrice = converted.value ?? 0;
          exchangeRate = converted.rate;
          formattedPrice =
            converted.formatted ?? this.formatStoredPrice(normalizedCurrency, basePrice);
        } else if (basePrice === undefined) {
          basePrice = 0;
        }

        const resolveAdditionalPrice = (
          usdAmount?: number,
          storedSar?: number,
          storedYer?: number,
        ): number | undefined => {
          if (normalizedCurrency === 'USD') {
            return usdAmount;
          }

          const stored = this.pickStoredAmount(normalizedCurrency, {
            usd: usdAmount,
            sar: storedSar,
            yer: storedYer,
          });

          if (stored !== undefined) {
            return stored;
          }

          if (usdAmount === undefined || usdAmount === null || !rates) {
            return undefined;
          }

          const converted = this.convertUsdAmount(usdAmount, normalizedCurrency, rates);
          return converted.value;
        };

        const compareAtPrice = resolveAdditionalPrice(
          variantSnapshot.compareAtPriceUSD,
          variantSnapshot.compareAtPriceSAR,
          variantSnapshot.compareAtPriceYER,
        );
        const costPrice = resolveAdditionalPrice(
          variantSnapshot.costPriceUSD,
          variantSnapshot.costPriceSAR,
          variantSnapshot.costPriceYER,
        );

        return {
          variantId: variant._id.toString(),
          basePrice: basePrice ?? 0,
          compareAtPrice,
          costPrice,
          currency: normalizedCurrency,
          exchangeRate,
          formattedPrice,
        };
      });
    } catch (error) {
      this.logger.error(`Error converting product prices for ${productId}:`, error);
      throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, { productId, error: error instanceof Error ? error.message : String(error) });
    }
  }

  // ==================== Price Range ====================

  async getProductPriceRange(
    productId: string,
    currency: string = 'USD'
  ): Promise<{
    minPrice: number;
    maxPrice: number;
    currency: string;
    formattedMinPrice?: string;
    formattedMaxPrice?: string;
  }> {
    const variants = await this.variantModel
      .find({ productId, deletedAt: null, isActive: true })
      .select('basePriceUSD basePriceSAR basePriceYER')
      .lean();

    if (variants.length === 0) {
      return { minPrice: 0, maxPrice: 0, currency };
    }

    const prices = variants.map(v => v.basePriceUSD);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const normalizedCurrency = (currency || 'USD').toUpperCase();

    if (normalizedCurrency === 'USD') {
      return { minPrice, maxPrice, currency };
    }

    try {
      const variantSnapshots = variants as Array<
        { basePriceUSD: number; basePriceSAR?: number; basePriceYER?: number }
      >;

      const needsConversion = variantSnapshots.some((variant) => {
        const hasStored = this.hasStoredAmount(normalizedCurrency, {
          sar: variant.basePriceSAR,
          yer: variant.basePriceYER,
        });
        return !hasStored;
      });

      const rates = needsConversion
        ? await this.exchangeRatesService.getCurrentRates()
        : undefined;

      let resolvedMin: number | undefined;
      let resolvedMax: number | undefined;
      let formattedMin: string | undefined;
      let formattedMax: string | undefined;

      variantSnapshots.forEach((variant) => {
        const storedValue = this.pickStoredAmount(normalizedCurrency, {
          usd: variant.basePriceUSD,
          sar: variant.basePriceSAR,
          yer: variant.basePriceYER,
        });

        let price: number;
        let formatted: string | undefined;

        if (storedValue !== undefined) {
          price = storedValue;
          formatted = this.formatStoredPrice(normalizedCurrency, storedValue);
        } else if (rates) {
          const converted = this.convertUsdAmount(
            variant.basePriceUSD,
            normalizedCurrency,
            rates,
          );
          price = converted.value ?? 0;
          formatted = converted.formatted;
        } else {
          price = 0;
          formatted = undefined;
        }

        if (price < (resolvedMin ?? Number.POSITIVE_INFINITY)) {
          resolvedMin = price;
          formattedMin = formatted;
        }

        if (price > (resolvedMax ?? Number.NEGATIVE_INFINITY)) {
          resolvedMax = price;
          formattedMax = formatted;
        }
      });

      const safeMin = resolvedMin ?? 0;
      const safeMax = resolvedMax ?? 0;

      return {
        minPrice: safeMin,
        maxPrice: safeMax,
        currency: normalizedCurrency,
        formattedMinPrice: formattedMin,
        formattedMaxPrice: formattedMax,
      };
    } catch (error) {
      this.logger.error(`Error converting price range for product ${productId}:`, error);
      throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // ==================== Bulk Price Update ====================

  async updateVariantPrice(
    variantId: string,
    priceData: {
      basePriceUSD?: number;
      compareAtPriceUSD?: number;
      costPriceUSD?: number;
    }
  ): Promise<Variant> {
    const variant = await this.variantModel.findById(variantId);

    if (!variant) {
      throw new VariantNotFoundException({ variantId });
    }

    await this.variantModel.updateOne(
      { _id: variantId },
      { $set: priceData }
    );

    return this.variantModel.findById(variantId) as Promise<Variant>;
  }

  async bulkUpdatePrices(
    updates: Array<{
      variantId: string;
      basePriceUSD?: number;
      compareAtPriceUSD?: number;
      costPriceUSD?: number;
    }>
  ): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    for (const update of updates) {
      try {
        await this.variantModel.updateOne(
          { _id: update.variantId },
          { $set: { ...update, variantId: undefined } }
        );
        updated++;
      } catch (error) {
        errors.push(`Failed to update variant ${update.variantId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { updated, errors };
  }

  // ==================== Price with Discount ====================

  /**
   * حساب السعر مع خصم التاجر
   * @param basePrice السعر الأصلي
   * @param discountPercent نسبة الخصم (0-100)
   * @returns السعر بعد الخصم
   */
  private calculatePriceWithDiscount(basePrice: number, discountPercent: number): number {
    if (!discountPercent || discountPercent <= 0) {
      return basePrice;
    }
    return basePrice * (1 - discountPercent / 100);
  }

  private pickStoredAmount(
    currency: string,
    values: { usd?: number; sar?: number; yer?: number },
  ): number | undefined {
    switch (currency) {
      case 'USD':
        return values.usd;
      case 'SAR':
        return values.sar;
      case 'YER':
        return values.yer;
      default:
        return undefined;
    }
  }

  private hasStoredAmount(currency: string, values: { sar?: number; yer?: number }): boolean {
    switch (currency) {
      case 'USD':
        return true;
      case 'SAR':
        return values.sar !== undefined;
      case 'YER':
        return values.yer !== undefined;
      default:
        return false;
    }
  }

  private computeStoredExchangeRate(
    currency: string,
    usdAmount?: number,
    storedAmount?: number,
  ): number | undefined {
    if (currency === 'USD') {
      return undefined;
    }

    if (
      usdAmount === undefined ||
      usdAmount === null ||
      usdAmount === 0 ||
      storedAmount === undefined ||
      storedAmount === null
    ) {
      return undefined;
    }

    return storedAmount / usdAmount;
  }

  private formatStoredPrice(currency: string, amount?: number): string | undefined {
    if (amount === undefined || amount === null) {
      return undefined;
    }

    if (currency === 'YER') {
      return `${Math.round(amount).toLocaleString()} $`;
    }

    if (currency === 'SAR') {
      return `${amount.toFixed(2)} $`;
    }

    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }

    return amount.toString();
  }

  /**
   * جلب سعر المتغير مع خصم التاجر
   */
  async getVariantPriceWithDiscount(
    variantId: string,
    currency: string = 'USD',
    discountPercent: number = 0
  ): Promise<PriceWithDiscount> {
    const priceData = await this.getVariantPrice(variantId, currency);
    
    const discountAmount = discountPercent > 0 
      ? priceData.basePrice * (discountPercent / 100)
      : 0;
    
    const finalPrice = this.calculatePriceWithDiscount(priceData.basePrice, discountPercent);

    // تنسيق السعر النهائي
    let formattedFinalPrice: string | undefined;
    if (currency !== 'USD' && priceData.formattedPrice) {
      // استخدام نفس التنسيق مع السعر النهائي
      const formattedBase = priceData.formattedPrice.replace(
        priceData.basePrice.toFixed(2),
        finalPrice.toFixed(2)
      );
      formattedFinalPrice = formattedBase;
    }

    return {
      basePrice: priceData.basePrice,
      compareAtPrice: priceData.compareAtPrice,
      costPrice: priceData.costPrice,
      discountPercent,
      discountAmount,
      finalPrice,
      currency,
      exchangeRate: priceData.exchangeRate,
      formattedPrice: priceData.formattedPrice,
      formattedFinalPrice,
    };
  }

  /**
   * جلب أسعار جميع متغيرات المنتج مع خصم التاجر
   */
  async getProductPricesWithDiscount(
    productId: string,
    currency: string = 'USD',
    discountPercent: number = 0,
    options: { variants?: VariantPricingSnapshot[] } = {},
  ): Promise<PriceWithDiscountAndVariantId[]> {
    const normalizedCurrency = (currency || 'USD').toUpperCase();
    const variants =
      options.variants ??
      (await this.variantModel
        .find({ productId, deletedAt: null, isActive: true })
        .select(
          '_id basePriceUSD basePriceSAR basePriceYER compareAtPriceUSD compareAtPriceSAR compareAtPriceYER costPriceUSD costPriceSAR costPriceYER',
        )
        .lean());

    if (!variants || variants.length === 0) {
      return [];
    }

    if (normalizedCurrency === 'USD') {
      return variants.map(variant => {
        const discountAmount = discountPercent > 0 
          ? variant.basePriceUSD * (discountPercent / 100)
          : 0;
        const finalPrice = this.calculatePriceWithDiscount(variant.basePriceUSD, discountPercent);

        return {
          variantId: variant._id.toString(),
          basePrice: variant.basePriceUSD,
          compareAtPrice: variant.compareAtPriceUSD,
          costPrice: variant.costPriceUSD,
          discountPercent,
          discountAmount,
          finalPrice,
          currency: 'USD',
        };
      });
    }

    try {
      const variantSnapshots = variants as VariantPricingSnapshot[];

      const needsConversion =
        normalizedCurrency !== 'USD' &&
        variantSnapshots.some((variant) => {
          const hasBaseStored = this.hasStoredAmount(normalizedCurrency, {
            sar: variant.basePriceSAR,
            yer: variant.basePriceYER,
          });

          const hasCompareStored =
            variant.compareAtPriceUSD === undefined
              ? true
              : this.hasStoredAmount(normalizedCurrency, {
                  sar: variant.compareAtPriceSAR,
                  yer: variant.compareAtPriceYER,
                });

          const hasCostStored =
            variant.costPriceUSD === undefined
              ? true
              : this.hasStoredAmount(normalizedCurrency, {
                  sar: variant.costPriceSAR,
                  yer: variant.costPriceYER,
                });

          return !hasBaseStored || !hasCompareStored || !hasCostStored;
        });

      const rates = needsConversion
        ? await this.exchangeRatesService.getCurrentRates()
        : undefined;

      return variantSnapshots.map((variant) => {
        const storedBase = this.pickStoredAmount(normalizedCurrency, {
          usd: variant.basePriceUSD,
          sar: variant.basePriceSAR,
          yer: variant.basePriceYER,
        });

        let basePrice =
          normalizedCurrency === 'USD'
            ? variant.basePriceUSD
            : storedBase !== undefined
            ? storedBase
            : undefined;
        let exchangeRate =
          normalizedCurrency === 'USD'
            ? undefined
            : this.computeStoredExchangeRate(
                normalizedCurrency,
                variant.basePriceUSD,
                basePrice,
              );
        let formattedPrice =
          normalizedCurrency === 'USD'
            ? undefined
            : this.formatStoredPrice(normalizedCurrency, basePrice);

        if (basePrice === undefined && rates) {
          const converted = this.convertUsdAmount(
            variant.basePriceUSD,
            normalizedCurrency,
            rates,
          );
          basePrice = converted.value ?? 0;
          exchangeRate = converted.rate;
          formattedPrice =
            converted.formatted ?? this.formatStoredPrice(normalizedCurrency, basePrice);
        } else if (basePrice === undefined) {
          basePrice = 0;
        }

        const resolveAdditionalPrice = (
          usdAmount?: number,
          storedSar?: number,
          storedYer?: number,
        ): number | undefined => {
          if (normalizedCurrency === 'USD') {
            return usdAmount;
          }

          const stored = this.pickStoredAmount(normalizedCurrency, {
            usd: usdAmount,
            sar: storedSar,
            yer: storedYer,
          });

          if (stored !== undefined) {
            return stored;
          }

          if (usdAmount === undefined || usdAmount === null || !rates) {
            return undefined;
          }

          const converted = this.convertUsdAmount(usdAmount, normalizedCurrency, rates);
          return converted.value;
        };

        const compareAtPrice = resolveAdditionalPrice(
          variant.compareAtPriceUSD,
          variant.compareAtPriceSAR,
          variant.compareAtPriceYER,
        );
        const costPrice = resolveAdditionalPrice(
          variant.costPriceUSD,
          variant.costPriceSAR,
          variant.costPriceYER,
        );

        const discountAmount =
          discountPercent > 0 ? basePrice * (discountPercent / 100) : 0;
        const finalPrice = this.calculatePriceWithDiscount(basePrice, discountPercent);

        let formattedFinalPrice: string | undefined;
        if (formattedPrice) {
          formattedFinalPrice = formattedPrice.replace(
            basePrice.toFixed(2),
            finalPrice.toFixed(2),
          );
        }

        const variantId =
          typeof variant._id === 'string'
            ? variant._id
            : (variant._id as Types.ObjectId).toString();

        return {
          variantId,
          basePrice,
          compareAtPrice,
          costPrice,
          discountPercent,
          discountAmount,
          finalPrice,
          currency: normalizedCurrency,
          exchangeRate,
          formattedPrice,
          formattedFinalPrice,
        };
      });
    } catch (error) {
      this.logger.error(`Error converting product prices with discount for ${productId}:`, error);
      throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, { productId, error: error instanceof Error ? error.message : String(error) });
    }
  }

  async getProductPricesWithDiscountByCurrencies(
    productId: string,
    currencies: string[] = ['USD'],
    discountPercent: number = 0,
    options: { variants?: VariantPricingSnapshot[] } = {},
  ): Promise<Record<string, PriceWithDiscountAndVariantId[]>> {
    if (!currencies || currencies.length === 0) {
      return {};
    }

    const normalizedCurrencies = Array.from(
      new Set(
        currencies
          .filter((currency): currency is string => typeof currency === 'string' && currency.trim().length > 0)
          .map(currency => currency.toUpperCase()),
      ),
    );

    if (normalizedCurrencies.length === 0) {
      return {};
    }

    const variants =
      options.variants ??
      (await this.variantModel
        .find({ productId, deletedAt: null, isActive: true })
        .select(
          '_id basePriceUSD basePriceSAR basePriceYER compareAtPriceUSD compareAtPriceSAR compareAtPriceYER costPriceUSD costPriceSAR costPriceYER',
        )
        .lean());

    if (!variants || variants.length === 0) {
      return normalizedCurrencies.reduce<Record<string, PriceWithDiscountAndVariantId[]>>((acc, currencyCode) => {
        acc[currencyCode] = [];
        return acc;
      }, {});
    }

    const entries = await Promise.all(
      normalizedCurrencies.map(async (currencyCode) => {
        const prices = await this.getProductPricesWithDiscount(
          productId,
          currencyCode,
          discountPercent,
          { variants },
        );
        return [currencyCode, prices] as const;
      }),
    );

    return Object.fromEntries(entries) as Record<string, PriceWithDiscountAndVariantId[]>;
  }

  async getSimpleProductPricingByCurrencies(
    basePriceUSD: number = 0,
    compareAtPriceUSD?: number,
    costPriceUSD?: number,
    currencies: string[] = ['USD'],
    discountPercent: number = 0,
    derived?: {
      basePriceSAR?: number;
      basePriceYER?: number;
      compareAtPriceSAR?: number;
      compareAtPriceYER?: number;
      costPriceSAR?: number;
      costPriceYER?: number;
      exchangeRateVersion?: string;
      lastExchangeRateSyncAt?: Date | string;
    },
  ): Promise<Record<string, PriceWithDiscount>> {
    if (!currencies || currencies.length === 0) {
      return {};
    }

    const normalizedCurrencies = Array.from(
      new Set(
        currencies
          .filter(
            (currency): currency is string =>
              typeof currency === 'string' && currency.trim().length > 0,
          )
          .map((currency) => currency.toUpperCase()),
      ),
    );

    if (normalizedCurrencies.length === 0) {
      return {};
    }

    const derivedValues = derived ?? {};

    const needsConversion = normalizedCurrencies.some((currencyCode) => {
      if (currencyCode === 'USD') {
        return false;
      }

      const hasBaseStored = this.hasStoredAmount(currencyCode, {
        sar: derivedValues.basePriceSAR,
        yer: derivedValues.basePriceYER,
      });

      const hasCompareStored =
        compareAtPriceUSD === undefined
          ? true
          : this.hasStoredAmount(currencyCode, {
              sar: derivedValues.compareAtPriceSAR,
              yer: derivedValues.compareAtPriceYER,
            });

      const hasCostStored =
        costPriceUSD === undefined
          ? true
          : this.hasStoredAmount(currencyCode, {
              sar: derivedValues.costPriceSAR,
              yer: derivedValues.costPriceYER,
            });

      return !(hasBaseStored && hasCompareStored && hasCostStored);
    });

    const rates = needsConversion ? await this.exchangeRatesService.getCurrentRates() : undefined;
    const results: Record<string, PriceWithDiscount> = {};

    await Promise.all(
      normalizedCurrencies.map(async (currencyCode) => {
        let basePrice = basePriceUSD;
        let compareAtPrice = compareAtPriceUSD;
        let costPrice = costPriceUSD;
        let exchangeRate: number | undefined;
        let formattedPrice: string | undefined;

        if (currencyCode !== 'USD') {
          const storedBase = this.pickStoredAmount(currencyCode, {
            usd: basePriceUSD,
            sar: derivedValues.basePriceSAR,
            yer: derivedValues.basePriceYER,
          });

          if (storedBase !== undefined) {
            basePrice = storedBase;
            exchangeRate = this.computeStoredExchangeRate(
              currencyCode,
              basePriceUSD,
              storedBase,
            );
            formattedPrice = this.formatStoredPrice(currencyCode, storedBase);
          } else if (rates) {
            try {
              const baseConverted = this.convertUsdAmount(
                basePriceUSD,
                currencyCode,
                rates,
              );
              basePrice = baseConverted.value ?? 0;
              exchangeRate = baseConverted.rate;
              formattedPrice =
                baseConverted.formatted ?? this.formatStoredPrice(currencyCode, basePrice);
            } catch (error) {
              this.logger.error(
                `Error converting simple product base price to ${currencyCode}:`,
                error,
              );
              throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, {
                error: error instanceof Error ? error.message : String(error),
              });
            }
          } else {
            basePrice = 0;
          }

          const resolveAdditionalPrice = (
            usdAmount?: number,
            storedSar?: number,
            storedYer?: number,
          ): number | undefined => {
            const stored = this.pickStoredAmount(currencyCode, {
              usd: usdAmount,
              sar: storedSar,
              yer: storedYer,
            });

            if (stored !== undefined) {
              return stored;
            }

            if (usdAmount === undefined || usdAmount === null) {
              return undefined;
            }

            if (!rates) {
              throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, {
                error: 'Missing exchange rates snapshot',
              });
            }

            const converted = this.convertUsdAmount(usdAmount, currencyCode, rates);
            return converted.value;
          };

          if (compareAtPriceUSD !== undefined) {
            compareAtPrice = resolveAdditionalPrice(
              compareAtPriceUSD,
              derivedValues.compareAtPriceSAR,
              derivedValues.compareAtPriceYER,
            );
          }

          if (costPriceUSD !== undefined) {
            costPrice = resolveAdditionalPrice(
              costPriceUSD,
              derivedValues.costPriceSAR,
              derivedValues.costPriceYER,
            );
          }
        }

        const discountAmount = discountPercent > 0 ? basePrice * (discountPercent / 100) : 0;
        const finalPrice = this.calculatePriceWithDiscount(basePrice, discountPercent);
        let formattedFinalPrice: string | undefined;

        if (formattedPrice) {
          formattedFinalPrice = formattedPrice.replace(
            basePrice.toFixed(2),
            finalPrice.toFixed(2),
          );
        }

        results[currencyCode] = {
          basePrice,
          compareAtPrice,
          costPrice,
          discountPercent,
          discountAmount,
          finalPrice,
          currency: currencyCode,
          exchangeRate,
          formattedPrice,
          formattedFinalPrice,
        };
      }),
    );

    return results;
  }

  private convertUsdAmount(
    amount: number | undefined,
    currency: string,
    rates: ExchangeRate,
  ): { value?: number; formatted?: string; rate?: number } {
    if (amount === undefined || amount === null) {
      return { value: undefined, formatted: undefined, rate: undefined };
    }

    const conversion = this.exchangeRatesService.calculateConversionWithRates(
      {
        amount,
        fromCurrency: 'USD',
        toCurrency: currency,
      },
      rates,
    );

    return {
      value: conversion.result,
      formatted: conversion.formatted,
      rate: conversion.rate,
    };
  }
}
