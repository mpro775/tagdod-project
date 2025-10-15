import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoritesUserController } from './favorites.user.controller';
import { FavoritesGuestController } from './favorites.guest.controller';
import { FavoritesAdminController } from './favorites.admin.controller';
import { FavoritesService } from './favorites.service';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    ProductsModule, // للوصول إلى Products & Variants
    forwardRef(() => AuthModule),
  ],
  controllers: [
    FavoritesUserController,
    FavoritesGuestController,
    FavoritesAdminController,
  ],
  providers: [FavoritesService],
  exports: [MongooseModule, FavoritesService],
})
export class FavoritesModule {}
