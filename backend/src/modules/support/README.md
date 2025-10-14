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
- `DELETE /support/tickets/:id/archive` - أرشفة

### للأدمن (8+):
- `GET /admin/support/tickets` - جميع التذاكر
- `PATCH /admin/support/tickets/:id` - تحديث
- `GET /admin/support/stats` - إحصائيات
- `POST /admin/support/canned-responses` - ردود جاهزة
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
```

### Categories:
```typescript
technical, billing, products, services, account, other
```

### Status:
```typescript
open, in_progress, waiting_for_user, resolved, closed
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

---

## للتوثيق الكامل

اقرأ: [`PROFESSIONAL_SUPPORT_SYSTEM.md`](../../../PROFESSIONAL_SUPPORT_SYSTEM.md)

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready
