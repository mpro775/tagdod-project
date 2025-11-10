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
import { CartStatistics, CartAnalytics, Cart } from '../types/cart.types';
import { formatCurrency } from '../api/cartApi';

interface CartStatsCardsProps {
  statistics?: CartStatistics;
  analytics?: CartAnalytics;
  isLoading?: boolean;
  onRefresh?: () => void;
  carts?: Cart[];
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
  carts,
}) => {
  const { t } = useTranslation('cart');
  const overview = analytics?.overview;
  const allTime = statistics?.allTime;
  const conversionOverview = analytics?.trends?.recentActivity?.[0] as
    | { totalValue?: number }
    | undefined;

  const fallback = React.useMemo(() => {
    if (!carts || carts.length === 0) return null;

    const selectUsdTotal = (cart: Cart): number => {
      if (cart.pricingSummaryByCurrency?.USD) {
        return cart.pricingSummaryByCurrency.USD.total ?? 0;
      }
      if (cart.totalsInAllCurrencies?.USD) {
        return cart.totalsInAllCurrencies.USD.total ?? 0;
      }
      if (cart.pricingSummary?.currency?.toUpperCase() === 'USD') {
        return cart.pricingSummary.total ?? 0;
      }
      return cart.pricingSummary?.total ?? 0;
    };

    const aggregates = carts.reduce(
      (acc, cart) => {
        acc.totalCarts += 1;
        acc.totalValue += selectUsdTotal(cart);
        switch (cart.status) {
          case 'active':
            acc.active += 1;
            break;
          case 'abandoned':
            acc.abandoned += 1;
            break;
          case 'converted':
            acc.converted += 1;
            break;
        }
        return acc;
      },
      { totalCarts: 0, totalValue: 0, active: 0, abandoned: 0, converted: 0 },
    );

    const conversionRate =
      aggregates.totalCarts > 0 ? (aggregates.converted / aggregates.totalCarts) * 100 : 0;

    return {
      totalCarts: aggregates.totalCarts,
      totalValue: aggregates.totalValue,
      active: aggregates.active,
      abandoned: aggregates.abandoned,
      converted: aggregates.converted,
      conversionRate,
    };
  }, [carts]);

  const totalCarts =
    allTime?.total ?? overview?.totalCarts ?? fallback?.totalCarts ?? 0;
  const activeCarts =
    allTime?.active ?? overview?.activeCarts ?? fallback?.active ?? 0;
  const abandonedCarts =
    allTime?.abandoned ?? overview?.abandonedCarts ?? fallback?.abandoned ?? 0;
  const convertedCarts =
    allTime?.converted ?? overview?.convertedCarts ?? fallback?.converted ?? 0;
  const totalValue =
    allTime?.totalValue ?? conversionOverview?.totalValue ?? fallback?.totalValue ?? 0;
  const averageCartValue =
    overview?.avgCartValue ?? (totalCarts ? totalValue / totalCarts : 0);
  const conversionRate =
    overview?.conversionRate ?? allTime?.conversionRate ?? fallback?.conversionRate ?? 0;
  const recoveryRate = conversionRate;

  const stats = [
    {
      title: t('stats.totalCarts'),
      value: totalCarts.toLocaleString('en-US'),
      icon: <ShoppingCart />,
      color: '#2196f3',
    },
    {
      title: t('stats.activeCarts'),
      value: activeCarts.toLocaleString('en-US'),
      icon: <LooksOne />,
      color: '#4caf50',
    },
    {
      title: t('stats.abandonedCarts'),
      value: abandonedCarts.toLocaleString('en-US'),
      icon: <Email />,
      color: '#ff9800',
    },
    {
      title: t('stats.convertedCarts'),
      value: convertedCarts.toLocaleString('en-US'),
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
    {
      title: t('stats.totalValue'),
      value: formatCurrency(totalValue, 'USD'),
      icon: <MonetizationOn />,
      color: '#00bcd4',
    },
    {
      title: t('stats.averageValue'),
      value: formatCurrency(averageCartValue, 'USD'),
      icon: <TrendingUp />,
      color: '#795548',
    },
    {
      title: t('stats.conversionRate'),
      value: `${(conversionRate ?? 0).toFixed(1)}%`,
      icon: <TrendingUp />,
      color: '#607d8b',
    },
    {
      title: t('stats.recoveryRate'),
      value: `${(recoveryRate ?? 0).toFixed(1)}%`,
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
