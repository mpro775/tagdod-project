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
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
          {subtitle && (
            <Typography color="textSecondary" variant="body2">
              {subtitle}
            </Typography>
          )}
          {trend && (
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
              >
                {Math.abs(trend.value)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            p: 1.5,
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

export const ServicesOverviewPage: React.FC = () => {
  const { data: stats, isLoading } = useOverviewStatistics();

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          نظرة عامة على الخدمات
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        نظرة عامة على الخدمات
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* إحصائيات عامة */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الطلبات"
            value={formatNumber(stats.totalRequests)}
            icon={<RequestQuote sx={{ color: 'white' }} />}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي العروض"
            value={formatNumber(stats.totalOffers)}
            icon={<Engineering sx={{ color: 'white' }} />}
            color="info.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="المهندسين النشطين"
            value={formatNumber(stats.totalEngineers)}
            icon={<People sx={{ color: 'white' }} />}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الإيرادات"
            value={formatCurrency(stats.totalRevenue)}
            icon={<AttachMoney sx={{ color: 'white' }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* معدلات الإنجاز */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                معدل إنجاز الطلبات
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" color="primary">
                  {stats.completionRate}%
                </Typography>
                <Chip
                  icon={<CheckCircle />}
                  label={`${stats.completedRequests} مكتمل`}
                  color="success"
                  sx={{ ml: 2 }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Number(stats.completionRate)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="textSecondary" mt={1}>
                من أصل {stats.totalRequests} طلب
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* التقييم المتوسط */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                التقييم المتوسط
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h3" color="warning.main">
                  {stats.averageRating}
                </Typography>
                <Star sx={{ ml: 1, color: 'warning.main' }} />
                <Chip
                  label="من 5"
                  variant="outlined"
                  sx={{ ml: 2 }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.averageRating / 5) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="textSecondary" mt={1}>
                بناءً على تقييمات العملاء
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* الطلبات حسب الفترة */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الطلبات اليوم
              </Typography>
              <Typography variant="h3" color="primary">
                {formatNumber(stats.dailyRequests)}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                طلبات جديدة اليوم
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الطلبات هذا الأسبوع
              </Typography>
              <Typography variant="h3" color="info.main">
                {formatNumber(stats.weeklyRequests)}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                طلبات جديدة هذا الأسبوع
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                الطلبات هذا الشهر
              </Typography>
              <Typography variant="h3" color="success.main">
                {formatNumber(stats.monthlyRequests)}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                طلبات جديدة هذا الشهر
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Divider />
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h6">
            ملخص الحالات
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              icon={<CheckCircle />}
              label={`${stats.completedRequests} مكتمل`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<Cancel />}
              label={`${stats.cancelledRequests} ملغي`}
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
