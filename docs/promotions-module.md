## موديول العروض والتسعير (Promotions Module)

### ما الهدف؟
- **الغرض**: إدارة قواعد التسعير والعروض (Price Rules) بتوقيت وأولوية وشروط متعددة، وتحديد السعر الفعّال بعد الخصومات.
- **نطاق**: CRUD لقواعد السعر، معاينة تأثير قاعدة، حساب سعر فعّال لمنتج.
- **المكان**: `backend/src/modules/promotions/`.

### المكونات
- **PromotionsModule**: تهيئة مخطط `PriceRule` وتوفير الخدمة والتحكمات.
- **PromotionsService**: إنشاء/تحديث/تفعيل/تعطيل/حذف قواعد، واستعلام القواعد وتطبيق التأثيرات.
- **Admin Controller**: واجهات إدارية لإدارة القواعد.
- **Public/Integration**: استهلاك التسعير عبر واجهات التسعير العامة مثل `GET /pricing/variant`.

### مخطط PriceRule (مختصر)
- الحالة والمدة: `active`, `startAt`, `endAt`.
- الشروط: `categoryId`, `productId`, `variantId`, `brandId`, `currency`, `minQty`, `accountType`.
- التأثيرات: `percentOff`, `amountOff`, `specialPrice`, `badge`, `giftSku`.
- الأولوية: `priority` (الأعلى أولًا).

### نقاط الدخول (Endpoints)
- إداري:
  - `POST /admin/promotions/rules` إنشاء قاعدة.
  - `PATCH /admin/promotions/rules/:id` تحديث قاعدة.
  - `GET /admin/promotions/rules` قائمة القواعد (مرتبة بالأولوية).
  - `POST /admin/promotions/rules/:id/toggle` تبديل التفعيل.
  - `POST /admin/promotions/preview` معاينة تأثير قاعدة على متغير.

- عام/تكامل:
  - `GET /pricing/variant?variantId=&currency=&qty=&accountType=` حساب سعر فعّال لمتغير.

### منطق التسعير باختصار
- جلب السعر الأساسي من `VariantPrice` (أو خدمة التسعير/الكتالوج)، ثم:
  - البحث عن القواعد النشطة ضمن المدة.
  - مطابقة الشروط (عملة، كمية، نوع حساب، متغير/منتج/فئة/علامة).
  - اختيار القاعدة الأفضل بالأولوية أو الأعلى توفيرًا.
  - تطبيق التأثير: `specialPrice` أو `percentOff` أو `amountOff`، مع شارة `badge` أو هدية `giftSku` عند الحاجة.

### أمثلة الاستخدام
- خصم 20% لفئة:
```json
{
  "priority": 10,
  "startAt": "2024-01-01T00:00:00Z",
  "endAt": "2024-12-31T23:59:59Z",
  "conditions": { "categoryId": "..." },
  "effects": { "percentOff": 20, "badge": "خصم 20%" }
}
```

- سعر خاص لعملاء الجملة بكمية دنيا:
```json
{
  "priority": 50,
  "conditions": { "accountType": "wholesale", "minQty": 10 },
  "effects": { "specialPrice": 15.99 }
}
```

### التكامل مع Banners وPricing
- يمكن ربط البنرات بقواعد السعر أو الكوبونات لإبراز الحملات.
- مخرجات القواعد تُستهلك في موديول التسعير لحساب السعر النهائي للمستخدم.


