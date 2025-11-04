import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { People, AttachMoney, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface OverallAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  topSpenders: Array<{ userId: string; totalSpent: number }>;
  userGrowth: Array<{ month: string; newUsers: number }>;
}

interface AnalyticsKPICardsProps {
  analytics: OverallAnalytics | null;
}

export const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({ analytics }) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!analytics) return null;

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
        <Card
          sx={{
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
            height: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
              <People
                sx={{
                  fontSize: { xs: 24, sm: 40 },
                  color: 'primary.main',
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 0.5, sm: 0 },
                }}
              />
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
                >
                  {analytics.totalUsers.toLocaleString('en-US')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {t('users:analytics.kpi.totalUsers', 'إجمالي المستخدمين')}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={t('users:analytics.kpi.activeUsers', '{{count}} نشط', {
                count: analytics.activeUsers,
              })}
              size="small"
              color="success"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
        <Card
          sx={{
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
            height: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <AttachMoney
                sx={{
                  fontSize: { xs: 24, sm: 40 },
                  color: 'success.main',
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 0.5, sm: 0 },
                }}
              />
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
                >
                  {analytics.customerLifetimeValue.toFixed(2)} $
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {t('users:analytics.kpi.customerLifetimeValue', 'القيمة الدائمة للعميل')}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={t('users:analytics.kpi.averageOrderValue', 'معدل الطلب: {{value}} $', {
                value: analytics.averageOrderValue.toFixed(2),
              })}
              size="small"
              color="info"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
        <Card
          sx={{
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
            height: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TrendingUp
                sx={{
                  fontSize: { xs: 24, sm: 40 },
                  color: 'warning.main',
                  mr: { xs: 0, sm: 2 },
                  mb: { xs: 0.5, sm: 0 },
                }}
              />
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
                >
                  {analytics.newUsersThisMonth.toLocaleString('en-US')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {t('users:analytics.kpi.newUsersThisMonth', 'مستخدمون جدد هذا الشهر')}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={t('users:analytics.kpi.topSpenders', 'أفضل العملاء: {{count}}', {
                count: analytics.topSpenders.length,
              })}
              size="small"
              color="warning"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

