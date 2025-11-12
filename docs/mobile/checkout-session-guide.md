## Checkout Session Integration Guide

### ما الجديد
- `POST /orders/checkout/session` يعيد جلسة دفع موحدة تتضمن: معاينة السلة، الخصومات، طرق الدفع، أهلية الدفع عند الاستلام، العناوين، وأسعار الصرف.
- الاستجابة تحتوي هيكلًا واحدًا `session` يمكن تخزينه في الواجهة لتغذية جميع أقسام الشاشة بدون استدعاءات إضافية.
- `POST /orders/checkout/preview` ما زال متاحًا لتحديث الملخص السعري بعد تعديل القسائم فقط.

### استدعاء جلسة الدفع
- **Endpoint**: `POST /orders/checkout/session`
- **Body**
  - `currency` (إجباري): `YER | SAR | USD`
  - `couponCode` (اختياري): كوبون واحد (للتوافق القديم)
  - `couponCodes` (اختياري): قائمة أكواد لتطبيقها تراكمياً
- **Response**
  - `session.cart` → عناصر السلة، `pricingSummaryByCurrency`, `totalsInAllCurrencies`
  - `session.totals` → `subtotal`, `shipping`, `total`, `currency`
  - `session.discounts` → تفصيل الخصومات والقسائم المفعّلة
  - `session.paymentOptions` → خيارات الدفع والمحافظ، حالة COD، إحصائيات الطلبات
  - `session.codEligibility` و `session.customerOrderStats` → للاستخدام المباشر في شريط التقدم
  - `session.addresses` → العناوين النشطة مع حالة `isDefault`
  - `session.exchangeRates` (اختياري) → أسعار الصرف وآخر تحديث

### تدفق الشاشة المقترح
- عند فتح شاشة الدفع:
  1. استدعِ `POST /orders/checkout/session` مرّة واحدة.
  2. خزّن نتيجة `session` في الحالة المحلية (state) لتغذية الأقسام التالية:
     - اختيار العنوان من `session.addresses`.
     - عرض طرق الدفع والمحافظ من `session.paymentOptions.localPaymentProviders`.
     - إبراز تقدم COD باستخدام `session.codEligibility`.
     - عرض الإجماليات والأصناف مباشرة من `session.totals` و `session.cart.items`.
  3. إذا احتجت عرض أسعار بعملة أخرى، استخدم القيم الجاهزة في `session.cart.totalsInAllCurrencies`.

- عند إضافة/إزالة كوبون:
  1. حدّث قائمة الأكواد في الحالة المحلية.
  2. استدعِ `POST /orders/checkout/preview` مع نفس الحقول (`currency`, `couponCode`, `couponCodes`).
  3. استبدل فقط أقسام الأسعار/الخصومات باستخدام الاستجابة (`preview`, `discounts`, `couponDiscount`).
  4. لا تعاود طلب بقية البيانات ما لم تتغير (العناوين، طرق الدفع، الأهلية).

- عند تغيير العنوان أو طريقة الدفع، استخدم البيانات المخزنة مسبقًا. الاستدعاء الجديد ضروري فقط إذا تغيّر المستخدم أو العملة.

### تنفيذ الطلب
- قبل استدعاء `POST /orders/checkout/confirm` جهّز الحقول التالية من الجلسة:
  - `deliveryAddressId` ← العنوان المختار (`session.addresses`).
  - `paymentMethod` و `localPaymentAccountId` / `paymentProvider` من `session.paymentOptions`.
  - نفس مجموعة القسائم المستخدمة في المعاينة لضمان تطابق الأسعار.
  - `currency` كما في الجلسة الحالية.

### ملاحظات الأداء
- احتفظ بنتيجة الجلسة في الذاكرة لتقليل عدد الاستدعاءات.
- استعمل مؤقت قصير لإعادة جلب الجلسة فقط عند:
  - تبديل المستخدم.
  - تبديل العملة.
  - تعديل السلة في شاشة أخرى (أعد مزامنة السلة ثم اطلب جلسة جديدة).

### نقاط تحقق للمطور
- [ ] اختبار الاستجابة بحالات: بدون قسائم، قسيمة واحدة، عدة قسائم.
- [ ] التحقق من عرض قيم COD والحد المتبقي من `session.codEligibility`.
- [ ] التأكد من أن الأزرار تتفاعل فورًا باستخدام البيانات المحلية بدون إعادة تحميل الشاشة.
- [ ] تسجيل أي أخطاء HTTP مع `requestId` (إن وجد في الهيدر) لتسهيل التتبع backend.

