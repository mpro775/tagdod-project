import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
  Alert,
  Collapse,
} from '@mui/material';
import { Person, Lock, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation Schema
const devLoginSchema = z.object({
  phone: z.string().min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type DevLoginFormData = z.infer<typeof devLoginSchema>;

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
  const [showForm, setShowForm] = useState(false);
  
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
        >
          تسجيل دخول التطوير
        </Button>
        
        <Collapse in={showForm}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              هذا الخيار متاح فقط في مرحلة التطوير. استخدم بيانات السوبر أدمن للدخول.
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
            label="رقم الهاتف"
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
            sx={{ mb: 2, fontFamily: 'Cairo' }}
            // autoFocus
            dir="ltr"
            disabled={isLoading}
          />

          <TextField
            {...form.register('password')}
            fullWidth
            label="كلمة المرور"
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
            sx={{ mb: 3, fontFamily: 'Cairo' }}
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
            sx={{ py: 1.5 }}
          >
            {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل دخول التطوير'}
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 2,
              fontSize: '0.75rem',
            }}
          >
            بيانات افتراضية: 777777777 / Admin123!@#
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};
