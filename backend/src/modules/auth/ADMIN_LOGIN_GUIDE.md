# دليل تسجيل دخول الأدمن

## نظام تسجيل الدخول المزدوج

يدعم النظام الآن طريقتين لتسجيل دخول المسؤولين:

### 1️⃣ تسجيل الدخول بكلمة المرور (موصى به - أسرع وأوفر) ⭐

**Endpoint:**
```
POST /auth/admin-login
```

**Request Body:**
```json
{
  "phone": "0501234567",
  "password": "YourSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "me": {
      "id": "user_id",
      "phone": "0501234567",
      "firstName": "أحمد",
      "lastName": "محمد",
      "roles": ["admin", "super_admin"],
      "permissions": ["users.create", "users.read", ...],
      "isAdmin": true
    }
  }
}
```

**المميزات:**
- ✅ سريع - لا يتطلب انتظار رسالة SMS
- ✅ موفر - لا يستهلك رصيد SMS
- ✅ آمن - يدعم كلمات مرور قوية
- ✅ مناسب للاستخدام اليومي

**متطلبات الأمان:**
- رقم الهاتف صحيح (05xxxxxxxx أو 7xxxxxxxx)
- كلمة المرور 6 أحرف على الأقل
- الحساب يجب أن يكون نشط (status: active)
- الحساب يجب أن يحتوي على دور admin أو super_admin

---

### 2️⃣ تسجيل الدخول بـ OTP (الطريقة التقليدية)

**Step 1: Send OTP**
```
POST /auth/send-otp
{
  "phone": "0501234567",
  "context": "register"
}
```

**Step 2: Verify OTP**
```
POST /auth/verify-otp
{
  "phone": "0501234567",
  "code": "1234"
}
```

**المميزات:**
- ✅ أكثر أماناً للحسابات الحساسة
- ✅ لا يتطلب تذكر كلمة المرور
- ✅ مناسب للاستخدام العرضي

**العيوب:**
- ❌ يتطلب انتظار SMS
- ❌ يستهلك رصيد SMS
- ❌ قد يتأخر وصول الرمز

---

## متى تستخدم كل طريقة؟

### استخدم كلمة المرور:
- ✅ الاستخدام اليومي للوحة التحكم
- ✅ عند الحاجة للدخول السريع
- ✅ لتوفير تكاليف SMS

### استخدم OTP:
- ✅ أول مرة تسجيل دخول
- ✅ نسيان كلمة المرور
- ✅ الحسابات الحساسة جداً
- ✅ عند الشك في اختراق الحساب

---

## إعداد كلمة المرور

### للحسابات الجديدة:
عند إنشاء أدمن جديد عبر:
```
POST /admin/users/create-admin
```

يتم تعيين كلمة مرور افتراضية تلقائياً.

### تغيير كلمة المرور:
```
POST /auth/set-password
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

---

## أمثلة الاستخدام

### مثال 1: تسجيل دخول سريع (كلمة المرور)
```bash
curl -X POST http://localhost:3000/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0501234567",
    "password": "Admin123!@#"
  }'
```

### مثال 2: تسجيل دخول آمن (OTP)
```bash
# Step 1: إرسال OTP
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0501234567",
    "context": "register"
  }'

# Step 2: التحقق من OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0501234567",
    "code": "1234"
  }'
```

---

## معالجة الأخطاء

### خطأ: "لم يتم تعيين كلمة مرور لهذا الحساب"
**الحل:** استخدم OTP أو قم بتعيين كلمة مرور

### خطأ: "رقم الهاتف أو كلمة المرور غير صحيحة"
**الحل:** تحقق من البيانات أو استخدم OTP

### خطأ: "هذا الحساب غير مصرح له بالدخول للوحة التحكم"
**الحل:** الحساب ليس أدمن، تواصل مع السوبر أدمن

### خطأ: "هذا الحساب غير نشط"
**الحل:** تواصل مع السوبر أدمن لتفعيل الحساب

---

## الأمان

### كلمة المرور:
- ✅ يتم تخزينها مشفرة باستخدام bcrypt
- ✅ لا يتم إرجاع كلمة المرور في أي استجابة
- ✅ محاولات تسجيل الدخول الفاشلة تُسجل

### OTP:
- ✅ صالح لمدة 10 دقائق فقط
- ✅ يتم حذفه بعد الاستخدام
- ✅ محاولات OTP الخاطئة محدودة

---

## الإعدادات

### متغيرات البيئة:
```env
# OTP Settings
OTP_EXPIRY_MINUTES=10
MAX_OTP_ATTEMPTS=5

# Password Settings
MIN_PASSWORD_LENGTH=6
BCRYPT_ROUNDS=10

# JWT Settings
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

---

## التوصيات الأمنية

1. ✅ استخدم كلمات مرور قوية (8+ أحرف، أرقام، رموز)
2. ✅ غيّر كلمة المرور الافتراضية فوراً
3. ✅ لا تشارك بيانات تسجيل الدخول
4. ✅ فعّل المصادقة الثنائية للحسابات الحساسة
5. ✅ راجع سجلات الدخول بانتظام

