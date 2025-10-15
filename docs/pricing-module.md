## موديول التسعير (Pricing Module)

### ما الهدف؟
- **الغرض**: حساب أسعار المتغيرات (variants) مع تطبيق العروض والكوبونات، وحساب إجماليات سلة التسوق.
- **يعتمد على**: نماذج Mongoose التالية: `PriceRule`, `VariantPrice`, `Variant`, `Product`.
- **مكان الملفات**: `backend/src/modules/pricing/`.

### المكونات
- **PricingModule**: يقوم بتسجيل مخططات Mongoose وحقنها للاستخدام داخل الخدمة.
- **PricingController**: يعرّف نقاط الدخول (Endpoints) الخاصة بالتسعير.
- **PricingService**: يضم منطق الحساب والفلترة وتطبيق العروض.

### نقاط الدخول (Endpoints)
- **سعر متغير مع العروض**
  - GET `pricing/variant/:variantId`
  - معاملات الاستعلام: `currency`, `quantity`, `accountType`, `couponCode` (اختياري).

- **تسعير السلة**
  - POST `pricing/cart`
  - Body: `items[]`, `currency`, وحقول اختيارية `accountType`, `couponCode`.

- **التحقق من كوبون**
  - GET `pricing/coupon/:code`

### وظائف الخدمة الأساسية (PricingService)
- **calculateVariantPrice(params)**
  - يجلب السعر الأساسي من `VariantPrice` حسب العملة ونوع الحساب (`retail`/`wholesale`).
  - يبحث عن العروض النشطة في `PriceRule` المناسبة لسياق الطلب (متغير/منتج/فئة/علامة/عملة/كمية/نوع الحساب/كوبون).
  - يختار أفضل عرض بناءً على أكبر توفير ثم أعلى أولوية.
  - يعيد: `originalPrice`, `finalPrice`, `discount`, `discountPercentage`, `appliedPromotion`, `badge`, `currency`.

- **calculateCartPricing(items, currency, userId?, accountType?, couponCode?)**
  - يحسب نتائج كل عنصر في السلة باستخدام `calculateVariantPrice`.
  - يحسب `subtotal`, `total`, `totalDiscount` و`totalSavings`.
  - يجمع العروض المطبقة بشكل فريد (حسب `_id`).

- **validateCoupon(couponCode)**
  - يتحقق من وجود الكوبون ونشاطه والإطار الزمني وحدود الاستخدام.
  - يعيد نتيجة صلاحية مع رسالة توضيحية.

### منطق العروض (Promotions)
- يتم فلترة القواعد حسب:
  - تطابق `variantId` أو `productId` أو `categoryId` أو `brandId` عند وجودها.
  - توافق `currency`، تحقيق `minQty`، وتوافق `accountType`.
  - حالة الزمن: `startAt <= now <= endAt`.
  - حدود الاستخدام: رفض عند بلوغ `maxUses`.
- تطبيق التأثيرات المدعومة:
  - `specialPrice`: سعر خاص مباشر.
  - `percentOff`: نسبة خصم.
  - `amountOff`: خصم مبلغ ثابت.

### أمثلة الاستخدام
- سعر متغير:
  - GET: `pricing/variant/VARIANT_ID?currency=YER&quantity=2&accountType=wholesale&couponCode=ABC123`

- تسعير السلة:
  - POST: `pricing/cart`
  - Body:
    ```json
    {
      "items": [{ "variantId": "VARIANT_ID", "quantity": 3 }],
      "currency": "YER",
      "accountType": "retail",
      "couponCode": "ABC123"
    }
    ```

- تحقق كوبون:
  - GET: `pricing/coupon/ABC123`

### ملاحظات تصميمية
- اختيار العرض: أكبر توفير ثم أعلى `priority`.
- أسعار الجملة: يتم استخدام `wholesaleAmount` عند `accountType = 'wholesale'` إن وُجد.
- تجميع العروض في السلة باستخدام `Map` لمنع التكرار.


