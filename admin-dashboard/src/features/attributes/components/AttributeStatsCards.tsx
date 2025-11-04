import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Typography, Box, Skeleton, Grid } from '@mui/material';
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
    <CardContent
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: { xs: 2, sm: 3 },
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ color: `${color}.main` }}>{icon}</Box>
      </Box>
      <Typography variant="h3" fontWeight="bold" color={`${color}.main`} gutterBottom sx={{ textAlign: 'center', width: '100%' }}>
        {value ? value.toLocaleString() : '0'}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', width: '100%', mb: subtitle ? 1 : 0 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
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
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: { xs: 2, sm: 3 },
            height: '100%',
          }}
        >
          <Category color="primary" sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>{t('stats.typeDistribution')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('stats.noData')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const typeData = [
    { key: 'select', label: t('typeLabels.select'), value: stats.byType.select || 0, icon: SelectAll, color: 'primary' },
    { key: 'multiselect', label: t('typeLabels.multiselect'), value: stats.byType.multiselect || 0, icon: SelectAll, color: 'secondary' },
    { key: 'text', label: t('typeLabels.text'), value: stats.byType.text || 0, icon: TextFields, color: 'info' },
    { key: 'number', label: t('typeLabels.number'), value: stats.byType.number || 0, icon: Numbers, color: 'warning' },
    { key: 'boolean', label: t('typeLabels.boolean'), value: stats.byType.boolean || 0, icon: ToggleOn, color: 'success' },
    { key: 'color', label: t('typeLabels.color'), value: stats.byType.color || 0, icon: ColorLens, color: 'warning' },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: { xs: 2, sm: 3 },
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Category color="primary" />
        </Box>
        <Typography variant="h6" sx={{ mb: 2.5, textAlign: 'center', width: '100%' }}>
          {t('stats.typeDistribution')}
        </Typography>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%' }}>
          {typeData.map((type) => {
            const IconComponent = type.icon;
            return (
              <Grid size={{ xs: 6 }} key={type.key}>
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    height: '100%',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: `${type.color}.main`,
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <IconComponent fontSize="small" color={type.color as any} />
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={`${type.color}.main`}
                    sx={{ mb: 0.5 }}
                  >
                    {type.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      display: 'block',
                    }}
                  >
                    {type.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
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
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Grid size={{ xs: 6, sm: 6, md: 2.4 }} key={i}>
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
    <>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <StatCard
            title={t('stats.totalAttributes')}
            value={stats.total}
            icon={<Category />}
            color="primary"
            subtitle={t('stats.totalDesc')}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <StatCard
            title={t('stats.activeAttributes')}
            value={stats.active}
            icon={<CheckCircle />}
            color="success"
            subtitle={t('stats.activeDesc', { percentage: ((stats.active / stats.total) * 100).toFixed(1) })}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <StatCard
            title={t('stats.filterableAttributes')}
            value={stats.filterable}
            icon={<FilterAlt />}
            color="info"
            subtitle={t('stats.filterableDesc', { percentage: ((stats.filterable / stats.total) * 100).toFixed(1) })}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
          <StatCard
            title={t('stats.usageRate')}
            value={Math.round((stats.active / stats.total) * 100)}
            icon={<TrendingUp />}
            color="warning"
            subtitle={t('stats.usageDesc')}
          />
        </Grid>
      </Grid>

      {/* Type Distribution Card - Full Width */}
      <Box sx={{ mt: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={{ xs: 12 }}>
            <TypeStatsCard stats={stats} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
