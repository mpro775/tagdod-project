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
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation('exchangeRates');
  const formatRate = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getCurrencySymbol = (curr: string) => {
    return curr === 'YER' ? '$' : '$';
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
        borderRadius: { xs: 1, sm: 2 },
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-4px)' },
          boxShadow: { xs: 1, sm: 4 },
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
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        }
        title={
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {title}
          </Typography>
        }
        subheader={
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {t('exchangeRateCard.againstUSD')}
          </Typography>
        }
        action={
          <Chip
            label={`1 USD`}
            size="small"
            color={color}
            variant="outlined"
            icon={<AttachMoney sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8125rem' },
              height: { xs: 24, sm: 28 }
            }}
          />
        }
        sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: `${color}.main`,
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            {formatRate(rate)}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 0.5,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {getCurrencySymbol(currency)}
          </Typography>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          {rates?.lastUpdatedAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Schedule sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {t('exchangeRateCard.lastUpdate')}: {formatDate(rates.lastUpdatedAt)}
              </Typography>
            </Box>
          )}
          
          {rates?.lastUpdatedBy && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              {t('exchangeRateCard.by')}: {rates.lastUpdatedBy}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateCard;
