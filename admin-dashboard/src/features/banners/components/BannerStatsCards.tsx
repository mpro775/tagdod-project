import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Chip,
  LinearProgress,
} from '@mui/material';
import { Visibility, TrendingUp, Campaign, AdsClick } from '@mui/icons-material';
import { useBannersAnalytics } from '../hooks/useBanners';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h4" component="div" color={`${color}.main`} fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            color: `${color}.contrastText`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>

      {trend && (
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
            size="small"
            color={trend.isPositive ? 'success' : 'error'}
            variant="outlined"
          />
          <Typography variant="caption" color="text.secondary">
            من الشهر الماضي
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const LoadingSkeleton: React.FC = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4].map((item) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box flex={1}>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
            <Skeleton variant="text" width="80%" height={20} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export const BannerStatsCards: React.FC = () => {
  const { data: analytics, isLoading, error } = useBannersAnalytics();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="error">
          فشل في تحميل الإحصائيات
        </Typography>
      </Box>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    totalBanners = 0,
    activeBanners = 0,
    inactiveBanners = 0,
    totalViews = 0,
    totalClicks = 0,
    totalConversions = 0,
    averageClickThroughRate = 0,
    averageConversionRate = 0,
  } = analytics;

  const activePercentage = totalBanners > 0 ? (activeBanners / totalBanners) * 100 : 0;
  const ctrPercentage = (averageClickThroughRate || 0) * 100;
  const conversionPercentage = (averageConversionRate || 0) * 100;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="إجمالي البانرات"
          value={totalBanners}
          icon={<Campaign />}
          color="primary"
          subtitle={`${activeBanners} نشط، ${inactiveBanners} غير نشط`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="إجمالي المشاهدات"
          value={totalViews.toLocaleString()}
          icon={<Visibility />}
          color="info"
          subtitle="جميع البانرات"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="إجمالي النقرات"
          value={totalClicks.toLocaleString()}
          icon={<AdsClick />}
          color="success"
          subtitle={`معدل النقر: ${ctrPercentage.toFixed(1)}%`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="إجمالي التحويلات"
          value={totalConversions.toLocaleString()}
          icon={<TrendingUp />}
          color="warning"
          subtitle={`معدل التحويل: ${conversionPercentage.toFixed(1)}%`}
        />
      </Grid>

      {/* Progress indicators */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              حالة البانرات
            </Typography>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">البانرات النشطة</Typography>
                <Typography variant="body2">{activePercentage.toFixed(1)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={activePercentage}
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="success.main">
                {activeBanners} نشط
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {inactiveBanners} غير نشط
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              الأداء العام
            </Typography>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">معدل النقر</Typography>
                <Typography variant="body2">{ctrPercentage.toFixed(1)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={ctrPercentage}
                color="info"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">معدل التحويل</Typography>
                <Typography variant="body2">{conversionPercentage.toFixed(1)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={conversionPercentage}
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
