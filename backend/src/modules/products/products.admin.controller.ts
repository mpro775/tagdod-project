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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ProductsService } from './products.service';
import { VariantsService } from './variants.service';
import { CreateProductDto, UpdateProductDto, ListProductsDto, CreateVariantDto, UpdateVariantDto, GenerateVariantsDto } from './dto/product.dto';
import { Product } from './schemas/product.schema';
import { Variant } from './schemas/variant.schema';

@ApiTags('admin-products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@Controller('admin/products')
export class ProductsAdminController {
  constructor(
    private productsService: ProductsService,
    private variantsService: VariantsService,
  ) {}

  // ==================== Products ====================

  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    const product = await this.productsService.createProduct(dto as Partial<Product>);
    return { data: product };
  }

  @Get()
  async listProducts(@Query() dto: ListProductsDto) {
    return this.productsService.listProducts(dto);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.getProduct(id);
    return { data: product };
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto
  ) {
    const product = await this.productsService.updateProduct(id, dto as Partial<Product>);
    return { data: product };
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    const product = await this.productsService.deleteProduct(id, req.user.sub);
    return { data: { deleted: true, deletedAt: product.deletedAt } };
  }

  @Post(':id/restore')
  async restoreProduct(@Param('id') id: string) {
    await this.productsService.restoreProduct(id);
    return { data: { restored: true } };
  }

  @Post(':id/update-stats')
  async updateStats(@Param('id') id: string) {
    await this.productsService.updateProductStats(id);
    return { data: { updated: true } };
  }

  @Get('stats/summary')
  async getStats() {
    return this.productsService.getStats();
  }

  // ==================== Variants ====================

  @Post(':productId/variants')
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto
  ) {
    dto.productId = productId;
    const variant = await this.variantsService.createVariant(dto as Partial<Variant>);
    return { data: variant };
  }

  @Get(':productId/variants')
  async listVariants(
    @Param('productId') productId: string,
    @Query('includeDeleted') includeDeleted?: boolean
  ) {
    const variants = await this.variantsService.listVariants(productId, includeDeleted);
    return { data: variants };
  }

  @Patch('variants/:id')
  async updateVariant(
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto
  ) {
    const variant = await this.variantsService.updateVariant(id, dto as Partial<Variant>);
    return { data: variant };
  }

  @Delete('variants/:id')
  async deleteVariant(@Param('id') id: string) {
    await this.variantsService.deleteVariant(id);
    return { data: { deleted: true } };
  }

  // ==================== Variant Generator ====================

  @Post(':productId/variants/generate')
  async generateVariants(
    @Param('productId') productId: string,
    @Body() dto: GenerateVariantsDto
  ) {
    const result = await this.variantsService.generateVariants(
      productId,
      dto.defaultPrice,
      dto.defaultStock,
      dto.overwriteExisting
    );
    return { data: result };
  }
}

