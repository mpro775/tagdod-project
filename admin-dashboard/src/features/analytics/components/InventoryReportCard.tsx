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
import { useInventoryReport } from '../hooks/useAnalytics';
import { asArray } from '../utils/analyticsDataGuards';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { translateStockMovementType } from '../utils/translations';
import { AnalyticsCardErrorBoundary } from './AnalyticsCardErrorBoundary';
import { EmptyAnalyticsState } from './EmptyAnalyticsState';
import { PeriodType } from '../types/analytics.types';

interface InventoryReportCardProps {
  period?: PeriodType;
}

export const InventoryReportCard: React.FC<InventoryReportCardProps> = ({ period }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = 2; // simplified

  const { data, isLoading, error } = useInventoryReport({ period });

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
          <Typography variant="h6" gutterBottom>
            {t('inventoryReport.title')}
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

  const byCategory = asArray(data?.byCategory);
  const movements = asArray(data?.movements).map((m) => ({
    ...m,
    typeLabel: translateStockMovementType(m.type),
  }));

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <Card>
      <CardContent sx={{ p: cardPadding }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {t('inventoryReport.title')}
          </Typography>
          <Chip icon={<InventoryIcon />} label={t('inventoryReport.comprehensiveAnalysis')} color="primary" variant="outlined" />
        </Stack>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: t('inventoryReport.totalProducts'), value: formatNumber(data?.totalProducts), growth: data?.totalProductsGrowth, icon: <InventoryIcon />, color: 'primary' as const },
            { label: t('inventoryReport.inStock'), value: formatNumber(data?.inStock), growth: data?.inStockGrowth, icon: <CheckCircleIcon />, color: 'success' as const },
            { label: t('inventoryReport.outOfStock'), value: formatNumber(data?.outOfStock), growth: data?.outOfStockGrowth, icon: <WarningIcon />, color: 'error' as const },
            { label: t('inventoryReport.inventoryValue'), value: formatCurrency(data?.totalValue), growth: data?.totalValueGrowth, icon: <AttachMoneyIcon />, color: 'warning' as const },
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

        {/* Charts */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض الفئات">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>{t('inventoryReport.byCategory')}</Typography>
                {byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={byCategory} cx="50%" cy="50%" labelLine={false} label={({ category, count }: any) => `${category}: ${count}`} outerRadius={80} fill="#8884d8" dataKey="count">
                        {byCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ direction: 'rtl', textAlign: 'right' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد فئات مخزون." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCardErrorBoundary fallbackTitle="تعذر عرض الحركات">
              <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>{t('inventoryReport.movements')}</Typography>
                {movements.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={movements} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => [formatNumber(value), name === 'in' ? 'إدخال' : 'إخراج']}
                        contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                      />
                      <Bar dataKey="quantity" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyAnalyticsState title="لا توجد بيانات" description="لا توجد حركات مخزون." />
                )}
              </Box>
            </AnalyticsCardErrorBoundary>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
