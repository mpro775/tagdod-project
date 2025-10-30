import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  ShoppingCart,
  LooksOne,
  TrendingUp,
  TrendingDown,
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
  trend,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Skeleton variant="rectangular" width={40} height={40} />
            <Skeleton variant="text" width={60} height={20} />
          </Box>
          <Skeleton variant="text" width="80%" height={32} />
          <Skeleton variant="text" width="60%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}20`,
        '&:hover': {
          boxShadow: `0 8px 25px ${color}25`,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Chip
              icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
              label={trend.isPositive
                ? t('cart.stats.trend.positive', { value: trend.value })
                : t('cart.stats.trend.negative', { value: trend.value })
              }
              size="small"
              color={trend.isPositive ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        
        <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
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
  onRefresh,
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('cart.stats.totalCarts', { defaultValue: 'عدد السلات' }),
      value: statistics?.totalCarts?.toLocaleString('en-US') || analytics?.totalCarts?.toLocaleString('en-US') || '0',
      subtitle: t('cart.stats.subtitle.totalCarts', { defaultValue: 'عدد السلات' }),
      icon: <ShoppingCart />,
      color: '#2196f3',
    },
    {
      title: t('cart.stats.activeCarts', { defaultValue: 'عدد السلات النشطة' }),
      value: statistics?.totalCarts ?
        ((statistics.totalCarts - (analytics?.abandonedCarts || 0) - (analytics?.convertedCarts || 0))).toLocaleString('en-US') :
          analytics?.activeCarts?.toLocaleString('en-US') || '0',
      subtitle: t('cart.stats.subtitle.activeCarts', { defaultValue: 'عدد السلات النشطة' }),
      icon: <LooksOne />,
      color: '#4caf50',
    },
    {
      title: t('cart.stats.abandonedCarts', { defaultValue: 'عدد السلات المهملة' }),
      value: analytics?.abandonedCarts?.toLocaleString('en-US') || '0',
      subtitle: t('cart.stats.subtitle.abandonedCarts', { defaultValue: 'عدد السلات المهملة' }),
      icon: <Email />,
      color: '#ff9800',
    },
    {
      title: t('cart.stats.convertedCarts', { defaultValue: 'عدد السلات المحولة' }  ),
      value: analytics?.convertedCarts?.toLocaleString('en-US') || '0',
      subtitle: t('cart.stats.subtitle.convertedCarts', { defaultValue: 'عدد السلات المحولة' }),
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
    {
      title: t('cart.stats.totalValue', { defaultValue: 'المجموع الكلي' }),
      value: formatCurrency(statistics?.totalValue || analytics?.totalValue || 0),
      subtitle: t('cart.stats.subtitle.totalValue', { defaultValue: 'المجموع الكلي' }),
      icon: <MonetizationOn />,
      color: '#00bcd4',
    },
    {
      title: t('cart.stats.averageValue', { defaultValue: 'المجموع المتوسط' }),
      value: formatCurrency(statistics?.averageCartValue || analytics?.averageCartValue || 0),
      subtitle: t('cart.stats.subtitle.averageValue', { defaultValue: 'المجموع المتوسط' }),
      icon: <TrendingUp />,
      color: '#795548',
    },
    {
      title: t('cart.stats.conversionRate', { defaultValue: 'معدل التحويل' }),
      value: `${((statistics?.conversionRate || analytics?.conversionRate || 0) * 100).toFixed(1)}%`,
      subtitle: t('cart.stats.subtitle.conversionRate', { defaultValue: 'معدل التحويل' }  ),
      icon: <TrendingUp />,
      color: '#607d8b',
    },
    {
      title: t('cart.stats.recoveryRate', { defaultValue: 'معدل الاسترداد' }),
      value: `${((statistics?.recoveryRate || 0) * 100).toFixed(1)}%`,
        subtitle: t('cart.stats.subtitle.recoveryRate', { defaultValue: 'معدل الاسترداد' }),
      icon: <Refresh />,
      color: '#e91e63',
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          {t('cart.stats.title', { defaultValue: 'إحصائيات السلات' })}
        </Typography>
        {onRefresh && (
          <Tooltip title={t('cart.actions.refresh', { defaultValue: 'تحديث' }     )}>
            <IconButton onClick={onRefresh} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
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
