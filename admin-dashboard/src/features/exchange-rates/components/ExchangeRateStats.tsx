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
  const { t } = useTranslation('exchangeRates');

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('messages.noData');
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRate = (rate: number) => {
    return new Intl.NumberFormat('ar-SA', {
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
          <Alert severity="info">لا توجد بيانات أسعار صرف متاحة</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" />
            <Typography variant="h6" component="div">
              إحصائيات أسعار الصرف
            </Typography>
          </Box>
        }
        subheader="معلومات تفصيلية عن أسعار الصرف الحالية"
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Current Rates */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                الأسعار الحالية
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
                معلومات التحديث
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
                  ملاحظات
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    p: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  {rates.notes}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Quick Stats */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              <Chip
                icon={<TrendingUp />}
                label={`1 دولار = ${formatRate(rates.usdToYer)} ريال يمني`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<TrendingUp />}
                label={`1 دولار = ${formatRate(rates.usdToSar)} ريال سعودي`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateStats;
