import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Stack,
  useTheme,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing } from '../utils/responsive';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useMetricTrends, useMetricTrendsAdvanced } from '../hooks/useAnalytics';
import { PeriodType } from '../types/analytics.types';
import { LineChartComponent } from './LineChartComponent';

interface TrendsVisualizationProps {
  defaultMetric?: string;
}

const AVAILABLE_METRICS = [
  'revenue',
  'users',
  'orders',
  'products',
  'services',
  'support_tickets',
  'conversion_rate',
  'average_order_value',
];

const GROUP_BY_OPTIONS = ['daily', 'weekly', 'monthly', 'quarterly'];

export const TrendsVisualization: React.FC<TrendsVisualizationProps> = ({
  defaultMetric = 'revenue',
}) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);

  const [selectedMetric, setSelectedMetric] = useState(defaultMetric);
  const [period, setPeriod] = useState<PeriodType>(PeriodType.MONTHLY);
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<string>('daily');
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);

  // Simple trends query
  const {
    data: trendsData,
    isLoading: isLoadingSimple,
    error: errorSimple,
  } = useMetricTrends(selectedMetric, period, days);

  // Advanced trends query
  const {
    data: advancedTrendsData,
    isLoading: isLoadingAdvanced,
    error: errorAdvanced,
  } = useMetricTrendsAdvanced(
    selectedMetric,
    startDate || new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate || new Date().toISOString().split('T')[0],
    groupBy
  );

  const isLoading = useAdvancedMode ? isLoadingAdvanced : isLoadingSimple;
  const error = useAdvancedMode ? errorAdvanced : errorSimple;
  const data = useAdvancedMode ? advancedTrendsData : trendsData;

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
  };

  const chartData =
    data?.data?.map((item: any) => ({
      name: item.date || item.time || item.period || '',
      value: item.value || item.count || item.revenue || 0,
      change: item.change || 0,
    })) || [];

  return (
    <Card>
      <CardContent sx={{ p: cardPadding }}>
        <Stack
          direction={breakpoint.isMobile ? 'column' : 'row'}
          spacing={breakpoint.isMobile ? 1.5 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isMobile ? 'flex-start' : 'center',
            mb: breakpoint.isXs ? 2 : 3,
            gap: breakpoint.isMobile ? 1.5 : 2,
          }}
        >
          <Box>
            <Typography
              variant={breakpoint.isXs ? 'h6' : 'h5'}
              component="h2"
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}
            >
              {t('trends.title')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
            >
              {t('trends.description')}
            </Typography>
          </Box>
        </Stack>

        {/* Filters */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
              <InputLabel>{t('trends.metric')}</InputLabel>
              <Select
                value={selectedMetric}
                onChange={(e) => handleMetricChange(e.target.value)}
                label={t('trends.metric')}
              >
                {AVAILABLE_METRICS.map((metric) => (
                  <MenuItem key={metric} value={metric}>
                    {t(`trends.metrics.${metric}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {!useAdvancedMode ? (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
                  <InputLabel>{t('trends.period')}</InputLabel>
                  <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PeriodType)}
                    label={t('trends.period')}
                  >
                    {Object.values(PeriodType).map((p) => (
                      <MenuItem key={p} value={p}>
                        {t(`dashboard.periodTypes.${p}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label={t('trends.days')}
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 30)}
                  inputProps={{ min: 1, max: 365 }}
                  size={breakpoint.isXs ? 'medium' : 'small'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('trends.startDate')}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size={breakpoint.isXs ? 'medium' : 'small'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label={t('trends.endDate')}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size={breakpoint.isXs ? 'medium' : 'small'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
                  <InputLabel>{t('trends.groupBy')}</InputLabel>
                  <Select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    label={t('trends.groupBy')}
                  >
                    {GROUP_BY_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {t(`trends.groupByOptions.${option}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useAdvancedMode}
                  onChange={(e) => {
                    setUseAdvancedMode(e.target.checked);
                    if (e.target.checked) {
                      const end = new Date();
                      const start = new Date();
                      start.setDate(start.getDate() - days);
                      setEndDate(end.toISOString().split('T')[0]);
                      setStartDate(start.toISOString().split('T')[0]);
                    }
                  }}
                />
              }
              label={t('trends.useAdvancedMode')}
            />
          </Grid>
        </Grid>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: breakpoint.isXs ? 2 : 3 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
            >
              {t('trends.error')}
            </Typography>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: breakpoint.isXs ? 4 : 6,
            }}
          >
            <CircularProgress size={breakpoint.isXs ? 32 : 40} />
          </Box>
        )}

        {/* Chart */}
        {!isLoading && !error && chartData.length > 0 && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: breakpoint.isXs ? 1.5 : 2,
                gap: 1,
              }}
            >
              <TrendingUpIcon color="primary" />
              <Typography
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
              >
                {t('trends.metrics.' + selectedMetric)} - {t('trends.trend')}
              </Typography>
            </Box>
            <LineChartComponent
              data={chartData}
              height={breakpoint.isXs ? 300 : 400}
              xAxisKey="name"
              lines={[
                {
                  dataKey: 'value',
                  stroke: theme.palette.primary.main,
                  name: t('trends.metrics.' + selectedMetric),
                },
              ]}
            />
          </Box>
        )}

        {/* No Data */}
        {!isLoading && !error && chartData.length === 0 && (
          <Alert severity="info">
            <Typography
              variant="body2"
              sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
            >
              {t('trends.noData')}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
