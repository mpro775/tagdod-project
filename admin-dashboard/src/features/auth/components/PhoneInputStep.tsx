import React, { useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Phone } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

interface PhoneInputStepProps {
  onSubmit: (phone: string) => void; // eslint-disable-line no-unused-vars
  isLoading?: boolean;
  error?: string;
  onSwitchToPassword?: () => void;
}

export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onSwitchToPassword,
}) => {
  const { t, ready } = useTranslation('auth');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Validation Schema - created with useMemo to ensure translations are loaded
  const phoneSchema = useMemo(() => {
    if (!ready) {
      // Return a basic schema until translations are ready
      return z.object({
        phone: z.string().min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل').regex(/^7\d{8}$/, 'رقم الهاتف يجب أن يبدأ بـ 7 ويحتوي على 10 أرقام'),
      });
    }
    return z.object({
      phone: z
        .string()
        .min(9, t('validation.phoneMin'))
        .regex(/^7\d{8}$/, t('validation.phoneFormat')),
    });
  }, [t, ready]);

  type PhoneFormData = z.infer<typeof phoneSchema>;

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const handleSubmit = (data: PhoneFormData) => {
    onSubmit(data.phone);
  };

  return (
    <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
      <TextField
        {...form.register('phone')}
        fullWidth
        label={t('phone.label')}
        placeholder={t('phone.placeholder')}
        error={!!form.formState.errors.phone || !!error}
        helperText={form.formState.errors.phone?.message || error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          fontFamily: 'Cairo',
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05) !important' 
              : 'transparent !important',
            '& fieldset': {
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.23)' 
                : undefined,
            },
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05) !important' 
                : 'transparent !important',
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : undefined,
              },
            },
            '&.Mui-focused': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05) !important' 
                : 'transparent !important',
              '& fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          },
        }}
        dir="ltr"
        disabled={isLoading}
        size={isMobile ? 'small' : 'medium'}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size={isMobile ? 'medium' : 'large'}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{ py: { xs: 1.25, sm: 1.5 }, mb: 2 }}
      >
        {isLoading ? t('loading.sending') : t('buttons.sendCode')}
      </Button>

      {onSwitchToPassword && (
        <>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              {t('divider')}
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={onSwitchToPassword}
            disabled={isLoading}
            size={isMobile ? 'medium' : 'large'}
            sx={{ py: { xs: 1.25, sm: 1.5 } }}
          >
            {t('buttons.loginWithPassword')}
          </Button>
        </>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textAlign: 'center',
          fontFamily: 'Cairo',
          mt: 2,
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
        }}
      >
        {t('otp.message')}
      </Typography>
    </Box>
  );
};
