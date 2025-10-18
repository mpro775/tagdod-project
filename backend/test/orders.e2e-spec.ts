import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders Management (E2E)', () => {
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

    // Mock tokens for authentication
    adminToken = 'mock-admin-token';
    userToken = 'mock-user-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /checkout/preview', () => {
    it('should preview checkout with valid data', async () => {
      const checkoutData = {
        currency: 'USD'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/checkout/preview')
        .set('Authorization', `Bearer ${userToken}`)
        .send(checkoutData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('subtotal');
      expect(response.body.data).toHaveProperty('total');
    });

    it('should handle different currencies', async () => {
      const checkoutData = {
        currency: 'YER'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/checkout/preview')
        .set('Authorization', `Bearer ${userToken}`)
        .send(checkoutData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('currency', 'YER');
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/checkout/preview')
        .send({ currency: 'USD' })
        .expect(401);
    });
  });

  describe('POST /checkout/confirm', () => {
    it('should confirm checkout and create order', async () => {
      const checkoutData = {
        currency: 'USD',
        paymentMethod: 'card',
        shippingAddress: {
          street: '123 Main St',
          city: 'Sanaa',
          country: 'Yemen'
        }
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/checkout/confirm')
        .set('Authorization', `Bearer ${userToken}`)
        .send(checkoutData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('total');
    });

    it('should handle payment processing', async () => {
      const checkoutData = {
        currency: 'USD',
        paymentMethod: 'card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123'
        },
        shippingAddress: {
          street: '123 Main St',
          city: 'Sanaa',
          country: 'Yemen'
        }
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/checkout/confirm')
        .set('Authorization', `Bearer ${userToken}`)
        .send(checkoutData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('paymentStatus');
    });

    it('should reject invalid payment data', async () => {
      const invalidCheckoutData = {
        currency: 'USD',
        paymentMethod: 'card',
        paymentDetails: {
          cardNumber: 'invalid',
          expiryDate: 'invalid',
          cvv: 'invalid'
        }
      };

      await request(app.getHttpServer())
        .post('/api/v1/checkout/confirm')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidCheckoutData)
        .expect(400);
    });
  });

  describe('GET /orders/my', () => {
    it('should get user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders/my')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter orders by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders/my')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ status: 'pending', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/orders/my')
        .expect(401);
    });
  });

  describe('GET /orders/:id', () => {
    it('should get specific order details', async () => {
      const orderId = '507f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id', orderId);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent order', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      await request(app.getHttpServer())
        .get(`/api/v1/orders/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /orders/:id/cancel', () => {
    it('should cancel pending order', async () => {
      const orderId = '507f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'cancelled');
    });

    it('should reject cancellation of completed order', async () => {
      const completedOrderId = '507f1f77bcf86cd799439012';

      await request(app.getHttpServer())
        .post(`/api/v1/orders/${completedOrderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('GET /admin/orders', () => {
    it('should list all orders (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter orders by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'pending', page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should filter orders by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ 
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          page: 1, 
          limit: 10 
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should reject non-admin access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PATCH /admin/orders/:id/status', () => {
    it('should update order status (admin only)', async () => {
      const orderId = '507f1f77bcf86cd799439011';
      const statusUpdate = {
        status: 'processing',
        notes: 'Order is being processed'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', statusUpdate.status);
    });

    it('should handle order completion', async () => {
      const orderId = '507f1f77bcf86cd799439011';
      const completionData = {
        status: 'completed',
        trackingNumber: 'TRK123456789',
        notes: 'Order delivered successfully'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(completionData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'completed');
      expect(response.body.data).toHaveProperty('trackingNumber');
    });
  });

  describe('GET /orders/analytics', () => {
    it('should get order analytics (admin only)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('averageOrderValue');
    });

    it('should filter analytics by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders/analytics')
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
