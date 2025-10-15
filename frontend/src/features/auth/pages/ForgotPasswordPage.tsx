import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { AuthLayout, PhoneInputStep, OtpInputStep, AuthStepper } from '../components';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [devCode, setDevCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');

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
    onSuccess: async () => {
      setOtpError('');
      toast.success('تم التحقق من الرمز بنجاح');
      // يمكن إضافة خطوة إعادة تعيين كلمة المرور هنا
      navigate('/login');
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
      title="إعادة تعيين كلمة المرور"
      subtitle={
        step === 'phone' 
          ? 'أدخل رقم هاتفك لإعادة تعيين كلمة المرور' 
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