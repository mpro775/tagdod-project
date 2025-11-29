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
  private firebaseApp?: admin.app.App;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const projectId = this.configService.get('FCM_PROJECT_ID');
      const privateKey = this.configService.get('FCM_PRIVATE_KEY');
      const clientEmail = this.configService.get('FCM_CLIENT_EMAIL');

      // Check if required environment variables are set
      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn(
          'FCM environment variables are not fully configured. ' +
          'Required: FCM_PROJECT_ID, FCM_PRIVATE_KEY, FCM_CLIENT_EMAIL. ' +
          'Push notifications will be disabled.'
        );
        return;
      }

      const serviceAccount = {
        type: 'service_account',
        project_id: projectId,
        private_key_id: this.configService.get('FCM_PRIVATE_KEY_ID'),
        private_key: privateKey.replace(/\\n/g, '\n'),
        client_email: clientEmail,
        client_id: this.configService.get('FCM_CLIENT_ID'),
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${clientEmail}`,
      };

      // Check if Firebase is already initialized
      try {
        this.firebaseApp = admin.app();
        this.logger.log('Using existing Firebase Admin SDK instance');
      } catch {
        // Initialize new instance
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          projectId: projectId,
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      // Firebase app will remain uninitialized (checked via isInitialized())
      this.firebaseApp = undefined;
    }
  }

  /**
   * Check if Firebase is properly initialized
   */
  public isInitialized(): boolean {
    return this.firebaseApp !== undefined && this.firebaseApp !== null;
  }

  /**
   * Send notification to single device
   * Returns detailed result with error information
   */
  async sendToDevice(
    token: string,
    notification: FCMNotification,
  ): Promise<{
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  }> {
    if (!this.isInitialized()) {
      this.logger.warn('FCM is not initialized. Cannot send notification.');
      return {
        success: false,
        errorCode: 'fcm_not_initialized',
        errorMessage: 'FCM is not initialized. Cannot send notification.',
      };
    }

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

      const response = await this.firebaseApp!.messaging().send(message);
      this.logger.log(`FCM notification sent successfully: ${response}`);
      return {
        success: true,
      };
    } catch (error: unknown) {
      // Handle invalid token errors
      const firebaseError = error as { code?: string; message?: string };
      const errorCode = firebaseError?.code || 'unknown_error';
      const errorMessage = firebaseError?.message || 'Unknown FCM error';

      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered'
      ) {
        this.logger.warn(`Invalid or unregistered FCM token: ${token.substring(0, 20)}...`);
        return {
          success: false,
          errorCode,
          errorMessage,
        };
      } else {
        this.logger.error(`Failed to send FCM notification:`, error);
        return {
          success: false,
          errorCode,
          errorMessage,
        };
      }
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
      const result = await this.sendToDevice(token, notification);
      if (result.success) {
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
    if (!this.isInitialized()) {
      this.logger.warn('FCM is not initialized. Cannot send topic notification.');
      return false;
    }

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

      const response = await this.firebaseApp!.messaging().send(message);
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
    if (!this.isInitialized()) {
      this.logger.warn('FCM is not initialized. Cannot subscribe to topic.');
      return false;
    }

    try {
      const response = await this.firebaseApp!.messaging().subscribeToTopic(tokens, topic);
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
    if (!this.isInitialized()) {
      this.logger.warn('FCM is not initialized. Cannot unsubscribe from topic.');
      return false;
    }

    try {
      const response = await this.firebaseApp!.messaging().unsubscribeFromTopic(tokens, topic);
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
    if (!this.isInitialized()) {
      this.logger.warn('FCM is not initialized. Cannot validate token.');
      return false;
    }

    try {
      // Send a test message to validate token
      const message: admin.messaging.Message = {
        token,
        data: { test: 'true' },
        android: { priority: 'normal' },
        apns: { payload: { aps: { contentAvailable: true } } },
      };

      await this.firebaseApp!.messaging().send(message);
      return true;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError?.code === 'messaging/invalid-registration-token' || 
          firebaseError?.code === 'messaging/registration-token-not-registered') {
        this.logger.warn(`FCM token is invalid or not registered: ${token.substring(0, 20)}...`);
      } else {
        this.logger.warn(`FCM token validation failed:`, error);
      }
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
