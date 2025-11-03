import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Chip,
  Skeleton,
  Alert,
  Divider,
  useTheme,
} from '@mui/material';
import { TrendingUp, Schedule, Person, Note } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ExchangeRatesData } from '../api/exchangeRatesApi';

interface ExchangeRateStatsProps {
  rates: ExchangeRatesData | null;
  loading: boolean;
  error: string | null;
}

export const ExchangeRateStats: React.FC<ExchangeRateStatsProps> = ({ rates, loading, error }) => {
  const { t, i18n } = useTranslation('exchangeRates');
  const theme = useTheme();

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('stats.noData');
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatRate = (rate: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(rate);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title={<Skeleton variant="text" width="40%" />} />
        <CardContent>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item}>
                <Skeleton variant="rectangular" height={80} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!rates) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">{t('stats.noDataAvailable')}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: { xs: 1, sm: 2 } }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('stats.title')}
            </Typography>
          </Box>
        }
        subheader={
          <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
            {t('stats.subtitle')}
          </Typography>
        }
        sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}
      />
      <CardContent sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Current Rates */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {t('stats.currentRates')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2">USD → YER</Typography>
                  <Chip label={`${formatRate(rates.usdToYer)} $`} color="primary" size="small" />
                </Box>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2">USD → SAR</Typography>
                  <Chip
                    label={`${formatRate(rates.usdToSar)} $`}
                    color="secondary"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Last Update Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {t('stats.updateInfo')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {rates.lastUpdatedAt && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{formatDate(rates.lastUpdatedAt)}</Typography>
                  </Box>
                )}
                {rates.lastUpdatedBy && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{rates.lastUpdatedBy}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Notes */}
          {rates.notes && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Note sx={{ fontSize: 16 }} />
                  {t('stats.notes')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {rates.notes}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Quick Stats */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              <Chip
                icon={<TrendingUp sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                label={t('stats.oneUSDEqualsYER', { 
                  amount: formatRate(rates.usdToYer),
                  usd: t('exchangeRates.usd'),
                  yer: t('exchangeRates.yer')
                })}
                color="primary"
                variant="outlined"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
              />
              <Chip
                icon={<TrendingUp sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                label={t('stats.oneUSDEqualsSAR', { 
                  amount: formatRate(rates.usdToSar),
                  usd: t('exchangeRates.usd'),
                  sar: t('exchangeRates.sar')
                })}
                color="secondary"
                variant="outlined"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateStats;
