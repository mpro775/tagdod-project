# Coupons Module

يوفّر إنشاء وإدارة القسائم (الكوبونات) مع التحقق والتطبيق والتحليلات، ويخدم واجهات عامة وإدارية.

## المكوّنات
- Controllers:
  - `coupons.public.controller.ts`: عرض القسائم العامة وواجهات القراءة العامة
  - `coupons.admin.controller.ts`: إنشاء/تحديث/حذف/تفعيل/تعطيل وتوليد دفعات قسائم (محمي بالأدوار)
- Service: `coupons.service.ts`
- Schemas: `schemas/coupon.schema.ts`
- DTOs: `dto/coupon.dto.ts`

## المخطط Coupon (مختصر)
- الأساسيات: `code`, `title`, `description`, `type` (percentage|fixed_amount|free_shipping|buy_x_get_y|first_order)
- الحالة والرؤية: `status` (active|inactive|expired|exhausted), `visibility` (public|private|auto_apply)
- الإعدادات: نسبة/مبلغ الخصم، حدود قصوى، النطاق (`appliesTo`: منتجات/فئات/براندات/طلب كامل)
- الشروط: `minOrderAmount`, `minQuantity`, `currency`, `allowedAccountTypes`, `allowedUserIds`, `firstOrderOnly`, `newUsersOnly`
- حدود الاستخدام: `maxTotalUses`, `currentUses`, `maxUsesPerUser`, `oneTimeUse`
- التواريخ: `startDate`, `endDate`
- التحليلات: `stats{ views, applies, successfulOrders, totalRevenue, totalDiscount, failedAttempts }`
- تتبّع المستخدم: `usageHistory[{ userId, usedAt, orderId }]`

## CouponsService (أبرز الوظائف)
- إنشاء وتحديث وحذف:
  - `createCoupon(dto, adminId?)`: يتحقق من تفرّد الكود وصلاحية التواريخ/الخصم، ويُنشئ القسيمة
  - `updateCoupon(id, dto, adminId?)`: تحديث حقول القسيمة مع التحقق من التواريخ عند وجودها
  - `deleteCoupon(id, adminId?)`: حذف منطقي (soft delete)
  - `toggleStatus(id)`: تفعيل/تعطيل القسيمة
- القراءة والترقيم:
  - `listCoupons(dto)`: بحث/فرز/ترقيم مع تحديث تلقائي لحالات المنتهية/المستنفذة
  - `getCouponById(id)`, `getCouponByCode(code)`
- التحقق والتطبيق:
  - `validateCoupon(dto)`: يتحقق من الحالة/التواريخ/العملة/الحد الأدنى/نوع الحساب/المستخدمين المسموحين/نطاق التطبيق… ويحتسب الخصم المقترح ويزيد `stats.views`
  - `applyCouponToOrder(couponCode, orderId, userId, orderAmount, discountAmount)`: يحدّث الإحصاءات وسجل الاستخدام
  - `incrementFailedAttempts(code)`: لاحتساب المحاولات الفاشلة
- القسائم التلقائية:
  - `getAutoApplyCoupons(userId?, accountType?)`: يجلب القسائم `AUTO_APPLY` النشطة ضمن المدة والحدود
- التوليد الدفعي:
  - `bulkGenerateCoupons(dto, adminId?)`: إنشاء دفعات قسائم بكود مبدوء بمقدمة ثابتة مع إعدادات افتراضية

## نقاط النهاية (مختصر)
- عامة (`coupons.public.controller.ts`):
  - GET `coupons/public` (مثال): إرجاع القسائم العامة النشطة
- إدارية (`coupons.admin.controller.ts`): محمية بـ `JwtAuthGuard` و`RolesGuard`
  - POST `admin/coupons` (CreateCouponDto)
  - GET `admin/coupons` (ListCouponsDto: page/limit/search/status/type/visibility/...)
  - GET `admin/coupons/:id`
  - PATCH `admin/coupons/:id` (UpdateCouponDto)
  - DELETE `admin/coupons/:id`
  - PATCH `admin/coupons/:id/toggle-status`
  - POST `admin/coupons/bulk-generate` (BulkGenerateCouponsDto)
  - GET `admin/coupons/:id/analytics`
  - GET `admin/coupons/:id/usage-history`

## قواعد التحقق الأساسية
- التواريخ: `endDate > startDate`
- نسبة الخصم: في المدى (0, 100]
- مبلغ الخصم الثابت: > 0
- Buy X Get Y: وجود `buyQuantity` و`getQuantity`

## ملاحظات
- يتم تحويل الكود إلى uppercase وتتبّع الاستخدامات والإحصاءات بشكل تزايدي داخل الخدمة.
- يوصى بربط الاستدعاءات مع إنشاء الطلب لتحديث `usageHistory` و`stats` بشكل دقيق.
