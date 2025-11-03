import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Alert,
  Skeleton,
  useTheme,
  Stack,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing, getChartHeight, getChartMargin, getChartLabelFontSize, getChartTooltipFontSize, getYAxisWidth, getXAxisHeight } from '../utils/responsive';
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
import { InventoryReport } from '../types/analytics.types';

interface InventoryReportCardProps {
  data?: InventoryReport;
  isLoading?: boolean;
  error?: any;
}

export const InventoryReportCard: React.FC<InventoryReportCardProps> = ({
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
        {t('inventoryReport.loadError')}
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
            {t('inventoryReport.title')}
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
          }}
        >
          <Typography 
            variant={breakpoint.isXs ? 'h6' : 'h5'} 
            component="h2"
            sx={{ fontSize: breakpoint.isXs ? '1.25rem' : undefined }}
          >
            {t('inventoryReport.title')}
          </Typography>
          <Chip 
            icon={<InventoryIcon />} 
            label={t('inventoryReport.comprehensiveAnalysis')} 
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                border: `1px solid ${theme.palette.primary.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon 
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
                  {t('inventoryReport.totalProducts')}
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
              {data?.totalProductsGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.totalProductsGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.totalProductsGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.totalProductsGrowth >= 0 ? '+' : ''}{data.totalProductsGrowth.toFixed(1)}% {t('inventoryReport.fromPreviousPeriod')}
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
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                border: `1px solid ${theme.palette.success.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon 
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
                  {t('inventoryReport.inStock')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.inStock || 0)}
              </Typography>
              {data?.inStockGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.inStockGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.inStockGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.inStockGrowth >= 0 ? '+' : ''}{data.inStockGrowth.toFixed(1)}% {t('inventoryReport.fromPreviousPeriod')}
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
                background: `linear-gradient(135deg, ${theme.palette.error.main}15, ${theme.palette.error.main}05)`,
                border: `1px solid ${theme.palette.error.main}20`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon 
                  sx={{ 
                    color: theme.palette.error.main, 
                    mr: 1,
                    fontSize: breakpoint.isXs ? '1.25rem' : undefined,
                  }} 
                />
                <Typography 
                  variant={breakpoint.isXs ? 'subtitle2' : 'h6'} 
                  color="error.main"
                  sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
                >
                  {t('inventoryReport.outOfStock')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatNumber(data?.outOfStock || 0)}
              </Typography>
              {data?.outOfStockGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.outOfStockGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.outOfStockGrowth >= 0 ? 'error.main' : 'success.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.outOfStockGrowth >= 0 ? '+' : ''}{data.outOfStockGrowth.toFixed(1)}% {t('inventoryReport.fromPreviousPeriod')}
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
                <AttachMoneyIcon 
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
                  {t('inventoryReport.inventoryValue')}
                </Typography>
              </Box>
              <Typography 
                variant={breakpoint.isXs ? 'h5' : 'h4'} 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                }}
              >
                {formatCurrency(data?.totalValue || 0)}
              </Typography>
              {data?.totalValueGrowth !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.totalValueGrowth >= 0 ? (
                    <TrendingUpIcon 
                      sx={{ 
                        color: theme.palette.success.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  ) : (
                    <TrendingDownIcon 
                      sx={{ 
                        color: theme.palette.error.main, 
                        fontSize: breakpoint.isXs ? 14 : 16, 
                        mr: 0.5 
                      }} 
                    />
                  )}
                  <Typography 
                    variant="body2" 
                    color={data.totalValueGrowth >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  >
                    {data.totalValueGrowth >= 0 ? '+' : ''}{data.totalValueGrowth.toFixed(1)}% {t('inventoryReport.fromPreviousPeriod')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={cardSpacing}>
          {/* Inventory by Category */}
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
                {t('inventoryReport.byCategory')}
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

          {/* Inventory Movements */}
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
                {t('inventoryReport.movements')}
              </Typography>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart 
                  data={data?.movements || []}
                  margin={chartMargin}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
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
                      formatNumber(value),
                      name === 'in' ? t('inventoryReport.incoming') : t('inventoryReport.outgoing'),
                    ]}
                    contentStyle={{
                      fontSize: `${tooltipFontSize}px`,
                    }}
                  />
                  <Bar dataKey="quantity" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
