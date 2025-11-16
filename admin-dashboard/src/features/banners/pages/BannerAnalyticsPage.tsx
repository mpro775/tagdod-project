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
  useTheme,
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
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useBannersAnalytics } from '../hooks/useBanners';
import { BannerLocation } from '../types/banner.types';
import type { Banner } from '../types/banner.types';

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
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
}> = ({ title, value, subtitle, trend, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Typography 
              variant="h4" 
              component="div" 
              color={`${color}.main`} 
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {subtitle}
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

        {trend && (
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {getTrendIcon(trend.direction)}
            <Chip
              label={`${trend.direction === 'up' ? '+' : ''}${trend.value}%`}
              size="small"
              color={getTrendColor(trend.direction) as any}
              variant="outlined"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              من الشهر الماضي
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton: React.FC = () => (
  <Grid container spacing={{ xs: 2, sm: 3 }}>
    {[1, 2, 3, 4].map((item) => (
      <Grid size={{ xs: 6, sm: 6, md: 3 }} key={item}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box flex={1}>
                <Skeleton variant="text" width="60%" sx={{ height: { xs: 30, sm: 40 } }} />
                <Skeleton variant="text" width="40%" sx={{ height: { xs: 16, sm: 20 } }} />
              </Box>
              <Skeleton variant="circular" sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }} />
            </Box>
            <Skeleton variant="text" width="80%" sx={{ height: { xs: 16, sm: 20 } }} />
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
              {t(`form.location.${banner.location}`, { defaultValue: banner.location })}
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

// Analytics Banner Card for mobile view
const AnalyticsBannerCard: React.FC<{ banner: Banner & { imageUrl?: string } }> = ({ banner }) => {
  const { t } = useTranslation('banners');
  const ctr = banner.viewCount > 0 ? (banner.clickCount / banner.viewCount) * 100 : 0;
  const conversionRate = banner.clickCount > 0 ? (banner.conversionCount / banner.clickCount) * 100 : 0;

  return (
    <Card sx={{ bgcolor: 'background.paper', mb: 2 }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            src={banner.imageUrl}
            alt={banner.title}
            variant="rounded"
            sx={{ width: { xs: 50, sm: 60 }, height: { xs: 35, sm: 45 } }}
          />
          <Box flex={1}>
            <Typography 
              variant="body1" 
              fontWeight="bold"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {banner.title}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              {t(`form.location.${banner.location}`, { defaultValue: banner.location })}
            </Typography>
          </Box>
          <Chip
            label={banner.isActive ? t('stats.active') : t('stats.inactive')}
            size="small"
            color={banner.isActive ? 'success' : 'default'}
            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign="center">
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {t('analytics.views')}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {formatNumber(banner.viewCount || 0)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign="center">
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {t('analytics.clicks')}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {formatNumber(banner.clickCount || 0)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign="center">
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {t('analytics.conversions')}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {formatNumber(banner.conversionCount || 0)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box textAlign="center">
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {t('analytics.clickRate')}
              </Typography>
              <Chip
                label={formatPercentage(ctr)}
                size="small"
                color={ctr > 5 ? 'success' : ctr > 2 ? 'warning' : 'default'}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, mt: 0.5 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box textAlign="center" mt={1}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {t('analytics.conversionRate')}:{' '}
              </Typography>
              <Chip
                label={formatPercentage(conversionRate)}
                size="small"
                color={conversionRate > 10 ? 'success' : conversionRate > 5 ? 'warning' : 'default'}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const BannerAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('banners');
  const { isMobile } = useBreakpoint();
  const [timeRange, setTimeRange] = useState('30d');
  const [locationFilter, setLocationFilter] = useState('');

  // Location options with translations
  const locationOptions = [
    { value: BannerLocation.HOME_TOP },
    { value: BannerLocation.HOME_MIDDLE },
    { value: BannerLocation.HOME_BOTTOM },
    { value: BannerLocation.CATEGORY_TOP },
    { value: BannerLocation.PRODUCT_PAGE },
    { value: BannerLocation.CART_PAGE },
    { value: BannerLocation.CHECKOUT_PAGE },
    { value: BannerLocation.SIDEBAR },
    { value: BannerLocation.FOOTER },
  ];

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useBannersAnalytics();

  if (analyticsLoading) {
    return (
      <Box>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2} 
          mb={3}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/banners')}
            variant="outlined"
            size={isMobile ? 'medium' : 'large'}
          >
            {t('back')}
          </Button>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            {t('analytics.pageTitle')}
          </Typography>
        </Box>
        <LoadingSkeleton />
      </Box>
    );
  }

  if (analyticsError) {
    return (
      <Box>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2} 
          mb={3}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/banners')}
            variant="outlined"
            size={isMobile ? 'medium' : 'large'}
          >
            {t('back')}
          </Button>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            {t('analytics.pageTitle')}
          </Typography>
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
      <Box mb={3}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          gap={2}
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/banners')}
              variant="outlined"
              size={isMobile ? 'medium' : 'large'}
            >
              {t('back')}
            </Button>
            <Analytics fontSize={isMobile ? 'medium' : 'large'} color="primary" />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              {t('analytics.pageTitle')}
            </Typography>
          </Box>

          <Box 
            display="flex" 
            gap={2}
            flexDirection={{ xs: 'column', sm: 'row' }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <FormControl 
              size="small" 
              sx={{ minWidth: { xs: '100%', sm: 120 } }}
              fullWidth={isMobile}
            >
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

            <FormControl 
              size="small" 
              sx={{ minWidth: { xs: '100%', sm: 150 } }}
              fullWidth={isMobile}
            >
              <InputLabel>{t('analytics.location.label')}</InputLabel>
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                label={t('analytics.location.label')}
              >
                <MenuItem value="">{t('analytics.location.all')}</MenuItem>
                {locationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(`form.location.${option.value}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('stats.totalBanners')}
            value={formatNumber(totalBanners)}
            subtitle={t('stats.activeInactive', { active: activeBanners, inactive: inactiveBanners })}
            icon={<Campaign />}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('stats.totalViews')}
            value={formatNumber(totalViews)}
            subtitle={t('stats.allBanners')}
            icon={<Visibility />}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('stats.totalClicks')}
            value={formatNumber(totalClicks)}
            subtitle={`CTR: ${ctrPercentage.toFixed(1)}%`}
            icon={<AdsClick />}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <StatCard
            title={t('stats.totalConversions')}
            value={formatNumber(totalConversions)}
            subtitle={`تحويل: ${conversionPercentage.toFixed(1)}%`}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Performance Indicators */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {t('stats.statusChart')}
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('stats.activeBanners')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {formatPercentage(activePercentage)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={activePercentage}
                  color="success"
                  sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4 }}
                />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography 
                  variant="body2" 
                  color="success.main"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {activeBanners} {t('stats.active')}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {inactiveBanners} {t('stats.inactive')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {t('stats.performanceChart')}
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('stats.clickRateLabel')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {formatPercentage(ctrPercentage)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={ctrPercentage}
                  color="info"
                  sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4 }}
                />
              </Box>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {t('stats.conversionRateLabel')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {formatPercentage(conversionPercentage)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={conversionPercentage}
                  color="warning"
                  sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Performing Banners */}
      {isMobile ? (
        <Box>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 2 }}
          >
            {t('analytics.topBanners')}
          </Typography>
          {topPerformingBanners && topPerformingBanners.length > 0 ? (
            topPerformingBanners.map((banner) => (
              <AnalyticsBannerCard key={banner._id} banner={banner as Banner & { imageUrl?: string }} />
            ))
          ) : (
            <Box
              textAlign="center"
              py={4}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Analytics sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('analytics.noData') || 'لا توجد بيانات'}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
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
      )}
    </Box>
  );
};
