# Quick Start - نظام الدعم

> 🎯 **دليل سريع للبدء بنظام الدعم الفني**

---

## 🚀 للعملاء

### 1. إنشاء تذكرة

```http
POST /support/tickets
Authorization: Bearer <token>

{
  "title": "مشكلة في الدفع",
  "description": "لا أستطيع إتمام عملية الشراء",
  "category": "billing",
  "priority": "high"
}
```

### 2. عرض تذاكري

```http
GET /support/tickets/my
Authorization: Bearer <token>
```

### 3. إضافة رسالة

```http
POST /support/tickets/:id/messages
Authorization: Bearer <token>

{
  "content": "هل هناك تحديث؟"
}
```

### 4. تقييم الخدمة

```http
POST /support/tickets/:id/rate
Authorization: Bearer <token>

{
  "rating": 5,
  "feedback": "خدمة ممتازة!"
}
```

---

## 🔐 للأدمن

### 1. عرض جميع التذاكر

```http
GET /admin/support/tickets?status=open&priority=high
Authorization: Bearer <admin_token>
```

### 2. تحديث تذكرة

```http
PATCH /admin/support/tickets/:id
Authorization: Bearer <admin_token>

{
  "status": "in_progress",
  "assignedTo": "admin_123",
  "priority": "urgent"
}
```

### 3. الرد على التذكرة

```http
POST /support/tickets/:id/messages
Authorization: Bearer <admin_token>

{
  "content": "تم فحص المشكلة..."
}
```

### 4. الإحصائيات

```http
GET /admin/support/stats
Authorization: Bearer <admin_token>
```

---

## 💡 نصائح

### React:

```typescript
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
```

---

## 📖 للتفاصيل

اقرأ: [`PROFESSIONAL_SUPPORT_SYSTEM.md`](./PROFESSIONAL_SUPPORT_SYSTEM.md)

---

**🎯 بسيط، سريع، احترافي!**

