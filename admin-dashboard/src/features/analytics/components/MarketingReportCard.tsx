import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MarketingReport } from '../types/analytics.types';

interface MarketingReportCardProps {
  data?: MarketingReport;
  isLoading?: boolean;
  error?: any;
}

export const MarketingReportCard: React.FC<MarketingReportCardProps> = ({
  data,
  isLoading = false,
  error,
}) => {
  const theme = useTheme();

  if (error) {
    return <Alert severity="error">حدث خطأ في تحميل تقرير التسويق</Alert>;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            تقرير التسويق
          </Typography>
          <Grid container spacing={2}>
            {[...Array(4)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatGrowth = (growth: number | undefined) => {
    if (growth === undefined || growth === null) return null;
    const isPositive = growth >= 0;
    return {
      value: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
      color: isPositive ? 'success.main' : 'error.main',
      icon: isPositive,
    };
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            تقرير التسويق
          </Typography>
          <Chip icon={<AssessmentIcon />} label="تحليل شامل" color="primary" variant="outlined" />
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOfferIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  إجمالي الكوبونات
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.totalCoupons || 0)}
              </Typography>
              {formatGrowth(data?.totalCouponsGrowth) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {formatGrowth(data?.totalCouponsGrowth)?.icon ? (
                    <TrendingUpIcon
                      sx={{ color: formatGrowth(data?.totalCouponsGrowth)?.color, fontSize: 16, mr: 0.5 }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{ color: formatGrowth(data?.totalCouponsGrowth)?.color, fontSize: 16, mr: 0.5 }}
                    />
                  )}
                  <Typography variant="body2" color={formatGrowth(data?.totalCouponsGrowth)?.color}>
                    {formatGrowth(data?.totalCouponsGrowth)?.value} من الفترة السابقة
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.info.main}05)`,
                border: `1px solid ${theme.palette.info.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOfferIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  الكوبونات النشطة
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.activeCoupons || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                من إجمالي {formatNumber(data?.totalCoupons || 0)} كوبون
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  إجمالي الخصومات
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(data?.totalDiscountGiven || 0)}
              </Typography>
              {formatGrowth(data?.totalDiscountGrowth) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {formatGrowth(data?.totalDiscountGrowth)?.icon ? (
                    <TrendingUpIcon
                      sx={{ color: formatGrowth(data?.totalDiscountGrowth)?.color, fontSize: 16, mr: 0.5 }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{ color: formatGrowth(data?.totalDiscountGrowth)?.color, fontSize: 16, mr: 0.5 }}
                    />
                  )}
                  <Typography variant="body2" color={formatGrowth(data?.totalDiscountGrowth)?.color}>
                    {formatGrowth(data?.totalDiscountGrowth)?.value} من الفترة السابقة
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  عائد الاستثمار
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatPercentage(data?.roi || 0)}
              </Typography>
              {formatGrowth(data?.roiGrowth) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {formatGrowth(data?.roiGrowth)?.icon ? (
                    <TrendingUpIcon
                      sx={{ color: formatGrowth(data?.roiGrowth)?.color, fontSize: 16, mr: 0.5 }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{ color: formatGrowth(data?.roiGrowth)?.color, fontSize: 16, mr: 0.5 }}
                    />
                  )}
                  <Typography variant="body2" color={formatGrowth(data?.roiGrowth)?.color}>
                    {formatGrowth(data?.roiGrowth)?.value} من الفترة السابقة
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Campaign Performance - عرضها فقط إذا كانت البيانات موجودة */}
          {data?.campaignPerformance && data.campaignPerformance.length > 0 && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  أداء الحملات
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.campaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="campaign" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'reach'
                          ? formatNumber(value)
                          : name === 'conversions'
                          ? formatNumber(value)
                          : formatCurrency(value),
                        name === 'reach'
                          ? 'الوصول'
                          : name === 'conversions'
                          ? 'التحويلات'
                          : 'الإيرادات',
                      ]}
                    />
                    <Bar dataKey="reach" fill={theme.palette.primary.main} />
                    <Bar dataKey="conversions" fill={theme.palette.secondary.main} />
                    <Bar dataKey="revenue" fill={theme.palette.success.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          )}

          {/* Top Coupons */}
          <Grid size={{ xs: 12, lg: data?.campaignPerformance && data.campaignPerformance.length > 0 ? 4 : 6 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                أفضل الكوبونات
              </Typography>
              {(data?.topCoupons || []).length > 0 ? (
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {data?.topCoupons.map((coupon, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {coupon.code}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {formatCurrency(coupon.revenue)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          الاستخدام: {formatNumber(coupon.uses)}
                        </Typography>
                        {coupon.discount && (
                          <Typography variant="caption" color="success.main">
                            خصم: {formatCurrency(coupon.discount)}
                          </Typography>
                        )}
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (coupon.uses / Math.max(...(data?.topCoupons?.map((c) => c.uses) || [1]))) *
                          100
                        }
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">لا توجد كوبونات مستخدمة بعد</Alert>
              )}
            </Box>
          </Grid>

          {/* Marketing Metrics */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                مؤشرات التسويق
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">معدل التحويل</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="primary">
                      {formatPercentage(data?.conversionRate || 0)}
                    </Typography>
                    {formatGrowth(data?.conversionRateGrowth) && (
                      <Typography variant="caption" color={formatGrowth(data?.conversionRateGrowth)?.color}>
                        ({formatGrowth(data?.conversionRateGrowth)?.value})
                      </Typography>
                    )}
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data?.conversionRate || 0, 100)}
                  color="primary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">عائد الاستثمار</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="success.main">
                      {formatPercentage(data?.roi || 0)}
                    </Typography>
                    {formatGrowth(data?.roiGrowth) && (
                      <Typography variant="caption" color={formatGrowth(data?.roiGrowth)?.color}>
                        ({formatGrowth(data?.roiGrowth)?.value})
                      </Typography>
                    )}
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data?.roi || 0, 100)}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">الكوبونات النشطة</Typography>
                  <Typography variant="body2" color="info.main">
                    {data?.activeCoupons || 0} / {data?.totalCoupons || 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((data?.activeCoupons || 0) / Math.max(data?.totalCoupons || 1, 1)) * 100}
                  color="info"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Campaign Performance Details - عرضها فقط إذا كانت البيانات موجودة */}
          {data?.campaignPerformance && data.campaignPerformance.length > 0 && (
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  تفاصيل أداء الحملات
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {data.campaignPerformance.map((campaign, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {campaign.campaign}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {formatCurrency(campaign.revenue)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          الوصول: {formatNumber(campaign.reach)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          التحويلات: {formatNumber(campaign.conversions)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(campaign.conversions / Math.max(campaign.reach, 1)) * 100}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
