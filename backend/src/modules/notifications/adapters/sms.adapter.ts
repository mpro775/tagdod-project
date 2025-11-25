import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { AlawaelSMSAdapter, AlawaelSMSNotification } from './alawael-sms.adapter';

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

type SMSProvider = 'twilio' | 'alawael';

@Injectable()
export class SMSAdapter {
  private readonly logger = new Logger(SMSAdapter.name);
  private twilioClient!: twilio.Twilio;
  private readonly provider: SMSProvider;

  constructor(
    private configService: ConfigService,
    @Optional() private readonly alawaelAdapter?: AlawaelSMSAdapter,
  ) {
    // Determine which provider to use
    const smsProvider = this.configService.get('SMS_PROVIDER')?.toLowerCase() || 'alawael';

    if (smsProvider === 'twilio') {
      this.provider = 'twilio';
      this.initializeTwilio();
    } else {
      this.provider = 'alawael';
      if (this.alawaelAdapter?.isInitialized()) {
        this.logger.log('Using Alawael SMS provider');
      } else {
        this.logger.warn('Alawael SMS not configured, falling back to Twilio');
        this.initializeTwilio();
      }
    }
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
    if (this.provider === 'alawael' && this.alawaelAdapter?.isInitialized()) {
      return this.sendViaAlawael(notification);
    } else if (this.twilioClient) {
      return this.sendViaTwilio(notification);
    } else {
      return {
        success: false,
        error: 'No SMS provider configured',
      };
    }
  }

  private async sendViaAlawael(notification: SMSNotification): Promise<SMSResult> {
    const alawaelNotification: AlawaelSMSNotification = {
      to: notification.to,
      message: notification.message,
    };

    const result = await this.alawaelAdapter!.sendSMS(alawaelNotification);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      cost: undefined, // Alawael doesn't provide cost in response
    };
  }

  private async sendViaTwilio(notification: SMSNotification): Promise<SMSResult> {
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
    if (this.provider === 'alawael' && this.alawaelAdapter?.isInitialized()) {
      const alawaelNotifications: AlawaelSMSNotification[] = notifications.map((n) => ({
        to: n.to,
        message: n.message,
      }));

      const bulkResult = await this.alawaelAdapter.sendBulkSMS(alawaelNotifications);

      return {
        successCount: bulkResult.successCount,
        failureCount: bulkResult.failureCount,
        results: bulkResult.results.map((r) => ({
          success: r.success,
          messageId: r.messageId,
          error: r.error,
        })),
      };
    }

    // Fallback to Twilio or individual sends
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
    if (this.provider === 'alawael' && this.alawaelAdapter?.isInitialized()) {
      return await this.alawaelAdapter.getDeliveryStatus(messageId);
    }

    // Twilio fallback
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
    if (this.provider === 'alawael' && this.alawaelAdapter?.isInitialized()) {
      return await this.alawaelAdapter.getAccountBalance();
    }

    // Twilio fallback
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
