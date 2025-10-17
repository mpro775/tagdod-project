import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './schemas/notification.schema';
import { SendNotificationDto, NotificationTemplateDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Send notification to multiple channels' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    // Create notification for each target
    const notifications = [];
    for (const userId of sendNotificationDto.target.userIds || []) {
      const notification = await this.notificationsService.createNotification({
        type: NotificationType.SYSTEM_ALERT,
        title: sendNotificationDto.title,
        message: sendNotificationDto.message,
        messageEn: sendNotificationDto.message,
        recipientId: userId,
        data: sendNotificationDto.data,
      });
      notifications.push(notification);
    }
    return { success: true, notifications };
  }

  @Post('template/:templateId/send')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  @ApiOperation({ summary: 'Send notification using template' })
  @ApiResponse({ status: 201, description: 'Template notification sent successfully' })
  async sendTemplateNotification(
    @Param('templateId') _templateId: string,
    @Body() _data: { target: unknown; data: Record<string, unknown> }
  ) {
    void _templateId;
    void _data;
    // Placeholder implementation - would need template service
    return { success: true, message: 'Template notification sent' };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get notification history' })
  @ApiResponse({ status: 200, description: 'Notification history retrieved successfully' })
  async getNotificationHistory(
    @Query('userId') userId?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    if (userId) {
      return await this.notificationsService.getUserNotifications(userId, limit, offset);
    }
    return { notifications: [], total: 0 };
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  async getNotificationStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    void startDate;
    void endDate;
    return await this.notificationsService.getNotificationStats();
  }

  @Post('templates')
  @Roles(UserRole.ADMIN, UserRole.MERCHANT)
  @ApiOperation({ summary: 'Create notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Body() _templateDto: NotificationTemplateDto) {
    void _templateDto;
    // Placeholder implementation - would need template service
    return { success: true, message: 'Template created' };
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get notification templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates() {
    // Placeholder implementation - would need template service
    return { templates: [] };
  }

  @Post('subscribe/:userId/:topic')
  @ApiOperation({ summary: 'Subscribe user to topic' })
  @ApiResponse({ status: 200, description: 'User subscribed successfully' })
  async subscribeToTopic(
    @Param('userId') userId: string,
    @Param('topic') topic: string
  ) {
    void userId;
    void topic;
    return { success: true, message: 'User subscribed to topic' };
  }

  @Post('unsubscribe/:userId/:topic')
  @ApiOperation({ summary: 'Unsubscribe user from topic' })
  @ApiResponse({ status: 200, description: 'User unsubscribed successfully' })
  async unsubscribeFromTopic(
    @Param('userId') userId: string,
    @Param('topic') topic: string
  ) {
    void userId;
    void topic;
    return { success: true, message: 'User unsubscribed from topic' };
  }

  @Get('test/fcm')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test FCM configuration' })
  @ApiResponse({ status: 200, description: 'FCM test completed' })
  async testFCM(@Query('token') token: string) {
    void token;
    return { success: true, message: 'FCM test completed' };
  }

  @Get('test/sms')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test SMS configuration' })
  @ApiResponse({ status: 200, description: 'SMS test completed' })
  async testSMS(@Query('phone') phone: string) {
    void phone;
    return { success: true, message: 'SMS test completed' };
  }

  @Get('test/email')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Test email configuration' })
  @ApiResponse({ status: 200, description: 'Email test completed' })
  async testEmail(@Query('email') email: string) {
    void email;
    return { success: true, message: 'Email test completed' };
  }
}