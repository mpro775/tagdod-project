# نظام التاجر والمهندس - تنفيذ احترافي ✨

> ⚠️ **ملاحظة مهمة:** المشروع يستخدم **نظام ردود موحد** و**حمايات متعددة الطبقات (Guards)**.  
> جميع الأمثلة في هذا الدليل تتبع المعايير الصحيحة.

## 🔐 نظام الحمايات والردود

### الحمايات (Guards):
- **JwtAuthGuard**: التحقق من صحة التوكن
- **AdminGuard**: التحقق من صلاحيات الإدارة (`isAdmin: true`)
- **EngineerGuard**: التحقق من صلاحيات المهندس (`engineer_capable: true`)

### نظام الردود الموحد:
```json
// رد ناجح
{
  "success": true,
  "data": { ... },
  "meta": { ... },  // اختياري
  "requestId": "req-xxx"
}

// رد خطأ
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req-xxx"
}
```

---

## 🎯 ما تم تنفيذه؟

تم تطوير نظام متكامل يدعم نوعين من المستخدمين المتخصصين:

### 1. **التاجر (Wholesale Customer)** 💼
- يحصل على **خصم نسبة مئوية** (يحدده الإدارة)
- يطبق الخصم **تلقائياً** على كل طلباته
- الخصم يطبق **بعد** العروض الترويجية
- **ليس** نظام شراء بالجملة - فقط خصم مخصص

### 2. **المهندس (Engineer)** 🔧
- يضيف **مسمى وظيفي** عند التسجيل (مثل: "كهربائي")
- يستلم **طلبات خدمات** من العملاء
- يقدم **عروضه** على الطلبات
- **لا يرى** طلباته الخاصة في نتائج البحث
- **لا يمكنه** تقديم عرض على طلبه
- يشتري بشكل **عادي** (بدون خصم)

---

## 📁 الملفات الرئيسية

| الملف | الغرض |
|------|-------|
| `QUICK_START_WHOLESALE_ENGINEER.md` | 🔥 البدء السريع (ابدأ هنا!) |
| `README_WHOLESALE_ENGINEER.md` | نظرة عامة شاملة |
| `WHOLESALE_AND_ENGINEER_SYSTEM.md` | دليل تفصيلي للنظام |
| `API_EXAMPLES_WHOLESALE_ENGINEER.md` | أمثلة عملية مع نظام الردود الموحد |
| `CHANGES_SUMMARY.md` | ملخص التغييرات التقنية |

---

## 🚀 البدء السريع

### 1. قراءة التوثيق
```bash
# افتح هذه الملفات بالترتيب:
1. QUICK_START_WHOLESALE_ENGINEER.md  # 🔥 البدء السريع (ابدأ هنا!)
2. README_WHOLESALE_ENGINEER.md  # هذا الملف - نظرة عامة
3. WHOLESALE_AND_ENGINEER_SYSTEM.md  # الدليل الشامل
4. API_EXAMPLES_WHOLESALE_ENGINEER.md  # أمثلة عملية مع نظام الردود الموحد
5. CHANGES_SUMMARY.md  # تفاصيل التغييرات
```

### 2. اختبار النظام
```bash
# استخدم Postman/Thunder Client مع الأمثلة من:
API_EXAMPLES_WHOLESALE_ENGINEER.md
```

---

## 📊 مقارنة سريعة

| الميزة | عميل عادي | تاجر | مهندس |
|-------|-----------|------|-------|
| الشراء | ✅ عادي | ✅ بخصم | ✅ عادي |
| خصم تلقائي | ❌ | ✅ | ❌ |
| طلب خدمات | ✅ | ✅ | ✅ |
| تقديم خدمات | ❌ | ❌ | ✅ |
| مسمى وظيفي | ❌ | ❌ | ✅ مطلوب |
| موافقة الإدارة | ❌ | ✅ | ✅ |

---

## 🔄 Flow Diagrams

### تسجيل التاجر:
```
1. POST /auth/send-otp
2. POST /auth/verify-otp { capabilityRequest: "wholesale" }
3. حالة: pending
4. POST /auth/admin/approve { wholesaleDiscountPercent: 15 }
5. حالة: approved + خصم 15%
6. جميع الطلبات تحصل على خصم تلقائي
```

### تسجيل المهندس:
```
1. POST /auth/send-otp
2. POST /auth/verify-otp { 
     capabilityRequest: "engineer",
     jobTitle: "كهربائي" ⚠️ مطلوب
   }
3. حالة: pending
4. POST /auth/admin/approve
5. حالة: approved
6. يمكنه استلام طلبات الخدمات
```

