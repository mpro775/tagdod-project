import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Request
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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  ListNotificationsDto,
  MarkAsReadDto,
  BulkSendNotificationDto,
  NotificationResponseDto,
  NotificationListResponseDto,
  NotificationStatsResponseDto
} from '../dto/unified-notification.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';
import { AdminGuard } from '../../../shared/guards/admin.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnifiedNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ===== User Endpoints =====

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0
  ): Promise<NotificationListResponseDto> {
    try {
      const userId = req.user.id;
      const result = await this.notificationService.getUserNotifications(userId, limit, offset);
      
      return {
        success: true,
        data: {
          notifications: result.notifications,
          total: result.total
        },
        meta: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: offset + limit < result.total,
          hasPrevPage: offset > 0
        }
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req: AuthenticatedRequest): Promise<NotificationResponseDto> {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      
      return {
        success: true,
        data: { unreadCount: count }
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve unread count',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read successfully' })
  async markAsRead(
    @Request() req: AuthenticatedRequest,
    @Body() dto: MarkAsReadDto
  ): Promise<NotificationResponseDto> {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.markMultipleAsRead(dto, userId);
      
      return {
        success: true,
        data: { markedCount: count },
        message: `${count} notifications marked as read`
      };
    } catch (error) {
      throw new HttpException(
        'Failed to mark notifications as read',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read successfully' })
  async markAllAsRead(@Request() req: AuthenticatedRequest): Promise<NotificationResponseDto> {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.markAllAsRead(userId);
      
      return {
        success: true,
        data: { markedCount: count },
        message: `${count} notifications marked as read`
      };
    } catch (error) {
      throw new HttpException(
        'Failed to mark all notifications as read',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getUserStats(@Request() req: AuthenticatedRequest): Promise<NotificationStatsResponseDto> {
    try {
      const userId = req.user.id;
      const stats = await this.notificationService.getNotificationStats(userId);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ===== Admin Endpoints =====

  @Get('admin/list')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: List all notifications' })
  @ApiResponse({ status: 200, description: 'Notifications listed successfully' })
  async adminListNotifications(@Query() query: ListNotificationsDto): Promise<NotificationListResponseDto> {
    try {
      const result = await this.notificationService.listNotifications(query);
      
      return {
        success: true,
        data: {
          notifications: result.notifications,
          total: result.meta.total
        },
        meta: result.meta
      };
    } catch (error) {
      throw new HttpException(
        'Failed to list notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/create')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Create notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async adminCreateNotification(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateNotificationDto
  ): Promise<NotificationResponseDto> {
    try {
      const userId = req.user.id;
      const notification = await this.notificationService.createNotification({
        ...dto,
        createdBy: userId
      });
      
      return {
        success: true,
        data: notification,
        message: 'Notification created successfully'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async adminGetNotification(@Param('id') id: string): Promise<NotificationResponseDto> {
    try {
      const notification = await this.notificationService.getNotificationById(id);
      
      return {
        success: true,
        data: notification
      };
    } catch (error) {
      if ((error as Error).message === 'NOTIFICATION_NOT_FOUND') {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to retrieve notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('admin/:id')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Update notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async adminUpdateNotification(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto
  ): Promise<NotificationResponseDto> {
    try {
      const notification = await this.notificationService.updateNotification(id, dto);
      
      return {
        success: true,
        data: notification,
        message: 'Notification updated successfully'
      };
    } catch (error) {
      if ((error as Error).message === 'NOTIFICATION_NOT_FOUND') {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('admin/:id')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async adminDeleteNotification(@Param('id') id: string): Promise<NotificationResponseDto> {
    try {
      const deleted = await this.notificationService.deleteNotification(id);
      
      if (!deleted) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        success: true,
        data: { deleted: true },
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/bulk-send')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Send bulk notifications' })
  @ApiResponse({ status: 200, description: 'Bulk notifications sent successfully' })
  async adminBulkSend(@Body() dto: BulkSendNotificationDto): Promise<NotificationResponseDto> {
    try {
      const result = await this.notificationService.bulkSendNotifications(dto);
      
      return {
        success: true,
        data: result,
        message: `Bulk send completed: ${result.sent} sent, ${result.failed} failed`
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send bulk notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/stats')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async adminGetStats(@Query('userId') userId?: string): Promise<NotificationStatsResponseDto> {
    try {
      const stats = await this.notificationService.getNotificationStats(userId);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error in adminGetStats:', error);
      // Return default stats instead of throwing error
      return {
        success: true,
        data: {
          total: 0,
          byType: {},
          byStatus: {},
          byChannel: {},
          byCategory: {},
          unreadCount: 0,
          readRate: 0,
          deliveryRate: 0,
        }
      };
    }
  }

  @Post('admin/cleanup')
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin: Cleanup old notifications' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async adminCleanup(
    @Query('olderThanDays') olderThanDays: number = 30
  ): Promise<NotificationResponseDto> {
    try {
      const deletedCount = await this.notificationService.deleteOldNotifications(olderThanDays);
      
      return {
        success: true,
        data: { deletedCount },
        message: `${deletedCount} old notifications deleted`
      };
    } catch (error) {
      throw new HttpException(
        'Failed to cleanup notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
