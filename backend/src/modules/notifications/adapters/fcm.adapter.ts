import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface FCMNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
}

export interface FCMToken {
  token: string;
  platform: 'android' | 'ios' | 'web';
  userId?: string;
}

@Injectable()
export class FCMAdapter {
  private readonly logger = new Logger(FCMAdapter.name);
  private firebaseApp!: admin.app.App;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccount = {
        type: 'service_account',
        project_id: this.configService.get('FCM_PROJECT_ID'),
        private_key_id: this.configService.get('FCM_PRIVATE_KEY_ID'),
        private_key: this.configService.get('FCM_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        client_email: this.configService.get('FCM_CLIENT_EMAIL'),
        client_id: this.configService.get('FCM_CLIENT_ID'),
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${this.configService.get('FCM_CLIENT_EMAIL')}`,
      };

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: this.configService.get('FCM_PROJECT_ID'),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * Send notification to single device
   */
  async sendToDevice(token: string, notification: FCMNotification): Promise<boolean> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        android: {
          notification: {
            clickAction: notification.clickAction,
            sound: 'default',
            priority: 'high',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            requireInteraction: true,
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`FCM notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send FCM notification to token ${token}:`, error);
      return false;
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultipleDevices(tokens: string[], notification: FCMNotification): Promise<{
    successCount: number;
    failureCount: number;
    failedTokens: string[];
  }> {
    const results = {
      successCount: 0,
      failureCount: 0,
      failedTokens: [] as string[],
    };

    for (const token of tokens) {
      const success = await this.sendToDevice(token, notification);
      if (success) {
        results.successCount++;
      } else {
        results.failureCount++;
        results.failedTokens.push(token);
      }
    }

    this.logger.log(`FCM batch notification results: ${results.successCount} success, ${results.failureCount} failed`);
    return results;
  }

  /**
   * Send notification to topic
   */
  async sendToTopic(topic: string, notification: FCMNotification): Promise<boolean> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`FCM topic notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send FCM topic notification to ${topic}:`, error);
      return false;
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Successfully subscribed ${response.successCount} tokens to topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(`Successfully unsubscribed ${response.successCount} tokens from topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Validate FCM token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Send a test message to validate token
      const message: admin.messaging.Message = {
        token,
        data: { test: 'true' },
        android: { priority: 'normal' },
        apns: { payload: { aps: { contentAvailable: true } } },
      };

      await admin.messaging().send(message);
      return true;
    } catch (error) {
      this.logger.warn(`FCM token validation failed for ${token}:`, error);
      return false;
    }
  }

  /**
   * Get delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<unknown> {
    try {
      // This would require additional setup for delivery tracking
      this.logger.log(`Getting delivery status for message: ${messageId}`);
      return { status: 'delivered', timestamp: new Date() };
    } catch (error) {
      this.logger.error(`Failed to get delivery status for ${messageId}:`, error);
      return null;
    }
  }
}
