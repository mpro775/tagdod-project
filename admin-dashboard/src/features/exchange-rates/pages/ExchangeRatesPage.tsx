import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Fade,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  TrendingUp,
  Calculate,
  Assessment,
  AttachMoney,
} from '@mui/icons-material';
import { useExchangeRates } from '../hooks/useExchangeRates';
import {
  ExchangeRateCard,
  ExchangeRateForm,
  CurrencyConverter,
  ExchangeRateStats,
} from '../components';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exchange-rates-tabpanel-${index}`}
      aria-labelledby={`exchange-rates-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `exchange-rates-tab-${index}`,
    'aria-controls': `exchange-rates-tabpanel-${index}`,
  };
}

export default function ExchangeRatesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const {
    rates,
    loading,
    error,
    updateRates,
    convertCurrency,
    isUpdating,
    isConverting,
  } = useExchangeRates();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUpdateRates = async (data: any) => {
    try {
      await updateRates(data);
      setSnackbar({
        open: true,
        message: 'تم تحديث أسعار الصرف بنجاح',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'فشل في تحديث أسعار الصرف',
        severity: 'error',
      });
    }
  };

  const handleConvertCurrency = async (data: any) => {
    try {
      const result = await convertCurrency(data);
      setSnackbar({
        open: true,
        message: `تم التحويل بنجاح: ${result.formatted}`,
        severity: 'success',
      });
      return result;
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'فشل في تحويل العملة',
        severity: 'error',
      });
      throw err;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // const handleRefresh = async () => {
  //   try {
  //     await fetchRates();
  //     setSnackbar({
  //       open: true,
  //       message: 'تم تحديث البيانات بنجاح',
  //       severity: 'success',
  //     });
  //   } catch (err) {
  //     setSnackbar({
  //       open: true,
  //       message: 'فشل في تحديث البيانات',
  //       severity: 'error',
  //     });
  //   }
  // };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          إدارة أسعار الصرف
        </Typography>
        <Typography variant="body1" color="text.secondary">
          إدارة وتحديث أسعار الصرف للعملات المدعومة في النظام
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => window.location.reload()}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="exchange rates tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<TrendingUp />} 
              label="الأسعار الحالية" 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<AttachMoney />} 
              label="تحديث الأسعار" 
              iconPosition="start"
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<Calculate />} 
              label="محول العملات" 
              iconPosition="start"
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<Assessment />} 
              label="الإحصائيات" 
              iconPosition="start"
              {...a11yProps(3)} 
            />
          </Tabs>
        </Box>

        {/* Current Rates Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              الأسعار الحالية
            </Typography>
            <Typography variant="body2" color="text.secondary">
              عرض أسعار الصرف الحالية للعملات المدعومة
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <ExchangeRateCard
                rates={rates}
                loading={loading}
                error={error}
                title="الدولار الأمريكي إلى الريال اليمني"
                currency="YER"
                rate={rates?.usdToYer || 0}
                icon={<TrendingUp />}
                color="primary"
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <ExchangeRateCard
                rates={rates}
                loading={loading}
                error={error}
                title="الدولار الأمريكي إلى الريال السعودي"
                currency="SAR"
                rate={rates?.usdToSar || 0}
                icon={<TrendingUp />}
                color="secondary"
              />
            </Box>
          </Box>
        </TabPanel>

        {/* Update Rates Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              تحديث أسعار الصرف
            </Typography>
            <Typography variant="body2" color="text.secondary">
              قم بتحديث أسعار الصرف للعملات المدعومة
            </Typography>
          </Box>

          <ExchangeRateForm
            initialData={rates ? {
              usdToYer: rates.usdToYer,
              usdToSar: rates.usdToSar,
              notes: rates.notes,
            } : undefined}
            onSave={handleUpdateRates}
            loading={isUpdating}
            error={error}
          />
        </TabPanel>

        {/* Currency Converter Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              محول العملات
          </Typography>
            <Typography variant="body2" color="text.secondary">
              تحويل العملات باستخدام الأسعار الحالية
              </Typography>
          </Box>

          <CurrencyConverter
            onConvert={handleConvertCurrency}
            loading={isConverting}
            error={error}
          />
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              إحصائيات أسعار الصرف
            </Typography>
            <Typography variant="body2" color="text.secondary">
              معلومات تفصيلية عن أسعار الصرف الحالية
              </Typography>
          </Box>

          <ExchangeRateStats
            rates={rates}
            loading={loading}
            error={error}
          />
        </TabPanel>
      </Paper>

      {/* Info Card */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney color="primary" />
          معلومات مهمة
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            جميع المنتجات في النظام تسعر بالدولار الأمريكي
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            سيتم تحويل الأسعار تلقائياً للعملاء حسب العملة المختارة
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            تحديث الأسعار يؤثر على جميع المنتجات والفواتير فوراً
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            تأكد من صحة الأسعار قبل الحفظ
          </Typography>
        </Box>
      </Paper>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && !rates}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>جاري تحميل أسعار الصرف...</Typography>
        </Box>
      </Backdrop>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
