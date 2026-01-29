import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { SMSAdapter } from '../notifications/adapters/sms.adapter';
import {
  EvolutionWhatsAppAdapter,
  EvolutionWhatsAppResult,
} from '../notifications/adapters/evolution-whatsapp.adapter';
import { normalizeYemeniPhone } from '../../shared/utils/phone.util';
import { InvalidPhoneException, AuthException, ErrorCode } from '../../shared/exceptions';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly redis: Redis;
  private readonly ttl: number;
  private readonly length: number;
  private readonly devEcho: boolean;

  constructor(
    @Inject('REDIS_CLIENT') redisClient: Redis,
    @Optional() private readonly smsAdapter?: SMSAdapter,
    @Optional() private readonly whatsAppAdapter?: EvolutionWhatsAppAdapter,
  ) {
    this.redis = redisClient;
    this.ttl = Number(process.env.OTP_TTL_SECONDS || 300);
    this.length = Number(process.env.OTP_LENGTH || 6);
    this.devEcho = (process.env.OTP_DEV_ECHO || 'false') === 'true';
  }
  private key(phone: string, ctx: string) {
    return `otp:${ctx}:${phone}`;
  }
  private genCode(): string {
    const max = Math.pow(10, this.length);
    return Math.floor(Math.random() * max)
      .toString()
      .padStart(this.length, '0');
  }
  private hash(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }
  private isReadOnlyError(error: string | Error): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /READONLY/i.test(message) || /read only/i.test(message);
  }
  private async waitForRedisReady(maxWaitMs: number = 2000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      if (this.redis.status === 'ready') {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return this.redis.status === 'ready';
  }
  private async setWithRetry(key: string, value: string, ttl: number, maxRetries: number = 2): Promise<void> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const waitTime = Math.min(500 * attempt, 1500);
          this.logger.warn(`Retrying Redis write operation (attempt ${attempt + 1}/${maxRetries + 1}) after ${waitTime}ms`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          const isReady = await this.waitForRedisReady(2000);
          if (!isReady) {
            this.logger.warn(`Redis not ready after wait, continuing anyway...`);
          }
        }
        await this.redis.set(key, value, 'EX', ttl);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message;
        if (this.isReadOnlyError(errorMessage)) {
          if (attempt < maxRetries) {
            this.logger.warn(`Redis read-only error on attempt ${attempt + 1}, will retry...`);
            continue;
          }
          this.logger.error(`Failed to store OTP after ${maxRetries + 1} attempts: Redis is in read-only mode. Check REDIS_URL configuration - it should point to a master/primary instance, not a read-only replica.`);
          throw new AuthException(ErrorCode.AUTH_OTP_SEND_FAILED, {
            reason: 'Redis is configured as read-only replica',
            suggestion: 'Please update REDIS_URL to point to a writable Redis instance (master/primary)',
            technicalDetails: 'READONLY You can\'t write against a read only replica.',
          });
        }
        this.logger.error(`Failed to store OTP in Redis (attempt ${attempt + 1}):`, error);
        if (attempt < maxRetries) {
          continue;
        }
        throw error;
      }
    }
    throw lastError || new Error('Failed to store OTP after retries');
  }
  async sendOtp(phone: string, ctx: 'register' | 'reset' = 'register') {
    const code = this.genCode();
    const hashed = this.hash(code);
    
    // Normalize phone number for Yemen (+967)
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeYemeniPhone(phone);
    } catch (error) {
      this.logger.error(`Failed to normalize phone number ${phone}:`, error);
      throw new InvalidPhoneException({
        phone,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Store OTP in Redis using normalized phone with retry logic
    await this.setWithRetry(this.key(normalizedPhone, ctx), hashed, this.ttl);

    const message =
      ctx === 'reset'
        ? `رمز التحقق لإعادة تعيين كلمة المرور في تطبيق تجدد هو: ${code}`
        : `رمز التحقق الخاص بك في تطبيق تجدد هو: ${code}`;

    // 1. Try WhatsApp first (Evolution API) if adapter is available
    let waResult: EvolutionWhatsAppResult | null = null;
    if (this.whatsAppAdapter?.isReady()) {
      this.logger.log(`Attempting to send OTP via WhatsApp to ${normalizedPhone}`);
      waResult = await this.whatsAppAdapter.sendMessage(normalizedPhone, message);
      if (waResult.success) {
        this.logger.log(`OTP sent via WhatsApp successfully to ${normalizedPhone}`);
      } else {
        this.logger.warn(
          `WhatsApp failed for ${normalizedPhone}: ${waResult.error}. Falling back to SMS.`,
        );
      }
    } else {
      this.logger.debug('WhatsApp adapter not configured or not ready, skipping.');
    }

    // 2. Fallback to SMS if WhatsApp failed or wasn't used
    if (!waResult?.success && this.smsAdapter) {
      try {
        this.logger.log(`Sending OTP via SMS to ${normalizedPhone}`);
        const smsResult = await this.smsAdapter.sendSMS({
          to: normalizedPhone,
          message,
        });
        if (smsResult.success) {
          this.logger.log(`OTP SMS sent successfully to ${normalizedPhone}`);
        } else {
          this.logger.warn(`Failed to send OTP SMS to ${normalizedPhone}: ${smsResult.error}`);
        }
      } catch (error) {
        this.logger.error(`Error sending OTP SMS to ${normalizedPhone}:`, error);
      }
    } else if (!waResult?.success && !this.smsAdapter) {
      this.logger.warn('Neither WhatsApp nor SMS adapter available, OTP not sent.');
    }

    return { sent: true, devCode: this.devEcho ? code : undefined };
  }
  async verifyOtp(phone: string, code: string, ctx: 'register' | 'reset' = 'register') {
    // Normalize phone number for verification
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeYemeniPhone(phone);
    } catch (error) {
      this.logger.error(`Failed to normalize phone number ${phone}:`, error);
      return false;
    }

    try {
      const value = await this.redis.get(this.key(normalizedPhone, ctx));
      if (!value) return false;
      const ok = value === this.hash(code);
      if (ok) {
        try {
          await this.redis.del(this.key(normalizedPhone, ctx));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (this.isReadOnlyError(errorMessage)) {
            this.logger.warn(`Failed to delete OTP after verification: Redis is in read-only mode. OTP was verified but not deleted. This is non-critical.`);
          } else {
            this.logger.warn(`Failed to delete OTP after verification (non-critical):`, error);
          }
        }
      }
      return ok;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (this.isReadOnlyError(errorMessage)) {
        this.logger.error(`Failed to verify OTP: Redis is in read-only mode. Cannot read from replica.`);
      } else {
        this.logger.error(`Failed to verify OTP:`, error);
      }
      return false;
    }
  }
}
