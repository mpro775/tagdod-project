# تدفقات الشيك آوت والطلبات (Checkout & Orders Flows)

## الملفات المتاحة
- `checkout-flow.mmd` - مخطط عملية الشيك آوت الكاملة

## شرح التدفقات

### 1. معاينة الطلب (Checkout Preview)
- **التحقق من السلة:** التأكد من توفر جميع العناصر
- **حساب الأسعار:** إعادة حساب الأسعار مع الخصومات
- **العملات:** دعم USD, YER, SAR مع تحويل تلقائي
- **الخصومات:** تطبيق خصومات التاجر والمهندس
- **الكوبونات:** فحص صحة الكوبونات المطبقة
- **الشحن:** حساب تكلفة الشحن حسب المنطقة

### 2. تأكيد الطلب (Order Confirmation)
- **إنشاء الطلب:** حفظ جميع البيانات في قاعدة البيانات
- **رقم الطلب:** توليد رقم فريد (ORD-2024-00001)
- **Snapshot:** حفظ نسخة من المنتجات والأسعار
- **المخزون:** حجز المخزون للطلب
- **المعاملات:** استخدام Database Transactions للأمان

### 3. معالجة الدفع (Payment Processing)
- **COD:** الدفع نقداً عند الاستلام (PENDING status)
- **Online:** الدفع الإلكتروني مع Payment Intent
- **Webhooks:** استقبال تأكيدات الدفع من مزودي الدفع
- **التوقيع:** التحقق من صحة Webhooks بالتوقيع

### 4. إدارة الطلبات (Order Management)
- **حالات الطلب:** 11 حالة مختلفة (PENDING, CONFIRMED, PROCESSING, etc.)
- **تتبع التغييرات:** سجل كامل لتغييرات الحالة
- **الإلغاء:** إلغاء الطلبات مع إرجاع المخزون
- **الاسترداد:** نظام استرداد متقدم مع أسباب

### 5. تتبع الشحن (Shipping Tracking)
- **رقم التتبع:** ربط الطلب بشركة الشحن
- **حالات الشحن:** READY_TO_SHIP, SHIPPED, OUT_FOR_DELIVERY, DELIVERED
- **التقدير:** تقدير تاريخ التسليم
- **التسليم:** تأكيد التسليم مع التاريخ

### 6. نظام التقييمات والمراجعات
- **التقييم:** تقييم الطلب من 1 إلى 5
- **المراجعة:** كتابة مراجعة للطلب
- **التتبع:** ربط التقييم بالطلب

### 7. إدارة المخزون المتقدمة
- **التحفظ:** حجز المخزون أثناء عملية الدفع
- **الدفتر:** سجل كامل لحركات المخزون
- **الانتهاء:** إلغاء التحفظ عند انتهاء الصلاحية
- **التحديث:** تحديث المخزون عند تأكيد الطلب

### 8. نظام الإشعارات
- **تأكيد الطلب:** إشعار إنشاء الطلب
- **تحديث الحالة:** إشعارات تغيير حالة الطلب
- **الشحن:** إشعارات تتبع الشحن
- **التسليم:** تأكيد التسليم

## API Endpoints المتاحة

### معاينة الطلب
- **POST /checkout/preview** - معاينة الطلب مع الأسعار
- **GET /checkout/delivery-options** - خيارات الشحن المتاحة

### تأكيد الطلب
- **POST /checkout/confirm** - تأكيد الطلب وإنشاؤه
- **POST /payments/webhook** - استقبال تأكيدات الدفع

### إدارة الطلبات (للمستخدمين)
- **GET /orders** - قائمة طلبات المستخدم
- **GET /orders/:id** - تفاصيل طلب محدد
- **POST /orders/:id/cancel** - إلغاء الطلب
- **POST /orders/:id/rate** - تقييم الطلب

### إدارة الطلبات (للمديرين)
- **GET /admin/orders** - قائمة جميع الطلبات
- **POST /admin/orders/:id/status** - تحديث حالة الطلب
- **POST /admin/orders/:id/ship** - شحن الطلب
- **POST /admin/orders/:id/refund** - استرداد الطلب

## هيكل البيانات

### حقول الطلب الأساسية
- `orderNumber`: رقم الطلب الفريد (string)
- `userId`: معرف المستخدم (ObjectId)
- `status`: حالة الطلب (enum - 11 حالة)
- `paymentStatus`: حالة الدفع (enum - 4 حالات)
- `currency`: العملة (string)
- `total`: المجموع النهائي (number)

