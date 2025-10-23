import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material';
import { Business, BusinessCenter, Visibility, VisibilityOff } from '@mui/icons-material';
import { useBrandStats } from '../hooks/useBrands';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={60} height={40} />
          ) : (
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value.toLocaleString('ar-SA')}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const BrandStatsCards: React.FC = () => {
  const { data: stats, isLoading, error } = useBrandStats();

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error" variant="body2">
          فشل في تحميل الإحصائيات
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="إجمالي العلامات التجارية"
          value={stats?.total || 0}
          icon={<Business color="primary" />}
          color="primary"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="العلامات النشطة"
          value={stats?.active || 0}
          icon={<Visibility color="success" />}
          color="success"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="العلامات غير النشطة"
          value={stats?.inactive || 0}
          icon={<VisibilityOff color="warning" />}
          color="warning"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="العلامات مع المنتجات"
          value={stats?.withProducts || 0}
          icon={<BusinessCenter color="error" />}
          color="error"
          loading={isLoading}
        />
      </Grid>
    </Grid>
  );
};
