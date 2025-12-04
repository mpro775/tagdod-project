import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutService } from './about.service';
import { AboutAdminController } from './about.admin.controller';
import { AboutPublicController } from './about.public.controller';
import { About, AboutSchema } from './schemas/about.schema';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: About.name, schema: AboutSchema }]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [AboutAdminController, AboutPublicController],
  providers: [AboutService],
  exports: [AboutService, MongooseModule],
})
export class AboutModule {}

