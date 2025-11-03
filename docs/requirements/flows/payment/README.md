# تدفقات الدفع (Payment Flows)

## الملفات المتاحة
- `webhook.mmd` - مخطط معالجة Webhook الدفع
- `inventory-payment-integration.mmd` - مخطط تكامل المخزون مع الدفع

## شرح التدفقات

### 1. نظام الدفع الأساسي (Basic Payment System)
- **طرق الدفع:** COD (الدفع عند الاستلام) و ONLINE (الدفع الإلكتروني)
- **العملات:** دعم YER, SAR, USD
- **الأمان:** توقيع HMAC للتحقق من الدفع الإلكتروني
- **التتبع:** تتبع حالة الطلبات والمدفوعات

### 2. دفع عند الاستلام (COD Payment)
- **التأكيد الفوري:** تأكيد الطلب فوراً عند اختيار COD
- **تحديث الحالة:** تحديث حالة الطلب إلى CONFIRMED
- **الإشعارات:** إرسال إشعارات التأكيد للمستخدم
- **عدم الحاجة لـ webhook:** لا يحتاج لانتظار تأكيد خارجي

### 3. الدفع الإلكتروني (Online Payment)
- **إنشاء Intent:** إنشاء معرف دفع فريد مع توقيع أمني
- **التوقيع:** توقيع HMAC للتحقق من صحة البيانات
- **الإرجاع:** إرجاع payment intent للمستخدم
- **انتظار Webhook:** انتظار تأكيد الدفع عبر webhook

### 4. معالجة Webhooks (Webhook Processing)
- **الاستقبال:** استقبال webhooks من مقدمي الخدمة
- **التحقق:** التحقق من توقيع الطلب
- **المعالجة:** تحديث حالة الطلب حسب نتيجة الدفع
- **الأحداث:** معالجة SUCCESS و FAILED
- **ملاحظة:** BANK_TRANSFER لا يستخدم webhooks - يتم المطابقة يدوياً

### 4.1. الدفع المحلي (Local Payment - BANK_TRANSFER)
- **اختيار الحساب:** العميل يختار حساب بنكي/محفظة محلية
- **إدخال المرجع:** العميل يدخل رقم الحوالة/المرجع
- **التحقق:** النظام يتحقق من صحة الحساب وتطابق العملة
- **المطابقة:** الإدارة تطابق الدفع يدوياً من لوحة التحكم
- **القبول/الرفض:** نظام تلقائي يقارن المبلغ المطابق مع المطلوب

### 5. إدارة حالة الطلبات (Order Status Management)
- **نجح الدفع:** تحديث حالة الطلب إلى CONFIRMED
- **فشل الدفع:** تحديث حالة الطلب إلى PAYMENT_FAILED
- **الإشعارات:** إرسال إشعارات للمستخدمين
- **التتبع:** حفظ جميع تغييرات الحالة

### 6. تكامل المخزون (Inventory Integration)
- **تحديث المخزون:** تحديث كميات المخزون عند تأكيد الطلب
- **التسجيل:** تسجيل تغييرات المخزون
- **الإشعارات:** إشعارات للمنتجات التي نفد مخزونها

## هيكل البيانات

### حقول الطلب الأساسية (Order Schema)
- `orderNumber`: رقم الطلب الفريد (string) - مطلوب
- `status`: حالة الطلب (enum: OrderStatus) - افتراضي DRAFT
- `paymentMethod`: طريقة الدفع (enum: PaymentMethod) - مطلوب عند التأكيد
- `paymentStatus`: حالة الدفع (enum: PaymentStatus) - افتراضي PENDING
- `paymentIntentId`: معرف نية الدفع (string) - للدفع الإلكتروني (ONLINE)
- `paymentProvider`: مقدم خدمة الدفع (string) - اختياري
- `localPaymentAccountId`: معرف حساب الدفع المحلي (ObjectId) - للدفع المحلي (BANK_TRANSFER)
- `paymentReference`: رقم الحوالة/المرجع (string) - للدفع المحلي
- `verifiedPaymentAmount`: المبلغ المطابق (number) - بعد المطابقة اليدوية
- `verifiedPaymentCurrency`: العملة المطابقة (string) - بعد المطابقة اليدوية
- `paymentVerifiedAt`: تاريخ المطابقة (Date) - بعد المطابقة اليدوية
- `paymentVerifiedBy`: من قام بالمطابقة (ObjectId) - بعد المطابقة اليدوية
- `paymentVerificationNotes`: ملاحظات المطابقة (string) - اختياري
- `currency`: العملة (string) - مطلوب
- `subtotal`: المجموع الفرعي (number) - مطلوب
- `taxAmount`: مبلغ الضريبة (number) - مطلوب
- `shippingAmount`: مبلغ الشحن (number) - مطلوب
- `discountAmount`: مبلغ الخصم (number) - افتراضي 0
- `totalAmount`: المجموع الإجمالي (number) - مطلوب

