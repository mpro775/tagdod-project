import React, { useState } from 'react';
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
  IconButton,
  Tooltip as MuiTooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing, getChartHeight, getChartMargin, getChartLabelFontSize, getChartTooltipFontSize, getYAxisWidth, getXAxisHeight } from '../utils/responsive';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PeriodType } from '../types/analytics.types';
import { useProductPerformance } from '../hooks/useAnalytics';

interface ProductPerformanceCardProps {
  initialPeriod?: PeriodType;
}

export const ProductPerformanceCard: React.FC<ProductPerformanceCardProps> = ({
  initialPeriod = PeriodType.MONTHLY,
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
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);

  const { data, isLoading, error, refetch } = useProductPerformance({ period });

  const handleRefresh = () => {
    refetch();
  };

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <IconButton 
            size={breakpoint.isXs ? 'medium' : 'small'} 
            onClick={handleRefresh}
          >
            <RefreshIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
          </IconButton>
        }
        sx={{ m: breakpoint.isXs ? 1 : 2 }}
      >
        {t('productPerformance.loadError')}
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
            {t('productPerformance.title')}
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


  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const getTrendIcon = (growth?: number) => {
    if (!growth && growth !== 0) return null;
    return growth >= 0 ? (
      <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
    ) : (
      <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 16, mr: 0.5 }} />
    );
  };

  const getTrendColor = (growth?: number) => {
    if (!growth && growth !== 0) return 'text.secondary';
    return growth >= 0 ? 'success.main' : 'error.main';
  };

  const formatGrowth = (growth?: number) => {
    if (!growth && growth !== 0) return '0%';
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}% ${t('productPerformance.fromPreviousPeriod')}`;
  };

  return (
    <Card>
      <CardContent sx={{ p: breakpoint.isXs ? 1.5 : 2 }}>
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={cardSpacing}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
            flexWrap: 'wrap',
            gap: breakpoint.isXs ? 1.5 : 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography 
              variant={breakpoint.isXs ? 'h6' : 'h5'} 
              component="h2"
              sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
            >
              {t('productPerformance.title')}
            </Typography>
            <Chip 
              icon={<AssessmentIcon />} 
              label={t('productPerformance.comprehensiveAnalysis')} 
              color="primary" 
              variant="outlined"
              size={breakpoint.isXs ? 'small' : 'medium'}
              sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
            />
          </Box>
          <Stack 
            direction={breakpoint.isXs ? 'column' : 'row'} 
            spacing={1.5} 
            sx={{ alignItems: 'center', width: breakpoint.isXs ? '100%' : 'auto' }}
          >
            <FormControl 
              size={breakpoint.isXs ? 'medium' : 'small'} 
              sx={{ minWidth: breakpoint.isXs ? '100%' : 150 }}
              fullWidth={breakpoint.isXs}
            >
              <InputLabel>{t('productPerformance.timePeriod')}</InputLabel>
              <Select
                value={period}
                label={t('productPerformance.timePeriod')}
                onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
              >
                <MenuItem value={PeriodType.DAILY}>{t('dashboard.periodTypes.DAILY')}</MenuItem>
                <MenuItem value={PeriodType.WEEKLY}>{t('dashboard.periodTypes.WEEKLY')}</MenuItem>
                <MenuItem value={PeriodType.MONTHLY}>{t('dashboard.periodTypes.MONTHLY')}</MenuItem>
                <MenuItem value={PeriodType.QUARTERLY}>{t('dashboard.periodTypes.QUARTERLY')}</MenuItem>
                <MenuItem value={PeriodType.YEARLY}>{t('dashboard.periodTypes.YEARLY')}</MenuItem>
              </Select>
            </FormControl>
            <MuiTooltip title={t('productPerformance.refresh')}>
              <IconButton 
                onClick={handleRefresh} 
                size={breakpoint.isXs ? 'medium' : 'small'}
              >
                <RefreshIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
              </IconButton>
            </MuiTooltip>
          </Stack>
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: cardPadding,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="primary"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('productPerformance.totalProducts')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.totalProducts || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.totalProductsGrowth)}
                <Typography 
                  variant="body2" 
                  color={getTrendColor(data?.totalProductsGrowth)}
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {formatGrowth(data?.totalProductsGrowth)}
                </Typography>
              </Box>
            </Box>
          </Grid>

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
                <TrendingUpIcon 
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
                  {t('productPerformance.totalSales')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.totalSales || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.totalSalesGrowth)}
                <Typography 
                  variant="body2" 
                  color={getTrendColor(data?.totalSalesGrowth)}
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {formatGrowth(data?.totalSalesGrowth)}
                </Typography>
              </Box>
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
                <StarIcon 
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
                  {t('productPerformance.averageRating')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {data?.averageRating?.toFixed(1) || '0.0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.averageRatingGrowth)}
                <Typography 
                  variant="body2" 
                  color={getTrendColor(data?.averageRatingGrowth)}
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {formatGrowth(data?.averageRatingGrowth)}
                </Typography>
              </Box>
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
                <InventoryIcon 
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
                  {t('productPerformance.inventoryAlerts')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {data?.lowStockProducts?.length || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {getTrendIcon(data?.lowStockGrowth)}
                <Typography 
                  variant="body2" 
                  color={getTrendColor(data?.lowStockGrowth)}
                  sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                >
                  {formatGrowth(data?.lowStockGrowth)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={cardSpacing}>
          {/* Top Products Chart */}
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
                {t('productPerformance.topProducts')}
              </Typography>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart 
                  data={data?.topProducts || []}
                  margin={chartMargin}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
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
                      name === 'sales' ? formatNumber(value) : formatCurrency(value),
                      name === 'sales' ? t('productPerformance.sales') : t('productPerformance.revenue') || t('charts.revenue'),
                    ]}
                    contentStyle={{
                      fontSize: `${tooltipFontSize}px`,
                    }}
                  />
                  <Bar dataKey="sales" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Category Distribution */}
          <Grid size={{ xs: 12, lg: 4 }}>
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
                {t('productPerformance.categoryDistribution')}
              </Typography>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={data?.byCategory || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category}: ${count}`}
                    outerRadius={breakpoint.isXs ? 60 : 80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(data?.byCategory || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: `${tooltipFontSize}px`,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          {/* Low Stock Products */}
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
                {t('productPerformance.lowStockProducts')}
              </Typography>
              <Box sx={{ maxHeight: breakpoint.isXs ? 200 : 250, overflowY: 'auto' }}>
                {(data?.lowStockProducts || []).map((product, index) => (
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
                        {product.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="warning.main"
                        sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                      >
                        {product.stock} {t('productPerformance.unit')}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(product.stock / 100) * 100}
                      color="warning"
                      sx={{ height: breakpoint.isXs ? 3 : 4, borderRadius: 2 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Top Products List */}
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
                {t('productPerformance.topProductsList')}
              </Typography>
              <Box sx={{ maxHeight: breakpoint.isXs ? 200 : 250, overflowY: 'auto' }}>
                {(data?.topProducts || []).map((product, index) => (
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
                        {product.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="primary"
                        sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                      >
                        {formatCurrency(product.revenue)}
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
                        {t('productPerformance.sales')}: {formatNumber(product.sales)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                      >
                        {t('productPerformance.rating')}: {product.rating}/5
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(product.sales / (data?.totalSales || 1)) * 100}
                      sx={{ height: breakpoint.isXs ? 3 : 4, borderRadius: 2 }}
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
