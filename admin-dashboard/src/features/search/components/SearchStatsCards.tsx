import { Card, CardContent, Typography, Box, Skeleton, Grid  } from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSearchStats } from '../hooks/useSearch';

export function SearchStatsCards() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useSearchStats();

  const cards = [
    {
      title: t('search.stats.totalSearches', { defaultValue: 'عدد البحث الكلي' }),
      value: stats?.totalSearches || 0,
      icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#3f51b5',
    },
    {
      title: t('search.stats.uniqueQueries', { defaultValue: 'عدد المصطلحات المميزة' }),
      value: stats?.totalUniqueQueries || 0,
      icon: <TrendingIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#2196f3',
    },
    {
      title: t('search.stats.averageResponseTime', { defaultValue: 'متوسط وقت الاستجابة' }),
      value: `${stats?.averageResponseTime || 0} ms`,
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#4caf50',
    },
    {
      title: t('search.stats.zeroResultsPercentage', { defaultValue: 'نسبة النتائج الصفرية' }),
      value: `${stats?.zeroResultsPercentage?.toFixed(1) || 0}%`,
      icon: <ErrorIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ff9800',
    },
  ];

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={100} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease',
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
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                {card.icon}
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
                {typeof card.value === 'number' ? card.value.toLocaleString('ar') : card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

