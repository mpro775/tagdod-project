import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from '../../shared/services/audit.service';
import { AuditAction, AuditResource } from './schemas/audit-log.schema';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({
    summary: 'Get audit logs with filtering',
    description: 'Retrieve audit logs with various filtering options',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
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
      data: logs,
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
    summary: 'Get audit statistics',
    description: 'Get statistics about audit logs',
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
      data: {
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
      },
    };
  }

  @Get('actions')
  @ApiOperation({
    summary: 'Get available audit actions',
    description: 'Get list of all available audit actions',
  })
  getAuditActions() {
    return {
      data: Object.values(AuditAction),
    };
  }

  @Get('resources')
  @ApiOperation({
    summary: 'Get available audit resources',
    description: 'Get list of all available audit resources',
  })
  getAuditResources() {
    return {
      data: Object.values(AuditResource),
    };
  }
}
