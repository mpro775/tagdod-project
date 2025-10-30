import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('categories');
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
          {t('stats.statsError')}
        </Typography>
      </Card>
    );
  }

  const statsCards = [
    {
      title: t('stats.totalCategories'),
      value: stats?.totalCategories || 0,
      icon: <Category sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary',
      description: t('stats.totalDesc'),
    },
    {
      title: t('stats.activeCategories'),
      value: stats?.activeCategories || 0,
      icon: <Visibility sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success',
      description: t('stats.activeDesc'),
    },
    {
      title: t('stats.featuredCategories'),
      value: stats?.featuredCategories || 0,
      icon: <Star sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning',
      description: t('stats.featuredDesc'),
    },
    {
      title: t('stats.totalProducts'),
      value: stats?.totalProducts || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info',
      description: t('stats.totalProductsDesc'),
    },
    {
      title: t('stats.categoriesWithProducts'),
      value: stats?.categoriesWithProducts || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary',
      description: t('stats.categoriesWithProductsDesc'),
    },
    {
      title: t('stats.averageProducts'),
      value: stats?.averageProductsPerCategory || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error',
      description: t('stats.averageProductsDesc'),
      isDecimal: true,
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {t('stats.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={t('stats.refreshStats')}>
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
                      {card.isDecimal ? formatNumber(card.value, 'en') : formatNumber(card.value)}
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
                          label={t('stats.active')}
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
            {t('stats.lastUpdate')} {new Date().toLocaleString('ar-SA')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
