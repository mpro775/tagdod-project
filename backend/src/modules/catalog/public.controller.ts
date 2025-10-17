import { Controller, Get, Query, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { ResponseCacheInterceptor, CacheResponse } from '../../shared/interceptors/response-cache.interceptor';
// Currency type definition
type Currency = 'USD' | 'SAR' | 'YER' ;

interface ListProductsQuery {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  currency?: Currency;
  brandId?: string;
}

@ApiTags('catalog-public')
@Controller()
@UseInterceptors(ResponseCacheInterceptor)
export class CatalogPublicController {
  constructor(private svc: CatalogService) {}

  @Get('products')
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async products(@Query() q: ListProductsQuery) {
    const page = Number(q.page || 1);
    const limit = Number(q.limit || 20);
    const search = q.search;
    const categoryId = q.categoryId;
    const currency = q.currency;
    const brandId = q.brandId;
    const res = await this.svc.listProducts({ page, limit, search, categoryId, currency, brandId });
    return { data: res.items, meta: res.meta };
  }

  @Get('products/detail')
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async productDetail(
    @Query('id') id: string, 
    @Query('currency') currency?: Currency,
    @Req() req?: { user?: { sub: string; preferredCurrency?: Currency } }
  ) {
    // استخدام العملة المفضلة للمستخدم إذا لم يتم تحديد عملة أخرى
    const userCurrency = req?.user?.preferredCurrency;
    const finalCurrency = currency || userCurrency || 'USD';
    const userId = req?.user?.sub;
    
    const res = await this.svc.getProduct(id, finalCurrency, userId);
    return { data: res };
  }
}
