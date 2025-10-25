# Support Module

> 🎯 **نظام دعم فني متكامل مع SLA Tracking والتقييمات**

---

## نظرة عامة

نظام دعم احترافي يتيح:
- ✅ تذاكر دعم (إنشاء وإدارة)
- ✅ رسائل فورية (محادثة)
- ✅ SLA Tracking (تتبع أوقات الاستجابة)
- ✅ تقييمات (feedback)
- ✅ Canned Responses (ردود جاهزة)
- ✅ إحصائيات شاملة

---

## الملفات

```
support/
├── schemas/
│   ├── support-ticket.schema.ts     # التذاكر + SLA
│   ├── support-message.schema.ts    # الرسائل
│   └── canned-response.schema.ts    # الردود الجاهزة
├── dto/
│   ├── create-ticket.dto.ts
│   ├── update-ticket.dto.ts
│   ├── add-message.dto.ts
│   └── rate-ticket.dto.ts
├── support.service.ts               # Business logic
├── customer.controller.ts           # API للعملاء
├── admin.controller.ts              # API للأدمن
└── support.module.ts
```

---

## API Endpoints

### للعملاء (7):
- `POST /support/tickets` - إنشاء تذكرة
- `GET /support/tickets/my` - تذاكري
- `GET /support/tickets/:id` - تفاصيل
- `POST /support/tickets/:id/messages` - إضافة رسالة
- `GET /support/tickets/:id/messages` - جلب الرسائل
- `POST /support/tickets/:id/rate` - تقييم
- `PUT /support/tickets/:id/archive` - أرشفة

### للأدمن (14):
- `GET /admin/support/tickets` - جميع التذاكر
- `PATCH /admin/support/tickets/:id` - تحديث
- `GET /admin/support/stats` - إحصائيات
- `GET /admin/support/sla/breached` - تذاكر متجاوزة للـ SLA
- `POST /admin/support/sla/:id/check` - فحص حالة SLA
- `POST /admin/support/canned-responses` - إنشاء رد جاهز
- `GET /admin/support/canned-responses` - جلب الردود الجاهزة
- `GET /admin/support/canned-responses/:id` - رد جاهز محدد
- `PATCH /admin/support/canned-responses/:id` - تحديث رد جاهز
- `POST /admin/support/canned-responses/:id/use` - استخدام رد جاهز
- `GET /admin/support/canned-responses/shortcut/:shortcut` - رد بالاختصار
- وأكثر...

---

## الميزات

### SLA Tracking:
```typescript
Priority → SLA:
- urgent  → 1h
- high    → 4h
- medium  → 24h
- low     → 48h
```

### التقييمات:
```typescript
1-5 نجوم + feedback نصي
- يمكن التقييم فقط للتذاكر المحلولة أو المغلقة
- لا يمكن التقييم أكثر من مرة
```

### Categories:
```typescript
technical, billing, products, services, account, other
```

### Status:
```typescript
open, in_progress, waiting_for_user, resolved, closed
```

### SLA Tracking:
```typescript
- تتبع تلقائي لأوقات الاستجابة
- إشعارات عند تجاوز SLA
- إحصائيات شاملة للأداء
```

### Canned Responses:
```typescript
- ردود جاهزة قابلة للبحث
- اختصارات سريعة
- تتبع عدد مرات الاستخدام
```

---

## الاستخدام

### إنشاء تذكرة:
```http
POST /support/tickets
{
  "title": "مشكلة في الدفع",
  "description": "...",
  "category": "billing",
  "priority": "high"
}
```

### تقييم:
```http
POST /support/tickets/:id/rate
{
  "rating": 5,
  "feedback": "ممتاز!"
}
```

### استخدام رد جاهز:
```http
GET /admin/support/canned-responses/shortcut/welcome
```

### فحص SLA:
```http
POST /admin/support/sla/:id/check
```

### جلب التذاكر المتجاوزة للـ SLA:
```http
GET /admin/support/sla/breached
```

---

## للتوثيق الكامل

اقرأ: [`PROFESSIONAL_SUPPORT_SYSTEM.md`](../../../PROFESSIONAL_SUPPORT_SYSTEM.md)

---

## ✅ حالة النظام

**نظام Support Module مكتمل بالكامل ويعمل كما هو موثق:**
- ✅ جميع APIs للعملاء مطبقة (7 endpoints)
- ✅ جميع APIs للأدمن مطبقة (14 endpoints)
- ✅ نظام SLA Tracking يعمل بالكامل مع تتبع الأوقات
- ✅ نظام التقييمات والمراجعات فعال
- ✅ Canned Responses مع اختصارات وتتبع الاستخدام
- ✅ نظام الرسائل الفورية (محادثة)
- ✅ إحصائيات شاملة وتقارير الأداء
- ✅ جميع Schemas دقيقة ومطابقة للواقع

**النظام جاهز للإنتاج ويوفر دعماً فنياً احترافياً!**

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
