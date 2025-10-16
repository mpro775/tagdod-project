import React, { useState } from 'react';
import { Box, Typography, Paper, Alert, Snackbar } from '@mui/material';
import { CurrencySelector } from '@/shared/components/CurrencySelector';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const CurrencySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedCurrency, changeCurrency, getCurrentCurrencyInfo } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentInfo = getCurrentCurrencyInfo();

  const handleCurrencyChange = async (currency: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      await changeCurrency(currency as any);
      
      setSuccessMessage(`تم تحديث العملة المفضلة إلى ${currentInfo.name}`);
    } catch (error) {
      console.error('Error updating currency:', error);
      setErrorMessage('حدث خطأ في تحديث العملة المفضلة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="currency-settings-page">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          إعدادات العملة
        </Typography>
        <Typography variant="body1" color="text.secondary">
          اختر العملة المفضلة لعرض الأسعار بها في جميع أنحاء التطبيق
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          العملة المفضلة
        </Typography>

        <Box sx={{ maxWidth: 400 }}>
          <CurrencySelector
            size="lg"
            showLabel={true}
          />
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            العملة الحالية:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            {currentInfo.symbol} {currentInfo.name}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>ملاحظة:</strong> عند تغيير العملة المفضلة، ستتحدث جميع الأسعار تلقائياً 
            في جميع أنحاء التطبيق بما في ذلك:
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>صفحة المنتجات</li>
            <li>صفحة تفاصيل المنتج</li>
            <li>سلة التسوق</li>
            <li>صفحة الطلبات</li>
          </ul>
        </Box>
      </Paper>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorMessage(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CurrencySettingsPage;
