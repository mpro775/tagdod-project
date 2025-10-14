# نظام الدعم الاحترافي المتكامل - Tagadodo

> 🎯 **نظام دعم فني متكامل مع SLA Tracking، التقييمات، والردود الجاهزة**

**التاريخ:** 14 أكتوبر 2025  
**الحالة:** ✅ مكتمل وجاهز

---

## 📋 نظرة عامة

نظام دعم فني احترافي يوفر:
- ✅ **تذاكر دعم** - إنشاء وإدارة
- ✅ **رسائل فورية** - محادثة مباشرة
- ✅ **SLA Tracking** - تتبع أوقات الاستجابة
- ✅ **تقييمات** - feedback من العملاء
- ✅ **Canned Responses** - ردود جاهزة
- ✅ **إحصائيات** - تحليلات شاملة
- ✅ **أولويات** - low, medium, high, urgent
- ✅ **تصنيفات** - technical, billing, products, etc.

---

## 🎯 السير الكامل

### 1. العميل ينشئ تذكرة

```http
POST /support/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "مشكلة في الدفع",
  "description": "لا أستطيع إتمام عملية الدفع بالبطاقة",
  "category": "billing",
  "priority": "high",
  "attachments": ["https://..."],
  "metadata": {
    "orderId": "order_123"
  }
}
```

**Response:**
```json
{
  "data": {
    "_id": "ticket_001",
    "userId": "user_123",
    "title": "مشكلة في الدفع",
    "description": "لا أستطيع إتمام عملية الدفع بالبطاقة",
    "category": "billing",
    "priority": "high",
    "status": "open",
    "slaHours": 4,
    "slaDueDate": "2025-10-14T18:00:00Z",
    "createdAt": "2025-10-14T14:00:00Z"
  }
}
```

**ماذا يحدث:**
- ✅ تذكرة جديدة
- ✅ SLA يتم حسابه تلقائياً (4 ساعات لـ high priority)
- ✅ رسالة أولية تُنشأ تلقائياً
- ✅ إشعار للأدمن

---

### 2. الأدمن يرى التذاكر

```http
GET /admin/support/tickets?status=open&priority=high&page=1
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": {
    "tickets": [
      {
        "_id": "ticket_001",
        "userId": {
          "name": "أحمد محمد",
          "email": "ahmad@example.com"
        },
        "title": "مشكلة في الدفع",
        "category": "billing",
        "priority": "high",
        "status": "open",
        "slaDueDate": "2025-10-14T18:00:00Z",
        "slaBreached": false,
        "createdAt": "2025-10-14T14:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### 3. الأدمن يتولى التذكرة

```http
PATCH /admin/support/tickets/ticket_001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "in_progress",
  "assignedTo": "admin_456",
  "priority": "urgent"
}
```

**Response:**
```json
{
  "data": {
    "_id": "ticket_001",
    "status": "in_progress",
    "assignedTo": {
      "_id": "admin_456",
      "name": "سارة الأحمد"
    }
  }
}
```

---

### 4. الأدمن يرد (باستخدام Canned Response)

```http
# أولاً: جلب الردود الجاهزة
GET /admin/support/canned-responses?category=billing
Authorization: Bearer <admin_token>

Response:
{
  "data": [
    {
      "_id": "resp_001",
      "title": "مشكلة دفع عامة",
      "content": "شكراً لتواصلك. سنفحص المشكلة...",
      "shortcut": "/payment-issue"
    }
  ]
}

# ثم: إضافة رسالة
POST /support/tickets/ticket_001/messages
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "content": "شكراً لتواصلك معنا. تم فحص المشكلة ووجدنا أن بطاقتك تحتاج تفعيل المدفوعات الإلكترونية...",
  "attachments": []
}
```

**ماذا يحدث:**
- ✅ رسالة تُرسل للعميل
- ✅ firstResponseAt يُحدّث تلقائياً
- ✅ إشعار للعميل
- ✅ SLA tracking يُحدّث

---

### 5. العميل يرد

```http
POST /support/tickets/ticket_001/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "شكراً، تم الحل!"
}
```

---

### 6. الأدمن يحل التذكرة

```http
PATCH /admin/support/tickets/ticket_001
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "resolved"
}
```

**ماذا يحدث:**
- ✅ resolvedAt يُحدّث
- ✅ إشعار للعميل
- ✅ طلب تقييم

---

### 7. العميل يقيّم

```http
POST /support/tickets/ticket_001/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "feedback": "خدمة ممتازة، شكراً لكم"
}
```

**Response:**
```json
{
  "data": {
    "rated": true
  }
}
```

---

## 📊 التصنيفات والأولويات

### Categories:

```typescript
technical    // مشاكل تقنية
billing      // فوترة ومدفوعات
products     // استفسارات منتجات
services     // خدمات المهندسين
account      // حساب المستخدم
other        // أخرى
```

---

### Priorities:

```typescript
low       // منخفضة (SLA: 48 ساعة)
medium    // متوسطة (SLA: 24 ساعة)
high      // عالية (SLA: 4 ساعات)
urgent    // عاجلة (SLA: 1 ساعة)
```

---

### Status:

```typescript
open                // جديدة
in_progress         // قيد المعالجة
waiting_for_user    // بانتظار رد العميل
resolved            // تم الحل
closed              // مغلقة
```

---

## ⏱️ SLA Tracking

### حساب تلقائي:

```typescript
Priority → SLA Hours:
- urgent  → 1 ساعة
- high    → 4 ساعات
- medium  → 24 ساعة
- low     → 48 ساعة

slaDueDate = createdAt + slaHours
```

---

### مراقبة:

```typescript
if (now > slaDueDate && status !== 'resolved') {
  slaBreached = true
}
```

---

### الإحصائيات:

```http
GET /admin/support/stats

Response:
{
  "sla": {
    "breached": 3,
    "onTime": 47,
    "breachRate": "6%"
  }
}
```

---

## 🌟 Canned Responses (الردود الجاهزة)

### إنشاء رد جاهز:

```http
POST /admin/support/canned-responses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "ترحيب",
  "content": "شكراً لتواصلك معنا، كيف يمكننا مساعدتك؟",
  "contentEn": "Thank you for contacting us, how can we help?",
  "category": "other",
  "tags": ["welcome", "greeting"],
  "shortcut": "/welcome"
}
```

---

### استخدام:

```typescript
// الأدمن يكتب:
/welcome

// يتحول تلقائياً إلى:
"شكراً لتواصلك معنا، كيف يمكننا مساعدتك؟"
```

---

### جلب الردود:

```http
GET /admin/support/canned-responses?category=billing

Response:
{
  "data": [
    {
      "title": "مشكلة دفع",
      "content": "سنفحص المشكلة...",
      "shortcut": "/payment",
      "usageCount": 45
    }
  ]
}
```

---

## 📊 الإحصائيات الشاملة

```http
GET /admin/support/stats
Authorization: Bearer <admin_token>

Response:
{
  "data": {
    "total": 150,
    "open": 12,
    "inProgress": 8,
    "resolved": 125,
    "closed": 5,
    
    "byCategory": {
      "technical": 45,
      "billing": 35,
      "products": 40,
      "services": 20,
      "account": 10
    },
    
    "byPriority": {
      "urgent": 5,
      "high": 15,
      "medium": 80,
      "low": 50
    },
    
    "sla": {
      "breached": 8,
      "onTime": 142,
      "breachRate": "5.3%"
    },
    
    "avgResponseTime": "2.5h",
    "avgResolutionTime": "12h",
    
    "satisfaction": {
      "avgRating": 4.7,
      "totalRatings": 120,
      "5stars": 85,
      "4stars": 25,
      "3stars": 8,
      "2stars": 1,
      "1star": 1
    }
  }
}
```

---

## 💬 الرسائل

### إضافة رسالة عادية:

```http
POST /support/tickets/:ticketId/messages
Authorization: Bearer <token>

{
  "content": "هل يمكنني الحصول على تحديث؟"
}
```

---

### رسالة داخلية (Admin only):

```http
POST /support/tickets/:ticketId/messages
Authorization: Bearer <admin_token>

