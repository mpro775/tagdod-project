import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { ResponseCacheInterceptor, CacheResponse } from '../../shared/interceptors/response-cache.interceptor';

@ApiTags('attributes-public')
@Controller('attributes')
@UseInterceptors(ResponseCacheInterceptor)
export class AttributesPublicController {
  constructor(private attributesService: AttributesService) {}

  // ==================== قائمة السمات النشطة ====================
  @Get()
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async listAttributes() {
    const attributes = await this.attributesService.listAttributes({ 
      isActive: true 
    });
    return { data: attributes };
  }

  // ==================== السمات القابلة للفلترة ====================
  @Get('filterable')
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getFilterableAttributes() {
    const attributes = await this.attributesService.listAttributes({ 
      isActive: true, 
      isFilterable: true,
      showInFilters: true,
    });
    
    // جلب القيم لكل سمة
    const attributesWithValues = await Promise.all(
      attributes.map(async (attr: any) => {
        const values = await this.attributesService.listValues(String(attr._id));
        return {
          ...attr,
          values,
        };
      })
    );

    return { data: attributesWithValues };
  }

  // ==================== عرض سمة واحدة مع قيمها ====================
  @Get(':id')
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getAttribute(@Param('id') id: string) {
    const attribute = await this.attributesService.getAttribute(id);
    return { data: attribute };
  }
}

