import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, useTheme } from '@mui/material';
import { Grid } from '@mui/material';
import { Business, BusinessCenter, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBrandStats } from '../hooks/useBrands';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography 
              color="text.secondary" 
              gutterBottom 
              variant="h6"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mb: 1,
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton 
                variant="text" 
                sx={{ 
                  width: { xs: 50, sm: 60 }, 
                  height: { xs: 30, sm: 40 } 
                }} 
              />
            ) : (
              <Typography 
                variant="h4" 
                component="div" 
                color={`${color}.main`}
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                }}
              >
                {value.toLocaleString('en-US')}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' 
                ? `${color}.dark` 
                : `${color}.light`,
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': {
                fontSize: { xs: '1.5rem', sm: '2rem' },
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const BrandStatsCards: React.FC = () => {
  const { t } = useTranslation('brands');
  const { data: stats, isLoading, error } = useBrandStats();

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error" variant="body2">
          {t('stats.error')}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <StatCard
          title={t('stats.totalBrands')}
          value={stats?.total || 0}
          icon={<Business />}
          color="primary"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <StatCard
          title={t('stats.activeBrands')}
          value={stats?.active || 0}
          icon={<Visibility />}
          color="success"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <StatCard
          title={t('stats.inactiveBrands')}
          value={stats?.inactive || 0}
          icon={<VisibilityOff />}
          color="warning"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
        <StatCard
          title={t('stats.brandsWithProducts')}
          value={stats?.withProducts || 0}
          icon={<BusinessCenter />}
          color="error"
          loading={isLoading}
        />
      </Grid>
    </Grid>
  );
};
