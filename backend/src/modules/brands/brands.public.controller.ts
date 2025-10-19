import { 
  Controller, 
  Get, 
  Param,
  Query
} from '@nestjs/common';
import { 
  ApiOperation, 
  ApiTags, 
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { ListBrandsDto } from './dto/brand.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandsPublicController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة العلامات التجارية النشطة',
    description: 'يُرجع قائمة بجميع العلامات التجارية النشطة مع إمكانية التصفية والترقيم. هذا endpoint عام ولا يتطلب مصادقة.',
    tags: ['العلامات التجارية العامة']
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'البحث في أسماء العلامات التجارية',
    example: 'سامسونج'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'رقم الصفحة',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد العناصر في الصفحة',
    example: 10
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'ترتيب النتائج',
    example: 'name',
    enum: ['name', 'createdAt', 'updatedAt']
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'اتجاه الترتيب',
    example: 'asc',
    enum: ['asc', 'desc']
  })
  @ApiOkResponse({
    description: 'تم الحصول على قائمة العلامات التجارية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'سامسونج' },
              nameEn: { type: 'string', example: 'Samsung' },
              slug: { type: 'string', example: 'samsung' },
              description: { type: 'string', example: 'شركة تقنية كورية جنوبية' },
              logoUrl: { type: 'string', example: 'https://example.com/samsung-logo.png' },
              website: { type: 'string', example: 'https://samsung.com' },
              isActive: { type: 'boolean', example: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 5 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  async getActiveBrands(@Query() dto: ListBrandsDto) {
    // For public endpoint, always filter active brands only
    const result = await this.brandsService.listBrands({
      ...dto,
      isActive: true,
    });
    
    return {
      success: true,
      data: result.brands,
      pagination: result.pagination,
    };
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'الحصول على علامة تجارية بواسطة الـ slug',
    description: 'يُرجع تفاصيل علامة تجارية محددة باستخدام الـ slug. هذا endpoint عام ولا يتطلب مصادقة.',
    tags: ['العلامات التجارية العامة']
  })
  @ApiParam({
    name: 'slug',
    description: 'الـ slug الخاص بالعلامة التجارية',
    example: 'samsung',
    type: 'string'
  })
  @ApiOkResponse({
    description: 'تم الحصول على العلامة التجارية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'سامسونج' },
            nameEn: { type: 'string', example: 'Samsung' },
            slug: { type: 'string', example: 'samsung' },
            description: { type: 'string', example: 'شركة تقنية كورية جنوبية' },
            logoUrl: { type: 'string', example: 'https://example.com/samsung-logo.png' },
            website: { type: 'string', example: 'https://samsung.com' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'العلامة التجارية غير موجودة',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'العلامة التجارية غير موجودة' }
      }
    }
  })
  async getBrandBySlug(@Param('slug') slug: string) {
    const brand = await this.brandsService.getBrandBySlug(slug);
    return {
      success: true,
      data: brand,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على علامة تجارية بواسطة المعرف',
    description: 'يُرجع تفاصيل علامة تجارية محددة باستخدام المعرف (ObjectId). هذا endpoint عام ولا يتطلب مصادقة.',
    tags: ['العلامات التجارية العامة']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف العلامة التجارية (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0',
    type: 'string'
  })
  @ApiOkResponse({
    description: 'تم الحصول على العلامة التجارية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'سامسونج' },
            nameEn: { type: 'string', example: 'Samsung' },
            slug: { type: 'string', example: 'samsung' },
            description: { type: 'string', example: 'شركة تقنية كورية جنوبية' },
            logoUrl: { type: 'string', example: 'https://example.com/samsung-logo.png' },
            website: { type: 'string', example: 'https://samsung.com' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'العلامة التجارية غير موجودة',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'العلامة التجارية غير موجودة' }
      }
    }
  })
  async getBrandById(@Param('id') id: string) {
    const brand = await this.brandsService.getBrandById(id);
    return {
      success: true,
      data: brand,
    };
  }
}

