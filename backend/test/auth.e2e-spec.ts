import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/send-otp', () => {
    it('should send OTP to valid phone number', async () => {
      const phoneNumber = '+967123456789';
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({ phone: phoneNumber })
        .expect(201);

      expect(response.body).toHaveProperty('sent', true);
      expect(response.body).toHaveProperty('devCode');
    });

    it('should reject invalid phone number format', async () => {
      const invalidPhone = 'invalid-phone';
      
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({ phone: invalidPhone })
        .expect(400);
    });

    it('should handle missing phone number', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should verify valid OTP', async () => {
      const phoneNumber = '+967123456789';
      const otpCode = '123456'; // This would be the actual OTP in real scenario
      
      // First send OTP
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({ phone: phoneNumber });

      // Then verify OTP
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ 
          phone: phoneNumber, 
          code: otpCode 
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid OTP', async () => {
      const phoneNumber = '+967123456789';
      const invalidOtp = '000000';
      
      await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ 
          phone: phoneNumber, 
          code: invalidOtp 
        })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // This would require a valid refresh token from previous login
      const refreshToken = 'valid-refresh-token';
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject invalid refresh token', async () => {
      const invalidRefreshToken = 'invalid-token';
      
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: invalidRefreshToken })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const accessToken = 'valid-access-token';
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should handle logout without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset OTP', async () => {
      const phoneNumber = '+967123456789';
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ phone: phoneNumber })
        .expect(201);

      expect(response.body).toHaveProperty('sent', true);
    });
  });

  describe('POST /auth/set-password', () => {
    it('should set new password with valid OTP', async () => {
      const phoneNumber = '+967123456789';
      const otpCode = '123456';
      const newPassword = 'newSecurePassword123';
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/set-password')
        .send({ 
          phone: phoneNumber,
          code: otpCode,
          password: newPassword
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject weak password', async () => {
      const phoneNumber = '+967123456789';
      const otpCode = '123456';
      const weakPassword = '123';
      
      await request(app.getHttpServer())
        .post('/api/v1/auth/set-password')
        .send({ 
          phone: phoneNumber,
          code: otpCode,
          password: weakPassword
        })
        .expect(400);
    });
  });
});
