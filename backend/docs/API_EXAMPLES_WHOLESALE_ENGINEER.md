# أمثلة API للتاجر والمهندس - للاختبار

> **ملاحظة مهمة:** جميع الأمثلة تستخدم نظام الردود الموحد في المشروع

## 🔐 نظام الحمايات (Guards)

المشروع يستخدم نظام حمايات متعدد الطبقات:

| Guard | الغرض | المتطلبات |
|-------|-------|-----------|
| `JwtAuthGuard` | التحقق من التوكن | `Authorization: Bearer <token>` |
| `AdminGuard` | التحقق من صلاحيات الإدارة | `JwtAuthGuard` + `isAdmin: true` |
| `EngineerGuard` | التحقق من صلاحيات المهندس | `JwtAuthGuard` + `engineer_capable: true` |

## 📊 هيكل الردود

### رد ناجح:
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... },  // اختياري
  "requestId": "req-abc123"
}
```

### رد خطأ:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-abc123"
}
```

---

## 📋 فهرس السيناريوهات

1. [تسجيل تاجر جديد](#1-تسجيل-تاجر-جديد)
2. [موافقة الإدارة على التاجر](#2-موافقة-الإدارة-على-التاجر)
3. [التاجر يتسوق بخصم تلقائي](#3-التاجر-يتسوق-بخصم-تلقائي)
4. [تسجيل مهندس جديد](#4-تسجيل-مهندس-جديد)
5. [موافقة الإدارة على المهندس](#5-موافقة-الإدارة-على-المهندس)
6. [المهندس يبحث عن طلبات](#6-المهندس-يبحث-عن-طلبات)
7. [المهندس يقدم عرض](#7-المهندس-يقدم-عرض)
8. [المهندس يتسوق بشكل عادي](#8-المهندس-يتسوق-بشكل-عادي)

---

## 1. تسجيل تاجر جديد

### الخطوة 1: إرسال OTP

```http
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "0555111111",
  "context": "register"
}
```

**الحمايات:** لا توجد (Public endpoint)

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "devCode": "123456"
  },
  "requestId": "req-abc123"
}
```

---

### الخطوة 2: التحقق من OTP والتسجيل كتاجر

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "0555111111",
  "code": "123456",
  "firstName": "علي",
  "lastName": "التاجر",
  "gender": "male",
  "capabilityRequest": "wholesale"
}
```

**الحمايات:** لا توجد (Public endpoint)

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIs...",
      "refresh": "eyJhbGciOiJIUzI1NiIs..."
    },
    "me": {
      "id": "67890abcdef1234567890123",
      "phone": "0555111111"
    }
  },
  "requestId": "req-abc124"
}
```

**⚠️ احفظ `access` token للاستخدام في الطلبات التالية**

---

### الخطوة 3: التحقق من الحالة

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67890abcdef1234567890123",
      "phone": "0555111111",
      "firstName": "علي",
      "lastName": "التاجر",
      "gender": "male",
      "jobTitle": null,
      "isAdmin": false
    },
    "capabilities": {
      "userId": "67890abcdef1234567890123",
      "customer_capable": true,
      "engineer_capable": false,
      "engineer_status": "none",
      "wholesale_capable": false,
      "wholesale_status": "pending",
      "wholesale_discount_percent": 0,
      "admin_capable": false,
      "admin_status": "none"
    }
  },
  "requestId": "req-abc125"
}
```

**ملاحظة:** `wholesale_status: "pending"` ⬅️ في انتظار موافقة الإدارة

---

## 2. موافقة الإدارة على التاجر

```http
POST /auth/admin/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "67890abcdef1234567890123",
  "capability": "wholesale",
  "approve": true,
  "wholesaleDiscountPercent": 15
}
```

**الحمايات:** `JwtAuthGuard` + `AdminGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req-abc126"
}
```

---

### التحقق من التفعيل

```http
GET /auth/me
Authorization: Bearer <wholesale_user_token>
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67890abcdef1234567890123",
      "phone": "0555111111",
      "firstName": "علي",
      "lastName": "التاجر"
    },
    "capabilities": {
      "customer_capable": true,
      "wholesale_capable": true,
      "wholesale_status": "approved",
      "wholesale_discount_percent": 15
    }
  },
  "requestId": "req-abc127"
}
```

**✅ تم التفعيل:** `wholesale_capable: true` و `wholesale_discount_percent: 15`

---

## 3. التاجر يتسوق بخصم تلقائي

### إضافة منتج للسلة

```http
POST /cart/items
Authorization: Bearer <wholesale_user_token>
Content-Type: application/json

{
  "variantId": "variant123456",
  "qty": 2
}
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "cart_item_1",
        "variantId": "variant123456",
        "qty": 2
      }
    ]
  },
  "requestId": "req-abc128"
}
```

---

### معاينة السلة (مع الخصم التلقائي)

```http
GET /cart/preview?currency=YER
Authorization: Bearer <wholesale_user_token>
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "currency": "YER",
    "subtotal": 1700,
    "items": [
      {
        "itemId": "cart_item_1",
        "variantId": "variant123456",
        "qty": 2,
        "unit": {
          "base": 1000,
          "final": 850,
          "currency": "YER",
          "appliedRule": null
        },
        "lineTotal": 1700
      }
    ]
  },
  "meta": {
    "count": 1,
    "wholesaleDiscountPercent": 15,
    "wholesaleDiscountAmount": 300
  },
  "requestId": "req-abc129"
}
```

**الحساب:**
```
السعر الأصلي لقطعة واحدة: 1000 ريال
خصم التاجر (15%): 1000 - 150 = 850 ريال
الكمية: 2
────────────────────────────────────
المجموع الفرعي: 850 × 2 = 1700 ريال
مبلغ الخصم الإجمالي: 300 ريال
```

---

### إتمام الطلب

```http
POST /checkout/confirm
Authorization: Bearer <wholesale_user_token>
Content-Type: application/json

{
  "currency": "YER",
  "paymentMethod": "COD",
  "addressId": "address123"
}
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order789xyz",
    "status": "CONFIRMED"
  },
  "requestId": "req-abc130"
}
```

---

### عرض تفاصيل الطلب

```http
GET /checkout/orders/my/order789xyz
Authorization: Bearer <wholesale_user_token>
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order789xyz",
    "userId": "67890abcdef1234567890123",
    "status": "CONFIRMED",
    "currency": "YER",
    "total": 1700,
    "wholesaleDiscountPercent": 15,
    "wholesaleDiscountAmount": 300,
    "items": [
      {
        "variantId": "variant123456",
        "qty": 2,
        "unitPrice": 850,
        "currency": "YER"
      }
    ],
    "paymentMethod": "COD",
    "createdAt": "2025-10-13T10:30:00Z"
  },
  "requestId": "req-abc131"
}
```

---

## 4. تسجيل مهندس جديد

### الخطوة 1: إرسال OTP

```http
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "0555222222",
  "context": "register"
}
```

**الحمايات:** لا توجد (Public endpoint)

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "devCode": "654321"
  },
  "requestId": "req-abc132"
}
```

---

### الخطوة 2: التحقق من OTP والتسجيل كمهندس

⚠️ **مهم:** يجب إضافة `jobTitle` للمهندس

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "0555222222",
  "code": "654321",
  "firstName": "خالد",
  "lastName": "المهندس",
  "gender": "male",
  "capabilityRequest": "engineer",
  "jobTitle": "كهربائي معتمد"
}
```

**الحمايات:** لا توجد (Public endpoint)

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIs...",
      "refresh": "eyJhbGciOiJIUzI1NiIs..."
    },
    "me": {
      "id": "engineer123456789",
      "phone": "0555222222"
    }
  },
  "requestId": "req-abc133"
}
```

---

### ❌ محاولة التسجيل بدون jobTitle (سيفشل)

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "0555222222",
  "code": "654321",
  "firstName": "خالد",
  "lastName": "المهندس",
  "capabilityRequest": "engineer"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_JOB_TITLE_REQUIRED",
    "message": "المسمى الوظيفي مطلوب للمهندسين",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-abc134"
}
```

