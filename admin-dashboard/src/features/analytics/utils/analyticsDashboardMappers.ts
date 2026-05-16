import { asArray, toNumber } from './analyticsDataGuards';

export const mapAnalyticsDashboard = (data: any) => {
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
        : toNumber(overview.systemHealth),
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
