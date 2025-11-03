import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
  Alert,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Person, Lock, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

interface DevLoginStepProps {
  onSubmit: (data: { phone: string; password: string }) => void; // eslint-disable-line no-unused-vars
  isLoading?: boolean;
  error?: string;
}

export const DevLoginStep: React.FC<DevLoginStepProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const { t, ready } = useTranslation('auth');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showForm, setShowForm] = useState(false);
  
  // Validation Schema - created with useMemo to ensure translations are loaded
  const devLoginSchema = useMemo(() => {
    if (!ready) {
      // Return a basic schema until translations are ready
      return z.object({
        phone: z.string().min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'),
        password: z.string().min(1, 'كلمة المرور مطلوبة'),
      });
    }
    return z.object({
      phone: z.string().min(9, t('validation.phoneMin')),
      password: z.string().min(1, t('validation.passwordRequired')),
    });
  }, [t, ready]);

  type DevLoginFormData = z.infer<typeof devLoginSchema>;
  
  const form = useForm<DevLoginFormData>({
    resolver: zodResolver(devLoginSchema),
    defaultValues: { phone: '', password: '' },
  });

  const handleSubmit = (data: DevLoginFormData) => {
    onSubmit(data);
  };

  return (
    <Box>
      {/* Development Login Toggle */}
      <Box sx={{ mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setShowForm(!showForm)}
          startIcon={showForm ? <ExpandLess /> : <ExpandMore />}
          sx={{ mb: 2 }}
          size={isMobile ? 'medium' : 'large'}
        >
          {t('dev.title')}
        </Button>
        
        <Collapse in={showForm}>
          <Alert severity="info" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              {t('dev.message')}
            </Typography>
          </Alert>
        </Collapse>
      </Box>

      {/* Development Login Form */}
      <Collapse in={showForm}>
        <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
          <TextField
            {...form.register('phone')}
            fullWidth
            label={t('phone.label')}
            placeholder="777777777"
            error={!!form.formState.errors.phone || !!error}
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
            dir="ltr"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
          />

          <TextField
            {...form.register('password')}
            fullWidth
            label={t('password.label')}
            type="password"
            placeholder="Admin123!@#"
            error={!!form.formState.errors.password}
            helperText={form.formState.errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              fontFamily: 'Cairo',
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? theme.palette.background.default 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.background.default 
                    : 'transparent',
                },
                '&.Mui-focused': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? theme.palette.background.default 
                    : 'transparent',
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
            sx={{ py: { xs: 1.25, sm: 1.5 } }}
          >
            {isLoading ? t('loading.loggingIn') : t('dev.title')}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 2,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            }}
          >
            {t('dev.defaultCredentials')}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};
