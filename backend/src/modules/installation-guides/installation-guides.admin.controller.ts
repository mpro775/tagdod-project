import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import {
  CreateInstallationGuideDto,
  ListInstallationGuidesDto,
  ToggleInstallationGuideDto,
  UpdateInstallationGuideDto,
} from './dto/installation-guide.dto';
import { InstallationGuidesService } from './installation-guides.service';

interface RequestWithUser {
  user: {
    sub: string;
  };
}

@ApiTags('إدارة-طرق-التركيب')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/installation-guides')
export class InstallationGuidesAdminController {
  constructor(private readonly guidesService: InstallationGuidesService) {}

  @Get()
  @RequirePermissions(AdminPermission.MARKETING_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'List installation guides for dashboard' })
  @ApiQuery({ type: ListInstallationGuidesDto })
  async list(@Query() query: ListInstallationGuidesDto) {
    return this.guidesService.listForAdmin(query);
  }

  @Post()
  @RequirePermissions(AdminPermission.MARKETING_UPDATE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Create installation guide' })
  @ApiBody({ type: CreateInstallationGuideDto })
  @ApiResponse({ status: 201, description: 'Guide created successfully' })
  async create(
    @Body() dto: CreateInstallationGuideDto,
    @Req() req: RequestWithUser,
  ) {
    return this.guidesService.create(dto, req.user.sub);
  }

  @Get(':id')
  @RequirePermissions(AdminPermission.MARKETING_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get installation guide details for dashboard' })
  async getById(@Param('id') id: string) {
    return this.guidesService.getByIdForAdmin(id);
  }

  @Put(':id')
  @RequirePermissions(AdminPermission.MARKETING_UPDATE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Update installation guide' })
  @ApiBody({ type: UpdateInstallationGuideDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInstallationGuideDto,
    @Req() req: RequestWithUser,
  ) {
    return this.guidesService.update(id, dto, req.user.sub);
  }

  @Post(':id/toggle')
  @RequirePermissions(AdminPermission.MARKETING_UPDATE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Toggle installation guide active status' })
  @ApiBody({ type: ToggleInstallationGuideDto })
  async toggle(
    @Param('id') id: string,
    @Body() dto: ToggleInstallationGuideDto,
    @Req() req: RequestWithUser,
  ) {
    return this.guidesService.toggle(id, dto.isActive, req.user.sub);
  }

  @Delete(':id')
  @RequirePermissions(AdminPermission.MARKETING_UPDATE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Delete installation guide' })
  async delete(@Param('id') id: string) {
    return this.guidesService.delete(id);
  }
}

