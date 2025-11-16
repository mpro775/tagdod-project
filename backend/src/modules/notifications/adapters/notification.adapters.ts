import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  INotificationPort,
  IInAppNotificationPort,
  IPushNotificationPort,
  IEmailNotificationPort,
  ISmsNotificationPort,
  NotificationData,
  InAppNotificationData,
  PushNotificationData,
  EmailNotificationData,
  SmsNotificationData,
  NotificationResult,
  InAppNotificationResult,
  PushNotificationResult,
  EmailNotificationResult,
  SmsNotificationResult,
  BulkNotificationResult,
  BulkEmailNotificationResult,
  BulkSmsNotificationResult,
  NotificationStatus,
  EmailDeliveryStatus,
  SmsDeliveryStatus
} from '../ports/notification.ports';
import { NotificationChannel } from '../enums/notification.enums';
import { FCMAdapter, FCMNotification } from './fcm.adapter';
import { EmailAdapter, EmailNotification } from './email.adapter';
import { SMSAdapter, SMSNotification } from './sms.adapter';
import { WebSocketService } from '../../../shared/websocket/websocket.service';

// ===== Base Notification Adapter =====
@Injectable()
export class BaseNotificationAdapter implements INotificationPort {
  protected readonly logger = new Logger(this.constructor.name);

  async send(notification: NotificationData): Promise<NotificationResult> {
    this.logger.log(`Sending notification: ${notification.id}`);

    // Default implementation - override in subclasses
    return {
      success: true,
      notificationId: notification.id,
      externalId: `ext_${Date.now()}`,
      metadata: { adapter: this.constructor.name }
    };
  }

