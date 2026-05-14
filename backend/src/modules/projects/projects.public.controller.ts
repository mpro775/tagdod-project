import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectQueryDto } from './dto/project.dto';

@ApiTags('المشاريع-العام')
@Controller('projects')
export class ProjectsPublicController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: 'قائمة المشاريع',
    description: 'الحصول على قائمة المشاريع المنشورة',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'تم جلب المشاريع بنجاح' })
  async findAll(@Query() dto: ProjectQueryDto) {
    return this.projectsService.findAll({ ...dto, isPublished: true });
  }

  @Get('featured')
  @ApiOperation({
    summary: 'المشاريع المميزة',
    description: 'الحصول على المشاريع المميزة',
  })
  @ApiResponse({ status: 200, description: 'تم جلب المشاريع المميزة بنجاح' })
  async getFeatured() {
    return this.projectsService.getFeatured();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'تفاصيل مشروع',
    description: 'الحصول على تفاصيل مشروع معين',
  })
  @ApiParam({ name: 'slug', description: 'الرابط المختصر للمشروع' })
  @ApiResponse({ status: 200, description: 'تم جلب المشروع بنجاح' })
  @ApiResponse({ status: 404, description: 'المشروع غير موجود' })
  async findBySlug(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }
}
