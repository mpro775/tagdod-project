# نظام التاجر والمهندس - دليل شامل

> ⚠️ **ملاحظة مهمة:** الأمثلة في هذا الملف مبسطة للتوضيح فقط.  
> للأمثلة الكاملة مع **نظام الردود الموحد والحمايات**، راجع: [`API_EXAMPLES_WHOLESALE_ENGINEER.md`](./API_EXAMPLES_WHOLESALE_ENGINEER.md)

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [نظام التاجر (Wholesale)](#نظام-التاجر-wholesale)
3. [نظام المهندس (Engineer)](#نظام-المهندس-engineer)
4. [سيناريو التسجيل الكامل](#سيناريو-التسجيل-الكامل)
5. [أمثلة API](#أمثلة-api)
6. [التعديلات التقنية](#التعديلات-التقنية)

---

## نظرة عامة

تم تطوير نظام متكامل يدعم ثلاثة أنواع من المستخدمين:

| النوع | القدرات | الميزات الخاصة |
|------|---------|----------------|
| **عميل عادي (Customer)** | الشراء العادي | ✅ مفعّل تلقائياً عند التسجيل |
| **تاجر (Wholesale)** | الشراء بخصم مخصص | ✅ خصم نسبة مئوية يطبق تلقائياً على كل الطلبات<br>✅ يحتاج موافقة الإدارة<br>✅ يمكنه طلب مهندسين |
| **مهندس (Engineer)** | الشراء العادي + تقديم خدمات | ✅ يستلم طلبات خدمات في مجاله<br>✅ يقدم عروض على الطلبات<br>✅ لا يستلم طلباته الخاصة<br>✅ يضيف مسمى وظيفي عند التسجيل<br>✅ يحتاج موافقة الإدارة |

---

## نظام التاجر (Wholesale)

### 🎯 الهدف
التاجر **ليس** له القدرة على الشراء بالجملة، بل يحصل على **خصم نسبة مئوية** يتم تحديده من لوحة التحكم ويطبق تلقائياً على كل طلباته.

### 📊 البيانات المخزنة

#### في `Capabilities Schema`:
```typescript
{
  userId: ObjectId,
  wholesale_capable: boolean,           // true = مُفعّل كتاجر
  wholesale_status: string,             // 'pending' | 'approved' | 'rejected'
  wholesale_discount_percent: number,   // 0-100 نسبة الخصم
}
```

#### في `Order Schema`:
```typescript
{
  wholesaleDiscountPercent: number,   // نسبة الخصم المطبقة
  wholesaleDiscountAmount: number,    // مبلغ الخصم بالعملة
}
```

### 🔄 آلية عمل الخصم

1. **عند التسجيل**: يختار المستخدم `capabilityRequest: 'wholesale'`
2. **عند الموافقة**: الإدارة تضيف نسبة الخصم (مثلاً: 15%)
3. **عند الشراء**: 
   - يتم جلب نسبة الخصم من `Capabilities`
   - تطبيق العروض الترويجية أولاً (إن وجدت)
   - ثم تطبيق خصم التاجر على السعر النهائي
   - حفظ معلومات الخصم في الطلب

### 💡 مثال حسابي

```
السعر الأصلي: 1000 ريال
عرض ترويجي (-10%): 900 ريال
خصم التاجر (15%): 900 - 135 = 765 ريال
─────────────────────────────────
السعر النهائي: 765 ريال
الخصم الإجمالي: 235 ريال (23.5%)
```

### ✅ القدرات
- ✅ الشراء بخصم مخصص
- ✅ طلب خدمات مهندسين
- ❌ **لا** يوجد شراء بالجملة

---

## نظام المهندس (Engineer)

### 🎯 الهدف
المهندس يمكنه تقديم خدماته للعملاء عبر تلقي طلبات الخدمة وتقديم عروض عليها.

### 📊 البيانات المخزنة

#### في `User Schema`:
```typescript
{
  jobTitle: string,  // "كهربائي" | "سباك" | "نجار" | الخ...
}
```

#### في `Capabilities Schema`:
```typescript
{
  userId: ObjectId,
  engineer_capable: boolean,     // true = مُفعّل كمهندس
  engineer_status: string,       // 'pending' | 'approved' | 'rejected'
}
```

### 🔄 آلية عمل نظام المهندس

1. **عند التسجيل**: 
   - يختار `capabilityRequest: 'engineer'`
   - **يجب** إضافة `jobTitle` (المسمى الوظيفي)
   
2. **عند الموافقة**: 
   - الإدارة توافق على الطلب
   - المهندس يصبح قادراً على استلام الطلبات

3. **استلام الطلبات**:
   - يبحث عن طلبات قريبة منه جغرافياً
   - **لا يرى** طلباته الخاصة
   - يقدم عروضه على الطلبات

4. **تنفيذ الخدمة**:
   - العميل يقبل عرضه
   - المهندس يبدأ العمل
   - المهندس يكمل الخدمة
   - العميل يقيّم الخدمة

### ✅ القدرات
- ✅ الشراء العادي (بدون خصم)
- ✅ استلام طلبات خدمات
- ✅ تقديم عروض على الطلبات
- ✅ طلب مهندسين آخرين (غير نفسه)
- ❌ **لا يرى** طلباته الخاصة
- ❌ **لا يمكن** تقديم عرض على طلبه

---

## سيناريو التسجيل الكامل

### 1️⃣ تسجيل عميل عادي

```http
POST /auth/send-otp
{
  "phone": "0512345678",
  "context": "register"
}

POST /auth/verify-otp
{
  "phone": "0512345678",
  "code": "123456",
  "firstName": "أحمد",
  "lastName": "محمد"
}

✅ النتيجة:
- حساب عميل عادي
- customer_capable: true
```

---

### 2️⃣ تسجيل تاجر (Wholesale)

```http
POST /auth/send-otp
{
  "phone": "0512345678",
  "context": "register"
}

POST /auth/verify-otp
{
  "phone": "0512345678",
  "code": "123456",
  "firstName": "علي",
  "lastName": "التاجر",
  "capabilityRequest": "wholesale"
}

✅ النتيجة:
- حساب عميل عادي
- طلب تاجر بحالة: pending
- ينتظر موافقة الإدارة

─────────────────────────────────

الإدارة توافق وتضيف خصم 15%:

POST /auth/admin/approve
{
  "userId": "507f1f77bcf86cd799439011",
  "capability": "wholesale",
  "approve": true,
  "wholesaleDiscountPercent": 15
}

✅ النتيجة:
- wholesale_capable: true
- wholesale_discount_percent: 15
- جميع طلباته ستحصل على خصم 15% تلقائياً
```

---

### 3️⃣ تسجيل مهندس (Engineer)

```http
POST /auth/send-otp
{
  "phone": "0512345678",
  "context": "register"
}

POST /auth/verify-otp
{
  "phone": "0512345678",
  "code": "123456",
  "firstName": "خالد",
  "lastName": "المهندس",
  "capabilityRequest": "engineer",
  "jobTitle": "كهربائي معتمد"  ⚠️ مطلوب للمهندس
}

✅ النتيجة:
- حساب عميل عادي
- طلب مهندس بحالة: pending
- jobTitle: "كهربائي معتمد"
- ينتظر موافقة الإدارة

─────────────────────────────────

الإدارة توافق:

POST /auth/admin/approve
{
  "userId": "507f1f77bcf86cd799439011",
  "capability": "engineer",
  "approve": true
}

✅ النتيجة:
- engineer_capable: true
- يمكنه استلام طلبات الخدمات
```

---

## أمثلة API

### 🛒 سلة التاجر (مع الخصم التلقائي)

```http
GET /cart/preview?currency=YER
Authorization: Bearer <token>

Response:
{
  "currency": "YER",
  "subtotal": 850,  // بعد تطبيق الخصم
  "items": [
    {
      "variantId": "...",
      "qty": 2,
      "unit": {
        "base": 500,   // السعر الأساسي
        "final": 425,  // 500 - 15% = 425
        "currency": "YER"
      },
      "lineTotal": 850  // 425 × 2
    }
  ],
  "meta": {
    "count": 1,
    "wholesaleDiscountPercent": 15,
    "wholesaleDiscountAmount": 150  // مبلغ الخصم
  }
}
```

### 📦 إنشاء طلب (مع حفظ معلومات الخصم)

```http
POST /checkout/confirm
Authorization: Bearer <token>
{
  "currency": "YER",
  "paymentMethod": "COD"
}

✅ يتم حفظ في Order:
{
  "total": 850,
  "wholesaleDiscountPercent": 15,
  "wholesaleDiscountAmount": 150,
  "items": [...]
}
```

### 🔧 المهندس يبحث عن طلبات قريبة

```http
GET /services/requests/nearby?lat=24.7136&lng=46.6753&radiusKm=10
Authorization: Bearer <engineer-token>

✅ يرجع طلبات الخدمات القريبة
❌ لا يرجع طلبات المهندس نفسه
```

### 💼 المهندس يقدم عرض

```http
POST /services/offers
Authorization: Bearer <engineer-token>
{
  "requestId": "...",
  "amount": 500,
  "note": "يمكنني إتمام العمل خلال 3 أيام"
}

✅ إذا كان الطلب لعميل آخر: ✅
❌ إذا كان الطلب للمهندس نفسه: SELF_NOT_ALLOWED
```

### 👤 معلومات المستخدم

```http
GET /auth/me
Authorization: Bearer <token>

Response (تاجر):
{
  "user": {
    "id": "...",
    "phone": "0512345678",
    "firstName": "علي",
    "lastName": "التاجر",
    "jobTitle": null
  },
  "capabilities": {
    "customer_capable": true,
    "wholesale_capable": true,
    "wholesale_discount_percent": 15,
    "engineer_capable": false
  }
}

Response (مهندس):
{
  "user": {
    "id": "...",
    "phone": "0598765432",
    "firstName": "خالد",
    "lastName": "المهندس",
    "jobTitle": "كهربائي معتمد"
  },
  "capabilities": {
    "customer_capable": true,
    "wholesale_capable": false,
    "engineer_capable": true
  }
}
```

---

## التعديلات التقنية

### 📁 الملفات المعدلة

#### 1. **Capabilities Schema** (`capabilities.schema.ts`)
```typescript
+ wholesale_discount_percent: number  // 0-100
```

#### 2. **User Schema** (`user.schema.ts`)
```typescript
+ jobTitle?: string  // للمهندس
```

#### 3. **VerifyOtpDto** (`verify-otp.dto.ts`)
```typescript
+ jobTitle?: string  // مطلوب للمهندس
```

#### 4. **Auth Controller** (`auth.controller.ts`)
- ✅ التحقق من وجود `jobTitle` عند التسجيل كمهندس
- ✅ حفظ `jobTitle` في قاعدة البيانات
- ✅ تحديث `/admin/approve` لدعم `wholesaleDiscountPercent`
- ✅ إرجاع `jobTitle` في `/auth/me`
- ✅ السماح بتحديث `jobTitle` في `/auth/me PATCH`

#### 5. **Cart Service** (`cart.service.ts`)
- ✅ جلب قدرات المستخدم
- ✅ تطبيق خصم التاجر تلقائياً بعد العروض الترويجية
- ✅ حساب مبلغ الخصم
- ✅ إرجاع معلومات الخصم في `preview`

#### 6. **Cart Module** (`cart.module.ts`)
```typescript
+ Capabilities Schema في imports
```

#### 7. **Order Schema** (`order.schema.ts`)
```typescript
+ wholesaleDiscountPercent?: number
+ wholesaleDiscountAmount?: number
```

#### 8. **Checkout Service** (`checkout.service.ts`)
- ✅ حفظ `wholesaleDiscountPercent` و `wholesaleDiscountAmount` في الطلب

#### 9. **Services Service** (`services.service.ts`)
- ✅ منع المهندس من رؤية طلباته في `nearby()`
- ✅ منع المهندس من تقديم عرض على طلبه في `offer()`

---

## 🎯 نقاط القوة في التصميم

### 1. **الأمان** 🔒
- ✅ خصم التاجر يُحسب من السيرفر (لا يمكن التلاعب به)
- ✅ المهندس لا يمكنه تقديم عرض على طلبه
- ✅ التحقق من الصلاحيات في كل خطوة

### 2. **المرونة** 🔄
- ✅ الإدارة تتحكم في نسبة الخصم لكل تاجر
- ✅ يمكن تحديث نسبة الخصم في أي وقت
- ✅ المهندس يمكنه الشراء بشكل طبيعي

### 3. **الشفافية** 📊
- ✅ حفظ معلومات الخصم في كل طلب (للتقارير)
- ✅ العميل يرى الخصم المطبق واضحاً
- ✅ سهولة تتبع المبيعات للتجار

### 4. **قابلية التوسع** 🚀
- ✅ يمكن إضافة أنواع خصومات أخرى مستقبلاً
- ✅ البنية تدعم طلبات قدرات متعددة
- ✅ سهولة إضافة تخصصات للمهندسين

---

## ✅ قائمة التحقق

### التاجر:
- [x] إضافة حقل `wholesale_discount_percent` في Capabilities
- [x] موافقة الإدارة مع نسبة الخصم
- [x] تطبيق الخصم تلقائياً في السلة
- [x] حفظ معلومات الخصم في الطلب
- [x] إرجاع معلومات الخصم في Preview

### المهندس:
- [x] إضافة حقل `jobTitle` في User
- [x] طلب المسمى الوظيفي عند التسجيل
- [x] منع المهندس من رؤية طلباته
- [x] منع المهندس من تقديم عرض على طلبه
- [x] السماح بالشراء العادي
- [x] السماح بطلب مهندسين آخرين

---

## 📞 الدعم

لأي استفسارات أو تحسينات، يرجى التواصل مع فريق التطوير.

**تم التطوير بـ ❤️ لنظام Tagadodo**

