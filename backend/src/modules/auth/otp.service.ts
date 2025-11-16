import { Injectable, Logger, Optional } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { SMSAdapter } from '../notifications/adapters/sms.adapter';
import { normalizeYemeniPhone } from '../../shared/utils/phone.util';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private redis: Redis;
  private ttl: number;
  private length: number;
  private devEcho: boolean;

  constructor(@Optional() private readonly smsAdapter?: SMSAdapter) {
    this.redis = new Redis(process.env.REDIS_URL as string);
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
  async sendOtp(phone: string, ctx: 'register' | 'reset' = 'register') {
    const code = this.genCode();
    const hashed = this.hash(code);
    
    // Normalize phone number for Yemen (+967)
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeYemeniPhone(phone);
    } catch (error) {
      this.logger.error(`Failed to normalize phone number ${phone}:`, error);
      throw error;
    }

    // Store OTP in Redis using normalized phone
    await this.redis.set(this.key(normalizedPhone, ctx), hashed, 'EX', this.ttl);

    // Send OTP via SMS if SMS adapter is available
    if (this.smsAdapter) {
      try {
        const smsMessage = ctx === 'reset' 
          ? `رمز التحقق لإعادة تعيين كلمة المرور: ${code}`
          : `رمز التحقق لتسجيل الدخول: ${code}`;
        
        const smsResult = await this.smsAdapter.sendSMS({
          to: normalizedPhone,
          message: smsMessage,
        });

        if (smsResult.success) {
          this.logger.log(`OTP SMS sent successfully to ${normalizedPhone}`);
        } else {
          this.logger.warn(`Failed to send OTP SMS to ${normalizedPhone}: ${smsResult.error}`);
          // Continue anyway - OTP is stored in Redis, user can still verify
        }
      } catch (error) {
        this.logger.error(`Error sending OTP SMS to ${normalizedPhone}:`, error);
        // Continue anyway - OTP is stored in Redis, user can still verify
      }
    } else {
      this.logger.warn('SMS adapter not available, OTP not sent via SMS');
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

    const value = await this.redis.get(this.key(normalizedPhone, ctx));
    if (!value) return false;
    const ok = value === this.hash(code);
    if (ok) await this.redis.del(this.key(normalizedPhone, ctx));
    return ok;
  }
}
