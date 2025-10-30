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
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
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
                  إعادة المحاولة
                </Button>
              )
            }
          >
            خطأ في تحميل أسعار الصرف: {error}
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
            لا توجد بيانات أسعار صرف متاحة
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
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney color="primary" />
            <Typography variant="h6" component="div">
              قائمة أسعار الصرف
            </Typography>
          </Box>
        }
        subheader="عرض جميع أسعار الصرف المتاحة"
        action={
          onRefresh && (
            <Tooltip title="تحديث البيانات">
              <IconButton onClick={onRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          )
        }
      />
      <CardContent>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[800]
                    : theme.palette.grey[100],
              }}
            >
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  العملة المصدر
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  العملة الهدف
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  السعر
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  الحالة
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  آخر تحديث
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  الإجراءات
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
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="primary" />
                      <Typography variant="body2" fontWeight={500}>
                        {rate.fromCurrency}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDown color="secondary" />
                      <Typography variant="body2" fontWeight={500}>
                        {rate.toCurrency}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {formatRate(rate.rate)} {getCurrencySymbol(rate.toCurrency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      1 {rate.fromCurrency} = {formatRate(rate.rate)} {rate.toCurrency}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={rate.isActive ? 'نشط' : 'غير نشط'}
                      color={rate.isActive ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(rate.lastUpdated)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="عرض التفاصيل">
                      <IconButton size="small" color="primary">
                        <AttachMoney />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Cards */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="primary" fontWeight={600}>
                {formatRate(rates.usdToYer)} $
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1 دولار = {formatRate(rates.usdToYer)} ريال يمني
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="secondary" fontWeight={600}>
                {formatRate(rates.usdToSar)} $
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1 دولار = {formatRate(rates.usdToSar)} ريال سعودي
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExchangeRatesList;
