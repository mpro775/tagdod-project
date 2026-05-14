import React from 'react';
import { Box, Paper, Typography, Grid, Chip, useTheme } from '@mui/material';
import { Assignment, CheckCircle, HourglassEmpty, Star, Web, Timeline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useProjectStats } from '../hooks/useProjects';

export const ProjectStatsCards: React.FC = () => {
  const { t } = useTranslation('projects');
  const theme = useTheme();
  const { data: stats } = useProjectStats();

  const cards = [
    { label: 'إجمالي المشاريع', value: stats?.total ?? 0, icon: <Assignment />, color: theme.palette.primary.main },
    { label: 'منشور', value: stats?.published ?? 0, icon: <CheckCircle />, color: theme.palette.success.main },
    { label: 'قيد التنفيذ', value: stats?.inProgress ?? 0, icon: <HourglassEmpty />, color: theme.palette.warning.main },
    { label: 'مكتمل', value: stats?.completed ?? 0, icon: <Timeline />, color: theme.palette.info.main },
    { label: 'مميز', value: stats?.featured ?? 0, icon: <Star />, color: theme.palette.secondary.main },
    { label: 'معروض في الصفحة', value: stats?.onLanding ?? 0, icon: <Web />, color: theme.palette.error.main },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card, i) => (
        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
          <Paper sx={{ p: 2, textAlign: 'center', border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
            <Typography variant="h5" fontWeight="bold">{card.value}</Typography>
            <Typography variant="caption" color="text.secondary">{card.label}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
