# Capabilities Module

يوفّر مخططًا لقدرات المستخدم وربطها بالمستخدمين لإدارة الأدوار/الصلاحيات الخاصة مثل المهندس والتاجر.

## Module
- الملف: `capabilities/capabilities.module.ts`
- يقوم بتصدير `MongooseModule` مع نموذج `Capabilities` لاستعماله من وحدات أخرى (مثل `auth`).

## Schema: `Capabilities`
المسار: `capabilities/schemas/capabilities.schema.ts`

الحقول:
- `userId: ObjectId` (فريد، مفهرس) — مرجع إلى `User`.
- `customer_capable: boolean` (افتراضي: true) — مستخدم عميل.
- `engineer_capable: boolean` (افتراضي: false)
- `engineer_status: 'none'|'pending'|'approved'|'rejected'` (افتراضي: 'none')
- `wholesale_capable: boolean` (افتراضي: false)
- `wholesale_status: 'none'|'pending'|'approved'|'rejected'` (افتراضي: 'none')
- `wholesale_discount_percent: number` (0..100، افتراضي: 0) — نسبة خصم التاجر عند الموافقة.
- `admin_capable: boolean` (افتراضي: false)
- `admin_status: 'none'|'pending'|'approved'|'rejected'` (افتراضي: 'none')
- يستخدم `timestamps` تلقائياً.

## التكامل مع `auth`
- عند التحقق من OTP لأول مرة، يُنشأ سجل قدرات للمستخدم مع `customer_capable=true`.
- يمكن إرسال طلب قدرات `engineer` أو `wholesale` ليتم وضع الحالة `pending`.
- مسارات الأدمن في `auth`:
  - `GET /auth/admin/pending`: يسرد طلبات `engineer`/`wholesale` المعلقة.
  - `POST /auth/admin/approve`: يعتمد/يرفض القدرة ويضبط `wholesale_discount_percent` عند الموافقة على التاجر.

## ملاحظات
- تأكد من وجود فهرس فريد على `userId` لمنع ازدواج السجلات لكل مستخدم.
- عند حذف المستخدم، يُستحسن تنظيف سجل القدرات المرتبط (تم تضمينه في `DELETE /auth/me`).
