import React from 'react';
import { Grid, Card, CardContent, Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface CustomerRanking {
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: string;
  rank: number;
  tier: string;
}

interface TopCustomersCardsProps {
  customers: CustomerRanking[];
  limit?: number;
  loading?: boolean;
}

const getTierColor = (tier: string): 'error' | 'warning' | 'info' | 'default' => {
  switch (tier?.toLowerCase()) {
    case 'vip':
      return 'error';
    case 'premium':
      return 'warning';
    case 'regular':
      return 'info';
    default:
      return 'default';
  }
};

export const TopCustomersCards: React.FC<TopCustomersCardsProps> = ({
  customers,
  limit = 10,
  loading = false,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading || customers.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {customers.slice(0, limit).map((customer, index) => (
        <Grid size={{ xs: 6, sm: 6, md: 4 }} key={customer.userId}>
          <Card
            sx={{
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
              height: '100%',
              border: index < 3 ? `2px solid ${theme.palette.warning.main}` : undefined,
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, mb: { xs: 1.5, sm: 2 }, gap: { xs: 1, sm: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
                  {index < 3 && <Star sx={{ color: 'gold', fontSize: { xs: 16, sm: 24 }, flexShrink: 0 }} />}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: index < 3 ? 'bold' : 'normal',
                      fontSize: { xs: '0.875rem', sm: '1.125rem' },
                    }}
                    noWrap
                  >
                    {customer.name || t('users:analytics.unknown', 'غير معروف')}
                  </Typography>
                </Box>
                <Chip
                  label={
                    customer.tier
                      ? t(`users:analytics.tiers.${customer.tier.toLowerCase()}`, customer.tier)
                      : t('users:analytics.tiers.regular', 'عادي')
                  }
                  size="small"
                  color={getTierColor(customer.tier)}
                  sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' }, flexShrink: 0 }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, mb: { xs: 1.5, sm: 2 } }}
                noWrap
              >
                {customer.email}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {t('users:analytics.table.totalSpent', 'إجمالي الإنفاق')}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="success.main"
                    sx={{ fontSize: { xs: '0.9375rem', sm: '1.125rem' }, fontWeight: 'bold' }}
                  >
                    {customer.totalSpent.toLocaleString('en-US')} $
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {t('users:analytics.table.orderCount', 'عدد الطلبات')}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: '0.9375rem', sm: '1.125rem' }, fontWeight: 'bold' }}
                  >
                    {customer.orderCount}
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

