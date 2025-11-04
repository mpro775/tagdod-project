import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
 
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  LooksOne,
  TrendingUp,
  MonetizationOn,
  Email,
  Refresh,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CartStatistics, CartAnalytics } from '../types/cart.types';
import { formatCurrency } from '../api/cartApi';

interface CartStatsCardsProps {
  statistics?: CartStatistics;
  analytics?: CartAnalytics;
  isLoading?: boolean;
  onRefresh?: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#2196f3',
  isLoading = false,
}) => {
  const theme = useTheme();
  
  if (isLoading) {
    return (
      <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Skeleton 
              variant="rectangular" 
              sx={{ 
                width: { xs: 28, sm: 32 }, 
                height: { xs: 28, sm: 32 },
                borderRadius: 1.5,
              }} 
            />
            <Skeleton variant="text" sx={{ width: { xs: 40, sm: 50 }, height: { xs: 14, sm: 16 } }} />
          </Box>
          <Skeleton variant="text" sx={{ width: '80%', height: { xs: 20, sm: 24 } }} />
          <Skeleton variant="text" sx={{ width: '60%', height: { xs: 14, sm: 16 } }} />
        </CardContent>
      </Card>
    );
  }

  const getColorValue = (colorHex: string, opacity: number) => {
    // Convert hex to rgba based on theme mode
    if (theme.palette.mode === 'dark') {
      return `rgba(255, 255, 255, ${opacity * 0.1})`;
    }
    // For light mode, use the color with opacity
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' ? 4 : 3,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ p: { xs: 1, sm: 1.5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={1.5}>
          <Box
            sx={{
              p: { xs: 0.75, sm: 1 },
              borderRadius: 1.5,
              bgcolor: getColorValue(color, 0.15),
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': {
                fontSize: { xs: '1rem', sm: '1.125rem' },
              },
            }}
          >
            {icon}
          </Box>
        </Box>
        
        <Typography 
          variant="h6" 
          component="div" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            color: 'text.primary',
            textAlign: 'center',
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, textAlign: 'center' }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            mt={1}
            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, textAlign: 'center' }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const CartStatsCards: React.FC<CartStatsCardsProps> = ({
  statistics,
  analytics,
  isLoading = false,
}) => {
  const { t } = useTranslation('cart');

  const stats = [
    {
      title: t('stats.totalCarts'),
      value: statistics?.totalCarts?.toLocaleString('en-US') || analytics?.totalCarts?.toLocaleString('en-US') || '0',
      icon: <ShoppingCart />,
      color: '#2196f3',
    },
    {
      title: t('stats.activeCarts'),
      value: statistics?.totalCarts ?
        ((statistics.totalCarts - (analytics?.abandonedCarts || 0) - (analytics?.convertedCarts || 0))).toLocaleString('en-US') :
          analytics?.activeCarts?.toLocaleString('en-US') || '0',
      icon: <LooksOne />,
      color: '#4caf50',
    },
    {
      title: t('stats.abandonedCarts'),
      value: analytics?.abandonedCarts?.toLocaleString('en-US') || '0',
      icon: <Email />,
      color: '#ff9800',
    },
    {
      title: t('stats.convertedCarts'),
      value: analytics?.convertedCarts?.toLocaleString('en-US') || '0',
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
    {
      title: t('stats.totalValue'),
      value: formatCurrency(statistics?.totalValue || analytics?.totalValue || 0),
      icon: <MonetizationOn />,
      color: '#00bcd4',
    },
    {
      title: t('stats.averageValue'),
      value: formatCurrency(statistics?.averageCartValue || analytics?.averageCartValue || 0),
      icon: <TrendingUp />,
      color: '#795548',
    },
    {
      title: t('stats.conversionRate'),
      value: `${((statistics?.conversionRate || analytics?.conversionRate || 0) * 100).toFixed(1)}%`,
      icon: <TrendingUp />,
      color: '#607d8b',
    },
    {
      title: t('stats.recoveryRate'),
      value: `${((statistics?.recoveryRate || 0) * 100).toFixed(1)}%`,
      icon: <Refresh />,
      color: '#e91e63',
    },
  ];

  return (
    <Box>
    
      
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              isLoading={isLoading}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CartStatsCards;
