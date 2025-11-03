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
import { InjectModel } from '@nestjs/mongoose';
import { Model , Types } from 'mongoose';

import { ProductService } from '../services/product.service';
import { VariantService } from '../services/variant.service';
import { PricingService } from '../services/pricing.service';
import { InventoryService } from '../services/inventory.service';
import {
  ResponseCacheInterceptor,
  CacheResponse,
} from '../../../shared/interceptors/response-cache.interceptor';
import { ProductStatus } from '../schemas/product.schema';
import { User } from '../../users/schemas/user.schema';
import { Capabilities } from '../../capabilities/schemas/capabilities.schema';

type WithId = { _id: Types.ObjectId | string };

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
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capabilities.name) private capabilitiesModel: Model<Capabilities>,
  ) {}

  /**
   * جلب نسبة خصم التاجر للمستخدم
   */
  private async getUserWholesaleDiscount(userId?: string): Promise<number> {
    if (!userId) {
      return 0;
    }

    try {
      // محاولة جلب من Capabilities أولاً (النظام القديم)
      const caps = await this.capabilitiesModel.findOne({ userId }).lean();
      if (caps && caps.wholesale_capable && caps.wholesale_status === 'approved' && caps.wholesale_discount_percent > 0) {
        return caps.wholesale_discount_percent;
      }

      // إذا لم يوجد في Capabilities، جلب من User مباشرة
      const user = await this.userModel.findById(userId).lean();
      if (user && user.wholesale_capable && user.wholesale_status === 'approved' && user.wholesale_discount_percent > 0) {
        return user.wholesale_discount_percent;
      }
    } catch (error) {
      // في حالة حدوث خطأ، إرجاع 0 (لا خصم)
      console.error('Error fetching user wholesale discount:', error);
    }

    return 0;
  }

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
    const discountPercent = await this.getUserWholesaleDiscount(userId);
    const selectedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    // جلب الأسعار مع خصم التاجر
    let variantsWithPrices = variants;
    const pricesWithDiscount = await this.pricingService.getProductPricesWithDiscount(
      id,
      selectedCurrency,
      discountPercent,
    );

    variantsWithPrices = variants.map((variant) => {
      const variantWithId = variant as unknown as WithId;
      const priceData = pricesWithDiscount.find((p) => p.variantId === variantWithId._id.toString());
      
      if (priceData) {
        return {
          ...variant,
          pricing: {
            basePrice: priceData.basePrice,
            compareAtPrice: priceData.compareAtPrice,
            discountPercent: priceData.discountPercent,
            discountAmount: priceData.discountAmount,
            finalPrice: priceData.finalPrice,
            currency: priceData.currency,
            exchangeRate: priceData.exchangeRate,
            formattedPrice: priceData.formattedPrice,
            formattedFinalPrice: priceData.formattedFinalPrice,
          },
        };
      }
      
      // Fallback للحالات القديمة
      return variant;
    });

    return {
      product,
      variants: variantsWithPrices,
      currency: selectedCurrency,
      userDiscount: {
        isWholesale: discountPercent > 0,
        discountPercent,
      },
    };
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
    const discountPercent = await this.getUserWholesaleDiscount(userId);
    const selectedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    // جلب الأسعار مع خصم التاجر
    let variantsWithPrices = variants;
    const pricesWithDiscount = await this.pricingService.getProductPricesWithDiscount(
      productId,
      selectedCurrency,
      discountPercent,
    );

    variantsWithPrices = variants.map((variant) => {
      const variantWithId = variant as unknown as WithId;
      const priceData = pricesWithDiscount.find((p) => p.variantId === variantWithId._id.toString());
      
      if (priceData) {
        return {
          ...variant,
          pricing: {
            basePrice: priceData.basePrice,
            compareAtPrice: priceData.compareAtPrice,
            discountPercent: priceData.discountPercent,
            discountAmount: priceData.discountAmount,
            finalPrice: priceData.finalPrice,
            currency: priceData.currency,
            exchangeRate: priceData.exchangeRate,
            formattedPrice: priceData.formattedPrice,
            formattedFinalPrice: priceData.formattedFinalPrice,
          },
        };
      }
      
      // Fallback للحالات القديمة
      return variant;
    });

    return {
      product,
      variants: variantsWithPrices,
      currency: selectedCurrency,
      userDiscount: {
        isWholesale: discountPercent > 0,
        discountPercent,
      },
    };
  }

  // ==================== Featured & New Products ====================

  @Get('featured/list')
  @ApiOperation({ summary: 'الحصول على المنتجات المميزة' })
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
  @ApiOperation({ summary: 'الحصول على المنتجات الجديدة' })
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
    const discountPercent = await this.getUserWholesaleDiscount(userId);
    const selectedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    // جلب الأسعار مع خصم التاجر
    let variantsWithPrices = variants;
    const pricesWithDiscount = await this.pricingService.getProductPricesWithDiscount(
      productId,
      selectedCurrency,
      discountPercent,
    );

    variantsWithPrices = variants.map((variant) => {
      const variantWithId = variant as unknown as WithId;
      const priceData = pricesWithDiscount.find((p) => p.variantId === variantWithId._id.toString());
      
      if (priceData) {
        return {
          ...variant,
          pricing: {
            basePrice: priceData.basePrice,
            compareAtPrice: priceData.compareAtPrice,
            discountPercent: priceData.discountPercent,
            discountAmount: priceData.discountAmount,
            finalPrice: priceData.finalPrice,
            currency: priceData.currency,
            exchangeRate: priceData.exchangeRate,
            formattedPrice: priceData.formattedPrice,
            formattedFinalPrice: priceData.formattedFinalPrice,
          },
        };
      }
      
      return variant;
    });

    return {
      data: variantsWithPrices,
      currency: selectedCurrency,
      userDiscount: {
        isWholesale: discountPercent > 0,
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
    const discountPercent = await this.getUserWholesaleDiscount(userId);
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
        isWholesale: discountPercent > 0,
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
  async getRelatedProducts(
    @Param('id') productId: string,
    @Query('limit') limit?: string,
  ) {
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
