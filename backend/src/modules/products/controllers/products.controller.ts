import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { ProductService } from '../services/product.service';
import { VariantService } from '../services/variant.service';
import { PricingService } from '../services/pricing.service';
import { InventoryService } from '../services/inventory.service';
import { CreateProductDto, UpdateProductDto, ListProductsDto, CreateVariantDto, UpdateVariantDto } from '../dto/product.dto';
import { Product } from '../schemas/product.schema';
import { Variant } from '../schemas/variant.schema';

@ApiTags('إدارة-المنتجات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/products')
export class ProductsController {
  constructor(
    private productService: ProductService,
    private variantService: VariantService,
    private pricingService: PricingService,
    private inventoryService: InventoryService,
  ) {}

  // ==================== Products CRUD ====================

  @Post()
  @ApiOperation({ summary: 'إنشاء منتج جديد' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Body() dto: CreateProductDto) {
    const product = await this.productService.create(dto as Partial<Product>);
    return product;
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المنتجات مع التصفية' })
  @ApiResponse({ status: 200, description: 'Products list retrieved successfully' })
  async listProducts(@Query() dto: ListProductsDto) {
    return this.productService.list(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على منتج بالمعرف' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.findById(id);
    return product;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث المنتج' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto
  ) {
    const product = await this.productService.update(id, dto as Partial<Product>);
    return product;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف المنتج (حذف مؤقت)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async deleteProduct(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    const product = await this.productService.delete(id, req.user.sub);
    return { deleted: true, deletedAt: product.deletedAt };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'استعادة المنتج المحذوف' })
  @ApiResponse({ status: 200, description: 'Product restored successfully' })
  async restoreProduct(@Param('id') id: string) {
    await this.productService.restore(id);
    return { restored: true };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'الحصول على إحصائيات المنتجات' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.productService.getStats();
  }

  // ==================== Variants Management ====================

  @Post(':productId/variants')
  @ApiOperation({ summary: 'إنشاء متغير للمنتج' })
  @ApiResponse({ status: 201, description: 'Variant created successfully' })
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto
  ) {
    dto.productId = productId;
    const variant = await this.variantService.create(dto as Partial<Variant>);
    return variant;
  }

  @Get(':productId/variants')
  @ApiOperation({ summary: 'الحصول على متغيرات المنتج' })
  @ApiResponse({ status: 200, description: 'Variants retrieved successfully' })
  async getVariants(
    @Param('productId') productId: string,
    @Query('includeDeleted') includeDeleted?: boolean
  ) {
    const variants = await this.variantService.findByProductId(productId, includeDeleted);
    return variants;
  }

  @Get('variants/:id')
  @ApiOperation({ summary: 'الحصول على متغير بالمعرف' })
  @ApiResponse({ status: 200, description: 'Variant retrieved successfully' })
  async getVariant(@Param('id') id: string) {
    const variant = await this.variantService.findById(id);
    return variant;
  }

  @Patch('variants/:id')
  @ApiOperation({ summary: 'تحديث المتغير' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
  async updateVariant(
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto
  ) {
    const variant = await this.variantService.update(id, dto as Partial<Variant>);
    return variant;
  }

  @Delete('variants/:id')
  @ApiOperation({ summary: 'حذف المتغير (حذف مؤقت)' })
  @ApiResponse({ status: 200, description: 'Variant deleted successfully' })
  async deleteVariant(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    await this.variantService.delete(id, req.user.sub);
    return { deleted: true };
  }

  // ==================== Pricing Management ====================

  @Get('variants/:id/price')
  @ApiOperation({ summary: 'الحصول على سعر المتغير بعملة محددة' })
  @ApiResponse({ status: 200, description: 'Price retrieved successfully' })
  async getVariantPrice(
    @Param('id') variantId: string,
    @Query('currency') currency?: string
  ) {
    const price = await this.pricingService.getVariantPrice(variantId, currency);
    return price;
  }

  @Get(':id/prices')
  @ApiOperation({ summary: 'الحصول على جميع أسعار متغيرات المنتج' })
  @ApiResponse({ status: 200, description: 'Prices retrieved successfully' })
  async getProductPrices(
    @Param('id') productId: string,
    @Query('currency') currency?: string
  ) {
    const prices = await this.pricingService.getProductPrices(productId, currency);
    return prices;
  }

  @Get(':id/price-range')
  @ApiOperation({ summary: 'الحصول على نطاق أسعار المنتج' })
  @ApiResponse({ status: 200, description: 'Price range retrieved successfully' })
  async getPriceRange(
    @Param('id') productId: string,
    @Query('currency') currency?: string
  ) {
    const range = await this.pricingService.getProductPriceRange(productId, currency);
    return range;
  }

  // ==================== Inventory Management ====================

  @Post('variants/:id/stock')
  @ApiOperation({ summary: 'تحديث مخزون المتغير' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  async updateStock(
    @Param('id') variantId: string,
    @Body() body: { quantity: number; operation: 'add' | 'subtract' | 'set'; reason?: string }
  ) {
    const result = await this.inventoryService.updateStock(
      variantId, 
      body.quantity, 
      body.operation === 'set' ? undefined : body.operation as 'add' | 'subtract', 
      body.reason
    );
    return result;
  }

  @Get('variants/:id/availability')
  @ApiOperation({ summary: 'التحقق من توفر المتغير' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(
    @Param('id') variantId: string,
    @Query('quantity') quantity: number
  ) {
    const result = await this.inventoryService.checkAvailability(variantId, quantity);
    return result;
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'الحصول على المتغيرات ذات المخزون المنخفض' })
  @ApiResponse({ status: 200, description: 'Low stock variants retrieved successfully' })
  async getLowStock(@Query('threshold') threshold?: number) {
    const variants = await this.inventoryService.getLowStockVariants(threshold);
    return variants;
  }

  @Get('inventory/out-of-stock')
  @ApiOperation({ summary: 'الحصول على المتغيرات غير المتوفرة' })
  @ApiResponse({ status: 200, description: 'Out of stock variants retrieved successfully' })
  async getOutOfStock() {
    const variants = await this.inventoryService.getOutOfStockVariants();
    return variants;
  }

  @Get('inventory/summary')
  @ApiOperation({ summary: 'الحصول على ملخص المخزون' })
  @ApiResponse({ status: 200, description: 'Inventory summary retrieved successfully' })
  async getInventorySummary() {
    const summary = await this.inventoryService.getInventorySummary();
    return summary;
  }

  // ==================== Related Products Management ====================

  @Get(':id/related')
  @ApiOperation({ summary: 'الحصول على المنتجات الشبيهة' })
  @ApiResponse({ status: 200, description: 'Related products retrieved successfully' })
  async getRelatedProducts(
    @Param('id') productId: string,
    @Query('limit') limit?: number
  ) {
    const products = await this.productService.getRelatedProducts(
      productId,
      limit ? Number(limit) : 10
    );
    return { data: products };
  }

  @Put(':id/related')
  @ApiOperation({ summary: 'تحديث المنتجات الشبيهة (استبدال كامل)' })
  @ApiResponse({ status: 200, description: 'Related products updated successfully' })
  async updateRelatedProducts(
    @Param('id') productId: string,
    @Body() body: { relatedProductIds: string[] }
  ) {
    const product = await this.productService.updateRelatedProducts(
      productId,
      body.relatedProductIds
    );
    return { product };
  }

  @Post(':id/related/:relatedId')
  @ApiOperation({ summary: 'إضافة منتج شبيه' })
  @ApiResponse({ status: 200, description: 'Related product added successfully' })
  async addRelatedProduct(
    @Param('id') productId: string,
    @Param('relatedId') relatedProductId: string
  ) {
    const product = await this.productService.addRelatedProduct(productId, relatedProductId);
    return { product };
  }

  @Delete(':id/related/:relatedId')
  @ApiOperation({ summary: 'إزالة منتج شبيه' })
  @ApiResponse({ status: 200, description: 'Related product removed successfully' })
  async removeRelatedProduct(
    @Param('id') productId: string,
    @Param('relatedId') relatedProductId: string
  ) {
    const product = await this.productService.removeRelatedProduct(productId, relatedProductId);
    return { product };
  }
}
