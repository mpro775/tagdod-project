import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('admin-products')
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
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Body() dto: CreateProductDto) {
    const product = await this.productService.create(dto as Partial<Product>);
    return { data: product };
  }

  @Get()
  @ApiOperation({ summary: 'List products with filters' })
  @ApiResponse({ status: 200, description: 'Products list retrieved successfully' })
  async listProducts(@Query() dto: ListProductsDto) {
    return this.productService.list(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.findById(id);
    return { data: product };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto
  ) {
    const product = await this.productService.update(id, dto as Partial<Product>);
    return { data: product };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async deleteProduct(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    const product = await this.productService.delete(id, req.user.sub);
    return { data: { deleted: true, deletedAt: product.deletedAt } };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted product' })
  @ApiResponse({ status: 200, description: 'Product restored successfully' })
  async restoreProduct(@Param('id') id: string) {
    await this.productService.restore(id);
    return { data: { restored: true } };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get products statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.productService.getStats();
  }

  // ==================== Variants Management ====================

  @Post(':productId/variants')
  @ApiOperation({ summary: 'Create variant for product' })
  @ApiResponse({ status: 201, description: 'Variant created successfully' })
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto
  ) {
    dto.productId = productId;
    const variant = await this.variantService.create(dto as Partial<Variant>);
    return { data: variant };
  }

  @Get(':productId/variants')
  @ApiOperation({ summary: 'Get variants for product' })
  @ApiResponse({ status: 200, description: 'Variants retrieved successfully' })
  async getVariants(
    @Param('productId') productId: string,
    @Query('includeDeleted') includeDeleted?: boolean
  ) {
    const variants = await this.variantService.findByProductId(productId, includeDeleted);
    return { data: variants };
  }

  @Get('variants/:id')
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiResponse({ status: 200, description: 'Variant retrieved successfully' })
  async getVariant(@Param('id') id: string) {
    const variant = await this.variantService.findById(id);
    return { data: variant };
  }

  @Patch('variants/:id')
  @ApiOperation({ summary: 'Update variant' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
  async updateVariant(
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto
  ) {
    const variant = await this.variantService.update(id, dto as Partial<Variant>);
    return { data: variant };
  }

  @Delete('variants/:id')
  @ApiOperation({ summary: 'Delete variant (soft delete)' })
  @ApiResponse({ status: 200, description: 'Variant deleted successfully' })
  async deleteVariant(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    await this.variantService.delete(id, req.user.sub);
    return { data: { deleted: true } };
  }

  // ==================== Pricing Management ====================

  @Get('variants/:id/price')
  @ApiOperation({ summary: 'Get variant price in specific currency' })
  @ApiResponse({ status: 200, description: 'Price retrieved successfully' })
  async getVariantPrice(
    @Param('id') variantId: string,
    @Query('currency') currency?: string
  ) {
    const price = await this.pricingService.getVariantPrice(variantId, currency);
    return { data: price };
  }

  @Get(':id/prices')
  @ApiOperation({ summary: 'Get all variant prices for product' })
  @ApiResponse({ status: 200, description: 'Prices retrieved successfully' })
  async getProductPrices(
    @Param('id') productId: string,
    @Query('currency') currency?: string
  ) {
    const prices = await this.pricingService.getProductPrices(productId, currency);
    return { data: prices };
  }

  @Get(':id/price-range')
  @ApiOperation({ summary: 'Get product price range' })
  @ApiResponse({ status: 200, description: 'Price range retrieved successfully' })
  async getPriceRange(
    @Param('id') productId: string,
    @Query('currency') currency?: string
  ) {
    const range = await this.pricingService.getProductPriceRange(productId, currency);
    return { data: range };
  }

  // ==================== Inventory Management ====================

  @Post('variants/:id/stock')
  @ApiOperation({ summary: 'Update variant stock' })
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
    return { data: result };
  }

  @Get('variants/:id/availability')
  @ApiOperation({ summary: 'Check variant availability' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  async checkAvailability(
    @Param('id') variantId: string,
    @Query('quantity') quantity: number
  ) {
    const result = await this.inventoryService.checkAvailability(variantId, quantity);
    return { data: result };
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get low stock variants' })
  @ApiResponse({ status: 200, description: 'Low stock variants retrieved successfully' })
  async getLowStock(@Query('threshold') threshold?: number) {
    const variants = await this.inventoryService.getLowStockVariants(threshold);
    return { data: variants };
  }

  @Get('inventory/out-of-stock')
  @ApiOperation({ summary: 'Get out of stock variants' })
  @ApiResponse({ status: 200, description: 'Out of stock variants retrieved successfully' })
  async getOutOfStock() {
    const variants = await this.inventoryService.getOutOfStockVariants();
    return { data: variants };
  }

  @Get('inventory/summary')
  @ApiOperation({ summary: 'Get inventory summary' })
  @ApiResponse({ status: 200, description: 'Inventory summary retrieved successfully' })
  async getInventorySummary() {
    const summary = await this.inventoryService.getInventorySummary();
    return { data: summary };
  }
}
