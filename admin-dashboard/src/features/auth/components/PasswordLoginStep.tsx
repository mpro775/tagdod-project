import React, { useState } from 'react';
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
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation Schema
const passwordLoginSchema = z.object({
  phone: z.string().min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type PasswordLoginFormData = z.infer<typeof passwordLoginSchema>;

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
  const [showPassword, setShowPassword] = useState(false);

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
        label="رقم الهاتف"
        placeholder="05xxxxxxxx"
        error={!!form.formState.errors.phone}
        helperText={form.formState.errors.phone?.message}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2, fontFamily: 'Cairo' }}
        autoFocus
        dir="ltr"
        disabled={isLoading}
      />

      <TextField
        {...form.register('password')}
        fullWidth
        label="كلمة المرور"
        type={showPassword ? 'text' : 'password'}
        placeholder="أدخل كلمة المرور"
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
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2, fontFamily: 'Cairo' }}
        disabled={isLoading}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{ py: 1.5, mb: 2 }}
      >
        {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
      </Button>

      {onSwitchToOTP && (
        <>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              أو
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={onSwitchToOTP}
            disabled={isLoading}
            sx={{ py: 1.5 }}
          >
            تسجيل الدخول عبر OTP
          </Button>
        </>
      )}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link href="#" variant="body2" color="primary" underline="hover">
          نسيت كلمة المرور؟
        </Link>
      </Box>
    </Box>
  );
};

