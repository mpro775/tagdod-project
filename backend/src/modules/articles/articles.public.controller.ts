import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { ArticleQueryDto } from './dto/article.dto';

@ApiTags('المقالات-العام')
@Controller('articles')
export class ArticlesPublicController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({
    summary: 'قائمة المقالات',
    description: 'الحصول على قائمة المقالات المنشورة',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'تم جلب المقالات بنجاح' })
  async findAll(@Query() dto: ArticleQueryDto) {
    return this.articlesService.findAll({ ...dto, status: 'published' });
  }

  @Get('featured')
  @ApiOperation({
    summary: 'المقالات المميزة',
    description: 'الحصول على المقالات المميزة',
  })
  @ApiResponse({ status: 200, description: 'تم جلب المقالات المميزة بنجاح' })
  async getFeatured() {
    return this.articlesService.getFeatured();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'تفاصيل مقال',
    description: 'الحصول على تفاصيل مقال معين',
  })
  @ApiParam({ name: 'slug', description: 'الرابط المختصر للمقال' })
  @ApiResponse({ status: 200, description: 'تم جلب المقال بنجاح' })
  @ApiResponse({ status: 404, description: 'المقال غير موجود' })
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }
}
