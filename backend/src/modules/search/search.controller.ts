import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, AdvancedProductSearchDto } from './dto/search.dto';

@ApiTags('البحث')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // ==================== البحث الشامل ====================
  @Get()
  @ApiOperation({
    summary: 'بحث شامل في المنتجات، الفئات، والبراندات',
    description: 'البحث في جميع كيانات النظام (منتجات، فئات، علامات تجارية) باستخدام نص بحث واحد'
  })
  @ApiResponse({
    status: 200,
    description: 'تم إجراء البحث بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'prod123', description: 'معرف المنتج' },
                  name: { type: 'string', example: 'هاتف ذكي سامسونج', description: 'اسم المنتج' },
                  price: { type: 'number', example: 250.99, description: 'السعر' },
                  category: { type: 'string', example: 'إلكترونيات', description: 'الفئة' },
                  brand: { type: 'string', example: 'سامسونج', description: 'العلامة التجارية' }
                }
              }
            },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'cat123', description: 'معرف الفئة' },
                  name: { type: 'string', example: 'إلكترونيات', description: 'اسم الفئة' },
                  productCount: { type: 'number', example: 45, description: 'عدد المنتجات في الفئة' }
                }
              }
            },
            brands: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'brand123', description: 'معرف العلامة التجارية' },
                  name: { type: 'string', example: 'سامسونج', description: 'اسم العلامة التجارية' },
                  productCount: { type: 'number', example: 120, description: 'عدد المنتجات للعلامة' }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                totalResults: { type: 'number', example: 245, description: 'إجمالي النتائج' },
                searchTime: { type: 'number', example: 0.15, description: 'وقت البحث بالثواني' },
                query: { type: 'string', example: 'هاتف سامسونج', description: 'نص البحث المستخدم' }
              }
            }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'q', required: false, description: 'نص البحث' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ar', 'en'], description: 'اللغة' })
  @ApiQuery({ name: 'entity', required: false, enum: ['products', 'categories', 'brands', 'all'], description: 'نوع الكيانات' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async universalSearch(@Query() dto: SearchQueryDto) {
    const data = await this.searchService.universalSearch(dto);
    return { data };
  }

  // ==================== بحث المنتجات المتقدم ====================
  @Get('products')
  @ApiOperation({
    summary: 'بحث متقدم في المنتجات مع filters',
    description: 'بحث متقدم في المنتجات مع فلاتر متعددة تشمل الفئات، العلامات التجارية، الأسعار، التصنيفات، والخصائص'
  })
  @ApiResponse({
    status: 200,
    description: 'تم إجراء البحث المتقدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'prod123', description: 'معرف المنتج' },
                  name: { type: 'string', example: 'هاتف ذكي سامسونج', description: 'اسم المنتج' },
                  price: { type: 'number', example: 250.99, description: 'السعر' },
                  category: { type: 'string', example: 'إلكترونيات', description: 'الفئة' },
                  brand: { type: 'string', example: 'سامسونج', description: 'العلامة التجارية' },
                  rating: { type: 'number', example: 4.5, description: 'التصنيف' },
                  isFeatured: { type: 'boolean', example: true, description: 'مميز' },
                  isNew: { type: 'boolean', example: false, description: 'جديد' }
                }
              }
            },
            facets: {
              type: 'object',
              properties: {
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'cat123' },
                      name: { type: 'string', example: 'إلكترونيات' },
                      count: { type: 'number', example: 45 }
                    }
                  }
                },
                brands: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'brand123' },
                      name: { type: 'string', example: 'سامسونج' },
                      count: { type: 'number', example: 12 }
                    }
                  }
                },
                priceRanges: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      min: { type: 'number', example: 100 },
                      max: { type: 'number', example: 500 },
                      count: { type: 'number', example: 25 }
                    }
                  }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 125, description: 'إجمالي النتائج' },
                page: { type: 'number', example: 1, description: 'الصفحة الحالية' },
                limit: { type: 'number', example: 20, description: 'عدد النتائج في الصفحة' },
                totalPages: { type: 'number', example: 7, description: 'إجمالي الصفحات' }
              }
            }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'q', required: false, description: 'نص البحث' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ar', 'en'] })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isNew', required: false, type: Boolean })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'attributes', required: false, description: 'JSON string' })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'price', 'rating', 'views', 'createdAt', 'relevance'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeFacets', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async advancedProductSearch(@Query() dto: AdvancedProductSearchDto) {
    const data = await this.searchService.advancedProductSearch(dto);
    return { data };
  }

  // ==================== الاقتراحات (Autocomplete) ====================
  @Get('suggestions')
  @ApiOperation({
    summary: 'اقتراحات البحث (Autocomplete)',
    description: 'استرداد اقتراحات البحث التلقائية أثناء كتابة المستخدم لنص البحث'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الاقتراحات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string', example: 'هاتف سامسونج', description: 'نص الاقتراح' },
              type: { type: 'string', enum: ['product', 'category', 'brand'], example: 'product', description: 'نوع الاقتراح' },
              id: { type: 'string', example: 'prod123', description: 'معرف الكيان' },
              relevance: { type: 'number', example: 0.95, description: 'درجة الصلة' }
            }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'q', required: true, description: 'نص البحث' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ar', 'en'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSuggestions(
    @Query('q') query: string,
    @Query('lang') lang: 'ar' | 'en' = 'ar',
    @Query('limit') limit = 10,
  ) {
    const data = await this.searchService.getSearchSuggestions(query, lang, limit);
    return { data };
  }

  // ==================== Autocomplete (alias) ====================
  @Get('autocomplete')
  @ApiOperation({
    summary: 'الإكمال التلقائي للبحث',
    description: 'نفس وظيفة الاقتراحات ولكن باسم بديل للتوافق مع APIs القديمة'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد اقتراحات الإكمال التلقائي بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string', example: 'هاتف سامسونج', description: 'نص الاقتراح' },
              type: { type: 'string', enum: ['product', 'category', 'brand'], example: 'product', description: 'نوع الاقتراح' },
              id: { type: 'string', example: 'prod123', description: 'معرف الكيان' },
              relevance: { type: 'number', example: 0.95, description: 'درجة الصلة' }
            }
          }
        }
      }
    }
  })
  async autocomplete(
    @Query('q') query: string,
    @Query('lang') lang: 'ar' | 'en' = 'ar',
  ) {
    const data = await this.searchService.getSearchSuggestions(query, lang, 8);
    return { data };
  }
}