### حقول العنوان
- `deliveryAddress`: عنوان التسليم (object)
  - `addressId`: معرف العنوان (ObjectId)
  - `recipientName`: اسم المستلم (string)
  - `recipientPhone`: رقم المستلم (string)
  - `line1`: العنوان الرئيسي (string)
  - `line2`: العنوان الثانوي (string)
  - `city`: المدينة (string)
  - `region`: المنطقة (string)
  - `country`: الدولة (string)
  - `coords`: الإحداثيات (object)
  - `notes`: ملاحظات (string)

### حقول العناصر
- `items`: عناصر الطلب (array)
  - `productId`: معرف المنتج (ObjectId)
  - `variantId`: معرف التنويع (ObjectId)
  - `qty`: الكمية (number)
  - `basePrice`: السعر الأساسي (number)
  - `discount`: الخصم (number)
  - `finalPrice`: السعر النهائي (number)
  - `lineTotal`: المجموع (number)
  - `currency`: العملة (string)
  - `snapshot`: نسخة من بيانات المنتج (object)

### حقول الأسعار
- `subtotal`: المجموع الفرعي (number)
- `itemsDiscount`: خصم العناصر (number)
- `appliedCouponCode`: الكوبون المطبق (string)
- `couponDiscount`: خصم الكوبون (number)
- `shippingCost`: تكلفة الشحن (number)
- `tax`: الضريبة (number)
- `totalDiscount`: إجمالي الخصم (number)

### حقول الدفع
- `paymentMethod`: طريقة الدفع (string)
- `paymentProvider`: مزود الدفع (string)
- `paymentIntentId`: معرف نية الدفع (string)
- `paidAt`: تاريخ الدفع (Date)

### حقول الشحن
- `shippingMethod`: طريقة الشحن (string)
- `trackingNumber`: رقم التتبع (string)
- `trackingUrl`: رابط التتبع (string)
- `estimatedDeliveryDate`: تاريخ التسليم المتوقع (Date)
- `deliveredAt`: تاريخ التسليم الفعلي (Date)

### حقول الإلغاء والاسترداد
- `isRefunded`: هل تم الاسترداد (boolean)
- `refundAmount`: مبلغ الاسترداد (number)
- `refundReason`: سبب الاسترداد (string)
- `refundedAt`: تاريخ الاسترداد (Date)
- `cancelledAt`: تاريخ الإلغاء (Date)
- `cancellationReason`: سبب الإلغاء (string)

### حقول التتبع
- `statusHistory`: سجل تغييرات الحالة (array)
- `metadata`: بيانات إضافية (object)
- `customerNotes`: ملاحظات العميل (string)
- `adminNotes`: ملاحظات المدير (string)

## حالات الطلب المتاحة

### حالات الطلب (OrderStatus)
1. **PENDING** - في الانتظار
2. **CONFIRMED** - مؤكد
3. **PROCESSING** - قيد المعالجة
4. **READY_TO_SHIP** - جاهز للشحن
5. **SHIPPED** - تم الشحن
6. **OUT_FOR_DELIVERY** - في الطريق للتسليم
7. **DELIVERED** - تم التسليم
8. **COMPLETED** - مكتمل
9. **CANCELLED** - ملغي
10. **REFUNDED** - مسترد
11. **RETURNED** - مرتجع
12. **PAYMENT_FAILED** - فشل الدفع

### حالات الدفع (PaymentStatus)
1. **PENDING** - في الانتظار
2. **PAID** - مدفوع
3. **FAILED** - فشل
4. **REFUNDED** - مسترد

## نقاط مهمة
- **معاينة شاملة:** معاينة الطلب قبل التأكيد
- **معاملات آمنة:** استخدام Database Transactions
- **تتبع شامل:** سجل كامل لتغييرات الحالة
- **مخزون ذكي:** حجز المخزون أثناء الدفع
- **عملات متعددة:** دعم USD, YER, SAR
- **خصومات متقدمة:** خصومات التاجر والمهندس
- **Webhooks آمنة:** التحقق من صحة Webhooks
- **تقييمات:** نظام تقييم ومراجعات
- **إشعارات:** إشعارات شاملة للمستخدمين
- **فهرسة محسنة:** indexes محسنة للأداء السريع
