import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { VariantsService } from './variants.service';
import { ResponseCacheInterceptor, CacheResponse } from '../../shared/interceptors/response-cache.interceptor';
import { ProductStatus } from './schemas/product.schema';

@ApiTags('products')
@Controller('products')
@UseInterceptors(ResponseCacheInterceptor)
export class ProductsPublicController {
  constructor(
    private productsService: ProductsService,
    private variantsService: VariantsService,
  ) {}

  // ==================== قائمة المنتجات ====================
  @Get()
  @ApiOperation({ 
    summary: 'Get products list',
    description: 'Retrieves a paginated list of products with optional filtering'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for product name or description' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'brandId', required: false, type: String, description: 'Filter by brand ID' })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean, description: 'Filter featured products' })
  @ApiQuery({ name: 'isNew', required: false, type: Boolean, description: 'Filter new products' })
  @ApiOkResponse({ 
    description: 'Products list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              name: { type: 'string', example: 'Solar Panel 300W' },
              description: { type: 'string', example: 'High efficiency solar panel' },
              price: { type: 'number', example: 299.99 },
              currency: { type: 'string', example: 'USD' },
              images: { type: 'array', items: { type: 'string' } },
              category: { type: 'object' },
              brand: { type: 'object' },
              isFeatured: { type: 'boolean', example: true },
              isNew: { type: 'boolean', example: false }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 150 },
            pages: { type: 'number', example: 8 }
          }
        }
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Get product details',
    description: 'Retrieves detailed information about a specific product'
  })
  @ApiParam({ name: 'id', description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @ApiOkResponse({ 
    description: 'Product details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Solar Panel 300W' },
            description: { type: 'string', example: 'High efficiency solar panel with 20% efficiency' },
            price: { type: 'number', example: 299.99 },
            currency: { type: 'string', example: 'USD' },
            images: { type: 'array', items: { type: 'string' } },
            variants: { type: 'array', items: { type: 'object' } },
            specifications: { type: 'object' },
            category: { type: 'object' },
            brand: { type: 'object' },
            isFeatured: { type: 'boolean', example: true },
            isNew: { type: 'boolean', example: false },
            views: { type: 'number', example: 150 }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
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

