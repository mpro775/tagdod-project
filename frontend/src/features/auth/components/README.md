# مكونات التحقق (Auth Components)

مجموعة من المكونات القابلة لإعادة الاستخدام لصفحات التحقق في التطبيق.

## المكونات المتاحة

### 1. AuthLayout
تخطيط أساسي لصفحات التحقق مع تصميم احترافي.

```tsx
<AuthLayout
  title="عنوان الصفحة"
  subtitle="وصف الصفحة"
  showLogo={true}
>
  {/* محتوى الصفحة */}
</AuthLayout>
```

**الخصائص:**
- `title`: عنوان الصفحة
- `subtitle`: وصف الصفحة
- `showLogo`: إظهار الشعار (افتراضي: true)
- `children`: محتوى الصفحة

### 2. PhoneInputStep
مكون إدخال رقم الهاتف مع التحقق من صحة البيانات.

```tsx
<PhoneInputStep
  onSubmit={(phone) => console.log(phone)}
  isLoading={false}
  error=""
/>
```

**الخصائص:**
- `onSubmit`: دالة استدعاء عند إرسال رقم الهاتف
- `isLoading`: حالة التحميل
- `error`: رسالة الخطأ

### 3. OtpInputStep
مكون إدخال رمز التحقق مع إمكانية إعادة الإرسال.

```tsx
<OtpInputStep
  phone="05XXXXXXXX"
  onSubmit={(code) => console.log(code)}
  onResend={() => console.log('resend')}
  onBack={() => console.log('back')}
  isLoading={false}
  isResending={false}
  error=""
  devCode="123456"
/>
```

**الخصائص:**
- `phone`: رقم الهاتف
- `onSubmit`: دالة استدعاء عند إرسال الرمز
- `onResend`: دالة إعادة إرسال الرمز
- `onBack`: دالة العودة للخطوة السابقة
- `isLoading`: حالة التحميل
- `isResending`: حالة إعادة الإرسال
- `error`: رسالة الخطأ
- `devCode`: رمز التطوير (اختياري)

### 4. AuthStepper
مؤشر التقدم للخطوات.

```tsx
<AuthStepper
  activeStep={0}
  steps={['الخطوة الأولى', 'الخطوة الثانية']}
  showStepper={true}
/>
```

**الخصائص:**
- `activeStep`: الخطوة النشطة
- `steps`: قائمة الخطوات
- `showStepper`: إظهار المؤشر (افتراضي: true)

### 5. AuthBackground
خلفية احترافية مع تأثيرات بصرية.

```tsx
<AuthBackground>
  {/* محتوى الصفحة */}
</AuthBackground>
```

### 6. LoadingOverlay
طبقة تحميل مع تأثيرات بصرية.

```tsx
<LoadingOverlay
  open={true}
  message="جارٍ التحميل..."
/>
```

**الخصائص:**
- `open`: إظهار الطبقة
- `message`: رسالة التحميل

## مثال على الاستخدام

```tsx
import React, { useState } from 'react';
import {
  AuthLayout,
  PhoneInputStep,
  OtpInputStep,
  AuthStepper,
  AuthBackground,
} from '../components';

export const LoginPage = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');

  return (
    <AuthBackground>
      <AuthLayout
        title="تسجيل الدخول"
        subtitle="أدخل بياناتك للمتابعة"
        showLogo={true}
      >
        <AuthStepper
          activeStep={step === 'phone' ? 0 : 1}
          steps={['إدخال رقم الهاتف', 'التحقق من الرمز']}
        />

        {step === 'phone' && (
          <PhoneInputStep
            onSubmit={(phoneNumber) => {
              setPhone(phoneNumber);
              setStep('otp');
            }}
            isLoading={false}
            error=""
          />
        )}

        {step === 'otp' && (
          <OtpInputStep
            phone={phone}
            onSubmit={(code) => console.log(code)}
            onResend={() => console.log('resend')}
            onBack={() => setStep('phone')}
            isLoading={false}
            isResending={false}
            error=""
          />
        )}
      </AuthLayout>
    </AuthBackground>
  );
};
```

## المميزات

- ✅ تصميم احترافي ومتجاوب
- ✅ دعم اللغة العربية (RTL)
- ✅ تأثيرات بصرية متقدمة
- ✅ مكونات قابلة لإعادة الاستخدام
- ✅ تحقق من صحة البيانات
- ✅ معالجة الأخطاء
- ✅ حالات التحميل
- ✅ دعم الوضع المظلم
- ✅ تحسينات الأداء
