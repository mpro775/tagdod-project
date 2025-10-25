# Auth Module - مكتمل التنفيذ 100%

يوفر هذا الموديول نظام مصادقة شامل مبنية على OTP مع رموز JWT وإدارة متقدمة للملف الشخصي والقدرات.

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
  - Access Token: ينتهي بعد 8 ساعات
  - Refresh Token: ينتهي بعد 30 يوم
  - `signAccess`, `signRefresh`, `verifyAccess`, `verifyRefresh`.
- `JwtAuthGuard`
  - يقرأ ترويسة Authorization Bearer، يحقق من الـ Access Token ويضع `req.user = { sub, phone, isAdmin, roles, permissions, preferredCurrency }`.

## نقاط النهاية (Endpoints) - مطبقة فعلياً ✅
Base path: `/auth`

### المصادقة الأساسية:
- ✅ **POST** `/auth/send-otp`
  - Body: `SendOtpDto { phone: string; context?: 'register'|'reset' }`
  - Returns: `{ sent: boolean, devCode?: string }`

- ✅ **POST** `/auth/verify-otp`
  - Body: `VerifyOtpDto { phone: string; code: string; firstName?, lastName?, gender?, capabilityRequest?: 'engineer'|'wholesale', jobTitle?, deviceId? }`
  - السلوك:
    - إنشاء مستخدم جديد إن لم يوجد، وضبط `capabilities` (customer افتراضيًا).
    - إذا `capabilityRequest='engineer'` يتطلب `jobTitle`.
    - يحدّث حالة قدرات المستخدم إلى `pending` عند الطلب.
    - مزامنة المفضلات من الجهاز `deviceId` إلى المستخدم.
    - يرجع `{ tokens: { access, refresh }, me: { id, phone, preferredCurrency } }`.

### إدارة كلمة المرور:
- ✅ **POST** `/auth/forgot-password`
  - Body: `ForgotPasswordDto { phone: string }`
  - يرسل OTP بسياق reset.

- ✅ **POST** `/auth/reset-password`
  - Body: `ResetPasswordDto { phone: string; code: string; newPassword: string }`
  - يتحقق من OTP ويحدّث كلمة المرور.

- ✅ **POST** `/auth/set-password` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - Body: `SetPasswordDto { password: string }`
  - يحدد/يحدّث كلمة المرور للمستخدم الحالي.

### إدارة الملف الشخصي:
- ✅ **GET** `/auth/me` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - يرجع `{ user: { id, phone, firstName, lastName, gender, jobTitle, isAdmin }, capabilities }`.

- ✅ **PATCH** `/auth/me` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - Body: `{ firstName?, lastName?, gender?, jobTitle? }`
  - يحدّث حقول الملف الشخصي المسموح بها.

- ✅ **PATCH** `/auth/preferred-currency` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - Body: `UpdatePreferredCurrencyDto { currency: string }`
  - يحدّث العملة المفضلة للمستخدم.

- ✅ **DELETE** `/auth/me` (محمي)
  - Auth: Bearer + `JwtAuthGuard`
  - يحذف المستخدم وسجل القدرات.

### إدارة القدرات (Admin):
- ✅ **GET** `/auth/admin/pending` (محمي، مسؤول)
  - Guards: `JwtAuthGuard`, `AdminGuard`
  - يعيد الطلبات المعلقة لقدرات engineer/wholesale.

- ✅ **POST** `/auth/admin/approve` (محمي، مسؤول)
  - Guards: `JwtAuthGuard`, `AdminGuard`
  - Body: `{ userId: string; capability: 'engineer'|'wholesale'; approve: boolean; wholesaleDiscountPercent?: number }`
  - يعتمد/يرفض القدرة، ويضبط `wholesale_discount_percent` عند الموافقة.

### إدارة النظام (Development):
- ✅ **POST** `/auth/create-super-admin`
  - Body: `{ secretKey: string }`
  - إنشاء سوبر أدمن جديد (للاستخدام الأولي فقط).

- ✅ **POST** `/auth/dev-login`
  - Body: `{ phone: string; password: string }`
  - تسجيل دخول بالمطور (Development فقط، غير متاح في Production).

## المتغيرات البيئية المطلوبة ✅

### JWT & Security:
- ✅ `JWT_SECRET` - مفتاح توقيع Access Token
- ✅ `REFRESH_SECRET` - مفتاح توقيع Refresh Token
- ✅ `SUPER_ADMIN_SECRET` - مفتاح إنشاء السوبر أدمن (افتراضي: TAGADODO_SUPER_ADMIN_2024)

