import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { NotificationsService } from './notifications.service';
import { 
  AdminTestDto, 
  AdminListNotificationsDto, 
  AdminCreateNotificationDto,
  AdminUpdateNotificationDto,
  AdminSendNotificationDto
} from './dto/notifications.dto';

@ApiTags('notifications-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications with filters' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async list(@Query() query: AdminListNotificationsDto) {
    try {
      const data = await this.svc.adminList(query);
      return { 
        success: true,
        data: data.items, 
        meta: data.meta 
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available notification templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates() {
    try {
      const templates = await this.svc.getAvailableTemplates();
      return { 
        success: true,
        data: templates 
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve templates',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(@Body() dto: AdminCreateNotificationDto) {
    try {
      const notification = await this.svc.adminCreate(dto);
      return { 
        success: true,
        data: notification 
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getById(@Param('id') id: string) {
    try {
      const notification = await this.svc.adminGetById(id);
      return { 
        success: true,
        data: notification 
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Notification not found') {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to retrieve notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async update(@Param('id') id: string, @Body() dto: AdminUpdateNotificationDto) {
    try {
      const notification = await this.svc.adminUpdate(id, dto);
      return { 
        success: true,
        data: notification 
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Notification not found') {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async send(@Param('id') id: string, @Body() dto: AdminSendNotificationDto) {
    try {
      const result = await this.svc.adminSend(id, dto);
      return { 
        success: true,
        data: result 
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Notification not found') {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to send notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async delete(@Param('id') id: string) {
    try {
      const deleted = await this.svc.adminDelete(id);
      if (!deleted) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      return { 
        success: true,
        data: { deleted: true } 
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

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    try {
      const stats = await this.svc.getAdminStats();
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

  @Post('bulk/send')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 200, description: 'Bulk notifications sent successfully' })
  async bulkSend(@Body() dto: AdminCreateNotificationDto & { targetUsers: string[] }) {
    try {
      if (!dto.targetUsers || dto.targetUsers.length === 0) {
        throw new HttpException('targetUsers is required for bulk send', HttpStatus.BAD_REQUEST);
      }
      
      const results = await this.svc.adminBulkSend(dto);
      return { 
        success: true,
        data: results 
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to send bulk notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('test')
  @ApiOperation({ summary: 'Test notification (send to specific user)' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async test(@Body() dto: AdminTestDto) {
    try {
      await this.svc.emit(dto.userId, dto.templateKey, dto.payload || {});
      return { 
        success: true,
        message: 'Test notification sent successfully' 
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send test notification',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
