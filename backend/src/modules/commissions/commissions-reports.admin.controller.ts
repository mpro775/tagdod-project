import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CommissionsReportsService } from './commissions-reports.service';
import {
  CommissionsReportQueryDto,
  AccountStatementQueryDto,
  CommissionsReportResponse,
  AccountStatementResponse,
} from './dto/commissions-reports.dto';

@ApiTags('تقارير-العمولات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/commissions')
export class CommissionsReportsAdminController {
  private readonly logger = new Logger(CommissionsReportsAdminController.name);

  constructor(
    private readonly commissionsReportsService: CommissionsReportsService,
  ) {}

  @RequirePermissions('admin.access')
  @Get('reports')
  @ApiOperation({
    summary: 'جلب تقرير العمولات الشامل',
    description: 'جلب تقرير شامل لعمولات المهندسين حسب الفترة الزمنية المحددة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب التقرير بنجاح',
    type: Object,
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة',
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح',
  })
  async getCommissionsReport(
    @Query() query: CommissionsReportQueryDto,
  ): Promise<{ success: boolean; data: CommissionsReportResponse }> {
    try {
      const params = {
        period: query.period,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        engineerId: query.engineerId,
      };

      const report = await this.commissionsReportsService.getCommissionsReport(params);

      return {
        success: true,
        data: report,
      };
    } catch (error: any) {
      this.logger.error('Error fetching commissions report', error);
      throw error;
    }
  }

  @RequirePermissions('admin.access')
  @Get('reports/:engineerId')
  @ApiOperation({
    summary: 'جلب تقرير عمولات مهندس محدد',
    description: 'جلب تقرير عمولات لمهندس محدد حسب الفترة الزمنية المحددة',
  })
  @ApiParam({
    name: 'engineerId',
    description: 'معرف المهندس',
    example: '64user123',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب التقرير بنجاح',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'المهندس غير موجود',
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح',
  })
  async getEngineerCommissionsReport(
    @Param('engineerId') engineerId: string,
    @Query() query: CommissionsReportQueryDto,
  ): Promise<{ success: boolean; data: CommissionsReportResponse }> {
    try {
      const params = {
        period: query.period,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        engineerId,
      };

      const report = await this.commissionsReportsService.getEngineerCommissionsReport(
        engineerId,
        params,
      );

      return {
        success: true,
        data: report,
      };
    } catch (error: any) {
      this.logger.error('Error fetching engineer commissions report', error);
      throw error;
    }
  }

  @RequirePermissions('admin.access')
  @Get('statements/:engineerId')
  @ApiOperation({
    summary: 'جلب كشف حساب مهندس',
    description: 'جلب كشف حساب تفصيلي لمهندس محدد مع جميع المعاملات',
  })
  @ApiParam({
    name: 'engineerId',
    description: 'معرف المهندس',
    example: '64user123',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب كشف الحساب بنجاح',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'المهندس غير موجود',
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح',
  })
  async getAccountStatement(
    @Param('engineerId') engineerId: string,
    @Query() query: AccountStatementQueryDto,
  ): Promise<{ success: boolean; data: AccountStatementResponse }> {
    try {
      const params = {
        dateFrom: new Date(query.dateFrom),
        dateTo: new Date(query.dateTo),
      };

      const statement = await this.commissionsReportsService.getAccountStatement(
        engineerId,
        params,
      );

      return {
        success: true,
        data: statement,
      };
    } catch (error: any) {
      this.logger.error('Error fetching account statement', error);
      throw error;
    }
  }
}

