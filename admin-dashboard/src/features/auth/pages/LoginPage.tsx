import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { AuthLayout, PhoneInputStep, OtpInputStep, AuthStepper, DevLoginStep, PasswordLoginStep } from '../components';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [devLoginError, setDevLoginError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
          _id: data.me.id,
          phone: data.me.phone,
          firstName: data.me.firstName || '',
          roles: data.me.roles || ['super_admin'],
          permissions: data.me.permissions || [
            'users.create',
            'users.read', 
            'users.update',
            'users.delete',
            'admin.access',
            'super_admin.access'
          ],
        },
        data.tokens.access,
        data.tokens.refresh
      );

      // تحديث بيانات المستخدم مباشرة من الاستجابة
      useAuthStore.getState().updateUser({
        _id: data.me.id,
        phone: data.me.phone,
        firstName: data.me.firstName || '',
        lastName: data.me.lastName,
        email: '', // مؤقت
        roles: data.me.roles || ['super_admin'], // استخدام الأدوار من الاستجابة
        permissions: data.me.permissions || [
          'users.create',
          'users.read', 
          'users.update',
          'users.delete',
          'admin.access',
          'super_admin.access'
        ],
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

  // Admin Password Login Mutation
  const adminLoginMutation = useMutation({
    mutationFn: authApi.adminLogin,
    onSuccess: async (data) => {
      setPasswordError('');
      
      // تسجيل الدخول
      login(
        {
          _id: data.me.id,
          phone: data.me.phone,
          firstName: data.me.firstName || '',
          roles: data.me.roles || [],
          permissions: data.me.permissions || [],
        },
        data.tokens.access,
        data.tokens.refresh
      );

      // تحديث بيانات المستخدم مباشرة من الاستجابة
      useAuthStore.getState().updateUser({
        _id: data.me.id,
        phone: data.me.phone,
        firstName: data.me.firstName || '',
        lastName: data.me.lastName,
        email: '', // مؤقت
        roles: data.me.roles || [],
        permissions: data.me.permissions || [],
      });

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    },
    onError: (error) => {
      setPasswordError('رقم الهاتف أو كلمة المرور غير صحيحة');
      ErrorHandler.showError(error);
    },
  });

  // Dev Login Mutation
  const devLoginMutation = useMutation({
    mutationFn: authApi.devLogin,
    onSuccess: async (data) => {
      setDevLoginError('');
      
      // تسجيل الدخول
      login(
        {
          _id: data.me.id,
          phone: data.me.phone,
          firstName: data.me.firstName || '',
          roles: data.me.roles || [],
        },
        data.tokens.access,
        data.tokens.refresh
      );

      // تحديث بيانات المستخدم مباشرة من الاستجابة
      useAuthStore.getState().updateUser({
        _id: data.me.id,
        phone: data.me.phone,
        firstName: data.me.firstName || '',
        lastName: data.me.lastName,
        email: '', // مؤقت
        roles: data.me.roles || ['super_admin'], // استخدام الأدوار من الاستجابة أو افتراض super_admin
        permissions: data.me.permissions || [
          'users.create',
          'users.read', 
          'users.update',
          'users.delete',
          'admin.access',
          'super_admin.access'
        ],
      });

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    },
    onError: (error) => {
      setDevLoginError('فشل في تسجيل الدخول. تحقق من البيانات.');
      ErrorHandler.showError(error);
    },
  });

  // Handle Admin Password Login
  const handlePasswordLogin = (data: { phone: string; password: string }) => {
    setPasswordError('');
    adminLoginMutation.mutate(data);
  };

  // Handle Dev Login
  const handleDevLogin = (data: { phone: string; password: string }) => {
    setDevLoginError('');
    devLoginMutation.mutate(data);
  };

  return (
    <AuthLayout
      title="لوحة التحكم"
      subtitle={
        loginMethod === 'password'
          ? 'سجل دخول باستخدام رقم الهاتف وكلمة المرور'
          : step === 'phone'
          ? 'أدخل رقم هاتفك للمتابعة'
          : 'أدخل رمز التحقق المرسل'
      }
      showLogo={true}
    >
      {loginMethod === 'otp' && (
        <AuthStepper
          activeStep={step === 'phone' ? 0 : 1}
          steps={steps}
          showStepper={true}
        />
      )}

      {loginMethod === 'password' && (
        <PasswordLoginStep
          onSubmit={handlePasswordLogin}
          isLoading={adminLoginMutation.isPending}
          error={passwordError}
          onSwitchToOTP={() => setLoginMethod('otp')}
        />
      )}

      {loginMethod === 'otp' && step === 'phone' && (
        <>
          <PhoneInputStep
            onSubmit={handlePhoneSubmit}
            isLoading={sendOtpMutation.isPending}
            error={phoneError}
            onSwitchToPassword={() => setLoginMethod('password')}
          />
          
          <DevLoginStep
            onSubmit={handleDevLogin}
            isLoading={devLoginMutation.isPending}
            error={devLoginError}
          />
        </>
      )}

      {loginMethod === 'otp' && step === 'otp' && (
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
