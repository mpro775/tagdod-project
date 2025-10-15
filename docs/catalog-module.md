## موديول الكتالوج (Catalog Module)

### ما الهدف؟
- **الغرض**: توحيد إدارة الكتالوج (منتجات، متغيرات، وأسعار المتغيرات) وتقديم قراءات عامة سريعة عبر الكاش، مع عمليات إدارية متماسكة وتنظيف كاش ذكي عند التحديثات.
- **المكان**: `backend/src/modules/catalog/`.

### المكونات
- **CatalogService**: منطق إنشاء/تحديث المنتجات والمتغيرات والأسعار، مع إدارة الكاش.
- **PublicController**: واجهات عامة للاستعلام عن قوائم المنتجات وتفاصيل منتج.
- **AdminController**: واجهات إدارية لإنشاء/تحديث منتج، إضافة/تحديث متغير، وضبط أسعار المتغيرات.
- **Schemas**: `product.schema.ts`, `variant.schema.ts`, `variant-price.schema.ts`.
- **CacheService**: تخزين مؤقت لنتائج القوائم والتفاصيل.

### أهم الوظائف (CatalogService)
- المنتجات:
  - `createProduct(dto)`: إنشاء منتج مع توليد `slug` وتنظيف كاش القوائم.
  - `updateProduct(id, patch)`: تحديث منتج وتنظيف كاش القوائم وتفاصيل المنتج المحدّد.
- المتغيرات:
  - `addVariant(dto)`: إضافة متغير وربط تنظيف كاش المنتج المرتبط.
  - `updateVariant(id, patch)`: تحديث متغير وتنظيف كاش المنتج المرتبط.
- الأسعار:
  - `setVariantPrice(dto)`: إنشاء/تحديث سعر متغير بحسب `variantId` + `currency` ثم تنظيف كاش المنتج المرتبط.
- قراءات عامة:
  - `listProducts({ page, limit, search, categoryId, brandId })`: قائمة مصفحة مع كاش `products:list:*`.
  - `getProduct(productId, currency?)`: تفاصيل المنتج + المتغيرات + الأسعار مع كاش `product:detail:*`.

### الـ Endpoints المتوقعة
- عامة (Public):
  - `GET /catalog/products?page=&limit=&search=&categoryId=&brandId=`
  - `GET /catalog/products/:id?currency=`
- إدارية (Admin):
  - `POST /admin/catalog/products` إنشاء منتج
  - `PATCH /admin/catalog/products/:id` تحديث منتج
  - `POST /admin/catalog/variants` إضافة متغير
  - `PATCH /admin/catalog/variants/:id` تحديث متغير
  - `POST /admin/catalog/variant-prices` ضبط سعر متغير

ملاحظة: قد تختلف المسارات بدقة حسب تعريف الكنترولرز لديك، لكن الخدمات المذكورة موجودة.

### أمثلة استخدام
- قائمة منتجات مع بحث بسيط:
```http
GET /catalog/products?page=1&limit=20&search=iphone&categoryId=cat_123&brandId=brand_456
```

- تفاصيل منتج مع أسعار المتغيرات بعملة محددة:
```http
GET /catalog/products/664a9f...abc?currency=YER
```

- إضافة سعر لمتغير (Admin):
```json
POST /admin/catalog/variant-prices
{
  "variantId": "66aa...ef1",
  "currency": "YER",
  "amount": 1999,
  "wholesaleAmount": 1799,
  "compareAt": 2299,
  "moq": 1
}
```

### إدارة الكاش
- قوائم المنتجات: تحفظ تحت مفاتيح مثل `products:list:${page}:${limit}:${search}:${categoryId}:${brandId}` لمدة 5 دقائق.
- تفاصيل المنتج: تحفظ تحت `product:detail:${productId}:${currency|all}` لمدة 10 دقائق.
- عند أي تعديل مرتبط بمنتج/متغير/سعر، تستدعي الخدمة `clearProductCaches(productId?)` لمسح المفاتيح ذات الصلة.

### لماذا هذا الموديول مهم رغم وجود المنتجات/الفئات؟
- **توحيد الترابط** بين كيان المنتج ومتغيراته وأسعاره في مكان واحد.
- **أداء أعلى** عبر طبقة كاش للقراءات الشائعة في صفحات المتجر.
- **اتساق البيانات** مع تنظيف كاش مركزي عند كل تعديل يؤثر على عرض المنتج للعميل.


