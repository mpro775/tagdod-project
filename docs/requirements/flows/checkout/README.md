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
- **حالات الطلب:** 15 حالة مختلفة مع State Machine متقدم (DRAFT, PENDING_PAYMENT, CONFIRMED, etc.)
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
- **GET /orders/:id/tracking** - تتبع الطلب
- **POST /orders/:id/cancel** - إلغاء الطلب
- **POST /orders/:id/rate** - تقييم الطلب
- **POST /orders/:id/notes** - إضافة ملاحظات للطلب

### إدارة الطلبات (للمديرين)
- **GET /admin/orders** - قائمة جميع الطلبات
- **GET /admin/orders/:id** - تفاصيل طلب محدد
- **PATCH /admin/orders/:id/status** - تحديث حالة الطلب
- **POST /admin/orders/:id/ship** - شحن الطلب
- **POST /admin/orders/:id/refund** - استرداد الطلب
- **POST /admin/orders/:id/notes** - إضافة ملاحظات للطلب
- **POST /admin/orders/bulk-update** - تحديث طلبات متعددة
- **GET /admin/orders/analytics** - إحصائيات الطلبات

## هيكل البيانات

### حقول الطلب الأساسية
- `orderNumber`: رقم الطلب الفريد (string)
- `userId`: معرف المستخدم (ObjectId)
- `accountType`: نوع الحساب (retail/wholesale/engineer)
- `source`: مصدر الطلب (web/mobile/app)
- `status`: حالة الطلب (enum - 15 حالة مع State Machine)
- `paymentStatus`: حالة الدفع (enum - 7 حالات)
- `statusHistory`: سجل تغييرات الحالة (array)
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
- `couponDetails`: تفاصيل الكوبون (object)
- `autoAppliedCoupons`: كوبونات مطبقة تلقائياً (array)
- `autoDiscountsTotal`: إجمالي الخصومات التلقائية (number)
- `shippingCost`: تكلفة الشحن (number)
- `shippingDiscount`: خصم الشحن (number)
- `shippingMethod`: طريقة الشحن (enum)
- `shippingCompany`: شركة الشحن (string)
- `tax`: الضريبة (number)
- `taxRate`: نسبة الضريبة (number)
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
- `returnInfo`: معلومات الإرجاع (object)
  - `isReturned`: هل تم الإرجاع (boolean)
  - `returnAmount`: مبلغ الإرجاع (number)
  - `returnReason`: سبب الإرجاع (string)
  - `returnedAt`: تاريخ الإرجاع (Date)
  - `returnItems`: عناصر الإرجاع (array)
- `cancelledAt`: تاريخ الإلغاء (Date)
- `cancellationReason`: سبب الإلغاء (string)

### حقول التتبع
- `statusHistory`: سجل تغييرات الحالة (array)
- `metadata`: بيانات إضافية (object)
- `customerNotes`: ملاحظات العميل (string)
- `adminNotes`: ملاحظات الأدمن (string)
- `internalNotes`: ملاحظات داخلية (string)

### حقول الفواتير
- `invoiceNumber`: رقم الفاتورة (string)
- `invoiceUrl`: رابط الفاتورة (string)
- `receiptUrl`: رابط الإيصال (string)

### حقول التقييم
- `ratingInfo`: معلومات التقييم (object)
  - `rating`: التقييم (1-5)
  - `review`: المراجعة (string)
  - `ratedAt`: تاريخ التقييم (Date)

## حالات الطلب المتاحة

### حالات الطلب (OrderStatus)
1. **DRAFT** - مسودة
2. **PENDING_PAYMENT** - انتظار الدفع
3. **CONFIRMED** - مؤكد
4. **PAYMENT_FAILED** - فشل الدفع
5. **PROCESSING** - قيد المعالجة
6. **READY_TO_SHIP** - جاهز للشحن
7. **SHIPPED** - تم الشحن
8. **OUT_FOR_DELIVERY** - في الطريق للتسليم
9. **DELIVERED** - تم التسليم
10. **COMPLETED** - مكتمل
11. **ON_HOLD** - معلق
12. **CANCELLED** - ملغي
13. **REFUNDED** - مسترد
14. **PARTIALLY_REFUNDED** - مسترد جزئياً
15. **RETURNED** - مرتجع

### حالات الدفع (PaymentStatus)
1. **PENDING** - في الانتظار
2. **AUTHORIZED** - مصرح
3. **PAID** - مدفوع
4. **FAILED** - فشل
5. **REFUNDED** - مسترد
6. **PARTIALLY_REFUNDED** - مسترد جزئياً
7. **CANCELLED** - ملغي

## نقاط مهمة
- **State Machine متقدم:** 15 حالة طلب مع تحكم دقيق في التغييرات
- **نظام الدفع المرن:** 4 طرق دفع مع 7 حالات دفع مختلفة
- **نظام الشحن المتكامل:** 4 طرق شحن مع تتبع شامل
- **نظام الكوبونات المتقدم:** كوبونات يدوية وتلقائية مع تفاصيل كاملة
- **نظام الإرجاع والاسترداد:** إدارة متكاملة للإرجاع مع تتبع العناصر
- **نظام التقييم:** تقييم ومراجعات للطلبات
- **تتبع شامل للتغييرات:** Status History مع تتبع الأدوار والأسباب
- **نظام الفواتير:** إنشاء وإدارة الفواتير والإيصالات
- **Metadata المتقدم:** تتبع مصدر الطلب والحملات التسويقية
- **ملاحظات متعددة المستويات:** ملاحظات العميل والأدمن والداخلية
- **Order Items مع Snapshots:** حفظ حالة المنتجات وقت الطلب
- **Delivery Address مع Validation:** عناوين تسليم مع تحقق شامل
