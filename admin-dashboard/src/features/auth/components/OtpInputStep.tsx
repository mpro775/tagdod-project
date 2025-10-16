import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation Schema
const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط'),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface OtpInputStepProps {
  phone: string;
  onSubmit: (code: string) => void;
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
  const [showDevCode, setShowDevCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              رمز التطوير:{' '}
              <Typography component="span" fontWeight="bold" color="primary">
                {showDevCode ? devCode : '******'}
              </Typography>
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowDevCode(!showDevCode)}
              sx={{ p: 0.5 }}
            >
              {showDevCode ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Alert>
      )}

      <TextField
        {...form.register('code')}
        fullWidth
        label="رمز التحقق"
        placeholder="000000"
        error={!!form.formState.errors.code || !!error}
        helperText={form.formState.errors.code?.message || error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2, fontFamily: 'Cairo' }}
        autoFocus
        dir="ltr"
        inputProps={{ maxLength: 6 }}
        disabled={isLoading}
      />

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 3,
          textAlign: 'center',
          fontSize: '0.9rem',
          fontFamily: 'Cairo',
        }}
      >
        تم إرسال الرمز إلى {formatPhone(phone)}
      </Typography>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{ py: 1.5, mb: 2 }}
      >
        {isLoading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
      </Button>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="text"
          size="small"
          onClick={onBack}
          disabled={isLoading || isResending}
          sx={{
            fontSize: '0.8rem',
            minWidth: 'auto',
            px: 1,
          }}
        >
          تغيير رقم الهاتف
        </Button>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mx: 1, alignSelf: 'center' }}
        >
          •
        </Typography>
        
        <Button
          variant="text"
          size="small"
          onClick={handleResend}
          disabled={isLoading || isResending || countdown > 0}
          startIcon={isResending ? <CircularProgress size={16} /> : null}
          sx={{
            fontSize: '0.8rem',
            minWidth: 'auto',
            px: 1,
          }}
        >
          {isResending
            ? 'جارٍ الإرسال...'
            : countdown > 0
            ? `إعادة إرسال (${countdown}s)`
            : 'إعادة إرسال الرمز'}
        </Button>
      </Box>
    </Box>
  );
};
