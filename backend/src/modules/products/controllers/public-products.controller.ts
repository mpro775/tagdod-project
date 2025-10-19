import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { VariantService } from '../services/variant.service';
import { PricingService } from '../services/pricing.service';
import { InventoryService } from '../services/inventory.service';
import {
  ResponseCacheInterceptor,
  CacheResponse,
} from '../../../shared/interceptors/response-cache.interceptor';
import { ProductStatus } from '../schemas/product.schema';

@ApiTags('products')
@Controller('products')
@UseInterceptors(ResponseCacheInterceptor)
export class PublicProductsController {
  constructor(
    private productService: ProductService,
    private variantService: VariantService,
    private pricingService: PricingService,
    private inventoryService: InventoryService,
  ) {}

  // ==================== Products List ====================

  @Get()
  @ApiOperation({
    summary: 'Get products list',
    description: 'Retrieves a paginated list of products with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for product name or description',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by category ID',
  })
  @ApiQuery({ name: 'brandId', required: false, type: String, description: 'Filter by brand ID' })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    type: Boolean,
    description: 'Filter featured products',
  })
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
              category: { type: 'object' },
              brand: { type: 'object' },
              isFeatured: { type: 'boolean', example: true },
              isNew: { type: 'boolean', example: false },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 150 },
            totalPages: { type: 'number', example: 8 },
          },
        },
      },
    },
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
    return this.productService.list({
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

  // ==================== Product Details ====================

  @Get(':id')
  @ApiOperation({
    summary: 'Get product details',
    description: 'Retrieves detailed information about a specific product',
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
            product: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                name: { type: 'string', example: 'Solar Panel 300W' },
                description: { type: 'string', example: 'High efficiency solar panel' },
                category: { type: 'object' },
                brand: { type: 'object' },
                isFeatured: { type: 'boolean', example: true },
                isNew: { type: 'boolean', example: false },
                viewsCount: { type: 'number', example: 150 },
              },
            },
            variants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  sku: { type: 'string' },
                  basePriceUSD: { type: 'number' },
                  stock: { type: 'number' },
                  isAvailable: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getProduct(
    @Param('id') id: string,
    @Query('currency') currency?: string
  ) {
    const product = await this.productService.findById(id);
    const variants = await this.variantService.findByProductId(id);

    // زيادة المشاهدات
    await this.productService.incrementViews(id);

    // جلب الأسعار إذا تم تحديد عملة
    let variantsWithPrices = variants;
    if (currency && currency !== 'USD') {
      const prices = await this.pricingService.getProductPrices(id, currency);
      variantsWithPrices = variants.map(variant => {
        const price = prices.find(p => p.variantId === variant._id.toString());
        return {
          ...variant,
          ...price
        };
      });
    }

    return { 
      data: { 
        product, 
        variants: variantsWithPrices,
        currency: currency || 'USD'
      } 
    };
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Retrieves product information using URL slug',
  })
  @ApiParam({ name: 'slug', description: 'Product slug', example: 'solar-panel-300w' })
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getProductBySlug(
    @Param('slug') slug: string,
    @Query('currency') currency?: string
  ) {
    const product = await this.productService.findBySlug(slug);
    const variants = await this.variantService.findByProductId(product._id.toString());

    // زيادة المشاهدات
    await this.productService.incrementViews(product._id.toString());

    // جلب الأسعار إذا تم تحديد عملة
    let variantsWithPrices = variants;
    if (currency && currency !== 'USD') {
      const prices = await this.pricingService.getProductPrices(product._id.toString(), currency);
      variantsWithPrices = variants.map(variant => {
        const price = prices.find(p => p.variantId === variant._id.toString());
        return {
          ...variant,
          ...price
        };
      });
    }

    return { 
      data: { 
        product, 
        variants: variantsWithPrices,
        currency: currency || 'USD'
      } 
    };
  }

  // ==================== Featured & New Products ====================

  @Get('featured/list')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, description: 'Featured products retrieved successfully' })
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getFeatured() {
    return this.productService.list({
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });
  }

  @Get('new/list')
  @ApiOperation({ summary: 'Get new products' })
  @ApiResponse({ status: 200, description: 'New products retrieved successfully' })
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getNew() {
    return this.productService.list({
      isNew: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });
  }

  // ==================== Variants ====================

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get product variants' })
  @ApiResponse({ status: 200, description: 'Variants retrieved successfully' })
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getVariants(
    @Param('id') productId: string,
    @Query('currency') currency?: string
  ) {
    const variants = await this.variantService.findByProductId(productId);

    // جلب الأسعار إذا تم تحديد عملة
    let variantsWithPrices = variants;
    if (currency && currency !== 'USD') {
      const prices = await this.pricingService.getProductPrices(productId, currency);
      variantsWithPrices = variants.map(variant => {
        const price = prices.find(p => p.variantId === variant._id.toString());
        return {
          ...variant,
          ...price
        };
      });
    }

    return { 
      data: variantsWithPrices,
      currency: currency || 'USD'
    };
  }

  @Get('variants/:id/price')
  @ApiOperation({ summary: 'Get variant price' })
  @ApiResponse({ status: 200, description: 'Price retrieved successfully' })
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getVariantPrice(
    @Param('id') variantId: string,
    @Query('currency') currency?: string
  ) {
    const price = await this.pricingService.getVariantPrice(variantId, currency);
    return { data: price };
  }

  @Get('variants/:id/availability')
  @ApiOperation({ summary: 'Check variant availability' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkVariantAvailability(
    @Param('id') variantId: string,
    @Query('quantity') quantity: number
  ) {
    const result = await this.inventoryService.checkAvailability(variantId, quantity);
    return { data: result };
  }

  // ==================== Price Range ====================

  @Get(':id/price-range')
  @ApiOperation({ summary: 'Get product price range' })
  @ApiResponse({ status: 200, description: 'Price range retrieved successfully' })
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getPriceRange(
    @Param('id') productId: string,
    @Query('currency') currency?: string
  ) {
    const range = await this.pricingService.getProductPriceRange(productId, currency);
    return { data: range };
  }

  // ==================== Statistics ====================

  @Get('stats/count')
  @ApiOperation({ summary: 'Get products count' })
  @ApiResponse({ status: 200, description: 'Count retrieved successfully' })
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getProductsCount() {
    const stats = await this.productService.getStats();
    return { data: { count: stats.data.total } };
  }
}
