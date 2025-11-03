import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { AuthLayout, PhoneInputStep, OtpInputStep, AuthStepper } from '../components';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');

  const steps = [t('steps.enterPhone'), t('steps.verifyCode')];

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOtp,
    onSuccess: (data) => {
      setDevCode(data.devCode || '');
      setStep('otp');
      setPhoneError('');
      toast.success(t('messages.otpSent'));
    },
    onError: (error) => {
      setPhoneError(t('messages.otpSendFailed'));
      ErrorHandler.showError(error);
    },
  });

  // Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: async () => {
      setOtpError('');
      toast.success(t('forgotPassword.verifySuccess'));
      // يمكن إضافة خطوة إعادة تعيين كلمة المرور هنا
      navigate('/login');
    },
    onError: (error) => {
      setOtpError(t('messages.otpInvalid'));
      ErrorHandler.showError(error);
    },
  });

  // Handle Phone Submit
  const handlePhoneSubmit = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setPhoneError('');
    sendOtpMutation.mutate({
      phone: phoneNumber,
      context: 'reset',
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
      context: 'reset',
    });
  };

  // Handle Back to Phone Step
  const handleBackToPhone = () => {
    setStep('phone');
    setOtpError('');
  };

  return (
    <AuthLayout
      title={t('forgotPassword.title')}
      subtitle={
        step === 'phone' 
          ? t('forgotPassword.subtitle.phone') 
          : t('forgotPassword.subtitle.otp')
      }
      showLogo={true}
    >
      <AuthStepper
        activeStep={step === 'phone' ? 0 : 1}
        steps={steps}
        showStepper={true}
      />

      {step === 'phone' && (
        <PhoneInputStep
          onSubmit={handlePhoneSubmit}
          isLoading={sendOtpMutation.isPending}
          error={phoneError}
        />
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