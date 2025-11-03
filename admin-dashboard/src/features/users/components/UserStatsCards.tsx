import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Engineering as EngineeringIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { UserStats } from '../types/user.types';
import { useTranslation } from 'react-i18next';

interface UserStatsCardsProps {
  stats: UserStats;
  loading?: boolean;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats, loading = false }) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statsData = [
    {
      title: t('users:stats.total', 'إجمالي المستخدمين'),
      value: stats.total,
      icon: <PeopleIcon />,
      color: 'primary',
      percentage: 100,
    },
    {
      title: t('users:stats.active', 'المستخدمين النشطين'),
      value: stats.active,
      icon: <PersonIcon />,
      color: 'success',
      percentage: stats.total > 0 ? (stats.active / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.suspended', 'المستخدمين المعلقين'),
      value: stats.suspended,
      icon: <BlockIcon />,
      color: 'warning',
      percentage: stats.total > 0 ? (stats.suspended / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.deleted', 'المستخدمين المحذوفين'),
      value: stats.deleted,
      icon: <DeleteIcon />,
      color: 'error',
      percentage: stats.total > 0 ? (stats.deleted / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.admins', 'المديرين'),
      value: stats.admins,
      icon: <AdminIcon />,
      color: 'info',
      percentage: stats.total > 0 ? (stats.admins / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.engineers', 'المهندسين'),
      value: stats.engineers,
      icon: <EngineeringIcon />,
      color: 'secondary',
      percentage: stats.total > 0 ? (stats.engineers / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.merchants', 'التجار'),
      value: stats.merchants,
      icon: <StoreIcon />,
      color: 'success',
      percentage: stats.total > 0 ? (stats.merchants / stats.total) * 100 : 0,
    },
    {
      title: t('users:stats.users', 'المستخدمين العاديين'),
      value: stats.users,
      icon: <PersonIcon />,
      color: 'info',
      percentage: stats.total > 0 ? (stats.users / stats.total) * 100 : 0,
    },
  ];

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          mb: { xs: 2, sm: 2 },
          fontSize: { xs: '1rem', sm: '1.125rem' },
          color: 'text.primary',
        }}
      >
        {t('users:stats.title', 'إحصائيات المستخدمين')}
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 2 }}>
        {statsData.map((stat, index) => (
          <Grid component="div" size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark' ? 4 : 3,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: { xs: 1.5, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: 1,
                      backgroundColor: theme.palette.mode === 'dark'
                        ? `${stat.color}.dark`
                        : `${stat.color}.light`,
                      color: `${stat.color}.main`,
                      mr: { xs: 0, sm: 2 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.cloneElement(stat.icon as React.ReactElement, {
                      sx: { fontSize: { xs: 20, sm: 24 } },
                    })}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      textAlign: { xs: 'center', sm: 'left' },
                    }}
                  >
                    {stat.title}
                  </Typography>
                </Box>

                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    color: 'text.primary',
                  }}
                >
                  {loading ? '...' : stat.value.toLocaleString('en-US')}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={stat.percentage}
                    sx={{
                      flexGrow: 1,
                      height: { xs: 6, sm: 8 },
                      borderRadius: 1,
                      backgroundColor: theme.palette.mode === 'dark'
                        ? `${stat.color}.dark`
                        : `${stat.color}.light`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `${stat.color}.main`,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: 40 }}
                  >
                    {stat.percentage.toFixed(1)}%
                  </Typography>
                </Box>

                <Chip
                  label={t('users:stats.percentageOfTotal', '{{percentage}}% من الإجمالي', {
                    percentage: stat.percentage.toFixed(1),
                  })}
                  size="small"
                  color={stat.color as any}
                  variant="outlined"
                  sx={{
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    height: { xs: 20, sm: 24 },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
