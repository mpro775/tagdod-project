import { asArray, toNumber } from './analyticsDataGuards';

export interface MappedDashboardData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    totalOrders: number;
    activeServices: number;
    openSupportTickets: number;
    systemHealth: null | {
      status: 'healthy' | 'warning' | 'critical' | 'unknown';
      score?: number | null;
      uptime?: number;
      responseTime?: number;
      errorRate?: number;
      lastCheckedAt?: string;
    };
  };
  kpis: {
    revenueGrowth: number;
    customerSatisfaction: number;
    orderConversion: number;
    serviceEfficiency: number;
    supportResolution: number;
    systemUptime: number;
  };
  revenueDaily: Array<{ date: string; revenue: number; orders: number }>;
  revenueMonthly: Array<{ month: string; date: string; revenue: number; growth: number }>;
  revenueByCategory: Array<any>;
  userRegistrationTrend: Array<{ date: string; newUsers: number; activeUsers: number }>;
  userTypes: Array<{ type: string; name: string; count: number; value: number; percentage: number }>;
  geographic: Array<any>;
  topProducts: Array<{ name: string; product: string; sold: number; sales: number; revenue: number }>;
  categoryPerformance: Array<any>;
  stockAlerts: Array<any>;
  serviceRequests: Array<{ date: string; requests: number; completed: number }>;
  engineerPerformance: Array<any>;
  responseTimes: { average: number; target: number; trend: Array<{ index: number; value: number; hours: number }> };
  supportTickets: Array<{ date: string; new: number; newTickets: number; resolved: number }>;
  supportCategories: Array<{ category: string; name: string; count: number; value: number; avgResolutionTime: number }>;
  agentPerformance: Array<any>;
  raw: any;
}

export const mapAnalyticsDashboard = (data: any): MappedDashboardData => {
  const overview = data?.overview ?? {};
  const kpis = data?.kpis ?? {};

  return {
    overview: {
      totalUsers: toNumber(overview.totalUsers),
      totalRevenue: toNumber(overview.totalRevenue),
      totalOrders: toNumber(overview.totalOrders),
      activeServices: toNumber(overview.activeServices),
      openSupportTickets: toNumber(overview.openSupportTickets),
      systemHealth: overview.systemHealth === null || overview.systemHealth === undefined
        ? null
        : {
            status: overview.systemHealth.status ?? 'unknown',
            score: toNumber(overview.systemHealth.score),
            uptime: toNumber(overview.systemHealth.uptime),
            responseTime: toNumber(overview.systemHealth.responseTime),
            errorRate: toNumber(overview.systemHealth.errorRate),
            lastCheckedAt: overview.systemHealth.lastCheckedAt,
          },
    },

    kpis: {
      revenueGrowth: toNumber(kpis.revenueGrowth),
      customerSatisfaction: toNumber(kpis.customerSatisfaction),
      orderConversion: toNumber(kpis.orderConversion),
      serviceEfficiency: toNumber(kpis.serviceEfficiency),
      supportResolution: toNumber(kpis.supportResolution),
      systemUptime: toNumber(kpis.systemUptime),
    },

    revenueDaily: asArray<any>(data?.revenueCharts?.daily).map((item) => ({
      date: item.date,
      revenue: toNumber(item.revenue),
      orders: toNumber(item.orders),
    })),

    revenueMonthly: asArray<any>(data?.revenueCharts?.monthly).map((item) => ({
      month: item.month,
      date: item.month,
      revenue: toNumber(item.revenue),
      growth: toNumber(item.growth),
    })),

    revenueByCategory: asArray<any>(data?.revenueCharts?.byCategory),

    userRegistrationTrend: asArray<any>(data?.userCharts?.registrationTrend).map((item) => ({
      date: item.date,
      newUsers: toNumber(item.newUsers),
      activeUsers: toNumber(item.activeUsers),
    })),

    userTypes: asArray<any>(data?.userCharts?.userTypes).map((item) => ({
      type: item.type,
      name: item.type,
      count: toNumber(item.count),
      value: toNumber(item.count),
      percentage: toNumber(item.percentage),
    })),

    geographic: asArray<any>(data?.userCharts?.geographic),

    topProducts: asArray<any>(data?.productCharts?.topSelling).map((item) => ({
      name: item.name ?? item.product ?? 'غير معروف',
      product: item.product ?? item.name ?? 'غير معروف',
      sold: toNumber(item.sold ?? item.sales),
      sales: toNumber(item.sales ?? item.sold),
      revenue: toNumber(item.revenue),
    })),

    categoryPerformance: asArray<any>(data?.productCharts?.categoryPerformance),
    stockAlerts: asArray<any>(data?.productCharts?.stockAlerts),

    serviceRequests: asArray<any>(data?.serviceCharts?.requestTrend).map((item) => ({
      date: item.date,
      requests: toNumber(item.requests),
      completed: toNumber(item.completed),
    })),

    engineerPerformance: asArray<any>(data?.serviceCharts?.engineerPerformance),

    responseTimes: {
      average: toNumber(data?.serviceCharts?.responseTimes?.average),
      target: toNumber(data?.serviceCharts?.responseTimes?.target),
      trend: asArray<any>(data?.serviceCharts?.responseTimes?.trend).map((value, index) => ({
        index: index + 1,
        value: toNumber(value),
        hours: toNumber(value),
      })),
    },

    supportTickets: asArray<any>(data?.supportCharts?.ticketTrend).map((item) => ({
      date: item.date,
      new: toNumber(item.new),
      newTickets: toNumber(item.new),
      resolved: toNumber(item.resolved),
    })),

    supportCategories: asArray<any>(data?.supportCharts?.categoryBreakdown).map((item) => ({
      category: item.category,
      name: item.category,
      count: toNumber(item.count),
      value: toNumber(item.count),
      avgResolutionTime: toNumber(item.avgResolutionTime),
    })),

    agentPerformance: asArray<any>(data?.supportCharts?.agentPerformance),

    raw: data,
  };
};
