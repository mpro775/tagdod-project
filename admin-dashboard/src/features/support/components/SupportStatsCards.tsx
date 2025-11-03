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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Support, TrendingUp, Warning, CheckCircle, Schedule, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SupportStats, SupportCategory, SupportPriority } from '../types/support.types';

interface SupportStatsCardsProps {
  stats: SupportStats;
  isLoading?: boolean;
}

const getCategoryLabel = (category: SupportCategory, t: any): string => {
  return t(`category.${category}`);
};

const getPriorityLabel = (priority: SupportPriority, t: any): string => {
  return t(`priority.${priority}`);
};

const formatTime = (minutes: number, t: any): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} ${t('time.minutes')}`;
  } else if (minutes < 1440) {
    return `${Math.round(minutes / 60)} ${t('time.hours')}`;
  } else {
    return `${Math.round(minutes / 1440)} ${t('time.days')}`;
  }
};

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation('support');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (isLoading) {
    return (
      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        {[...Array(6)].map((_, index) => (
          <Grid size={{ xs: 6, sm: 6, md: 6 }} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <LinearProgress sx={{ height: { xs: 4, sm: 6 } }} />
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
    <Grid container spacing={{ xs: 1.5, sm: 3 }}>
      {/* إجمالي التذاكر */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              justifyContent="space-between"
              spacing={{ xs: 1, sm: 0 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  variant={isMobile ? 'caption' : 'body2'}
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                    {t('stats.totalTickets')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {stats.total}
                </Typography>
              </Box>
              <Support 
                color="primary" 
                sx={{ 
                  fontSize: { xs: 28, sm: 40 },
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' }
                }} 
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المفتوحة */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              justifyContent="space-between"
              spacing={{ xs: 1, sm: 0 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  variant={isMobile ? 'caption' : 'body2'}
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('stats.openTickets')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  component="div" 
                  color="warning.main"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {stats.open}
                </Typography>
              </Box>
              <Schedule 
                color="warning" 
                sx={{ 
                  fontSize: { xs: 28, sm: 40 },
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' }
                }} 
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المحلولة */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              justifyContent="space-between"
              spacing={{ xs: 1, sm: 0 }}
            >
              <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  variant={isMobile ? 'caption' : 'body2'}
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('stats.resolvedTickets')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  component="div" 
                  color="success.main"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {stats.resolved}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={resolvedPercentage}
                  color="success"
                  sx={{ mt: { xs: 0.5, sm: 1 }, height: { xs: 4, sm: 6 } }}
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  {resolvedPercentage.toFixed(1)}% {t('stats.percentageOfTotal')}
                </Typography>
              </Box>
              <CheckCircle 
                color="success" 
                sx={{ 
                  fontSize: { xs: 28, sm: 40 },
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' }
                }} 
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* متوسط وقت الاستجابة */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              justifyContent="space-between"
              spacing={{ xs: 1, sm: 0 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  variant={isMobile ? 'caption' : 'body2'}
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('stats.averageResponseTime')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '1.25rem', sm: '2.125rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {formatTime(stats.averageResponseTime, t)}
                </Typography>
              </Box>
              <TrendingUp 
                color="info" 
                sx={{ 
                  fontSize: { xs: 28, sm: 40 },
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' }
                }} 
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* متوسط وقت الحل */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              justifyContent="space-between"
              spacing={{ xs: 1, sm: 0 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  variant={isMobile ? 'caption' : 'body2'}
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('stats.averageResolutionTime')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  component="div"
                  sx={{ 
                    fontSize: { xs: '1.25rem', sm: '2.125rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {formatTime(stats.averageResolutionTime, t)}
                </Typography>
              </Box>
              <Person 
                color="secondary" 
                sx={{ 
                  fontSize: { xs: 28, sm: 40 },
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' }
                }} 
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التذاكر المتجاوزة للـ SLA */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              justifyContent="space-between"
              spacing={{ xs: 1, sm: 0 }}
            >
              <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  variant={isMobile ? 'caption' : 'body2'}
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t('stats.slaBreached')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  component="div" 
                  color="error.main"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                    wordBreak: 'break-word'
                  }}
                >
                  {stats.slaBreached}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={slaBreachPercentage}
                  color="error"
                  sx={{ mt: { xs: 0.5, sm: 1 }, height: { xs: 4, sm: 6 } }}
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                >
                  {slaBreachPercentage.toFixed(1)}% {t('stats.percentageOfTotal')}
                </Typography>
              </Box>
              <Warning 
                color="error" 
                sx={{ 
                  fontSize: { xs: 28, sm: 40 },
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-end', sm: 'center' }
                }} 
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التوزيع حسب الفئة */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                mb: { xs: 1, sm: 1.5 }
              }}
            >
              {t('stats.byCategory')}
            </Typography>
            <Stack spacing={{ xs: 0.75, sm: 1 }}>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Box key={category}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {getCategoryLabel(category as SupportCategory, t)}
                    </Typography>
                    <Chip 
                      label={count} 
                      size="small"
                      sx={{ 
                        height: { xs: 20, sm: 24 },
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        flexShrink: 0
                      }} 
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={totalTickets > 0 ? (count / totalTickets) * 100 : 0}
                    sx={{ mt: { xs: 0.5, sm: 0.5 }, height: { xs: 4, sm: 6 } }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* التوزيع حسب الأولوية */}
      <Grid size={{ xs: 6, sm: 6, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.25rem' },
                mb: { xs: 1, sm: 1.5 }
              }}
            >
              {t('stats.byPriority')}
            </Typography>
            <Stack spacing={{ xs: 0.75, sm: 1 }}>
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <Box key={priority}>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {getPriorityLabel(priority as SupportPriority, t)}
                    </Typography>
                    <Chip 
                      label={count} 
                      size="small"
                      sx={{ 
                        height: { xs: 20, sm: 24 },
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        flexShrink: 0
                      }} 
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={totalTickets > 0 ? (count / totalTickets) * 100 : 0}
                    sx={{ mt: { xs: 0.5, sm: 0.5 }, height: { xs: 4, sm: 6 } }}
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
