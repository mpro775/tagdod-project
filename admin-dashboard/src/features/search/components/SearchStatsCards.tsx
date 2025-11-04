import { Card, CardContent, Typography, Box, Skeleton, Grid, useTheme } from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSearchStats } from '../hooks/useSearch';

export function SearchStatsCards() {
  const { t } = useTranslation('search');
  const theme = useTheme();
  const { data: stats, isLoading } = useSearchStats();

  const cards = [
    {
      title: t('stats.totalSearches'),
      value: stats?.totalSearches || 0,
      icon: <SearchIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />,
      color: theme.palette.primary.main,
    },
    {
      title: t('stats.uniqueQueries'),
      value: stats?.totalUniqueQueries || 0,
      icon: <TrendingIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'info.main' }} />,
      color: theme.palette.info.main,
    },
    {
      title: t('stats.averageResponseTime'),
      value: `${stats?.averageResponseTime || 0} ms`,
      icon: <SpeedIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'success.main' }} />,
      color: theme.palette.success.main,
    },
    {
      title: t('stats.zeroResultsPercentage'),
      value: `${stats?.zeroResultsPercentage?.toFixed(1) || 0}%`,
      icon: <ErrorIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'warning.main' }} />,
      color: theme.palette.warning.main,
    },
  ];

  if (isLoading) {
    return (
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid component="div" size={{ xs: 6, sm: 6, md: 3 }} key={i}>
            <Card
              sx={{
                bgcolor: 'background.paper',
                boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Skeleton variant="rectangular" height={100} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {cards.map((card, index) => (
        <Grid component="div" size={{ xs: 6, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease-in-out',
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '4px',
                bgcolor: card.color,
              }}
            />
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: { xs: 1.5, sm: 2 } 
                }}
              >
                {card.icon}
              </Box>
              <Typography 
                variant="h4" 
                component="div" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  color: 'text.primary',
                }}
              >
                {typeof card.value === 'number' ? card.value.toLocaleString('ar') : card.value}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                }}
              >
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

