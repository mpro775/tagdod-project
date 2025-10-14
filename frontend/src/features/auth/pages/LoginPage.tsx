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
  IconButton,
} from '@mui/material';
import { Phone, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';

// Validation Schema for Phone Step
const phoneSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'),
});

// Validation Schema for OTP Step
const otpSchema = z.object({
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState('');
  const [showDevCode, setShowDevCode] = useState(false);

  // Phone Form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  // OTP Form
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOtp,
    onSuccess: (data) => {
      setDevCode(data.devCode || '');
      setStep('otp');
      toast.success('تم إرسال رمز التحقق بنجاح');
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });

  // Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: async (data) => {
      // تسجيل الدخول
      login(
        {
          _id: data.me.id,
          phone: data.me.phone,
          firstName: '',
          roles: [],
        },
        data.tokens.access,
        data.tokens.refresh
      );

      // الحصول على بيانات المستخدم الكاملة
      try {
        const profile = await authApi.getProfile();
        
        // التحقق من أن المستخدم admin
        if (!profile.user.isAdmin) {
          toast.error('هذا الحساب غير مصرح له بالدخول للوحة التحكم');
          useAuthStore.getState().logout();
          return;
        }

        // تحديث بيانات المستخدم
        useAuthStore.getState().updateUser({
          _id: profile.user.id,
          phone: profile.user.phone,
          firstName: profile.user.firstName || '',
          lastName: profile.user.lastName,
          email: profile.user.jobTitle, // مؤقت
          roles: profile.user.isAdmin ? ['admin'] : ['user'],
        });

        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/dashboard');
      } catch (error) {
        ErrorHandler.showError(error);
        useAuthStore.getState().logout();
      }
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });

  // Handle Phone Submit
  const handlePhoneSubmit = (data: PhoneFormData) => {
    setPhone(data.phone);
    sendOtpMutation.mutate({
      phone: data.phone,
      context: 'register',
    });
  };

  // Handle OTP Submit
  const handleOtpSubmit = (data: OtpFormData) => {
    verifyOtpMutation.mutate({
      phone,
      code: data.code,
    });
  };

  // Resend OTP
  const handleResend = () => {
    sendOtpMutation.mutate({
      phone,
      context: 'register',
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
              لوحة تحكم تقدودو
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 'phone' ? 'أدخل رقم هاتفك للمتابعة' : 'أدخل رمز التحقق المرسل'}
            </Typography>
          </Box>

          {/* Dev Code Alert (Development Only) */}
          {devCode && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  رمز التطوير:{' '}
                  <Typography component="span" fontWeight="bold">
                    {showDevCode ? devCode : '******'}
                  </Typography>
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowDevCode(!showDevCode)}
                >
                  {showDevCode ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </Box>
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
                disabled={sendOtpMutation.isPending}
                startIcon={sendOtpMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                {sendOtpMutation.isPending ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)}>
              <TextField
                {...otpForm.register('code')}
                fullWidth
                label="رمز التحقق"
                placeholder="000000"
                error={!!otpForm.formState.errors.code}
                helperText={otpForm.formState.errors.code?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                autoFocus
                dir="ltr"
                inputProps={{ maxLength: 6 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                تم إرسال الرمز إلى {phone}
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={verifyOtpMutation.isPending}
                startIcon={verifyOtpMutation.isPending ? <CircularProgress size={20} /> : null}
                sx={{ mb: 2 }}
              >
                {verifyOtpMutation.isPending ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
              </Button>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setStep('phone')}
                  disabled={sendOtpMutation.isPending}
                >
                  تغيير رقم الهاتف
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                  •
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleResend}
                  disabled={sendOtpMutation.isPending}
                >
                  إعادة إرسال الرمز
                </Button>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

