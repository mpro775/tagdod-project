import React from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePriceRules, useCoupons, useBanners, useActiveBanners } from '../hooks/useMarketing';

const MarketingDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('marketing');

  // Fetch data
  const { data: priceRules = [] } = usePriceRules();
  const { data: coupons = [] } = useCoupons();
  const { data: banners = [] } = useBanners();
  const { data: activeBanners = [] } = useActiveBanners();

  const stats = [
    {
      title: t('dashboard.stats.priceRules', { defaultValue: 'قاعدة الأسعار' }),
      count: priceRules.length,
      active: priceRules.filter((rule) => rule.active).length,
      color: 'primary',
      path: '/marketing/price-rules',
    },
    {
      title: t('dashboard.stats.coupons', { defaultValue: 'الكوبونات' }),
      count: (coupons as any)?.data?.length || 0,
      active:
        (coupons as any)?.data?.filter((coupon: any) => coupon.status === 'active').length || 0,
      color: 'success',
      path: '/coupons',
    },
    {
      title: t('dashboard.stats.banners', { defaultValue: 'البانرات' }),
      count: (banners as any)?.data?.length || 0,
      active: activeBanners.length,
      color: 'info',
      path: '/banners',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title', { defaultValue: 'لوحة التحكم في التسويق' })}
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': { boxShadow: 3 },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" color={`${stat.color}.main`}>
                      {stat.count}
                    </Typography>
                    <Chip
                      label={`${stat.active} ${t('dashboard.active', { defaultValue: 'نشط' })}`}
                      color={stat.color as any}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(stat.path);
                    }}
                  >
                    {t('dashboard.viewAll', { defaultValue: 'عرض الكل' })}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('dashboard.quickActions', { defaultValue: 'الإجراءات السريعة' })}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/marketing/price-rules/new')}
            >
              {t('dashboard.createPriceRule', { defaultValue: 'إنشاء قاعدة الأسعار' })}
            </Button>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/coupons/new')}
            >
              {t('dashboard.createCoupon', { defaultValue: 'إنشاء كوبون' })}
            </Button>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              color="info"
              onClick={() => navigate('/banners/new')}
            >
              {t('dashboard.createBanner', { defaultValue: 'إنشاء بانر' }   )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MarketingDashboardPage;