### خصم التاجر:
```
السعر: 1000 ريال
  ↓
عرض ترويجي (10%): 900 ريال
  ↓
خصم التاجر (15%): 765 ريال
  ↓
السعر النهائي: 765 ريال
الخصم الإجمالي: 235 ريال
```

### المهندس يبحث عن طلبات:
```
طلبات متاحة:
- طلب A (عميل 1) ✅ يظهر
- طلب B (عميل 2) ✅ يظهر
- طلب C (المهندس نفسه) ❌ لا يظهر
```

---

## 🧪 اختبارات أساسية

### ✅ يجب أن تنجح:
```bash
# 1. تسجيل تاجر مع موافقة
POST /auth/verify-otp { capabilityRequest: "wholesale" }
POST /auth/admin/approve { wholesaleDiscountPercent: 15 }
GET /cart/preview  # توقع: خصم 15%

# 2. تسجيل مهندس مع jobTitle
POST /auth/verify-otp { 
  capabilityRequest: "engineer",
  jobTitle: "كهربائي"
}
POST /auth/admin/approve
GET /services/requests/nearby  # لا يرى طلباته
```

### ❌ يجب أن تفشل:
```bash
# 1. مهندس بدون jobTitle
POST /auth/verify-otp { 
  capabilityRequest: "engineer"
  # jobTitle مفقود
}
# توقع: AUTH_JOB_TITLE_REQUIRED

# 2. مهندس يقدم عرض على طلبه
POST /services/offers { requestId: "طلب_المهندس_نفسه" }
# توقع: SELF_NOT_ALLOWED
```

---

## 📋 Checklist للمطور

### قبل الاختبار:
- [ ] قراءة `WHOLESALE_AND_ENGINEER_SYSTEM.md`
- [ ] فهم الفرق بين التاجر والمهندس
- [ ] تحضير Postman/Thunder Client

### أثناء الاختبار:
- [ ] تسجيل تاجر وموافقة الإدارة
- [ ] التحقق من خصم التاجر في السلة
- [ ] التحقق من حفظ الخصم في الطلب
- [ ] تسجيل مهندس مع jobTitle
- [ ] التحقق من عدم رؤية المهندس لطلباته
- [ ] التحقق من منع المهندس من تقديم عرض على طلبه

### بعد الاختبار:
- [ ] فحص logs للتأكد من عدم وجود أخطاء
- [ ] التحقق من قاعدة البيانات
- [ ] توثيق أي مشاكل

---

## 🎨 مثال واقعي

### السيناريو: علي التاجر

```javascript
// 1. التسجيل
POST /auth/verify-otp
{
  "phone": "0555111111",
  "code": "123456",
  "firstName": "علي",
  "lastName": "التاجر",
  "capabilityRequest": "wholesale"
}

// 2. الإدارة توافق وتعطيه خصم 20%
POST /auth/admin/approve
{
  "userId": "...",
  "capability": "wholesale",
  "approve": true,
  "wholesaleDiscountPercent": 20
}

// 3. علي يتسوق
POST /cart/items { "variantId": "product_a", "qty": 10 }

// 4. علي يعاين السلة
GET /cart/preview
// Response:
{
  "subtotal": 8000,  // كان 10000 قبل الخصم
  "meta": {
    "wholesaleDiscountPercent": 20,
    "wholesaleDiscountAmount": 2000
  }
}

// 5. علي يشتري
POST /checkout/confirm
// يتم حفظ معلومات الخصم في الطلب
```

### السيناريو: خالد المهندس

```javascript
// 1. التسجيل
POST /auth/verify-otp
{
  "phone": "0555222222",
  "code": "654321",
  "firstName": "خالد",
  "lastName": "المهندس",
  "capabilityRequest": "engineer",
  "jobTitle": "كهربائي معتمد"  // ⚠️ مطلوب
}

// 2. الإدارة توافق
POST /auth/admin/approve
{
  "userId": "...",
  "capability": "engineer",
  "approve": true
}

// 3. خالد ينشئ طلب خدمة لنفسه
POST /services/requests
{
  "title": "أحتاج كهربائي",
  "type": "ELECTRICAL"
}

// 4. خالد يبحث عن طلبات
GET /services/requests/nearby?lat=24.7&lng=46.6&radiusKm=10
// Response:
{
  "data": [
    { "title": "إصلاح كهرباء للعميل أحمد" },  // ✅ يظهر
    { "title": "صيانة للعميل محمد" }          // ✅ يظهر
    // ❌ "أحتاج كهربائي" (طلب خالد) لا يظهر
  ]
}

// 5. خالد يحاول تقديم عرض على طلبه
POST /services/offers
{
  "requestId": "طلب_خالد",
  "amount": 500
}
// Response: { "error": "SELF_NOT_ALLOWED" }  ❌

// 6. خالد يتسوق
GET /cart/preview
// Response: لا يوجد خصم (يشتري بسعر عادي)
```