  async sendBulk(notifications: NotificationData[]): Promise<BulkNotificationResult> {
    this.logger.log(`Sending ${notifications.length} notifications in bulk`);

    const results: NotificationResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      try {
        const result = await this.send(notification);
        results.push(result);
        if (result.success) sent++;
        else failed++;
      } catch (error) {
        results.push({
          success: false,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    return {
      success: failed === 0,
      total: notifications.length,
      sent,
      failed,
      results
    };
  }

  async getStatus(notificationId: string): Promise<NotificationStatus> {
    this.logger.log(`Getting status for notification: ${notificationId}`);
    return {
      id: notificationId,
      status: 'sent',
      sentAt: new Date(),
      retryCount: 0
    };
  }

  async cancel(notificationId: string): Promise<boolean> {
    this.logger.log(`Cancelling notification: ${notificationId}`);
    return true;
  }
}

// ===== In-App Notification Adapter =====
@Injectable()
export class InAppNotificationAdapter extends BaseNotificationAdapter implements IInAppNotificationPort {
  constructor(
    private readonly webSocketService?: WebSocketService,
  ) {
    super();
  }

  async send(notification: InAppNotificationData): Promise<InAppNotificationResult> {
    this.logger.log(`Sending in-app notification: ${notification.id} to user: ${notification.recipientId}`);
    
    // إرسال عبر WebSocket في الوقت الفعلي
    let websocketDelivered = false;
    if (this.webSocketService) {
      websocketDelivered = this.webSocketService.sendToUser(
        notification.recipientId,
        'notification:new',
        {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          messageEn: notification.messageEn,
          type: notification.type,
          priority: notification.priority,
          data: notification.data,
          createdAt: new Date().toISOString(),
        },
      );

      if (!websocketDelivered) {
        this.logger.debug(`User ${notification.recipientId} is not connected via WebSocket`);
      }
    }
    
    return {
      success: true,
      notificationId: notification.id,
      externalId: `inapp_${Date.now()}`,
      deliveredAt: new Date(),
      metadata: { 
        adapter: 'InAppNotificationAdapter',
        recipientId: notification.recipientId,
        channel: 'inapp',
        websocketDelivered,
      }
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    this.logger.log(`Marking notification as read: ${notificationId} for user: ${userId}`);
    // Implementation for marking as read
    return true;
  }

  async markAsDelivered(notificationId: string): Promise<boolean> {
    this.logger.log(`Marking notification as delivered: ${notificationId}`);
    // Implementation for marking as delivered
    return true;
  }
}

// ===== Push Notification Adapter =====
@Injectable()
export class PushNotificationAdapter extends BaseNotificationAdapter implements IPushNotificationPort {
  private readonly fcmEnabled: boolean;

  constructor(@Optional() private readonly fcmAdapter?: FCMAdapter) {
    super();
    this.fcmEnabled = !!fcmAdapter;
    if (!this.fcmEnabled) {
      this.logger.warn('FCMAdapter is not available. Push notifications will use mock implementation.');
    }
  }

  /**
   * Convert PushNotificationData to FCMNotification format
   */
  private toFCMNotification(data: PushNotificationData): FCMNotification {
    return {
      title: data.title,
      body: data.message,
      data: this.convertDataToStrings(data.data || {}),
      imageUrl: data.imageUrl,
      clickAction: data.actionUrl,
    };
  }

  /**
   * Convert data object to string key-value pairs for FCM
   */
  private convertDataToStrings(data: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }

  async send(notification: PushNotificationData): Promise<PushNotificationResult> {
    this.logger.log(`Sending push notification: ${notification.id}`);
    
    // Check if FCM is enabled and device token is provided
    if (this.fcmEnabled && notification.deviceToken) {
      try {
        const fcmNotification = this.toFCMNotification(notification);
        const success = await this.fcmAdapter!.sendToDevice(
          notification.deviceToken,
          fcmNotification
        );

        if (success) {
          return {
            success: true,
            notificationId: notification.id,
            externalId: `fcm_${Date.now()}`,
            deliveredAt: new Date(),
            platform: this.detectPlatform(notification.deviceToken),
            metadata: { 
              adapter: 'PushNotificationAdapter',
              provider: 'FCM',
              channel: 'push',
              deviceToken: notification.deviceToken.substring(0, 20) + '...' // Mask token
            }
          };
        } else {
          throw new Error('FCM send failed');
        }
      } catch (error) {
        this.logger.error(`Failed to send FCM notification: ${error instanceof Error ? error.message : String(error)}`);
        return {
          success: false,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown FCM error',
          metadata: { 
            adapter: 'PushNotificationAdapter',
            provider: 'FCM',
            channel: 'push'
          }
        };
      }
    }

    // Fallback to mock implementation if FCM is not available or no device token
    this.logger.warn(`FCM not available or no device token provided. Using mock implementation for notification ${notification.id}`);
    return {
      success: true,
      notificationId: notification.id,
      externalId: `push_mock_${Date.now()}`,
      deliveredAt: new Date(),
      platform: 'unknown',
      metadata: { 
        adapter: 'PushNotificationAdapter',
        provider: 'mock',
        channel: 'push',
        deviceToken: notification.deviceToken || 'none'
      }
    };
  }

  async sendToDevice(deviceToken: string, notification: PushNotificationData): Promise<PushNotificationResult> {
    const tokenPreview = deviceToken ? `${deviceToken.substring(0, 20)}...` : 'none';
    this.logger.log(`Sending push notification to device: ${tokenPreview}`);
    
    const notificationWithToken = { ...notification, deviceToken };
    return this.send(notificationWithToken);
  }

  async sendToTopic(topic: string, notification: PushNotificationData): Promise<PushNotificationResult> {
    this.logger.log(`Sending push notification to topic: ${topic}`);
    
    if (this.fcmEnabled) {
      try {
        const fcmNotification = this.toFCMNotification(notification);
        const success = await this.fcmAdapter!.sendToTopic(topic, fcmNotification);

        if (success) {
          return {
            success: true,
            notificationId: notification.id,
            externalId: `fcm_topic_${Date.now()}`,
            deliveredAt: new Date(),
            platform: 'all',
            metadata: { 
              adapter: 'PushNotificationAdapter',
              provider: 'FCM',
              channel: 'push',
              topic
            }
          };
        } else {
          throw new Error('FCM topic send failed');
        }
      } catch (error) {
        this.logger.error(`Failed to send FCM topic notification: ${error instanceof Error ? error.message : String(error)}`);
        return {
          success: false,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown FCM error',
          metadata: { 
            adapter: 'PushNotificationAdapter',
            provider: 'FCM',
            channel: 'push',
            topic
          }
        };
      }
    }

    // Fallback
    this.logger.warn(`FCM not available. Using mock implementation for topic ${topic}`);
    return {
      success: true,
      notificationId: notification.id,
      externalId: `push_topic_mock_${Date.now()}`,
      deliveredAt: new Date(),
      platform: 'all',
      metadata: { 
        adapter: 'PushNotificationAdapter',
        provider: 'mock',
        channel: 'push',
        topic
      }
    };
  }

  /**
   * Detect platform from device token (basic detection)
   */
  private detectPlatform(token: string): string {
    // FCM tokens don't have clear platform indicators, but we can guess based on length
    // This is a basic implementation - in production, you should store platform with token
    if (token.length > 150) {
      return 'ios'; // iOS tokens are typically longer
    }
    return 'android'; // Default to android
  }
}

// ===== Email Notification Adapter =====
@Injectable()
export class EmailNotificationAdapter extends BaseNotificationAdapter implements IEmailNotificationPort {
  private readonly emailEnabled: boolean;

  constructor(@Optional() private readonly emailAdapter?: EmailAdapter) {
    super();
    this.emailEnabled = !!emailAdapter;
    if (!this.emailEnabled) {
      this.logger.warn('EmailAdapter is not available. Email notifications will use mock implementation.');
    }
  }

  /**
   * Convert EmailNotificationData to EmailNotification format
   */
  private toEmailNotification(data: EmailNotificationData): EmailNotification {
    return {
      to: data.recipientEmail,
      subject: data.subject,
      html: data.htmlContent,
      text: data.textContent || this.htmlToText(data.htmlContent || ''),
      template: data.templateId,
      data: data.data as Record<string, unknown>,
      attachments: data.attachments?.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' ? Buffer.from(att.content) : att.content,
        contentType: att.contentType,
      })),
    };
  }

  /**
   * Convert HTML to text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  async send(notification: EmailNotificationData): Promise<EmailNotificationResult> {
    this.logger.log(`Sending email notification: ${notification.id} to: ${notification.recipientEmail}`);
    
    if (this.emailEnabled && notification.recipientEmail) {
      try {
        const emailNotification = this.toEmailNotification(notification);
        const result = await this.emailAdapter!.sendEmail(emailNotification);

        if (result.success) {
          return {
            success: true,
            notificationId: notification.id,
            externalId: result.messageId || `email_${Date.now()}`,
            deliveredAt: new Date(),
            provider: 'smtp',
            metadata: { 
              adapter: 'EmailNotificationAdapter',
              provider: 'SMTP',
              channel: 'email',
              recipientEmail: notification.recipientEmail
            }
          };
        } else {
          throw new Error(result.error || 'Email send failed');
        }
      } catch (error) {
        this.logger.error(`Failed to send email notification: ${error instanceof Error ? error.message : String(error)}`);
        return {
          success: false,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown email error',
          metadata: { 
            adapter: 'EmailNotificationAdapter',
            provider: 'SMTP',
            channel: 'email',
            recipientEmail: notification.recipientEmail
          }
        };
      }
    }

    // Fallback to mock implementation
    this.logger.warn(`Email adapter not available or no recipient email. Using mock implementation for notification ${notification.id}`);
    return {
      success: true,
      notificationId: notification.id,
      externalId: `email_mock_${Date.now()}`,
      deliveredAt: new Date(),
      provider: 'mock',
      metadata: { 
        adapter: 'EmailNotificationAdapter',
        provider: 'mock',
        channel: 'email',
        recipientEmail: notification.recipientEmail || 'none'
      }
    };
  }

  async sendBulk(notifications: EmailNotificationData[]): Promise<BulkEmailNotificationResult> {
    this.logger.log(`Sending ${notifications.length} email notifications in bulk`);
    
    if (this.emailEnabled) {
      try {
        const emailNotifications = notifications.map(n => this.toEmailNotification(n));
        const bulkResult = await this.emailAdapter!.sendBulkEmail(emailNotifications);

        const results: EmailNotificationResult[] = bulkResult.results.map((result, index) => ({
          success: result.success,
          notificationId: notifications[index].id,
          externalId: result.messageId,
          error: result.error,
          deliveredAt: result.success ? new Date() : undefined,
          provider: 'smtp',
          metadata: {
            adapter: 'EmailNotificationAdapter',
            provider: 'SMTP',
            channel: 'email'
          }
        }));

        return {
          success: bulkResult.failureCount === 0,
          total: notifications.length,
          sent: bulkResult.successCount,
          failed: bulkResult.failureCount,
          results
        };
      } catch (error) {
        this.logger.error(`Failed to send bulk emails: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Fallback to individual sends
    const results: EmailNotificationResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const notification of notifications) {
      const result = await this.send(notification);
      results.push(result);
      if (result.success) sent++;
      else failed++;
    }

    return {
      success: failed === 0,
      total: notifications.length,
      sent,
      failed,
      results
    };
  }

  async getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus> {
    this.logger.log(`Getting delivery status for email: ${messageId}`);
    return {
      messageId,
      status: 'delivered',
      deliveredAt: new Date()
    };
  }
}

// ===== SMS Notification Adapter =====
@Injectable()
export class SmsNotificationAdapter extends BaseNotificationAdapter implements ISmsNotificationPort {
  private readonly smsEnabled: boolean;

  constructor(@Optional() private readonly smsAdapter?: SMSAdapter) {
    super();
    this.smsEnabled = !!smsAdapter;
    if (!this.smsEnabled) {
      this.logger.warn('SMSAdapter is not available. SMS notifications will use mock implementation.');
    }
  }

  /**
   * Convert SmsNotificationData to SMSNotification format
   */
  private toSMSNotification(data: SmsNotificationData): SMSNotification {
    return {
      to: data.recipientPhone,
      message: data.message,
      from: data.senderId,
    };
  }

  async send(notification: SmsNotificationData): Promise<SmsNotificationResult> {
    this.logger.log(`Sending SMS notification: ${notification.id} to: ${notification.recipientPhone}`);
    
    if (this.smsEnabled && notification.recipientPhone) {
      try {
        const smsNotification = this.toSMSNotification(notification);
        const result = await this.smsAdapter!.sendSMS(smsNotification);

        if (result.success) {
          return {
            success: true,
            notificationId: notification.id,
            externalId: result.messageId || `sms_${Date.now()}`,
            deliveredAt: new Date(),
            provider: 'twilio',
            cost: result.cost,
            metadata: { 
              adapter: 'SmsNotificationAdapter',
              provider: 'Twilio',
              channel: 'sms',
              recipientPhone: notification.recipientPhone
            }
          };
        } else {
          throw new Error(result.error || 'SMS send failed');
        }
      } catch (error) {
        this.logger.error(`Failed to send SMS notification: ${error instanceof Error ? error.message : String(error)}`);
        return {
          success: false,
          notificationId: notification.id,
          error: error instanceof Error ? error.message : 'Unknown SMS error',
          metadata: { 
            adapter: 'SmsNotificationAdapter',
            provider: 'Twilio',
            channel: 'sms',
            recipientPhone: notification.recipientPhone
          }
        };
      }
    }

    // Fallback to mock implementation
    this.logger.warn(`SMS adapter not available or no recipient phone. Using mock implementation for notification ${notification.id}`);
    return {
      success: true,
      notificationId: notification.id,
      externalId: `sms_mock_${Date.now()}`,
      deliveredAt: new Date(),
      provider: 'mock',
      cost: 0,
      metadata: { 
        adapter: 'SmsNotificationAdapter',
        provider: 'mock',
        channel: 'sms',
        recipientPhone: notification.recipientPhone || 'none'
      }
    };
  }

  async sendBulk(notifications: SmsNotificationData[]): Promise<BulkSmsNotificationResult> {
    this.logger.log(`Sending ${notifications.length} SMS notifications in bulk`);
    
    if (this.smsEnabled) {
      try {
        const smsNotifications = notifications.map(n => this.toSMSNotification(n));
        const bulkResult = await this.smsAdapter!.sendBulkSMS(smsNotifications);

        const results: SmsNotificationResult[] = bulkResult.results.map((result, index) => ({
          success: result.success,
          notificationId: notifications[index].id,
          externalId: result.messageId,
          error: result.error,
          deliveredAt: result.success ? new Date() : undefined,
          provider: 'twilio',
          cost: result.cost,
          metadata: {
            adapter: 'SmsNotificationAdapter',
            provider: 'Twilio',
            channel: 'sms'
          }
        }));

        const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);

        return {
          success: bulkResult.failureCount === 0,
          total: notifications.length,
          sent: bulkResult.successCount,
          failed: bulkResult.failureCount,
          results,
          totalCost
        };
      } catch (error) {
        this.logger.error(`Failed to send bulk SMS: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Fallback to individual sends
    const results: SmsNotificationResult[] = [];
    let sent = 0;
    let failed = 0;
    let totalCost = 0;

    for (const notification of notifications) {
      const result = await this.send(notification);
      results.push(result);
      if (result.success) {
        sent++;
        totalCost += result.cost || 0;
      } else {
        failed++;
      }
    }

    return {
      success: failed === 0,
      total: notifications.length,
      sent,
      failed,
      results,
      totalCost
    };
  }

  async getDeliveryStatus(messageId: string): Promise<SmsDeliveryStatus> {
    this.logger.log(`Getting delivery status for SMS: ${messageId}`);
    
    if (this.smsEnabled) {
      try {
        const status = await this.smsAdapter!.getDeliveryStatus(messageId);
        if (status) {
          const statusData = status as { status: string; dateSent?: Date; price?: string };
          return {
            messageId,
            status: statusData.status as 'sent' | 'delivered' | 'failed',
            deliveredAt: statusData.dateSent,
            cost: statusData.price ? parseFloat(statusData.price) : undefined
          };
        }
      } catch (error) {
        this.logger.error(`Failed to get SMS delivery status: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Fallback
    return {
      messageId,
      status: 'delivered',
      deliveredAt: new Date(),
      cost: 0
    };
  }
}

// ===== Notification Factory =====
@Injectable()
export class NotificationAdapterFactory {
  constructor(
    private inAppAdapter: InAppNotificationAdapter,
    private pushAdapter: PushNotificationAdapter,
    private emailAdapter: EmailNotificationAdapter,
    private smsAdapter: SmsNotificationAdapter,
  ) {}

  getAdapter(channel: NotificationChannel): INotificationPort {
    switch (channel) {
      case NotificationChannel.IN_APP:
        return this.inAppAdapter;
      case NotificationChannel.PUSH:
        return this.pushAdapter;
      case NotificationChannel.EMAIL:
        return this.emailAdapter;
      case NotificationChannel.SMS:
        return this.smsAdapter;
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }

  getAllAdapters(): INotificationPort[] {
    return [
      this.inAppAdapter,
      this.pushAdapter,
      this.emailAdapter,
      this.smsAdapter,
    ];
  }
}

// ===== Mock Adapters for Testing =====
@Injectable()
export class MockNotificationAdapter extends BaseNotificationAdapter {
  async send(notification: NotificationData): Promise<NotificationResult> {
    this.logger.log(`[MOCK] Sending notification: ${notification.id}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate occasional failures for testing
    const shouldFail = Math.random() < 0.1; // 10% failure rate
    
    if (shouldFail) {
      return {
        success: false,
        notificationId: notification.id,
        error: 'Mock failure for testing'
      };
    }
    
    return {
      success: true,
      notificationId: notification.id,
      externalId: `mock_${Date.now()}`,
      metadata: { 
        adapter: 'MockNotificationAdapter',
        channel: notification.channel,
        mock: true
      }
    };
  }
}

// ===== Error Handling Adapter =====
@Injectable()
export class ErrorHandlingNotificationAdapter implements INotificationPort {
  constructor(private adapter: INotificationPort) {}

  async send(notification: NotificationData): Promise<NotificationResult> {
    try {
      return await this.adapter.send(notification);
    } catch (error) {
      return {
        success: false,
        notificationId: notification.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulk(notifications: NotificationData[]): Promise<BulkNotificationResult> {
    try {
      return await this.adapter.sendBulk(notifications);
    } catch (error) {
      return {
        success: false,
        total: notifications.length,
        sent: 0,
        failed: notifications.length,
        results: notifications.map(n => ({
          success: false,
          notificationId: n.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      };
    }
  }

  async getStatus(notificationId: string): Promise<NotificationStatus> {
    try {
      return await this.adapter.getStatus(notificationId);
    } catch (error) {
      return {
        id: notificationId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0
      };
    }
  }

  async cancel(notificationId: string): Promise<boolean> {
    try {
      return await this.adapter.cancel(notificationId);
    } catch (error) {
      return false;
    }
  }
}
