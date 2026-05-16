import { asArray, toNumber, toStringValue } from './analyticsDataGuards';

export const mapSalesAnalytics = (data: any) => ({
  totalRevenue: toNumber(data?.totalRevenue),
  totalOrders: toNumber(data?.totalOrders),
  averageOrderValue: toNumber(data?.averageOrderValue),
  salesGrowth: toNumber(data?.salesGrowth),
  revenueGrowth: toNumber(data?.revenueGrowth),
  ordersGrowth: toNumber(data?.ordersGrowth),

  salesByDate: asArray<any>(data?.salesByDate).map((item) => ({
    date: item.date,
    revenue: toNumber(item.revenue),
    orders: toNumber(item.orders),
  })),

  salesByCategory: asArray<any>(data?.salesByCategory),
  salesByPaymentMethod: asArray<any>(data?.salesByPaymentMethod).map((item) => ({
    method: item.method,
    amount: toNumber(item.amount),
    count: toNumber(item.count),
  })),

  topProducts: asArray<any>(data?.topProducts).map((item) => ({
    id: item.id,
    product: item.product ?? item.name ?? 'غير معروف',
    name: item.name ?? item.product ?? 'غير معروف',
    sales: toNumber(item.sales ?? item.sold),
    sold: toNumber(item.sold ?? item.sales),
    revenue: toNumber(item.revenue),
  })),
});

export const mapFinancialReport = (data: any) => ({
  revenue: toNumber(data?.revenue ?? data?.totalRevenue),
  revenueGrowth: toNumber(data?.revenueGrowth),

  cashFlow: asArray<any>(data?.cashFlow).map((item) => ({
    date: item.date,
    revenue: toNumber(item.revenue),
    balance: toNumber(item.balance),
  })),

  revenueBySource: asArray<any>(data?.revenueBySource).map((item) => ({
    source: item.source,
    amount: toNumber(item.amount),
    percentage: toNumber(item.percentage),
  })),
});

export const mapInventoryReport = (data: any) => ({
  totalProducts: toNumber(data?.totalProducts),
  inStock: toNumber(data?.inStock),
  lowStock: toNumber(data?.lowStock),
  outOfStock: toNumber(data?.outOfStock),
  totalValue: toNumber(data?.totalValue),

  totalProductsGrowth: toNumber(data?.totalProductsGrowth),
  inStockGrowth: toNumber(data?.inStockGrowth),
  outOfStockGrowth: toNumber(data?.outOfStockGrowth),
  totalValueGrowth: toNumber(data?.totalValueGrowth),

  byCategory: asArray<any>(data?.byCategory),
  movements: asArray<any>(data?.movements).map((item) => ({
    date: item.date,
    type: item.type,
    quantity: toNumber(item.quantity),
    product: item.product ?? 'غير معروف',
  })),
});

export const mapMarketingReport = (data: any) => ({
  totalCampaigns: toNumber(data?.totalCampaigns),
  activeCampaigns: toNumber(data?.activeCampaigns),
  totalCoupons: toNumber(data?.totalCoupons),
  activeCoupons: toNumber(data?.activeCoupons),
  roi: toNumber(data?.roi),
  conversionRate: toNumber(data?.conversionRate),
  totalDiscountGiven: toNumber(data?.totalDiscountGiven),

  totalCouponsGrowth: toNumber(data?.totalCouponsGrowth),
  totalDiscountGrowth: toNumber(data?.totalDiscountGrowth),
  roiGrowth: toNumber(data?.roiGrowth),
  conversionRateGrowth: toNumber(data?.conversionRateGrowth),

  campaignPerformance: asArray<any>(data?.campaignPerformance).map((item) => ({
    campaignId: item.campaignId,
    campaign: item.campaign ?? item.name ?? 'حملة غير معروفة',
    name: item.name ?? item.campaign ?? 'حملة غير معروفة',
    reach: toNumber(item.reach ?? item.impressions),
    impressions: toNumber(item.impressions ?? item.reach),
    clicks: toNumber(item.clicks),
    conversions: toNumber(item.conversions),
    cost: toNumber(item.cost),
    revenue: toNumber(item.revenue),
    roi: toNumber(item.roi),
  })),

  topCoupons: asArray<any>(data?.topCoupons).map((item) => ({
    code: item.code,
    uses: toNumber(item.uses),
    revenue: toNumber(item.revenue),
    discount: toNumber(item.discount),
  })),
});

