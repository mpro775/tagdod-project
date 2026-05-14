import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingSettings, LandingSettingsSchema } from './schemas/landing-settings.schema';
import { LandingService } from './landing.service';
import { LandingPublicController } from './landing.public.controller';
import { LandingAdminController } from './landing.admin.controller';
import { AboutModule } from '../about/about.module';
import { BrandsModule } from '../brands/brands.module';
import { ProductsModule } from '../products/products.module';
import { ProjectsModule } from '../projects/projects.module';
import { ArticlesModule } from '../articles/articles.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LandingSettings.name, schema: LandingSettingsSchema }]),
    forwardRef(() => AboutModule),
    forwardRef(() => BrandsModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => ProjectsModule),
    forwardRef(() => ArticlesModule),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [LandingPublicController, LandingAdminController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
