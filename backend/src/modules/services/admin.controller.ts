import { Controller, Get, Param, Post, Query, UseGuards, Patch, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { ServicesService } from './services.service';
import { ServicesPermissionGuard, ServicePermission } from './guards/services-permission.guard';
import { RequireServicePermission } from './decorators/service-permission.decorator';
import { OffersStatisticsDto, OffersManagementResponseDto, EngineersOverviewStatisticsDto } from './dto/offers.dto';

@ApiTags('services-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ServicesPermissionGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ENGINEER)
@Controller('services/admin')
export class AdminServicesController {
  constructor(private svc: ServicesService) {}

  @RequirePermissions(AdminPermission.SERVICES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('requests')
  @RequireServicePermission(ServicePermission.ADMIN)
  async list(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('engineerId') engineerId?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.svc.adminList({
      status,
      type,
      engineerId,
      userId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search,
      page: Number(page),
      limit: Number(limit),
    });
    return { data: data.items, meta: data.meta };
  }

  @Get('requests/:id')
  async getRequest(@Param('id') id: string) {
    const data = await this.svc.adminGetRequest(id);
    return { data };
  }

  @Get('requests/:id/offers')
  async getRequestOffers(@Param('id') id: string) {
    const data = await this.svc.adminGetRequestOffers(id);
    return { data };
  }

  @Patch('requests/:id/status')
  async updateRequestStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('note') note?: string,
  ) {
    const data = await this.svc.adminUpdateRequestStatus(id, status, note);
    return { data };
  }

  @Post('requests/:id/cancel')
  async cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    const data = await this.svc.adminCancel(id, reason);
    return { data };
  }

  @Post('requests/:id/assign-engineer')
  async assignEngineer(
    @Param('id') id: string,
    @Body('engineerId') engineerId: string,
    @Body('note') note?: string,
  ) {
    const data = await this.svc.adminAssignEngineer(id, engineerId, note);
    return { data };
  }

  // === إحصائيات شاملة ===
  @Get('statistics/overview')
  async getOverviewStats() {
    const data = await this.svc.getOverviewStatistics();
    return { data };
  }

  @Get('statistics/requests')
  async getRequestsStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    const data = await this.svc.getRequestsStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      groupBy: groupBy || 'day',
    });
    return { data };
  }

  @Get('statistics/engineers')
  async getEngineersStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit = '10',
  ) {
    const data = await this.svc.getEngineersStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: Number(limit),
    });
    return { data };
  }

  @Get('statistics/services-types')
  async getServiceTypesStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const data = await this.svc.getServiceTypesStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
    return { data };
  }

  @Get('statistics/revenue')
  async getRevenueStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    const data = await this.svc.getRevenueStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      groupBy: groupBy || 'day',
    });
    return { data };
  }

  // === إدارة المهندسين ===
  @Get('engineers')
  async getEngineersList(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const data = await this.svc.getEngineersList({
      page: Number(page),
      limit: Number(limit),
      search,
    });
    return { data: data.items, meta: data.meta };
  }

  @Get('engineers/:id/statistics')
  async getEngineerStats(@Param('id') id: string) {
    const data = await this.svc.getEngineerStatistics(id);
    return { data };
  }

  @Get('engineers/:id/offers')
  async getEngineerOffers(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.svc.getEngineerOffers(id, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
    return { data: data.items, meta: data.meta };
  }

  // === إحصائيات المهندسين ===
  @Get('engineers/statistics/overview')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ summary: 'احصل على إحصائيات عامة للمهندسين' })
  @ApiResponse({ status: 200, type: EngineersOverviewStatisticsDto })
  async getEngineersOverviewStatistics(): Promise<{ data: EngineersOverviewStatisticsDto }> {
    const data = await this.svc.getEngineersOverviewStatistics();
    return { data };
  }

  // === إحصائيات العروض ===
  @Get('offers/statistics')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ summary: 'احصل على إحصائيات العروض' })
  @ApiResponse({ status: 200, type: OffersStatisticsDto })
  async getOffersStatistics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<{ data: OffersStatisticsDto }> {
    const data = await this.svc.getOffersStatistics({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
    return { data };
  }

  // === إدارة العروض ===
  @Get('offers')
  @RequireServicePermission(ServicePermission.ADMIN)
  @ApiOperation({ summary: 'احصل على قائمة العروض للإدارة' })
  @ApiResponse({ status: 200, type: OffersManagementResponseDto })
  async getOffersManagementList(
    @Query('status') status?: string,
    @Query('requestId') requestId?: string,
    @Query('engineerId') engineerId?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<OffersManagementResponseDto> {
    const data = await this.svc.getOffersManagementList({
      status,
      requestId,
      engineerId,
      search,
      page: Number(page),
      limit: Number(limit),
    });
    return { data: data.items, meta: data.meta };
  }
}
