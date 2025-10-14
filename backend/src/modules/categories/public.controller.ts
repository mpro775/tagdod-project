import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { ResponseCacheInterceptor, CacheResponse } from '../../shared/interceptors/response-cache.interceptor';

@ApiTags('categories-public')
@Controller('categories')
@UseInterceptors(ResponseCacheInterceptor)
export class CategoriesPublicController {
  constructor(private categoriesService: CategoriesService) {}

  // ==================== قائمة الفئات ====================
  @Get()
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async listCategories(
    @Query('parentId') parentId?: string,
    @Query('isFeatured') isFeatured?: string
  ) {
    const pid = parentId === 'null' ? null : parentId;
    const featured = isFeatured === 'true' ? true : undefined;
    
    const data = await this.categoriesService.listCategories({ 
      parentId: pid, 
      isActive: true,
      isFeatured: featured,
    });
    
    return { data };
  }

  // ==================== شجرة الفئات الكاملة ====================
  @Get('tree')
  @CacheResponse({ ttl: 3600 }) // 1 hour
  async getCategoryTree() {
    const data = await this.categoriesService.getCategoryTree();
    return { data };
  }

  // ==================== عرض فئة واحدة مع التفاصيل ====================
  @Get(':id')
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getCategory(@Param('id') id: string) {
    const data = await this.categoriesService.getCategory(id);
    return { data };
  }

  // ==================== الفئات المميزة فقط ====================
  @Get('featured/list')
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getFeaturedCategories() {
    const data = await this.categoriesService.listCategories({ 
      isActive: true, 
      isFeatured: true 
    });
    return { data };
  }
}