### حقول العناصر (Order Items)
- `productId`: معرف المنتج (ObjectId) - مطلوب
- `variantId`: معرف المتغير (ObjectId) - مطلوب
- `sku`: رمز المنتج (string) - اختياري
- `name`: اسم المنتج (string) - مطلوب
- `quantity`: الكمية (number) - مطلوب
- `unitPrice`: سعر الوحدة (number) - مطلوب
- `totalPrice`: السعر الإجمالي (number) - مطلوب
- `imageUrl`: رابط الصورة (string) - اختياري

### حقول العناوين والشحن (Shipping Fields)
- `shippingMethod`: طريقة الشحن (enum: ShippingMethod) - مطلوب
- `deliveryAddressId`: معرف عنوان التسليم (ObjectId) - مطلوب
- `billingAddressId`: معرف عنوان الفوترة (ObjectId) - اختياري

### حقول التتبع والملاحظات (Tracking Fields)
- `notes`: ملاحظات الطلب (string) - اختياري
- `customerNotes`: ملاحظات العميل (string) - اختياري
- `internalNotes`: ملاحظات داخلية (string) - اختياري
- `trackingNumber`: رقم التتبع (string) - اختياري

### حقول التوقيت (Timing Fields)
- `createdAt`: تاريخ الإنشاء (Date) - تلقائي
- `updatedAt`: تاريخ آخر تحديث (Date) - تلقائي
- `confirmedAt`: تاريخ التأكيد (Date) - اختياري
- `shippedAt`: تاريخ الشحن (Date) - اختياري
- `deliveredAt`: تاريخ التسليم (Date) - اختياري

### حقول Webhook (Webhook DTO)
- `intentId`: معرف نية الدفع (string) - مطلوب
- `status`: حالة الدفع (SUCCESS/FAILED) (string) - مطلوب
- `amount`: المبلغ (number) - مطلوب
- `signature`: التوقيع (string) - مطلوب

### طرق الدفع المتاحة (PaymentMethod)
- **COD** - الدفع عند الاستلام
- **ONLINE** - الدفع الإلكتروني (يستخدم Payment Intent و Webhooks)
- **WALLET** - المحفظة
- **BANK_TRANSFER** - التحويل البنكي (الدفع المحلي - يتطلب مطابقة يدوية)

### حالات الدفع المتاحة (PaymentStatus)
- **PENDING** - في الانتظار
- **AUTHORIZED** - مصرح به
- **PAID** - تم الدفع
- **FAILED** - فشل الدفع
- **REFUNDED** - تم الاسترداد
- **PARTIALLY_REFUNDED** - تم الاسترداد جزئياً
- **CANCELLED** - ملغي

### حالات الطلب المتاحة (OrderStatus)
- **DRAFT** - مسودة
- **PENDING_PAYMENT** - انتظار الدفع
- **CONFIRMED** - مؤكد
- **PAYMENT_FAILED** - فشل الدفع
- **PROCESSING** - قيد المعالجة
- **READY_TO_SHIP** - جاهز للشحن
- **SHIPPED** - تم الشحن
- **OUT_FOR_DELIVERY** - في الطريق للتسليم
- **DELIVERED** - تم التسليم
- **COMPLETED** - مكتمل
- **ON_HOLD** - معلق
- **CANCELLED** - ملغي
- **REFUNDED** - مسترد
- **PARTIALLY_REFUNDED** - مسترد جزئياً
- **RETURNED** - مرتجع

## API Endpoints المتاحة

### معالجة الطلبات (Order Controller)
- **POST /checkout/preview** - معاينة الطلب قبل التأكيد
- **POST /checkout/confirm** - تأكيد الطلب ومعالجة الدفع
- **GET /orders** - قائمة طلبات المستخدم مع فلترة
- **GET /orders/recent** - الطلبات الأخيرة للمستخدم
- **GET /orders/:id** - تفاصيل طلب محدد
- **GET /orders/:id/track** - تتبع حالة الطلب
- **POST /orders/:id/cancel** - إلغاء طلب
- **POST /orders/:id/rate** - تقييم الطلب بعد التسليم
- **POST /orders/:id/notes** - إضافة ملاحظات للطلب
- **GET /orders/stats/summary** - إحصائيات الطلبات

