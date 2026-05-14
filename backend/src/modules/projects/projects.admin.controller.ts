import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto, ReorderProjectDto } from './dto/project.dto';

@ApiTags('إدارة-المشاريع')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مشروع جديد' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'تم إنشاء المشروع بنجاح' })
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة المشاريع' })
  @ApiResponse({ status: 200, description: 'تم جلب المشاريع بنجاح' })
  async findAll(@Query() dto: ProjectQueryDto) {
    return this.projectsService.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات المشاريع' })
  @ApiResponse({ status: 200, description: 'تم جلب الإحصائيات بنجاح' })
  async getStats() {
    return this.projectsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل مشروع' })
  @ApiParam({ name: 'id', description: 'معرف المشروع' })
  @ApiResponse({ status: 200, description: 'تم جلب المشروع بنجاح' })
  async findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث مشروع' })
  @ApiParam({ name: 'id', description: 'معرف المشروع' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'تم تحديث المشروع بنجاح' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مشروع' })
  @ApiParam({ name: 'id', description: 'معرف المشروع' })
  @ApiResponse({ status: 200, description: 'تم حذف المشروع بنجاح' })
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Patch(':id/toggle-publish')
  @ApiOperation({ summary: 'نشر/إخفاء مشروع' })
  @ApiParam({ name: 'id', description: 'معرف المشروع' })
  @ApiResponse({ status: 200, description: 'تم تحديث حالة النشر' })
  async togglePublish(@Param('id') id: string) {
    return this.projectsService.togglePublished(id);
  }

  @Patch(':id/toggle-landing')
  @ApiOperation({ summary: 'إظهار/إخفاء في Landing Page' })
  @ApiParam({ name: 'id', description: 'معرف المشروع' })
  @ApiResponse({ status: 200, description: 'تم تحديث حالة العرض' })
  async toggleLanding(@Param('id') id: string) {
    return this.projectsService.toggleLanding(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'إعادة ترتيب المشاريع' })
  @ApiBody({ type: ReorderProjectDto })
  @ApiResponse({ status: 200, description: 'تم إعادة الترتيب بنجاح' })
  async reorder(@Body() dto: ReorderProjectDto) {
    return this.projectsService.reorder(dto);
  }
}
