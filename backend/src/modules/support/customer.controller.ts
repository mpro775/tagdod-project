import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
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
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-ticket.dto';
import { AddSupportMessageDto } from './dto/add-message.dto';
import { RateTicketDto } from './dto/rate-ticket.dto';

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

@ApiTags('دعم-العملاء')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
export class CustomerSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @ApiOperation({
    summary: 'إنشاء تذكرة دعم جديدة',
    description: 'إنشاء تذكرة دعم جديدة من قبل العميل'
  })
  @ApiBody({ type: CreateSupportTicketDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء التذكرة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ticket123', description: 'معرف التذكرة الجديدة' },
            title: { type: 'string', example: 'مشكلة في تسجيل الدخول', description: 'عنوان التذكرة' },
            description: { type: 'string', example: 'لا يمكنني تسجيل الدخول إلى حسابي', description: 'وصف المشكلة' },
            status: { type: 'string', example: 'open', description: 'حالة التذكرة' },
            priority: { type: 'string', example: 'medium', description: 'أولوية التذكرة' },
            category: { type: 'string', example: 'technical', description: 'فئة التذكرة' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async createTicket(
    @Req() req: RequestWithUser,
    @Body() dto: CreateSupportTicketDto,
  ) {
    const userId = req.user!.sub;
    const ticket = await this.supportService.createTicket(userId, dto);
    return ticket;
  }

  @Get('my')
  @ApiOperation({
    summary: 'تذاكري',
    description: 'استرداد قائمة بجميع تذاكر الدعم الخاصة بالعميل'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد التذاكر بنجاح',
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
              status: { type: 'string', example: 'in_progress', description: 'حالة التذكرة' },
              priority: { type: 'string', example: 'medium', description: 'أولوية التذكرة' },
              category: { type: 'string', example: 'technical', description: 'فئة التذكرة' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyTickets(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user!.sub;
    const result = await this.supportService.getUserTickets(userId, page, limit);
    return result;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'تفاصيل التذكرة',
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
            priority: { type: 'string', example: 'medium', description: 'أولوية التذكرة' },
            category: { type: 'string', example: 'technical', description: 'فئة التذكرة' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'msg123', description: 'معرف الرسالة' },
                  content: { type: 'string', example: 'نحن نعمل على حل المشكلة', description: 'محتوى الرسالة' },
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
  async getTicket(
    @Req() req: RequestWithUser,
    @Param('id') ticketId: string,
  ) {
    const userId = req.user!.sub;
    const ticket = await this.supportService.getTicket(ticketId, userId);
    return ticket;
  }

  @Get(':id/messages')
  @ApiOperation({
    summary: 'رسائل التذكرة',
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
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذه التذكرة'
  })
  async getTicketMessages(
    @Req() req: RequestWithUser,
    @Param('id') ticketId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const userId = req.user!.sub;
    const result = await this.supportService.getTicketMessages(ticketId, userId, false, page, limit);
    return result;
  }

  @Post(':id/messages')
  @ApiOperation({
    summary: 'إضافة رسالة للتذكرة',
    description: 'إضافة رسالة جديدة لتذكرة دعم من قبل العميل'
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
            content: { type: 'string', example: 'أرجو التحقق من البريد الإلكتروني أيضاً', description: 'محتوى الرسالة' },
            senderType: { type: 'string', example: 'customer', description: 'نوع المرسل' },
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
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذه التذكرة'
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
    const userId = req.user!.sub;
    const message = await this.supportService.addMessage(ticketId, userId, dto, false);
    return message;
  }

  @Put(':id/archive')
  @ApiOperation({
    summary: 'أرشفة التذكرة',
    description: 'أرشفة تذكرة دعم من قبل العميل'
  })
  @ApiParam({ name: 'id', description: 'معرف التذكرة' })
  @ApiResponse({
    status: 200,
    description: 'تم أرشفة التذكرة بنجاح',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Ticket archived successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على التذكرة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بأرشفة هذه التذكرة'
  })
  async archiveTicket(
    @Req() req: RequestWithUser,
    @Param('id') ticketId: string,
  ) {
    const userId = req.user!.sub;
    await this.supportService.archiveTicket(ticketId, userId, false);
    return { message: 'Ticket archived successfully' };
  }

  @Post(':id/rate')
  @ApiOperation({
    summary: 'تقييم التذكرة',
    description: 'تقييم خدمة الدعم المقدمة للتذكرة'
  })
  @ApiParam({ name: 'id', description: 'معرف التذكرة' })
  @ApiBody({ type: RateTicketDto })
  @ApiResponse({
    status: 200,
    description: 'تم إرسال التقييم بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ticket123', description: 'معرف التذكرة' },
            rating: { type: 'number', example: 5, description: 'التقييم من 1-5' },
            ratingComment: { type: 'string', example: 'خدمة ممتازة وسريعة', description: 'تعليق التقييم' },
            ratedAt: { type: 'string', format: 'date-time', example: '2024-01-15T16:00:00Z' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'التذكرة غير مكتملة أو تم تقييمها مسبقاً'
  })
  @ApiResponse({
    status: 404,
    description: 'لم يتم العثور على التذكرة'
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بتقييم هذه التذكرة'
  })
  async rateTicket(
    @Req() req: RequestWithUser,
    @Param('id') ticketId: string,
    @Body() dto: RateTicketDto,
  ) {
    const userId = req.user!.sub;
    const ticket = await this.supportService.rateTicket(ticketId, userId, dto);
    return ticket;
  }
}
