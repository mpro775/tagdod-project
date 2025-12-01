import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

interface RequestUser {
  id: string;
  sub: string;
  userId: string;
  phone: string;
  isAdmin: boolean;
  role?: string;
  isEngineer?: boolean;
  roles?: string[];
  permissions?: string[];
  preferredCurrency?: string;
}

interface AuthenticatedRequest extends ExpressRequest {
  user: RequestUser;
}
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationTemplate } from '../schemas/notification-template.schema';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  ListNotificationsDto,
  MarkAsReadDto,
  BulkSendNotificationDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  RegisterDeviceDto,
} from '../dto/unified-notification.dto';
import { NotificationChannel, NotificationStatus } from '../enums/notification.enums';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminGuard } from '../../../shared/guards/admin.guard';
import { Types } from 'mongoose';

@ApiTags('الإشعارات')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnifiedNotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly templateService: NotificationTemplateService,
  ) { }

  // ===== User Endpoints =====

  @Get()
  @ApiOperation({
    summary: 'الحصول على إشعارات المستخدم',
    description: 'استرداد قائمة إشعارات المستخدم مع إمكانية التصفح والترقيم',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد الإشعارات في الصفحة',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'عدد الإشعارات التي تم تخطيها',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإشعارات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            notifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'notif123', description: 'معرف الإشعار' },
                  title: { type: 'string', example: 'طلب جديد', description: 'عنوان الإشعار' },
                  message: {
                    type: 'string',
                    example: 'لديك طلب جديد',
                    description: 'محتوى الإشعار',
                  },
                  type: { type: 'string', example: 'order', description: 'نوع الإشعار' },
                  isRead: { type: 'boolean', example: false, description: 'حالة القراءة' },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-15T10:30:00Z',
                  },
                },
              },
            },
            total: { type: 'number', example: 150, description: 'إجمالي عدد الإشعارات' },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1, description: 'رقم الصفحة الحالية' },
            limit: { type: 'number', example: 20, description: 'عدد العناصر في الصفحة' },
            total: { type: 'number', example: 150, description: 'إجمالي العناصر' },
            totalPages: { type: 'number', example: 8, description: 'إجمالي الصفحات' },
            hasNextPage: { type: 'boolean', example: true, description: 'هل يوجد صفحة تالية' },
            hasPrevPage: { type: 'boolean', example: false, description: 'هل يوجد صفحة سابقة' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async getUserNotifications(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    const userId = req.user.id;
    const result = await this.notificationService.getUserNotifications(userId, limit, offset);

    return {
      notifications: result.notifications,
      total: result.total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(result.total / limit),
      hasNextPage: offset + limit < result.total,
      hasPrevPage: offset > 0,
    };
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'الحصول على عدد الإشعارات غير المقروءة',
    description: 'استرداد عدد الإشعارات التي لم يقرأها المستخدم بعد',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عدد الإشعارات غير المقروءة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 5, description: 'عدد الإشعارات غير المقروءة' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async getUnreadCount(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const count = await this.notificationService.getUnreadCount(userId);

    return {
      success: true,
      data: { count },
    };
  }

  @Post('mark-read')
  @ApiOperation({
    summary: 'تحديد الإشعارات كمقروءة',
    description: 'تحديد إشعارات محددة كمقروءة',
  })
  @ApiBody({ type: MarkAsReadDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديد الإشعارات كمقروءة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            markedCount: {
              type: 'number',
              example: 3,
              description: 'عدد الإشعارات المحددة كمقروءة',
            },
          },
        },
        message: {
          type: 'string',
          example: '3 notifications marked as read',
          description: 'رسالة النتيجة',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async markAsRead(@Request() req: AuthenticatedRequest, @Body() dto: MarkAsReadDto) {
    const userId = req.user.id;
    const count = await this.notificationService.markMultipleAsRead(dto, userId);

    return {
      markedCount: count,
      message: `${count} notifications marked as read`,
    };
  }

  @Post('mark-all-read')
  @ApiOperation({
    summary: 'تحديد جميع الإشعارات كمقروءة',
    description: 'تحديد جميع إشعارات المستخدم كمقروءة',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديد جميع الإشعارات كمقروءة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            markedCount: {
              type: 'number',
              example: 15,
              description: 'عدد الإشعارات المحددة كمقروءة',
            },
          },
        },
        message: {
          type: 'string',
          example: '15 notifications marked as read',
          description: 'رسالة النتيجة',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async markAllAsRead(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const count = await this.notificationService.markAllAsRead(userId);

    return {
      markedCount: count,
      message: `${count} notifications marked as read`,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'الحصول على إحصائيات إشعارات المستخدم',
    description: 'استرداد إحصائيات مفصلة حول إشعارات المستخدم',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150, description: 'إجمالي الإشعارات' },
            unread: { type: 'number', example: 5, description: 'الإشعارات غير المقروءة' },
            read: { type: 'number', example: 145, description: 'الإشعارات المقروءة' },
            byType: {
              type: 'object',
              properties: {
                order: { type: 'number', example: 50, description: 'إشعارات الطلبات' },
                system: { type: 'number', example: 30, description: 'إشعارات النظام' },
                promotion: { type: 'number', example: 20, description: 'إشعارات العروض' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async getUserStats(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const stats = await this.notificationService.getNotificationStats(userId);

    return stats;
  }

  @Post('devices/register')
  @ApiOperation({
    summary: 'تسجيل جهاز للإشعارات',
    description: 'تسجيل أو تحديث FCM Token للجهاز لاستقبال Push Notifications',
  })
  @ApiBody({ type: RegisterDeviceDto })
  @ApiResponse({
    status: 200,
    description: 'تم تسجيل الجهاز بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Device registered successfully' },
        data: {
          type: 'object',
          properties: {
            deviceToken: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: 'device123' },
                userId: { type: 'string', example: 'user456' },
                token: { type: 'string', example: 'fcm_token_here...' },
                platform: { type: 'string', example: 'android', enum: ['ios', 'android', 'web'] },
                isActive: { type: 'boolean', example: true },
                lastUsedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة',
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async registerDevice(@Request() req: AuthenticatedRequest, @Body() dto: RegisterDeviceDto) {
    const userId = req.user.id;
    const result = await this.notificationService.registerDevice(
      userId,
      dto.token,
      dto.platform,
      dto.userAgent,
      dto.appVersion,
    );

    return {
      success: result.success,
      message: result.message,
      data: result.deviceToken
        ? {
          deviceToken: {
            _id: result.deviceToken._id,
            userId: result.deviceToken.userId,
            token: result.deviceToken.token.substring(0, 20) + '...', // إخفاء جزء من Token للأمان
            platform: result.deviceToken.platform,
            isActive: result.deviceToken.isActive,
            lastUsedAt: result.deviceToken.lastUsedAt,
          },
        }
        : undefined,
    };
  }

  @Post('devices/unregister')
  @ApiOperation({
    summary: 'إلغاء تسجيل جهاز',
    description: 'تعطيل FCM Token للجهاز (لن يستقبل Push Notifications بعد الآن)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'FCM Token للجهاز' },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم إلغاء تسجيل الجهاز بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Device unregistered successfully' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async unregisterDevice(@Request() req: AuthenticatedRequest, @Body() body: { token: string }) {
    const userId = req.user.id;
    const success = await this.notificationService.unregisterDevice(userId, body.token);

    return {
      success,
      message: success ? 'Device unregistered successfully' : 'Device token not found',
    };
  }

  @Get('devices')
  @ApiOperation({
    summary: 'الحصول على أجهزة المستخدم المسجلة',
    description: 'استرداد قائمة بجميع الأجهزة المسجلة للمستخدم',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الأجهزة بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            devices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  platform: { type: 'string', enum: ['ios', 'android', 'web'] },
                  userAgent: { type: 'string' },
                  appVersion: { type: 'string' },
                  isActive: { type: 'boolean' },
                  lastUsedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول',
  })
  async getUserDevices(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const devices = await this.notificationService.getUserDeviceTokens(userId);

    return {
      success: true,
      data: {
        devices: devices.map((device) => ({
          _id: device._id,
          platform: device.platform,
          userAgent: device.userAgent,
          appVersion: device.appVersion,
          isActive: device.isActive,
          lastUsedAt: device.lastUsedAt,
          createdAt: device.createdAt,
        })),
      },
    };
  }

  // ===== Admin Endpoints =====

  @Get('admin/list')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: قائمة جميع الإشعارات',
    description: 'استرداد قائمة بجميع الإشعارات في النظام (للإداريين فقط)',
  })
  @ApiQuery({ type: ListNotificationsDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة الإشعارات بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            notifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'notif123' },
                  userId: { type: 'string', example: 'user456' },
                  title: { type: 'string', example: 'طلب جديد' },
                  message: { type: 'string', example: 'لديك طلب جديد' },
                  type: { type: 'string', example: 'order' },
                  isRead: { type: 'boolean', example: false },
                },
              },
            },
            total: { type: 'number', example: 500 },
          },
        },
        meta: { type: 'object', description: 'بيانات الترقيم' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذه البيانات',
  })
  async adminListNotifications(@Query() query: ListNotificationsDto) {
    const result = await this.notificationService.listNotifications(query);

    return {
      notifications: result.notifications,
      total: result.meta.total,
      meta: result.meta,
    };
  }

  @Post('admin/create')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: إنشاء إشعار',
    description: 'إنشاء إشعار جديد للمستخدمين (للإداريين فقط)',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الإشعار بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'notif123', description: 'معرف الإشعار الجديد' },
            title: { type: 'string', example: 'إعلان مهم', description: 'عنوان الإشعار' },
            message: {
              type: 'string',
              example: 'رسالة مهمة لجميع المستخدمين',
              description: 'محتوى الإشعار',
            },
            type: { type: 'string', example: 'announcement', description: 'نوع الإشعار' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة',
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بإنشاء إشعارات',
  })
  async adminCreateNotification(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateNotificationDto,
  ) {
    const userId = req.user.id;
    const notification = await this.notificationService.createNotification({
      ...dto,
      createdBy: userId,
    });

    return {
      notification,
      message: 'Notification created successfully',
    };
  }

  @Get('admin/stats')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: الحصول على إحصائيات الإشعارات',
    description: 'استرداد إحصائيات شاملة حول جميع الإشعارات في النظام (للإداريين فقط)',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async adminGetStats(@Query('userId') userId?: string) {
    try {
      const stats = await this.notificationService.getNotificationStats(userId);
      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        data: {
          total: 0,
          byType: {},
          byStatus: {},
          byChannel: {},
          byCategory: {},
          unreadCount: 0,
          readRate: 0,
          deliveryRate: 0,
        },
      };
    }
  }

  @Get('admin/templates')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: الحصول على قوالب الإشعارات',
    description: 'استرداد قائمة بقوالب الإشعارات المتاحة في النظام (للإداريين فقط)',
  })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async adminGetTemplates() {
    // قائمة القوالب الافتراضية
    const templates = [
      {
        id: 'order_created',
        name: 'طلب جديد',
        description: 'إشعار بإنشاء طلب جديد',
        category: 'order',
        variables: ['orderId', 'orderNumber', 'totalAmount'],
      },
      {
        id: 'order_updated',
        name: 'تحديث الطلب',
        description: 'إشعار بتحديث حالة الطلب',
        category: 'order',
        variables: ['orderId', 'orderNumber', 'status'],
      },
      {
        id: 'payment_success',
        name: 'دفع ناجح',
        description: 'إشعار بنجاح عملية الدفع',
        category: 'payment',
        variables: ['paymentId', 'amount', 'method'],
      },
      {
        id: 'shipment_update',
        name: 'تحديث الشحن',
        description: 'إشعار بتحديث حالة الشحن',
        category: 'shipping',
        variables: ['trackingNumber', 'status', 'location'],
      },
      {
        id: 'support_ticket',
        name: 'تذكرة دعم',
        description: 'إشعار بتذكرة دعم جديدة',
        category: 'support',
        variables: ['ticketId', 'subject', 'priority'],
      },
    ];

    return { success: true, data: templates };
  }

  @Post('admin/cleanup')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: تنظيف الإشعارات القديمة',
    description: 'حذف الإشعارات القديمة والغير مهمة من النظام (للإداريين فقط)',
  })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async adminCleanup(@Query('olderThanDays') olderThanDays: number = 30) {
    const deletedCount = await this.notificationService.deleteOldNotifications(olderThanDays);

    return {
      deletedCount,
      message: `${deletedCount} old notifications deleted`,
    };
  }

  @Get('admin/notification/:id')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: تفاصيل إشعار',
    description: 'استرداد تفاصيل إشعار محدد (للإداريين فقط)',
  })
  @ApiParam({ name: 'id', description: 'معرف الإشعار' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 400, description: 'Invalid notification ID format' })
  async adminGetNotification(@Param('id') id: string) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notification ID format');
    }
    const notification = await this.notificationService.getNotificationById(id);
    return { success: true, data: notification };
  }

  @Put('admin/notification/:id')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: تحديث إشعار',
    description: 'تحديث تفاصيل إشعار محدد (للإداريين فقط)',
  })
  @ApiParam({ name: 'id', description: 'معرف الإشعار' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 400, description: 'Invalid notification ID format' })
  async adminUpdateNotification(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notification ID format');
    }
    const notification = await this.notificationService.updateNotification(id, dto);
    return { success: true, data: notification };
  }

  @Delete('admin/notification/:id')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: حذف إشعار',
    description: 'حذف إشعار محدد (للإداريين فقط)',
  })
  @ApiParam({ name: 'id', description: 'معرف الإشعار' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 400, description: 'Invalid notification ID format' })
  async adminDeleteNotification(@Param('id') id: string) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notification ID format');
    }
    const deleted = await this.notificationService.deleteNotification(id);
    return {
      success: deleted,
      message: deleted ? 'Notification deleted successfully' : 'Notification not found',
    };
  }

  @Post('admin/notification/:id/send')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: إرسال إشعار محدد',
    description: 'إرسال إشعار محدد للمستخدمين (للإداريين فقط)',
  })
  @ApiParam({ name: 'id', description: 'معرف الإشعار' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async adminSendNotification(@Param('id') id: string) {
    const notification = await this.notificationService.getNotificationById(id);

    // إذا كان الإشعار موجه للأدوار بدون recipientId، إنشاء نسخ للمستخدمين
    if (
      (!notification.recipientId || !notification.recipientId.toString()) &&
      notification.targetRoles &&
      notification.targetRoles.length > 0
    ) {
      const copiesCount = await this.notificationService.createNotificationCopiesForTargetRoles(
        notification as any,
      );
      
      // تحديث حالة الإشعار الأصلي
      await this.notificationService.updateNotificationStatus(
        id,
        notification.status === NotificationStatus.PENDING
          ? NotificationStatus.SENT
          : notification.status,
      );

      return {
        success: true,
        message: `Notification sent successfully to ${copiesCount} user(s)`,
        copiesCreated: copiesCount,
      };
    }

    // إعادة إرسال الإشعار للمستخدم المحدد
    if (notification.recipientId) {
      if (notification.channel === NotificationChannel.PUSH) {
        await this.notificationService.sendPushNotification(
          notification as any,
          notification.recipientId.toString(),
        );
      } else if (notification.channel === NotificationChannel.IN_APP) {
        // إرسال عبر WebSocket
        // سيتم إرساله تلقائياً عند التحديث
      }
    }

    // تحديث حالة الإشعار
    await this.notificationService.updateNotificationStatus(
      id,
      notification.status === NotificationStatus.PENDING
        ? NotificationStatus.SENT
        : notification.status,
    );

    return { success: true, message: 'Notification sent successfully' };
  }

  @Get('admin/users-list')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: قائمة المستخدمين للاختيار',
    description: 'الحصول على قائمة المستخدمين مع الاسم والرقم للاستخدام في dropdown/select',
  })
  @ApiQuery({ name: 'search', required: false, description: 'البحث في الاسم أو الرقم' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد النتائج (افتراضي: 100)' })
  @ApiResponse({ status: 200, description: 'قائمة المستخدمين' })
  async getUsersList(@Query('search') search?: string, @Query('limit') limit?: number) {
    const users = await this.notificationService.getUsersForSelection(
      search,
      limit ? parseInt(limit.toString(), 10) : 100,
    );
    return { success: true, data: users };
  }

  @Get('admin/users/:userId/devices')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: التحقق من أجهزة المستخدم',
    description:
      'التحقق من وجود Device Tokens نشطة للمستخدم قبل إرسال Push Notifications (للإداريين فقط)',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم' })
  @ApiResponse({
    status: 200,
    description: 'تم التحقق من أجهزة المستخدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            hasDevices: {
              type: 'boolean',
              example: true,
              description: 'هل المستخدم لديه أجهزة مسجلة',
            },
            deviceCount: { type: 'number', example: 2, description: 'عدد الأجهزة النشطة' },
            devices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  platform: { type: 'string', enum: ['ios', 'android', 'web'] },
                  userAgent: { type: 'string' },
                  appVersion: { type: 'string' },
                  isActive: { type: 'boolean' },
                  lastUsedAt: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            platforms: {
              type: 'object',
              properties: {
                ios: { type: 'number', example: 1 },
                android: { type: 'number', example: 1 },
                web: { type: 'number', example: 0 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'المستخدم غير موجود',
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول',
  })
  async checkUserDevices(@Param('userId') userId: string) {
    const devicesInfo = await this.notificationService.getUserDevicesInfo(userId);

    return {
      success: true,
      data: {
        userId,
        ...devicesInfo,
      },
    };
  }

  @Get('admin/fcm-status')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: التحقق من حالة FCM',
    description: 'التحقق من أن Firebase Cloud Messaging مُعد بشكل صحيح (للإداريين فقط)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم التحقق من حالة FCM',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            isConfigured: {
              type: 'boolean',
              example: true,
              description: 'هل FCM مُعد بشكل صحيح'
            },
            status: {
              type: 'string',
              example: 'configured',
              enum: ['configured', 'not_configured'],
              description: 'حالة FCM'
            },
            message: {
              type: 'string',
              example: 'FCM is configured and ready to send push notifications',
              description: 'رسالة توضيحية'
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول',
  })
  async getFCMStatus() {
    // التحقق من أن FCM Adapter مُعد بشكل صحيح
    // يمكن الوصول إلى FCM Adapter عبر PushNotificationAdapter إذا لزم الأمر
    const isConfigured = process.env.FCM_PROJECT_ID &&
      process.env.FCM_PRIVATE_KEY &&
      process.env.FCM_CLIENT_EMAIL;

    return {
      success: true,
      data: {
        isConfigured: !!isConfigured,
        status: isConfigured ? 'configured' : 'not_configured',
        message: isConfigured
          ? 'FCM is configured and ready to send push notifications'
          : 'FCM is not configured. Please set FCM_PROJECT_ID, FCM_PRIVATE_KEY, and FCM_CLIENT_EMAIL environment variables.',
      },
    };
  }

  @Post('admin/users/devices/check')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: التحقق من أجهزة عدة مستخدمين',
    description: 'التحقق من وجود Device Tokens نشطة لعدة مستخدمين دفعة واحدة (للإداريين فقط)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'قائمة معرفات المستخدمين',
        },
      },
      required: ['userIds'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم التحقق من أجهزة المستخدمين بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 5 },
            withDevices: {
              type: 'number',
              example: 3,
              description: 'عدد المستخدمين الذين لديهم أجهزة',
            },
            withoutDevices: {
              type: 'number',
              example: 2,
              description: 'عدد المستخدمين الذين لا يملكون أجهزة',
            },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  hasDevices: { type: 'boolean' },
                  deviceCount: { type: 'number' },
                  platforms: {
                    type: 'object',
                    properties: {
                      ios: { type: 'number' },
                      android: { type: 'number' },
                      web: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول',
  })
  async checkMultipleUsersDevices(@Body() body: { userIds: string[] }) {
    const { userIds } = body;

    const results = await Promise.all(
      userIds.map(async (userId) => {
        const devicesInfo = await this.notificationService.getUserDevicesInfo(userId);
        return {
          userId,
          ...devicesInfo,
        };
      }),
    );

    const withDevices = results.filter((r) => r.hasDevices).length;
    const withoutDevices = results.filter((r) => !r.hasDevices).length;

    return {
      success: true,
      data: {
        total: userIds.length,
        withDevices,
        withoutDevices,
        results,
      },
    };
  }

  @Post('admin/bulk-send')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: إرسال إشعارات مجمعة',
    description: 'إرسال إشعارات لعدة مستخدمين دفعة واحدة (للإداريين فقط)',
  })
  @ApiBody({ type: BulkSendNotificationDto })
  @ApiResponse({ status: 200, description: 'Bulk send completed' })
  async adminBulkSend(@Body() dto: BulkSendNotificationDto) {
    const result = await this.notificationService.bulkSendNotifications(dto);
    return { success: true, data: result };
  }

  @Post('admin/test')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: اختبار إشعار',
    description: 'إرسال إشعار تجريبي لمستخدم محدد (للإداريين فقط)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'معرف المستخدم' },
        templateKey: { type: 'string', description: 'مفتاح القالب' },
        payload: { type: 'object', description: 'بيانات القالب' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async adminTestNotification(
    @Body() body: { userId: string; templateKey: string; payload?: Record<string, unknown> },
  ) {
    const { userId, templateKey, payload = {} } = body;

    // استخدام القالب لإرسال إشعار تجريبي
    const rendered = await this.templateService.renderTemplate(templateKey, payload);

    const notification = await this.notificationService.createNotification({
      type: 'SYSTEM_ALERT' as any,
      title: `[TEST] ${rendered.title}`,
      message: `[TEST] ${rendered.message}`,
      messageEn: `[TEST] ${rendered.messageEn}`,
      recipientId: userId,
      channel: 'inApp' as any,
      priority: 'medium' as any,
      isSystemGenerated: true,
    });

    return { success: true, data: notification, message: 'Test notification sent successfully' };
  }

  @Post('admin/templates')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: إنشاء قالب إشعار',
    description: 'إنشاء قالب إشعار جديد (للإداريين فقط)',
  })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async adminCreateTemplate(@Body() dto: CreateTemplateDto) {
    const template = await this.templateService.createTemplate(dto);
    return { success: true, data: template };
  }

  @Put('admin/templates/:key')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: تحديث قالب إشعار',
    description: 'تحديث قالب إشعار موجود (للإداريين فقط)',
  })
  @ApiParam({ name: 'key', description: 'مفتاح القالب' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async adminUpdateTemplate(@Param('key') key: string, @Body() dto: UpdateTemplateDto) {
    const updated = await this.templateService.updateTemplateByKey(key, dto);
    return { success: true, data: updated };
  }

  @Delete('admin/templates/:key')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: حذف قالب إشعار',
    description: 'حذف قالب إشعار (للإداريين فقط)',
  })
  @ApiParam({ name: 'key', description: 'مفتاح القالب' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async adminDeleteTemplate(@Param('key') key: string) {
    const deleted = await this.templateService.deleteTemplateByKey(key);
    return {
      success: deleted,
      message: deleted ? 'Template deleted successfully' : 'Template not found',
    };
  }

  @Get('admin/templates/:key/stats')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: إحصائيات قالب',
    description: 'استرداد إحصائيات استخدام قالب محدد (للإداريين فقط)',
  })
  @ApiParam({ name: 'key', description: 'مفتاح القالب' })
  @ApiResponse({ status: 200, description: 'Template stats retrieved successfully' })
  async adminGetTemplateStats(@Param('key') key: string) {
    const template = await this.templateService.getTemplateByKey(key);

    // إحصائيات استخدام القالب
    // استخدام type assertion للوصول إلى _id و key من lean document
    const templateDoc = template as NotificationTemplate & { _id: string; key?: string };
    const stats = {
      templateId: templateDoc._id || (template as any)._id,
      templateKey: templateDoc.key || key,
      usageCount: template.usageCount || 0,
      lastUsedAt: template.lastUsedAt,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };

    return { success: true, data: stats };
  }

  @Get('admin/stats/overview')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: نظرة عامة على الإحصائيات',
    description: 'استرداد نظرة عامة سريعة على إحصائيات الإشعارات (للإداريين فقط)',
  })
  @ApiResponse({ status: 200, description: 'Overview stats retrieved successfully' })
  async adminGetStatsOverview() {
    const stats = await this.notificationService.getNotificationStats();

    // إضافة معلومات إضافية
    const overview = {
      ...stats,
      recentActivity: {
        last24Hours: 0, // يمكن إضافتها لاحقاً
        last7Days: 0,
        last30Days: 0,
      },
      topTypes: Object.entries(stats.byType || {})
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([type, count]) => ({ type, count })),
    };

    return { success: true, data: overview };
  }

  @Get('admin/logs')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'الإدارة: سجل الإشعارات',
    description: 'استرداد سجل مفصل لجميع الإشعارات مع تفاصيل الإرسال (للإداريين فقط)',
  })
  @ApiQuery({ type: ListNotificationsDto })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  async adminGetLogs(@Query() query: ListNotificationsDto) {
    // نفس endpoint القائمة لكن مع تفاصيل أكثر
    const result = await this.notificationService.listNotifications(query);

    return {
      notifications: result.notifications,
      total: result.meta.total,
      meta: result.meta,
    };
  }
}
