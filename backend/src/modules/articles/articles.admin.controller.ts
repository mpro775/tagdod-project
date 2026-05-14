import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto, ArticleQueryDto, ReorderArticleDto } from './dto/article.dto';

@ApiTags('إدارة-المقالات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/articles')
export class ArticlesAdminController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مقال جديد' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ status: 201, description: 'تم إنشاء المقال بنجاح' })
  async create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المقالات' })
  @ApiResponse({ status: 200, description: 'تم جلب المقالات بنجاح' })
  async findAll(@Query() dto: ArticleQueryDto) {
    return this.articlesService.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات المقالات' })
  @ApiResponse({ status: 200, description: 'تم جلب الإحصائيات بنجاح' })
  async getStats() {
    return this.articlesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل مقال' })
  @ApiParam({ name: 'id', description: 'معرف المقال' })
  @ApiResponse({ status: 200, description: 'تم جلب المقال بنجاح' })
  async findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث مقال' })
  @ApiParam({ name: 'id', description: 'معرف المقال' })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({ status: 200, description: 'تم تحديث المقال بنجاح' })
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مقال' })
  @ApiParam({ name: 'id', description: 'معرف المقال' })
  @ApiResponse({ status: 200, description: 'تم حذف المقال بنجاح' })
  async delete(@Param('id') id: string) {
    return this.articlesService.delete(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'نشر مقال' })
  @ApiParam({ name: 'id', description: 'معرف المقال' })
  @ApiResponse({ status: 200, description: 'تم نشر المقال بنجاح' })
  async publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'أرشفة مقال' })
  @ApiParam({ name: 'id', description: 'معرف المقال' })
  @ApiResponse({ status: 200, description: 'تم أرشفة المقال بنجاح' })
  async archive(@Param('id') id: string) {
    return this.articlesService.archive(id);
  }

  @Patch(':id/toggle-landing')
  @ApiOperation({ summary: 'إظهار/إخفاء في Landing Page' })
  @ApiParam({ name: 'id', description: 'معرف المقال' })
  @ApiResponse({ status: 200, description: 'تم تحديث حالة العرض' })
  async toggleLanding(@Param('id') id: string) {
    return this.articlesService.toggleLanding(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'إعادة ترتيب المقالات' })
  @ApiBody({ type: ReorderArticleDto })
  @ApiResponse({ status: 200, description: 'تم إعادة الترتيب بنجاح' })
  async reorder(@Body() dto: ReorderArticleDto) {
    return this.articlesService.reorder(dto);
  }
}
