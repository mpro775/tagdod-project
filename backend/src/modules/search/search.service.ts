import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    private cacheService: CacheService,
  ) {}

  // ==================== البحث الشامل ====================
  async universalSearch(dto: SearchQueryDto) {
    const { q, lang = 'ar', entity = SearchEntity.ALL, page = 1, limit = 20 } = dto;
    
    const cacheKey = `search:universal:${JSON.stringify(dto)}`;
    const cached = await this.cacheService.get<any>(cacheKey);
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
    const query: any = { 
      status,
      deletedAt: null 
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

    // Price Range (من priceRange field)
    if (minPrice !== undefined || maxPrice !== undefined) {
      query['priceRange.min'] = query['priceRange.min'] || {};
      query['priceRange.max'] = query['priceRange.max'] || {};
      
      if (minPrice !== undefined) {
        query['priceRange.min'] = { $gte: minPrice };
      }
      if (maxPrice !== undefined) {
        query['priceRange.max'] = { $lte: maxPrice };
      }
    }

    // Attributes Filter
    if (attributes) {
      try {
        const attrObj = JSON.parse(attributes);
        Object.keys(attrObj).forEach(key => {
          query[`attributes.${key}`] = attrObj[key];
        });
      } catch (e) {
        this.logger.error('Invalid attributes JSON', e);
      }
    }

    // Sorting
    const sort: any = {};
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
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    // Map results
    const results: SearchResultDto[] = products.map(product => ({
      type: 'product' as const,
      id: String(product._id),
      title: lang === 'ar' ? product.name : product.nameEn,
      titleEn: product.nameEn,
      description: lang === 'ar' ? product.description : product.descriptionEn,
      descriptionEn: product.descriptionEn,
      thumbnail: product.mainImage,
      metadata: {
        category: (product.categoryId as any)?.[lang === 'ar' ? 'name' : 'nameEn'],
        brand: (product.brandId as any)?.[lang === 'ar' ? 'name' : 'nameEn'],
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
  private async searchProductsSimple(q: string | undefined, lang: 'ar' | 'en', limit: number): Promise<SearchResultDto[]> {
    const query: any = { status: 'active', deletedAt: null };
    
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
      .lean();

    return products.map(p => ({
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
  private async searchCategories(q: string | undefined, lang: 'ar' | 'en', limit: number): Promise<SearchResultDto[]> {
    const query: any = { isActive: true, deletedAt: null };
    
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
      .lean();

    return categories.map(c => ({
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
  private async searchBrands(q: string | undefined, lang: 'ar' | 'en', limit: number): Promise<SearchResultDto[]> {
    const query: any = { isActive: true };
    
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
      .lean();

    return brands.map(b => ({
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
  async getSearchSuggestions(query: string, lang: 'ar' | 'en' = 'ar', limit = 10): Promise<string[]> {
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

    suggestions.push(...products.map(p => lang === 'ar' ? p.name : p.nameEn));

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

    suggestions.push(...categories.map(c => lang === 'ar' ? c.name : c.nameEn));

    // إزالة التكرار
    const unique = [...new Set(suggestions)].slice(0, limit);

    await this.cacheService.set(cacheKey, unique, { ttl: this.CACHE_TTL.SUGGESTIONS });
    return unique;
  }

  // ==================== Facets (فلاتر ديناميكية) ====================
  private async generateFacets(baseQuery: any): Promise<FacetDto[]> {
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
        values: categoryFacet.map(f => ({
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
        values: brandFacet.map(f => ({
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
        values: tagsFacet.map(f => ({
          value: f._id,
          count: f.count,
        })),
      });
    }

    return facets;
  }

  // ==================== Price Range ====================
  private async getPriceRange(query: any): Promise<{ min: number; max: number }> {
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
  private calculateRelevance(product: any, query: string, lang: 'ar' | 'en'): number {
    let score = 0;
    const q = query.toLowerCase();
    const name = (lang === 'ar' ? product.name : product.nameEn).toLowerCase();
    const desc = (lang === 'ar' ? product.description : product.descriptionEn).toLowerCase();

    // اسم المنتج يطابق تماماً
    if (name === q) score += 100;
    // اسم المنتج يبدأ بنص البحث
    else if (name.startsWith(q)) score += 50;
    // اسم المنتج يحتوي على نص البحث
    else if (name.includes(q)) score += 25;

    // الوصف يحتوي على نص البحث
    if (desc.includes(q)) score += 10;

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

  private simpleRelevance(item: any, query: string, lang: 'ar' | 'en'): number {
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
}
