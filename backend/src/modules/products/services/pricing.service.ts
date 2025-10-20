import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Variant } from '../schemas/variant.schema';
import { AppException } from '../../../shared/exceptions/app.exception';
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';

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
      throw new AppException('VARIANT_NOT_FOUND', 'المتغير غير موجود', null, 404);
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
      throw new AppException('PRICE_CONVERSION_ERROR', 'خطأ في تحويل السعر', null, 500);
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
      throw new AppException('PRICE_CONVERSION_ERROR', 'خطأ في تحويل أسعار المنتج', null, 500);
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
      throw new AppException('PRICE_CONVERSION_ERROR', 'خطأ في تحويل نطاق السعر', null, 500);
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
      throw new AppException('VARIANT_NOT_FOUND', 'المتغير غير موجود', null, 404);
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
}
