import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip, 
  Grid,
  Stack 
} from '@mui/material';
import { 
  TrendingUp, 
  LocalOffer, 
  ConfirmationNumber, 
  Campaign 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePriceRules, useCoupons, useBanners, useActiveBanners } from '../hooks/useMarketing';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

const MarketingDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('marketing');
  const { isMobile } = useBreakpoint();

  // Fetch data
  const { data: priceRules = [], isLoading: priceRulesLoading } = usePriceRules();
  const { data: coupons = [], isLoading: couponsLoading } = useCoupons();
  const { data: banners = [], isLoading: bannersLoading } = useBanners();
  const { data: activeBanners = [] } = useActiveBanners();

  const stats = [
    {
      title: t('dashboard.stats.priceRules'),
      count: priceRules.length,
      active: priceRules.filter((rule) => rule.active).length,
      color: 'primary',
      path: '/marketing/price-rules',
      icon: <LocalOffer />,
      loading: priceRulesLoading,
    },
    {
      title: t('dashboard.stats.coupons'),
      count: (coupons as any)?.data?.length || 0,
      active:
        (coupons as any)?.data?.filter((coupon: any) => coupon.status === 'active').length || 0,
      color: 'success',
      path: '/coupons',
      icon: <ConfirmationNumber />,
      loading: couponsLoading,
    },
    {
      title: t('dashboard.stats.banners'),
      count: (banners as any)?.data?.length || 0,
      active: activeBanners.length,
      color: 'info',
      path: '/banners',
      icon: <Campaign />,
      loading: bannersLoading,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <TrendingUp fontSize={isMobile ? 'medium' : 'large'} color="primary" />
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            {t('dashboard.title')}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.subtitle')}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Box
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.color}.light`,
                      color: `${stat.color}.main`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': {
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                      },
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(stat.path);
                    }}
                    disabled={stat.loading}
                  >
                    {t('dashboard.viewAll')}
                  </Button>
                </Box>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {stat.title}
                </Typography>
                {stat.loading ? (
                  <Typography variant="h3" color={`${stat.color}.main`}>
                    ...
                  </Typography>
                ) : (
                  <Typography 
                    variant="h3" 
                    color={`${stat.color}.main`}
                    sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem' } }}
                  >
                    {stat.count}
                  </Typography>
                )}
                <Chip
                  label={`${t('dashboard.active')}: ${stat.active}`}
                  color={stat.color as any}
                  size="small"
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 24, sm: 28 },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            mb: 3,
          }}
        >
          {t('dashboard.quickActions')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/marketing/price-rules/new')}
              startIcon={<LocalOffer />}
              sx={{ 
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {t('dashboard.createPriceRule')}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => navigate('/coupons/new')}
              startIcon={<ConfirmationNumber />}
              sx={{ 
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {t('dashboard.createCoupon')}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button
              variant="contained"
              color="info"
              fullWidth
              onClick={() => navigate('/banners/new')}
              startIcon={<Campaign />}
              sx={{ 
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {t('dashboard.createBanner')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MarketingDashboardPage;
