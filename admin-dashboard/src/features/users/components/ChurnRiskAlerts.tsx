import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ChurnRiskAlert {
  userId: string;
  name: string;
  email: string;
  churnRisk: 'high' | 'medium' | 'low';
  lastOrderDays: number;
  recommendedAction: string;
  totalSpent: number;
}

interface ChurnRiskAlertsProps {
  alerts: ChurnRiskAlert[];
  loading?: boolean;
}

const getRiskColor = (risk: string): 'error' | 'warning' | 'success' | 'default' => {
  switch (risk) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

export const ChurnRiskAlerts: React.FC<ChurnRiskAlertsProps> = ({ alerts, loading = false }) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {alerts.map((alert) => (
        <Grid component="div" size={{ xs: 12, md: 6 }} key={alert.userId}>
          <Card
            sx={{
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              height: '100%',
              borderLeft: `4px solid ${
                alert.churnRisk === 'high'
                  ? theme.palette.error.main
                  : alert.churnRisk === 'medium'
                  ? theme.palette.warning.main
                  : theme.palette.success.main
              }`,
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Warning
                    sx={{
                      color:
                        alert.churnRisk === 'high'
                          ? 'error.main'
                          : alert.churnRisk === 'medium'
                          ? 'warning.main'
                          : 'success.main',
                      fontSize: { xs: 20, sm: 24 },
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      fontWeight: alert.churnRisk === 'high' ? 'bold' : 'normal',
                    }}
                    noWrap
                  >
                    {alert.name || t('users:analytics.unknown', 'غير معروف')}
                  </Typography>
                </Box>
                <Chip
                  label={t(`users:analytics.churnRisk.${alert.churnRisk}`, alert.churnRisk)}
                  size="small"
                  color={getRiskColor(alert.churnRisk)}
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 2 }}
                noWrap
              >
                {alert.email}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {t('users:analytics.churnRisk.lastOrder', 'آخر طلب منذ: {{days}} يوم', {
                      days: alert.lastOrderDays,
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    display="block"
                    gutterBottom
                  >
                    {t('users:analytics.churnRisk.recommendedAction', 'الإجراء الموصى به:')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {alert.recommendedAction}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    display="block"
                    gutterBottom
                  >
                    {t('users:analytics.churnRisk.totalSpent', 'إجمالي الإنفاق:')}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="success.main"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                  >
                    {alert.totalSpent.toLocaleString('en-US')} $
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

