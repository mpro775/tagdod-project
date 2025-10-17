import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schemas/brand.schema';
import { BrandsService } from './brands.service';
import { BrandsAdminController } from './brands.admin.controller';
import { BrandsPublicController } from './brands.public.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [BrandsAdminController, BrandsPublicController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}

