import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ExchangeRatesList from '../components/ExchangeRatesList';
import ExchangeRateForm from '../components/ExchangeRateForm';

export const AdminExchangeRatesPage: React.FC = () => {
  return (
    <Box className="admin-exchange-rates-page">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          إدارة أسعار الصرف
        </Typography>
        <Typography variant="body1" color="text.secondary">
          إدارة أسعار الصرف بين العملات المختلفة لتحديث أسعار المنتجات تلقائياً
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          إضافة سعر صرف جديد
        </Typography>
        <ExchangeRateForm />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          قائمة أسعار الصرف
        </Typography>
        <ExchangeRatesList />
      </Paper>
    </Box>
  );
};

export default AdminExchangeRatesPage;