{
  "content": "ملاحظة داخلية: تحقق من الطلب #123",
  "isInternal": true
}
```

**لا يراها العميل!** ✅

---

### جلب الرسائل:

```http
GET /support/tickets/:ticketId/messages?page=1&limit=50
Authorization: Bearer <token>

Response:
{
  "data": {
    "messages": [
      {
        "senderId": {
          "name": "أحمد"
        },
        "messageType": "user_message",
        "content": "مرحباً",
        "createdAt": "..."
      },
      {
        "senderId": {
          "name": "سارة الدعم"
        },
        "messageType": "admin_reply",
        "content": "مرحباً بك",
        "createdAt": "..."
      }
    ],
    "total": 2
  }
}
```

---

## 🔔 الإشعارات

### للعميل:

```
✅ تذكرة جديدة تم إنشاؤها
✅ رد من الدعم
✅ تغيير الحالة
✅ تم الحل
✅ طلب تقييم
```

---

### للأدمن:

```
✅ تذكرة جديدة
✅ رد من العميل
✅ SLA قرب الانتهاء
✅ SLA breached
✅ تقييم جديد
```

---

## 🎯 حالات استخدام عملية

### حالة 1: مشكلة فوترة عاجلة

```
1. عميل: POST /support/tickets
   {
     "title": "لا أستطيع الدفع",
     "category": "billing",
     "priority": "urgent"
   }
   → SLA: 1 ساعة

2. نظام: إشعار فوري للأدمن

3. أدمن (خلال 15 دقيقة):
   PATCH /tickets/:id { "status": "in_progress", "assignedTo": "admin_1" }
   POST /tickets/:id/messages { "content": "جاري الفحص..." }
   → firstResponseAt: 15 دقيقة ✅

4. أدمن (خلال 45 دقيقة):
   POST /tickets/:id/messages { "content": "تم الحل!" }
   PATCH /tickets/:id { "status": "resolved" }
   → resolvedAt: 45 دقيقة
   → SLA: ✅ لم يُتجاوز

5. عميل:
   POST /tickets/:id/rate { "rating": 5 }

✅ تذكرة ناجحة!
```

---

### حالة 2: استفسار منتج

```
1. عميل: POST /support/tickets
   {
     "title": "ما هي مواصفات المنتج X؟",
     "category": "products",
     "priority": "low"
   }
   → SLA: 48 ساعة

2. أدمن (اليوم التالي):
   - يستخدم Canned Response: /product-specs
   - يضيف تفاصيل المنتج المحددة

3. عميل: "شكراً!"

4. أدمن: PATCH { "status": "resolved" }

5. عميل: POST /rate { "rating": 4 }

✅ تم بنجاح!
```

---

### حالة 3: SLA Breach

```
1. تذكرة high priority (SLA: 4 ساعات)

2. بعد 4 ساعات و 5 دقائق:
   → slaBreached = true
   → إشعار للمدير

3. المدير:
   - يراجع التذكرة
   - يتواصل مع المسؤول
   - يضيف ملاحظة داخلية

4. يتم الحل (متأخر)

5. تحليل الإحصائيات:
   → Breach Rate: 5.3%
   → يحتاج تحسين!
```

---

## 🔍 البحث والفلترة

```http
GET /admin/support/tickets?status=open&priority=high&category=billing&assignedTo=admin_1&page=1

# أو
GET /admin/support/tickets?search=دفع&page=1

