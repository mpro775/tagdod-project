import { Injectable, Logger } from '@nestjs/common';
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
  async send(notification: InAppNotificationData): Promise<InAppNotificationResult> {
    this.logger.log(`Sending in-app notification: ${notification.id} to user: ${notification.recipientId}`);
    
    // Implementation for in-app notifications
    // This would typically store the notification in the database
    // and trigger real-time updates via WebSocket or Server-Sent Events
    
    return {
      success: true,
      notificationId: notification.id,
      externalId: `inapp_${Date.now()}`,
      deliveredAt: new Date(),
      metadata: { 
        adapter: 'InAppNotificationAdapter',
        recipientId: notification.recipientId,
        channel: 'inapp'
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
  async send(notification: PushNotificationData): Promise<PushNotificationResult> {
    this.logger.log(`Sending push notification: ${notification.id}`);
    
    // Implementation for push notifications
    // This would integrate with FCM, APNs, or other push services
    
    return {
      success: true,
      notificationId: notification.id,
      externalId: `push_${Date.now()}`,
      deliveredAt: new Date(),
      platform: 'android', // or 'ios', 'web'
      metadata: { 
        adapter: 'PushNotificationAdapter',
        channel: 'push',
        deviceToken: notification.deviceToken
      }
    };
  }

  async sendToDevice(deviceToken: string, notification: PushNotificationData): Promise<PushNotificationResult> {
    this.logger.log(`Sending push notification to device: ${deviceToken}`);
    
    const notificationWithToken = { ...notification, deviceToken };
    return this.send(notificationWithToken);
  }

  async sendToTopic(topic: string, notification: PushNotificationData): Promise<PushNotificationResult> {
    this.logger.log(`Sending push notification to topic: ${topic}`);
    
    const notificationWithTopic = { ...notification, topic };
    return this.send(notificationWithTopic);
  }
}

// ===== Email Notification Adapter =====
@Injectable()
export class EmailNotificationAdapter extends BaseNotificationAdapter implements IEmailNotificationPort {
  async send(notification: EmailNotificationData): Promise<EmailNotificationResult> {
    this.logger.log(`Sending email notification: ${notification.id} to: ${notification.recipientEmail}`);
    
    // Implementation for email notifications
    // This would integrate with SendGrid, AWS SES, or other email services
    
    return {
      success: true,
      notificationId: notification.id,
      externalId: `email_${Date.now()}`,
      deliveredAt: new Date(),
      provider: 'sendgrid', // or 'ses', 'mailgun', etc.
      metadata: { 
        adapter: 'EmailNotificationAdapter',
        channel: 'email',
        recipientEmail: notification.recipientEmail
      }
    };
  }

  async sendBulk(notifications: EmailNotificationData[]): Promise<BulkEmailNotificationResult> {
    this.logger.log(`Sending ${notifications.length} email notifications in bulk`);
    
    const results: EmailNotificationResult[] = [];
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
  async send(notification: SmsNotificationData): Promise<SmsNotificationResult> {
    this.logger.log(`Sending SMS notification: ${notification.id} to: ${notification.recipientPhone}`);
    
    // Implementation for SMS notifications
    // This would integrate with Twilio, AWS SNS, or other SMS services
    
    return {
      success: true,
      notificationId: notification.id,
      externalId: `sms_${Date.now()}`,
      deliveredAt: new Date(),
      provider: 'twilio', // or 'sns', 'nexmo', etc.
      cost: 0.01, // Cost per SMS
      metadata: { 
        adapter: 'SmsNotificationAdapter',
        channel: 'sms',
        recipientPhone: notification.recipientPhone
      }
    };
  }

  async sendBulk(notifications: SmsNotificationData[]): Promise<BulkSmsNotificationResult> {
    this.logger.log(`Sending ${notifications.length} SMS notifications in bulk`);
    
    const results: SmsNotificationResult[] = [];
    let sent = 0;
    let failed = 0;
    let totalCost = 0;

    for (const notification of notifications) {
      try {
        const result = await this.send(notification);
        results.push(result);
        if (result.success) {
          sent++;
          totalCost += result.cost || 0;
        } else {
          failed++;
        }
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
      results,
      totalCost
    };
  }

  async getDeliveryStatus(messageId: string): Promise<SmsDeliveryStatus> {
    this.logger.log(`Getting delivery status for SMS: ${messageId}`);
    return {
      messageId,
      status: 'delivered',
      deliveredAt: new Date(),
      cost: 0.01
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
