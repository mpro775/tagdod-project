import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  Stack,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing } from '../utils/responsive';
import {
  CompareArrows as CompareArrowsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useComparePeriods } from '../hooks/useAnalytics';
import { formatCurrency, formatNumber } from '@/shared/utils/formatters';

interface ComparisonToolProps {
  onComparisonComplete?: (data: any) => void;
}

export const ComparisonTool: React.FC<ComparisonToolProps> = ({ onComparisonComplete }) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);

  const [dateRanges, setDateRanges] = useState({
    currentStart: '',
    currentEnd: '',
    previousStart: '',
    previousEnd: '',
  });

  const {
    data: comparisonData,
    isLoading,
    error,
    refetch,
  } = useComparePeriods(
    dateRanges.currentStart,
    dateRanges.currentEnd,
    dateRanges.previousStart,
    dateRanges.previousEnd
  );

  const handleDateChange = (field: string, value: string) => {
    setDateRanges((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompare = () => {
    if (
      dateRanges.currentStart &&
      dateRanges.currentEnd &&
      dateRanges.previousStart &&
      dateRanges.previousEnd
    ) {
      refetch();
      if (onComparisonComplete && comparisonData) {
        onComparisonComplete(comparisonData);
      }
    }
  };

  const canCompare =
    dateRanges.currentStart &&
    dateRanges.currentEnd &&
    dateRanges.previousStart &&
    dateRanges.previousEnd;

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon sx={{ color: theme.palette.success.main }} />;
    if (change < 0) return <TrendingDownIcon sx={{ color: theme.palette.error.main }} />;
    return <RemoveIcon sx={{ color: theme.palette.text.secondary }} />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

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
              {t('comparison.title')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
            >
              {t('comparison.description')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CompareArrowsIcon sx={{ fontSize: breakpoint.isXs ? 18 : undefined }} />}
            onClick={handleCompare}
            disabled={!canCompare || isLoading}
            size={breakpoint.isXs ? 'medium' : 'medium'}
            fullWidth={breakpoint.isMobile}
            sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
          >
            {isLoading ? t('comparison.comparing') : t('comparison.compare')}
          </Button>
        </Stack>

        {/* Date Range Inputs */}
        <Grid container spacing={cardSpacing} sx={{ mb: breakpoint.isXs ? 2 : 3 }}>
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined, mb: 2 }}
              >
                {t('comparison.currentPeriod')}
              </Typography>
              <Grid container spacing={breakpoint.isXs ? 1.5 : 2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('comparison.startDate')}
                    type="date"
                    value={dateRanges.currentStart}
                    onChange={(e) => handleDateChange('currentStart', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size={breakpoint.isXs ? 'medium' : 'small'}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('comparison.endDate')}
                    type="date"
                    value={dateRanges.currentEnd}
                    onChange={(e) => handleDateChange('currentEnd', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size={breakpoint.isXs ? 'medium' : 'small'}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: breakpoint.isXs ? 1.5 : 2,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                gutterBottom
                sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined, mb: 2 }}
              >
                {t('comparison.previousPeriod')}
              </Typography>
              <Grid container spacing={breakpoint.isXs ? 1.5 : 2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('comparison.startDate')}
                    type="date"
                    value={dateRanges.previousStart}
                    onChange={(e) => handleDateChange('previousStart', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size={breakpoint.isXs ? 'medium' : 'small'}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('comparison.endDate')}
                    type="date"
                    value={dateRanges.previousEnd}
                    onChange={(e) => handleDateChange('previousEnd', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size={breakpoint.isXs ? 'medium' : 'small'}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: breakpoint.isXs ? 2 : 3 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
            >
              {t('comparison.error')}
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

        {/* Comparison Results */}
        {comparisonData && !isLoading && (
          <Box>
            <Typography
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined, mb: 2 }}
            >
              {t('comparison.results')}
            </Typography>
            <Grid container spacing={cardSpacing}>
              {comparisonData.overview && (
                <>
                  {comparisonData.overview.totalUsers && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: breakpoint.isXs ? 1.5 : 2,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography
                          variant={breakpoint.isXs ? 'subtitle2' : 'body2'}
                          color="text.secondary"
                          gutterBottom
                          sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                        >
                          {t('comparison.totalUsers')}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography
                            variant={breakpoint.isXs ? 'h6' : 'h5'}
                            sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}
                          >
                            {formatNumber(comparisonData.overview.totalUsers.current, 'en')}
                          </Typography>
                          {getChangeIcon(comparisonData.overview.totalUsers.change)}
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                          >
                            {t('comparison.previous')}:{' '}
                            {formatNumber(comparisonData.overview.totalUsers.previous, 'en')}
                          </Typography>
                        </Box>
                        <Chip
                          icon={getChangeIcon(comparisonData.overview.totalUsers.change)}
                          label={`${comparisonData.overview.totalUsers.change > 0 ? '+' : ''}${comparisonData.overview.totalUsers.change.toFixed(2)}%`}
                          color={getChangeColor(comparisonData.overview.totalUsers.change) as any}
                          size="small"
                          sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                        />
                      </Paper>
                    </Grid>
                  )}

                  {comparisonData.overview.totalRevenue && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: breakpoint.isXs ? 1.5 : 2,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography
                          variant={breakpoint.isXs ? 'subtitle2' : 'body2'}
                          color="text.secondary"
                          gutterBottom
                          sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                        >
                          {t('comparison.totalRevenue')}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography
                            variant={breakpoint.isXs ? 'h6' : 'h5'}
                            sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}
                          >
                            {formatCurrency(
                              comparisonData.overview.totalRevenue.current,
                              'USD',
                              'en'
                            )}
                          </Typography>
                          {getChangeIcon(comparisonData.overview.totalRevenue.change)}
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                          >
                            {t('comparison.previous')}:{' '}
                            {formatCurrency(
                              comparisonData.overview.totalRevenue.previous,
                              'USD',
                              'en'
                            )}
                          </Typography>
                        </Box>
                        <Chip
                          icon={getChangeIcon(comparisonData.overview.totalRevenue.change)}
                          label={`${comparisonData.overview.totalRevenue.change > 0 ? '+' : ''}${comparisonData.overview.totalRevenue.change.toFixed(2)}%`}
                          color={
                            getChangeColor(comparisonData.overview.totalRevenue.change) as any
                          }
                          size="small"
                          sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                        />
                      </Paper>
                    </Grid>
                  )}

                  {comparisonData.overview.totalOrders && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: breakpoint.isXs ? 1.5 : 2,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography
                          variant={breakpoint.isXs ? 'subtitle2' : 'body2'}
                          color="text.secondary"
                          gutterBottom
                          sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                        >
                          {t('comparison.totalOrders')}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                          <Typography
                            variant={breakpoint.isXs ? 'h6' : 'h5'}
                            sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}
                          >
                            {formatNumber(comparisonData.overview.totalOrders.current, 'en')}
                          </Typography>
                          {getChangeIcon(comparisonData.overview.totalOrders.change)}
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                          >
                            {t('comparison.previous')}:{' '}
                            {formatNumber(comparisonData.overview.totalOrders.previous, 'en')}
                          </Typography>
                        </Box>
                        <Chip
                          icon={getChangeIcon(comparisonData.overview.totalOrders.change)}
                          label={`${comparisonData.overview.totalOrders.change > 0 ? '+' : ''}${comparisonData.overview.totalOrders.change.toFixed(2)}%`}
                          color={
                            getChangeColor(comparisonData.overview.totalOrders.change) as any
                          }
                          size="small"
                          sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                        />
                      </Paper>
                    </Grid>
                  )}
                </>
              )}
            </Grid>

            {/* Period Labels */}
            {(comparisonData.currentPeriod || comparisonData.previousPeriod) && (
              <Box sx={{ mt: breakpoint.isXs ? 2 : 3 }}>
                <Alert severity="info">
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      <strong>{t('comparison.currentPeriod')}:</strong>{' '}
                      {comparisonData.currentPeriod}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                    >
                      <strong>{t('comparison.previousPeriod')}:</strong>{' '}
                      {comparisonData.previousPeriod}
                    </Typography>
                  </Stack>
                </Alert>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

