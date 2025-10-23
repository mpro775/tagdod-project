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
  Badge,
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
}> = ({ title, value, icon, color, trend, subtitle, loading = false }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Typography color="textSecondary" gutterBottom variant="body2" sx={{ mb: 1 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="60%" height={40} />
          ) : (
            <Typography variant="h4" component="h2" sx={{ mb: 1 }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
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
              >
                {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            backgroundColor: color,
            width: 56,
            height: 56,
            boxShadow: 2,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export const ServicesOverviewPage: React.FC = () => {
  const { data: stats, isLoading, error, refetch } = useOverviewStatistics();

  if (isLoading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            نظرة عامة على الخدمات
          </Typography>
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} item xs={12} sm={6} md={3}>
              <StatCard
                title="جاري التحميل..."
                value=""
                icon={<RequestQuote />}
                color="grey.300"
                loading={true}
              />
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            نظرة عامة على الخدمات
          </Typography>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </Box>
        <Alert severity="error">
          فشل في تحميل البيانات: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            نظرة عامة على الخدمات
          </Typography>
          <Typography variant="body1" color="textSecondary">
            إحصائيات شاملة عن أداء النظام والخدمات
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            size="small"
          >
            تحديث
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            size="small"
          >
            تقرير مفصل
          </Button>
        </Stack>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* إحصائيات عامة */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الطلبات"
            value={formatNumber(stats.totalRequests)}
            icon={<RequestQuote sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="primary.main"
            subtitle="جميع الطلبات المقدمة"
            trend={{ value: 12, isPositive: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي العروض"
            value={formatNumber(stats.totalOffers)}
            icon={<Engineering sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="info.main"
            subtitle="عروض المهندسين"
            trend={{ value: 8, isPositive: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المهندسين النشطين"
            value={formatNumber(stats.totalEngineers)}
            icon={<People sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="success.main"
            subtitle="مهندسين مسجلين"
            trend={{ value: 5, isPositive: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الإيرادات"
            value={formatCurrency(stats.totalRevenue)}
            icon={<AttachMoney sx={{ color: 'white', fontSize: '1.5rem' }} />}
            color="warning.main"
            subtitle="إجمالي الأرباح"
            trend={{ value: 15, isPositive: true }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* معدلات الإنجاز */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  معدل إنجاز الطلبات
                </Typography>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Speed />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" color="primary" sx={{ mr: 2 }}>
                  {stats.completionRate}%
                </Typography>
                <Chip
                  icon={<CheckCircle />}
                  label={`${stats.completedRequests} مكتمل`}
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
              <Typography variant="body2" color="textSecondary">
                من أصل {stats.totalRequests} طلب
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* التقييم المتوسط */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  التقييم المتوسط
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Star />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" color="warning.main" sx={{ mr: 2 }}>
                  {stats.averageRating}
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
              <Typography variant="body2" color="textSecondary">
                بناءً على تقييمات العملاء
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* الطلبات حسب الفترة */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  الطلبات اليوم
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                {formatNumber(stats.dailyRequests)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                طلبات جديدة اليوم
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  الطلبات هذا الأسبوع
                </Typography>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Typography variant="h3" color="info.main" sx={{ mb: 1 }}>
                {formatNumber(stats.weeklyRequests)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                طلبات جديدة هذا الأسبوع
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  الطلبات هذا الشهر
                </Typography>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Timeline />
                </Avatar>
              </Box>
              <Typography variant="h3" color="success.main" sx={{ mb: 1 }}>
                {formatNumber(stats.monthlyRequests)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                طلبات جديدة هذا الشهر
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            ملخص الحالات
          </Typography>
          <Button variant="outlined" size="small" startIcon={<Assessment />}>
            عرض التفاصيل
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              <Typography variant="body2" color="textSecondary">
                مكتمل:
              </Typography>
              <Typography variant="h6" color="success.main">
                {stats.completedRequests}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Cancel color="error" />
              <Typography variant="body2" color="textSecondary">
                ملغي:
              </Typography>
              <Typography variant="h6" color="error.main">
                {stats.cancelledRequests}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Engineering color="primary" />
              <Typography variant="body2" color="textSecondary">
                المهندسين:
              </Typography>
              <Typography variant="h6" color="primary.main">
                {stats.totalEngineers}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney color="warning" />
              <Typography variant="body2" color="textSecondary">
                الإيرادات:
              </Typography>
              <Typography variant="h6" color="warning.main">
                {formatCurrency(stats.totalRevenue)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