---

### الخطوة 3: التحقق من الحالة

```http
GET /auth/me
Authorization: Bearer <engineer_token>
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "engineer123456789",
      "phone": "0555222222",
      "firstName": "خالد",
      "lastName": "المهندس",
      "gender": "male",
      "jobTitle": "كهربائي معتمد",
      "isAdmin": false
    },
    "capabilities": {
      "customer_capable": true,
      "engineer_capable": false,
      "engineer_status": "pending",
      "wholesale_capable": false,
      "wholesale_status": "none"
    }
  },
  "requestId": "req-abc135"
}
```

**ملاحظة:** `engineer_status: "pending"` ⬅️ في انتظار موافقة الإدارة

---

## 5. موافقة الإدارة على المهندس

```http
POST /auth/admin/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "engineer123456789",
  "capability": "engineer",
  "approve": true
}
```

**الحمايات:** `JwtAuthGuard` + `AdminGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req-abc136"
}
```

**ملاحظة:** لا يوجد `wholesaleDiscountPercent` للمهندسين

---

### التحقق من التفعيل

```http
GET /auth/me
Authorization: Bearer <engineer_token>
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "engineer123456789",
      "phone": "0555222222",
      "firstName": "خالد",
      "lastName": "المهندس",
      "jobTitle": "كهربائي معتمد"
    },
    "capabilities": {
      "customer_capable": true,
      "engineer_capable": true,
      "engineer_status": "approved",
      "wholesale_capable": false
    }
  },
  "requestId": "req-abc137"
}
```

