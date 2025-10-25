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
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiBody
} from '@nestjs/swagger';
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

@ApiTags('إدارة-الدعم')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/support')
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @RequirePermissions(AdminPermission.SUPPORT_READ, AdminPermission.ADMIN_ACCESS)
  @Get('tickets')
  @ApiOperation({
    summary: 'قائمة تذاكر الدعم',
    description: 'استرداد قائمة بجميع تذاكر الدعم مع إمكانية التصفية والترقيم'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'رقم الصفحة', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'عدد العناصر في الصفحة', example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: SupportStatus, description: 'حالة التذكرة' })
  @ApiQuery({ name: 'priority', required: false, enum: SupportPriority, description: 'أولوية التذكرة' })
  @ApiQuery({ name: 'category', required: false, enum: SupportCategory, description: 'فئة التذكرة' })
  @ApiQuery({ name: 'assignedTo', required: false, type: String, description: 'معرف الموظف المسؤول' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة التذاكر بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'ticket123', description: 'معرف التذكرة' },
              title: { type: 'string', example: 'مشكلة في تسجيل الدخول', description: 'عنوان التذكرة' },
              status: { type: 'string', example: 'open', description: 'حالة التذكرة' },
              priority: { type: 'string', example: 'high', description: 'أولوية التذكرة' },
              category: { type: 'string', example: 'technical', description: 'فئة التذكرة' },
              customerId: { type: 'string', example: 'user456', description: 'معرف العميل' },
              customerName: { type: 'string', example: 'أحمد محمد', description: 'اسم العميل' },
              assignedTo: { type: 'string', example: 'admin789', description: 'معرف الموظف المسؤول' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى تذاكر الدعم'
  })
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
    return result;
  }

  @Get('tickets/:id')
  @ApiOperation({
    summary: 'تفاصيل تذكرة الدعم',
    description: 'استرداد تفاصيل كاملة لتذكرة دعم محددة'
  })
  @ApiParam({ name: 'id', description: 'معرف التذكرة' })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد تفاصيل التذكرة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ticket123', description: 'معرف التذكرة' },
            title: { type: 'string', example: 'مشكلة في تسجيل الدخول', description: 'عنوان التذكرة' },
            description: { type: 'string', example: 'لا يمكنني تسجيل الدخول إلى حسابي', description: 'وصف المشكلة' },
            status: { type: 'string', example: 'in_progress', description: 'حالة التذكرة' },
            priority: { type: 'string', example: 'high', description: 'أولوية التذكرة' },
            category: { type: 'string', example: 'technical', description: 'فئة التذكرة' },
            customerId: { type: 'string', example: 'user456', description: 'معرف العميل' },
            customerName: { type: 'string', example: 'أحمد محمد', description: 'اسم العميل' },
            assignedTo: { type: 'string', example: 'admin789', description: 'معرف الموظف المسؤول' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'msg123', description: 'معرف الرسالة' },
                  content: { type: 'string', example: 'نحن نعمل على حل المشكلة', description: 'محتوى الرسالة' },
                  senderId: { type: 'string', example: 'admin789', description: 'معرف المرسل' },
                  senderType: { type: 'string', example: 'admin', description: 'نوع المرسل' },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على التذكرة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذه التذكرة'
  })
  async getTicket(@Param('id') ticketId: string) {
    const ticket = await this.supportService.getTicket(ticketId, '', true);
    return ticket;
  }

  @Patch('tickets/:id')
  @ApiOperation({
    summary: 'تحديث تذكرة الدعم',
    description: 'تحديث حالة أو تفاصيل تذكرة دعم من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف التذكرة' })
  @ApiBody({ type: UpdateSupportTicketDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث التذكرة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ticket123', description: 'معرف التذكرة' },
            status: { type: 'string', example: 'resolved', description: 'الحالة الجديدة' },
            priority: { type: 'string', example: 'medium', description: 'الأولوية الجديدة' },
            assignedTo: { type: 'string', example: 'admin789', description: 'معرف الموظف المسؤول' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T12:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على التذكرة'
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  async updateTicket(
    @Param('id') ticketId: string,
    @Body() dto: UpdateSupportTicketDto,
    @Req() req: RequestWithUser,
  ) {
    const adminId = req.user!.sub;
    const ticket = await this.supportService.updateTicket(ticketId, dto, adminId);
    return ticket;
  }

  @Get('tickets/:id/messages')
  @ApiOperation({
    summary: 'رسائل تذكرة الدعم',
    description: 'استرداد جميع رسائل تذكرة دعم محددة'
  })
  @ApiParam({ name: 'id', description: 'معرف التذكرة' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'رقم الصفحة', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'عدد الرسائل في الصفحة', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الرسائل بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'msg123', description: 'معرف الرسالة' },
              content: { type: 'string', example: 'نحن نعمل على حل المشكلة', description: 'محتوى الرسالة' },
              senderId: { type: 'string', example: 'admin789', description: 'معرف المرسل' },
              senderType: { type: 'string', example: 'admin', description: 'نوع المرسل' },
              attachments: {
                type: 'array',
                items: { type: 'string', example: 'https://example.com/file.pdf' }
              },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على التذكرة'
  })
  async getTicketMessages(
    @Param('id') ticketId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const result = await this.supportService.getTicketMessages(ticketId, '', true, page, limit);
    return result;
  }

  @Post('tickets/:id/messages')
  @ApiOperation({
    summary: 'إضافة رسالة لتذكرة الدعم',
    description: 'إضافة رسالة جديدة لتذكرة دعم من قبل الإدارة'
  })
  @ApiParam({ name: 'id', description: 'معرف التذكرة' })
  @ApiBody({ type: AddSupportMessageDto })
  @ApiResponse({
    status: 201,
    description: 'تم إضافة الرسالة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'msg123', description: 'معرف الرسالة الجديدة' },
            content: { type: 'string', example: 'تم حل المشكلة بنجاح', description: 'محتوى الرسالة' },
            senderId: { type: 'string', example: 'admin789', description: 'معرف المرسل' },
            senderType: { type: 'string', example: 'admin', description: 'نوع المرسل' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T12:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على التذكرة'
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  async addMessage(
    @Req() req: RequestWithUser,
    @Param('id') ticketId: string,
    @Body() dto: AddSupportMessageDto,
  ) {
    const adminId = req.user!.sub;
    const message = await this.supportService.addMessage(ticketId, adminId, dto, true);
    return message;
  }

  @Get('stats')
  @ApiOperation({
    summary: 'إحصائيات الدعم',
    description: 'استرداد إحصائيات شاملة حول تذاكر الدعم'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            totalTickets: { type: 'number', example: 1250, description: 'إجمالي التذاكر' },
            openTickets: { type: 'number', example: 45, description: 'التذاكر المفتوحة' },
            resolvedTickets: { type: 'number', example: 1182, description: 'التذاكر المحلولة' },
            pendingTickets: { type: 'number', example: 23, description: 'التذاكر المعلقة' },
            averageResponseTime: { type: 'number', example: 2.5, description: 'متوسط وقت الرد (ساعات)' },
            averageResolutionTime: { type: 'number', example: 24.3, description: 'متوسط وقت الحل (ساعات)' },
            slaCompliance: { type: 'number', example: 92.5, description: 'نسبة الامتثال لـ SLA (%)' },
            ticketsByPriority: {
              type: 'object',
              properties: {
                low: { type: 'number', example: 450 },
                medium: { type: 'number', example: 350 },
                high: { type: 'number', example: 250 },
                urgent: { type: 'number', example: 200 }
              }
            },
            ticketsByCategory: {
              type: 'object',
              properties: {
                technical: { type: 'number', example: 400 },
                billing: { type: 'number', example: 300 },
                general: { type: 'number', example: 550 }
              }
            }
          }
        }
      }
    }
  })
  async getStats() {
    const stats = await this.supportService.getTicketStats();
    return stats;
  }

  @Get('sla/breached')
  @ApiOperation({
    summary: 'التذاكر التي انتهكت SLA',
    description: 'استرداد التذاكر التي تجاوزت وقت الاستجابة أو الحل المحدد في اتفاقية مستوى الخدمة'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد التذاكر المخالفة لـ SLA بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'ticket123', description: 'معرف التذكرة' },
              title: { type: 'string', example: 'مشكلة في تسجيل الدخول', description: 'عنوان التذكرة' },
              priority: { type: 'string', example: 'high', description: 'أولوية التذكرة' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
              slaBreachTime: { type: 'string', format: 'date-time', example: '2024-01-15T12:30:00Z' },
              breachType: { type: 'string', example: 'response_time', description: 'نوع الانتهاك' }
            }
          }
        }
      }
    }
  })
  async getBreachedSLATickets() {
    const tickets = await this.supportService.getBreachedSLATickets();
    return tickets;
  }

  @Post('sla/:id/check')
  @ApiOperation({
    summary: 'فحص حالة SLA للتذكرة',
    description: 'فحص ما إذا كانت التذكرة قد انتهكت اتفاقية مستوى الخدمة'
  })
  @ApiParam({ name: 'id', description: 'معرف التذكرة' })
  @ApiResponse({
    status: 200,
    description: 'تم فحص حالة SLA بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            ticketId: { type: 'string', example: 'ticket123' },
            slaBreached: { type: 'boolean', example: false, description: 'هل تم انتهاك SLA' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على التذكرة'
  })
  async checkSLAStatus(@Param('id') ticketId: string) {
    const isBreached = await this.supportService.checkSLAStatus(ticketId);
    return { ticketId, slaBreached: isBreached };
  }

  // Canned Responses endpoints
  @Post('canned-responses')
  async createCannedResponse(@Body() dto: CreateCannedResponseDto) {
    const response = await this.supportService.createCannedResponse(dto);
    return response;
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
    return result;
  }

  @Get('canned-responses/:id')
  @ApiParam({ name: 'id', description: 'Canned Response ID' })
  async getCannedResponse(@Param('id') id: string) {
    const response = await this.supportService.getCannedResponse(id);
    return response;
  }

  @Patch('canned-responses/:id')
  @ApiParam({ name: 'id', description: 'Canned Response ID' })
  async updateCannedResponse(
    @Param('id') id: string,
    @Body() dto: UpdateCannedResponseDto,
  ) {
    const response = await this.supportService.updateCannedResponse(id, dto);
    return response;
  }

  @Post('canned-responses/:id/use')
  @ApiParam({ name: 'id', description: 'Canned Response ID' })
  async useCannedResponse(@Param('id') id: string) {
    const response = await this.supportService.useCannedResponse(id);
    return response;
  }

  @Get('canned-responses/shortcut/:shortcut')
  @ApiParam({ name: 'shortcut', description: 'Canned Response Shortcut' })
  async getCannedResponseByShortcut(@Param('shortcut') shortcut: string) {
    const response = await this.supportService.getCannedResponseByShortcut(shortcut);
    return response;
  }
}
