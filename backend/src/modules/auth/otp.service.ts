import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';
@Injectable()
export class OtpService {
  private redis: Redis;
  private ttl: number;
  private length: number;
  private devEcho: boolean;
  constructor() {
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
    await this.redis.set(this.key(phone, ctx), hashed, 'EX', this.ttl);
    return { sent: true, devCode: this.devEcho ? code : undefined };
  }
  async verifyOtp(phone: string, code: string, ctx: 'register' | 'reset' = 'register') {
    const value = await this.redis.get(this.key(phone, ctx));
    if (!value) return false;
    const ok = value === this.hash(code);
    if (ok) await this.redis.del(this.key(phone, ctx));
    return ok;
  }
}
