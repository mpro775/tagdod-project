# Catalog Module

يوفّر إدارة المنتجات والمتغيرات والأسعار مع تخزين مؤقت (Cache) للقراءات العامة.

## المكونات
- Controllers:
  - `public.controller.ts`: استعلامات عامة للمنتجات
  - `admin.controller.ts`: عمليات إدارية (إنشاء/تحديث…)
- Service: `catalog.service.ts`
- Schemas: `schemas/product.schema.ts`, `schemas/variant.schema.ts`, `schemas/variant-price.schema.ts`
- Cache: `shared/cache/cache.service.ts`

## الخدمات الأساسية (CatalogService)
- المنتجات:
  - `createProduct(patch: Partial<Product>)`: إنشاء منتج جديد مع `slugify(name)`
  - `updateProduct(id, patch)`: تحديث وحذف كاش المنتج/القوائم
- المتغيرات:
  - `addVariant(patch: Partial<Variant>)`: إضافة متغير وربط تنظيف الكاش
  - `updateVariant(id, patch)`: تحديث المتغير وتنظيف كاش المنتج المرتبط
- الأسعار:
  - `setVariantPrice(patch: Partial<VariantPrice>)`: إنشاء/تحديث السعر حسب `variantId` + `currency` مع تنظيف الكاش

- قراءات عامة (مع Cache):
  - `listProducts({ page, limit, search, categoryId, brandId })`:
    - يبني استعلامًا نصيًا/تصنيفيًا ويستخدم التخزين المؤقت بمفتاح `products:list:*`
    - يعيد `{ items, meta: { page, limit, total } }`
  - `getProduct(productId, currency?)`:
    - يجلب المنتج والمتغيرات وأسعارها (اختياريًا بعملة محددة)
    - يستخدم الكاش بمفتاح `product:detail:*`

## إدارة الكاش
- `clearProductCaches(productId?)`:
  - عند تمرير `productId`: يحذف `product:detail:${productId}:*` وبعض قوائم المنتجات ذات الصلة
  - عند عدم تمريره: يحذف جميع مفاتيح `products:list:*` و`product:detail:*`
- `clearAllCaches()`: يحذف `products:*` و`product:*`

## ملاحظات
- يتم توليد `slug` للمنتجات باستخدام `slugify` من `shared/utils/slug.util.ts`.
- يتم تسجيل عمليات الكاش عبر `Logger` لتسهيل التشخيص.
