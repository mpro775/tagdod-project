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
              label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
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
  const stats = [
    {
      title: 'إجمالي السلات',
      value: statistics?.totalCarts?.toLocaleString('ar-YE') || analytics?.totalCarts?.toLocaleString('ar-YE') || '0',
      subtitle: 'جميع السلات في النظام',
      icon: <ShoppingCart />,
      color: '#2196f3',
    },
    {
      title: 'السلات النشطة',
      value: statistics?.totalCarts ? 
        ((statistics.totalCarts - (analytics?.abandonedCarts || 0) - (analytics?.convertedCarts || 0))).toLocaleString('ar-YE') :
        analytics?.activeCarts?.toLocaleString('ar-YE') || '0',
      subtitle: 'سلات قيد الاستخدام',
      icon: <LooksOne />,
      color: '#4caf50',
    },
    {
      title: 'السلات المتروكة',
      value: analytics?.abandonedCarts?.toLocaleString('ar-YE') || '0',
      subtitle: 'تحتاج إلى متابعة',
      icon: <Email />,
      color: '#ff9800',
    },
    {
      title: 'السلات المحولة',
      value: analytics?.convertedCarts?.toLocaleString('ar-YE') || '0',
      subtitle: 'تم تحويلها إلى طلبات',
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
    {
      title: 'إجمالي القيمة',
      value: formatCurrency(statistics?.totalValue || analytics?.totalValue || 0),
      subtitle: 'قيمة جميع السلات',
      icon: <MonetizationOn />,
      color: '#00bcd4',
    },
    {
      title: 'متوسط قيمة السلة',
      value: formatCurrency(statistics?.averageCartValue || analytics?.averageCartValue || 0),
      subtitle: 'القيمة المتوسطة للسلة',
      icon: <TrendingUp />,
      color: '#795548',
    },
    {
      title: 'معدل التحويل',
      value: `${((statistics?.conversionRate || analytics?.conversionRate || 0) * 100).toFixed(1)}%`,
      subtitle: 'نسبة السلات المحولة',
      icon: <TrendingUp />,
      color: '#607d8b',
    },
    {
      title: 'معدل الاسترداد',
      value: `${((statistics?.recoveryRate || 0) * 100).toFixed(1)}%`,
      subtitle: 'نسبة السلات المستردة',
      icon: <Refresh />,
      color: '#e91e63',
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          إحصائيات السلة
        </Typography>
        {onRefresh && (
          <Tooltip title="تحديث البيانات">
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
