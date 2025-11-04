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
import { getCardPadding, getCardSpacing, getChartHeight, getChartMargin, getChartLabelFontSize, getChartTooltipFontSize, getYAxisWidth, getXAxisHeight } from '../utils/responsive';
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
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  const chartHeight = getChartHeight(breakpoint, 200);
  const chartMargin = getChartMargin(breakpoint);
  const labelFontSize = getChartLabelFontSize(breakpoint);
  const tooltipFontSize = getChartTooltipFontSize(breakpoint);
  const yAxisWidth = getYAxisWidth(breakpoint);
  const xAxisHeight = getXAxisHeight(breakpoint, true);

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
        <CardContent sx={{ p: cardPadding }}>
          <Typography 
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {t('marketingReport.title')}
          </Typography>
          <Grid container spacing={cardSpacing}>
            {[...Array(4)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Skeleton variant="rectangular" height={breakpoint.isXs ? 90 : 100} />
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
      <CardContent sx={{ p: cardPadding }}>
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={cardSpacing}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
          }}
        >
          <Typography 
            variant={breakpoint.isXs ? 'h6' : 'h5'} 
            component="h2"
            sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
          >
            {t('marketingReport.title')}
          </Typography>
          <Chip 
            icon={<AssessmentIcon />} 
            label={t('marketingReport.comprehensiveAnalysis')} 
            color="primary" 
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
          />
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                border: `1px solid ${theme.palette.secondary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOfferIcon 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="secondary"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('marketingReport.totalCoupons')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.totalCoupons || 0)}
              </Typography>
              {formatGrowth(data?.totalCouponsGrowth) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {formatGrowth(data?.totalCouponsGrowth)?.icon ? (
                    <TrendingUpIcon
                      sx={{ 
                        color: formatGrowth(data?.totalCouponsGrowth)?.color, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{ 
                        color: formatGrowth(data?.totalCouponsGrowth)?.color, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }}
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={formatGrowth(data?.totalCouponsGrowth)?.color}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {formatGrowth(data?.totalCouponsGrowth)?.value} {t('marketingReport.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.info.main}05)`,
                border: `1px solid ${theme.palette.info.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOfferIcon 
                  sx={{ 
                    color: theme.palette.info.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="info.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('marketingReport.activeCoupons')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.activeCoupons || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 1,
                  fontSize: breakpoint.isXs ? '0.75rem' : undefined,
                }}
              >
                {t('marketingReport.ofTotal', { total: formatNumber(data?.totalCoupons || 0) })}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon 
                  sx={{ 
                    color: theme.palette.success.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="success.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('marketingReport.totalDiscounts')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatCurrency(data?.totalDiscountGiven || 0)}
              </Typography>
              {formatGrowth(data?.totalDiscountGrowth) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {formatGrowth(data?.totalDiscountGrowth)?.icon ? (
                    <TrendingUpIcon
                      sx={{ 
                        color: formatGrowth(data?.totalDiscountGrowth)?.color, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{ 
                        color: formatGrowth(data?.totalDiscountGrowth)?.color, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }}
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={formatGrowth(data?.totalDiscountGrowth)?.color}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {formatGrowth(data?.totalDiscountGrowth)?.value} {t('marketingReport.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                border: `1px solid ${theme.palette.warning.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon 
                  sx={{ 
                    color: theme.palette.warning.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="warning.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('marketingReport.roi')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatPercentage(data?.roi || 0)}
              </Typography>
              {formatGrowth(data?.roiGrowth) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {formatGrowth(data?.roiGrowth)?.icon ? (
                    <TrendingUpIcon
                      sx={{ 
                        color: formatGrowth(data?.roiGrowth)?.color, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }}
                    />
                  ) : (
                    <TrendingDownIcon
                      sx={{ 
                        color: formatGrowth(data?.roiGrowth)?.color, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }}
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={formatGrowth(data?.roiGrowth)?.color}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {formatGrowth(data?.roiGrowth)?.value} {t('marketingReport.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={cardSpacing}>
          {/* Campaign Performance - عرضها فقط إذا كانت البيانات موجودة */}
          {data?.campaignPerformance && data.campaignPerformance.length > 0 && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box 
                sx={{ 
                  p: cardPadding, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2 
                }}
              >
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                  gutterBottom
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {t('marketingReport.campaignPerformance')}
                </Typography>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart 
                    data={data.campaignPerformance}
                    margin={chartMargin}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="campaign" 
                      tick={{ fontSize: labelFontSize }}
                      angle={breakpoint.isXs ? -45 : 0}
                      textAnchor={breakpoint.isXs ? 'end' : 'middle'}
                      height={xAxisHeight}
                    />
                    <YAxis 
                      tick={{ fontSize: labelFontSize }}
                      width={yAxisWidth}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'reach'
                          ? formatNumber(value)
                          : name === 'conversions'
                          ? formatNumber(value)
                          : formatCurrency(value),
                        name === 'reach'
                          ? t('marketingReport.reach')
                          : name === 'conversions'
                          ? t('marketingReport.conversions')
                          : t('marketingReport.revenue'),
                      ]}
                      contentStyle={{
                        fontSize: `${tooltipFontSize}px`,
                      }}
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
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('marketingReport.topCoupons')}
              </Typography>
              {(data?.topCoupons || []).length > 0 ? (
                <Box sx={{ maxHeight: breakpoint.isXs ? 250 : 300, overflowY: 'auto' }}>
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
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: breakpoint.isXs ? '0.8125rem' : undefined,
                          }}
                        >
                          {coupon.code}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="primary"
                          sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                        >
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
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                        >
                          {t('marketingReport.usage')}: {formatNumber(coupon.uses)}
                        </Typography>
                        {coupon.discount && (
                          <Typography 
                            variant="caption" 
                            color="success.main"
                            sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                          >
                            {t('marketingReport.discount')}: {formatCurrency(coupon.discount)}
                          </Typography>
                        )}
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (coupon.uses / Math.max(...(data?.topCoupons?.map((c) => c.uses) || [1]))) *
                          100
                        }
                        sx={{ height: breakpoint.isXs ? 3 : 4, borderRadius: 2 }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}>
                  {t('marketingReport.noCouponsUsed')}
                </Alert>
              )}
            </Box>
          </Grid>

          {/* Marketing Metrics */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box 
              sx={{ 
                p: cardPadding, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2 
              }}
            >
              <Typography 
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('marketingReport.marketingMetrics')}
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
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {t('marketingReport.conversionRate')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      color="primary"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      {formatPercentage(data?.conversionRate || 0)}
                    </Typography>
                    {formatGrowth(data?.conversionRateGrowth) && (
                      <Typography 
                        variant="caption" 
                        color={formatGrowth(data?.conversionRateGrowth)?.color}
                        sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                      >
                        ({formatGrowth(data?.conversionRateGrowth)?.value})
                      </Typography>
                    )}
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data?.conversionRate || 0, 100)}
                  color="primary"
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
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
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {t('marketingReport.roi')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      color="success.main"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      {formatPercentage(data?.roi || 0)}
                    </Typography>
                    {formatGrowth(data?.roiGrowth) && (
                      <Typography 
                        variant="caption" 
                        color={formatGrowth(data?.roiGrowth)?.color}
                        sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                      >
                        ({formatGrowth(data?.roiGrowth)?.value})
                      </Typography>
                    )}
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(data?.roi || 0, 100)}
                  color="success"
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
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
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {t('marketingReport.activeCoupons')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="info.main"
                    sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                  >
                    {data?.activeCoupons || 0} / {data?.totalCoupons || 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((data?.activeCoupons || 0) / Math.max(data?.totalCoupons || 1, 1)) * 100}
                  color="info"
                  sx={{ height: breakpoint.isXs ? 6 : 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Campaign Performance Details - عرضها فقط إذا كانت البيانات موجودة */}
          {data?.campaignPerformance && data.campaignPerformance.length > 0 && (
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box 
                sx={{ 
                  p: cardPadding, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: 2 
                }}
              >
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle1' : 'h6'} 
                  gutterBottom
                  sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
                >
                  {t('marketingReport.campaignDetails')}
                </Typography>
                <Box sx={{ maxHeight: breakpoint.isXs ? 250 : 300, overflowY: 'auto' }}>
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
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: breakpoint.isXs ? '0.8125rem' : undefined,
                          }}
                        >
                          {campaign.campaign}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="primary"
                          sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                        >
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
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                        >
                          {t('marketingReport.reach')}: {formatNumber(campaign.reach)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                        >
                          {t('marketingReport.conversions')}: {formatNumber(campaign.conversions)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(campaign.conversions / Math.max(campaign.reach, 1)) * 100}
                        sx={{ height: breakpoint.isXs ? 3 : 4, borderRadius: 2 }}
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
