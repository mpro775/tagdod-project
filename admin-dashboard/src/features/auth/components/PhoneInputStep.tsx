import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Phone } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation Schema
const phoneSchema = z.object({
  phone: z
    .string()
    .min(9, 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل')
    .regex(/^7\d{8}$/, 'رقم الهاتف يجب أن يبدأ بـ 7 ويحتوي على 10 أرقام'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

interface PhoneInputStepProps {
  onSubmit: (phone: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const PhoneInputStep: React.FC<PhoneInputStepProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
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
        label="رقم الهاتف"
        placeholder="7XXXXXXXX"
        error={!!form.formState.errors.phone || !!error}
        helperText={form.formState.errors.phone?.message || error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, fontFamily: 'Cairo' }}
        autoFocus
        dir="ltr"
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{ py: 1.5 }}
      >
        {isLoading ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
      </Button>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textAlign: 'center',
          fontFamily: 'Cairo',
          mt: 2,
          fontSize: '0.75rem',
        }}
      >
        سنرسل لك رمز التحقق عبر الرسائل النصية
      </Typography>
    </Box>
  );
};
