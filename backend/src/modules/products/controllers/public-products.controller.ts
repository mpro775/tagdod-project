import { Controller, Get, Param, Query, UseInterceptors, Req, Logger } from '@nestjs/common';
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
import { PricingService, PriceWithDiscount, PriceWithDiscountAndVariantId } from '../services/pricing.service';
import { InventoryService } from '../services/inventory.service';
import {
  ResponseCacheInterceptor,
  CacheResponse,
} from '../../../shared/interceptors/response-cache.interceptor';
import { ProductStatus } from '../schemas/product.schema';
import { User } from '../../users/schemas/user.schema';
import { Capabilities } from '../../capabilities/schemas/capabilities.schema';
import { AttributesService } from '../../attributes/attributes.service';

type WithId = { _id: Types.ObjectId | string };

interface RequestWithUser {
  user?: {
    sub: string;
    phone: string;
    roles?: string[];
    preferredCurrency?: string;
  };
}

type AttributeSummary = {
  id: string;
  name: string;
  nameEn: string;
  values: Array<{
    id: string;
    value: string;
    valueEn?: string;
  }>;
};

@ApiTags('المنتجات')
@Controller('products')
@UseInterceptors(ResponseCacheInterceptor)
export class PublicProductsController {
  private readonly logger = new Logger(PublicProductsController.name);
  private readonly BASE_PRICING_CURRENCIES = ['USD', 'YER', 'SAR'] as const;

