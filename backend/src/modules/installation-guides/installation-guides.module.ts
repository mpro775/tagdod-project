import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { UploadModule } from '../upload/upload.module';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Media, MediaSchema } from '../upload/schemas/media.schema';
import {
  InstallationGuide,
  InstallationGuideSchema,
} from './schemas/installation-guide.schema';
import { InstallationGuidesService } from './installation-guides.service';
import { InstallationGuidesAdminController } from './installation-guides.admin.controller';
import { InstallationGuidesPublicController } from './installation-guides.public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InstallationGuide.name, schema: InstallationGuideSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    forwardRef(() => AuthModule),
    SharedModule,
    UploadModule,
  ],
  controllers: [
    InstallationGuidesAdminController,
    InstallationGuidesPublicController,
  ],
  providers: [InstallationGuidesService],
  exports: [InstallationGuidesService, MongooseModule],
})
export class InstallationGuidesModule {}

