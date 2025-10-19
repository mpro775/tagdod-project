import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';
import { 
  Support, 
  TrendingUp, 
  AccessTime, 
  CheckCircle, 
  Error, 
  Warning,

} from '@mui/icons-material';
import { useSupportStats } from '../hooks/useSupport';
import { SupportCategory, SupportPriority } from '../types/support.types';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: color, opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const categoryLabels: Record<SupportCategory, string> = {
  technical: 'تقني',
  billing: 'فواتير',
  products: 'منتجات',
  services: 'خدمات',
  account: 'حساب',
  other: 'أخرى',
};

const priorityLabels: Record<SupportPriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};


export const SupportStatsPage: React.FC = () => {
  const { data: stats, isLoading } = useSupportStats();

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          إحصائيات الدعم الفني
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          إحصائيات الدعم الفني
        </Typography>
        <Typography variant="body1" color="text.secondary">
          لا توجد بيانات متاحة
        </Typography>
      </Box>
    );
  }

  const totalTickets = stats.total;
  const slaCompliance = totalTickets > 0 ? Math.round(((totalTickets - stats.slaBreached) / totalTickets) * 100) : 100;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        إحصائيات الدعم الفني
      </Typography>
      
      {/* Main Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="إجمالي التذاكر"
            value={stats.total.toLocaleString('ar-SA')}
            icon={<Support sx={{ fontSize: 30 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="التذاكر المفتوحة"
            value={stats.open.toLocaleString('ar-SA')}
            icon={<Error sx={{ fontSize: 30 }} />}
            color="error.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="المحلولة"
            value={stats.resolved.toLocaleString('ar-SA')}
            icon={<CheckCircle sx={{ fontSize: 30 }} />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="متأخرة عن SLA"
            value={stats.slaBreached.toLocaleString('ar-SA')}
            icon={<Warning sx={{ fontSize: 30 }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                متوسط وقت الاستجابة
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.averageResponseTime}h
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ساعات
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                متوسط وقت الحل
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.averageResolutionTime}h
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ساعات
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                معدل الامتثال لـ SLA
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ fontSize: 40, color: slaCompliance >= 90 ? 'success.main' : 'warning.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {slaCompliance}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    امتثال
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Breakdown by Category and Priority */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                التوزيع حسب الفئة
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {categoryLabels[category as SupportCategory]}
                    </Typography>
                    <Chip 
                      label={count} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                التوزيع حسب الأولوية
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(stats.byPriority).map(([priority, count]) => (
                  <Box key={priority} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {priorityLabels[priority as SupportPriority]}
                    </Typography>
                    <Chip 
                      label={count} 
                      size="small" 
                      color={
                        priority === 'urgent' ? 'error' :
                        priority === 'high' ? 'warning' :
                        priority === 'medium' ? 'primary' : 'default'
                      }
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
