import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Link,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

interface PasswordLoginStepProps {
  onSubmit: (data: { phone: string; password: string }) => void;
  isLoading?: boolean;
  error?: string;
  onSwitchToOTP?: () => void;
}

export const PasswordLoginStep: React.FC<PasswordLoginStepProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onSwitchToOTP,
}) => {
  const { t, ready } = useTranslation('auth');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);

  // Validation Schema - created with useMemo to ensure translations are loaded
  const passwordLoginSchema = useMemo(() => {
    if (!ready) {
      // Return a basic schema until translations are ready
      return z.object({
        phone: z.string().min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'),
        password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
      });
    }
    return z.object({
      phone: z.string().min(9, t('validation.phoneMin')),
      password: z.string().min(6, t('validation.passwordMin')),
    });
  }, [t, ready]);

  type PasswordLoginFormData = z.infer<typeof passwordLoginSchema>;

  const form = useForm<PasswordLoginFormData>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { phone: '', password: '' },
  });

  const handleSubmit = (data: PasswordLoginFormData) => {
    onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
      <TextField
        {...form.register('phone')}
        fullWidth
        label={t('phone.label')}
        placeholder={t('password.placeholderPassword')}
        error={!!form.formState.errors.phone}
        helperText={form.formState.errors.phone?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person color="action" />
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
        autoFocus
        dir="ltr"
        disabled={isLoading}
        size={isMobile ? 'small' : 'medium'}
      />

      <TextField
        {...form.register('password')}
        fullWidth
        label={t('password.label')}
        type={showPassword ? 'text' : 'password'}
        placeholder={t('password.placeholder')}
        error={!!form.formState.errors.password}
        helperText={form.formState.errors.password?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
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
        disabled={isLoading}
        size={isMobile ? 'small' : 'medium'}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size={isMobile ? 'medium' : 'large'}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{ py: { xs: 1.25, sm: 1.5 }, mb: 2 }}
      >
        {isLoading ? t('loading.loggingIn') : t('buttons.login')}
      </Button>

      {onSwitchToOTP && (
        <>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              {t('divider')}
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={onSwitchToOTP}
            disabled={isLoading}
            size={isMobile ? 'medium' : 'large'}
            sx={{ py: { xs: 1.25, sm: 1.5 } }}
          >
            {t('buttons.loginWithOTP')}
          </Button>
        </>
      )}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link href="/forgot-password" variant="body2" color="primary" underline="hover" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
          {t('password.forgot')}
        </Link>
      </Box>
    </Box>
  );
};

