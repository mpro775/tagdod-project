import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Chip, useTheme } from '@mui/material';
import {
  People,
  OnlinePrediction,
  Today,
  Schedule,
  PersonOff,
  Login,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface UserActivityStats {
  totalUsers: number;
  activeNow: number;
  activeToday: number;
  activeThisWeek: number;
  inactiveUsers: number;
  neverLoggedIn: number;
  activityRate: number;
}

interface ActivityKPICardsProps {
  stats: UserActivityStats | null;
}

export const ActivityKPICards: React.FC<ActivityKPICardsProps> = ({ stats }) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();

  if (!stats) return null;

  const safeStats = {
    totalUsers: stats.totalUsers ?? 0,
    activeNow: stats.activeNow ?? 0,
    activeToday: stats.activeToday ?? 0,
    activeThisWeek: stats.activeThisWeek ?? 0,
    inactiveUsers: stats.inactiveUsers ?? 0,
    neverLoggedIn: stats.neverLoggedIn ?? 0,
    activityRate: stats.activityRate ?? 0,
  };

  const cards = [
    {
      title: t('users:activity.kpi.totalUsers', 'إجمالي المستخدمين'),
      value: safeStats.totalUsers.toLocaleString('en-US'),
      icon: People,
      color: 'primary',
      chip: `${safeStats.activityRate}% ${t('users:activity.kpi.activeRate', 'نشط')}`,
      chipColor: 'success' as const,
    },
    {
      title: t('users:activity.kpi.activeNow', 'نشطين الآن'),
      value: safeStats.activeNow.toLocaleString('en-US'),
      icon: OnlinePrediction,
      color: 'success',
      chip: t('users:activity.kpi.last15min', 'آخر 15 دقيقة'),
      chipColor: 'success' as const,
    },
    {
      title: t('users:activity.kpi.activeToday', 'نشطين اليوم'),
      value: safeStats.activeToday.toLocaleString('en-US'),
      icon: Today,
      color: 'info',
      chip: t('users:activity.kpi.last24hours', 'آخر 24 ساعة'),
      chipColor: 'info' as const,
    },
    {
      title: t('users:activity.kpi.activeThisWeek', 'نشطين هذا الأسبوع'),
      value: safeStats.activeThisWeek.toLocaleString('en-US'),
      icon: Schedule,
      color: 'warning',
      chip: t('users:activity.kpi.last7days', 'آخر 7 أيام'),
      chipColor: 'warning' as const,
    },
    {
      title: t('users:activity.kpi.inactive', 'غير نشطين'),
      value: safeStats.inactiveUsers.toLocaleString('en-US'),
      icon: PersonOff,
      color: 'error',
      chip: t('users:activity.kpi.moreThan30days', 'أكثر من 30 يوم'),
      chipColor: 'error' as const,
    },
    {
      title: t('users:activity.kpi.neverLoggedIn', 'لم يدخلوا أبداً'),
      value: safeStats.neverLoggedIn.toLocaleString('en-US'),
      icon: Login,
      color: 'default',
      chip: t('users:activity.kpi.registeredOnly', 'مسجلين فقط'),
      chipColor: 'default' as const,
    },
  ];

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
      {cards.map((card, index) => (
        <Grid key={index} size={{ xs: 6, sm: 6, md: 4, lg: 2 }}>
          <Card
            sx={{
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <card.icon
                  sx={{
                    fontSize: { xs: 24, sm: 32 },
                    color: `${card.color}.main`,
                    mr: 1,
                  }}
                />
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}
                >
                  {card.value}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, mb: 1 }}
              >
                {card.title}
              </Typography>
              <Chip
                label={card.chip}
                size="small"
                color={card.chipColor}
                sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
