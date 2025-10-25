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
  Campaign as CampaignIcon,
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
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CampaignIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="primary">
                  إجمالي الحملات
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(data?.totalCampaigns || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +5.2% من الشهر الماضي
                </Typography>
              </Box>
            </Box>
          </Grid>

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
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +8.7% من الشهر الماضي
                </Typography>
              </Box>
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
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12.3% من الشهر الماضي
                </Typography>
              </Box>
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
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +3.2% من الشهر الماضي
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Campaign Performance */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                أداء الحملات
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.campaignPerformance || []}>
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

          {/* Top Coupons */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                أفضل الكوبونات
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {(data?.topCoupons || []).map((coupon, index) => (
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
                  <Typography variant="body2" color="primary">
                    {formatPercentage(data?.conversionRate || 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data?.conversionRate || 0}
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
                  <Typography variant="body2" color="success.main">
                    {formatPercentage(data?.roi || 0)}
                  </Typography>
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
                  <Typography variant="body2">الحملات النشطة</Typography>
                  <Typography variant="body2" color="warning.main">
                    {data?.activeCampaigns || 0} / {data?.totalCampaigns || 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((data?.activeCampaigns || 0) / (data?.totalCampaigns || 1)) * 100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Campaign Performance Details */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                تفاصيل أداء الحملات
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {(data?.campaignPerformance || []).map((campaign, index) => (
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
                      value={(campaign.conversions / campaign.reach) * 100}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
