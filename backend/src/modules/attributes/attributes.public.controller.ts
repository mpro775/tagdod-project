import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiOkResponse
} from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import type { Attribute } from './schemas/attribute.schema';
import {
  ResponseCacheInterceptor,
  CacheResponse,
} from '../../shared/interceptors/response-cache.interceptor';

@ApiTags('السمات-العامة')
@Controller('attributes')
@UseInterceptors(ResponseCacheInterceptor)
export class AttributesPublicController {
  constructor(private attributesService: AttributesService) {}

  // ==================== قائمة السمات النشطة ====================
  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة السمات النشطة',
    description: 'يُرجع قائمة بجميع السمات النشطة المتاحة في النظام. النتائج مخزنة مؤقتاً لمدة 30 دقيقة.',
    tags: ['السمات العامة']
  })
  @ApiOkResponse({
    description: 'تم الحصول على قائمة السمات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'اللون' },
              nameEn: { type: 'string', example: 'Color' },
              slug: { type: 'string', example: 'color' },
              type: {
                type: 'string',
                enum: ['select', 'multiselect', 'text', 'number', 'boolean', 'color'],
                example: 'select'
              },
              description: { type: 'string', example: 'لون المنتج' },
              order: { type: 'number', example: 1 },
              isActive: { type: 'boolean', example: true },
              isFilterable: { type: 'boolean', example: true },
              isRequired: { type: 'boolean', example: false },
              showInFilters: { type: 'boolean', example: true },
              groupId: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
              usageCount: { type: 'number', example: 25 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async listAttributes() {
    const attributes = await this.attributesService.listAttributes({
      isActive: true,
    });
    return attributes;
  }

  // ==================== السمات القابلة للفلترة ====================
  @Get('filterable')
  @ApiOperation({
    summary: 'الحصول على السمات القابلة للفلترة',
    description: 'يُرجع قائمة بالسمات النشطة والقابلة للفلترة مع جميع قيمها. مفيد لبناء واجهات الفلترة في المتاجر الإلكترونية.',
    tags: ['السمات العامة']
  })
  @ApiOkResponse({
    description: 'تم الحصول على السمات القابلة للفلترة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'اللون' },
              nameEn: { type: 'string', example: 'Color' },
              slug: { type: 'string', example: 'color' },
              type: {
                type: 'string',
                enum: ['select', 'multiselect', 'text', 'number', 'boolean', 'color'],
                example: 'select'
              },
              description: { type: 'string', example: 'لون المنتج' },
              order: { type: 'number', example: 1 },
              isActive: { type: 'boolean', example: true },
              isFilterable: { type: 'boolean', example: true },
              isRequired: { type: 'boolean', example: false },
              showInFilters: { type: 'boolean', example: true },
              groupId: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
              usageCount: { type: 'number', example: 25 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              values: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef2' },
                    value: { type: 'string', example: 'أحمر' },
                    valueEn: { type: 'string', example: 'Red' },
                    slug: { type: 'string', example: 'red' },
                    hexCode: { type: 'string', example: '#FF0000' },
                    imageUrl: { type: 'string', example: 'https://example.com/red-color.jpg' },
                    imageId: { type: 'string', example: 'img_123' },
                    description: { type: 'string', example: 'اللون الأحمر' },
                    order: { type: 'number', example: 1 },
                    isActive: { type: 'boolean', example: true },
                    usageCount: { type: 'number', example: 10 },
                    attributeId: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getFilterableAttributes() {
    const attributes = await this.attributesService.listAttributes({
      isActive: true,
      isFilterable: true,
    });

    // جلب القيم لكل سمة
    const attributesWithValues = await Promise.all(
      attributes.map(async (attr: Attribute & { _id: unknown }) => {
        const values = await this.attributesService.listValues(String(attr._id));
        return {
          ...attr,
          values,
        };
      }),
    );

    return attributesWithValues;
  }

  // ==================== عرض سمة واحدة مع قيمها ====================
  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على سمة واحدة مع قيمها',
    description: 'يُرجع تفاصيل سمة محددة مع جميع قيمها المتاحة. مفيد لعرض تفاصيل سمة معينة.',
    tags: ['السمات العامة']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف السمة (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0',
    type: 'string'
  })
  @ApiOkResponse({
    description: 'تم الحصول على السمة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'اللون' },
            nameEn: { type: 'string', example: 'Color' },
            slug: { type: 'string', example: 'color' },
            type: {
              type: 'string',
              enum: ['select', 'multiselect', 'text', 'number', 'boolean', 'color'],
              example: 'select'
            },
            description: { type: 'string', example: 'لون المنتج' },
            order: { type: 'number', example: 1 },
            isActive: { type: 'boolean', example: true },
            isFilterable: { type: 'boolean', example: true },
            isRequired: { type: 'boolean', example: false },
            showInFilters: { type: 'boolean', example: true },
            groupId: { 
              type: 'object',
              properties: {
                _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
                name: { type: 'string', example: 'الخصائص الفيزيائية' },
                nameEn: { type: 'string', example: 'Physical Properties' }
              }
            },
            usageCount: { type: 'number', example: 25 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            values: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef2' },
                  value: { type: 'string', example: 'أحمر' },
                  valueEn: { type: 'string', example: 'Red' },
                  slug: { type: 'string', example: 'red' },
                  hexCode: { type: 'string', example: '#FF0000' },
                  imageUrl: { type: 'string', example: 'https://example.com/red-color.jpg' },
                  imageId: { type: 'string', example: 'img_123' },
                  description: { type: 'string', example: 'اللون الأحمر' },
                  order: { type: 'number', example: 1 },
                  isActive: { type: 'boolean', example: true },
                  usageCount: { type: 'number', example: 10 },
                  attributeId: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'السمة غير موجودة',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'السمة غير موجودة' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @CacheResponse({ ttl: 1800 }) // 30 minutes
  async getAttribute(@Param('id') id: string) {
    const attribute = await this.attributesService.getAttribute(id);
    return attribute;
  }
}
