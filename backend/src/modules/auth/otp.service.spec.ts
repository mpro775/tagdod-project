import Redis from 'ioredis';
import { OtpService } from './otp.service';
import { SMSAdapter } from '../notifications/adapters/sms.adapter';

describe('OtpService', () => {
  const originalEnv = { ...process.env };
  const validPhone = '+967771234567';

  let service: OtpService;
  let redisMock: {
    status: string;
    set: jest.Mock;
    get: jest.Mock;
    del: jest.Mock;
  };
  let smsAdapterMock: {
    sendSMS: jest.Mock;
  };

  const createService = () => {
    service = new OtpService(
      redisMock as unknown as Redis,
      smsAdapterMock as unknown as SMSAdapter,
    );
  };

  const getLastSmsMessage = (): string => {
    const smsCalls = smsAdapterMock.sendSMS.mock.calls;
    return smsCalls[smsCalls.length - 1][0].message;
  };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      OTP_TTL_SECONDS: '300',
      OTP_LENGTH: '6',
      OTP_DEV_ECHO: 'true',
      ANDROID_SMS_APP_HASH_DEBUG: 'FA+9qCX9VSu',
      ANDROID_SMS_APP_HASH_RELEASE: 'A1b2C3d4E5F',
    };

    redisMock = {
      status: 'ready',
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
    };

    smsAdapterMock = {
      sendSMS: jest.fn().mockResolvedValue({ success: true }),
    };

    createService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  describe('sendOtp', () => {
    it('formats register OTP SMS for Android SMS Retriever', async () => {
      const result = await service.sendOtp(validPhone, 'register');
      const smsMessage = getLastSmsMessage();

      expect(result.sent).toBe(true);
      expect(result.devCode).toMatch(/^\d{6}$/);
      expect(redisMock.set).toHaveBeenCalledWith(
        `otp:register:${validPhone}`,
        expect.any(String),
        'EX',
        300,
      );
      expect(smsAdapterMock.sendSMS).toHaveBeenCalledWith({
        to: validPhone,
        message: smsMessage,
      });

      expect(smsMessage.startsWith('<#> ')).toBe(true);
      expect(smsMessage.endsWith(`\n${process.env.ANDROID_SMS_APP_HASH_DEBUG}`)).toBe(true);
      expect((smsMessage.match(/\d{6}/g) || []).length).toBe(1);
    });

    it('formats reset OTP SMS for Android SMS Retriever', async () => {
      await service.sendOtp(validPhone, 'reset');
      const smsMessage = getLastSmsMessage();

      expect(smsMessage).toContain('إعادة تعيين كلمة المرور');
      expect(smsMessage.startsWith('<#> ')).toBe(true);
      expect(smsMessage.endsWith(`\n${process.env.ANDROID_SMS_APP_HASH_DEBUG}`)).toBe(true);
      expect((smsMessage.match(/\d{6}/g) || []).length).toBe(1);
    });

    it('uses release app hash in production', async () => {
      process.env.NODE_ENV = 'production';
      createService();

      await service.sendOtp(validPhone, 'register');
      const smsMessage = getLastSmsMessage();

      expect(smsMessage.endsWith(`\n${process.env.ANDROID_SMS_APP_HASH_RELEASE}`)).toBe(true);
    });

    it('falls back to plain SMS when app hash is missing', async () => {
      delete process.env.ANDROID_SMS_APP_HASH_DEBUG;
      delete process.env.ANDROID_SMS_APP_HASH_RELEASE;
      createService();

      await service.sendOtp(validPhone, 'register');
      const smsMessage = getLastSmsMessage();

      expect(smsMessage.startsWith('<#> ')).toBe(false);
      expect((smsMessage.match(/\d{6}/g) || []).length).toBe(1);
    });

    it('does not return devCode when OTP_DEV_ECHO is false', async () => {
      process.env.OTP_DEV_ECHO = 'false';
      createService();

      const result = await service.sendOtp(validPhone, 'register');

      expect(result.sent).toBe(true);
      expect(result.devCode).toBeUndefined();
    });
  });

  describe('verifyOtp', () => {
    it('verifies correct OTP and deletes it from Redis', async () => {
      const sendResult = await service.sendOtp(validPhone, 'register');
      const code = sendResult.devCode as string;
      const storedHash = redisMock.set.mock.calls[0][1];

      redisMock.get.mockResolvedValue(storedHash);

      const isValid = await service.verifyOtp(validPhone, code, 'register');

      expect(isValid).toBe(true);
      expect(redisMock.get).toHaveBeenCalledWith(`otp:register:${validPhone}`);
      expect(redisMock.del).toHaveBeenCalledWith(`otp:register:${validPhone}`);
    });
  });
});
