import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface EvolutionWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * WhatsApp Adapter for Evolution API
 * يرسل رسائل واتساب عبر Evolution API (بدون Twilio).
 * الرقم المتوقع: 967XXXXXXXXX (بدون +)
 */
@Injectable()
export class EvolutionWhatsAppAdapter {
  private readonly logger = new Logger(EvolutionWhatsAppAdapter.name);
  private readonly baseUrl: string;
  private readonly instanceName: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = (this.configService.get('WA_BASE_URL') || '').replace(/\/$/, '');
    this.instanceName = this.configService.get('WA_INSTANCE_NAME') || '';
    this.apiKey = this.configService.get('WA_API_KEY') || '';
  }

  /**
   * التحقق من أن الـ Adapter مهيأ (Evolution API مُعدة).
   */
  isReady(): boolean {
    return !!(this.baseUrl && this.instanceName && this.apiKey);
  }

  /**
   * إرسال رسالة واتساب عبر Evolution API.
   * @param to - الرقم بصيغة 967XXXXXXXXX (بدون +)
   * @param message - نص الرسالة
   */
  async sendMessage(to: string, message: string): Promise<EvolutionWhatsAppResult> {
    if (!this.isReady()) {
      this.logger.warn('Evolution WhatsApp adapter not configured (WA_BASE_URL, WA_INSTANCE_NAME, WA_API_KEY)');
      return { success: false, error: 'Evolution WhatsApp not configured' };
    }

    const phone = to.startsWith('+') ? to.replace('+', '') : to;
    const url = `${this.baseUrl}/message/sendText/${this.instanceName}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            number: phone,
            textMessage: { text: message },
          },
          {
            headers: { apikey: this.apiKey },
            timeout: 15000,
          },
        ),
      );
      const data = response?.data;
      const messageId = data?.key?.id ?? data?.id;
      this.logger.log(`Evolution WhatsApp sent to ${phone}: ${messageId || 'ok'}`);
      return { success: true, messageId };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message ?? err?.message ?? String(error);
      this.logger.error(`Evolution API Error for ${phone}: ${msg}`);
      return { success: false, error: msg };
    }
  }
}
