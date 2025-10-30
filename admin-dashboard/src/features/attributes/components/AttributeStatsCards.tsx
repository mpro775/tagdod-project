import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Box, Skeleton, Chip, Stack, Grid } from '@mui/material';
import {
  Category,
  CheckCircle,
  FilterAlt,
  TrendingUp,
  TextFields,
  Numbers,
  ToggleOn,
  SelectAll,
  ColorLens,
} from '@mui/icons-material';
import type { AttributeStats } from '../types/attribute.types';

interface AttributeStatsCardsProps {
  stats?: AttributeStats;
  isLoading?: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'info' | 'warning' | 'error';
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => {
  return (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: `${color}.main`, mr: 1 }}>{icon}</Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight="bold" color={`${color}.main`} gutterBottom>
        {value ? value.toLocaleString() : '0'}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

};

const TypeStatsCard: React.FC<{ stats: AttributeStats }> = ({ stats }) => {
  const { t } = useTranslation('attributes');

  // Safety check for byType property
  if (!stats.byType) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Category color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">{t('stats.typeDistribution')}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('stats.noData')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Category color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{t('stats.typeDistribution')}</Typography>
        </Box>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SelectAll fontSize="small" color="primary" />
              <Typography variant="body2">{t('typeLabels.select')}</Typography>
            </Box>
            <Chip label={stats.byType.select || 0} color="primary" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SelectAll fontSize="small" color="secondary" />
              <Typography variant="body2">{t('typeLabels.multiselect')}</Typography>
            </Box>
            <Chip label={stats.byType.multiselect || 0} color="secondary" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextFields fontSize="small" color="info" />
              <Typography variant="body2">{t('typeLabels.text')}</Typography>
            </Box>
            <Chip label={stats.byType.text || 0} color="info" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Numbers fontSize="small" color="warning" />
              <Typography variant="body2">{t('typeLabels.number')}</Typography>
            </Box>
            <Chip label={stats.byType.number || 0} color="warning" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ToggleOn fontSize="small" color="success" />
              <Typography variant="body2">{t('typeLabels.boolean')}</Typography>
            </Box>
            <Chip label={stats.byType.boolean || 0} color="success" size="small" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ColorLens fontSize="small" color="warning" />
              <Typography variant="body2">{t('typeLabels.color')}</Typography>
            </Box>
            <Chip label={stats.byType.color || 0} color="warning" size="small" />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const AttributeStatsCards: React.FC<AttributeStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation('attributes');
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
          title={t('stats.totalAttributes')}
          value={stats.total}
          icon={<Category />}
          color="primary"
          subtitle={t('stats.totalDesc')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          title={t('stats.activeAttributes')}
          value={stats.active}
          icon={<CheckCircle />}
          color="success"
          subtitle={t('stats.activeDesc', { percentage: ((stats.active / stats.total) * 100).toFixed(1) })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          title={t('stats.filterableAttributes')}
          value={stats.filterable}
          icon={<FilterAlt />}
          color="info"
          subtitle={t('stats.filterableDesc', { percentage: ((stats.filterable / stats.total) * 100).toFixed(1) })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <StatCard
          title={t('stats.usageRate')}
          value={Math.round((stats.active / stats.total) * 100)}
          icon={<TrendingUp />}
          color="warning"
          subtitle={t('stats.usageDesc')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
        <TypeStatsCard stats={stats} />
      </Grid>
    </Grid>
  );
};
