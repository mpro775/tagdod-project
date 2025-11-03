import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Divider,
  Skeleton,
  Alert,
  Button,
  Stack,
  Paper,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Engineering,
  RequestQuote,
  Star,
  AttachMoney,
  CheckCircle,
  Cancel,
  Refresh,
  Assessment,
  Timeline,
  Speed,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useOverviewStatistics } from '../hooks/useServices';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
}> = ({ title, value, icon, color, trend, subtitle, loading = false }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'visible',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography color="text.secondary" gutterBottom variant="body2" sx={{ mb: 1 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} />
            ) : (
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  mb: 1,
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trend && !loading && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend.isPositive ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={trend.isPositive ? 'success.main' : 'error.main'}
                  ml={0.5}
                  fontWeight="medium"
                  sx={{
                    fontFeatureSettings: '"tnum"',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatNumber(Math.abs(trend.value), 'en')}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: color,
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              boxShadow: 2,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export const ServicesOverviewPage: React.FC = () => {
  const { t } = useTranslation('services');
  const theme = useTheme();
  const { data: stats, isLoading, error, refetch } = useOverviewStatistics();

  if (isLoading) {
    return (
      <Box>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={3}
        >
          <Box>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={300} height={24} sx={{ mt: 1 }} />
          </Box>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width={100} height={36} />
            <Skeleton variant="rectangular" width={140} height={36} />
          </Stack>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 6, md: 6 }}>
              <StatCard
                title={t('messages.loading')}
                value=""
                icon={<RequestQuote />}
                color="grey.300"
                loading={true}
              />
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 6 }}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Box display="flex" alignItems="center" mb={2} gap={1}>
                  <Skeleton variant="text" width={80} height={48} />
                  <Skeleton variant="rounded" width={120} height={24} />
                </Box>
                <Skeleton variant="rounded" height={12} sx={{ mb: 1, borderRadius: 6 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 6 }}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Box display="flex" alignItems="center" mb={2} gap={1}>
                  <Skeleton variant="text" width={60} height={48} />
                  <Stack direction="row" spacing={0.5}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Skeleton key={star} variant="circular" width={20} height={20} />
                    ))}
                  </Stack>
                </Box>
                <Skeleton variant="rounded" height={12} sx={{ mb: 1, borderRadius: 6 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Skeleton variant="text" width={100} height={48} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Skeleton variant="text" width={100} height={48} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Skeleton variant="text" width={100} height={48} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper 
          sx={{ 
            mt: 3, 
            p: { xs: 2, sm: 3 },
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
          }}
        >
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={2}
            mb={2}
          >
            <Skeleton variant="text" width={150} height={28} />
            <Skeleton variant="rectangular" width={120} height={32} />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width={100} height={24} />
                  <Skeleton variant="text" width={60} height={28} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={3}
        >
          <Typography variant="h4">
            {t('titles.servicesOverview')}
          </Typography>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()}>
            {t('messages.retry')}
          </Button>
        </Box>
        <Alert severity="error">
          {t('messages.failedToLoadData')}: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('titles.servicesOverview')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('stats.comprehensiveStats')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            size="small"
          >
            {t('labels.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            size="small"
          >
            {t('actions.detailedReport')}
          </Button>
        </Stack>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 6 }}>
          <StatCard
            title={t('stats.totalRequests')}
            value={formatNumber(stats.totalRequests, 'en')}
            icon={<RequestQuote sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="primary.main"
            subtitle={t('stats.allRequestsSubmitted')}
            trend={stats.trends?.requests}
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 6 }}>
          <StatCard
            title={t('stats.totalOffers')}
            value={formatNumber(stats.totalOffers, 'en')}
            icon={<Engineering sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="info.main"
            subtitle={t('stats.engineersOffers')}
            trend={stats.trends?.offers}
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 6 }}>
          <StatCard
            title={t('stats.totalEngineers')}
            value={formatNumber(stats.totalEngineers, 'en')}
            icon={<People sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="success.main"
            subtitle={t('stats.registeredEngineers')}
            trend={stats.trends?.engineers}
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 6 }}>
          <StatCard
            title={t('stats.totalRevenue')}
            value={formatCurrency(stats.totalRevenue, 'USD', 'en')}
            icon={<AttachMoney sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="warning.main"
            subtitle={t('stats.totalProfits')}
            trend={stats.trends?.revenue}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 6 }}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  {t('stats.completionRateTitle')}
                </Typography>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Speed />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography 
                  variant="h3" 
                  color="primary" 
                  sx={{ 
                    mr: 2,
                    fontFeatureSettings: '"tnum"',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatNumber(Number(stats.completionRate), 'en')}%
                </Typography>
                <Chip
                  icon={<CheckCircle />}
                  label={`${formatNumber(stats.completedRequests, 'en')} ${t('stats.completed')}`}
                  color="success"
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Number(stats.completionRate)}
                sx={{ height: 12, borderRadius: 6, mb: 1 }}
                color="success"
              />
              <Typography variant="body2" color="text.secondary">
                {t('stats.fromTotal')} {formatNumber(stats.totalRequests, 'en')} {t('stats.requests')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 6 }}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  {t('stats.averageRatingTitle')}
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Star />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography 
                  variant="h3" 
                  color="warning.main" 
                  sx={{ 
                    mr: 2,
                    fontFeatureSettings: '"tnum"',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatNumber(stats.averageRating, 'en')}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      sx={{
                        color: star <= Math.round(stats.averageRating) ? 'warning.main' : 'grey.300',
                        fontSize: '1.2rem'
                      }}
                    />
                  ))}
                </Stack>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.averageRating / 5) * 100}
                sx={{ height: 12, borderRadius: 6, mb: 1 }}
                color="warning"
              />
              <Typography variant="body2" color="text.secondary">
                {t('stats.basedOnCustomerRatings')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 6, md: 6 }}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  {t('stats.todayRequests')}
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Typography 
                variant="h3" 
                color="primary" 
                sx={{ 
                  mb: 1,
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatNumber(stats.dailyRequests, 'en')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.newRequestsToday')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 6 }}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  {t('stats.thisWeekRequests')}
                </Typography>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Typography 
                variant="h3" 
                color="info.main" 
                sx={{ 
                  mb: 1,
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatNumber(stats.weeklyRequests, 'en')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.newRequestsThisWeek')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            sx={{ 
              height: '100%',
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  {t('stats.thisMonthRequests')}
                </Typography>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Typography 
                variant="h3" 
                color="success.main" 
                sx={{ 
                  mb: 1,
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatNumber(stats.monthlyRequests, 'en')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('stats.newRequestsThisMonth')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper 
        sx={{ 
          mt: 3, 
          p: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
        }}
      >
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={2}
        >
          <Typography variant="h6">
            {t('stats.statusSummary')}
          </Typography>
          <Button variant="outlined" size="small" startIcon={<Assessment />}>
            {t('actions.viewDetails')}
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <CheckCircle color="success" />
              <Typography variant="body2" color="text.secondary">
                {t('stats.completed')}:
              </Typography>
              <Typography 
                variant="h6" 
                color="success.main"
                sx={{
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatNumber(stats.completedRequests, 'en')}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Cancel color="error" />
              <Typography variant="body2" color="text.secondary">
                {t('stats.cancelled')}:
              </Typography>
              <Typography 
                variant="h6" 
                color="error.main"
                sx={{
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatNumber(stats.cancelledRequests, 'en')}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Engineering color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t('stats.engineers')}:
              </Typography>
              <Typography 
                variant="h6" 
                color="primary.main"
                sx={{
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatNumber(stats.totalEngineers, 'en')}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <AttachMoney color="warning" />
              <Typography variant="body2" color="text.secondary">
                {t('stats.revenue')}:
              </Typography>
              <Typography 
                variant="h6" 
                color="warning.main"
                sx={{
                  fontFeatureSettings: '"tnum"',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(stats.totalRevenue, 'USD', 'en')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