**✅ تم التفعيل:** `engineer_capable: true` و `engineer_status: "approved"`

---

## 6. المهندس يبحث عن طلبات

### عميل آخر ينشئ طلب خدمة

```http
POST /services/requests
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "title": "إصلاح كهرباء",
  "type": "ELECTRICAL",
  "description": "تحتاج إلى إصلاح الأسلاك الكهربائية",
  "addressId": "address456",
  "scheduledAt": "2025-10-15T10:00:00Z"
}
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "request999",
    "userId": "customer_id",
    "title": "إصلاح كهرباء",
    "status": "OPEN"
  },
  "requestId": "req-abc138"
}
```

---

### المهندس يبحث عن طلبات قريبة

```http
GET /services/requests/nearby?lat=24.7136&lng=46.6753&radiusKm=10
Authorization: Bearer <engineer_token>
```

**الحمايات:** `JwtAuthGuard` + `EngineerGuard`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "request999",
      "userId": "customer_id",
      "title": "إصلاح كهرباء",
      "type": "ELECTRICAL",
      "status": "OPEN",
      "location": {
        "type": "Point",
        "coordinates": [46.6753, 24.7136]
      }
    }
  ],
  "requestId": "req-abc139"
}
```

**ملاحظة:** طلبات المهندس نفسه **لن تظهر** في النتائج

---

### ✅ سيناريو: المهندس ينشئ طلبه الخاص ثم يبحث

```http
# المهندس ينشئ طلب
POST /services/requests
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "title": "طلب المهندس الخاص",
  "type": "PLUMBING",
  "description": "يحتاج سباك",
  "addressId": "address789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "engineer_own_request",
    "userId": "engineer123456789",
    "title": "طلب المهندس الخاص",
    "status": "OPEN"
  },
  "requestId": "req-abc140"
}
```

```http
# المهندس يبحث عن طلبات
GET /services/requests/nearby?lat=24.7136&lng=46.6753&radiusKm=10
Authorization: Bearer <engineer_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "request999",
      "title": "إصلاح كهرباء"
    }
  ],
  "requestId": "req-abc141"
}
```

**ملاحظة:** "طلب المهندس الخاص" **لم يظهر** ❌

---

## 7. المهندس يقدم عرض

### ✅ تقديم عرض على طلب عميل آخر

```http
POST /services/offers
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "requestId": "request999",
  "amount": 500,
  "note": "يمكنني إصلاح المشكلة خلال يوم واحد"
}
```

**الحمايات:** `JwtAuthGuard` + `EngineerGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "offer123",
    "requestId": "request999",
    "engineerId": "engineer123456789",
    "amount": 500,
    "note": "يمكنني إصلاح المشكلة خلال يوم واحد",
    "status": "OFFERED"
  },
  "requestId": "req-abc142"
}
```

---

### ❌ محاولة تقديم عرض على طلبه الخاص (سيفشل)

```http
POST /services/offers
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "requestId": "engineer_own_request",
  "amount": 500,
  "note": "محاولة تقديم عرض على طلبي"
}
```

**Response (Error):**
```json
{
  "success": true,
  "data": {
    "error": "SELF_NOT_ALLOWED"
  },
  "requestId": "req-abc143"
}
```

**ملاحظة:** هذا خطأ على مستوى Business Logic وليس Exception

---

## 8. المهندس يتسوق بشكل عادي

### إضافة منتج للسلة

```http
POST /cart/items
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "variantId": "variant123456",
  "qty": 1
}
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "cart_item_eng_1",
        "variantId": "variant123456",
        "qty": 1
      }
    ]
  },
  "requestId": "req-abc144"
}
```

---

### معاينة السلة (بدون خصم)

```http
GET /cart/preview?currency=YER
Authorization: Bearer <engineer_token>
```

**الحمايات:** `JwtAuthGuard`

**Response:**
```json
{
  "success": true,
  "data": {
    "currency": "YER",
    "subtotal": 1000,
    "items": [
      {
        "variantId": "variant123456",
        "qty": 1,
        "unit": {
          "base": 1000,
          "final": 1000,
          "currency": "YER"
        },
        "lineTotal": 1000
      }
    ]
  },
  "meta": {
    "count": 1,
    "wholesaleDiscountPercent": 0,
    "wholesaleDiscountAmount": 0
  },
  "requestId": "req-abc145"
}
```

**المقارنة:**
```
┌────────────────────┬─────────────┬──────────────┐
│      المستخدم      │  السعر     │    الخصم    │
├────────────────────┼─────────────┼──────────────┤
│ عميل عادي         │ 1000 ريال  │ 0%           │
│ تاجر (15% خصم)    │  850 ريال  │ 15% (150 ر)  │
│ مهندس             │ 1000 ريال  │ 0%           │
└────────────────────┴─────────────┴──────────────┘
```

---

## 📊 مقارنة شاملة

### سيناريو: نفس المنتج، ثلاثة مستخدمين مختلفين

**المنتج:** كابل كهربائي - السعر: 1000 ريال

#### 1. عميل عادي

```json
{
  "success": true,
  "data": {
    "subtotal": 1000,
    "items": [{
      "unit": { "base": 1000, "final": 1000 }
    }]
  },
  "meta": {
    "wholesaleDiscountPercent": 0,
    "wholesaleDiscountAmount": 0
  },
  "requestId": "req-xyz"
}
```

#### 2. تاجر (خصم 15%)

```json
{
  "success": true,
  "data": {
    "subtotal": 850,
    "items": [{
      "unit": { "base": 1000, "final": 850 }
    }]
  },
  "meta": {
    "wholesaleDiscountPercent": 15,
    "wholesaleDiscountAmount": 150
  },
  "requestId": "req-xyz"
}
```

#### 3. مهندس

```json
{
  "success": true,
  "data": {
    "subtotal": 1000,
    "items": [{
      "unit": { "base": 1000, "final": 1000 }
    }]
  },
  "meta": {
    "wholesaleDiscountPercent": 0,
    "wholesaleDiscountAmount": 0
  },
  "requestId": "req-xyz"
}
```

---

## 🔍 اختبارات مهمة

### ✅ اختبار 1: التاجر بخصم 20%

```http
POST /auth/admin/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "wholesale_user",
  "capability": "wholesale",
  "approve": true,
  "wholesaleDiscountPercent": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req-test1"
}
```

```http
GET /cart/preview?currency=YER
Authorization: Bearer <wholesale_user_token>
```

**النتيجة المتوقعة:**
- سعر 1000 ريال → 800 ريال (خصم 20%)

---

### ✅ اختبار 2: محاولة الوصول بدون تسجيل دخول

```http
GET /auth/me
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "غير مصرح",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-test2"
}
```

---

### ✅ اختبار 3: محاولة الوصول لصفحة الإدارة بدون صلاحيات

```http
POST /auth/admin/approve
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "userId": "some_user",
  "capability": "wholesale",
  "approve": true
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "ليس لديك صلاحية الوصول",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-test3"
}
```

---

### ✅ اختبار 4: المهندس غير مفعل يحاول الوصول لطلبات

```http
GET /services/requests/nearby?lat=24.7&lng=46.6&radiusKm=10
Authorization: Bearer <pending_engineer_token>
```

**Response (Error - 403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "ليس لديك صلاحية الوصول",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-test4"
}
```