### OTP & Redis:
- ✅ `REDIS_URL` - رابط اتصال Redis
- ✅ `OTP_TTL_SECONDS` - مدة صلاحية OTP (افتراضي: 300 ثانية)
- ✅ `OTP_LENGTH` - طول رمز OTP (افتراضي: 6 أرقام)
- ✅ `OTP_DEV_ECHO` - عرض الرمز في Development (افتراضي: false)

### Environment:
- ✅ `NODE_ENV` - بيئة التشغيل (development/production)

---

## المميزات المتقدمة المطبقة ✅

### 1. نظام OTP متقدم:
- ✅ **Redis Storage**: تخزين آمن للرموز
- ✅ **SHA256 Hashing**: تشفير الرموز باستخدام crypto.createHash
- ✅ **Context Support**: سياقات مختلفة (register/reset)
- ✅ **Auto Cleanup**: حذف الرموز بعد الاستخدام أو الانتهاء
- ✅ **Dev Mode**: عرض الرموز في Development عند تفعيل OTP_DEV_ECHO

### 2. JWT Tokens محسّن:
- ✅ **Dual Tokens**: Access (8h) + Refresh (30d)
- ✅ **Rich Payload**: sub, phone, isAdmin, roles, permissions, preferredCurrency
- ✅ **Secure Secrets**: مفاتيح منفصلة للـ Access والـ Refresh

### 3. إدارة القدرات:
- ✅ **Customer**: قدرة افتراضية لجميع المستخدمين
- ✅ **Engineer**: تحتاج موافقة + jobTitle
- ✅ **Wholesale**: تحتاج موافقة + نسبة خصم
- ✅ **Admin Approval**: نظام موافقة إداري

### 4. أمان متقدم:
- ✅ **bcrypt Hashing**: تشفير كلمات المرور
- ✅ **Role-based Access**: نظام صلاحيات متدرج
- ✅ **Admin Guards**: حماية endpoints الإدارية
- ✅ **Environment Checks**: منع Development endpoints في Production

### 5. إدارة العملات:
- ✅ **Preferred Currency**: عملة مفضلة للمستخدم
- ✅ **Dynamic Updates**: تحديث العملة المفضلة

---

## أمثلة الاستخدام ✅

### تسجيل دخول جديد:
```http
POST /auth/send-otp
{
  "phone": "777123456",
  "context": "register"
}

Response:
{
  "sent": true,
  "devCode": "123456"  // فقط في Development
}
```

### التحقق وإنشاء حساب:
```http
POST /auth/verify-otp
{
  "phone": "777123456",
  "code": "123456",
  "firstName": "أحمد",
  "lastName": "محمد",
  "gender": "male",
  "capabilityRequest": "engineer",
  "jobTitle": "مهندس كهرباء"
}

Response:
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "me": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "777123456",
    "preferredCurrency": "USD"
  }
}
```

### جلب الملف الشخصي:
```http
GET /auth/me
Authorization: Bearer {access_token}

Response:
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "777123456",
    "firstName": "أحمد",
    "lastName": "محمد",
    "gender": "male",
    "jobTitle": "مهندس كهرباء",
    "isAdmin": false
  },
  "capabilities": {
    "customer_capable": true,
    "engineer_capable": false,
    "engineer_status": "pending",
    "wholesale_capable": false
  }
}
```

---

## ملاحظات مهمة ✅
- ✅ يستخدم `bcrypt` لتجزئة كلمات المرور (salt rounds: 10)
- ✅ ترويسة Authorization يجب أن تكون `Bearer <token>`
- ✅ Access Token ينتهي بعد 8 ساعات
- ✅ Refresh Token ينتهي بعد 30 يوم
- ✅ OTP ينتهي بعد 5 دقائق (قابل للتخصيص)
- ✅ جميع endpoints محمية بـ Guards مناسبة
- ✅ نظام قدرات متدرج مع موافقة إدارية
- ✅ مزامنة تلقائية للمفضلات عند التسجيل
- ✅ إنشاء سوبر أدمن تلقائياً (Development only)
- ✅ تسجيل دخول مطور (Development only)

**ملاحظة:** النظام مكتمل 100% ويعمل كما هو موثق. التعديلات الأخيرة: تحديث أوقات انتهاء الرموز لتعكس الواقع الصحيح (8 ساعات بدلاً من 15 دقيقة للـ Access Token).
