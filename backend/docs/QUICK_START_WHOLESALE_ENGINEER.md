# البدء السريع - نظام التاجر والمهندس

## 📖 قراءة الملفات بالترتيب

1. **هذا الملف** - البدء السريع
2. [`README_WHOLESALE_ENGINEER.md`](./README_WHOLESALE_ENGINEER.md) - نظرة عامة
3. [`WHOLESALE_AND_ENGINEER_SYSTEM.md`](./WHOLESALE_AND_ENGINEER_SYSTEM.md) - الدليل الشامل
4. [`API_EXAMPLES_WHOLESALE_ENGINEER.md`](./API_EXAMPLES_WHOLESALE_ENGINEER.md) - أمثلة عملية كاملة ✨
5. [`CHANGES_SUMMARY.md`](./CHANGES_SUMMARY.md) - ملخص التغييرات التقنية

---

## 🎯 الفكرة الأساسية

### التاجر (Wholesale):
```
تسجيل → موافقة الإدارة مع خصم 15% → كل طلباته تحصل على خصم 15% تلقائياً
```

### المهندس (Engineer):
```
تسجيل + مسمى وظيفي → موافقة الإدارة → يستلم طلبات + يقدم عروض
```

---

## 🔐 نظام الحمايات (Guards)

المشروع يستخدم 3 أنواع من الحمايات:

### 1. JwtAuthGuard
```typescript
// يتحقق من وجود وصحة التوكن
Authorization: Bearer <token>
```

**يستخدم في:**
- جميع الـ endpoints المحمية
- `/auth/me`, `/cart/*`, `/checkout/*`

---

### 2. AdminGuard
```typescript
// يتحقق من: JwtAuthGuard + isAdmin = true
Authorization: Bearer <admin_token>
```

**يستخدم في:**
- `/auth/admin/approve`
- `/auth/admin/pending`

---

### 3. EngineerGuard
```typescript
// يتحقق من: JwtAuthGuard + engineer_capable = true
Authorization: Bearer <engineer_token>
```

**يستخدم في:**
- `/services/requests/nearby`
- `/services/offers`

---

## 📊 نظام الردود الموحد

### ✅ رد ناجح:
```json
{
  "success": true,
  "data": {
    // البيانات المطلوبة
  },
  "meta": {
    // معلومات إضافية (اختياري)
  },
  "requestId": "req-abc123"
}
```

### ❌ رد خطأ:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ بالعربية",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-abc123"
}
```

---

## 🚀 سيناريو كامل: التاجر

### 1. التسجيل

```http
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "0555111111"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "devCode": "123456"
  },
  "requestId": "req-1"
}
```

---

### 2. التحقق من OTP

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "0555111111",
  "code": "123456",
  "firstName": "علي",
  "capabilityRequest": "wholesale"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIs..."
    },
    "me": {
      "id": "user123",
      "phone": "0555111111"
    }
  },
  "requestId": "req-2"
}
```

**⚠️ احفظ `access` token**

---

### 3. التحقق من الحالة

```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "capabilities": {
      "wholesale_capable": false,
      "wholesale_status": "pending",  ← في انتظار الموافقة
      "wholesale_discount_percent": 0
    }
  },
  "requestId": "req-3"
}
```

---

### 4. الإدارة توافق

```http
POST /auth/admin/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user123",
  "capability": "wholesale",
  "approve": true,
  "wholesaleDiscountPercent": 15  ← خصم 15%
}
```

**Guards:** `JwtAuthGuard` + `AdminGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req-4"
}
```

---

### 5. التاجر يتسوق (خصم تلقائي!)

```http
GET /cart/preview?currency=YER
Authorization: Bearer <wholesale_token>
```

**Guards:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "currency": "YER",
    "subtotal": 850,  ← كان 1000 قبل الخصم
    "items": [...]
  },
  "meta": {
    "count": 1,
    "wholesaleDiscountPercent": 15,  ← خصم 15%
    "wholesaleDiscountAmount": 150   ← مبلغ الخصم
  },
  "requestId": "req-5"
}
```

**✨ الخصم يطبق تلقائياً!**

---

## 🚀 سيناريو كامل: المهندس

### 1. التسجيل (مع jobTitle)

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "0555222222",
  "code": "654321",
  "firstName": "خالد",
  "capabilityRequest": "engineer",
  "jobTitle": "كهربائي معتمد"  ← مطلوب!
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": { "access": "..." },
    "me": { "id": "eng123", "phone": "0555222222" }
  },
  "requestId": "req-6"
}
```

---

### 2. الإدارة توافق

```http
POST /auth/admin/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "eng123",
  "capability": "engineer",
  "approve": true
}
```

**Guards:** `JwtAuthGuard` + `AdminGuard`

---

### 3. المهندس يبحث عن طلبات

```http
GET /services/requests/nearby?lat=24.7&lng=46.6&radiusKm=10
Authorization: Bearer <engineer_token>
```

