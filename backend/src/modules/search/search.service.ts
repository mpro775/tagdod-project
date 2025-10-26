import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Lean result types
type PopulatedName = { name: string; nameEn: string };
type PriceRange = { min: number; max: number };
type ProductLean = {
  _id: Types.ObjectId;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  mainImage?: string;
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
  ) {}

  // Types for lean results and populated refs
  private getNameFromRef(ref: Types.ObjectId | PopulatedName | undefined, lang: 'ar' | 'en') {
    if (ref && typeof ref === 'object' && 'name' in ref && 'nameEn' in ref) {
      return lang === 'ar' ? ref.name : ref.nameEn;
    }
    return undefined;
  }

  // ==================== البحث الشامل ====================
  async universalSearch(dto: SearchQueryDto) {
    const { q, lang = 'ar', entity = SearchEntity.ALL, page = 1, limit = 20 } = dto;

    const cacheKey = `search:universal:${JSON.stringify(dto)}`;
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
      const products = await this.searchProductsSimple(q, lang, limit);
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
  async advancedProductSearch(dto: AdvancedProductSearchDto): Promise<ProductSearchResultDto> {
    const {
      q,
      lang = 'ar',
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
            pipeline: [
              { $match: { deletedAt: null, isActive: true } }
            ]
          }
        },
        {
          $match: {
            'variants.basePriceUSD': {
              ...(minPrice !== undefined && { $gte: minPrice }),
              ...(maxPrice !== undefined && { $lte: maxPrice })
            }
          }
        },
        {
          $project: {
            variants: 0 // إزالة variants من النتيجة النهائية
          }
        }
      ]);

      // إضافة IDs للمنتجات المطابقة للفلتر
      if (productsWithPriceRange.length > 0) {
        query._id = { $in: productsWithPriceRange.map(p => p._id) };
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
        if (q) {
          // للبحث النصي، نرتب حسب التطابق
          sort.createdAt = -1;
        } else {
          sort.createdAt = -1;
        }
    }

    // Execute query
    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('categoryId', 'name nameEn')
        .populate('brandId', 'name nameEn')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<ProductLean[]>(),
      this.productModel.countDocuments(query),
    ]);

    // Map results
    const results: SearchResultDto[] = products.map((product) => ({
      type: 'product' as const,
      id: String(product._id),
      title: lang === 'ar' ? product.name : product.nameEn,
      titleEn: product.nameEn,
      description: lang === 'ar' ? product.description : product.descriptionEn,
      descriptionEn: product.descriptionEn,
      thumbnail: product.mainImage,
      metadata: {
        category: this.getNameFromRef(product.categoryId, lang),
        brand: this.getNameFromRef(product.brandId, lang),
        priceRange: product.priceRange,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        tags: product.tags,
      },
      relevanceScore: q ? this.calculateRelevance(product, q, lang) : 0,
      createdAt: product.createdAt,
    }));

    const response: ProductSearchResultDto = {
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .lean<ProductSimpleLean[]>();

    return products.map((p) => ({
      type: 'product' as const,
      id: String(p._id),
      title: lang === 'ar' ? p.name : p.nameEn,
      titleEn: p.nameEn,
      description: lang === 'ar' ? p.description : p.descriptionEn,
      thumbnail: p.mainImage,
      metadata: { type: 'product' },
      relevanceScore: q ? this.calculateRelevance(p, q, lang) : 0,
      createdAt: p.createdAt,
    }));
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
    const q = query.toLowerCase();
    const name = (lang === 'ar' ? product.name : product.nameEn).toLowerCase();
    const desc = (lang === 'ar' ? product.description : product.descriptionEn)?.toLowerCase();

    // اسم المنتج يطابق تماماً
    if (name === q) score += 100;
    // اسم المنتج يبدأ بنص البحث
    else if (name.startsWith(q)) score += 50;
    // اسم المنتج يحتوي على نص البحث
    else if (name.includes(q)) score += 25;

    // الوصف يحتوي على نص البحث
    if (desc && desc.includes(q)) score += 10;

    // Tags
    if (product.tags?.some((tag: string) => tag.toLowerCase().includes(q))) {
      score += 15;
    }

    // Boost for featured
    if (product.isFeatured) score += 10;

    // Boost for rating
    if (product.rating) score += product.rating * 2;

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
  async getMostSearchedProducts(filters?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
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
  async getMostSearchedCategories(filters?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
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
  async getMostSearchedBrands(filters?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
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
