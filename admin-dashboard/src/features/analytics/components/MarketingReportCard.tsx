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
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useMarketingReport } from '../hooks/useAnalytics';
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { AnalyticsCardErrorBoundary } from './AnalyticsCardErrorBoundary';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';
import { PeriodType } from '../types/analytics.types';

interface MarketingReportCardProps {
  period?: PeriodType;
}

export const MarketingReportCard: React.FC<MarketingReportCardProps> = ({ period }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();

  const { data, isLoading, error } = useMarketingReport({ period });

  if (error) {
    return (
      <Alert severity="error" sx={{ m: breakpoint.isXs ? 1 : 2 }}>
        {t('marketingReport.loadError')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('marketingReport.title')}
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

  const campaignPerformance = asArray(data?.campaignPerformance);
  const topCoupons = asArray(data?.topCoupons);

  const roiValue = data?.roi ?? 0;
  const roiIsMassive = roiValue > 1000;

  return (
    <Card>
      <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {t('marketingReport.title')}
          </Typography>
          <Chip icon={<AssessmentIcon />} label={t('marketingReport.comprehensiveAnalysis')} color="primary" variant="outlined" />
        </Stack>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: t('marketingReport.totalCoupons'), value: formatNumber(data?.totalCoupons), growth: data?.totalCouponsGrowth, icon: <LocalOfferIcon />, color: 'secondary' as const },
            { label: t('marketingReport.activeCoupons'), value: formatNumber(data?.activeCoupons), growth: undefined, icon: <LocalOfferIcon />, color: 'info' as const },
            { label: t('marketingReport.totalDiscounts'), value: formatCurrency(data?.totalDiscountGiven), growth: data?.totalDiscountGrowth, icon: <AttachMoneyIcon />, color: 'success' as const },
            {
              label: t('marketingReport.roi'),
              value: roiIsMassive ? `${formatPercent(roiValue)} ⚠️` : formatPercent(roiValue),
              growth: data?.roiGrowth,
              icon: <TrendingUpIcon />,
              color: 'warning' as const,
            },
          ].map((kpi, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette[kpi.color].main}15, ${theme.palette[kpi.color].main}05)`, border: `1px solid ${theme.palette[kpi.color].main}20` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {React.cloneElement(kpi.icon, { sx: { color: theme.palette[kpi.color].main, mr: 1 } })}
                  <Typography variant="h6" color={`${kpi.color}.main`}>{kpi.label}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{kpi.value}</Typography>
                {kpi.growth !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {kpi.growth >= 0 ? (
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    ) : (
                      <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                    )}
                    <Typography variant="body2" color={kpi.growth >= 0 ? 'success.main' : 'error.main'}>
                      {kpi.growth >= 0 ? '+' : ''}{Number(kpi.growth).toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ROI Warning */}
        {roiIsMassive && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            ROI مرتفع بسبب غياب تكلفة الحملة — قد لا يعكس الواقع.
          </Alert>
        )}

        {/* Charts */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض أداء الحملات">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>{t('marketingReport.campaignPerformance')}</Typography>
                {campaignPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={campaignPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="campaign" />
                      <YAxis />
                      <Tooltip
formatter={(value, name) => [
                           name === 'reach' ? formatNumber(Number(value)) : name === 'conversions' ? formatNumber(Number(value)) : formatCurrency(Number(value)),
                           name === 'reach' ? 'الوصول' : name === 'conversions' ? 'التحويلات' : 'الإيراد',
                         ]}
                        contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                      />
                      <Bar dataKey="reach" fill={theme.palette.primary.main} />
                      <Bar dataKey="conversions" fill={theme.palette.secondary.main} />
                      <Bar dataKey="revenue" fill={theme.palette.success.main} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد حملات تسويقية." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض الكوبونات">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>{t('marketingReport.topCoupons')}</Typography>
                {topCoupons.length > 0 ? (
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {topCoupons.map((coupon, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{coupon.code}</Typography>
                          <Typography variant="body2" color="primary">{formatCurrency(coupon.revenue)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            الاستخدام: {formatNumber(coupon.uses)}
                          </Typography>
                          {coupon.discount !== undefined && (
                            <Typography variant="caption" color="success.main">
                              الخصم: {formatCurrency(coupon.discount)}
                            </Typography>
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (coupon.uses / Math.max(...topCoupons.map((c) => c.uses || 1), 1)) * 100,
                            100
                          )}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد كوبونات مستخدمة." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