**السبب:** `EngineerGuard` يتحقق من `engineer_capable: true` و `engineer_status: "approved"`

---

### ✅ اختبار 5: تحديث المسمى الوظيفي للمهندس

```http
PATCH /auth/me
Authorization: Bearer <engineer_token>
Content-Type: application/json

{
  "jobTitle": "كهربائي وسباك معتمد"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req-test5"
}
```

---

## 🔐 جدول الحمايات والصلاحيات

| Endpoint | Guards | متطلبات إضافية |
|---------|--------|----------------|
| `POST /auth/send-otp` | - | - |
| `POST /auth/verify-otp` | - | - |
| `GET /auth/me` | `JwtAuthGuard` | - |
| `PATCH /auth/me` | `JwtAuthGuard` | - |
| `POST /auth/admin/approve` | `JwtAuthGuard` + `AdminGuard` | `isAdmin: true` |
| `GET /auth/admin/pending` | `JwtAuthGuard` + `AdminGuard` | `isAdmin: true` |
| `POST /cart/items` | `JwtAuthGuard` | - |
| `GET /cart/preview` | `JwtAuthGuard` | - |
| `POST /checkout/confirm` | `JwtAuthGuard` | - |
| `POST /services/requests` | `JwtAuthGuard` | - |
| `GET /services/requests/nearby` | `JwtAuthGuard` + `EngineerGuard` | `engineer_capable: true` |
| `POST /services/offers` | `JwtAuthGuard` + `EngineerGuard` | `engineer_capable: true` |

