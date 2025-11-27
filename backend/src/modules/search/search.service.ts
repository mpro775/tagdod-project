import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Lean result types
type PopulatedName = { name: string; nameEn: string };
type PopulatedMedia = { _id: Types.ObjectId; url: string };
type PriceRange = { min: number; max: number };
type ProductLean = {
  _id: Types.ObjectId;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  mainImage?: string;
  mainImageId?: Types.ObjectId | PopulatedMedia;
  categoryId: Types.ObjectId | PopulatedName;
  brandId?: Types.ObjectId | PopulatedName;
  priceRange?: PriceRange | null;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  createdAt: Date;
};
type ProductSimpleLean = {
  _id: Types.ObjectId;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  mainImage?: string;
  mainImageId?: Types.ObjectId | PopulatedMedia;
  isFeatured?: boolean;
  createdAt: Date;
};
type CategoryLean = {
  _id: Types.ObjectId;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  image?: string;
  productsCount?: number;
  depth?: number;
  createdAt: Date;
};
type BrandLean = {
  _id: Types.ObjectId;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  image?: string;
};
import { CacheService } from '../../shared/cache/cache.service';
import {
  SearchQueryDto,
  AdvancedProductSearchDto,
  SearchResultDto,
  ProductSearchResultDto,
  FacetDto,
  ProductSortBy,
  SortOrder,
  SearchEntity,
} from './dto/search.dto';
import { Product } from '../products/schemas/product.schema';
import { Category } from '../categories/schemas/category.schema';
import { Brand } from '../brands/schemas/brand.schema';
import { PricingService } from '../products/services/pricing.service';
import { VariantService } from '../products/services/variant.service';
import { PublicProductsPresenter } from '../products/services/public-products.presenter';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly CACHE_TTL = {
    SEARCH_RESULTS: 300, // 5 دقائق
    SUGGESTIONS: 1800, // 30 دقيقة
    FACETS: 600, // 10 دقائق
  };

  constructor(
    @InjectModel(Product.name)
    private productModel: Model<
      Product & { priceRange?: { min: number; max: number } | null; rating?: number }
    >,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    private cacheService: CacheService,
    private pricingService: PricingService,
    private variantService: VariantService,
    private publicProductsPresenter: PublicProductsPresenter,
  ) {}

  // Types for lean results and populated refs
  private getNameFromRef(ref: Types.ObjectId | PopulatedName | undefined, lang: 'ar' | 'en') {
    if (ref && typeof ref === 'object' && 'name' in ref && 'nameEn' in ref) {
      return lang === 'ar' ? ref.name : ref.nameEn;
    }
    return undefined;
  }

  // Extract main image URL from populated mainImageId or fallback to mainImage
  private getMainImageUrl(product: ProductLean | ProductSimpleLean): string | undefined {
    // Check if mainImageId is populated (has url property)
    if (
      product.mainImageId &&
      typeof product.mainImageId === 'object' &&
      'url' in product.mainImageId
    ) {
      return (product.mainImageId as PopulatedMedia).url;
    }
    // Fallback to mainImage field
    return product.mainImage;
  }

  // Calculate price range by currency from variants or product base prices
  // الأسعار مخزنة بالفعل في قاعدة البيانات - لا حاجة للتحويل
  private async getPriceRangeByCurrency(productId: string): Promise<
    Record<
      string,
      {
        minPrice: number;
        maxPrice: number;
        currency: string;
        hasDiscountedVariant: boolean;
      }
    >
  > {
    const currencies = ['USD', 'YER', 'SAR'];
    const priceRanges: Record<
      string,
      {
        minPrice: number;
        maxPrice: number;
        currency: string;
        hasDiscountedVariant: boolean;
      }
    > = {};

    try {
      // جلب جميع variants غير المحذوفة (بغض النظر عن isActive)
      const variants = await this.variantService.findByProductId(productId, false);

      // جلب المنتج للحصول على أسعاره الأساسية
      const product = await this.productModel.findById(productId).lean();

      // إذا لم توجد variants، استخدم أسعار المنتج
      const hasVariants = variants && variants.length > 0;

      for (const currency of currencies) {
        let minPrice = 0;
        let maxPrice = 0;
        let hasDiscountedVariant = false;

        if (hasVariants) {
          // حساب min/max من variants - استخدام الأسعار المخزنة مباشرة
          const prices: number[] = [];

          for (const variant of variants) {
            let price: number | undefined;

            // استخدام الأسعار المخزنة مباشرة بدون تحويل
            switch (currency) {
              case 'USD':
                price = variant.basePriceUSD;
                break;
              case 'SAR':
                price = variant.basePriceSAR;
                break;
              case 'YER':
                price = variant.basePriceYER;
                break;
            }

            // إذا كان السعر موجوداً و أكبر من صفر، أضفه
            if (price !== undefined && price !== null && price > 0) {
              prices.push(price);

              // التحقق من وجود خصم
              if (variant.compareAtPriceUSD && variant.compareAtPriceUSD > variant.basePriceUSD) {
                hasDiscountedVariant = true;
              }
            }
          }

          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
        } else if (product) {
          // استخدام أسعار المنتج نفسه - المخزنة مباشرة
          let price: number | undefined;

          switch (currency) {
            case 'USD':
              price = (product as any).basePriceUSD;
              break;
            case 'SAR':
              price = (product as any).basePriceSAR;
              break;
            case 'YER':
              price = (product as any).basePriceYER;
              break;
          }

          // استخدام السعر المخزن مباشرة
          if (price !== undefined && price !== null && price > 0) {
            minPrice = price;
            maxPrice = price;
          }
        }

        priceRanges[currency] = {
          minPrice,
          maxPrice,
          currency,
          hasDiscountedVariant,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to get price range for product ${productId}:`, error);
      // إرجاع قيم افتراضية
      for (const currency of currencies) {
        priceRanges[currency] = {
          minPrice: 0,
          maxPrice: 0,
          currency,
          hasDiscountedVariant: false,
        };
      }
    }

    return priceRanges;
  }

  // ==================== البحث الشامل ====================
  async universalSearch(dto: SearchQueryDto, userId?: string, currency?: string) {
    const {
      q,
      lang = 'ar',
      entity = SearchEntity.ALL,
      currency: dtoCurrency,
      page = 1,
      limit = 20,
    } = dto;

    const selectedCurrency = dtoCurrency || currency || 'USD';
    const cacheKey = `search:universal:${JSON.stringify({ ...dto, currency: selectedCurrency, userId })}`;
    const cached = await this.cacheService.get<{
      results: SearchResultDto[];
      total: number;
      page: number;
      totalPages: number;
    }>(cacheKey);
    if (cached) return cached;

    const results: SearchResultDto[] = [];

    // بحث في المنتجات
    if (!entity || entity === SearchEntity.ALL || entity === SearchEntity.PRODUCTS) {
      const products = await this.searchProductsSimple(q, lang, limit, userId, selectedCurrency);
      results.push(...products);
    }

    // بحث في الفئات
    if (!entity || entity === SearchEntity.ALL || entity === SearchEntity.CATEGORIES) {
      const categories = await this.searchCategories(q, lang, limit);
      results.push(...categories);
    }

    // بحث في البراندات
    if (!entity || entity === SearchEntity.ALL || entity === SearchEntity.BRANDS) {
      const brands = await this.searchBrands(q, lang, limit);
      results.push(...brands);
    }

    // ترتيب حسب relevance
    results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedResults = results.slice(skip, skip + limit);

    const result = {
      results: paginatedResults,
      total: results.length,
      page,
      totalPages: Math.ceil(results.length / limit),
    };

    await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL.SEARCH_RESULTS });
    return result;
  }

  // ==================== بحث المنتجات المتقدم ====================
  async advancedProductSearch(
    dto: AdvancedProductSearchDto,
    userId?: string,
    currency?: string,
  ): Promise<ProductSearchResultDto> {
    const {
      q,
      lang = 'ar',
      currency: dtoCurrency,
      categoryId,
      brandId,
      status = 'active',
      isFeatured,
      isNew,
      minPrice,
      maxPrice,
      minRating,
      attributes,
      tags,
      sortBy = ProductSortBy.RELEVANCE,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 20,
      includeFacets = false,
    } = dto;

    const selectedCurrency = dtoCurrency || currency || 'USD';
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(userId);

    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {
      status,
      deletedAt: null,
    };

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { nameEn: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { descriptionEn: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    // Filters
    if (categoryId) query.categoryId = categoryId;
    if (brandId) query.brandId = brandId;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;
    if (isNew !== undefined) query.isNew = isNew;
    if (minRating) query.rating = { $gte: minRating };
    if (tags && tags.length > 0) query.tags = { $in: tags };

    // Price Range - البحث في Variants
    if (minPrice !== undefined || maxPrice !== undefined) {
      // البحث في Variants للأسعار
      const productsWithPriceRange = await this.productModel.aggregate([
        {
          $lookup: {
            from: 'variants',
            localField: '_id',
            foreignField: 'productId',
            as: 'variants',
            pipeline: [{ $match: { deletedAt: null, isActive: true } }],
          },
        },
        {
          $match: {
            'variants.basePriceUSD': {
              ...(minPrice !== undefined && { $gte: minPrice }),
              ...(maxPrice !== undefined && { $lte: maxPrice }),
            },
          },
        },
        {
          $project: {
            variants: 0, // إزالة variants من النتيجة النهائية
          },
        },
      ]);

      // إضافة IDs للمنتجات المطابقة للفلتر
      if (productsWithPriceRange.length > 0) {
        query._id = { $in: productsWithPriceRange.map((p) => p._id) };
      } else {
        // إذا لم توجد منتجات في نطاق السعر، إرجاع قائمة فارغة
        query._id = { $in: [] };
      }
    }

    // Attributes Filter
    if (attributes) {
      try {
        const attrObj = JSON.parse(attributes);
        Object.keys(attrObj).forEach((key) => {
          query[`attributes.${key}`] = attrObj[key];
        });
      } catch (e) {
        this.logger.error('Invalid attributes JSON', e);
      }
    }

    // Sorting
    const sort: Record<string, 1 | -1> = {};
    const direction = sortOrder === SortOrder.ASC ? 1 : -1;
    const shouldCalculateRelevance = sortBy === ProductSortBy.RELEVANCE && q && q.trim().length > 0;

    switch (sortBy) {
      case ProductSortBy.NAME:
        sort[lang === 'ar' ? 'name' : 'nameEn'] = direction;
        break;
      case ProductSortBy.PRICE:
        sort['priceRange.min'] = direction;
        break;
      case ProductSortBy.RATING:
        sort.rating = direction;
        break;
      case ProductSortBy.VIEWS:
        sort.viewsCount = direction;
        break;
      case ProductSortBy.CREATED_AT:
        sort.createdAt = direction;
        break;
      case ProductSortBy.RELEVANCE:
      default:
        // إذا كان هناك نص بحث، سنحسب الصلة لاحقاً
        // وإلا نرتب حسب التاريخ
        if (!shouldCalculateRelevance) {
          sort.createdAt = -1;
        } else {
          // ترتيب مؤقت قبل حساب الصلة (لتحسين الأداء)
          sort.createdAt = -1;
        }
    }

    // Execute query
    // إذا كنا نحسب الصلة، نحتاج جلب جميع النتائج أولاً للترتيب
    const shouldFetchAllForRelevance = shouldCalculateRelevance;
    const fetchLimit = shouldFetchAllForRelevance ? 10000 : limit; // حد أقصى 10000 للترتيب حسب الصلة
    const fetchSkip = shouldFetchAllForRelevance ? 0 : skip;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('categoryId', 'name nameEn')
        .populate('brandId', 'name nameEn')
        .populate('mainImageId', 'url')
        .sort(sort)
        .skip(fetchSkip)
        .limit(fetchLimit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    // حساب درجة الصلة وترتيب النتائج إذا لزم الأمر
    let finalProducts: typeof products = products;
    let finalTotal = total;
    if (shouldCalculateRelevance) {
      // حساب درجة الصلة لكل منتج
      const productsWithRelevance = (products as unknown as ProductLean[]).map((product) => {
        const relevanceScore = this.calculateRelevance(
          {
            name: product.name,
            nameEn: product.nameEn,
            description: product.description,
            descriptionEn: product.descriptionEn,
            tags: product.tags,
            isFeatured: product.isFeatured,
            rating: product.rating,
          },
          q!,
          lang,
        );
        return {
          ...product,
          relevanceScore,
        } as ProductLean & { relevanceScore: number };
      });

      // ترتيب حسب درجة الصلة (تنازلي) ثم isFeatured ثم createdAt
      productsWithRelevance.sort((a, b) => {
        // أولاً حسب درجة الصلة
        if (b.relevanceScore !== a.relevanceScore) {
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        }
        // ثانياً حسب isFeatured
        if (b.isFeatured !== a.isFeatured) {
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
        // ثالثاً حسب createdAt
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });

      // إزالة المنتجات التي لا تطابق في الاسم (score < 200) إذا كان هناك منتجات تطابق في الاسم
      const hasNameMatches = productsWithRelevance.some((p) => (p.relevanceScore || 0) >= 200);
      if (hasNameMatches) {
        // إزالة المنتجات التي تطابق فقط في الوصف/الوسوم (score < 200)
        const filteredProducts = productsWithRelevance.filter(
          (p) => (p.relevanceScore || 0) >= 200,
        );
        finalTotal = filteredProducts.length;
        finalProducts = filteredProducts.slice(skip, skip + limit) as unknown as typeof products;
      } else {
        // إذا لم توجد مطابقات في الاسم، نعرض جميع النتائج
        finalProducts = productsWithRelevance.slice(
          skip,
          skip + limit,
        ) as unknown as typeof products;
      }
    } else {
      finalProducts = products;
    }

    // استخدام buildProductsCollectionResponse للحصول على نفس تنسيق قائمة المنتجات المميزة
    const rawData = Array.isArray(finalProducts)
      ? (finalProducts as unknown as Array<Record<string, unknown>>)
      : [];

    const productsWithPricing = await this.publicProductsPresenter.buildProductsCollectionResponse(
      rawData,
      discountPercent,
      selectedCurrency,
    );

    const response: ProductSearchResultDto = {
      results: productsWithPricing as Array<Record<string, unknown>>,
      total: finalTotal,
      page,
      totalPages: Math.ceil(finalTotal / limit),
    };

    // Facets (فلاتر ديناميكية)
    if (includeFacets) {
      response.facets = await this.generateFacets(query);
      response.priceRange = await this.getPriceRange(query);
    }

    return response;
  }

  // ==================== بحث بسيط للمنتجات (للبحث الشامل) ====================
  private async searchProductsSimple(
    q: string | undefined,
    lang: 'ar' | 'en',
    limit: number,
    userId?: string,
    currency?: string,
  ): Promise<SearchResultDto[]> {
    const query: Record<string, unknown> = { status: 'active', deletedAt: null };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { nameEn: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    const products = await this.productModel
      .find(query)
      .populate('categoryId', 'name nameEn')
      .populate('brandId', 'name nameEn')
      .populate('mainImageId', 'url')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const selectedCurrency = currency || 'USD';
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(userId);

    // استخدام buildProductsCollectionResponse للحصول على نفس تنسيق قائمة المنتجات المميزة
    const rawData = Array.isArray(products)
      ? (products as unknown as Array<Record<string, unknown>>)
      : [];

    const productsWithPricing = await this.publicProductsPresenter.buildProductsCollectionResponse(
      rawData,
      discountPercent,
      selectedCurrency,
    );

    return productsWithPricing as unknown as SearchResultDto[];
  }

  // ==================== بحث الفئات ====================
  private async searchCategories(
    q: string | undefined,
    lang: 'ar' | 'en',
    limit: number,
  ): Promise<SearchResultDto[]> {
    const query: Record<string, unknown> = { isActive: true, deletedAt: null };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { nameEn: { $regex: q, $options: 'i' } },
      ];
    }

    const categories = await this.categoryModel
      .find(query)
      .sort({ isFeatured: -1, order: 1 })
      .limit(limit)
      .lean<CategoryLean[]>();

    return categories.map((c) => ({
      type: 'category' as const,
      id: String(c._id),
      title: lang === 'ar' ? c.name : c.nameEn,
      titleEn: c.nameEn,
      description: lang === 'ar' ? c.description : c.descriptionEn,
      thumbnail: c.image,
      metadata: {
        type: 'category',
        productsCount: c.productsCount,
        depth: c.depth,
      },
      relevanceScore: q ? this.simpleRelevance(c, q, lang) : 0,
      createdAt: c.createdAt,
    }));
  }

  // ==================== بحث البراندات ====================
  private async searchBrands(
    q: string | undefined,
    lang: 'ar' | 'en',
    limit: number,
  ): Promise<SearchResultDto[]> {
    const query: Record<string, unknown> = { isActive: true };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { nameEn: { $regex: q, $options: 'i' } },
      ];
    }

    const brands = await this.brandModel
      .find(query)
      .sort({ sortOrder: 1 })
      .limit(limit)
      .lean<BrandLean[]>();

    return brands.map((b) => ({
      type: 'brand' as const,
      id: String(b._id),
      title: lang === 'ar' ? b.name : b.nameEn,
      titleEn: b.nameEn,
      description: lang === 'ar' ? b.description : b.descriptionEn,
      thumbnail: b.image,
      metadata: { type: 'brand' },
      relevanceScore: q ? this.simpleRelevance(b, q, lang) : 0,
    }));
  }

  // ==================== الاقتراحات (Autocomplete) ====================
  async getSearchSuggestions(
    query: string,
    lang: 'ar' | 'en' = 'ar',
    limit = 10,
  ): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = `search:suggestions:${query}:${lang}:${limit}`;
    const cached = await this.cacheService.get<string[]>(cacheKey);
    if (cached) return cached;

    const suggestions: string[] = [];

    // اقتراحات من المنتجات
    const products = await this.productModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { nameEn: { $regex: query, $options: 'i' } },
        ],
        status: 'active',
        deletedAt: null,
      })
      .limit(limit)
      .select('name nameEn')
      .lean();

    suggestions.push(...products.map((p) => (lang === 'ar' ? p.name : p.nameEn)));

    // اقتراحات من الفئات
    const categories = await this.categoryModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { nameEn: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
        deletedAt: null,
      })
      .limit(limit)
      .select('name nameEn')
      .lean();

    suggestions.push(...categories.map((c) => (lang === 'ar' ? c.name : c.nameEn)));

    // إزالة التكرار
    const unique = [...new Set(suggestions)].slice(0, limit);

    await this.cacheService.set(cacheKey, unique, { ttl: this.CACHE_TTL.SUGGESTIONS });
    return unique;
  }

  // ==================== Facets (فلاتر ديناميكية) ====================
  private async generateFacets(baseQuery: Record<string, unknown>): Promise<FacetDto[]> {
    const facets: FacetDto[] = [];

    // Facet: Categories
    const categoryFacet = await this.productModel.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
    ]);

    if (categoryFacet.length > 0) {
      facets.push({
        field: 'category',
        values: categoryFacet.map((f) => ({
          value: f.category.name,
          count: f.count,
        })),
      });
    }

    // Facet: Brands
    const brandFacet = await this.productModel.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$brandId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'brands',
          localField: '_id',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: '$brand' },
    ]);

    if (brandFacet.length > 0) {
      facets.push({
        field: 'brand',
        values: brandFacet.map((f) => ({
          value: f.brand.name,
          count: f.count,
        })),
      });
    }

    // Facet: Tags
    const tagsFacet = await this.productModel.aggregate([
      { $match: baseQuery },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    if (tagsFacet.length > 0) {
      facets.push({
        field: 'tags',
        values: tagsFacet.map((f) => ({
          value: f._id,
          count: f.count,
        })),
      });
    }

    return facets;
  }

  // ==================== Price Range ====================
  private async getPriceRange(
    query: Record<string, unknown>,
  ): Promise<{ min: number; max: number }> {
    const result = await this.productModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          min: { $min: '$priceRange.min' },
          max: { $max: '$priceRange.max' },
        },
      },
    ]);

    return result[0] || { min: 0, max: 0 };
  }

  // ==================== Relevance Scoring ====================
  private calculateRelevance(
    product: Pick<
      ProductLean,
      'name' | 'nameEn' | 'description' | 'descriptionEn' | 'tags' | 'isFeatured' | 'rating'
    >,
    query: string,
    lang: 'ar' | 'en',
  ): number {
    let score = 0;
    const q = query.toLowerCase().trim();
    const name = (lang === 'ar' ? product.name : product.nameEn)?.toLowerCase() || '';
    const nameOther = (lang === 'ar' ? product.nameEn : product.name)?.toLowerCase() || '';
    const desc = (lang === 'ar' ? product.description : product.descriptionEn)?.toLowerCase() || '';
    const descOther =
      (lang === 'ar' ? product.descriptionEn : product.description)?.toLowerCase() || '';

    // التحقق من المطابقة في الاسم (أولوية عالية جداً)
    let nameMatch = false;

    // اسم المنتج يطابق تماماً (أعلى أولوية)
    if (name === q) {
      score += 1000;
      nameMatch = true;
    }
    // اسم المنتج يبدأ بنص البحث
    else if (name.startsWith(q)) {
      score += 500;
      nameMatch = true;
    }
    // اسم المنتج يحتوي على نص البحث
    else if (name.includes(q)) {
      score += 250;
      nameMatch = true;
    }
    // التحقق من الاسم باللغة الأخرى (أولوية أقل قليلاً)
    else if (nameOther === q) {
      score += 800;
      nameMatch = true;
    } else if (nameOther.startsWith(q)) {
      score += 400;
      nameMatch = true;
    } else if (nameOther.includes(q)) {
      score += 200;
      nameMatch = true;
    }

    // إذا لم يكن هناك تطابق في الاسم، نعطي نقاط قليلة جداً للمطابقة في الوصف/الوسوم
    if (!nameMatch) {
      // الوصف يحتوي على نص البحث (نقاط قليلة جداً)
      if (desc && desc.includes(q)) {
        score += 5;
      }
      // الوصف باللغة الأخرى
      if (descOther && descOther.includes(q)) {
        score += 3;
      }

      // Tags (نقاط قليلة جداً)
      if (product.tags?.some((tag: string) => tag.toLowerCase().includes(q))) {
        score += 8;
      }
    } else {
      // إذا كان هناك تطابق في الاسم، نعطي نقاط إضافية قليلة للوصف/الوسوم
      if (desc && desc.includes(q)) {
        score += 2;
      }
      if (product.tags?.some((tag: string) => tag.toLowerCase().includes(q))) {
        score += 3;
      }
    }

    // Boost for featured (فقط للمنتجات المطابقة في الاسم)
    if (nameMatch && product.isFeatured) {
      score += 20;
    }

    // Boost for rating (فقط للمنتجات المطابقة في الاسم)
    if (nameMatch && product.rating) {
      score += product.rating * 5;
    }

    return score;
  }

  private simpleRelevance(
    item:
      | Pick<ProductLean, 'name' | 'nameEn'>
      | Pick<CategoryLean, 'name' | 'nameEn'>
      | Pick<BrandLean, 'name' | 'nameEn'>,
    query: string,
    lang: 'ar' | 'en',
  ): number {
    let score = 0;
    const q = query.toLowerCase();
    const name = (lang === 'ar' ? item.name : item.nameEn).toLowerCase();

    if (name === q) score += 100;
    else if (name.startsWith(q)) score += 50;
    else if (name.includes(q)) score += 25;

    return score;
  }

  // ==================== Cache Management ====================
  async clearSearchCaches(): Promise<void> {
    await this.cacheService.clear('search:*');
    this.logger.log('Cleared all search caches');
  }

  // =====================================================
  // ADMIN METHODS - إضافة لاحقاً عند ربط Search Logs
  // =====================================================

  /**
   * Get search statistics (Admin)
   */
  async getSearchStats() {
    // حساب الإحصائيات بناءً على البيانات الموجودة
    const [totalProducts, totalCategories, totalBrands] = await Promise.all([
      this.productModel.countDocuments({ status: 'active', deletedAt: null }),
      this.categoryModel.countDocuments({ isActive: true, deletedAt: null }),
      this.brandModel.countDocuments({ isActive: true }),
    ]);

    return {
      totalSearchableItems: totalProducts + totalCategories + totalBrands,
      products: totalProducts,
      categories: totalCategories,
      brands: totalBrands,
      cacheHitRate: 0, // سيتم حسابها لاحقاً مع Search Logs
      averageResponseTime: 0, // سيتم حسابها لاحقاً مع Search Logs
      topLanguage: 'ar',
      topEntityType: 'products',
    };
  }

  /**
   * Get top search terms (Admin)
   */
  async getTopSearchTerms(filters?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    language?: string;
  }) {
    const limit = filters?.limit || 10;
    const lang = filters?.language || 'ar';

    // نحصل على المنتجات الأكثر مشاهدة كمؤشر للمصطلحات الأكثر بحثاً
    const topProducts = await this.productModel
      .find({ status: 'active', deletedAt: null })
      .sort({ viewsCount: -1 })
      .limit(limit)
      .select('name nameEn viewsCount')
      .lean();

    return topProducts.map((p) => ({
      term: lang === 'ar' ? p.name : p.nameEn,
      count: p.viewsCount || 0,
    }));
  }

  /**
   * Get zero-result searches (Admin)
   */
  async getZeroResultSearches(_filters?: {
    limit?: number;
    page?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    // ملاحظة: هذه الوظيفة تتطلب Search Logs Schema لتتبع البحث الفعلي
    // حالياً نرجع بيانات فارغة حتى يتم إضافة Search Logs
    return {
      data: [],
      pagination: {
        total: 0,
        page: _filters?.page || 1,
        limit: _filters?.limit || 20,
        pages: 0,
      },
      message: 'Search logs not implemented yet',
    };
  }

  /**
   * Get search logs with pagination (Admin)
   */
  async getSearchLogs(_filters?: {
    query?: string;
    userId?: string;
    hasResults?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
  }) {
    // ملاحظة: هذه الوظيفة تتطلب Search Logs Schema لتتبع البحث الفعلي
    // حالياً نرجع بيانات فارغة حتى يتم إضافة Search Logs
    return {
      data: [],
      pagination: {
        total: 0,
        page: _filters?.page || 1,
        limit: _filters?.limit || 20,
        pages: 0,
      },
      message: 'Search logs not implemented yet',
    };
  }

  /**
   * Get search trends over time (Admin)
   */
  async getSearchTrends() {
    // ملاحظة: هذه الوظيفة تتطلب Search Logs Schema لتتبع البحث الفعلي
    // حالياً نرجع اتجاهات بناءً على نشاط المنتجات
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const productActivity = await this.productModel.aggregate([
      {
        $match: {
          status: 'active',
          deletedAt: null,
          createdAt: { $gte: lastMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return productActivity.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count,
      type: 'product_activity',
    }));
  }

  /**
   * Get products most found in searches (Admin)
   */
  async getMostSearchedProducts(filters?: { limit?: number; startDate?: Date; endDate?: Date }) {
    const limit = filters?.limit || 20;

    // نحلل المنتجات الأكثر ظهوراً في نتائج البحث بناءً على:
    // - عدد المشاهدات
    // - التصنيف
    // - عدد المراجعات

    const products = await this.productModel
      .find({
        status: 'active',
        deletedAt: null,
      })
      .sort({ viewsCount: -1, rating: -1, reviewsCount: -1 })
      .limit(limit)
      .populate('categoryId', 'name nameEn')
      .populate('brandId', 'name nameEn')
      .select('name nameEn viewsCount rating reviewsCount isFeatured')
      .lean();

    return products.map((p) => ({
      _id: p._id,
      name: p.name,
      nameEn: p.nameEn,
      viewsCount: p.viewsCount || 0,
      rating: p.rating || 0,
      reviewsCount: p.reviewsCount || 0,
      isFeatured: p.isFeatured || false,
      category: p.categoryId,
      brand: p.brandId,
    }));
  }

  /**
   * Get categories most searched (Admin)
   */
  async getMostSearchedCategories(filters?: { limit?: number; startDate?: Date; endDate?: Date }) {
    const limit = filters?.limit || 10;

    const categories = await this.categoryModel
      .find({
        isActive: true,
        deletedAt: null,
      })
      .sort({ productsCount: -1, isFeatured: -1 })
      .limit(limit)
      .select('name nameEn productsCount isFeatured')
      .lean();

    return categories.map((c) => ({
      _id: c._id,
      name: c.name,
      nameEn: c.nameEn,
      productsCount: c.productsCount || 0,
      isFeatured: c.isFeatured || false,
    }));
  }

  /**
   * Get brands most searched (Admin)
   */
  async getMostSearchedBrands(filters?: { limit?: number; startDate?: Date; endDate?: Date }) {
    const limit = filters?.limit || 10;

    // نحصل على البراندات الأكثر شيوعاً بناءً على عدد المنتجات
    const brands = await this.brandModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .limit(limit)
      .select('name nameEn')
      .lean();

    // نحسب عدد المنتجات لكل براند
    const brandsWithCount = await Promise.all(
      brands.map(async (brand) => {
        const productCount = await this.productModel.countDocuments({
          brandId: brand._id,
          status: 'active',
          deletedAt: null,
        });

        return {
          _id: brand._id,
          name: brand.name,
          nameEn: brand.nameEn,
          productCount,
        };
      }),
    );

    // ترتيب حسب عدد المنتجات
    return brandsWithCount.sort((a, b) => b.productCount - a.productCount);
  }

  /**
   * Get search performance metrics (Admin)
   */
  async getSearchPerformanceMetrics() {
    // إحصائيات الأداء العامة

    const [totalProducts, totalCategories, totalBrands, activeProducts] = await Promise.all([
      this.productModel.countDocuments({ deletedAt: null }),
      this.categoryModel.countDocuments({ deletedAt: null }),
      this.brandModel.countDocuments(),
      this.productModel.countDocuments({ status: 'active', deletedAt: null }),
    ]);

    return {
      indexedData: {
        totalProducts,
        activeProducts,
        totalCategories,
        totalBrands,
      },
      cacheStatus: {
        searchCacheTTL: this.CACHE_TTL.SEARCH_RESULTS,
        suggestionsCacheTTL: this.CACHE_TTL.SUGGESTIONS,
        facetsCacheTTL: this.CACHE_TTL.FACETS,
      },
      systemHealth: 'healthy' as const,
    };
  }
}
