import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schemas/brand.schema';
import { BrandsService } from './brands.service';
import { BrandsAdminController } from './brands.admin.controller';
import { BrandsPublicController } from './brands.public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
    ]),
  ],
  controllers: [BrandsAdminController, BrandsPublicController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}

