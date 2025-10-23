import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Category, TrendingUp, Star, Refresh, Visibility } from '@mui/icons-material';
import { useCategoryStats, useUpdateCategoryStats } from '../hooks/useCategories';
import { formatNumber } from '@/shared/utils/formatters';

interface CategoryStatsCardsProps {
  onRefresh?: () => void;
}

export const CategoryStatsCards: React.FC<CategoryStatsCardsProps> = ({ onRefresh }) => {
  const { data: stats, isLoading, error } = useCategoryStats();
  const { isPending: isUpdating } = useUpdateCategoryStats();

  const handleRefreshStats = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  if (error) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography color="error" variant="body2">
          خطأ في تحميل الإحصائيات
        </Typography>
      </Card>
    );
  }

  const statsCards = [
    {
      title: 'إجمالي الفئات',
      value: stats?.totalCategories || 0,
      icon: <Category sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary',
      description: 'جميع الفئات في النظام',
    },
    {
      title: 'الفئات النشطة',
      value: stats?.activeCategories || 0,
      icon: <Visibility sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success',
      description: 'الفئات المعروضة للعملاء',
    },
    {
      title: 'الفئات المميزة',
      value: stats?.featuredCategories || 0,
      icon: <Star sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning',
      description: 'الفئات المميزة في الموقع',
    },
    {
      title: 'إجمالي المنتجات',
      value: stats?.totalProducts || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info',
      description: 'جميع المنتجات في الفئات',
    },
    {
      title: 'الفئات مع منتجات',
      value: stats?.categoriesWithProducts || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary',
      description: 'الفئات التي تحتوي على منتجات',
    },
    {
      title: 'متوسط المنتجات',
      value: stats?.averageProductsPerCategory || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error',
      description: 'متوسط المنتجات لكل فئة',
      isDecimal: true,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          إحصائيات الفئات
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="تحديث الإحصائيات">
            <IconButton
              size="small"
              onClick={handleRefreshStats}
              disabled={isUpdating}
              color="primary"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {statsCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {isLoading ? <Skeleton variant="circular" width={40} height={40} /> : card.icon}
                  <Box sx={{ ml: 1, flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {card.title}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 1 }}>
                  {isLoading ? (
                    <Skeleton variant="text" width="60%" height={32} />
                  ) : (
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={`${card.color}.main`}
                      sx={{ lineHeight: 1 }}
                    >
                      {card.isDecimal ? formatNumber(card.value, 'ar') : formatNumber(card.value)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isLoading ? (
                    <Skeleton variant="text" width="80%" height={20} />
                  ) : (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        {card.description}
                      </Typography>
                      {card.value > 0 && (
                        <Chip
                          label="نشط"
                          size="small"
                          color={card.color as any}
                          variant="outlined"
                        />
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {stats && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            آخر تحديث: {new Date().toLocaleString('ar-SA')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