### معالجة Webhooks (Webhook Controller)
- **POST /webhooks/payment** - استقبال webhooks الدفع
- **POST /webhooks/inventory** - تحديثات المخزون عبر webhook

## DTOs المتاحة

### معاينة الطلب (Checkout DTOs)
- `CheckoutPreviewDto`: معاينة الطلب
  - `currency`: العملة (YER/SAR/USD) (required)
  - `couponCode`: كود الكوبون (optional)

### تأكيد الطلب (Checkout DTOs)
- `CheckoutConfirmDto`: تأكيد الطلب
  - `deliveryAddressId`: معرف عنوان التسليم (required)
  - `currency`: العملة (required)
  - `paymentMethod`: طريقة الدفع (COD/ONLINE/WALLET/BANK_TRANSFER) (required)
  - `paymentProvider`: مقدم خدمة الدفع (optional)
  - `localPaymentAccountId`: معرف حساب الدفع المحلي (required إذا paymentMethod = BANK_TRANSFER)
  - `paymentReference`: رقم الحوالة/المرجع (required إذا paymentMethod = BANK_TRANSFER)
  - `billingAddressId`: معرف عنوان الفوترة (optional)
  - `couponCode`: كود الكوبون (optional)
  - `notes`: ملاحظات العميل (optional)

### مطابقة الدفع المحلي (Payment Verification DTOs)
- `VerifyPaymentDto`: مطابقة الدفع المحلي
  - `verifiedAmount`: المبلغ المطابق (required)
  - `verifiedCurrency`: العملة المطابقة (YER/SAR/USD) (required)
  - `notes`: ملاحظات المطابقة (optional)

### إدارة الطلبات (Order DTOs)
- `ListOrdersDto`: قائمة الطلبات
  - `page`: رقم الصفحة (optional)
  - `limit`: عدد العناصر (optional)
  - `status`: فلترة حسب الحالة (optional)
  - `paymentStatus`: فلترة حسب حالة الدفع (optional)
  - `search`: البحث في رقم الطلب (optional)
  - `fromDate`: تاريخ البداية (optional)
  - `toDate`: تاريخ النهاية (optional)

- `CancelOrderDto`: إلغاء الطلب
  - `reason`: سبب الإلغاء (optional)

- `RateOrderDto`: تقييم الطلب
  - `rating`: التقييم (1-5) (required)
  - `comment`: التعليق (optional)

- `AddOrderNotesDto`: إضافة ملاحظات
  - `notes`: الملاحظات (required)

### Webhook DTOs
- `WebhookDto`: webhook الدفع
  - `intentId`: معرف نية الدفع (required)
  - `status`: حالة الدفع (SUCCESS/FAILED) (required)
  - `amount`: المبلغ (required)
  - `signature`: التوقيع (required)

## نقاط مهمة
- **نظام طلبات موحد:** إدارة شاملة لحالة الطلبات مع State Machine
- **دعم طرق دفع متعددة:** COD، Online، Wallet، Bank Transfer (محلي)
- **الدفع المحلي:** نظام كامل لإدارة حسابات البنوك والمحافظ المحلية
- **مطابقة يدوية:** نظام مطابقة الدفع المحلي من لوحة التحكم
- **قبول/رفض تلقائي:** مقارنة تلقائية للمبلغ المطابق مع المطلوب
- **توقيع أمني:** توقيع HMAC للتحقق من الدفع الإلكتروني
- **تتبع حالة شامل:** 15 حالة مختلفة للطلبات مع انتقالات منطقية
- **معالجة webhooks:** استقبال ومعالجة تأكيدات الدفع الإلكتروني (لـ ONLINE فقط)
- **تكامل المخزون:** تحديث تلقائي للمخزون عند تأكيد الطلبات
- **إشعارات ذكية:** إشعارات تلقائية لجميع تغييرات حالة الطلب
- **إدارة العملات:** دعم YER، SAR، USD مع حسابات دقيقة
- **حسابات متعددة:** دعم عدة حسابات لنفس البنك (كل حساب بعملة)
- **عرض مجمع:** عرض الحسابات مجمعة حسب اسم البنك/المحفظة
- **نظام تقييم:** تقييم الطلبات بعد التسليم
- **تتبع شامل:** حفظ جميع التواريخ والملاحظات والتغييرات
