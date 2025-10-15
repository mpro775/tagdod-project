# Auth Module

يوفر هذا الموديول مصادقة مبنية على OTP مع رموز JWT وإدارة بسيطة للملف الشخصي.

## المكونات
- Controller: `auth/auth.controller.ts`
- Services: `auth/otp.service.ts`, `auth/tokens.service.ts`
- Guard: `auth/jwt-auth.guard.ts`
- Schemas مستخدمة: `users/schemas/user.schema.ts`, `capabilities/schemas/capabilities.schema.ts`

## الاعتماديات (Module)
- `AuthModule` يستورد:
  - `MongooseModule.forFeature([User, Capabilities])`
  - `FavoritesModule` لمزامنة المفضلات بعد التسجيل
- يعرّف `AuthController` ويزوّد `OtpService` و`TokensService`.

## الخدمات
- `OtpService`
  - يستخدم Redis (`REDIS_URL`) لتخزين OTP مع صلاحية `OTP_TTL_SECONDS` وطول `OTP_LENGTH`.
  - `sendOtp(phone, ctx)` يرجع `{ sent, devCode? }` (devCode يظهر فقط إذا `OTP_DEV_ECHO=true`).
  - `verifyOtp(phone, code, ctx)` يتحقق ويحذف الرمز عند النجاح.
- `TokensService`
  - يوقّع Access/Refresh JWT باستخدام `JWT_SECRET` و`REFRESH_SECRET`.
  - `signAccess`, `signRefresh`, `verifyAccess`, `verifyRefresh`.
- `JwtAuthGuard`
  - يقرأ ترويسة Authorization Bearer، يحقق من الـ Access Token ويضع `req.user = { sub, phone, isAdmin }`.

## نقاط النهاية (Endpoints)
Base path: `/auth`

- POST `/auth/send-otp`
  - Body: `SendOtpDto { phone: string; context?: 'register'|'reset' }`
  - Returns: `{ sent: boolean, devCode?: string }`

- POST `/auth/verify-otp`
  - Body: `VerifyOtpDto { phone: string; code: string; firstName?, lastName?, gender?, capabilityRequest?: 'engineer'|'wholesale', jobTitle?, deviceId? }`
  - السلوك:
    - إنشاء مستخدم جديد إن لم يوجد، وضبط `capabilities` (customer افتراضيًا).
    - إذا `capabilityRequest='engineer'` يتطلب `jobTitle`.
    - يحدّث حالة قدرات المستخدم إلى `pending` عند الطلب.
    - مزامنة المفضلات من الجهاز `deviceId` إلى المستخدم.
    - يرجع `{ tokens: { access, refresh }, me: { id, phone } }`.

- POST `/auth/forgot-password`
  - Body: `ForgotPasswordDto { phone: string }`
  - يرسل OTP بسياق reset.

- POST `/auth/reset-password`
  - Body: `ResetPasswordDto { phone: string; code: string; newPassword: string }`
  - يتحقق من OTP ويحدّث كلمة المرور.

- POST `/auth/set-password` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - Body: `SetPasswordDto { password: string }`
  - يحدد/يحدّث كلمة المرور للمستخدم الحالي.

- GET `/auth/me` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - يرجع `{ user, capabilities }`.

- PATCH `/auth/me` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - Body: `{ firstName?, lastName?, gender?, jobTitle? }`
  - يحدّث حقول الملف الشخصي المسموح بها.

- DELETE `/auth/me` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - يحذف المستخدم وسجل القدرات.

- GET `/auth/admin/pending` (محمي، مسؤول)
  - Guards: `JwtAuthGuard`, `AdminGuard`
  - يعيد الطلبات المعلقة لقدرات engineer/wholesale.

- POST `/auth/admin/approve` (محمي، مسؤول)
  - Guards: `JwtAuthGuard`, `AdminGuard`
  - Body: `{ userId: string; capability: 'engineer'|'wholesale'; approve: boolean; wholesaleDiscountPercent?: number }`
  - يعتمد/يرفض القدرة، ويضبط `wholesale_discount_percent` عند الموافقة.

## المتغيرات البيئية
- `JWT_SECRET`, `REFRESH_SECRET`
- `REDIS_URL`, `OTP_TTL_SECONDS`, `OTP_LENGTH`, `OTP_DEV_ECHO`

## ملاحظات
- يستخدم `bcryptjs` لتجزئة كلمات المرور.
- ترويسة Authorization يجب أن تكون `Bearer <token>`.
