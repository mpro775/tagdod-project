import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { VariantsService } from './variants.service';
import { ProductsAdminController } from './products.admin.controller';
import { ProductsPublicController } from './products.public.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { CacheModule } from '../../shared/cache/cache.module';
import { AttributesModule } from '../attributes/attributes.module';
import { CategoriesModule } from '../categories/categories.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { TokensService } from '../auth/tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CacheModule,
    AttributesModule,
    CategoriesModule,
  ],
  controllers: [ProductsAdminController, ProductsPublicController],
  providers: [ProductsService, VariantsService, TokensService],
  exports: [ProductsService, VariantsService, MongooseModule],
})
export class ProductsModule {}

