import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import {
  SwapHoriz,
  Calculate,
  AttachMoney,
  TrendingUp,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ConvertCurrencyRequest, ConvertCurrencyResponse } from '../api/exchangeRatesApi';

interface CurrencyConverterProps {
  onConvert: (data: ConvertCurrencyRequest) => Promise<ConvertCurrencyResponse>;
  loading?: boolean;
  error?: string | null;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  onConvert,
  loading = false,
  error,
}) => {
  const { t } = useTranslation('exchangeRates');
  const [formData, setFormData] = useState({
    amount: '',
    fromCurrency: 'USD' as 'USD' | 'YER' | 'SAR',
    toCurrency: 'YER' as 'USD' | 'YER' | 'SAR',
  });

  const [result, setResult] = useState<ConvertCurrencyResponse | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear previous results when input changes
    if (result) {
      setResult(null);
    }
    if (convertError) {
      setConvertError(null);
    }
  };

  const handleSwapCurrencies = () => {
    if (formData.fromCurrency === formData.toCurrency) {
      return; // Cannot swap if same currency
    }
    setFormData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
      amount: result ? result.result.toString() : prev.amount, // Swap amounts if result exists
    }));
    setResult(null);
    setConvertError(null);
  };

  const handleConvert = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setConvertError(t('messages.invalidAmount'));
      return;
    }

    if (formData.fromCurrency === formData.toCurrency) {
      setConvertError(t('messages.sameCurrency', { defaultValue: 'لا يمكن تحويل العملة إلى نفسها' }));
      return;
    }

    try {
      setIsConverting(true);
      setConvertError(null);
      
      const response = await onConvert({
        amount: parseFloat(formData.amount),
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
      });
      
      setResult(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحويل العملة';
      setConvertError(errorMessage);
    } finally {
      setIsConverting(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'YER': return '$';
      case 'SAR': return '$';
      default: return currency;
    }
  };

  return (
    <Card sx={{ borderRadius: { xs: 1, sm: 2 } }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('converter.title')}
            </Typography>
          </Box>
        }
        subheader={
          <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
            {t('converter.subtitle')}
          </Typography>
        }
        sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}
      />
      <CardContent sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: { xs: 2, sm: 3 } }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Amount Input */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('converter.amount')}
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">
                      {getCurrencySymbol(formData.fromCurrency)}
                    </Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                step: '0.01',
                min: '0.01',
              }}
              placeholder={t('converter.amountPlaceholder')}
            />
          </Grid>

          {/* From Currency */}
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth>
              <InputLabel>{t('converter.fromCurrency')}</InputLabel>
              <Select
                value={formData.fromCurrency}
                onChange={handleInputChange('fromCurrency')}
                label={t('converter.fromCurrency')}
              >
                <MenuItem value="USD">{t('converter.usd')}</MenuItem>
                <MenuItem value="YER">{t('converter.yer')}</MenuItem>
                <MenuItem value="SAR">{t('converter.sar')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Swap Button */}
          <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Button
               variant="outlined"
               onClick={handleSwapCurrencies}
               disabled={formData.fromCurrency === formData.toCurrency}
               sx={{ minWidth: 'auto', p: 1 }}
               title={formData.fromCurrency === formData.toCurrency ? t('converter.cannotSwapSameCurrency') : t('converter.swapCurrencies')}
             >
              <SwapHoriz />
            </Button>
          </Grid>

          {/* To Currency */}
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth>
              <InputLabel>{t('converter.toCurrency')}</InputLabel>
              <Select
                value={formData.toCurrency}
                onChange={handleInputChange('toCurrency')}
                label={t('converter.toCurrency')}
              >
                <MenuItem value="USD" disabled={formData.fromCurrency === 'USD'}>{t('converter.usd')}</MenuItem>
                <MenuItem value="YER" disabled={formData.fromCurrency === 'YER'}>{t('converter.yer')}</MenuItem>
                <MenuItem value="SAR" disabled={formData.fromCurrency === 'SAR'}>{t('converter.sar')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Convert Button */}
          <Grid size={{ xs: 12 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleConvert}
              disabled={isConverting || loading || !formData.amount || parseFloat(formData.amount) <= 0 || formData.fromCurrency === formData.toCurrency}
              startIcon={isConverting ? <CircularProgress size={20} /> : <TrendingUp />}
              size="large"
            >
              {isConverting ? t('converter.converting') : t('converter.convert')}
            </Button>
          </Grid>

          {/* Error Display */}
          {convertError && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">
                {convertError}
              </Alert>
            </Grid>
          )}

          {/* Result Display */}
          {result && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                backgroundColor: 'primary.light', 
                borderRadius: { xs: 1, sm: 2 },
                textAlign: 'center',
              }}>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                  }}
                >
                  {formatAmount(result.result)} {getCurrencySymbol(result.toCurrency)}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {result.formatted}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={t('converter.resultAmount', { amount: formatAmount(result.amount), currency: getCurrencySymbol(result.fromCurrency) })}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                  />
                  <Chip 
                    label={t('converter.resultRate', { rate: formatAmount(result.rate) })}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                  />
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
