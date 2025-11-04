import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Chip,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Schedule,
  AttachMoney,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ExchangeRatesData } from '../api/exchangeRatesApi';

interface ExchangeRatesListProps {
  rates: ExchangeRatesData | null;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export const ExchangeRatesList: React.FC<ExchangeRatesListProps> = ({
  rates,
  loading,
  error,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation('exchangeRates');
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('loadingTexts.notSpecified');
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
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

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'YER': return '$';
      case 'SAR': return '$';
      case 'USD': return '$';
      default: return currency;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader
          title={<Skeleton variant="text" width="40%" />}
          action={<Skeleton variant="circular" width={40} height={40} />}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2].map((item) => (
              <Skeleton key={item} variant="rectangular" height={60} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              onRefresh && (
                <Button color="inherit" size="small" onClick={onRefresh}>
                  {t('list.retry')}
                </Button>
              )
            }
          >
            {t('list.errorLoading', { error })}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!rates) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            {t('list.noDataAvailable')}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const exchangeRatesData = [
    {
      id: 'usd-yer',
      fromCurrency: 'USD',
      toCurrency: 'YER',
      rate: rates.usdToYer,
      isActive: true,
      lastUpdated: rates.lastUpdatedAt,
    },
    {
      id: 'usd-sar',
      fromCurrency: 'USD',
      toCurrency: 'SAR',
      rate: rates.usdToSar,
      isActive: true,
      lastUpdated: rates.lastUpdatedAt,
    },
  ];

  return (
    <Card sx={{ borderRadius: { xs: 1, sm: 2 } }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('list.title')}
            </Typography>
          </Box>
        }
        subheader={
          <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
            {t('list.subtitle')}
          </Typography>
        }
        action={
          onRefresh && (
            <Tooltip title={t('list.refresh')}>
              <IconButton onClick={onRefresh} color="primary" size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          )
        }
        sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}
      />
      <CardContent sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: { xs: 1, sm: 1 } }}>
          <Table size="small">
            <TableHead
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[800]
                    : theme.palette.grey[100],
              }}
            >
              <TableRow>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {t('list.sourceCurrency')}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {t('list.targetCurrency')}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {t('list.rate')}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {t('list.status')}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {t('list.lastUpdate')}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.5 }
                  }}
                >
                  {t('list.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exchangeRatesData.map((rate) => (
                <TableRow 
                  key={rate.id}
                  hover
                  sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                >
                  <TableCell 
                    align="right"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {rate.fromCurrency}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDown color="secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {rate.toCurrency}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {formatRate(rate.rate)} {getCurrencySymbol(rate.toCurrency)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    >
                      {t('list.oneEquals', { from: rate.fromCurrency, rate: formatRate(rate.rate), to: rate.toCurrency })}
                    </Typography>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}
                  >
                    <Chip
                      label={rate.isActive ? t('list.active') : t('list.inactive')}
                      color={rate.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    />
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      >
                        {formatDate(rate.lastUpdated)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}
                  >
                    <Tooltip title={t('list.viewDetails')}>
                      <IconButton size="small" color="primary">
                        <AttachMoney sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Cards */}
        <Box sx={{ mt: { xs: 2, sm: 3 }, display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
          <Card variant="outlined" sx={{ flex: { xs: '1 1 100%', sm: 1 }, minWidth: { xs: 0, sm: 200 } }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="h6" 
                color="primary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                {formatRate(rates.usdToYer)} $
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {t('stats.oneUSDEqualsYER', { 
                  amount: formatRate(rates.usdToYer),
                  usd: t('exchangeRates.usd'),
                  yer: t('exchangeRates.yer')
                })}
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: { xs: '1 1 100%', sm: 1 }, minWidth: { xs: 0, sm: 200 } }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="h6" 
                color="secondary" 
                fontWeight={600}
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                {formatRate(rates.usdToSar)} $
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {t('stats.oneUSDEqualsSAR', { 
                  amount: formatRate(rates.usdToSar),
                  usd: t('exchangeRates.usd'),
                  sar: t('exchangeRates.sar')
                })}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExchangeRatesList;
