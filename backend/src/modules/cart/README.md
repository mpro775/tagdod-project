# Cart Module

يوفّر إدارة سلال التسوق للمستخدم والضيف، معاينة الأسعار، مهام إدارة العربات المتروكة، ونقاط نهاية إدارية.

## المكونات
- Controllers:
  - `cart.controller.ts`: سلة المستخدم (محمي بـ JWT)
  - `guest-cart.controller.ts`: سلة الضيف (اعتماداً على `deviceId`)
  - `admin-cart.controller.ts`: واجهات إدارية لمتابعة السلال المتروكة وإرسال التذكيرات (محمي + أدوار)
- Service: `cart.service.ts`
- Cron: `cart.cron.ts`
- Schema: `schemas/cart.schema.ts`
- DTOs: `dto/cart.dto.ts`

## المخطط Cart
- الحقول الأساسية: `userId?`, `deviceId?`, `status` (active|abandoned|converted|expired)
- عناصر السلة `items[]` مع `variantId`, `qty`, ولقطات `productSnapshot`, `pricing`
- ملخص تسعير `pricingSummary { subtotal, total, itemsCount, ... }`
- تتبع الهجر: `lastActivityAt`, `isAbandoned`, `abandonmentEmailsSent`, `lastAbandonmentEmailAt`
- التحويل: `convertedToOrderId`, `convertedAt`
- إنتهاء الصلاحية: `expiresAt`
- فهارس للأداء على `userId/deviceId/status/updatedAt/...`

## الخدمة CartService (أهم الدوال)
- سلة المستخدم:
  - `getUserCart(userId)`
  - `addUserItem(userId, variantId, qty)`
  - `updateUserItem(userId, itemId, qty)`
  - `removeUserItem(userId, itemId)`
  - `clearUserCart(userId)`
- سلة الضيف (deviceId):
  - `getGuestCart(deviceId)`، `addGuestItem(...)`، `updateGuestItem(...)`، `removeGuestItem(...)`, `clearGuestCart(...)`
- الدمج: `merge(deviceId, userId)` لنقل عناصر الضيف إلى المستخدم
- المعاينة: `previewUser(userId, currency, accountType?)`, `previewGuest(deviceId, currency, accountType?)`, و`previewByCart(...)`
- العربات المتروكة (إدارة):
  - `findAbandonedCarts(hoursInactive)`
  - `sendAbandonmentReminder(cartId)`
  - `processAbandonedCarts()` → `{ processed, emailsSent }`
- الصيانة/التنظيف:
  - `cleanupExpiredCarts()` → حذف بالاعتماد على `expiresAt`
  - `deleteOldConvertedCarts(days)` → حذف العربات المحوّلة الأقدم من n يوم

ملاحظات المعاينة: تأخذ في الاعتبار أسعار `VariantPrice`, العروض الترويجية (إن وُصلت خدمة Promotions اختيارياً), وخصم التاجر من قدرات المستخدم (عبر `Capabilities`).

## المجدول CartCronService
- كل ساعة: `processAbandonedCarts()` وتسجيل عدد المعالَج والمرسَل
- يومياً 2AM: `cleanupExpiredCarts()`
- أسبوعياً: `deleteOldConvertedCarts(90)`

## نقاط النهاية الإدارية (admin-cart.controller.ts)
- GET `admin/carts/abandoned?hours=24&limit=50`: إحضار سلال متروكة مع حساب إجمالي قيمة تقريبية
- POST `admin/carts/send-reminders`: إرسال تذكيرات جماعية
- POST `admin/carts/:id/send-reminder`: إرسال تذكير لعربة محددة
- GET `admin/carts/analytics`: Placeholder للأناليتكس (قابل للتطوير)

## نقاط النهاية للمستخدم/الضيف
- راجع `cart.controller.ts` و`guest-cart.controller.ts` لعمليات إضافة/تحديث/حذف العناصر وجلب السلة.
