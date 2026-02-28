# تحديث API لرسوم التوصيل (لـ Flutter)

## الملخص
تم تحديث استجابات الطلبات بحيث ترجع رسوم التوصيل بشكل واضح في:

1. جلسة الدفع (`checkout session`)
2. تفاصيل الطلب (`order details`)

القيمة الحالية لرسوم التوصيل هي `0`.

---

## ما الذي تغيّر؟

### 1) Checkout Session
Endpoint:

`POST /api/v1/orders/checkout/session`

داخل `session.totals` أصبح الحقل `deliveryFee` موجودًا الآن (بالإضافة إلى `shipping` الموجود مسبقًا).

#### الشكل الحالي

```json
{
  "session": {
    "totals": {
      "subtotal": 120000,
      "deliveryFee": 0,
      "shipping": 0,
      "total": 120000,
      "currency": "YER"
    }
  }
}
```

> ملاحظة: `deliveryFee` و `shipping` يحملان نفس القيمة حاليًا.

---

### 2) Order Details
Endpoint:

`GET /api/v1/orders/:id`

داخل `order` أصبح الحقل `deliveryFee` موجودًا الآن، وقيمته مشتقة من `shippingCost` (مع fallback إلى `0`).

#### الشكل الحالي

```json
{
  "order": {
    "_id": "65abc123def456789",
    "subtotal": 120000,
    "shippingCost": 0,
    "deliveryFee": 0,
    "total": 120000,
    "currency": "YER"
  }
}
```

---

## الهدف من التعديل

- تسهيل التكامل مع Flutter إذا كان التطبيق يعتمد على اسم `deliveryFee` في العرض.
- الحفاظ على التوافق الخلفي مع الحقول الحالية (`shipping` و `shippingCost`).

---

## المطلوب من مطور Flutter

1. في شاشة الدفع (Checkout):
   - اقرأ `session.totals.deliveryFee`.
   - يمكن إبقاء fallback إلى `session.totals.shipping` للتوافق.

2. في شاشة تفاصيل الطلب:
   - اقرأ `order.deliveryFee`.
   - يمكن إبقاء fallback إلى `order.shippingCost` للتوافق.

3. منطق العرض:
   - إذا `deliveryFee > 0` اعرض القيمة.
   - إذا `deliveryFee == 0` اعرض "مجاني".

---

## ملاحظات توافقية

- الحقول القديمة ما زالت موجودة:
  - Session: `totals.shipping`
  - Order Details: `order.shippingCost`
- الحقول الجديدة المضافة:
  - Session: `totals.deliveryFee`
  - Order Details: `order.deliveryFee`

---

## تاريخ التحديث

- التاريخ: 2026-02-22
- الحالة: جاهز للتكامل في Flutter
