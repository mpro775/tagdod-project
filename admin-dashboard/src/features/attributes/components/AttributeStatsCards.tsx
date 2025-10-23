import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Skeleton, Chip, Stack } from '@mui/material';
import {
  Category,
  CheckCircle,
  FilterAlt,
  TrendingUp,
  TextFields,
  Numbers,
  ToggleOn,
  SelectAll,
} from '@mui/icons-material';
import type { AttributeStats } from '../types/attribute.types';

interface AttributeStatsCardsProps {
  stats?: AttributeStats;
  isLoading?: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'info' | 'warning' | 'error';
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: `${color}.main`, mr: 1 }}>{icon}</Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight="bold" color={`${color}.main`} gutterBottom>
        {value.toLocaleString()}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const TypeStatsCard: React.FC<{ stats: AttributeStats }> = ({ stats }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Category color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">التوزيع حسب النوع</Typography>
      </Box>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SelectAll fontSize="small" color="primary" />
            <Typography variant="body2">اختيار واحد</Typography>
          </Box>
          <Chip label={stats.byType.select} color="primary" size="small" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SelectAll fontSize="small" color="secondary" />
            <Typography variant="body2">اختيار متعدد</Typography>
          </Box>
          <Chip label={stats.byType.multiselect} color="secondary" size="small" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextFields fontSize="small" color="info" />
            <Typography variant="body2">نص</Typography>
          </Box>
          <Chip label={stats.byType.text} color="info" size="small" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Numbers fontSize="small" color="warning" />
            <Typography variant="body2">رقم</Typography>
          </Box>
          <Chip label={stats.byType.number} color="warning" size="small" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleOn fontSize="small" color="success" />
            <Typography variant="body2">نعم/لا</Typography>
          </Box>
          <Chip label={stats.byType.boolean} color="success" size="small" />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export const AttributeStatsCards: React.FC<AttributeStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          title="إجمالي السمات"
          value={stats.total}
          icon={<Category />}
          color="primary"
          subtitle="جميع السمات في النظام"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          title="السمات النشطة"
          value={stats.active}
          icon={<CheckCircle />}
          color="success"
          subtitle={`${((stats.active / stats.total) * 100).toFixed(1)}% من الإجمالي`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          title="قابلة للفلترة"
          value={stats.filterable}
          icon={<FilterAlt />}
          color="info"
          subtitle={`${((stats.filterable / stats.total) * 100).toFixed(1)}% من الإجمالي`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          title="معدل الاستخدام"
          value={Math.round((stats.active / stats.total) * 100)}
          icon={<TrendingUp />}
          color="warning"
          subtitle="نسبة السمات النشطة"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <TypeStatsCard stats={stats} />
      </Grid>
    </Grid>
  );
};
