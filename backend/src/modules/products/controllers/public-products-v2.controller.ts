import { Controller, Get, Query, UseInterceptors, Req, Version, Param } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { VariantService } from '../services/variant.service';
import {
  ResponseCacheInterceptor,
  CacheResponse,
} from '../../../shared/interceptors/response-cache.interceptor';
import { ProductStatus } from '../schemas/product.schema';
import { PublicProductsPresenter } from '../services/public-products.presenter';

interface RequestWithUser {
  user?: {
    sub: string;
    phone: string;
    roles?: string[];
    preferredCurrency?: string;
  };
}

@ApiTags('المنتجات V2')
@Controller('products')
@UseInterceptors(ResponseCacheInterceptor)
export class PublicProductsV2Controller {
  constructor(
    private productService: ProductService,
    private variantService: VariantService,
    private publicProductsPresenter: PublicProductsPresenter,
  ) {}

  @Get()
  @Version('2')
  @ApiResponse({ status: 200, description: 'Products list (USD + fx) retrieved successfully' })
  @CacheResponse({ ttl: 300 })
  async listProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('includeSubcategories') includeSubcategories?: string,
    @Query('brandId') brandId?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('isNew') isNew?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Req() req?: RequestWithUser,
  ) {
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(
      req?.user?.sub,
    );

    const includeSubcats = includeSubcategories === 'false' ? false : true;

    const result = await this.productService.list({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      categoryId,
      brandId,
      status: ProductStatus.ACTIVE,
      isFeatured: isFeatured === 'true' ? true : undefined,
      isNew: isNew === 'true' ? true : undefined,
      includeSubcategories: includeSubcats,
      sortBy,
      sortOrder,
    });

    const rawData = Array.isArray(result.data)
      ? (result.data as unknown as Array<Record<string, unknown>>)
      : [];

    const { fx, rounding, userDiscount, data } =
      await this.publicProductsPresenter.buildProductsCollectionResponseUsdFx(
        rawData,
        discountPercent,
      );

    return { fx, rounding, userDiscount, data, meta: result.meta };
  }

  @Get('featured/list')
  @Version('2')
  @ApiResponse({ status: 200, description: 'Featured products (USD + fx) retrieved successfully' })
  @CacheResponse({ ttl: 120 })
  async getFeatured(@Req() req?: RequestWithUser) {
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(
      req?.user?.sub,
    );

    const result = await this.productService.list({
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });

    const rawData = Array.isArray(result.data)
      ? (result.data as unknown as Array<Record<string, unknown>>)
      : [];

    const { fx, rounding, userDiscount, data } =
      await this.publicProductsPresenter.buildProductsCollectionResponseUsdFx(
        rawData,
        discountPercent,
      );

    return { fx, rounding, userDiscount, data, meta: result.meta };
  }

  @Get('new/list')
  @Version('2')
  @ApiResponse({ status: 200, description: 'New products (USD + fx) retrieved successfully' })
  @CacheResponse({ ttl: 120 })
  async getNew(@Req() req?: RequestWithUser) {
    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(
      req?.user?.sub,
    );

    const result = await this.productService.list({
      isNew: true,
      status: ProductStatus.ACTIVE,
      limit: 12,
    });

    const rawData = Array.isArray(result.data)
      ? (result.data as unknown as Array<Record<string, unknown>>)
      : [];

    const { fx, rounding, userDiscount, data } =
      await this.publicProductsPresenter.buildProductsCollectionResponseUsdFx(
        rawData,
        discountPercent,
      );

    return { fx, rounding, userDiscount, data, meta: result.meta };
  }

  @Get(':id')
  @Version('2')
  @ApiOperation({
    summary: 'Get product details (v2 options contract)',
    description:
      'Returns product details in v2 compact contract: product + optionDefinitions + variants.',
  })
  @ApiParam({ name: 'id', description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Product details (v2) retrieved successfully' })
  @CacheResponse({ ttl: 120 })
  async getProductDetailsV2(@Param('id') id: string, @Req() req?: RequestWithUser) {
    const product = await this.productService.findById(id);
    const variants = await this.variantService.findByProductId(id);

    await this.productService.incrementViews(id);

    const discountPercent = await this.publicProductsPresenter.getUserMerchantDiscount(
      req?.user?.sub,
    );

    return this.publicProductsPresenter.buildProductDetailContractV2(
      id,
      product as unknown as Record<string, unknown>,
      variants as unknown as Array<Record<string, unknown> & { _id: string }>,
      discountPercent,
    );
  }
}
