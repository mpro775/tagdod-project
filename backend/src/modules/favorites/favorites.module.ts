import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoritesUserController } from './favorites.user.controller';
import { FavoritesGuestController } from './favorites.guest.controller';
import { FavoritesAdminController } from './favorites.admin.controller';
import { FavoritesService } from './favorites.service';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { ProductsModule } from '../products/products.module';
import { TokensService } from '../auth/tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    ProductsModule, // للوصول إلى Products & Variants
  ],
  controllers: [
    FavoritesUserController,
    FavoritesGuestController,
    FavoritesAdminController,
  ],
  providers: [FavoritesService, TokensService],
  exports: [MongooseModule, FavoritesService],
})
export class FavoritesModule {}