  constructor(
    private productService: ProductService,
    private variantService: VariantService,
    private pricingService: PricingService,
    private inventoryService: InventoryService,
    private attributesService: AttributesService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capabilities.name) private capabilitiesModel: Model<Capabilities>,
  ) {}

  /**
   * جلب نسبة خصم التاجر للمستخدم
   */
  private async getUserMerchantDiscount(userId?: string): Promise<number> {
    if (!userId) {
      return 0;
    }

    try {
      // محاولة جلب من Capabilities أولاً (النظام القديم)
      const caps = await this.capabilitiesModel.findOne({ userId }).lean();
      if (caps && caps.merchant_capable && caps.merchant_status === 'approved' && caps.merchant_discount_percent > 0) {
        return caps.merchant_discount_percent;
      }

      // إذا لم يوجد في Capabilities، جلب من User مباشرة
      const user = await this.userModel.findById(userId).lean();
      if (user && user.merchant_capable && user.merchant_status === 'approved' && user.merchant_discount_percent > 0) {
        return user.merchant_discount_percent;
      }
    } catch (error) {
      // في حالة حدوث خطأ، إرجاع 0 (لا خصم)
      console.error('Error fetching user merchant discount:', error);
    }

    return 0;
  }

  private normalizeCurrency(currency?: string): string {
    if (!currency || typeof currency !== 'string') {
      return 'USD';
    }

    const trimmed = currency.trim();
    return trimmed.length === 0 ? 'USD' : trimmed.toUpperCase();
  }

  private stripVariantId(price?: PriceWithDiscountAndVariantId | null): PriceWithDiscount | null {
    if (!price) {
      return null;
    }

    const { variantId: _variantId, ...rest } = price;
    return rest;
  }

  private extractIdString(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;

      if (record._id) {
        const innerId = record._id;
        if (typeof innerId === 'string') {
          return innerId;
        }
        if (innerId && typeof (innerId as { toString: () => string }).toString === 'function') {
          const converted = (innerId as { toString: () => string }).toString();
          return converted === '[object Object]' ? null : converted;
        }
      }

      if (typeof (record as { toString?: () => string }).toString === 'function') {
        const converted = (record as { toString: () => string }).toString();
        return converted === '[object Object]' ? null : converted;
      }
    }

    return null;
  }

  private async getAttributeSummaries(attributeIds: unknown[]): Promise<AttributeSummary[]> {
    if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(
      new Set(
        attributeIds
          .map(id => this.extractIdString(id))
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (uniqueIds.length === 0) {
      return [];
    }

    const summaries = await Promise.all(
      uniqueIds.map(async (attributeId) => {
        try {
          const attribute = await this.attributesService.getAttribute(attributeId);
          const attributeRecord = attribute as Record<string, unknown>;
          const valuesList = (attributeRecord.values as Array<Record<string, unknown>> | undefined) ?? [];

          return {
            id: this.extractIdString(attributeRecord._id) ?? attributeId,
            name: (attributeRecord.name as string) ?? '',
            nameEn: (attributeRecord.nameEn as string) ?? '',
            values: valuesList.map((valueRecord) => ({
              id: this.extractIdString(valueRecord._id) ?? '',
              value: (valueRecord.value as string) ?? '',
              valueEn:
                (valueRecord.valueEn as string | undefined) ??
                ((valueRecord.value as string) ?? ''),
            })),
          } as AttributeSummary;
        } catch (error) {
          this.logger.warn(
            `Failed to load attribute ${attributeId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return null;
        }
      }),
    );

    return summaries.filter((summary): summary is AttributeSummary => Boolean(summary));
  }

  private async enrichVariantsPricing(
    productId: string,
    variants: Array<WithId & Record<string, any>>,
    discountPercent: number,
    selectedCurrencyInput: string,
  ): Promise<{ variantsWithPricing: Array<Record<string, any>>; normalizedCurrency: string }> {
    const normalizedCurrency = this.normalizeCurrency(selectedCurrencyInput);
    const currenciesForPricing = Array.from(
      new Set([...this.BASE_PRICING_CURRENCIES, normalizedCurrency]),
    );

    const variantSnapshots = variants.map(variant => ({
      _id: variant._id,
      basePriceUSD: variant.basePriceUSD ?? 0,
      compareAtPriceUSD: variant.compareAtPriceUSD,
      costPriceUSD: variant.costPriceUSD,
    }));

    const pricesByCurrency = await this.pricingService.getProductPricesWithDiscountByCurrencies(
      productId,
      currenciesForPricing,
      discountPercent,
      { variants: variantSnapshots as any },
    );

    const variantsWithPricing = variants.map(variant => {
      const variantId = variant._id.toString();

      const pricingByCurrency = this.BASE_PRICING_CURRENCIES.reduce<Record<string, PriceWithDiscount | null>>(
        (acc, currencyCode) => {
          const entry =
            pricesByCurrency[currencyCode]?.find(price => price.variantId === variantId) ?? null;
          acc[currencyCode] = this.stripVariantId(entry);
          return acc;
        },
        {} as Record<string, PriceWithDiscount | null>,
      );

      const selectedPriceEntry =
        pricesByCurrency[normalizedCurrency]?.find(price => price.variantId === variantId) ?? null;

      return {
        ...variant,
        pricing: this.stripVariantId(selectedPriceEntry),
        pricingByCurrency,
      };
    });

    return { variantsWithPricing, normalizedCurrency };
  }

  private async buildProductDetailResponse(
    productId: string,
    product: Record<string, any>,
    variants: Array<WithId & Record<string, any>>,
    discountPercent: number,
    selectedCurrencyInput: string,
  ) {
    const { variantsWithPricing, normalizedCurrency } = await this.enrichVariantsPricing(
      productId,
      variants,
      discountPercent,
      selectedCurrencyInput,
    );

    const attributesDetails = await this.getAttributeSummaries(product.attributes as unknown[]);

    const productWithAttributes = {
      ...product,
      attributesDetails,
    };

    return {
      product: productWithAttributes,
      variants: variantsWithPricing,
      currency: normalizedCurrency,
      userDiscount: {
        isMerchant: discountPercent > 0,
        discountPercent,
      },
    };
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
    const discountPercent = await this.getUserMerchantDiscount(userId);
    const requestedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    return this.buildProductDetailResponse(
      id,
      product as Record<string, any>,
      variants as unknown as Array<WithId & Record<string, any>>,
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
    const discountPercent = await this.getUserMerchantDiscount(userId);
    const requestedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    return this.buildProductDetailResponse(
      productId,
      product as Record<string, any>,
      variants as unknown as Array<WithId & Record<string, any>>,
      discountPercent,
      requestedCurrency,
    );
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
    const discountPercent = await this.getUserMerchantDiscount(userId);
    const requestedCurrency = currency || req?.user?.preferredCurrency || 'USD';

    const { variantsWithPricing, normalizedCurrency } = await this.enrichVariantsPricing(
      productId,
      variants as unknown as Array<WithId & Record<string, any>>,
      discountPercent,
      requestedCurrency,
    );

    return {
      data: variantsWithPricing,
      currency: normalizedCurrency,
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
    const discountPercent = await this.getUserMerchantDiscount(userId);
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