**Guards:** `JwtAuthGuard` + `EngineerGuard`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "req999",
      "userId": "customer_id",  ← عميل آخر
      "title": "إصلاح كهرباء",
      "status": "OPEN"
    }
    // ❌ طلبات المهندس نفسه لا تظهر
  ],
  "requestId": "req-7"
}
```

---

### 4. المهندس يقدم عرض

```http
POST /services/offers
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "requestId": "req999",
  "amount": 500,
  "note": "يمكنني الإصلاح خلال يوم"
}
```

**Guards:** `JwtAuthGuard` + `EngineerGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "offer123",
    "requestId": "req999",
    "engineerId": "eng123",
    "amount": 500,
    "status": "OFFERED"
  },
  "requestId": "req-8"
}
```

---

## ❌ أمثلة على الأخطاء

### 1. مهندس بدون jobTitle

```http
POST /auth/verify-otp
{
  "capabilityRequest": "engineer"
  // jobTitle مفقود
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_JOB_TITLE_REQUIRED",
    "message": "المسمى الوظيفي مطلوب للمهندسين",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err1"
}
```

---

### 2. محاولة الوصول بدون Authorization

```http
GET /auth/me
// لا يوجد Authorization header
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "غير مصرح",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err2"
}
```

---

### 3. مستخدم عادي يحاول الوصول لصفحة الإدارة

```http
POST /auth/admin/approve
Authorization: Bearer <customer_token>
```

**Guards:** `AdminGuard` يفشل

**Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "ليس لديك صلاحية الوصول",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err3"
}
```

---

### 4. مهندس غير مفعل يحاول الوصول للطلبات

```http
GET /services/requests/nearby?lat=24.7&lng=46.6&radiusKm=10
Authorization: Bearer <pending_engineer_token>
```

**Guards:** `EngineerGuard` يفشل (engineer_status = "pending")

**Response (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "ليس لديك صلاحية الوصول",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-err4"
}
```

---

## 🔍 جدول الحمايات السريع

| Endpoint | Public | JWT | Admin | Engineer |
|---------|--------|-----|-------|----------|
| `POST /auth/send-otp` | ✅ | - | - | - |
| `POST /auth/verify-otp` | ✅ | - | - | - |
| `GET /auth/me` | - | ✅ | - | - |
| `POST /auth/admin/approve` | - | ✅ | ✅ | - |
| `POST /cart/items` | - | ✅ | - | - |
| `GET /cart/preview` | - | ✅ | - | - |
| `GET /services/requests/nearby` | - | ✅ | - | ✅ |
| `POST /services/offers` | - | ✅ | - | ✅ |

**الشرح:**
- ✅ في Public = متاح للجميع
- ✅ في JWT = يحتاج `Authorization: Bearer <token>`
- ✅ في Admin = يحتاج JWT + `isAdmin: true`
- ✅ في Engineer = يحتاج JWT + `engineer_capable: true`

---

## 📋 Checklist للاختبار

### التاجر:
- [ ] تسجيل تاجر بدون `capabilityRequest` (عميل عادي)
- [ ] تسجيل تاجر مع `capabilityRequest: "wholesale"`
- [ ] التحقق من حالة `pending`
- [ ] موافقة الإدارة مع نسبة خصم 15%
- [ ] التحقق من حالة `approved`
- [ ] إضافة منتج للسلة
- [ ] معاينة السلة (يجب أن يظهر الخصم)
- [ ] إنشاء طلب
- [ ] التحقق من حفظ معلومات الخصم في الطلب

### المهندس:
- [ ] محاولة تسجيل بدون `jobTitle` (يجب أن يفشل)
- [ ] تسجيل مع `jobTitle: "كهربائي"`
- [ ] التحقق من حالة `pending`
- [ ] موافقة الإدارة
- [ ] التحقق من حالة `approved`
- [ ] المهندس ينشئ طلب خدمة
- [ ] المهندس يبحث عن طلبات (لا يرى طلبه)
- [ ] المهندس يقدم عرض على طلب عميل آخر (ينجح)
- [ ] المهندس يحاول تقديم عرض على طلبه (يفشل)
- [ ] المهندس يتسوق (بدون خصم)

### الحمايات:
- [ ] محاولة الوصول لـ `/auth/me` بدون Authorization (401)
- [ ] محاولة الوصول لـ `/auth/admin/*` بتوكن عادي (403)
- [ ] محاولة الوصول لـ `/services/requests/nearby` بتوكن غير مهندس (403)
- [ ] محاولة الوصول بتوكن منتهي الصلاحية (401)

---

## 💡 نصائح مهمة

### 1. احفظ التوكنات
```bash
# بعد التسجيل
access_token="eyJhbGciOiJIUzI1NiIs..."

# استخدمها في الطلبات
curl -H "Authorization: Bearer $access_token" ...
```

### 2. تحقق من نظام الردود
```bash
# كل رد يجب أن يحتوي على:
{
  "success": true/false,
  "data": { ... } أو "error": { ... },
  "requestId": "..."
}
```

### 3. تحقق من الحمايات
```bash
# إذا رأيت 401: مشكلة في التوكن
# إذا رأيت 403: مشكلة في الصلاحيات
# إذا رأيت 400: مشكلة في البيانات
```

---

## 📞 المساعدة

### للأمثلة الكاملة:
👉 [`API_EXAMPLES_WHOLESALE_ENGINEER.md`](./API_EXAMPLES_WHOLESALE_ENGINEER.md)

### للدليل الشامل:
👉 [`WHOLESALE_AND_ENGINEER_SYSTEM.md`](./WHOLESALE_AND_ENGINEER_SYSTEM.md)

### للتغييرات التقنية:
👉 [`CHANGES_SUMMARY.md`](./CHANGES_SUMMARY.md)

---

## ✨ الخلاصة

✅ نظام ردود موحد (`success`, `data`, `error`, `requestId`)  
✅ حمايات متعددة الطبقات (`JwtAuthGuard`, `AdminGuard`, `EngineerGuard`)  
✅ خصم تلقائي للتاجر (يطبق من السيرفر)  
✅ مسمى وظيفي مطلوب للمهندس  
✅ المهندس لا يرى طلباته الخاصة  
✅ جميع الأمثلة تتبع المعايير الصحيحة  

**جاهز للاستخدام! 🚀**

---

**تم بواسطة:** Claude Sonnet 4.5  
**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Tagadodo

