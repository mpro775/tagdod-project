import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  usePriceRules,
  useCoupons,
  useBanners,
  useActiveBanners
} from '../hooks/useMarketing';

const MarketingDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch data
  const { data: priceRules = [] } = usePriceRules();
  const { data: coupons = [] } = useCoupons();
  const { data: banners = [] } = useBanners();
  const { data: activeBanners = [] } = useActiveBanners();

  const stats = [
    {
      title: 'قواعد الأسعار',
      count: priceRules.length,
      active: priceRules.filter(rule => rule.active).length,
      color: 'primary',
      path: '/admin/marketing/price-rules'
    },
    {
      title: 'الكوبونات',
      count: coupons.data?.length || 0,
      active: coupons.data?.filter(coupon => coupon.status === 'active').length || 0,
      color: 'success',
      path: '/admin/marketing/coupons'
    },
    {
      title: 'البانرات',
      count: banners.data?.length || 0,
      active: activeBanners.length,
      color: 'info',
      path: '/admin/marketing/banners'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        لوحة تحكم التسويق
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 3 }
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" color={`${stat.color}.main`}>
                      {stat.count}
                    </Typography>
                    <Chip 
                      label={`${stat.active} نشط`} 
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
                    عرض الكل
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          الإجراءات السريعة
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              onClick={() => navigate('/admin/marketing/price-rules/create')}
            >
              إنشاء قاعدة سعر جديدة
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => navigate('/admin/marketing/coupons/create')}
            >
              إنشاء كوبون جديد
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="info"
              onClick={() => navigate('/admin/marketing/banners/create')}
            >
              إنشاء بانر جديد
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MarketingDashboardPage;