---

## 🎯 متغيرات البيئة (Environment Variables)

```env
# Base URL
base_url=http://localhost:3000

# Tokens
admin_token=eyJhbGciOiJIUzI1NiIs...
wholesale_user_token=eyJhbGciOiJIUzI1NiIs...
engineer_token=eyJhbGciOiJIUzI1NiIs...
customer_token=eyJhbGciOiJIUzI1NiIs...

# Test Data
test_variant_id=variant123456
test_address_id=address123
```

---

## 📝 ملاحظات مهمة

### 1. **نظام الردود الموحد:**
- ✅ جميع الردود الناجحة: `{ success: true, data: {...}, requestId: "..." }`
- ✅ جميع الأخطاء: `{ success: false, error: {...}, requestId: "..." }`

### 2. **الحمايات:**
- ✅ `JwtAuthGuard`: يتحقق من وجود وصحة التوكن
- ✅ `AdminGuard`: يتحقق من `isAdmin: true`
- ✅ `EngineerGuard`: يتحقق من `engineer_capable: true` و `engineer_status: "approved"`

### 3. **التاجر:**
- ✅ الخصم يطبق تلقائياً
- ✅ لا يحتاج إلى كود خصم
- ✅ الخصم يطبق بعد العروض الترويجية

### 4. **المهندس:**
- ✅ يجب إضافة `jobTitle` عند التسجيل
- ✅ لا يرى طلباته في نتائج البحث
- ✅ لا يمكنه تقديم عرض على طلبه
- ✅ يشتري بالسعر العادي (بدون خصم)
- ✅ يحتاج موافقة الإدارة للوصول لـ Engineer endpoints

### 5. **الأمان:**
- ✅ جميع الحسابات تُعيد الحساب من السيرفر
- ✅ لا يمكن التلاعب بالأسعار من العميل
- ✅ الخصم محفوظ في الطلب للتقارير
- ✅ Guards متعددة الطبقات

---

## ✅ Checklist للاختبار

- [ ] تسجيل تاجر جديد
- [ ] موافقة الإدارة مع نسبة خصم
- [ ] التاجر يرى الخصم في السلة
- [ ] الطلب يحفظ معلومات الخصم
- [ ] تسجيل مهندس بدون jobTitle (يفشل)
- [ ] تسجيل مهندس مع jobTitle (ينجح)
- [ ] موافقة الإدارة على المهندس
- [ ] المهندس لا يرى طلباته
- [ ] المهندس لا يمكنه تقديم عرض على طلبه
- [ ] المهندس يشتري بسعر عادي
- [ ] محاولة الوصول بدون Authorization (يفشل)
- [ ] محاولة الوصول لصفحة Admin بدون صلاحيات (يفشل)
- [ ] مهندس غير مفعل يحاول الوصول للطلبات (يفشل)

---

**تم إعداد الأمثلة وفقاً لنظام الردود الموحد والحمايات في Tagadodo** 🚀
