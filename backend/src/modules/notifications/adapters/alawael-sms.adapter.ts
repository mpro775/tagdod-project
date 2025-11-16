import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface AlawaelSMSConfig {
  orgName: string;
  userName: string;
  password: string;
  baseUrl: string;
}

export interface AlawaelSMSNotification {
  to: string;
  message: string;
  coding?: 0 | 2; // 0 for English, 2 for Arabic
}

export interface AlawaelSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  responseNo?: number;
  responseMessage?: string;
}

export interface AlawaelDeliveryStatus {
  messageId: string;
  status: 'SUCCESS' | 'ACCEPTED' | 'UNDELIV' | 'REJECTD' | 'INVALID_AUTH' | 'INVALID_SMS_ID';
  deliveredAt?: Date;
}

@Injectable()
export class AlawaelSMSAdapter {
  private readonly logger = new Logger(AlawaelSMSAdapter.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: AlawaelSMSConfig | null;

  constructor(private configService: ConfigService) {
    const orgName = this.configService.get('ALAWAEL_SMS_ORG_NAME');
    const userName = this.configService.get('ALAWAEL_SMS_USER_NAME');
    const password = this.configService.get('ALAWAEL_SMS_PASSWORD');
    const baseUrl = this.configService.get('ALAWAEL_SMS_BASE_URL') || 'https://sms.alawaeltec.com';

    if (!orgName || !userName || !password) {
      this.logger.warn('Alawael SMS credentials not found, SMS notifications will be disabled');
      this.config = null;
    } else {
      this.config = {
        orgName,
        userName,
        password,
        baseUrl,
      };
      this.logger.log('Alawael SMS adapter initialized successfully');
    }

    this.httpClient = axios.create({
      timeout: 30000,
    });
  }

  /**
   * Normalize phone number to required format (+ sign then 12 digits)
   * Expected format: +967XXXXXXXXX (13 characters total)
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // If starts with 967, add +
    if (normalized.startsWith('967')) {
      normalized = '+' + normalized;
    }
    
    // If starts with 00, replace with +
    if (normalized.startsWith('00')) {
      normalized = '+' + normalized.substring(2);
    }
    
    // Ensure it starts with +
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
    
    // Validate length (should be +967XXXXXXXXX = 13 chars)
    if (normalized.length !== 13) {
      throw new Error(`Invalid phone number length. Expected 13 characters (+967XXXXXXXXX), got ${normalized.length}`);
    }
    
    // Validate prefix
    const validPrefixes = ['+96773', '+96771', '+96770', '+96777'];
    const prefix = normalized.substring(0, 6);
    if (!validPrefixes.includes(prefix)) {
      throw new Error(`Invalid phone prefix. Allowed: +96773 (MTN), +96771 (Sabafon), +96770 (Y Telecom), +96777 (Yemen Mobile)`);
    }
    
    return normalized;
  }

  /**
   * Detect if message contains Arabic characters
   */
  private detectCoding(message: string): 0 | 2 {
    // Check if message contains Arabic characters (Unicode range: \u0600-\u06FF)
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(message) ? 2 : 0;
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification: AlawaelSMSNotification): Promise<AlawaelSMSResult> {
    try {
      if (!this.config) {
        return {
          success: false,
          error: 'Alawael SMS adapter not initialized',
        };
      }

      const normalizedPhone = this.normalizePhoneNumber(notification.to);
      const coding = notification.coding ?? this.detectCoding(notification.message);

      const url = `${this.config.baseUrl}/MainServlet`;
      this.logger.debug(`Sending SMS to ${normalizedPhone} via ${url}`);

      const params = {
        orgName: this.config.orgName,
        userName: this.config.userName,
        password: this.config.password,
        mobileNo: normalizedPhone,
        text: notification.message,
        coding: coding.toString(),
      };

      const response = await this.httpClient.get<string>(url, {
        params,
      });

      // Parse response: [RESPONSE_NO]:[RESPONSE_MESSAGE]:[MESSAGE_ID]
      const responseText = response.data.trim();
      const parts = responseText.split(':');

      if (parts.length < 2) {
        throw new Error(`Invalid response format: ${responseText}`);
      }

      const responseNo = parseInt(parts[0], 10);
      const responseMessage = parts[1];
      const messageId = parts[2];

      if (responseNo === 0) {
        this.logger.log(`SMS sent successfully to ${normalizedPhone}: ${messageId}`);
        return {
          success: true,
          messageId,
          responseNo,
          responseMessage,
        };
      } else {
        const errorMessage = `SMS send failed: ${responseMessage} (Code: ${responseNo})`;
        this.logger.error(`Failed to send SMS to ${normalizedPhone}: ${errorMessage}`);
        return {
          success: false,
          error: errorMessage,
          responseNo,
          responseMessage,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send SMS to ${notification.to}: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send bulk SMS notifications
   */
  async sendBulkSMS(notifications: AlawaelSMSNotification[]): Promise<{
    successCount: number;
    failureCount: number;
    results: AlawaelSMSResult[];
  }> {
    const results = {
      successCount: 0,
      failureCount: 0,
      results: [] as AlawaelSMSResult[],
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
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<AlawaelDeliveryStatus | null> {
    try {
      if (!this.config) {
        return null;
      }

      const url = `${this.config.baseUrl}/SMSGetDelivery`;
      const params = {
        orgName: this.config.orgName,
        userName: this.config.userName,
        password: this.config.password,
        smsid: messageId,
      };

      const response = await this.httpClient.get<string>(url, {
        params,
      });

      // Parse response: [RESPONSE_NO]:[RESPONSE_MESSAGE]:[MESSAGE_ID]
      const responseText = response.data.trim();
      const parts = responseText.split(':');

      if (parts.length < 2) {
        throw new Error(`Invalid response format: ${responseText}`);
      }

      const responseNo = parseInt(parts[0], 10);
      const responseMessage = parts[1];

      const statusMap: Record<number, AlawaelDeliveryStatus['status']> = {
        1: 'SUCCESS',
        2: 'ACCEPTED',
        3: 'UNDELIV',
        4: 'REJECTD',
        5: 'INVALID_AUTH',
        6: 'INVALID_SMS_ID',
      };

      return {
        messageId,
        status: statusMap[responseNo] || 'ACCEPTED',
        deliveredAt: responseNo === 1 ? new Date() : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get delivery status for ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<number | null> {
    try {
      if (!this.config) {
        return null;
      }

      const url = `${this.config.baseUrl}/GroupSMS/api/1.0/rest/balance`;
      const params = {
        o: this.config.orgName,
        u: this.config.userName,
        p: this.config.password,
      };

      const response = await this.httpClient.get<string>(url, {
        params,
      });

      // Parse balance response (assuming it returns a number)
      const balance = parseFloat(response.data);
      if (isNaN(balance)) {
        throw new Error(`Invalid balance response: ${response.data}`);
      }

      return balance;
    } catch (error) {
      this.logger.error('Failed to get account balance:', error);
      return null;
    }
  }

  /**
   * Check if adapter is initialized
   */
  isInitialized(): boolean {
    return this.config !== null;
  }
}

