import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { AuthLayout, PhoneInputStep, OtpInputStep, AuthStepper, DevLoginStep } from '../components';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [devLoginError, setDevLoginError] = useState('');

  const steps = ['إدخال رقم الهاتف', 'التحقق من الرمز'];

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOtp,
    onSuccess: (data) => {
      setDevCode(data.devCode || '');
      setStep('otp');
      setPhoneError('');
      toast.success('تم إرسال رمز التحقق بنجاح');
    },
    onError: (error) => {
      setPhoneError('فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
      ErrorHandler.showError(error);
    },
  });

  // Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: async (data) => {
      setOtpError('');
      
      // تسجيل الدخول
      login(
        {
          _id: data.data.me.id,
          phone: data.data.me.phone,
          firstName: data.data.me.firstName || '',
          roles: data.data.me.roles || [],
        },
        data.data.tokens.access,
        data.data.tokens.refresh
      );

      // تحديث بيانات المستخدم مباشرة من الاستجابة
      useAuthStore.getState().updateUser({
        _id: data.data.me.id,
        phone: data.data.me.phone,
        firstName: data.data.me.firstName || '',
        lastName: data.data.me.lastName,
        email: '', // مؤقت
        roles: data.data.me.roles || ['admin'], // استخدام الأدوار من الاستجابة
      });

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    },
    onError: (error) => {
      setOtpError('رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
      ErrorHandler.showError(error);
    },
  });

  // Handle Phone Submit
  const handlePhoneSubmit = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setPhoneError('');
    sendOtpMutation.mutate({
      phone: phoneNumber,
      context: 'register',
    });
  };

  // Handle OTP Submit
  const handleOtpSubmit = (code: string) => {
    setOtpError('');
    verifyOtpMutation.mutate({
      phone,
      code,
    });
  };

  // Resend OTP
  const handleResend = () => {
    setOtpError('');
    sendOtpMutation.mutate({
      phone,
      context: 'register',
    });
  };

  // Handle Back to Phone Step
  const handleBackToPhone = () => {
    setStep('phone');
    setOtpError('');
  };

  // Dev Login Mutation
  const devLoginMutation = useMutation({
    mutationFn: authApi.devLogin,
    onSuccess: async (data) => {
      setDevLoginError('');
      
      // تسجيل الدخول
      login(
        {
          _id: data.data.me.id,
          phone: data.data.me.phone,
          firstName: data.data.me.firstName || '',
          roles: data.data.me.roles || [],
        },
        data.data.tokens.access,
        data.data.tokens.refresh
      );

      // تحديث بيانات المستخدم مباشرة من الاستجابة
      useAuthStore.getState().updateUser({
        _id: data.data.me.id,
        phone: data.data.me.phone,
        firstName: data.data.me.firstName || '',
        lastName: data.data.me.lastName,
        email: '', // مؤقت
        roles: data.data.me.roles || ['admin'], // استخدام الأدوار من الاستجابة أو افتراض admin
      });

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    },
    onError: (error) => {
      setDevLoginError('فشل في تسجيل الدخول. تحقق من البيانات.');
      ErrorHandler.showError(error);
    },
  });

  // Handle Dev Login
  const handleDevLogin = (data: { phone: string; password: string }) => {
    setDevLoginError('');
    devLoginMutation.mutate(data);
  };

  return (
    <AuthLayout
      title="لوحةالتحكم "
      subtitle={
        step === 'phone' 
          ? 'أدخل رقم هاتفك للمتابعة' 
          : 'أدخل رمز التحقق المرسل'
      }
      showLogo={true}
    >
      <AuthStepper
        activeStep={step === 'phone' ? 0 : 1}
        steps={steps}
        showStepper={true}
      />

      {step === 'phone' && (
        <>
          <PhoneInputStep
            onSubmit={handlePhoneSubmit}
            isLoading={sendOtpMutation.isPending}
            error={phoneError}
          />
          
          <DevLoginStep
            onSubmit={handleDevLogin}
            isLoading={devLoginMutation.isPending}
            error={devLoginError}
          />
        </>
      )}

      {step === 'otp' && (
        <OtpInputStep
          phone={phone}
          onSubmit={handleOtpSubmit}
          onResend={handleResend}
          onBack={handleBackToPhone}
          isLoading={verifyOtpMutation.isPending}
          isResending={sendOtpMutation.isPending}
          error={otpError}
          devCode={devCode}
        />
      )}

    </AuthLayout>
  );
};
