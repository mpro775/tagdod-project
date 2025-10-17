import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { Variant } from './schemas/variant.schema';
import { VariantPrice } from './schemas/variant-price.schema';
import { slugify } from '../../shared/utils/slug.util';
import { CacheService } from '../../shared/cache/cache.service';
import { CurrencyConversionService } from '../exchange-rates/currency-conversion.service';

interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  currency?: 'USD' | 'SAR' | 'YER';
  brandId?: string;
}

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);
  private readonly CACHE_TTL = {
    PRODUCTS_LIST: 300, // 5 minutes
    PRODUCT_DETAIL: 600, // 10 minutes
  };

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(VariantPrice.name) private priceModel: Model<VariantPrice>,
    private cacheService: CacheService,
    private currencyConversionService: CurrencyConversionService,
  ) {}

  // ======================================================================
  // Products
  // ======================================================================
  async createProduct(dto: Partial<Product>) {
    const slug = slugify(dto.name!);
    const product = await this.productModel.create({ ...dto, slug });

    // Clear product caches
    await this.clearProductCaches();

    return product;
  }

  async updateProduct(id: string, patch: Partial<Product>) {
    if (patch.name) patch.slug = slugify(patch.name);
    const product = await this.productModel.findByIdAndUpdate(id, { $set: patch }, { new: true });

    // Clear product caches
    await this.clearProductCaches(id);

    return product;
  }

  async addVariant(dto: Partial<Variant>) {
    const variant = await this.variantModel.create({ ...dto });

    // Clear product caches since variant affects product details
    await this.clearProductCaches(dto.productId);

    return variant;
  }

  async updateVariant(id: string, patch: Partial<Variant>) {
    const variant = await this.variantModel.findByIdAndUpdate(id, { $set: patch }, { new: true });

    // Clear product caches since variant affects product details
    if (variant?.productId) {
      await this.clearProductCaches(variant.productId.toString());
    }

    return variant;
  }

  async setVariantPrice(dto: {
    variantId: string;
    basePriceUSD: number;
    compareAtUSD?: number;
    wholesalePriceUSD?: number;
    moq?: number;
    notes?: string;
  }) {
    const existing = await this.priceModel.findOne({
      variantId: dto.variantId,
    });

    let price;
    if (existing) {
      existing.basePriceUSD = dto.basePriceUSD;
      if (dto.compareAtUSD !== undefined) existing.compareAtUSD = dto.compareAtUSD;
      if (dto.wholesalePriceUSD !== undefined) existing.wholesalePriceUSD = dto.wholesalePriceUSD;
      if (dto.moq !== undefined) existing.moq = dto.moq;
      if (dto.notes !== undefined) existing.notes = dto.notes;
      price = await existing.save();
    } else {
      price = await this.priceModel.create(dto);
    }

    // Clear product caches since price affects product details
    const variant = await this.variantModel.findById(dto.variantId).lean();
    if (variant?.productId) {
      await this.clearProductCaches(variant.productId.toString());
    }

    return price;
  }

  // -------- Public queries
  async listProducts({ page = 1, limit = 20, search, categoryId, brandId }: ListProductsParams) {
    const cacheKey = `products:list:${page}:${limit}:${search || ''}:${categoryId || ''}:${brandId || ''}`;

    // Try to get from cache first
    const cached = await this.cacheService.get<{
      items: unknown[];
      meta: { page: number; limit: number; total: number };
    }>(cacheKey);
    if (cached) {
      this.logger.debug(
        `Products list cache hit: page=${page}, search=${search}, category=${categoryId}, brand=${brandId}`,
      );
      return cached;
    }

    // Cache miss - fetch from database
    this.logger.debug(
      `Products list cache miss: page=${page}, search=${search}, category=${categoryId}, brand=${brandId}`,
    );
    const q: Record<string, unknown> = { status: 'Active' };
    if (categoryId) q.categoryId = new Types.ObjectId(categoryId);
    if (brandId) q.brandId = brandId;
    if (search) q.$text = { $search: search };

    const skip = (page - 1) * limit;
    const items = await this.productModel
      .find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await this.productModel.countDocuments(q);

    const result = { items, meta: { page, limit, total } };

    // Cache the result
    await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL.PRODUCTS_LIST });

    return result;
  }

  async getProduct(productId: string, currency?: 'USD' | 'SAR' | 'YER', userId?: string) {
    const cacheKey = `product:detail:${productId}:${currency || 'all'}:${userId || 'guest'}`;

    // Try to get from cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Product detail cache hit: productId=${productId}, currency=${currency}`);
      return cached;
    }

    // Cache miss - fetch from database
    this.logger.debug(`Product detail cache miss: productId=${productId}, currency=${currency}`);
    const product = await this.productModel.findById(productId).lean();
    if (!product) return null;

    const variants = await this.variantModel.find({ productId }).lean();
    const variantIds = variants.map((v) => v._id);
    const prices = await this.priceModel.find({ variantId: { $in: variantIds } }).lean();

    // تحويل الأسعار إذا تم تحديد عملة
    let convertedPrices = prices;
    if (currency && currency !== 'USD') {
      try {
        convertedPrices = await Promise.all(
          prices.map(async (price) => {
            const converted = await this.currencyConversionService.convertCurrencyAdvanced(
              'USD',
              currency,
              price.basePriceUSD,
              {
                rateType: 'buy',
              },
            );
            return {
              ...price,
              convertedAmount: converted.amount,
              convertedCurrency: currency,
              formattedPrice: converted.result.toFixed(2),
              exchangeRate: converted.rate,
            };
          }),
        );
      } catch (error) {
        this.logger.error(`Error converting prices for product ${productId}:`, error);
        // في حالة فشل التحويل، نعيد الأسعار الأصلية
      }
    }

    const result = {
      product,
      variants,
      prices: convertedPrices,
      currency: currency || 'USD',
    };

    // Cache the result
    await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL.PRODUCT_DETAIL });

    return result;
  }

  // ======================================================================
  // Cache Management
  // ======================================================================
  /**
   * Clear all product-related caches
   */
  async clearProductCaches(productId?: string) {
    try {
      const keysToDelete: string[] = [];

      if (productId) {
        // Clear specific product cache
        keysToDelete.push(`product:detail:${productId}:*`);
        // Clear product list caches (this is a pattern match)
        keysToDelete.push(`products:list:*${productId}*`);
      } else {
        // Clear all product caches
        keysToDelete.push('products:list:*', 'product:detail:*');
      }

      for (const pattern of keysToDelete) {
        await this.cacheService.clear(pattern);
      }

      this.logger.log(`Cleared product caches for productId: ${productId || 'all'}`);
    } catch (error) {
      this.logger.error('Error clearing product caches:', error);
    }
  }

  /**
   * Clear all product caches
   */
  async clearAllCaches() {
    try {
      await this.cacheService.clear('products:*');
      await this.cacheService.clear('product:*');
      this.logger.log('Cleared all product caches');
    } catch (error) {
      this.logger.error('Error clearing all product caches:', error);
    }
  }
}
