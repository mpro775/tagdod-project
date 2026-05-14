import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schemas/article.schema';
import { ArticlesService } from './articles.service';
import { ArticlesPublicController } from './articles.public.controller';
import { ArticlesAdminController } from './articles.admin.controller';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    forwardRef(() => AuthModule),
    SharedModule,
  ],
  controllers: [ArticlesPublicController, ArticlesAdminController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
