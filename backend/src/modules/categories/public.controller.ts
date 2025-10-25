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
import {
  ResponseCacheInterceptor,
  CacheResponse,
} from '../../shared/interceptors/response-cache.interceptor';

@ApiTags('الفئات-العامة')
@Controller('categories')
@UseInterceptors(ResponseCacheInterceptor)
export class CategoriesPublicController {
  constructor(private categoriesService: CategoriesService) {}

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
