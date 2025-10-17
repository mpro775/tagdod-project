import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

export interface SMSNotification {
  to: string;
  message: string;
  from?: string;
  mediaUrl?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

@Injectable()
export class SMSAdapter {
  private readonly logger = new Logger(SMSAdapter.name);
  private twilioClient!: twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    try {
      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

      if (!accountSid || !authToken) {
        this.logger.warn('Twilio credentials not found, SMS notifications will be disabled');
        return;
      }

      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification: SMSNotification): Promise<SMSResult> {
    try {
      if (!this.twilioClient) {
        return {
          success: false,
          error: 'Twilio client not initialized',
        };
      }

      const fromNumber = notification.from || this.configService.get('TWILIO_PHONE_NUMBER');

      const message = await this.twilioClient.messages.create({
        body: notification.message,
        from: fromNumber,
        to: notification.to,
        mediaUrl: notification.mediaUrl ? [notification.mediaUrl] : undefined,
      });

      this.logger.log(`SMS sent successfully to ${notification.to}: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
        cost: parseFloat(message.price || '0'),
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${notification.to}:`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send bulk SMS notifications
   */
  async sendBulkSMS(notifications: SMSNotification[]): Promise<{
    successCount: number;
    failureCount: number;
    results: SMSResult[];
  }> {
    const results = {
      successCount: 0,
      failureCount: 0,
      results: [] as SMSResult[],
    };

    for (const notification of notifications) {
      const result = await this.sendSMS(notification);
      results.results.push(result);

      if (result.success) {
        results.successCount++;
      } else {
        results.failureCount++;
      }
    }

    this.logger.log(
      `Bulk SMS results: ${results.successCount} success, ${results.failureCount} failed`,
    );
    return results;
  }

  /**
   * Send WhatsApp message (if enabled)
   */
  async sendWhatsApp(to: string, message: string, mediaUrl?: string): Promise<SMSResult> {
    try {
      if (!this.twilioClient) {
        return {
          success: false,
          error: 'Twilio client not initialized',
        };
      }

      const whatsappFrom = `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`;
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
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<unknown> {
    try {
      if (!this.twilioClient) {
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
      this.logger.error(`Failed to get delivery status for ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Validate phone number
   */
  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        return false;
      }

      const lookup = await this.twilioClient.lookups.v1.phoneNumbers(phoneNumber).fetch();
      return !!lookup.phoneNumber;
    } catch (error) {
      this.logger.warn(`Phone number validation failed for ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<number | null> {
    try {
      if (!this.twilioClient) {
        return null;
      }

      const balance = await this.twilioClient.balance.fetch();
      return parseFloat(balance.balance);
    } catch (error) {
      this.logger.error('Failed to get account balance:', error);
      return null;
    }
  }

  /**
   * Get SMS usage statistics
   */
  async getUsageStatistics(startDate: Date, endDate: Date): Promise<unknown> {
    try {
      if (!this.twilioClient) {
        return null;
      }

      const messages = await this.twilioClient.messages.list({
        dateSentAfter: startDate,
        dateSentBefore: endDate,
      });

      const stats = {
        totalMessages: messages.length,
        sent: messages.filter((m: { status: string }) => m.status === 'sent').length,
        delivered: messages.filter((m: { status: string }) => m.status === 'delivered').length,
        failed: messages.filter((m: { status: string }) => m.status === 'failed').length,
        totalCost: messages.reduce(
          (sum: number, m: { price?: string }) => sum + parseFloat(m.price || '0'),
          0,
        ),
      };

      return stats;
    } catch (error) {
      this.logger.error('Failed to get usage statistics:', error);
      return null;
    }
  }
}
