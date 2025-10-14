import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Phone, Lock, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';

// Validation Schemas
const phoneSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'),
});

const resetSchema = z.object({
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
  newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirmPassword'],
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'phone' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState('');

  // Phone Form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  // Reset Form
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Forgot Password Mutation
  const forgotMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      setDevCode(data.devCode || '');
      setStep('reset');
      toast.success('تم إرسال رمز التحقق بنجاح');
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });

  // Reset Password Mutation
  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('تم إعادة تعيين كلمة المرور بنجاح');
      navigate('/login');
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });

  // Handle Phone Submit
  const handlePhoneSubmit = (data: PhoneFormData) => {
    setPhone(data.phone);
    forgotMutation.mutate({ phone: data.phone });
  };

  // Handle Reset Submit
  const handleResetSubmit = (data: ResetFormData) => {
    resetMutation.mutate({
      phone,
      code: data.code,
      newPassword: data.newPassword,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              إعادة تعيين كلمة المرور
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 'phone'
                ? 'أدخل رقم هاتفك لإرسال رمز التحقق'
                : 'أدخل رمز التحقق وكلمة المرور الجديدة'}
            </Typography>
          </Box>

          {/* Dev Code Alert */}
          {devCode && (
            <Alert severity="info" sx={{ mb: 3 }}>
              رمز التطوير: <strong>{devCode}</strong>
            </Alert>
          )}

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}>
              <TextField
                {...phoneForm.register('phone')}
                fullWidth
                label="رقم الهاتف"
                placeholder="05XXXXXXXX"
                error={!!phoneForm.formState.errors.phone}
                helperText={phoneForm.formState.errors.phone?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                autoFocus
                dir="ltr"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={forgotMutation.isPending}
                startIcon={forgotMutation.isPending ? <CircularProgress size={20} /> : null}
                sx={{ mb: 2 }}
              >
                {forgotMutation.isPending ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
              </Button>

              <Button
                fullWidth
                variant="text"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
              >
                العودة لتسجيل الدخول
              </Button>
            </form>
          )}

          {/* Reset Step */}
          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleResetSubmit)}>
              <TextField
                {...resetForm.register('code')}
                fullWidth
                label="رمز التحقق"
                placeholder="000000"
                error={!!resetForm.formState.errors.code}
                helperText={resetForm.formState.errors.code?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                dir="ltr"
                inputProps={{ maxLength: 6 }}
              />

              <TextField
                {...resetForm.register('newPassword')}
                fullWidth
                type="password"
                label="كلمة المرور الجديدة"
                error={!!resetForm.formState.errors.newPassword}
                helperText={resetForm.formState.errors.newPassword?.message}
                sx={{ mb: 2 }}
              />

              <TextField
                {...resetForm.register('confirmPassword')}
                fullWidth
                type="password"
                label="تأكيد كلمة المرور"
                error={!!resetForm.formState.errors.confirmPassword}
                helperText={resetForm.formState.errors.confirmPassword?.message}
                sx={{ mb: 3 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                تم إرسال الرمز إلى {phone}
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={resetMutation.isPending}
                startIcon={resetMutation.isPending ? <CircularProgress size={20} /> : null}
                sx={{ mb: 2 }}
              >
                {resetMutation.isPending ? 'جارٍ التحديث...' : 'إعادة تعيين كلمة المرور'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setStep('phone')}
                disabled={forgotMutation.isPending}
              >
                تغيير رقم الهاتف
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

