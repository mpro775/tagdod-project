import {
  Controller,
  Get,
  
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { SupportService } from './support.service';
import { UpdateSupportTicketDto } from './dto/update-ticket.dto';
import { AddSupportMessageDto } from './dto/add-message.dto';
import { CreateCannedResponseDto, UpdateCannedResponseDto } from './dto/canned-response.dto';
import { SupportStatus, SupportPriority, SupportCategory } from './schemas/support-ticket.schema';

// JWT Payload interface
interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

// Request with JWT user
interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('support-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/support')
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @RequirePermissions(AdminPermission.SUPPORT_READ, AdminPermission.ADMIN_ACCESS)
  @Get('tickets')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: SupportStatus })
  @ApiQuery({ name: 'priority', required: false, enum: SupportPriority })
  @ApiQuery({ name: 'category', required: false, enum: SupportCategory })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  async getAllTickets(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: SupportStatus,
    @Query('priority') priority?: SupportPriority,
    @Query('category') category?: SupportCategory,
    @Query('assignedTo') assignedTo?: string,
  ) {
    const filters = { status, priority, category, assignedTo };
    const result = await this.supportService.getAllTickets(filters, page, limit);
    return { data: result };
  }

  @Get('tickets/:id')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async getTicket(@Param('id') ticketId: string) {
    const ticket = await this.supportService.getTicket(ticketId, '', true);
    return { data: ticket };
  }

  @Patch('tickets/:id')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() dto: UpdateSupportTicketDto,
    @Req() req: RequestWithUser,
  ) {
    const adminId = req.user!.sub;
    const ticket = await this.supportService.updateTicket(ticketId, dto, adminId);
    return { data: ticket };
  }

  @Get('tickets/:id/messages')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTicketMessages(
    @Param('id') ticketId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const result = await this.supportService.getTicketMessages(ticketId, '', true, page, limit);
    return { data: result };
  }

  @Post('tickets/:id/messages')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async addMessage(
    @Req() req: RequestWithUser,
    @Param('id') ticketId: string,
    @Body() dto: AddSupportMessageDto,
  ) {
    const adminId = req.user!.sub;
    const message = await this.supportService.addMessage(ticketId, adminId, dto, true);
    return { data: message };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.supportService.getTicketStats();
    return { data: stats };
  }

  @Get('sla/breached')
  async getBreachedSLATickets() {
    const tickets = await this.supportService.getBreachedSLATickets();
    return { data: tickets };
  }

  @Post('sla/:id/check')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async checkSLAStatus(@Param('id') ticketId: string) {
    const isBreached = await this.supportService.checkSLAStatus(ticketId);
    return { data: { ticketId, slaBreached: isBreached } };
  }

  // Canned Responses endpoints
  @Post('canned-responses')
  async createCannedResponse(@Body() dto: CreateCannedResponseDto) {
    const response = await this.supportService.createCannedResponse(dto);
    return { data: response };
  }

  @Get('canned-responses')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, enum: SupportCategory })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getCannedResponses(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('category') category?: SupportCategory,
    @Query('search') search?: string,
  ) {
    const result = await this.supportService.getCannedResponses(category, search, page, limit);
    return { data: result };
  }

  @Get('canned-responses/:id')
  @ApiParam({ name: 'id', description: 'Canned Response ID' })
  async getCannedResponse(@Param('id') id: string) {
    const response = await this.supportService.getCannedResponse(id);
    return { data: response };
  }

  @Patch('canned-responses/:id')
  @ApiParam({ name: 'id', description: 'Canned Response ID' })
  async updateCannedResponse(
    @Param('id') id: string,
    @Body() dto: UpdateCannedResponseDto,
  ) {
    const response = await this.supportService.updateCannedResponse(id, dto);
    return { data: response };
  }

  @Post('canned-responses/:id/use')
  @ApiParam({ name: 'id', description: 'Canned Response ID' })
  async useCannedResponse(@Param('id') id: string) {
    const response = await this.supportService.useCannedResponse(id);
    return { data: response };
  }

  @Get('canned-responses/shortcut/:shortcut')
  @ApiParam({ name: 'shortcut', description: 'Canned Response Shortcut' })
  async getCannedResponseByShortcut(@Param('shortcut') shortcut: string) {
    const response = await this.supportService.getCannedResponseByShortcut(shortcut);
    return { data: response };
  }
}
