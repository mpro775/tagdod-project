import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductDto, UpdateProductDto, AddVariantDto, UpdateVariantDto, SetVariantPriceDto } from './dto/product.dto';
import { Product } from './schemas/product.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { Variant } from './schemas/variant.schema';
import { VariantPrice } from './schemas/variant-price.schema';

@ApiTags('catalog-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/catalog')
export class CatalogAdminController {
  constructor(private svc: CatalogService) {}

  // ==================== Products ====================
  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    const p = await this.svc.createProduct(dto as Partial<Product>);
    return { data: p };
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const p = await this.svc.updateProduct(id, dto as Partial<Product>);
    return { data: p };
  }

  @Post('variants')
  async addVariant(@Body() dto: AddVariantDto) {
    const v = await this.svc.addVariant(dto as Partial<Variant>);
    return { data: v };
  }

  @Patch('variants/:id')
  async updateVariant(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    const v = await this.svc.updateVariant(id, dto as Partial<Variant>);
    return { data: v };
  }

  @Post('variant-prices')
  async setPrice(@Body() dto: SetVariantPriceDto) {
    const price = await this.svc.setVariantPrice(dto as Partial<VariantPrice>);
    return { data: price };
  }
}
