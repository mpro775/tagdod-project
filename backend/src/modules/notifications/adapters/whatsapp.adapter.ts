import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

export interface WhatsAppNotification {
  to: string;
  message: string;
  mediaUrl?: string;
  contentSid?: string;
  contentVariables?: string;
}

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * WhatsApp Adapter - منفصل تماماً عن SMS
 * يستخدم Twilio لإرسال رسائل الواتساب
 */
@Injectable()
export class WhatsAppAdapter {
  private readonly logger = new Logger(WhatsAppAdapter.name);
  private twilioClient!: twilio.Twilio;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    try {
      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

      if (!accountSid || !authToken) {
        this.logger.warn(
          'Twilio credentials not found for WhatsApp. WhatsApp notifications will be disabled.',
        );
        return;
      }

      this.twilioClient = twilio(accountSid, authToken);
      this.isInitialized = true;
      this.logger.log('WhatsApp adapter (Twilio) initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp adapter (Twilio):', error);
      this.isInitialized = false;
    }
  }

  /**
   * التحقق من أن Adapter مهيأ
   */
  isReady(): boolean {
    return this.isInitialized && !!this.twilioClient;
  }

  /**
   * إرسال رسالة واتساب باستخدام body و mediaUrl
   */
  async sendMessage(to: string, message: string, mediaUrl?: string): Promise<WhatsAppResult> {
    try {
      if (!this.isReady()) {
        return {
          success: false,
          error:
            'WhatsApp adapter not initialized. Please configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.',
        };
      }

      const whatsappFrom = `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`;
      if (!whatsappFrom || whatsappFrom === 'whatsapp:undefined' || whatsappFrom === 'whatsapp:') {
        return {
          success: false,
          error:
            'TWILIO_WHATSAPP_NUMBER not configured. Please set TWILIO_WHATSAPP_NUMBER in environment variables.',
        };
      }

      const whatsappTo = `whatsapp:${to}`;

      const messageData = await this.twilioClient.messages.create({
        body: message,
        from: whatsappFrom,
        to: whatsappTo,
        mediaUrl: mediaUrl ? [mediaUrl] : undefined,
      });

      this.logger.log(`WhatsApp message sent successfully to ${to}: ${messageData.sid}`);

      return {
        success: true,
        messageId: messageData.sid,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${to}:`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * إرسال رسالة واتساب باستخدام Content API (contentSid و contentVariables)
   */
  async sendMessageWithContent(
    to: string,
    contentSid: string,
    contentVariables?: string,
  ): Promise<WhatsAppResult> {
    try {
      if (!this.isReady()) {
        return {
          success: false,
          error:
            'WhatsApp adapter not initialized. Please configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.',
        };
      }

      const whatsappFrom = `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`;
      if (!whatsappFrom || whatsappFrom === 'whatsapp:undefined' || whatsappFrom === 'whatsapp:') {
        return {
          success: false,
          error:
            'TWILIO_WHATSAPP_NUMBER not configured. Please set TWILIO_WHATSAPP_NUMBER in environment variables.',
        };
      }

      const whatsappTo = `whatsapp:${to}`;

      // بناء الـ request object - contentVariables يجب أن يكون string إذا كان موجوداً
      const messagePayload: {
        from: string;
        to: string;
        contentSid: string;
        contentVariables?: string;
      } = {
        from: whatsappFrom,
        to: whatsappTo,
        contentSid,
      };

      // إضافة contentVariables فقط إذا كان موجوداً (يجب أن يكون string)
      if (contentVariables && contentVariables.trim().length > 0) {
        messagePayload.contentVariables = contentVariables;
      }

      const messageData = await this.twilioClient.messages.create(messagePayload);

      this.logger.log(
        `WhatsApp message (Content API) sent successfully to ${to}: ${messageData.sid}`,
      );

      return {
        success: true,
        messageId: messageData.sid,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message (Content API) to ${to}:`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * إرسال إشعار واتساب (wrapper method)
   */
  async sendNotification(notification: WhatsAppNotification): Promise<WhatsAppResult> {
    if (notification.contentSid) {
      return this.sendMessageWithContent(
        notification.to,
        notification.contentSid,
        notification.contentVariables,
      );
    } else {
      return this.sendMessage(notification.to, notification.message, notification.mediaUrl);
    }
  }

  /**
   * الحصول على حالة الرسالة
   */
  async getDeliveryStatus(messageId: string): Promise<unknown> {
    try {
      if (!this.isReady()) {
        return null;
      }

      const message = await this.twilioClient.messages(messageId).fetch();

      return {
        status: message.status,
        direction: message.direction,
        price: message.price,
        priceUnit: message.priceUnit,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        dateSent: message.dateSent,
      };
    } catch (error) {
      this.logger.error(`Failed to get WhatsApp delivery status for ${messageId}:`, error);
      return null;
    }
  }
}
