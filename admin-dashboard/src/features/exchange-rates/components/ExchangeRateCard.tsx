import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  AttachMoney,
  Schedule,
} from '@mui/icons-material';
import { ExchangeRatesData } from '../api/exchangeRatesApi';

interface ExchangeRateCardProps {
  rates: ExchangeRatesData | null;
  loading: boolean;
  error: string | null;
  title: string;
  currency: 'YER' | 'SAR';
  rate: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({
  rates,
  loading,
  error,
  title,
  currency,
  rate,
  icon,
  color,
}) => {
  const formatRate = (value: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const getCurrencySymbol = (curr: string) => {
    return curr === 'YER' ? 'ر.ي' : 'ر.س';
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="60%" />}
          subheader={<Skeleton variant="text" width="40%" />}
        />
        <CardContent>
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="60%" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.contrastText`,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        }
        title={
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            مقابل الدولار الأمريكي
          </Typography>
        }
        action={
          <Chip
            label={`1 USD`}
            size="small"
            color={color}
            variant="outlined"
            icon={<AttachMoney />}
          />
        }
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: `${color}.main` }}>
            {formatRate(rate)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {getCurrencySymbol(currency)}
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          {rates?.lastUpdatedAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                آخر تحديث: {new Date(rates.lastUpdatedAt).toLocaleString('ar-SA')}
              </Typography>
            </Box>
          )}
          
          {rates?.lastUpdatedBy && (
            <Typography variant="caption" color="text.secondary">
              بواسطة: {rates.lastUpdatedBy}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateCard;
