import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { ContactRequestsService } from './contact-requests.service';
import { ContactRequestQueryDto, UpdateContactRequestStatusDto, AssignContactRequestDto } from './dto/contact-request.dto';

@ApiTags('إدارة-طلبات-التواصل')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/contact-requests')
export class ContactRequestsAdminController {
  constructor(private readonly contactRequestsService: ContactRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة طلبات التواصل' })
  @ApiResponse({ status: 200, description: 'تم جلب الطلبات بنجاح' })
  async findAll(@Query() dto: ContactRequestQueryDto) {
    return this.contactRequestsService.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات طلبات التواصل' })
  @ApiResponse({ status: 200, description: 'تم جلب الإحصائيات بنجاح' })
  async getStats() {
    return this.contactRequestsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل طلب تواصل' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم جلب الطلب بنجاح' })
  async findById(@Param('id') id: string) {
    return this.contactRequestsService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'تحديث حالة الطلب' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiBody({ type: UpdateContactRequestStatusDto })
  @ApiResponse({ status: 200, description: 'تم تحديث الحالة بنجاح' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateContactRequestStatusDto) {
    return this.contactRequestsService.updateStatus(id, dto);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'إسناد الطلب' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiBody({ type: AssignContactRequestDto })
  @ApiResponse({ status: 200, description: 'تم إسناد الطلب بنجاح' })
  async assign(@Param('id') id: string, @Body() dto: AssignContactRequestDto) {
    return this.contactRequestsService.assign(id, dto);
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'إضافة ملاحظات' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiBody({ schema: { type: 'object', properties: { notes: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'تم إضافة الملاحظات بنجاح' })
  async addNotes(@Param('id') id: string, @Body() dto: { notes: string }) {
    return this.contactRequestsService.addNotes(id, dto.notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف طلب تواصل' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم حذف الطلب بنجاح' })
  async delete(@Param('id') id: string) {
    return this.contactRequestsService.delete(id);
  }
}
