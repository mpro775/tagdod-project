import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from '../../shared/services/audit.service';
import { AuditAction, AuditResource } from './schemas/audit-log.schema';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('التدقيق')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({
    summary: 'الحصول على سجلات التدقيق مع التصفية',
    description: 'استرداد سجلات التدقيق مع خيارات التصفية المتنوعة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد سجلات التدقيق بنجاح',
  })
  async getAuditLogs(
    @Query() query: {
      userId?: string;
      performedBy?: string;
      action?: AuditAction;
      resource?: AuditResource;
      resourceId?: string;
      startDate?: string;
      endDate?: string;
      isSensitive?: string;
      limit?: string;
      skip?: string;
    },
  ) {
    const filters = {
      userId: query.userId,
      performedBy: query.performedBy,
      action: query.action as AuditAction,
      resource: query.resource as AuditResource,
      resourceId: query.resourceId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      isSensitive: query.isSensitive ? query.isSensitive === 'true' : undefined,
      limit: query.limit ? parseInt(query.limit) : 50,
      skip: query.skip ? parseInt(query.skip) : 0,
    };

    const [logs, total] = await Promise.all([
      this.auditService.searchAuditLogs(filters),
      this.auditService.countAuditLogs(filters),
    ]);

    return {
      logs,
      meta: {
        total,
        limit: filters.limit,
        skip: filters.skip,
        hasMore: filters.skip + filters.limit < total,
      },
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'الحصول على إحصائيات التدقيق',
    description: 'الحصول على إحصائيات حول سجلات التدقيق',
  })
  async getAuditStats(
    @Query() query: {
      startDate?: string;
      endDate?: string;
    },
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    // Get counts for different actions
    const [
      totalLogs,
      sensitiveLogs,
      permissionChanges,
      roleChanges,
      capabilityDecisions,
      adminActions,
      authEvents,
    ] = await Promise.all([
      this.auditService.countAuditLogs({ startDate, endDate }),
      this.auditService.countAuditLogs({ startDate, endDate, isSensitive: true }),
      this.auditService.countAuditLogs({
        startDate,
        endDate,
        resource: AuditResource.PERMISSION
      }),
      this.auditService.countAuditLogs({
        startDate,
        endDate,
        resource: AuditResource.ROLE
      }),
      this.auditService.countAuditLogs({
        startDate,
        endDate,
        resource: AuditResource.CAPABILITY
      }),
      this.auditService.countAuditLogs({
        startDate,
        endDate,
        action: AuditAction.ADMIN_ACTION
      }),
      this.auditService.countAuditLogs({
        startDate,
        endDate,
        resource: AuditResource.AUTH
      }),
    ]);

    return {
      totalLogs,
      sensitiveLogs,
      permissionChanges,
      roleChanges,
      capabilityDecisions,
      adminActions,
      authEvents,
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };
  }

  @Get('actions')
  @ApiOperation({
    summary: 'الحصول على إجراءات التدقيق المتاحة',
    description: 'الحصول على قائمة بجميع إجراءات التدقيق المتاحة',
  })
  getAuditActions() {
    return Object.values(AuditAction);
  }

  @Get('resources')
  @ApiOperation({
    summary: 'الحصول على موارد التدقيق المتاحة',
    description: 'الحصول على قائمة بجميع موارد التدقيق المتاحة',
  })
  getAuditResources() {
    return Object.values(AuditResource);
  }
}
