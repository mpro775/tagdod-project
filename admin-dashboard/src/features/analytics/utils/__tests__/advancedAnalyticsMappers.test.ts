import { describe, it, expect } from 'vitest';
import {
  mapSalesAnalytics,
  mapCustomerAnalytics,
  mapMarketingReport,
  mapRealTimeMetrics,
  mapProductPerformance,
  mapInventoryReport,
  mapFinancialReport,
} from '../advancedAnalyticsMappers';

describe('advancedAnalyticsMappers', () => {
  describe('mapSalesAnalytics', () => {
    it('maps topProducts.name to product', () => {
      const raw = {
        totalRevenue: 1000,
        totalOrders: 10,
        averageOrderValue: 100,
        topProducts: [{ id: '1', name: 'Product A', sales: 5, revenue: 500 }],
      };
      const result = mapSalesAnalytics(raw);
      expect(result.topProducts[0].product).toBe('Product A');
      expect(result.topProducts[0].name).toBe('Product A');
    });

    it('handles missing topProducts as empty array', () => {
      const raw = { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
      const result = mapSalesAnalytics(raw);
      expect(result.topProducts).toEqual([]);
    });
  });

  describe('mapCustomerAnalytics', () => {
    it('returns segments without customerIds', () => {
      const raw = {
        totalCustomers: 100,
        newCustomers: 10,
        activeCustomers: 50,
        customerLifetimeValue: 200,
        customerSegments: [
          { segment: 'VIP', count: 10, percentage: 10, customerIds: ['a', 'b'] },
        ],
        topCustomers: [],
      };
      const result = mapCustomerAnalytics(raw);
      expect(result.customerSegments[0].segment).toBe('VIP');
      expect(result.customerSegments[0].count).toBe(10);
      expect(result.customerSegments[0].percentage).toBe(10);
      expect((result.customerSegments[0] as any).customerIds).toBeUndefined();
    });
  });

  describe('mapMarketingReport', () => {
    it('maps impressions to reach', () => {
      const raw = {
        totalCampaigns: 1,
        activeCampaigns: 1,
        totalCoupons: 0,
        activeCoupons: 0,
        roi: 10,
        conversionRate: 5,
        totalDiscountGiven: 0,
        campaignPerformance: [
          { campaign: 'C1', impressions: 1000, conversions: 50, revenue: 500 },
        ],
        topCoupons: [],
      };
      const result = mapMarketingReport(raw);
      expect(result.campaignPerformance[0].reach).toBe(1000);
      expect(result.campaignPerformance[0].impressions).toBe(1000);
    });
  });

  describe('mapRealTimeMetrics', () => {
    it('maps systemHealth correctly', () => {
      const raw = {
        activeUsers: 5,
        todaySales: 100,
        todayOrders: 2,
        currentRevenue: 100,
        systemHealth: {
          status: 'healthy',
          uptime: 99.9,
          responseTime: 120,
          errorRate: 0.01,
        },
        lastUpdated: '2024-01-01T00:00:00Z',
      };
      const result = mapRealTimeMetrics(raw);
      expect(result.systemHealth.status).toBe('healthy');
      expect(result.systemHealth.uptime).toBe(99.9);
      expect(result.systemHealth.responseTime).toBe(120);
    });

    it('defaults status to unknown when missing', () => {
      const raw = {
        activeUsers: 0,
        todaySales: 0,
        todayOrders: 0,
        systemHealth: {},
        lastUpdated: '2024-01-01T00:00:00Z',
      };
      const result = mapRealTimeMetrics(raw);
      expect(result.systemHealth.status).toBe('unknown');
    });
  });

  describe('mapProductPerformance', () => {
    it('normalizes topProducts fields', () => {
      const raw = {
        totalProducts: 50,
        totalSales: 100,
        averageRating: 4.5,
        topProducts: [{ id: '1', name: 'P1', sales: 10, revenue: 100, rating: 5 }],
        lowStockProducts: [],
        byCategory: [],
      };
      const result = mapProductPerformance(raw);
      expect(result.topProducts[0].name).toBe('P1');
      expect(result.topProducts[0].sales).toBe(10);
    });
  });

  describe('mapInventoryReport', () => {
    it('normalizes movement product names', () => {
      const raw = {
        totalProducts: 100,
        inStock: 80,
        lowStock: 5,
        outOfStock: 15,
        totalValue: 5000,
        movements: [{ date: '2024-01-01', type: 'out', quantity: 2, product: 'P1' }],
        byCategory: [],
      };
      const result = mapInventoryReport(raw);
      expect(result.movements[0].product).toBe('P1');
      expect(result.movements[0].quantity).toBe(2);
    });
  });

  describe('mapFinancialReport', () => {
    it('maps revenue and cashFlow', () => {
      const raw = {
        revenue: 1000,
        cashFlow: [{ date: '2024-01-01', revenue: 500, balance: 500 }],
        revenueBySource: [{ source: 'online', amount: 500, percentage: 50 }],
      };
      const result = mapFinancialReport(raw);
      expect(result.revenue).toBe(1000);
      expect(result.cashFlow[0].balance).toBe(500);
    });
  });
});
