import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

interface OtpInputStepProps {
  phone: string;
  onSubmit: (code: string) => void; // eslint-disable-line no-unused-vars
  onResend: () => void;
  onBack: () => void;
  isLoading?: boolean;
  isResending?: boolean;
  error?: string;
  devCode?: string;
}

export const OtpInputStep: React.FC<OtpInputStepProps> = ({
  phone,
  onSubmit,
  onResend,
  onBack,
  isLoading = false,
  isResending = false,
  error,
  devCode,
}) => {
  const { t, ready } = useTranslation('auth');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showDevCode, setShowDevCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Validation Schema - created with useMemo to ensure translations are loaded
  const otpSchema = useMemo(() => {
    if (!ready) {
      // Return a basic schema until translations are ready
      return z.object({
        code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام').regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط'),
      });
    }
    return z.object({
      code: z
        .string()
        .length(6, t('validation.otpLength'))
        .regex(/^\d{6}$/, t('validation.otpNumeric')),
    });
  }, [t, ready]);

  type OtpFormData = z.infer<typeof otpSchema>;

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const handleSubmit = (data: OtpFormData) => {
    onSubmit(data.code);
  };

  const handleResend = () => {
    setCountdown(60);
    onResend();
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone number for display
  const formatPhone = (phone: string) => {
    if (phone.length === 10 && phone.startsWith('05')) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Dev Code Alert (Development Only) */}
      {devCode && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2,
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Typography variant="body2" sx={{ flex: 1, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              {t('dev.code')}:{' '}
              <Typography component="span" fontWeight="bold" color="primary">
                {showDevCode ? devCode : '******'}
              </Typography>
            </Typography>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              onClick={() => setShowDevCode(!showDevCode)}
              sx={{ p: 0.5 }}
            >
              {showDevCode ? (
                <VisibilityOff fontSize={isMobile ? 'small' : 'medium'} />
              ) : (
                <Visibility fontSize={isMobile ? 'small' : 'medium'} />
              )}
            </IconButton>
          </Box>
        </Alert>
      )}

      <TextField
        {...form.register('code')}
        fullWidth
        label={t('otp.label')}
        placeholder={t('otp.placeholder')}
        error={!!form.formState.errors.code || !!error}
        helperText={form.formState.errors.code?.message || error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
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
        inputProps={{ maxLength: 6 }}
        disabled={isLoading}
        size={isMobile ? 'small' : 'medium'}
      />

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 3,
          textAlign: 'center',
          fontSize: { xs: '0.85rem', sm: '0.9rem' },
          fontFamily: 'Cairo',
        }}
      >
        {t('otp.sentTo')} {formatPhone(phone)}
      </Typography>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size={isMobile ? 'medium' : 'large'}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{ py: { xs: 1.25, sm: 1.5 }, mb: 2 }}
      >
        {isLoading ? t('loading.verifying') : t('buttons.login')}
      </Button>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="text"
          size={isMobile ? 'small' : 'medium'}
          onClick={onBack}
          disabled={isLoading || isResending}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            minWidth: 'auto',
            px: { xs: 0.75, sm: 1 },
          }}
        >
          {t('otp.changePhone')}
        </Button>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mx: { xs: 0.5, sm: 1 }, alignSelf: 'center', fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
        >
          •
        </Typography>
        
        <Button
          variant="text"
          size={isMobile ? 'small' : 'medium'}
          onClick={handleResend}
          disabled={isLoading || isResending || countdown > 0}
          startIcon={isResending ? <CircularProgress size={16} /> : null}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            minWidth: 'auto',
            px: { xs: 0.75, sm: 1 },
          }}
        >
          {isResending
            ? t('loading.sending')
            : countdown > 0
            ? t('otp.resendCountdown', { count: countdown })
            : t('otp.resend')}
        </Button>
      </Box>
    </Box>
  );
};
