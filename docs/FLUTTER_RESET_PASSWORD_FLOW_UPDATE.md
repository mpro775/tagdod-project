# Flutter Integration Update: Forgot Password Flow (OTP + Reset Session)

هذا الملف مخصص لمطور Flutter لتطبيق التحديثات الأخيرة في مسار **نسيت كلمة المرور** بحيث لا يحدث تعارض "OTP صحيح ثم فشل إعادة التعيين".

## لماذا هذا التحديث؟

سابقاً كان المسار كالتالي:
1. `verify-reset-otp` ينجح
2. `reset-password` يطلب OTP مرة ثانية

لكن OTP كان يُستهلك بعد التحقق الأول، فيفشل الطلب الثاني.

الحل الجديد الاحترافي:
- بعد نجاح `verify-reset-otp` يرجع السيرفر `resetToken`.
- `reset-password` يعتمد على `resetToken` (بدل إعادة التحقق من OTP).

> ملاحظة: ما زال `reset-password` يقبل `code` للتوافق الخلفي (backward compatibility)، لكن المطلوب في Flutter هو استخدام `resetToken`.

---

## Endpoints النهائية

### 1) إرسال OTP
`POST /api/v1/auth/forgot-password`

#### Request
```json
{
  "phone": "+967775019485"
}
```

#### Response (مثال)
```json
{
  "success": true,
  "data": {
    "sent": true
  }
}
```

---

### 2) التحقق من OTP (جديد: يعيد resetToken)
`POST /api/v1/auth/verify-reset-otp`

#### Request
```json
{
  "phone": "+967775019485",
  "code": "123456"
}
```

#### Response (مهم)
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "OTP صحيح",
    "resetToken": "a3f3fef3d4f54a2ea2f47f5f1b8f4f45c520ff954b8d5bc6b65c6f6e653a90be"
  }
}
```

> يجب حفظ `resetToken` مؤقتاً في state أثناء رحلة إعادة التعيين.

---

### 3) إعادة تعيين كلمة المرور (المسار الجديد)
`POST /api/v1/auth/reset-password`

#### Request (المطلوب في Flutter)
```json
{
  "phone": "+967775019485",
  "resetToken": "a3f3fef3d4f54a2ea2f47f5f1b8f4f45c520ff954b8d5bc6b65c6f6e653a90be",
  "newPassword": "NewSecurePassword123!"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "updated": true
  }
}
```

---

## What Flutter Dev Must Change

## 1) Verify OTP response model
أضف حقل:
- `resetToken` (nullable string)

مثال:
```dart
class VerifyResetOtpResponse {
  final bool valid;
  final String? message;
  final String? resetToken;

  VerifyResetOtpResponse({required this.valid, this.message, this.resetToken});
}
```

## 2) Pass resetToken بين الشاشات
بعد نجاح `verify-reset-otp`:
- انتقل لشاشة تعيين كلمة المرور مع:
  - `phone`
  - `resetToken`

## 3) Reset request model
في طلب `reset-password` استخدم:
- `phone`
- `resetToken`
- `newPassword`

ولا ترسل `code` في المسار الجديد.

---

## Suggested Flutter Flow

1. User يدخل رقم الهاتف
2. Call `forgot-password`
3. User يدخل OTP
4. Call `verify-reset-otp`
5. احفظ `resetToken` من الرد
6. User يدخل كلمة المرور الجديدة
7. Call `reset-password` باستخدام `resetToken`
8. عند النجاح: رجّع المستخدم لشاشة تسجيل الدخول

---

## Error Handling Notes

- إذا `verify-reset-otp` رجع خطأ: اعرض "الكود غير صحيح أو منتهي".
- إذا `reset-password` رجع `invalid OTP/resetToken`:
  - غالباً `resetToken` منتهي أو مستخدم.
  - أعد المستخدم لخطوة OTP لإعادة التحقق.

---

## Important Security Notes

- `resetToken` قصير العمر ومرة واحدة (single-use).
- لا تخزنه تخزين دائم (SharedPreferences) إلا عند الحاجة القصيرة؛ الأفضل state مؤقت داخل flow.
- امسحه فور نجاح إعادة التعيين أو مغادرة شاشة reset.

---

## Quick Backend Contract Summary

- `verify-reset-otp` ✅ returns `resetToken`
- `reset-password` ✅ accepts `resetToken` (preferred)
- `reset-password` ✅ still accepts `code` for old clients (temporary compatibility)
