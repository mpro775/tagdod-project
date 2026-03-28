# دليل تكامل تتبع نشاط المستخدمين - مطور التطبيق

## نظرة عامة

تم إضافة نظام تتبع نشاط المستخدمين في الـ Backend ولوحة التحكم. هذا الدليل يشرح ما هو مطلوب من مطور التطبيق لضمان عمل النظام بشكل صحيح.

---

## ما تم إضافته في الـ Backend

### 1. حقل `lastActivityAt` (موجود مسبقاً)
- يتم تحديثه تلقائياً عبر `ActivityTrackingMiddleware`
- يتم تحديثه عند كل طلب API من المستخدم المصادق عليه

### 2. Endpoints جديدة للإحصائيات

| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/admin/user-analytics/activity/stats` | GET | إحصائيات شاملة للنشاط |
| `/admin/user-analytics/activity/online-now` | GET | المستخدمين النشطين الآن |
| `/admin/user-analytics/activity/recent` | GET | المستخدمين النشطين مؤخراً |
| `/admin/user-analytics/activity/inactive` | GET | المستخدمين غير النشطين |
| `/admin/user-analytics/activity/never-logged-in` | GET | المستخدمين الذين لم يدخلوا أبداً |

---

## ما هو مطلوب من مطور التطبيق

### ✅ لا يوجد تغيير مطلوب في معظم الحالات

النظام يعمل **تلقائياً** عبر `ActivityTrackingMiddleware` الذي يتم تشغيله مع كل طلب API مصادق عليه.

### ⚠️ تأكد من الآتي:

#### 1. إرسال Token في كل طلب
تأكد من أن التطبيق يرسل `Authorization: Bearer <token>` في كل طلب API.

```dart
// مثال في Flutter/Dart
final response = await http.get(
  Uri.parse('$apiUrl/products'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
);
```

#### 2. تحديث Token عند التجديد
إذا تم تجديد الـ Token، تأكد من استخدامه في الطلبات التالية.

#### 3. تسجيل الخروج
عند تسجيل خروج المستخدم، لا داعي لأي إجراء خاص - النظام سيتوقف عن تحديث نشاطه تلقائياً.

---

## كيف يعمل النظام

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   التطبيق       │────▶│   Backend API   │────▶│  Middleware     │
│  (Flutter)      │     │                 │     │  (تتبع النشاط)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │   قاعدة البيانات │
                                                │ lastActivityAt  │
                                                └─────────────────┘
```

### سيناريو التحديث:

1. المستخدم يفتح التطبيق
2. التطبيق يرسل طلب API مع Token
3. الـ Middleware يتحقق من الـ Token
4. إذا كان صالحاً، يتم تحديث `lastActivityAt` للمستخدم
5. الإحصائيات تُحسب بناءً على هذا الحقل

---

## تعريفات النشاط

| الحالة | التعريف |
|--------|---------|
| **نشط الآن** | آخر نشاط خلال 15 دقيقة |
| **نشط اليوم** | آخر نشاط خلال 24 ساعة |
| **نشط هذا الأسبوع** | آخر نشاط خلال 7 أيام |
| **غير نشط** | آخر نشاط أكثر من 30 يوم |
| **لم يدخل أبداً** | `lastActivityAt` يساوي `createdAt` (بفارق أقل من دقيقة) |

---

## اختبار التكامل

### 1. اختبار تحديث النشاط

```bash
# 1. سجل دخول مستخدم
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "XXXXXXXXX", "password": "XXXXXX"}'

# 2. استخدم الـ Token في طلب
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer <TOKEN>"

# 3. تحقق من تحديث النشاط (كمدير)
curl -X GET http://localhost:3000/admin/user-analytics/activity/online-now \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 2. اختبار من لوحة التحكم

1. افتح لوحة التحكم
2. اذهب إلى `/users/activity`
3. تحقق من ظهور المستخدمين النشطين

---

## ملاحظات مهمة

### 1. الـ Middleware لا يعمل على:
- طلبات غير مصادق عليها (بدون Token)
- طلبات المسارات العامة (public routes)
- طلبات الـ webhook

### 2. الأداء
- تحديث `lastActivityAt` يتم بشكل غير متزامن (async)
- لا يؤثر على سرعة الاستجابة للطلب الأصلي
- يتم تخزين النتائج مؤقتاً (caching) لتحسين الأداء

### 3. الأخطاء
- إذا فشل تحديث النشاط، لا يؤثر ذلك على الطلب الأصلي
- يتم تسجيل الخطأ في الـ logs فقط

---

## الأسئلة الشائعة

### س: هل يجب إرسال طلب خاص لتحديث النشاط؟
**ج:** لا، يتم التحديث تلقائياً مع كل طلب API مصادق عليه.

### س: ماذا لو كان المستخدم يعمل offline؟
**ج:** النشاط يُحدث فقط عند الاتصال بالسيرفر وإرسال طلب.

### س: هل يؤثر هذا على أداء التطبيق؟
**ج:** لا، التحديث يتم في الـ backend فقط ولا يتطلب أي معالجة إضافية في التطبيق.

### س: كيف أعرف أن النظام يعمل؟
**ج:** افتح لوحة التحكم على `/users/activity` وتحقق من ظهور المستخدمين النشطين.

---

## ملفات Backend المضافة/المعدلة

```
backend/src/modules/users/
├── dto/
│   └── user-activity.dto.ts          # جديد - DTOs للنشاط
├── services/
│   └── user-activity-tracking.service.ts  # جديد - خدمة التتبع
├── controllers/
│   └── user-analytics.controller.ts  # معدل - endpoints جديدة
└── users.module.ts                   # معدل - إضافة الخدمة
```

## ملفات Frontend المضافة/المعدلة

```
admin-dashboard/src/features/users/
├── hooks/
│   └── useUserActivity.ts            # جديد - Hook للـ API
├── components/
│   └── ActivityKPICards.tsx          # جديد - بطاقات KPI
└── pages/
    └── UserActivityPage.tsx          # جديد - صفحة النشاط
```

---

## الدعم

في حالة وجود أي مشاكل أو استفسارات، يرجى التواصل مع فريق الـ Backend.

---

**تاريخ التحديث:** مارس 2026
**الإصدار:** 1.0.0
