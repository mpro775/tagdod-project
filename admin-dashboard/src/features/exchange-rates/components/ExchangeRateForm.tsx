import React, { useState, useEffect } from 'react';
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
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import { Save, AttachMoney, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UpdateExchangeRatesRequest } from '../api/exchangeRatesApi';

interface ExchangeRateFormProps {
  initialData?: {
    usdToYer: number;
    usdToSar: number;
    notes?: string;
  };
  onSave: (data: UpdateExchangeRatesRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
}

export const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({
  initialData,
  onSave,
  onCancel,
  loading = false,
  error,
}) => {
  const { t } = useTranslation('exchangeRates');
  const [formData, setFormData] = useState({
    usdToYer: initialData?.usdToYer || 250,
    usdToSar: initialData?.usdToSar || 3.75,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<{
    usdToYer?: string;
    usdToSar?: string;
  }>({});

  const [touched, setTouched] = useState<{
    usdToYer: boolean;
    usdToSar: boolean;
  }>({
    usdToYer: false,
    usdToSar: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        usdToYer: initialData.usdToYer,
        usdToSar: initialData.usdToSar,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const validateField = (field: keyof typeof formData, value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (field === 'usdToYer' || field === 'usdToSar') {
      if (isNaN(numValue) || numValue <= 0) {
        return t('validation.ratePositive');
      }
      if (numValue > 10000) {
        return t('validation.rateMax', { max: 10000 });
      }
    }

    return '';
  };

  const handleInputChange =
    (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Validate field
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));

      // Mark as touched
      if (field === 'usdToYer' || field === 'usdToSar') {
        setTouched((prev) => ({
          ...prev,
          [field]: true,
        }));
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate all fields
    const newErrors = {
      usdToYer: validateField('usdToYer', formData.usdToYer),
      usdToSar: validateField('usdToSar', formData.usdToSar),
    };

    setErrors(newErrors);
    setTouched({ usdToYer: true, usdToSar: true });

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== '')) {
      return;
    }

    try {
      await onSave({
        usdToYer: parseFloat(formData.usdToYer.toString()),
        usdToSar: parseFloat(formData.usdToSar.toString()),
        notes: formData.notes || undefined,
      });
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const isFormValid =
    formData.usdToYer > 0 &&
    formData.usdToSar > 0 &&
    Object.values(errors).every((error) => error === '');

  return (
    <Card sx={{ borderRadius: { xs: 1, sm: 2 } }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {t('form.title')}
            </Typography>
          </Box>
        }
        subheader={
          <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
            {t('form.subtitle')}
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* USD to YER */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                error={touched.usdToYer && !!errors.usdToYer}
                variant="outlined"
              >
                <InputLabel htmlFor="usdToYer">{t('form.usdToYer')}</InputLabel>
                <OutlinedInput
                  id="usdToYer"
                  type="number"
                  value={formData.usdToYer}
                  onChange={handleInputChange('usdToYer')}
                  startAdornment={
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <Typography variant="body2" color="text.secondary">
                        $
                      </Typography>
                    </InputAdornment>
                  }
                  inputProps={{
                    step: '0.01',
                    min: '0.01',
                    max: '10000',
                  }}
                  label={t('form.usdToYer')}
                />
                {touched.usdToYer && errors.usdToYer && (
                  <FormHelperText>{errors.usdToYer}</FormHelperText>
                )}
                <FormHelperText>{t('form.oneUSDEquals', { 
                  amount: formData.usdToYer, 
                  usd: t('exchangeRates.usd') 
                })}</FormHelperText>
              </FormControl>
            </Grid>

            {/* USD to SAR */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                error={touched.usdToSar && !!errors.usdToSar}
                variant="outlined"
              >
                <InputLabel htmlFor="usdToSar">{t('form.usdToSar')}</InputLabel>
                <OutlinedInput
                  id="usdToSar"
                  type="number"
                  value={formData.usdToSar}
                  onChange={handleInputChange('usdToSar')}
                  startAdornment={
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <Typography variant="body2" color="text.secondary">
                        $
                      </Typography>
                    </InputAdornment>
                  }
                  inputProps={{
                    step: '0.01',
                    min: '0.01',
                    max: '10000',
                  }}
                  label={t('form.usdToSar')}
                />
                {touched.usdToSar && errors.usdToSar && (
                  <FormHelperText>{errors.usdToSar}</FormHelperText>
                )}
                <FormHelperText>{t('form.oneUSDEquals', { 
                  amount: formData.usdToSar, 
                  usd: t('exchangeRates.usd') 
                })}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('form.notes')}
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder={t('form.notesPlaceholder')}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: 'flex-end', 
            gap: 2 
          }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                sx={{ 
                  minWidth: { xs: 'auto', sm: 120 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                {t('form.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !isFormValid}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              sx={{ 
                minWidth: { xs: 'auto', sm: 120 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {loading ? t('form.saving') : t('form.save')}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExchangeRateForm;
