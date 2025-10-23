import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Support,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Person,
} from '@mui/icons-material';
import { SupportStats, SupportCategory, SupportPriority } from '../types/support.types';

interface SupportStatsCardsProps {
  stats: SupportStats;
  isLoading?: boolean;
}

const getCategoryLabel = (category: SupportCategory): string => {
  switch (category) {
    case SupportCategory.TECHNICAL:
      return 'تقني';
    case SupportCategory.BILLING:
      return 'الفواتير';
    case SupportCategory.PRODUCTS:
      return 'المنتجات';
    case SupportCategory.SERVICES:
      return 'الخدمات';
    case SupportCategory.ACCOUNT:
      return 'الحساب';
    case SupportCategory.OTHER:
      return 'أخرى';
    default:
      return 'غير محدد';
  }
};

const getPriorityLabel = (priority: SupportPriority): string => {
  switch (priority) {
    case SupportPriority.LOW:
      return 'منخفضة';
    case SupportPriority.MEDIUM:
      return 'متوسطة';
    case SupportPriority.HIGH:
      return 'عالية';
    case SupportPriority.URGENT:
      return 'عاجلة';
    default:
      return 'غير محدد';
  }
};

const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} دقيقة`;
  } else if (minutes < 1440) {
    return `${Math.round(minutes / 60)} ساعة`;
  } else {
    return `${Math.round(minutes / 1440)} يوم`;
  }
};

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <LinearProgress />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const totalTickets = stats.total;
  const resolvedPercentage = totalTickets > 0 ? (stats.resolved / totalTickets) * 100 : 0;
  const slaBreachPercentage = totalTickets > 0 ? (stats.slaBreached / totalTickets) * 100 : 0;

  return (
    <Grid container spacing={3}>
      {/* إجمالي التذاكر */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  إجمالي التذاكر
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total}
                </Typography>
              </Box>
              <Support color="primary" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المفتوحة */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  التذاكر المفتوحة
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  {stats.open}
                </Typography>
              </Box>
              <Schedule color="warning" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المحلولة */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  التذاكر المحلولة
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {stats.resolved}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={resolvedPercentage}
                  color="success"
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {resolvedPercentage.toFixed(1)}% من إجمالي التذاكر
                </Typography>
              </Box>
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* متوسط وقت الاستجابة */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  متوسط وقت الاستجابة
                </Typography>
                <Typography variant="h4" component="div">
                  {formatTime(stats.averageResponseTime)}
                </Typography>
              </Box>
              <TrendingUp color="info" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* متوسط وقت الحل */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  متوسط وقت الحل
                </Typography>
                <Typography variant="h4" component="div">
                  {formatTime(stats.averageResolutionTime)}
                </Typography>
              </Box>
              <Person color="secondary" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المتجاوزة للـ SLA */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  متجاوزة SLA
                </Typography>
                <Typography variant="h4" component="div" color="error.main">
                  {stats.slaBreached}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={slaBreachPercentage}
                  color="error"
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {slaBreachPercentage.toFixed(1)}% من إجمالي التذاكر
                </Typography>
              </Box>
              <Warning color="error" sx={{ fontSize: 40 }} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التوزيع حسب الفئة */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              التوزيع حسب الفئة
            </Typography>
            <Stack spacing={1}>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Box key={category}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {getCategoryLabel(category as SupportCategory)}
                    </Typography>
                    <Chip label={count} size="small" />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={totalTickets > 0 ? (count / totalTickets) * 100 : 0}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التوزيع حسب الأولوية */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              التوزيع حسب الأولوية
            </Typography>
            <Stack spacing={1}>
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <Box key={priority}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {getPriorityLabel(priority as SupportPriority)}
                    </Typography>
                    <Chip label={count} size="small" />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={totalTickets > 0 ? (count / totalTickets) * 100 : 0}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SupportStatsCards;
