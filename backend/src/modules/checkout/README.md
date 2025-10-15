# Checkout Module

يوفّر إنشاء الطلبات من السلة، تتبّع حالة الطلب، إدارة الطلبات للمستخدم والإدارة، والتكامل مع المخزون والقسائم.

## المكونات
- Controllers:
  - `checkout.controller.ts`: نقاط إنشاء الطلب وتأكيد/معاينة الدفع للمستخدم
  - `orders.controller.ts`: قراءة وتتبع وإلغاء وتقييم طلبات المستخدم
  - `admin-orders.controller.ts`: إدارة الطلبات (قائمة/تفاصيل/تحديث حالة/شحن/استرداد)
- Services:
  - `checkout.service.ts`: منطق الإنشاء، المعاينة، الويب هوك، وواجهات الإدارة والمستخدم
  - `orders.service.ts`: تتبع الطلب، إحصاءات المستخدم/الإدارة، التقييم والملاحظات
- Schemas: `schemas/order.schema.ts`, `schemas/reservation.schema.ts`, `schemas/inventory.schema.ts`, `schemas/inventory-ledger.schema.ts`

## مخطط Order (مختصر)
- الحقول: `orderNumber`, `userId`, `status`, `paymentStatus`, `deliveryAddress`, `items[]`, `currency`, `subtotal`, `total`, `coupon*`, `shippingCost`, `tax`, `statusHistory[]`, `paymentIntentId?`, `tracking*`, `estimatedDeliveryDate?`, `metadata{ cartId, source, rating?, review?, ratedAt? }`
- الحالات: pending, confirmed, processing, ready_to_ship, shipped, out_for_delivery, delivered, completed, cancelled, refunded, returned, payment_failed

## CheckoutService (أبرز الوظائف)
- المستخدم:
  - `preview(userId, currency)`: معاينة الأسعار من سلة المستخدم
  - `confirm(userId, currency, method, provider?, addressId?)`: إنشاء الطلب ومعالجة الحجز/الدفع
  - `handleWebhook(intentId, status, amount, signature)`: إتمام/فشل الدفع وتحديث المخزون والحجوزات
  - `getUserOrders(userId, page?, limit?, status?)`: قائمة طلبات المستخدم مع ترقيم
  - `getOrderDetails(orderId, userId?)`: تفاصيل الطلب (يمكن تمرير userId للتقييد)
  - `cancelOrder(orderId, userId, reason)`: إلغاء الطلب إن كان مسموحاً
  - `createOrder(dto, userId)`: مسار مساعد يبني على confirm وفق DTO
- الإدارة:
  - `getAllOrders(page?, limit?, status?, search?)`: بحث وترقيم للطلبات
  - `updateOrderStatus(orderId, newStatus, adminId, notes?)`
  - `shipOrder(orderId, dto, adminId)`
  - `processRefund(orderId, dto, adminId)`

## OrdersService (أبرز الوظائف)
- `getOrderTracking(orderId, userId)`: تتبع الطلب وخط الزمن
- `rateOrder(orderId, userId, dto)`: تقييم الطلب (يضبط metadata.rating/review)
- `addAdminNotes(orderId, notes, adminId)`: إضافة ملاحظات إدارية
- إحصاءات المستخدم: `getOrderStatistics(userId)`
- تحليلات الإدارة: `getAdminAnalytics(days)`

## نقاط النهاية (مختصر)
- المستخدم (`orders.controller.ts`):
  - POST `orders/create` (CheckoutConfirmDto)
  - GET `orders` (ListOrdersDto: page/limit/status)
  - GET `orders/:id`
  - GET `orders/:id/track`
  - POST `orders/:id/cancel` (CancelOrderDto)
  - POST `orders/:id/rate` (RateOrderDto)
  - GET `orders/stats/summary`
- الإدارة (`admin-orders.controller.ts`):
  - GET `admin/orders` (ListOrdersDto)
  - GET `admin/orders/:id`
  - PATCH `admin/orders/:id/status` (UpdateOrderStatusDto)
  - POST `admin/orders/:id/ship` (ShipOrderDto)
  - POST `admin/orders/:id/refund` (RefundOrderDto)
  - POST `admin/orders/:id/notes` ({ notes })

## تكاملات
- المخزون والحجوزات: عند الإنشاء/الدفع/الإلغاء يتم حجز/تثبيت/تحرير الكميات وتسجيل قيود `InventoryLedger`.
- القسائم: عبر `CouponsService` للتحقق والتطبيق وتحديث الإحصائيات.
- الأمن: معظم نقاط المستخدم محمية بـ `JwtAuthGuard`؛ نقاط الإدارة محمية أيضاً بحارس الأدوار.
