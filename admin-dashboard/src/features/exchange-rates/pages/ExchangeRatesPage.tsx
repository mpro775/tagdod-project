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
import { useTranslation } from 'react-i18next';
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
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
  const { t } = useTranslation('exchangeRates');
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
        message: t('messages.ratesUpdated', { defaultValue: 'تم تحديث الأسعار بنجاح' }),
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('messages.ratesUpdateFailed', { defaultValue: 'فشل في تحديث الأسعار' }    ),
        severity: 'error',
      });
    }
  };

  const handleConvertCurrency = async (data: any) => {
    try {
      const result = await convertCurrency(data);
      setSnackbar({
        open: true,
        message: t('messages.conversionResult', { defaultValue: 'تم تحويل العملة بنجاح', result: result.formatted }),
        severity: 'success',
      });
      return result;
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('messages.conversionFailed', { defaultValue: 'فشل في تحويل العملة' }     ),
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
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1.5, sm: 2 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          {t('exchangeRates.title', { defaultValue: 'أسعار الصرف' })}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {t('exchangeRates.subtitle', { defaultValue: 'أسعار الصرف الحالية للعملات المدعومة' })}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: { xs: 2, sm: 3 } }} 
          onClose={() => window.location.reload()}
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ width: '100%', borderRadius: { xs: 1, sm: 2 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', overflow: 'auto' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="exchange rates tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minWidth: { xs: 'auto', sm: 120 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab
              icon={<TrendingUp sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
              label={t('tabs.currentRates', { defaultValue: 'الأسعار الحالية' })}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              icon={<AttachMoney sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
              label={t('tabs.updateRates', { defaultValue: 'تحديث أسعار الصرف' })}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              icon={<Calculate sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
              label={t('tabs.converter', { defaultValue: 'محول العملات' })}
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              icon={<Assessment sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
              label={t('tabs.statistics', { defaultValue: 'إحصائيات أسعار الصرف' })}
              iconPosition="start"
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        {/* Current Rates Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('tabs.currentRates', { defaultValue: 'الأسعار الحالية' })}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              {t('tabs.currentRatesDesc', { defaultValue: 'عرض أسعار الصرف الحالية للعملات المدعومة' })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, minWidth: { xs: 0, sm: 300 } }}>
              <ExchangeRateCard
                rates={rates}
                loading={loading}
                error={error}
                title={t('exchangeRates.usdToYerTitle')}
                currency="YER"
                rate={rates?.usdToYer || 0}
                icon={<TrendingUp />}
                color="primary"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, minWidth: { xs: 0, sm: 300 } }}>
              <ExchangeRateCard
                rates={rates}
                loading={loading}
                error={error}
                title={t('exchangeRates.usdToSarTitle')}
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
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('tabs.updateRates', { defaultValue: 'تحديث أسعار الصرف' })}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              {t('tabs.updateRatesDesc', { defaultValue: 'قم بتحديث أسعار الصرف للعملات المدعومة' })}   
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
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('tabs.converter', { defaultValue: 'محول العملات' })}
          </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              {t('tabs.converterDesc', { defaultValue: 'تحويل العملات باستخدام الأسعار الحالية' })}
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
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('tabs.statistics', { defaultValue: 'إحصائيات أسعار الصرف' })}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
            >
              {t('tabs.statisticsDesc', { defaultValue: 'معلومات تفصيلية عن أسعار الصرف الحالية' })}
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
      <Paper sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 }, borderRadius: { xs: 1, sm: 2 } }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          <AttachMoney color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          {t('infoCard.title', { defaultValue: 'معلومات مهمة' })}
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: { xs: 2, sm: 3 } }}>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            {t('infoCard.item1', { defaultValue: 'جميع المنتجات في النظام تسعر بالدولار الأمريكي' })}
          </Typography>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            {t('infoCard.item2', { defaultValue: 'سيتم تحويل الأسعار تلقائياً للعملاء حسب العملة المختارة' })}
          </Typography>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            {t('infoCard.item3', { defaultValue: 'تحديث الأسعار يؤثر على جميع المنتجات والفواتير فوراً' })}
          </Typography>
          <Typography 
            component="li" 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            {t('infoCard.item4', { defaultValue: 'تأكد من صحة الأسعار قبل الحفظ' })}
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
          <Typography>{t('loading.loadingRates', { defaultValue: 'جاري تحميل أسعار الصرف...' })}</Typography>
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
