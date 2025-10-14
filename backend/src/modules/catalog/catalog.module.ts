import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogService } from './catalog.service';
import { CatalogPublicController } from './public.controller';
import { CatalogAdminController } from './admin.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { VariantPrice, VariantPriceSchema } from './schemas/variant-price.schema';
import { CategoriesModule } from '../categories/categories.module'; // استيراد Categories Module

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: VariantPrice.name, schema: VariantPriceSchema },
    ]),
    CategoriesModule, // ربط مع Categories Module
  ],
  controllers: [CatalogPublicController, CatalogAdminController],
  providers: [CatalogService],
  exports: [MongooseModule, CatalogService],
})
export class CatalogModule {}
