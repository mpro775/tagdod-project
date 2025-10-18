import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users Management (E2E)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Get admin token for protected routes
    // In real scenario, this would be obtained through proper login
    adminToken = 'mock-admin-token';
    userToken = 'mock-user-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /admin/users', () => {
    it('should list users with pagination (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should filter users by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'active', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search users by phone or name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: '967', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .expect(401);
    });

    it('should reject non-admin access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should get user details by ID (admin only)', async () => {
      const userId = '507f1f77bcf86cd799439011'; // Mock ObjectId
      
      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id', userId);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      
      await request(app.getHttpServer())
        .get(`/api/v1/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('POST /admin/users', () => {
    it('should create new user (admin only)', async () => {
      const newUser = {
        phone: '+967987654321',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
        status: 'active'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('phone', newUser.phone);
    });

    it('should reject invalid user data', async () => {
      const invalidUser = {
        phone: 'invalid-phone',
        firstName: '',
        role: 'invalid-role'
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('should update user (admin only)', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        status: 'suspended'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('firstName', updateData.firstName);
    });

    it('should handle partial updates', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const partialUpdate = {
        status: 'active'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /admin/users/:id/suspend', () => {
    it('should suspend user (admin only)', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const suspendData = {
        reason: 'Violation of terms',
        duration: 7 // days
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${userId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(suspendData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'suspended');
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete user (admin only)', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /users/analytics', () => {
    it('should get user analytics (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('newUsers');
    });

    it('should filter analytics by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });
});
