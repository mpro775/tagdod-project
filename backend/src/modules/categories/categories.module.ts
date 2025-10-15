import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { CategoriesAdminController } from './admin.controller';
import { CategoriesPublicController } from './public.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { CacheModule } from '../../shared/cache/cache.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Media, MediaSchema } from '../upload/schemas/media.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
    CacheModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [CategoriesAdminController, CategoriesPublicController],
  providers: [CategoriesService],
  exports: [CategoriesService, MongooseModule], // Export للاستخدام من modules أخرى
})
export class CategoriesModule {}