# أو
GET /admin/support/tickets?slaBreached=true
```

---

## 📱 في الواجهة (Frontend)

### React Example:

```typescript
// 1. إنشاء تذكرة
const createTicket = async (data) => {
  const res = await fetch('/support/tickets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

// 2. جلب تذاكر المستخدم
const getMyTickets = async () => {
  const res = await fetch('/support/tickets/my', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
};

// 3. إضافة رسالة
const addMessage = async (ticketId, content) => {
  const res = await fetch(`/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
  return res.json();
};

// 4. تقييم
const rateTicket = async (ticketId, rating, feedback) => {
  const res = await fetch(`/support/tickets/${ticketId}/rate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rating, feedback })
  });
  return res.json();
};
```

---

## 📊 API Reference

### للعملاء:

```http
POST   /support/tickets                # إنشاء تذكرة
GET    /support/tickets/my             # تذاكري
GET    /support/tickets/:id            # تفاصيل تذكرة
POST   /support/tickets/:id/messages   # إضافة رسالة
GET    /support/tickets/:id/messages   # جلب الرسائل
POST   /support/tickets/:id/rate       # تقييم
DELETE /support/tickets/:id/archive    # أرشفة
```

---

### للأدمن:

```http
GET    /admin/support/tickets                  # جميع التذاكر
GET    /admin/support/tickets/:id              # تفاصيل
PATCH  /admin/support/tickets/:id              # تحديث (status, priority, assignedTo)
POST   /admin/support/tickets/:id/messages     # رد
GET    /admin/support/stats                    # إحصائيات

# Canned Responses
POST   /admin/support/canned-responses         # إنشاء رد جاهز
GET    /admin/support/canned-responses         # جلب الردود
PATCH  /admin/support/canned-responses/:id     # تحديث
DELETE /admin/support/canned-responses/:id     # حذف
```

---

## ✨ الميزات الفريدة

### 1. **SLA Tracking**
```
✅ حساب تلقائي
✅ تتبع دقيق
✅ تنبيهات
✅ إحصائيات
```

---

### 2. **Canned Responses**
```
✅ ردود جاهزة
✅ اختصارات (/welcome)
✅ ثنائي اللغة
✅ تتبع الاستخدام
```

---

### 3. **التقييمات**
```
✅ 1-5 نجوم
✅ feedback نصي
✅ إحصائيات الرضا
✅ متوسط التقييمات
```

---

### 4. **الإحصائيات**
```
✅ شاملة
✅ حسب الفئة
✅ حسب الأولوية
✅ SLA performance
✅ معدلات الاستجابة
```

---

### 5. **الرسائل الداخلية**
```
✅ ملاحظات للأدمن فقط
✅ لا يراها العميل
✅ للتنسيق الداخلي
```

---

## 🔐 الأمان

```typescript
✅ JwtAuthGuard (User)
✅ AdminGuard (Admin only)
✅ Permission checks (userId === ticket.userId)
✅ isInternal messages (admin only)
✅ Input validation
```

---

## 📁 الملفات

```
support/
├── schemas/
│   ├── support-ticket.schema.ts          # Schema محسّن
│   ├── support-message.schema.ts         # الرسائل
│   └── canned-response.schema.ts         # الردود الجاهزة
├── dto/
│   ├── create-ticket.dto.ts
│   ├── update-ticket.dto.ts
│   ├── add-message.dto.ts
│   └── rate-ticket.dto.ts
├── support.service.ts                    # Business logic
├── customer.controller.ts                # API للعملاء
├── admin.controller.ts                   # API للأدمن
└── support.module.ts
```

---

## 🎉 الخلاصة

**نظام دعم احترافي 100%:**

✅ **تذاكر** - إنشاء وإدارة كاملة  
✅ **رسائل** - محادثة فورية  
✅ **SLA Tracking** - تتبع دقيق  
✅ **تقييمات** - قياس الرضا  
✅ **Canned Responses** - كفاءة عالية  
✅ **إحصائيات** - تحليلات شاملة  
✅ **أولويات** - 4 مستويات  
✅ **تصنيفات** - 6 فئات  
✅ **إشعارات** - فورية  
✅ **رسائل داخلية** - تنسيق الفريق  
✅ **جاهز للإنتاج** - 100%  

---

## 🚀 جاهز للاستخدام!

**Tagadodo الآن لديه:**
- نظام دعم من الدرجة العالمية 🎯
- SLA tracking احترافي ⏱️
- تقييمات ورضا العملاء ⭐
- كفاءة عالية (Canned Responses) ⚡
- إحصائيات شاملة 📊

---

**🎯 دعم فني احترافي يليق بمنصة عالمية!**

**Version:** 1.0.0  
**Date:** 14 أكتوبر 2025  
**Status:** ✅ **Production Ready**

