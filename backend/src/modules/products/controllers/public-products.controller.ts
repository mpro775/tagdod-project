import { Controller, Get, Param, Query, UseInterceptors, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiBearerAuth,
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
import { PublicProductsPresenter, WithId } from '../services/public-products.presenter';

interface RequestWithUser {
  user?: {
    sub: string;
    phone: string;
    roles?: string[];
    preferredCurrency?: string;
  };
}

@ApiTags('المنتجات')
@Controller('products')
@UseInterceptors(ResponseCacheInterceptor)
export class PublicProductsController {
  constructor(
    private productService: ProductService,
    private variantService: VariantService,
    private pricingService: PricingService,
    private inventoryService: InventoryService,
    private publicProductsPresenter: PublicProductsPresenter,
  ) {}


  // ==================== Products List ====================

  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة المنتجات',
    description: 'استرداد قائمة منتجات مع التصفح والترقيم مع إمكانية التصفية الاختيارية',
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
    @Query('currency') currency?: string,
    @Req() req?: RequestWithUser,
  ) {
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(
      req?.user?.sub,
    );
    const selectedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    const result = await this.productService.list({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      categoryId,
      brandId,
      status: ProductStatus.ACTIVE,
      isFeatured: isFeatured === 'true' ? true : undefined,
      isNew: isNew === 'true' ? true : undefined,
    });

    const rawData = Array.isArray(result.data)
      ? (result.data as unknown as Array<Record<string, unknown>>)
      : [];

    const productsWithPricing = await this.publicProductsPresenter.buildProductsCollectionResponse(
      rawData,
      discountPercent,
      selectedCurrency,
    );

    return {
      ...result,
      data: productsWithPricing,
    };
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
  @ApiBearerAuth()
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getProduct(
    @Param('id') id: string,
    @Query('currency') currency?: string,
    @Req() req?: RequestWithUser,
  ) {
    const product = await this.productService.findById(id);
    const variants = await this.variantService.findByProductId(id);

    // زيادة المشاهدات
    await this.productService.incrementViews(id);

    // جلب نسبة خصم التاجر إذا كان المستخدم مسجل
    const userId = req?.user?.sub;
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(userId);
    const requestedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    return this.publicProductsPresenter.buildProductDetailResponse(
      id,
      product as unknown as Record<string, unknown>,
      variants as unknown as Array<WithId & Record<string, unknown>>,
      discountPercent,
      requestedCurrency,
    );
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get product by slug',
    description: 'Retrieves product information using URL slug',
  })
  @ApiParam({ name: 'slug', description: 'Product slug', example: 'solar-panel-300w' })
  @ApiBearerAuth()
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getProductBySlug(
    @Param('slug') slug: string,
    @Query('currency') currency?: string,
    @Req() req?: RequestWithUser,
  ) {
    const product = await this.productService.findBySlug(slug);
    const productWithId = product as unknown as WithId;
    const productId = productWithId._id.toString();
    const variants = await this.variantService.findByProductId(productId);

    // زيادة المشاهدات
    await this.productService.incrementViews(productId);

    // جلب نسبة خصم التاجر إذا كان المستخدم مسجل
    const userId = req?.user?.sub;
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(userId);
    const requestedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    return this.publicProductsPresenter.buildProductDetailResponse(
      productId,
      product as unknown as Record<string, unknown>,
      variants as unknown as Array<WithId & Record<string, unknown>>,
      discountPercent,
      requestedCurrency,
    );
  }

  // ==================== Featured & New Products ====================

  @Get('featured/list')
  @ApiOperation({ summary: 'الحصول على المنتجات المميزة' })
  @ApiResponse({ status: 200, description: 'Featured products retrieved successfully' })
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getFeatured(
    @Query('currency') currency?: string,
    @Req() req?: RequestWithUser,
  ) {
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(
      req?.user?.sub,
    );
    const selectedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    const result = await this.productService.list({
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });

    const rawData = Array.isArray(result.data)
      ? (result.data as unknown as Array<Record<string, unknown>>)
      : [];

    const productsWithPricing = await this.publicProductsPresenter.buildProductsCollectionResponse(
      rawData,
      discountPercent,
      selectedCurrency,
    );

    return {
      ...result,
      data: productsWithPricing,
    };
  }

  @Get('new/list')
  @ApiOperation({ summary: 'الحصول على المنتجات الجديدة' })
  @ApiResponse({ status: 200, description: 'New products retrieved successfully' })
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getNew(
    @Query('currency') currency?: string,
    @Req() req?: RequestWithUser,
  ) {
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(
      req?.user?.sub,
    );
    const selectedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    const result = await this.productService.list({
      isNew: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });

    const rawData = Array.isArray(result.data)
      ? (result.data as unknown as Array<Record<string, unknown>>)
      : [];

    const productsWithPricing = await this.publicProductsPresenter.buildProductsCollectionResponse(
      rawData,
      discountPercent,
      selectedCurrency,
    );

    return {
      ...result,
      data: productsWithPricing,
    };
  }

  // ==================== Variants ====================

  @Get(':id/variants')
  @ApiOperation({ summary: 'الحصول على متغيرات المنتج' })
  @ApiResponse({ status: 200, description: 'Variants retrieved successfully' })
  @ApiBearerAuth()
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getVariants(
    @Param('id') productId: string,
    @Query('currency') currency?: string,
    @Req() req?: RequestWithUser,
  ) {
    const variants = await this.variantService.findByProductId(productId);

    // جلب نسبة خصم التاجر إذا كان المستخدم مسجل
    const userId = req?.user?.sub;
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(userId);
    const requestedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    const { variantsWithPricing } = await this.publicProductsPresenter.enrichVariantsPricing(
      productId,
      variants as unknown as Array<WithId & Record<string, unknown>>,
      discountPercent,
      requestedCurrency,
    );

    return {
      data: variantsWithPricing,
      userDiscount: {
        isMerchant: discountPercent > 0,
        discountPercent,
      },
    };
  }

  @Get('variants/:id/price')
  @ApiOperation({ summary: 'الحصول على سعر المتغير' })
  @ApiResponse({ status: 200, description: 'Price retrieved successfully' })
  @ApiBearerAuth()
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getVariantPrice(
    @Param('id') variantId: string,
    @Query('currency') currency?: string,
    @Req() req?: RequestWithUser,
  ) {
    // جلب نسبة خصم التاجر إذا كان المستخدم مسجل
    const userId = req?.user?.sub;
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(userId);
    const selectedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    // جلب السعر مع خصم التاجر
    const priceWithDiscount = await this.pricingService.getVariantPriceWithDiscount(
      variantId,
      selectedCurrency,
      discountPercent,
    );

    return {
      ...priceWithDiscount,
      userDiscount: {
        isMerchant: discountPercent > 0,
        discountPercent,
      },
    };
  }

  @Get('variants/:id/availability')
  @ApiOperation({ summary: 'التحقق من توفر المتغير' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkVariantAvailability(
    @Param('id') variantId: string,
    @Query('quantity') quantity: number,
  ) {
    const result = await this.inventoryService.checkAvailability(variantId, quantity);
    return result;
  }

  // ==================== Price Range ====================

  @Get(':id/price-range')
  @ApiOperation({ summary: 'الحصول على نطاق أسعار المنتج' })
  @ApiResponse({ status: 200, description: 'Price range retrieved successfully' })
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getPriceRange(@Param('id') productId: string, @Query('currency') currency?: string) {
    const range = await this.pricingService.getProductPriceRange(productId, currency);
    return range;
  }

  // ==================== Statistics ====================

  @Get('stats/count')
  @ApiOperation({ summary: 'الحصول على عدد المنتجات' })
  @ApiResponse({ status: 200, description: 'Count retrieved successfully' })
  @CacheResponse({ ttl: 300 }) // 5 minutes
  async getProductsCount() {
    const stats = await this.productService.getStats();
    return { count: stats.data.total };
  }

  // ==================== Related Products ====================

  @Get(':id/related')
  @ApiOperation({
    summary: 'الحصول على المنتجات الشبيهة',
    description: 'استرداد قائمة المنتجات الشبيهة لمنتج معين لعرضها في صفحة تفاصيل المنتج',
  })
  @ApiParam({ name: 'id', description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of related products to return (default: 10)',
  })
  @ApiOkResponse({
    description: 'Related products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              name: { type: 'string', example: 'Solar Panel 400W' },
              nameEn: { type: 'string', example: 'Solar Panel 400W' },
              description: { type: 'string', example: 'High efficiency solar panel' },
              category: { type: 'object' },
              brand: { type: 'object' },
              mainImageId: { type: 'object' },
              isFeatured: { type: 'boolean', example: true },
              isNew: { type: 'boolean', example: false },
            },
          },
        },
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @CacheResponse({ ttl: 600 }) // 10 minutes
  async getRelatedProducts(@Param('id') productId: string, @Query('limit') limit?: string) {
    const products = await this.productService.getRelatedProducts(
      productId,
      limit ? Number(limit) : 10,
    );

    return {
      data: products,
      count: products.length,
    };
  }
}
