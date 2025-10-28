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
  const [formData, setFormData] = useState({
    amount: '',
    fromCurrency: 'USD' as 'USD',
    toCurrency: 'YER' as 'YER' | 'SAR',
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
    // Swap is not supported since API only accepts USD as source currency
    // This function is kept for UI consistency but does nothing
  };

  const handleConvert = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setConvertError('يرجى إدخال مبلغ صحيح');
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
    return new Intl.NumberFormat('ar-SA', {
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
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculate color="primary" />
            <Typography variant="h6" component="div">
              محول العملات
            </Typography>
          </Box>
        }
        subheader="تحويل العملات باستخدام الأسعار الحالية"
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Amount Input */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="المبلغ"
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
              placeholder="أدخل المبلغ المراد تحويله"
            />
          </Grid>

          {/* From Currency */}
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth>
              <InputLabel>من العملة</InputLabel>
              <Select
                value={formData.fromCurrency}
                onChange={handleInputChange('fromCurrency')}
                label="من العملة"
              >
                <MenuItem value="USD">USD - دولار أمريكي</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Swap Button */}
          <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Button
               variant="outlined"
               onClick={handleSwapCurrencies}
               disabled={true}
               sx={{ minWidth: 'auto', p: 1 }}
             >
              <SwapHoriz />
            </Button>
          </Grid>

          {/* To Currency */}
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth>
              <InputLabel>إلى العملة</InputLabel>
              <Select
                value={formData.toCurrency}
                onChange={handleInputChange('toCurrency')}
                label="إلى العملة"
              >
                <MenuItem value="YER">YER - ريال يمني</MenuItem>
                <MenuItem value="SAR">SAR - ريال سعودي</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Convert Button */}
          <Grid size={{ xs: 12 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleConvert}
              disabled={isConverting || loading || !formData.amount || parseFloat(formData.amount) <= 0}
              startIcon={isConverting ? <CircularProgress size={20} /> : <TrendingUp />}
              size="large"
            >
              {isConverting ? 'جاري التحويل...' : 'تحويل العملة'}
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
              <Divider sx={{ my: 2 }} />
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'primary.light', 
                borderRadius: 2,
                textAlign: 'center',
              }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatAmount(result.result)} {getCurrencySymbol(result.toCurrency)}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {result.formatted}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`المبلغ: ${formatAmount(result.amount)} ${getCurrencySymbol(result.fromCurrency)}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip 
                    label={`السعر: ${formatAmount(result.rate)}`}
                    size="small"
                    variant="outlined"
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