export const mapRealTimeMetrics = (data: any) => ({
  activeUsers: toNumber(data?.activeUsers),
  todaySales: toNumber(data?.todaySales),
  todayOrders: toNumber(data?.todayOrders),
  currentRevenue: toNumber(data?.currentRevenue),

  monthSales: toNumber(data?.monthSales ?? data?.currentRevenue),
  todayNewCustomers: toNumber(data?.todayNewCustomers),
  activeOrders: toNumber(data?.activeOrders),
  pendingOrders: toNumber(data?.pendingOrders),
  todayAbandonedCarts: toNumber(data?.todayAbandonedCarts),
  lowStockAlerts: toNumber(data?.lowStockAlerts),
  pendingSupportTickets: toNumber(data?.pendingSupportTickets),


  activeConnections: toNumber(data?.activeConnections),

  systemHealth: {
    status: toStringValue(data?.systemHealth?.status, 'unknown'),
    uptime: toNumber(data?.systemHealth?.uptime),
    responseTime: toNumber(data?.systemHealth?.responseTime ?? data?.systemHealth?.apiResponseTime),
    errorRate: toNumber(data?.systemHealth?.errorRate),
  },

  lastUpdated: data?.lastUpdated ?? new Date().toISOString(),
});

export const mapProductPerformance = (data: any) => ({
  totalProducts: toNumber(data?.totalProducts),
  totalSales: toNumber(data?.totalSales),
  averageRating: toNumber(data?.averageRating),
  totalProductsGrowth: toNumber(data?.totalProductsGrowth),
  totalSalesGrowth: toNumber(data?.totalSalesGrowth),
  averageRatingGrowth: toNumber(data?.averageRatingGrowth),
  lowStockGrowth: toNumber(data?.lowStockGrowth),
  topProducts: asArray<any>(data?.topProducts).map((item) => ({
    id: item.id,
    name: item.name ?? 'غير معروف',
    sales: toNumber(item.sales ?? item.sold),
    sold: toNumber(item.sold ?? item.sales),
    revenue: toNumber(item.revenue),
    rating: toNumber(item.rating),
  })),
  lowStockProducts: asArray<any>(data?.lowStockProducts).map((item) => ({
    id: item.id,
    name: item.name ?? 'غير معروف',
    stock: toNumber(item.stock),
    minStock: toNumber(item.minStock),
  })),
  byCategory: asArray<any>(data?.byCategory).map((item) => ({
    category: item.category ?? 'غير معروف',
    count: toNumber(item.count),
    sales: toNumber(item.sales),
    revenue: toNumber(item.revenue),
  })),
});

export const mapCustomerAnalytics = (data: any) => ({
  totalCustomers: toNumber(data?.totalCustomers),
  newCustomers: toNumber(data?.newCustomers),
  activeCustomers: toNumber(data?.activeCustomers),
  customerLifetimeValue: toNumber(data?.customerLifetimeValue),

  totalCustomersGrowth: toNumber(data?.totalCustomersGrowth),
  newCustomersGrowth: toNumber(data?.newCustomersGrowth),
  activeCustomersGrowth: toNumber(data?.activeCustomersGrowth),
  customerLifetimeValueGrowth: toNumber(data?.customerLifetimeValueGrowth),

  customerSegments: asArray<any>(data?.customerSegments).map((item) => ({
    segment: item.segment,
    name: item.segment,
    count: toNumber(item.count),
    value: toNumber(item.count),
    percentage: toNumber(item.percentage),
  })),

  topCustomers: asArray<any>(data?.topCustomers).map((item) => ({
    id: item.id,
    name: item.name ?? 'عميل غير معروف',
    orders: toNumber(item.orders),
    totalSpent: toNumber(item.totalSpent),
  })),
});
