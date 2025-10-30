import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Avatar,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Analytics,
  TrendingUp,
  TrendingDown,
  Visibility,
  AdsClick,
  Campaign,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useBannersAnalytics } from '../hooks/useBanners';
import { BANNER_LOCATION_OPTIONS } from '../types/banner.types';
import type { Banner } from '../types/banner.types';

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ar-SA').format(num);
};

const formatPercentage = (num: number) => {
  return `${num.toFixed(1)}%`;
};

const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <TrendingUp color="success" />;
    case 'down':
      return <TrendingDown color="error" />;
    default:
      return <TrendingUp color="action" />;
  }
};

const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return 'success';
    case 'down':
      return 'error';
    default:
      return 'default';
  }
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}> = ({ title, value, subtitle, trend, icon, color }) => (
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
          {getTrendIcon(trend.direction)}
          <Chip
            label={`${trend.direction === 'up' ? '+' : ''}${trend.value}%`}
            size="small"
            color={getTrendColor(trend.direction) as any}
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

const getTopBannersColumns = (t: TFunction): GridColDef[] => [
  {
    field: 'title',
    headerName: t('analytics.banner'),
    width: 300,
    renderCell: (params) => {
      const banner = params.row as Banner & { imageUrl?: string };
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={banner.imageUrl}
            alt={banner.title}
            variant="rounded"
            sx={{ width: 50, height: 35 }}
          />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {banner.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {BANNER_LOCATION_OPTIONS.find((opt) => opt.value === banner.location)?.label}
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: 'viewCount',
    headerName: t('analytics.views'),
    width: 120,
    align: 'center',
    renderCell: (params) => formatNumber(params.value as number),
  },
  {
    field: 'clickCount',
    headerName: t('analytics.clicks'),
    width: 120,
    align: 'center',
    renderCell: (params) => formatNumber(params.value as number),
  },
  {
    field: 'conversionCount',
    headerName: t('analytics.conversions'),
    width: 120,
    align: 'center',
    renderCell: (params) => formatNumber(params.value as number),
  },
  {
    field: 'ctr',
    headerName: t('analytics.clickRate'),
    width: 130,
    align: 'center',
    renderCell: (params) => {
      const banner = params.row as Banner & { viewCount: number; clickCount: number };
      const ctr = banner.viewCount > 0 ? (banner.clickCount / banner.viewCount) * 100 : 0;
      return (
        <Chip
          label={formatPercentage(ctr)}
          size="small"
          color={ctr > 5 ? 'success' : ctr > 2 ? 'warning' : 'default'}
        />
      );
    },
  },
  {
    field: 'conversionRate',
    headerName: t('analytics.conversionRate'),
    width: 140,
    align: 'center',
    renderCell: (params) => {
      const banner = params.row as Banner & { clickCount: number; conversionCount: number };
      const conversionRate = banner.clickCount > 0 ? (banner.conversionCount / banner.clickCount) * 100 : 0;
      return (
        <Chip
          label={formatPercentage(conversionRate)}
          size="small"
          color={conversionRate > 10 ? 'success' : conversionRate > 5 ? 'warning' : 'default'}
        />
      );
    },
  },
  {
    field: 'isActive',
    headerName: t('analytics.status'),
    width: 100,
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.value ? t('stats.active') : t('stats.inactive')}
        size="small"
        color={params.value ? 'success' : 'default'}
      />
    ),
  },
];

export const BannerAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('banners');
  const [timeRange, setTimeRange] = useState('30d');
  const [locationFilter, setLocationFilter] = useState('');

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useBannersAnalytics();

  if (analyticsLoading) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/banners')}
            variant="outlined"
          >
            العودة
          </Button>
          <Typography variant="h4">تحليل البانرات</Typography>
        </Box>
        <LoadingSkeleton />
      </Box>
    );
  }

  if (analyticsError) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/banners')}
            variant="outlined"
          >
            العودة
          </Button>
          <Typography variant="h4">تحليل البانرات</Typography>
        </Box>
        <Alert severity="error">{t('analytics.error')}</Alert>
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
    topPerformingBanners = [],
  } = analytics || {};

  const activePercentage = totalBanners > 0 ? (activeBanners / totalBanners) * 100 : 0;
  const ctrPercentage = (averageClickThroughRate || 0) * 100;
  const conversionPercentage = (averageConversionRate || 0) * 100;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/banners')}
            variant="outlined"
          >
            {t('back')}
          </Button>
          <Analytics fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            {t('analytics.pageTitle')}
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('analytics.timeRange.label')}</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label={t('analytics.timeRange.label')}
            >
              <MenuItem value="7d">{t('analytics.timeRange.7days')}</MenuItem>
              <MenuItem value="30d">{t('analytics.timeRange.30days')}</MenuItem>
              <MenuItem value="90d">{t('analytics.timeRange.90days')}</MenuItem>
              <MenuItem value="1y">{t('analytics.timeRange.1year')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('analytics.location.label')}</InputLabel>
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              label={t('analytics.location.label')}
            >
              <MenuItem value="">{t('analytics.location.all')}</MenuItem>
              {BANNER_LOCATION_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title={t('stats.totalBanners')}
          value={formatNumber(totalBanners)}
          subtitle={t('stats.activeInactive', { active: activeBanners, inactive: inactiveBanners })}
          icon={<Campaign />}
          color="primary"
        />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('stats.totalViews')}
            value={formatNumber(totalViews)}
            subtitle={t('stats.allBanners')}
            icon={<Visibility />}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('stats.totalClicks')}
            value={formatNumber(totalClicks)}
            subtitle={t('stats.clickRate', { rate: formatPercentage(ctrPercentage) })}
            icon={<AdsClick />}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={t('stats.totalConversions')}
            value={formatNumber(totalConversions)}
            subtitle={t('stats.conversionRate', { rate: formatPercentage(conversionPercentage) })}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Performance Indicators */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('stats.statusChart')}
            </Typography>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{t('stats.activeBanners')}</Typography>
                <Typography variant="body2">{formatPercentage(activePercentage)}</Typography>
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
                {activeBanners} {t('stats.active')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {inactiveBanners} {t('stats.inactive')}
              </Typography>
            </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('stats.performanceChart')}
            </Typography>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{t('stats.clickRateLabel')}</Typography>
                <Typography variant="body2">{formatPercentage(ctrPercentage)}</Typography>
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
                <Typography variant="body2">{t('stats.conversionRateLabel')}</Typography>
                <Typography variant="body2">{formatPercentage(conversionPercentage)}</Typography>
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

      {/* Top Performing Banners */}
      <DataTable
        title={t('analytics.topBanners')}
        columns={getTopBannersColumns(t)}
        rows={topPerformingBanners || []}
        loading={false}
        paginationModel={{ page: 0, pageSize: 10 }}
        onPaginationModelChange={() => {}}
        getRowId={(row) => (row as Banner)._id}
        height="500px"
      />
    </Box>
  );
};
