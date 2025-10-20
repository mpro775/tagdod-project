import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Box, Typography, Grid } from '@mui/material';
import {
  TrendingUpIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { useCouponAnalytics, useCouponStatistics } from '../../marketing/hooks/useMarketing';
import { formatCurrency } from '../../cart/api/cartApi';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color = 'blue' }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm flex items-center mt-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? <ArrowUpIcon className="w-4 h-4 ml-1" /> : <ArrowDownIcon className="w-4 h-4 ml-1" />}
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CouponAnalyticsPage: React.FC = () => {
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30);
  const [statsPeriod, setStatsPeriod] = useState(30);

  const { data: analytics, isLoading: analyticsLoading } = useCouponAnalytics(undefined, analyticsPeriod);
  const { data: statistics, isLoading: statsLoading } = useCouponStatistics(statsPeriod);

  const periodOptions = [
    { value: 7, label: 'آخر 7 أيام' },
    { value: 30, label: 'آخر 30 يوم' },
    { value: 90, label: 'آخر 3 أشهر' },
    { value: 365, label: 'آخر سنة' },
  ];

  if (analyticsLoading || statsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          تحليلات الكوبونات
        </Typography>

        <Box display="flex" gap={2}>
          <select
            value={analyticsPeriod}
            onChange={(e) => setAnalyticsPeriod(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الكوبونات"
            value={analytics?.totalCoupons || 0}
            icon={TicketIcon}
            color="blue"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="الكوبونات النشطة"
            value={analytics?.activeCoupons || 0}
            icon={TrendingUpIcon}
            color="green"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الاستخدامات"
            value={statistics?.totalRedemptions || 0}
            icon={UsersIcon}
            color="purple"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي التوفير"
            value={formatCurrency(statistics?.totalSavings || 0)}
            icon={CurrencyDollarIcon}
            color="yellow"
          />
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader>
              <CardTitle>أداء الكوبونات حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics?.couponTypePerformance?.map((item: any) => (
                  <div key={item.type} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-gray-500">{item.usageCount} استخدام</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.totalDiscount)}</p>
                      <p className="text-sm text-gray-500">{item.conversionRate}% معدل التحويل</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">لا توجد بيانات متاحة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader>
              <CardTitle>الكوبونات الأكثر استخداماً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics?.topCoupons?.slice(0, 5).map((coupon: any, index: number) => (
                  <div key={coupon._id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{coupon.name}</p>
                        <p className="text-sm text-gray-500">{coupon.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{coupon.usageCount} استخدام</p>
                      <p className="text-sm text-gray-500">{formatCurrency(coupon.totalDiscount)}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">لا توجد بيانات متاحة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات الاستخدام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">مخطط اتجاهات الاستخدام قيد التطوير</p>
                  <p className="text-sm text-gray-400 mt-2">
                    سيتم عرض الرسوم البيانية لاتجاهات استخدام الكوبونات هنا
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
