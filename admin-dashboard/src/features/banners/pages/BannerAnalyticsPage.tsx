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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { useBannersAnalytics } from '../hooks/useBanners';
import { BANNER_LOCATION_OPTIONS } from '../types/banner.types';

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

export const BannerAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
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
            onClick={() => navigate('/admin/banners')}
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
            onClick={() => navigate('/admin/banners')}
            variant="outlined"
          >
            العودة
          </Button>
          <Typography variant="h4">تحليل البانرات</Typography>
        </Box>
        <Alert severity="error">فشل في تحميل بيانات التحليل</Alert>
      </Box>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    totalBanners,
    activeBanners,
    inactiveBanners,
    totalViews,
    totalClicks,
    totalConversions,
    averageClickThroughRate,
    averageConversionRate,
    topPerformingBanners,
  } = analytics;

  const activePercentage = totalBanners > 0 ? (activeBanners / totalBanners) * 100 : 0;
  const ctrPercentage = averageClickThroughRate * 100;
  const conversionPercentage = averageConversionRate * 100;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/banners')}
            variant="outlined"
          >
            العودة
          </Button>
          <Analytics fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            تحليل البانرات
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>الفترة الزمنية</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="الفترة الزمنية"
            >
              <MenuItem value="7d">آخر 7 أيام</MenuItem>
              <MenuItem value="30d">آخر 30 يوم</MenuItem>
              <MenuItem value="90d">آخر 90 يوم</MenuItem>
              <MenuItem value="1y">آخر سنة</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>موقع العرض</InputLabel>
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              label="موقع العرض"
            >
              <MenuItem value="">جميع المواقع</MenuItem>
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
            title="إجمالي البانرات"
            value={formatNumber(totalBanners)}
            subtitle={`${activeBanners} نشط، ${inactiveBanners} غير نشط`}
            icon={<Campaign />}
            color="primary"
            trend={{
              value: 12,
              direction: 'up',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="إجمالي المشاهدات"
            value={formatNumber(totalViews)}
            subtitle="جميع البانرات"
            icon={<Visibility />}
            color="info"
            trend={{
              value: 8,
              direction: 'up',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="إجمالي النقرات"
            value={formatNumber(totalClicks)}
            subtitle={`معدل النقر: ${formatPercentage(ctrPercentage)}`}
            icon={<AdsClick />}
            color="success"
            trend={{
              value: 15,
              direction: 'up',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="إجمالي التحويلات"
            value={formatNumber(totalConversions)}
            subtitle={`معدل التحويل: ${formatPercentage(conversionPercentage)}`}
            icon={<TrendingUp />}
            color="warning"
            trend={{
              value: 5,
              direction: 'up',
            }}
          />
        </Grid>
      </Grid>

      {/* Performance Indicators */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                حالة البانرات
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">البانرات النشطة</Typography>
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
                  <Typography variant="body2">معدل التحويل</Typography>
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
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            أفضل البانرات أداءً
          </Typography>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[100],
                }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>البانر</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>المشاهدات</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>النقرات</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>التحويلات</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>معدل النقر</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>معدل التحويل</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>الحالة</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPerformingBanners.map((banner) => {
                  const ctr =
                    banner.viewCount > 0 ? (banner.clickCount / banner.viewCount) * 100 : 0;
                  const conversionRate =
                    banner.clickCount > 0 ? (banner.conversionCount / banner.clickCount) * 100 : 0;

                  return (
                    <TableRow key={banner._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={banner.imageUrl}
                            alt={banner.title}
                            variant="rounded"
                            sx={{ width: 40, height: 30 }}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {banner.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {
                                BANNER_LOCATION_OPTIONS.find((opt) => opt.value === banner.location)
                                  ?.label
                              }
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{formatNumber(banner.viewCount)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{formatNumber(banner.clickCount)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatNumber(banner.conversionCount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={formatPercentage(ctr)}
                          size="small"
                          color={ctr > 5 ? 'success' : ctr > 2 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={formatPercentage(conversionRate)}
                          size="small"
                          color={
                            conversionRate > 10
                              ? 'success'
                              : conversionRate > 5
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={banner.isActive ? 'نشط' : 'غير نشط'}
                          size="small"
                          color={banner.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
