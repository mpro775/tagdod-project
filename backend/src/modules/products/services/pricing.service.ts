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
  compareAtPriceUSD?: number;
  costPriceUSD?: number;
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

    if (currency === 'USD') {
      return {
        basePrice: variant.basePriceUSD,
        compareAtPrice: variant.compareAtPriceUSD,
        costPrice: variant.costPriceUSD,
        currency: 'USD',
      };
    }

    try {
      // تحويل السعر الأساسي
      const basePriceConverted = await this.exchangeRatesService.convertCurrency({
        amount: variant.basePriceUSD,
        fromCurrency: 'USD',
        toCurrency: currency,
      });

      // تحويل السعر المقارن إذا كان موجوداً
      let compareAtPriceConverted;
      if (variant.compareAtPriceUSD) {
        compareAtPriceConverted = await this.exchangeRatesService.convertCurrency({
          amount: variant.compareAtPriceUSD,
          fromCurrency: 'USD',
          toCurrency: currency,
        });
      }

      // تحويل سعر التكلفة إذا كان موجوداً
      let costPriceConverted;
      if (variant.costPriceUSD) {
        costPriceConverted = await this.exchangeRatesService.convertCurrency({
          amount: variant.costPriceUSD,
          fromCurrency: 'USD',
          toCurrency: currency,
        });
      }

      return {
        basePrice: basePriceConverted.result,
        compareAtPrice: compareAtPriceConverted?.result,
        costPrice: costPriceConverted?.result,
        currency,
        exchangeRate: basePriceConverted.rate,
        formattedPrice: basePriceConverted.formatted,
      };
    } catch (error) {
      this.logger.error(`Error converting prices for variant ${variantId}:`, error);
      throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, { variantId, error: error instanceof Error ? error.message : String(error) });
    }
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
      .select('_id basePriceUSD compareAtPriceUSD costPriceUSD')
      .lean();

    if (currency === 'USD') {
      return variants.map(variant => ({
        variantId: variant._id.toString(),
        basePrice: variant.basePriceUSD,
        compareAtPrice: variant.compareAtPriceUSD,
        costPrice: variant.costPriceUSD,
        currency: 'USD',
      }));
    }

    try {
      const convertedPrices = await Promise.all(
        variants.map(async (variant) => {
          const converted = await this.exchangeRatesService.convertCurrency({
            amount: variant.basePriceUSD,
            fromCurrency: 'USD',
            toCurrency: currency,
          });

          let compareAtPriceConverted;
          if (variant.compareAtPriceUSD) {
            compareAtPriceConverted = await this.exchangeRatesService.convertCurrency({
              amount: variant.compareAtPriceUSD,
              fromCurrency: 'USD',
              toCurrency: currency,
            });
          }

          let costPriceConverted;
          if (variant.costPriceUSD) {
            costPriceConverted = await this.exchangeRatesService.convertCurrency({
              amount: variant.costPriceUSD,
              fromCurrency: 'USD',
              toCurrency: currency,
            });
          }

          return {
            variantId: variant._id.toString(),
            basePrice: converted.result,
            compareAtPrice: compareAtPriceConverted?.result,
            costPrice: costPriceConverted?.result,
            currency,
            exchangeRate: converted.rate,
            formattedPrice: converted.formatted,
          };
        })
      );

      return convertedPrices;
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
      .select('basePriceUSD')
      .lean();

    if (variants.length === 0) {
      return { minPrice: 0, maxPrice: 0, currency };
    }

    const prices = variants.map(v => v.basePriceUSD);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (currency === 'USD') {
      return { minPrice, maxPrice, currency };
    }

    try {
      const [minConverted, maxConverted] = await Promise.all([
        this.exchangeRatesService.convertCurrency({
          amount: minPrice,
          fromCurrency: 'USD',
          toCurrency: currency,
        }),
        this.exchangeRatesService.convertCurrency({
          amount: maxPrice,
          fromCurrency: 'USD',
          toCurrency: currency,
        }),
      ]);

      return {
        minPrice: minConverted.result,
        maxPrice: maxConverted.result,
        currency,
        formattedMinPrice: minConverted.formatted,
        formattedMaxPrice: maxConverted.formatted,
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
        .select('_id basePriceUSD compareAtPriceUSD costPriceUSD')
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
      const pricesWithDiscount = await Promise.all(
        variants.map(async (variant) => {
          const converted = await this.exchangeRatesService.convertCurrency({
            amount: variant.basePriceUSD,
            fromCurrency: 'USD',
            toCurrency: normalizedCurrency,
          });

          let compareAtPriceConverted;
          if (variant.compareAtPriceUSD) {
            compareAtPriceConverted = await this.exchangeRatesService.convertCurrency({
              amount: variant.compareAtPriceUSD,
              fromCurrency: 'USD',
              toCurrency: normalizedCurrency,
            });
          }

          let costPriceConverted;
          if (variant.costPriceUSD) {
            costPriceConverted = await this.exchangeRatesService.convertCurrency({
              amount: variant.costPriceUSD,
              fromCurrency: 'USD',
              toCurrency: normalizedCurrency,
            });
          }

          const basePrice = converted.result;
          const discountAmount = discountPercent > 0 
            ? basePrice * (discountPercent / 100)
            : 0;
          const finalPrice = this.calculatePriceWithDiscount(basePrice, discountPercent);

          // تنسيق السعر النهائي
          const formattedFinalPrice = converted.formatted.replace(
            basePrice.toFixed(2),
            finalPrice.toFixed(2)
          );

          return {
            variantId: variant._id.toString(),
            basePrice,
            compareAtPrice: compareAtPriceConverted?.result,
            costPrice: costPriceConverted?.result,
            discountPercent,
            discountAmount,
            finalPrice,
            currency: normalizedCurrency,
            exchangeRate: converted.rate,
            formattedPrice: converted.formatted,
            formattedFinalPrice,
          };
        })
      );

      return pricesWithDiscount;
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
        .select('_id basePriceUSD compareAtPriceUSD costPriceUSD')
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
  ): Promise<Record<string, PriceWithDiscount>> {
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

    const results: Record<string, PriceWithDiscount> = {};

    await Promise.all(
      normalizedCurrencies.map(async (currency) => {
        let basePrice = basePriceUSD;
        let compareAtPrice = compareAtPriceUSD;
        let costPrice = costPriceUSD;
        let exchangeRate: number | undefined;
        let formattedPrice: string | undefined;

        if (currency !== 'USD') {
          try {
            const baseConverted = await this.exchangeRatesService.convertCurrency({
              amount: basePriceUSD,
              fromCurrency: 'USD',
              toCurrency: currency,
            });
            basePrice = baseConverted.result;
            exchangeRate = baseConverted.rate;
            formattedPrice = baseConverted.formatted;

            if (compareAtPriceUSD !== undefined) {
              const compareConverted = await this.exchangeRatesService.convertCurrency({
                amount: compareAtPriceUSD,
                fromCurrency: 'USD',
                toCurrency: currency,
              });
              compareAtPrice = compareConverted.result;
            }

            if (costPriceUSD !== undefined) {
              const costConverted = await this.exchangeRatesService.convertCurrency({
                amount: costPriceUSD,
                fromCurrency: 'USD',
                toCurrency: currency,
              });
              costPrice = costConverted.result;
            }
          } catch (error) {
            this.logger.error(
              `Error converting simple product prices to ${currency}:`,
              error,
            );
            throw new ProductException(ErrorCode.PRODUCT_INVALID_PRICE, {
              error: error instanceof Error ? error.message : String(error),
            });
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

        results[currency] = {
          basePrice,
          compareAtPrice,
          costPrice,
          discountPercent,
          discountAmount,
          finalPrice,
          currency,
          exchangeRate,
          formattedPrice,
          formattedFinalPrice,
        };
      }),
    );

    return results;
  }
}
