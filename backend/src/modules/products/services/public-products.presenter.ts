import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PriceWithDiscount,
  PriceWithDiscountAndVariantId,
  PricingService,
} from './pricing.service';
import { VariantService } from './variant.service';
import { AttributesService } from '../../attributes/attributes.service';
import { AttributeValue } from '../../attributes/schemas/attribute-value.schema';
import { ProductService } from './product.service';
import { User } from '../../users/schemas/user.schema';
import { Capabilities } from '../../capabilities/schemas/capabilities.schema';

export type WithId = { _id: Types.ObjectId | string };

export type AttributeSummary = {
  id: string;
  name: string;
  nameEn: string;
  values: Array<{
    id: string;
    value: string;
    valueEn?: string;
    hexCode?: string;
  }>;
};

type AnyRecord = Record<string, unknown>;

export type RelatedProductPayload = AnyRecord & {
  attributesDetails: AttributeSummary[];
  variants: Array<AnyRecord>;
  pricingByCurrency?: Record<string, PriceWithDiscount>;
  priceRangeByCurrency?: Record<
    string,
    {
      minPrice: number;
      maxPrice: number;
      currency: string;
      hasDiscountedVariant: boolean;
    }
  >;
  defaultPricing?: PriceWithDiscount | null;
};

type VariantPricingInput = {
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
export class PublicProductsPresenter {
  private readonly logger = new Logger(PublicProductsPresenter.name);
  private readonly BASE_PRICING_CURRENCIES = ['USD', 'YER', 'SAR'] as const;
  private readonly ATTRIBUTE_SUMMARY_TTL_MS = 5 * 60 * 1000;
  private readonly attributeSummaryCache = new Map<
    string,
    { summary: AttributeSummary; expiresAt: number }
  >();

  constructor(
    private productService: ProductService,
    private variantService: VariantService,
    private pricingService: PricingService,
    private attributesService: AttributesService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capabilities.name) private capabilitiesModel: Model<Capabilities>,
  ) {}

  get basePricingCurrencies(): readonly string[] {
    return this.BASE_PRICING_CURRENCIES;
  }

  normalizeCurrency(currency?: string): string {
    if (!currency || typeof currency !== 'string') {
      return 'USD';
    }

    const trimmed = currency.trim();
    return trimmed.length === 0 ? 'USD' : trimmed.toUpperCase();
  }

  /**
   * Adds isAvailable and stockStatus to all variants (does not filter)
   * Used for product details and variants list endpoints
   */
  filterVariantsWithStock(variants: Array<WithId & AnyRecord>): Array<WithId & AnyRecord> {
    if (!Array.isArray(variants) || variants.length === 0) {
      return [];
    }

    // إرجاع جميع المتغيرات مع إضافة isAvailable و stockStatus
    return variants.map((variant) => {
      const stock = this.normalizePrice(variant.stock) ?? 0;
      const isActive = variant.isActive !== false;
      const isAvailable = stock > 0 && isActive;
      const stockStatus = isAvailable ? 'in_stock' : 'out_of_stock';

      return {
        ...variant,
        isAvailable,
        stockStatus,
        stock, // التأكد من إرجاع الكمية
      };
    });
  }

  /**
   * Filters out variants with stock/quantity 0 (for product lists only)
   */
  filterVariantsWithStockOnly(variants: Array<WithId & AnyRecord>): Array<WithId & AnyRecord> {
    if (!Array.isArray(variants) || variants.length === 0) {
      return [];
    }

    return variants.filter((variant) => {
      const stock = this.normalizePrice(variant.stock);
      return stock !== undefined && stock > 0;
    });
  }

  async getUserMerchantDiscount(userId?: string): Promise<number> {
    if (!userId) {
      return 0;
    }

    try {
      const caps = await this.capabilitiesModel.findOne({ userId }).lean();
      if (
        caps &&
        caps.merchant_capable &&
        caps.merchant_status === 'approved' &&
        caps.merchant_discount_percent > 0
      ) {
        return caps.merchant_discount_percent;
      }

      const user = await this.userModel.findById(userId).lean();
      if (
        user &&
        user.merchant_capable &&
        user.merchant_status === 'approved' &&
        user.merchant_discount_percent > 0
      ) {
        return user.merchant_discount_percent;
      }
    } catch (error) {
      this.logger.error('Error fetching user merchant discount:', error);
    }

    return 0;
  }

  stripVariantId(price?: PriceWithDiscountAndVariantId | null): PriceWithDiscount | null {
    if (!price) {
      return null;
    }

    const { variantId, formattedPrice, formattedFinalPrice, ...rest } = price;
    void variantId;
    void formattedPrice;
    void formattedFinalPrice;
    return rest;
  }

  extractIdString(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;

      if (record._id) {
        const innerId = record._id;
        if (typeof innerId === 'string') {
          return innerId;
        }
        if (innerId && typeof (innerId as { toString: () => string }).toString === 'function') {
          const converted = (innerId as { toString: () => string }).toString();
          return converted === '[object Object]' ? null : converted;
        }
      }

      if (typeof (record as { toString?: () => string }).toString === 'function') {
        const converted = (record as { toString: () => string }).toString();
        return converted === '[object Object]' ? null : converted;
      }
    }

    return null;
  }

  private async getAttributeSummaries(attributeIds: unknown[]): Promise<AttributeSummary[]> {
    if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(
      new Set(
        attributeIds
          .map((id) => this.extractIdString(id))
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (uniqueIds.length === 0) {
      return [];
    }

    const now = Date.now();
    const cachedSummaries: AttributeSummary[] = [];
    const missingIds: string[] = [];

    uniqueIds.forEach((attributeId) => {
      const cached = this.attributeSummaryCache.get(attributeId);
      if (cached && cached.expiresAt > now) {
        cachedSummaries.push(cached.summary);
      } else {
        if (cached) {
          this.attributeSummaryCache.delete(attributeId);
        }
        missingIds.push(attributeId);
      }
    });

    let fetchedSummaries: AttributeSummary[] = [];

    if (missingIds.length > 0) {
      try {
        const attributes = await this.attributesService.getAttributesWithValues(missingIds);

        fetchedSummaries = attributes.map((attributeRecord) => {
          const attributeRecordWithId = attributeRecord as {
            _id?: unknown;
            name?: unknown;
            nameEn?: unknown;
            type?: unknown;
            values?: AttributeValue[];
          };

          const candidateId = this.extractIdString(attributeRecordWithId._id);
          const id =
            candidateId ??
            missingIds.find((missingId) => missingId === String(attributeRecordWithId._id)) ??
            '';

          const attributeType = attributeRecordWithId.type as string | undefined;
          const isColorAttribute = attributeType === 'color';

          const values =
            attributeRecordWithId.values?.map((valueRecord) => {
              const valueRecordWithId = valueRecord as {
                _id?: unknown;
                value?: unknown;
                valueEn?: unknown;
                hexCode?: unknown;
              };

              const valueId = this.extractIdString(valueRecordWithId._id) ?? '';
              const value = (valueRecordWithId.value as string | undefined) ?? '';
              const valueEn = (valueRecordWithId.valueEn as string | undefined) ?? value;

              const result: {
                id: string;
                value: string;
                valueEn?: string;
                hexCode?: string;
              } = {
                id: valueId,
                value,
                valueEn,
              };

              if (isColorAttribute && valueRecordWithId.hexCode) {
                result.hexCode = valueRecordWithId.hexCode as string;
              }

              return result;
            }) ?? [];

          return {
            id,
            name: (attributeRecordWithId.name as string) ?? '',
            nameEn: (attributeRecordWithId.nameEn as string) ?? '',
            values,
          } as AttributeSummary;
        });

        fetchedSummaries.forEach((summary) => {
          if (!summary.id) {
            return;
          }
          this.attributeSummaryCache.set(summary.id, {
            summary,
            expiresAt: now + this.ATTRIBUTE_SUMMARY_TTL_MS,
          });
        });
      } catch (error) {
        this.logger.warn(
          `Failed to load attributes ${missingIds.join(', ')}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    const summariesById = new Map<string, AttributeSummary>();
    [...cachedSummaries, ...fetchedSummaries].forEach((summary) => {
      if (summary.id) {
        summariesById.set(summary.id, summary);
      }
    });

    return uniqueIds
      .map((attributeId) => summariesById.get(attributeId))
      .filter((summary): summary is AttributeSummary => Boolean(summary));
  }

  private normalizePrice(value: unknown): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private hasSimplePricing(product: AnyRecord): boolean {
    const basePrice = this.normalizePrice(product.basePriceUSD ?? product.basePrice);
    const compareAtPrice = this.normalizePrice(product.compareAtPriceUSD ?? product.compareAtPrice);
    const costPrice = this.normalizePrice(product.costPriceUSD ?? product.costPrice);

    return basePrice !== undefined || compareAtPrice !== undefined || costPrice !== undefined;
  }

  private buildSimpleProductDerivedPricing(product: AnyRecord): {
    basePriceSAR?: number;
    basePriceYER?: number;
    compareAtPriceSAR?: number;
    compareAtPriceYER?: number;
    costPriceSAR?: number;
    costPriceYER?: number;
    exchangeRateVersion?: string;
    lastExchangeRateSyncAt?: Date | string;
  } {
    return {
      basePriceSAR: this.normalizePrice(product.basePriceSAR),
      basePriceYER: this.normalizePrice(product.basePriceYER),
      compareAtPriceSAR: this.normalizePrice(product.compareAtPriceSAR),
      compareAtPriceYER: this.normalizePrice(product.compareAtPriceYER),
      costPriceSAR: this.normalizePrice(product.costPriceSAR),
      costPriceYER: this.normalizePrice(product.costPriceYER),
      exchangeRateVersion: product.exchangeRateVersion as string | undefined,
      lastExchangeRateSyncAt: product.lastExchangeRateSyncAt as Date | string | undefined,
    };
  }

  private summarizeCurrencyPricing(
    pricesByCurrency: Record<string, PriceWithDiscountAndVariantId[]>,
  ): Record<string, PriceWithDiscount | null> {
    const summary: Record<string, PriceWithDiscount | null> = {};

    for (const [currency, prices] of Object.entries(pricesByCurrency)) {
      if (!prices || prices.length === 0) {
        summary[currency] = null;
        continue;
      }

      const bestPrice = prices.reduce((best, current) => {
        const bestValue = best.finalPrice ?? best.basePrice;
        const currentValue = current.finalPrice ?? current.basePrice;
        return currentValue < bestValue ? current : best;
      }, prices[0]);

      summary[currency] = this.stripVariantId(bestPrice);
    }

    return summary;
  }

  private computePriceRangeByCurrency(
    pricesByCurrency: Record<string, PriceWithDiscountAndVariantId[]>,
  ): Record<
    string,
    {
      minPrice: number;
      maxPrice: number;
      currency: string;
      hasDiscountedVariant: boolean;
    }
  > {
    const summary: Record<
      string,
      { minPrice: number; maxPrice: number; currency: string; hasDiscountedVariant: boolean }
    > = {};

    Object.entries(pricesByCurrency).forEach(([currency, prices]) => {
      if (!prices || prices.length === 0) {
        return;
      }

      let minPrice = Number.POSITIVE_INFINITY;
      let maxPrice = Number.NEGATIVE_INFINITY;
      let hasDiscount = false;

      prices.forEach((price) => {
        const finalPrice = price.finalPrice ?? price.basePrice;
        if (finalPrice < minPrice) {
          minPrice = finalPrice;
        }
        if (finalPrice > maxPrice) {
          maxPrice = finalPrice;
        }
        if (price.discountPercent > 0) {
          hasDiscount = true;
        }
      });

      summary[currency] = {
        minPrice: Number.isFinite(minPrice) ? minPrice : 0,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : 0,
        currency,
        hasDiscountedVariant: hasDiscount,
      };
    });

    return summary;
  }

  private cleanPrice(price?: PriceWithDiscount | null): PriceWithDiscount | null {
    if (!price) {
      return null;
    }

    const { formattedPrice, formattedFinalPrice, ...rest } = price;
    void formattedPrice;
    void formattedFinalPrice;

    return rest;
  }

  private cleanPricingMap(
    map?: Record<string, PriceWithDiscount | null>,
  ): Record<string, PriceWithDiscount | null> | undefined {
    if (!map) {
      return undefined;
    }

    const entries = Object.entries(map)
      .map(([currency, value]) => {
        const cleaned = this.cleanPrice(value);
        return cleaned ? [currency, cleaned] : null;
      })
      .filter((entry): entry is [string, PriceWithDiscount] => entry !== null);

    if (entries.length === 0) {
      return undefined;
    }

    return Object.fromEntries(entries);
  }

  private simplifyCategory(category: unknown): AnyRecord | undefined {
    if (!category || typeof category !== 'object') {
      return undefined;
    }

    const record = category as AnyRecord;
    const id = this.extractIdString(record._id) ?? record._id;

    if (!id && !record.name && !record.nameEn) {
      return undefined;
    }

    return {
      ...(id ? { _id: id } : {}),
      ...(record.name ? { name: record.name } : {}),
      ...(record.nameEn ? { nameEn: record.nameEn } : {}),
    };
  }

  private simplifyBrand(brand: unknown): AnyRecord | undefined {
    if (!brand || typeof brand !== 'object') {
      return undefined;
    }

    const record = brand as AnyRecord;
    const id = this.extractIdString(record._id) ?? record._id;

    if (!id && !record.name && !record.nameEn) {
      return undefined;
    }

    return {
      ...(id ? { _id: id } : {}),
      ...(record.name ? { name: record.name } : {}),
      ...(record.nameEn ? { nameEn: record.nameEn } : {}),
    };
  }

  private simplifyMedia(media: unknown): AnyRecord | undefined {
    if (!media || typeof media !== 'object') {
      return undefined;
    }

    const record = media as AnyRecord;
    const url = typeof record.url === 'string' ? record.url : undefined;

    if (!url) {
      return undefined;
    }

    const id = this.extractIdString(record._id) ?? record._id;

    return {
      ...(id ? { _id: id } : {}),
      url,
    };
  }

  private simplifyMediaList(list: unknown): AnyRecord[] {
    if (!Array.isArray(list)) {
      return [];
    }

    return list
      .map((item) => this.simplifyMedia(item))
      .filter((item): item is AnyRecord => Boolean(item));
  }

  private sanitizeVariant(rawVariant: AnyRecord): AnyRecord {
    const variantId =
      this.extractIdString(rawVariant._id) ??
      this.extractIdString(rawVariant.id) ??
      rawVariant._id ??
      rawVariant.id;

    const attributeValues = Array.isArray(rawVariant.attributeValues)
      ? rawVariant.attributeValues.map((value) => {
          const attributeValue = value as AnyRecord;

          return {
            ...(this.extractIdString(attributeValue.attributeId)
              ? { attributeId: this.extractIdString(attributeValue.attributeId) }
              : attributeValue.attributeId
                ? { attributeId: attributeValue.attributeId }
                : {}),
            ...(this.extractIdString(attributeValue.valueId)
              ? { valueId: this.extractIdString(attributeValue.valueId) }
              : attributeValue.valueId
                ? { valueId: attributeValue.valueId }
                : {}),
            ...(attributeValue.name ? { name: attributeValue.name } : {}),
            ...(attributeValue.nameEn ? { nameEn: attributeValue.nameEn } : {}),
            ...(attributeValue.value ? { value: attributeValue.value } : {}),
            ...(attributeValue.valueEn ? { valueEn: attributeValue.valueEn } : {}),
          };
        })
      : [];

    const pricingByCurrency = rawVariant.pricingByCurrency;

    const sanitized: AnyRecord = {
      ...(variantId ? { _id: variantId } : {}),
      ...(attributeValues.length > 0 ? { attributeValues } : {}),
      ...(typeof rawVariant.isActive === 'boolean' ? { isActive: rawVariant.isActive } : {}),
      ...(typeof rawVariant.isAvailable === 'boolean'
        ? { isAvailable: rawVariant.isAvailable }
        : {}),
      ...(rawVariant.stockStatus ? { stockStatus: rawVariant.stockStatus } : {}),
      ...(typeof rawVariant.stock === 'number' ? { stock: rawVariant.stock } : {}),
      // إرجاع القيم الافتراضية إذا كانت undefined (للـ variants القديمة)
      minOrderQuantity:
        typeof rawVariant.minOrderQuantity === 'number' && !isNaN(rawVariant.minOrderQuantity)
          ? rawVariant.minOrderQuantity
          : 1,
      maxOrderQuantity:
        typeof rawVariant.maxOrderQuantity === 'number' && !isNaN(rawVariant.maxOrderQuantity)
          ? rawVariant.maxOrderQuantity
          : 0,
      ...(typeof rawVariant.salesCount === 'number' ? { salesCount: rawVariant.salesCount } : {}),
    };

    if (pricingByCurrency && typeof pricingByCurrency === 'object') {
      const cleaned = this.cleanPricingMap(
        pricingByCurrency as Record<string, PriceWithDiscount | null>,
      );
      if (cleaned) {
        sanitized.pricingByCurrency = cleaned;
      }
    }

    return sanitized;
  }

  private buildSimplifiedProduct(
    product: AnyRecord,
    extras: {
      variants?: Array<AnyRecord>;
      pricingByCurrency?: Record<string, PriceWithDiscount | null>;
      defaultPricing?: PriceWithDiscount | null;
      priceRangeByCurrency?: Record<
        string,
        { minPrice: number; maxPrice: number; currency: string; hasDiscountedVariant: boolean }
      >;
      hasVariants?: boolean;
      includeImages?: boolean;
      includeCategory?: boolean;
      includeBrand?: boolean;
      includeAttributes?: boolean;
      includeVariants?: boolean;
      includePricingByCurrency?: boolean;
      includePriceRange?: boolean;
      includeDefaultPricing?: boolean;
      includeDescriptions?: boolean;
    } = {},
  ): AnyRecord {
    const productId = this.extractIdString(product._id) ?? product._id;
    const category = this.simplifyCategory(product.category ?? product.categoryId);
    const brand = this.simplifyBrand(product.brand ?? product.brandId);
    let mainImage = this.simplifyMedia(product.mainImage ?? product.mainImageId);
    const images = this.simplifyMediaList(product.images ?? product.imageIds);

    // إذا لم توجد صورة رئيسية وكانت هناك صور، استخدم أول صورة كصورة رئيسية
    if (!mainImage && images.length > 0) {
      mainImage = images[0];
    }

    const pricingMap = extras.pricingByCurrency
      ? Object.fromEntries(
          Object.entries(extras.pricingByCurrency).filter(
            ([, value]) => value !== null && value !== undefined,
          ),
        )
      : undefined;

    const cleanedPricingByCurrency = this.cleanPricingMap(pricingMap);

    const includeVariants = extras.includeVariants ?? true;
    const variants =
      includeVariants && Array.isArray(extras.variants)
        ? extras.variants.map((variant) => this.sanitizeVariant(variant))
        : [];

    const hasVariants =
      extras.hasVariants ??
      (Array.isArray(product.variants) && product.variants.length > 0) ??
      variants.length > 0;

    const includeAttributes = extras.includeAttributes ?? true;
    const attributes =
      includeAttributes && Array.isArray(product.attributes) ? product.attributes : [];

    const includeDescriptions = extras.includeDescriptions ?? false;

    const includeCategory = extras.includeCategory ?? true;
    const includeBrand = extras.includeBrand ?? true;
    const includeImages = extras.includeImages ?? true;
    const includePricingByCurrency = extras.includePricingByCurrency ?? true;
    const includePriceRange = extras.includePriceRange ?? true;
    const includeDefaultPricing = extras.includeDefaultPricing ?? true;

    const sanitized: AnyRecord = {
      ...(productId ? { _id: productId } : {}),
      ...(product.name ? { name: product.name } : {}),
      ...(product.nameEn ? { nameEn: product.nameEn } : {}),
      ...(product.status ? { status: product.status } : {}),
      ...(includeDescriptions && product.description ? { description: product.description } : {}),
      ...(includeDescriptions && product.descriptionEn
        ? { descriptionEn: product.descriptionEn }
        : {}),
      ...(includeCategory && category ? { category } : {}),
      ...(includeBrand && brand ? { brand } : {}),
      ...(mainImage ? { mainImage } : {}),
      ...(includeImages && images.length > 0 ? { images } : {}),
      ...(attributes.length > 0 ? { attributes } : {}),
      ...(typeof product.isActive === 'boolean' ? { isActive: product.isActive } : {}),
      ...(typeof product.isFeatured === 'boolean' ? { isFeatured: product.isFeatured } : {}),
      ...(typeof product.isNew === 'boolean' ? { isNew: product.isNew } : {}),
      ...(typeof product.isBestseller === 'boolean' ? { isBestseller: product.isBestseller } : {}),
      ...(typeof product.useManualRating === 'boolean'
        ? { useManualRating: product.useManualRating }
        : {}),
      ...(typeof product.manualRating === 'number' ? { manualRating: product.manualRating } : {}),
      ...(typeof product.manualReviewsCount === 'number'
        ? { manualReviewsCount: product.manualReviewsCount }
        : {}),
      ...(typeof product.averageRating === 'number'
        ? { averageRating: product.averageRating }
        : {}),
      ...(typeof product.reviewsCount === 'number' ? { reviewsCount: product.reviewsCount } : {}),
      ...(typeof product.salesCount === 'number' ? { salesCount: product.salesCount } : {}),
      ...(typeof product.isAvailable === 'boolean' ? { isAvailable: product.isAvailable } : {}),
      // إرجاع القيم الافتراضية إذا كانت undefined (للمنتجات القديمة)
      minOrderQuantity:
        typeof product.minOrderQuantity === 'number' && !isNaN(product.minOrderQuantity)
          ? product.minOrderQuantity
          : 1,
      maxOrderQuantity:
        typeof product.maxOrderQuantity === 'number' && !isNaN(product.maxOrderQuantity)
          ? product.maxOrderQuantity
          : 0,
      ...(typeof product.stock === 'number' ? { stock: product.stock } : {}),
      ...(includePricingByCurrency
        ? cleanedPricingByCurrency
          ? { pricingByCurrency: cleanedPricingByCurrency }
          : { pricingByCurrency: {} }
        : {}),
      ...(includeDefaultPricing && extras.defaultPricing
        ? { defaultPricing: this.cleanPrice(extras.defaultPricing) }
        : {}),
      ...(includePriceRange && extras.priceRangeByCurrency
        ? { priceRangeByCurrency: extras.priceRangeByCurrency }
        : {}),
      ...(includeVariants && variants.length > 0 ? { variants } : {}),
      hasVariants: Boolean(hasVariants),
    };

    return sanitized;
  }

  async enrichVariantsPricing(
    productId: string,
    variants: Array<WithId & AnyRecord>,
    discountPercent: number,
    selectedCurrencyInput: string,
    filterZeroStock = true,
  ): Promise<{
    variantsWithPricing: Array<AnyRecord>;
    currenciesForPricing: string[];
    pricesByCurrency: Record<string, PriceWithDiscountAndVariantId[]>;
  }> {
    const normalizedCurrency = this.normalizeCurrency(selectedCurrencyInput);
    const currenciesForPricing = Array.from(
      new Set([...this.BASE_PRICING_CURRENCIES, normalizedCurrency]),
    );

    const filteredVariants = filterZeroStock ? this.filterVariantsWithStock(variants) : variants;

    const variantSnapshots: VariantPricingInput[] = filteredVariants.map((variant) => ({
      _id: variant._id,
      basePriceUSD: this.normalizePrice(variant.basePriceUSD) ?? 0,
      basePriceSAR: this.normalizePrice(variant.basePriceSAR),
      basePriceYER: this.normalizePrice(variant.basePriceYER),
      compareAtPriceUSD: this.normalizePrice(variant.compareAtPriceUSD),
      compareAtPriceSAR: this.normalizePrice(variant.compareAtPriceSAR),
      compareAtPriceYER: this.normalizePrice(variant.compareAtPriceYER),
      costPriceUSD: this.normalizePrice(variant.costPriceUSD),
      costPriceSAR: this.normalizePrice(variant.costPriceSAR),
      costPriceYER: this.normalizePrice(variant.costPriceYER),
      exchangeRateVersion: variant.exchangeRateVersion as string | undefined,
      lastExchangeRateSyncAt: variant.lastExchangeRateSyncAt as Date | string | undefined,
    }));

    const pricesByCurrency = await this.pricingService.getProductPricesWithDiscountByCurrencies(
      productId,
      currenciesForPricing,
      discountPercent,
      { variants: variantSnapshots },
    );

    const variantsWithPricing = filteredVariants.map((variant) => {
      const variantId = variant._id.toString();
      const stock = this.normalizePrice(variant.stock) ?? 0;
      const isActive = variant.isActive !== false;
      const isAvailable = stock > 0 && isActive;
      const stockStatus = isAvailable ? 'in_stock' : 'out_of_stock';

      const pricingByCurrency = this.BASE_PRICING_CURRENCIES.reduce<
        Record<string, PriceWithDiscount | null>
      >(
        (acc, currencyCode) => {
          const entry =
            pricesByCurrency[currencyCode]?.find((price) => price.variantId === variantId) ?? null;
          acc[currencyCode] = this.stripVariantId(entry);
          return acc;
        },
        {} as Record<string, PriceWithDiscount | null>,
      );

      const selectedPriceEntry =
        pricesByCurrency[normalizedCurrency]?.find((price) => price.variantId === variantId) ??
        null;

      return {
        ...variant,
        pricing: this.stripVariantId(selectedPriceEntry),
        pricingByCurrency,
        isAvailable,
        stockStatus,
        stock,
        // إرجاع القيم الافتراضية إذا كانت undefined (للـ variants القديمة)
        minOrderQuantity:
          typeof variant.minOrderQuantity === 'number' && !isNaN(variant.minOrderQuantity)
            ? variant.minOrderQuantity
            : 1,
        maxOrderQuantity:
          typeof variant.maxOrderQuantity === 'number' && !isNaN(variant.maxOrderQuantity)
            ? variant.maxOrderQuantity
            : 0,
        ...(typeof variant.salesCount === 'number' ? { salesCount: variant.salesCount } : {}),
      };
    });

    return { variantsWithPricing, currenciesForPricing, pricesByCurrency };
  }

  async buildProductsCollectionResponse(
    products: Array<AnyRecord>,
    discountPercent: number,
    selectedCurrencyInput: string,
  ): Promise<Array<AnyRecord>> {
    if (!products || products.length === 0) {
      return [];
    }

    const normalizedCurrency = this.normalizeCurrency(selectedCurrencyInput);

    return Promise.all(
      products.map(async (productRaw) => {
        const productRecord = productRaw as AnyRecord;
        const productId = this.extractIdString(productRecord._id) ?? String(productRecord._id);
        const allVariants = await this.variantService.findByProductId(productId);
        const variants = this.filterVariantsWithStockOnly(
          allVariants as unknown as Array<WithId & AnyRecord>,
        );

        if (variants.length === 0) {
          if (!this.hasSimplePricing(productRecord)) {
            return this.buildSimplifiedProduct(productRecord, {
              variants: [],
              hasVariants: false,
              includeImages: false,
              includeCategory: false,
              includeBrand: false,
              includeAttributes: false,
              includeVariants: false,
            });
          }

          const basePriceUSD = this.normalizePrice(
            productRecord.basePriceUSD ?? productRecord.basePrice,
          );
          const compareAtPriceUSD = this.normalizePrice(
            productRecord.compareAtPriceUSD ?? productRecord.compareAtPrice,
          );
          const costPriceUSD = this.normalizePrice(
            productRecord.costPriceUSD ?? productRecord.costPrice,
          );

          const currenciesForPricing = Array.from(
            new Set([...this.BASE_PRICING_CURRENCIES, normalizedCurrency]),
          );

          const derivedPricing = this.buildSimpleProductDerivedPricing(productRecord);

          const pricingByCurrency = await this.pricingService.getSimpleProductPricingByCurrencies(
            basePriceUSD ?? compareAtPriceUSD ?? costPriceUSD ?? 0,
            compareAtPriceUSD,
            costPriceUSD,
            currenciesForPricing,
            discountPercent,
            derivedPricing,
          );

          return this.buildSimplifiedProduct(productRecord, {
            variants: [],
            hasVariants: false,
            pricingByCurrency,
            defaultPricing: this.cleanPrice(
              pricingByCurrency[normalizedCurrency] ?? pricingByCurrency.USD,
            ),
            includeImages: false,
            includeCategory: false,
            includeBrand: false,
            includeAttributes: false,
            includeVariants: false,
            includePriceRange: false,
            includeDefaultPricing: false,
          });
        }

        const { variantsWithPricing, pricesByCurrency } = await this.enrichVariantsPricing(
          productId,
          variants as unknown as Array<WithId & AnyRecord>,
          discountPercent,
          normalizedCurrency,
          true,
        );

        const priceRangeByCurrency = this.computePriceRangeByCurrency(pricesByCurrency);
        const pricingByCurrencySummary = this.summarizeCurrencyPricing(pricesByCurrency);
        const selectedVariantPricing =
          pricesByCurrency[normalizedCurrency]?.[0] ?? pricesByCurrency.USD?.[0] ?? null;

        return this.buildSimplifiedProduct(productRecord, {
          variants: variantsWithPricing,
          hasVariants: true,
          priceRangeByCurrency,
          pricingByCurrency: pricingByCurrencySummary,
          defaultPricing: this.cleanPrice(this.stripVariantId(selectedVariantPricing)),
          includeImages: false,
          includeCategory: false,
          includeBrand: false,
          includeAttributes: false,
          includeVariants: false,
          includePriceRange: false,
          includeDefaultPricing: false,
        });
      }),
    );
  }

  async buildRelatedProducts(
    relatedProductsRaw: unknown,
    discountPercent: number,
    selectedCurrencyInput: string,
  ): Promise<RelatedProductPayload[]> {
    if (!Array.isArray(relatedProductsRaw) || relatedProductsRaw.length === 0) {
      return [];
    }

    const relatedIds = Array.from(
      new Set(
        relatedProductsRaw
          .map((id) => this.extractIdString(id))
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (relatedIds.length === 0) {
      return [];
    }

    const [relatedProductsRawData, variantsByProductId] = await Promise.all([
      this.productService.findByIds(relatedIds),
      this.variantService.findByProductIds(relatedIds),
    ]);

    const relatedProductsMap = new Map<string, AnyRecord>();
    relatedProductsRawData.forEach((product) => {
      const productRecord = product as unknown as AnyRecord;
      const productId = this.extractIdString(productRecord._id) ?? '';

      if (productId) {
        relatedProductsMap.set(productId, productRecord);
      }
    });

    const relatedProducts = await Promise.all(
      relatedIds.map(async (id) => {
        const productRecord = relatedProductsMap.get(id);

        if (!productRecord) {
          return undefined;
        }

        try {
          const allVariantsForProduct =
            variantsByProductId[id]?.map((variant) => variant as unknown as WithId & AnyRecord) ??
            [];
          const variantsForProduct = this.filterVariantsWithStock(allVariantsForProduct);

          const { variantsWithPricing, currenciesForPricing, pricesByCurrency } =
            await this.enrichVariantsPricing(
              id,
              variantsForProduct,
              discountPercent,
              selectedCurrencyInput,
              true,
            );

          void (await this.getAttributeSummaries(productRecord.attributes as unknown[]));

          let pricingByCurrency: Record<string, PriceWithDiscount> | undefined;
          let priceRangeByCurrency:
            | Record<
                string,
                {
                  minPrice: number;
                  maxPrice: number;
                  currency: string;
                  hasDiscountedVariant: boolean;
                }
              >
            | undefined;
          let defaultPricing: PriceWithDiscount | null | undefined;

          if (variantsWithPricing.length === 0 && this.hasSimplePricing(productRecord)) {
            const basePriceUSD = this.normalizePrice(
              productRecord.basePriceUSD ?? productRecord.basePrice,
            );
            const compareAtPriceUSD = this.normalizePrice(
              productRecord.compareAtPriceUSD ?? productRecord.compareAtPrice,
            );
            const costPriceUSD = this.normalizePrice(
              productRecord.costPriceUSD ?? productRecord.costPrice,
            );

            const derivedPricing = this.buildSimpleProductDerivedPricing(productRecord);

            pricingByCurrency = await this.pricingService.getSimpleProductPricingByCurrencies(
              basePriceUSD ?? compareAtPriceUSD ?? costPriceUSD ?? 0,
              compareAtPriceUSD,
              costPriceUSD,
              currenciesForPricing,
              discountPercent,
              derivedPricing,
            );
            defaultPricing =
              pricingByCurrency[this.normalizeCurrency(selectedCurrencyInput)] ??
              pricingByCurrency.USD;
          } else if (variantsWithPricing.length > 0) {
            priceRangeByCurrency = this.computePriceRangeByCurrency(pricesByCurrency);
            const pricingSummary = this.summarizeCurrencyPricing(pricesByCurrency);
            pricingByCurrency = Object.fromEntries(
              Object.entries(pricingSummary).filter(([, value]) => value !== null),
            ) as Record<string, PriceWithDiscount>;
            const selectedCurrency = this.normalizeCurrency(selectedCurrencyInput);
            const fallbackCurrency =
              selectedCurrency !== 'USD' && !pricesByCurrency[selectedCurrency]
                ? 'USD'
                : selectedCurrency;
            const selectedVariantPrice =
              pricesByCurrency[fallbackCurrency]?.[0] ?? pricesByCurrency.USD?.[0] ?? null;
            defaultPricing = this.stripVariantId(selectedVariantPrice);
          }

          const simplifiedProduct = this.buildSimplifiedProduct(productRecord, {
            variants: [],
            hasVariants: variantsWithPricing.length > 0,
            pricingByCurrency,
            priceRangeByCurrency,
            defaultPricing,
            includeImages: true,
            includeCategory: false,
            includeBrand: false,
            includeAttributes: false,
            includeVariants: false,
            includePriceRange: false,
            includeDefaultPricing: false,
          });

          return simplifiedProduct as RelatedProductPayload;
        } catch (error) {
          this.logger.warn(
            `Failed to build related product ${id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return undefined;
        }
      }),
    );

    return relatedProducts.filter((item): item is RelatedProductPayload => Boolean(item));
  }

  async buildProductDetailResponse(
    productId: string,
    product: AnyRecord,
    variants: Array<WithId & AnyRecord>,
    discountPercent: number,
    selectedCurrencyInput: string,
  ) {
    // إرجاع جميع المتغيرات بدون تصفية مع إضافة isAvailable و stockStatus
    const allVariants = this.filterVariantsWithStock(variants);
    const { variantsWithPricing, currenciesForPricing, pricesByCurrency } =
      await this.enrichVariantsPricing(
        productId,
        allVariants,
        discountPercent,
        selectedCurrencyInput,
        false, // filterZeroStock = false لإرجاع جميع المتغيرات
      );

    const attributesDetails = await this.getAttributeSummaries(product.attributes as unknown[]);

    let productPricingByCurrency: Record<string, PriceWithDiscount> | undefined;
    let productPriceRangeByCurrency:
      | Record<
          string,
          {
            minPrice: number;
            maxPrice: number;
            currency: string;
            hasDiscountedVariant: boolean;
          }
        >
      | undefined;
    let defaultPricing: PriceWithDiscount | null | undefined;
    const basePriceUSD = this.normalizePrice(product.basePriceUSD ?? product.basePrice);
    const compareAtPriceUSD = this.normalizePrice(
      product.compareAtPriceUSD ?? product.compareAtPrice,
    );
    const costPriceUSD = this.normalizePrice(product.costPriceUSD ?? product.costPrice);

    if (variantsWithPricing.length === 0 && this.hasSimplePricing(product)) {
      const derivedPricing = this.buildSimpleProductDerivedPricing(product);

      productPricingByCurrency = await this.pricingService.getSimpleProductPricingByCurrencies(
        basePriceUSD ?? compareAtPriceUSD ?? costPriceUSD ?? 0,
        compareAtPriceUSD,
        costPriceUSD,
        currenciesForPricing,
        discountPercent,
        derivedPricing,
      );
      defaultPricing =
        productPricingByCurrency[this.normalizeCurrency(selectedCurrencyInput)] ??
        productPricingByCurrency.USD;
    } else if (variantsWithPricing.length > 0) {
      productPriceRangeByCurrency = this.computePriceRangeByCurrency(pricesByCurrency);
      const pricingSummary = this.summarizeCurrencyPricing(pricesByCurrency);
      productPricingByCurrency = Object.fromEntries(
        Object.entries(pricingSummary).filter(([, value]) => value !== null),
      ) as Record<string, PriceWithDiscount>;
      const selectedCurrency = this.normalizeCurrency(selectedCurrencyInput);
      const fallbackCurrency =
        selectedCurrency !== 'USD' && !pricesByCurrency[selectedCurrency]
          ? 'USD'
          : selectedCurrency;
      const selectedVariantPrice =
        pricesByCurrency[fallbackCurrency]?.[0] ?? pricesByCurrency.USD?.[0] ?? null;
      defaultPricing = this.stripVariantId(selectedVariantPrice);
    }

    const simplifiedProduct = this.buildSimplifiedProduct(product, {
      variants: variantsWithPricing,
      hasVariants: variantsWithPricing.length > 0,
      pricingByCurrency: productPricingByCurrency,
      priceRangeByCurrency: productPriceRangeByCurrency,
      defaultPricing,
      includeImages: true,
      includeDefaultPricing: false,
      includePriceRange: false,
      includeDescriptions: true,
    });

    const productWithAttributes: AnyRecord = {
      ...simplifiedProduct,
      attributesDetails,
    };

    const relatedProducts = await this.buildRelatedProducts(
      product.relatedProducts as unknown[],
      discountPercent,
      selectedCurrencyInput,
    );

    return {
      product: productWithAttributes,
      variants: variantsWithPricing.map((variant) => this.sanitizeVariant(variant)),
      relatedProducts,
      userDiscount: {
        isMerchant: discountPercent > 0,
        discountPercent,
      },
    };
  }
}