---

## 🔐 الأمان والجودة

### ✅ تم التطبيق:
1. **Server-side calculations**: جميع الحسابات من السيرفر
2. **Validation**: التحقق من البيانات في كل خطوة
3. **Authorization**: فحص الصلاحيات
4. **Audit trail**: حفظ معلومات الخصم في الطلب
5. **Business logic**: منع المهندس من رؤية طلباته

### 🚫 لا يمكن:
- ❌ التلاعب بنسبة الخصم من العميل
- ❌ المهندس يرى طلباته في البحث
- ❌ المهندس يقدم عرض على طلبه
- ❌ الحصول على خصم بدون موافقة الإدارة

---

## 📚 الملفات التقنية

### Database Schemas:
- `capabilities.schema.ts` - إضافة `wholesale_discount_percent`
- `user.schema.ts` - إضافة `jobTitle`
- `order.schema.ts` - إضافة `wholesaleDiscountPercent` و `wholesaleDiscountAmount`

### Services:
- `cart.service.ts` - تطبيق خصم التاجر تلقائياً
- `services.service.ts` - منع المهندس من رؤية طلباته

### Controllers:
- `auth.controller.ts` - التحقق من jobTitle وإضافة wholesaleDiscountPercent

### DTOs:
- `verify-otp.dto.ts` - إضافة `jobTitle`

---

## 💡 نصائح للمطورين

1. **عند إضافة ميزات جديدة:**
   - تأكد من تطبيق الخصم في جميع الحالات
   - احفظ معلومات الخصم في الطلب
   - راعِ الأمان (server-side)

2. **عند تعديل الأسعار:**
   - تطبيق العروض الترويجية أولاً
   - ثم تطبيق خصم التاجر
   - ثم حفظ السعر النهائي

3. **عند إضافة ميزات للمهندس:**
   - تأكد من عدم رؤيته لطلباته
   - تأكد من عدم تقديمه عروض على طلباته
   - استخدم `userId: { $ne: engineerUserId }`

---

## 🎓 للمبتدئين

### كيف يعمل النظام؟

1. **التاجر:**
   ```
   يسجل → الإدارة توافق مع خصم → يتسوق → خصم تلقائي
   ```

2. **المهندس:**
   ```
   يسجل + jobTitle → الإدارة توافق → يستلم طلبات → يقدم عروض
   ```

### أين الكود؟

- **خصم التاجر:** `cart.service.ts` (السطر 162-189)
- **المسمى الوظيفي:** `auth.controller.ts` (السطر 43-62)
- **منع رؤية الطلبات:** `services.service.ts` (السطر 106)

---

## 🆘 حل المشاكل

### المشكلة: التاجر لا يحصل على خصم
```bash
# 1. تحقق من الموافقة
GET /auth/me
# يجب: wholesale_capable = true, wholesale_discount_percent > 0

# 2. تحقق من السلة
GET /cart/preview
# يجب: meta.wholesaleDiscountPercent > 0
```

### المشكلة: المهندس يرى طلباته
```bash
# 1. تحقق من الكود في services.service.ts
# يجب أن يحتوي على: userId: { $ne: engineerUserId }

# 2. اختبر
GET /services/requests/nearby
# يجب: لا توجد طلبات للمهندس نفسه
```

### المشكلة: خطأ عند تسجيل المهندس
```bash
# الخطأ: AUTH_JOB_TITLE_REQUIRED
# الحل: أضف jobTitle في الطلب
POST /auth/verify-otp
{
  "capabilityRequest": "engineer",
  "jobTitle": "كهربائي"  // ⬅️ لا تنس
}
```

---

## 📞 الدعم

- **الأسئلة التقنية:** راجع `CHANGES_SUMMARY.md`
- **أمثلة عملية:** راجع `API_EXAMPLES_WHOLESALE_ENGINEER.md`
- **الدليل الشامل:** راجع `WHOLESALE_AND_ENGINEER_SYSTEM.md`

---

## ✨ الخلاصة

تم تطبيق نظام احترافي ومتكامل يدعم:
- ✅ التاجر بخصم تلقائي مخصص
- ✅ المهندس مع مسمى وظيفي وتقديم خدمات
- ✅ أمان كامل ومنع التلاعب
- ✅ توثيق شامل مع أمثلة عملية

**جاهز للاستخدام والاختبار! 🚀**

---

**تم بواسطة:** Claude Sonnet 4.5  
**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Tagadodo

