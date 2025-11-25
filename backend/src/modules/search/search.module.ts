import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchAdminController } from './search.admin.controller';
import { SearchService } from './search.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Brand, BrandSchema } from '../brands/schemas/brand.schema';
import { SearchLog, SearchLogSchema } from './schemas/search-log.schema';
import { CacheModule } from '../../shared/cache/cache.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Brand.name, schema: BrandSchema },
      { name: SearchLog.name, schema: SearchLogSchema },
    ]),
    CacheModule,
    AuthModule,
    SharedModule,
    ProductsModule,
  ],
  controllers: [
    SearchController,
    SearchAdminController, // Admin routes
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
