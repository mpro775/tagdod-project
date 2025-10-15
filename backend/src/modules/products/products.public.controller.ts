import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { VariantsService } from './variants.service';
import { ResponseCacheInterceptor, CacheResponse } from '../../shared/interceptors/response-cache.interceptor';
import { ProductStatus } from './schemas/product.schema';

@ApiTags('products-public')
@Controller('products')
@UseInterceptors(ResponseCacheInterceptor)
export class ProductsPublicController {
  constructor(
    private productsService: ProductsService,
    private variantsService: VariantsService,
  ) {}

  // ==================== قائمة المنتجات ====================
  @Get()
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async listProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('isNew') isNew?: string,
  ) {
    return this.productsService.listProducts({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      categoryId,
      brandId,
      status: ProductStatus.ACTIVE,
      isFeatured: isFeatured === 'true' ? true : undefined,
      isNew: isNew === 'true' ? true : undefined,
    });
  }

  // ==================== عدد المنتجات ====================
  @Get('count')
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getProductsCount() {
    const count = await this.productsService.getProductsCount();
    return { data: { count } };
  }

  // ==================== تفاصيل منتج ====================
  @Get(':id')
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.getProduct(id);
    
    // زيادة المشاهدات
    await this.productsService.incrementViews(id);
    
    return { data: product };
  }

  // ==================== المنتجات المميزة ====================
  @Get('featured/list')
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getFeatured() {
    return this.productsService.listProducts({
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });
  }

  // ==================== المنتجات الجديدة ====================
  @Get('new/list')
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getNew() {
    return this.productsService.listProducts({
      isNew: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });
  }
}

