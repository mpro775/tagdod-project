import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import Redis from 'ioredis';

// Mock Redis
jest.mock('ioredis');

describe('OtpService', () => {
  let service: OtpService;
  let redisMock: jest.Mocked<Redis>;

  beforeEach(async () => {
    // Reset environment variables
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.OTP_TTL_SECONDS = '300';
    process.env.OTP_LENGTH = '6';
    process.env.OTP_DEV_ECHO = 'true';

    // Create Redis mock
    redisMock = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<Redis>;

    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => redisMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should send OTP and store hashed value in Redis', async () => {
      const phone = '+966501234567';
      const result = await service.sendOtp(phone, 'register');

      expect(result.sent).toBe(true);
      expect(result.devCode).toBeDefined();
      expect(result.devCode).toHaveLength(6);
      expect(redisMock.set).toHaveBeenCalledWith(
        `otp:register:${phone}`,
        expect.any(String), // hashed code
        'EX',
        300,
      );
    });

    it('should send OTP for reset context', async () => {
      const phone = '+966501234567';
      const result = await service.sendOtp(phone, 'reset');

      expect(result.sent).toBe(true);
      expect(redisMock.set).toHaveBeenCalledWith(
        `otp:reset:${phone}`,
        expect.any(String),
        'EX',
        300,
      );
    });

    it('should not return devCode when OTP_DEV_ECHO is false', async () => {
      process.env.OTP_DEV_ECHO = 'false';
      
      // Re-create service with new env
      const module: TestingModule = await Test.createTestingModule({
        providers: [OtpService],
      }).compile();
      service = module.get<OtpService>(OtpService);

      const result = await service.sendOtp('+966501234567', 'register');

      expect(result.sent).toBe(true);
      expect(result.devCode).toBeUndefined();
    });
  });

  describe('verifyOtp', () => {
    it('should verify correct OTP', async () => {
      const phone = '+966501234567';
      
      // First send OTP to get the code
      const sendResult = await service.sendOtp(phone, 'register');
      const code = sendResult.devCode!;

      // Get the stored hash
      const storedHash = (redisMock.set as jest.Mock).mock.calls[0][1];
      
      // Mock Redis to return the stored hash
      redisMock.get.mockResolvedValue(storedHash);

      // Verify OTP
      const result = await service.verifyOtp(phone, code, 'register');

      expect(result).toBe(true);
      expect(redisMock.get).toHaveBeenCalledWith(`otp:register:${phone}`);
      expect(redisMock.del).toHaveBeenCalledWith(`otp:register:${phone}`);
    });

    it('should reject incorrect OTP', async () => {
      const phone = '+966501234567';
      
      // Mock Redis to return a different hash
      redisMock.get.mockResolvedValue('different_hash');

      const result = await service.verifyOtp(phone, '123456', 'register');

      expect(result).toBe(false);
      expect(redisMock.del).not.toHaveBeenCalled();
    });

    it('should reject when OTP not found', async () => {
      redisMock.get.mockResolvedValue(null);

      const result = await service.verifyOtp('+966501234567', '123456', 'register');

      expect(result).toBe(false);
      expect(redisMock.del).not.toHaveBeenCalled();
    });

    it('should delete OTP after successful verification', async () => {
      const phone = '+966501234567';
      const sendResult = await service.sendOtp(phone, 'register');
      const code = sendResult.devCode!;
      const storedHash = (redisMock.set as jest.Mock).mock.calls[0][1];
      
      redisMock.get.mockResolvedValue(storedHash);

      await service.verifyOtp(phone, code, 'register');

      expect(redisMock.del).toHaveBeenCalledWith(`otp:register:${phone}`);
    });
  });

  describe('OTP Configuration', () => {
    it('should use custom OTP length from environment', async () => {
      process.env.OTP_LENGTH = '4';
      
      const module: TestingModule = await Test.createTestingModule({
        providers: [OtpService],
      }).compile();
      service = module.get<OtpService>(OtpService);

      const result = await service.sendOtp('+966501234567', 'register');

      expect(result.devCode).toHaveLength(4);
    });

    it('should use custom TTL from environment', async () => {
      process.env.OTP_TTL_SECONDS = '600';
      
      const module: TestingModule = await Test.createTestingModule({
        providers: [OtpService],
      }).compile();
      service = module.get<OtpService>(OtpService);

      await service.sendOtp('+966501234567', 'register');

      expect(redisMock.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'EX',
        600,
      );
    });
  });
});

