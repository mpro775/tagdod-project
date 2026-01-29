import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// واجهة موحدة للنتيجة (نفس القديمة لكي لا نكسر الكود)
export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class WahaWhatsAppAdapter {
  private readonly logger = new Logger(WahaWhatsAppAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly sessionName: string = 'default'; // اسم الجلسة في WAHA

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // نستخدم الرابط الداخلي في دوكر للسرعة
    this.baseUrl = (this.configService.get('WAHA_BASE_URL') || 'http://tagdod-waha:3000').replace(/\/$/, '');
    this.apiKey = this.configService.get('WAHA_API_KEY') || '';
  }

  isReady(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  async sendMessage(to: string, message: string): Promise<WhatsAppResult> {
    if (!this.isReady()) {
      this.logger.warn('WAHA adapter not configured (WAHA_BASE_URL, WAHA_API_KEY)');
      return { success: false, error: 'Configuration missing' };
    }

    // WAHA يتطلب إضافة @c.us للأرقام الشخصية
    // الرقم يدخل بصيغة 96777xxxxxx ونحوله إلى 96777xxxxxx@c.us
    const cleanPhone = to.startsWith('+') ? to.replace('+', '') : to;
    const chatId = `${cleanPhone}@c.us`;

    const url = `${this.baseUrl}/api/sendText`;

    const payload = {
      session: this.sessionName,
      chatId: chatId,
      text: message,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'X-Api-Key': this.apiKey, // المفتاح في الهيدر
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );

      // WAHA يعيد id الرسالة في الرد
      const messageId = response.data?.id || 'sent';
      this.logger.log(`WAHA sent to ${cleanPhone}: ${messageId}`);
      return { success: true, messageId };
    } catch (error: any) {
      const errorMsg = error.response?.data?.description || error.message;
      this.logger.error(`WAHA Error for ${cleanPhone}: ${errorMsg}`);
      
      // هنا نتحقق إذا كانت الجلسة مفصولة لنعرف السبب
      if (error.response?.status === 404) {
          return { success: false, error: 'Session not found or disconnected' };
      }
      return { success: false, error: errorMsg };
    }
  }
}