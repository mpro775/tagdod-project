import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { ProductService } from '../products/services/product.service';
import { ProductStatus } from '../products/schemas/product.schema';
import {
  ResponseCacheInterceptor,
  CacheResponse,
} from '../../shared/interceptors/response-cache.interceptor';

@ApiTags('الفئات-العامة')
@Controller('categories')
@UseInterceptors(ResponseCacheInterceptor)
export class CategoriesPublicController {
  constructor(
    private categoriesService: CategoriesService,
    private productService: ProductService,
  ) {}

  // ==================== قائمة الفئات ====================
  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة الفئات النشطة',
    description: 'الحصول على قائمة بجميع الفئات النشطة مع إمكانية التصفية حسب الفئة الأب أو الفئات المميزة. النتائج مخزنة مؤقتاً لمدة 30 دقيقة.',
    tags: ['الفئات العامة']
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'تصفية حسب الفئة الأب (null للفئات الجذرية)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'تصفية الفئات المميزة فقط',
    example: true
  })
  @ApiOkResponse({
    description: 'تم الحصول على قائمة الفئات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'الإلكترونيات' },
              nameEn: { type: 'string', example: 'Electronics' },
              slug: { type: 'string', example: 'electronics' },
              description: { type: 'string', example: 'جميع الأجهزة الإلكترونية والكهربائية' },
              parentId: { type: 'string', example: null },
              isActive: { type: 'boolean', example: true },
              isFeatured: { type: 'boolean', example: true },
              order: { type: 'number', example: 1 },
              productCount: { type: 'number', example: 25 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async listCategories(
    @Query('parentId') parentId?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    const pid = parentId === 'null' ? null : parentId;
    const featured = isFeatured === 'true' ? true : undefined;

    const data = await this.categoriesService.listCategories({
      parentId: pid,
      isActive: true,
      isFeatured: featured,
    });

    return data;
  }

  // ==================== شجرة الفئات الكاملة ====================
  @Get('tree')
  @ApiOperation({
    summary: 'الحصول على شجرة الفئات الكاملة',
    description: 'الحصول على شجرة الفئات الكاملة مع جميع المستويات والعلاقات الهرمية. النتائج مخزنة مؤقتاً لمدة ساعة واحدة.',
    tags: ['الفئات العامة']
  })
  @ApiOkResponse({
    description: 'تم الحصول على شجرة الفئات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'الإلكترونيات' },
              nameEn: { type: 'string', example: 'Electronics' },
              slug: { type: 'string', example: 'electronics' },
              description: { type: 'string', example: 'جميع الأجهزة الإلكترونية' },
              isActive: { type: 'boolean', example: true },
              isFeatured: { type: 'boolean', example: true },
              order: { type: 'number', example: 1 },
              productCount: { type: 'number', example: 25 },
              children: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
                    name: { type: 'string', example: 'الهواتف' },
                    nameEn: { type: 'string', example: 'Phones' },
                    slug: { type: 'string', example: 'phones' },
                    description: { type: 'string', example: 'الهواتف الذكية والملحقات' },
                    isActive: { type: 'boolean', example: true },
                    isFeatured: { type: 'boolean', example: false },
                    productCount: { type: 'number', example: 15 },
                    children: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @CacheResponse({ ttl: 3600 }) // 1 hour
  async getCategoryTree() {
    const data = await this.categoriesService.getCategoryTree();
    return data;
  }

  // ==================== المنتجات حسب الفئة ====================
  @Get(':id/products')
  @ApiOperation({
    summary: 'الحصول على المنتجات حسب الفئة',
    description: 'الحصول على قائمة بالمنتجات العامة (النشطة) التي تنتمي إلى فئة محددة. النتائج مخزنة مؤقتاً لمدة 5 دقائق.',
    tags: ['الفئات العامة']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة (ObjectId أو Slug)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'رقم الصفحة (افتراضي: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'عدد العناصر في الصفحة (افتراضي: 20)',
    example: 20
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'نص البحث في أسماء المنتجات',
    example: 'solar'
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    type: String,
    description: 'تصفية حسب البراند',
    example: '64a1b2c3d4e5f6789abcdef1'
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    type: Boolean,
    description: 'تصفية المنتجات المميزة فقط',
    example: true
  })
  @ApiQuery({
    name: 'isNew',
    required: false,
    type: Boolean,
    description: 'تصفية المنتجات الجديدة فقط',
    example: false
  })
  @ApiOkResponse({
    description: 'تم الحصول على المنتجات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '64prod123abc' },
                  name: { type: 'string', example: 'منتج رقم 1' },
                  nameEn: { type: 'string', example: 'Product 1' },
                  slug: { type: 'string', example: 'product-1' },
                  description: { type: 'string', example: 'وصف المنتج' },
                  categoryId: { type: 'object' },
                  brandId: { type: 'object' },
                  mainImageId: { type: 'object' },
                  isActive: { type: 'boolean', example: true },
                  isFeatured: { type: 'boolean', example: false },
                  isNew: { type: 'boolean', example: true },
                  status: { type: 'string', example: 'active' },
                  createdAt: { type: 'string', format: 'date-time' },
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                total: { type: 'number', example: 50 },
                totalPages: { type: 'number', example: 3 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false }
              }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة أو غير نشطة' })
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getCategoryProducts(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('brandId') brandId?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('isNew') isNew?: string,
  ) {
    // التحقق من وجود الفئة
    await this.categoriesService.getCategory(id);

    // جلب المنتجات العامة فقط
    const result = await this.productService.list({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      categoryId: id,
      brandId,
      status: ProductStatus.ACTIVE, // فقط المنتجات النشطة (public)
      isActive: true, // فقط المنتجات المفعلة (public)
      isFeatured: isFeatured === 'true' ? true : undefined,
      isNew: isNew === 'true' ? true : undefined,
      includeDeleted: false, // فقط المنتجات غير المحذوفة
    });

    return result;
  }

  // ==================== عرض فئة واحدة مع التفاصيل ====================
  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على فئة واحدة',
    description: 'الحصول على تفاصيل فئة محددة مع جميع المعلومات المتاحة للجمهور. النتائج مخزنة مؤقتاً لمدة 30 دقيقة.',
    tags: ['الفئات العامة']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة (ObjectId أو Slug)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم الحصول على الفئة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'الإلكترونيات' },
            nameEn: { type: 'string', example: 'Electronics' },
            slug: { type: 'string', example: 'electronics' },
            description: { type: 'string', example: 'جميع الأجهزة الإلكترونية والكهربائية' },
            parentId: { type: 'string', example: null },
            parent: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: 'parent_id' },
                name: { type: 'string', example: 'الفئة الأب' },
                nameEn: { type: 'string', example: 'Parent Category' },
                slug: { type: 'string', example: 'parent-category' }
              }
            },
            isActive: { type: 'boolean', example: true },
            isFeatured: { type: 'boolean', example: true },
            order: { type: 'number', example: 1 },
            productCount: { type: 'number', example: 25 },
            children: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
                  name: { type: 'string', example: 'الهواتف' },
                  nameEn: { type: 'string', example: 'Phones' },
                  slug: { type: 'string', example: 'phones' },
                  productCount: { type: 'number', example: 15 }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة أو غير نشطة' })
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getCategory(@Param('id') id: string) {
    const data = await this.categoriesService.getCategory(id);
    return data;
  }

  // ==================== الفئات المميزة فقط ====================
  @Get('featured/list')
  @ApiOperation({
    summary: 'الحصول على الفئات المميزة',
    description: 'الحصول على قائمة بالفئات المميزة النشطة فقط. النتائج مخزنة مؤقتاً لمدة 30 دقيقة.',
    tags: ['الفئات العامة']
  })
  @ApiOkResponse({
    description: 'تم الحصول على الفئات المميزة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'الإلكترونيات المميزة' },
              nameEn: { type: 'string', example: 'Featured Electronics' },
              slug: { type: 'string', example: 'featured-electronics' },
              description: { type: 'string', example: 'أفضل الأجهزة الإلكترونية المختارة' },
              parentId: { type: 'string', example: null },
              isActive: { type: 'boolean', example: true },
              isFeatured: { type: 'boolean', example: true },
              order: { type: 'number', example: 1 },
              productCount: { type: 'number', example: 10 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getFeaturedCategories() {
    const data = await this.categoriesService.listCategories({
      isActive: true,
      isFeatured: true,
    });
    return data;
  }
}
