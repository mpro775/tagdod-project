# Phase 5 — Product Details Page Rebuild

## مشروع: تطوير الويب أب إلى متجر ويب احترافي

## المرحلة الخامسة: إعادة بناء صفحة تفاصيل المنتج PDP

---

# 1. الهدف الرئيسي

إعادة بناء صفحة تفاصيل المنتج من صفحة بسيطة أو قريبة من تجربة تطبيق موبايل إلى **صفحة منتج احترافية Web-first** تساعد المستخدم على فهم المنتج واتخاذ قرار الشراء بثقة.

هذه المرحلة تركّز على صفحة المنتج فقط:

- Product Gallery احترافي.
- Purchase Panel واضح.
- اختيار الكمية.
- اختيار المتغيرات إن وجدت.
- معلومات التوفر.
- السعر والخصم.
- إضافة للسلة.
- المفضلة.
- معلومات الضمان والشحن والاسترجاع.
- تبويبات الوصف والمواصفات.
- المنتجات المشابهة.
- Sticky Add to Cart للموبايل فقط.

بعد تنفيذ هذه المرحلة يجب أن تصبح صفحة المنتج صفحة بيع حقيقية، وليست صفحة عرض معلومات بسيطة.

---

# 2. الاعتماد على المراحل السابقة

هذه المرحلة تعتمد على:

## Phase 1 — Storefront Foundation

- `StoreLayout`
- `DesktopHeader`
- `MobileHeader`
- `StoreFooter`
- `Container`
- `Breadcrumbs`

## Phase 2 — Professional Home Page

- أسلوب sections المنظم.
- مكونات الصفحة الرئيسية الجديدة.

## Phase 3 — Product Card System

- `ProductCard`
- `ProductCardCompact`
- `ProductCardHorizontal`
- `ProductCardSkeleton`
- `ProductPrice`
- `ProductBadges`
- product helpers

## Phase 4 — Product Listing & Filters

- صفحات المنتجات والتصنيفات والبحث.
- Query params.
- Product listing components.
- Navigation إلى صفحة المنتج.

المرحلة الخامسة يجب أن تستخدم نظام الكروت من المرحلة الثالثة للمنتجات المشابهة، ولا تعيد بناء ProductCard.

---

# 3. المشكلة الحالية

صفحة تفاصيل المنتج الحالية غالبًا تعاني من:

- تصميم أقرب لتطبيق موبايل.
- معرض صور بسيط.
- لا يوجد Layout احترافي للديسكتوب.
- زر إضافة للسلة مثبت أسفل الشاشة حتى على الديسكتوب.
- تفاصيل المنتج غير منظمة.
- لا توجد تبويبات للوصف والمواصفات.
- لا توجد معلومات ثقة كافية:
  - ضمان.
  - شحن.
  - استرجاع.
  - دعم.
- لا يوجد عرض واضح للمتغيرات.
- لا يوجد Breadcrumb واضح.
- لا توجد منتجات مشابهة بشكل احترافي.
- لا توجد حالات loading/error/empty قوية.
- لا توجد تجربة responsive Web حقيقية.

---

# 4. نطاق المرحلة

## داخل النطاق

يجب تنفيذ التالي:

1. إعادة بناء صفحة تفاصيل المنتج.
2. إنشاء `ProductDetailsPage` أو تحسين الصفحة الحالية.
3. إنشاء `ProductGallery`.
4. إنشاء `ProductPurchasePanel`.
5. إنشاء `ProductQuantitySelector`.
6. إنشاء `ProductVariantSelector` إن كانت المتغيرات موجودة.
7. إنشاء `ProductTrustInfo`.
8. إنشاء `ProductInfoTabs`.
9. إنشاء `ProductSpecifications`.
10. إنشاء `RelatedProductsSection`.
11. إنشاء `RecentlyViewedSection` اختياريًا إذا كان سهلًا.
12. إضافة Breadcrumbs.
13. دعم loading state.
14. دعم error state.
15. دعم not found state.
16. دعم mobile sticky add-to-cart فقط.
17. إزالة أي fixed bottom purchase bar من الديسكتوب.
18. استخدام ProductCard من المرحلة الثالثة للمنتجات المشابهة.
19. إضافة مفاتيح ترجمة عربية وإنجليزية.
20. الحفاظ على منطق السلة الحالي وعدم كسره.

## خارج النطاق

لا تنفذ في هذه المرحلة:

- إعادة بناء السلة.
- إعادة بناء Checkout.
- نظام Reviews backend كامل.
- Quick View.
- نظام Wishlist backend جديد.
- SEO كامل.
- بناء API جديد.
- نظام توصيات ذكي متقدم.
- مقارنة المنتجات.
- نظام أسئلة وأجوبة backend كامل.

يمكن تجهيز UI placeholders آمنة فقط للميزات المستقبلية دون إظهار بيانات وهمية للمستخدم النهائي.

---

# 5. الملفات الحالية المهمة للفحص

افحص قبل التنفيذ:

```txt
src/features/product/ProductPage.tsx
src/features/product/*
src/features/products/*
src/components/ecommerce/product-card/*
src/components/shared/ProductCard.tsx
src/components/layout/Breadcrumbs.tsx
src/components/layout/Container.tsx
src/features/cart/*
src/stores/*
src/services/*
src/api/*
src/hooks/*
src/types/*
src/config/routes.tsx
src/core/i18n/*
```

ابحث عن:

```txt
getProductById
getProductBySlug
getRelatedProducts
getProductsByCategory
productService
cartStore
addToCart
Product
ProductVariant
images
gallery
stock
sku
brand
category
description
specifications
attributes
variants
price
oldPrice
compareAtPrice
discountPrice
```

لا تفترض أسماء الحقول. افحص الـ types والـ response الفعلي.

---

# 6. الهيكل المقترح للملفات

أنشئ مجلدًا واضحًا لتفاصيل المنتج:

```txt
src/features/product/details/
├── ProductDetailsPage.tsx
├── ProductDetailsSkeleton.tsx
├── ProductNotFoundState.tsx
├── ProductDetailsErrorState.tsx
├── ProductGallery.tsx
├── ProductGalleryThumbnail.tsx
├── ProductPurchasePanel.tsx
├── ProductQuantitySelector.tsx
├── ProductVariantSelector.tsx
├── ProductTrustInfo.tsx
├── ProductInfoTabs.tsx
├── ProductSpecifications.tsx
├── ProductDescription.tsx
├── ProductMobileStickyBar.tsx
├── RelatedProductsSection.tsx
├── RecentlyViewedSection.tsx
├── productDetails.helpers.ts
├── productDetails.types.ts
└── index.ts
```

إذا كان المشروع يستخدم هيكلًا مختلفًا، التزم بنمط المشروع الحالي لكن حافظ على التقسيم المنطقي.

---

# 7. التصميم العام المطلوب

## Desktop Layout

```txt
ProductDetailsPage
├── Breadcrumbs
├── Product Main Area
│   ├── ProductGallery
│   └── ProductPurchasePanel
├── ProductInfoTabs
├── RelatedProductsSection
└── RecentlyViewedSection optional
```

## Desktop Main Area

```txt
Grid:
- Left: Gallery
- Right: Purchase Panel
```

مثال:

```txt
grid grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] gap-8
```

أو:

```txt
grid lg:grid-cols-2 gap-8
```

## Mobile Layout

```txt
ProductDetailsPage
├── Breadcrumbs compact
├── ProductGallery
├── ProductPurchasePanel
├── ProductInfoTabs
├── RelatedProducts
└── ProductMobileStickyBar
```

مهم جدًا:

- Sticky Add to Cart يظهر فقط على الموبايل.
- لا يظهر على الديسكتوب.
- لا يغطي BottomNav بطريقة سيئة.

---

# 8. المتطلبات التفصيلية

## 8.1 ProductDetailsPage

### الهدف

المكون الرئيسي لصفحة المنتج.

### يجب أن يدعم

- قراءة id أو slug من route.
- جلب بيانات المنتج.
- loading state.
- error state.
- not found state.
- breadcrumb.
- gallery.
- purchase panel.
- info tabs.
- related products.

### ملاحظة

إذا route الحالي يستخدم id:

```txt
/products/:id
```

استخدمه.

إذا يستخدم slug:

```txt
/products/:slug
```

استخدمه.

لا تكسر الروابط الحالية، ويمكن إضافة redirect إذا تغير route.

---

## 8.2 ProductGallery

### الهدف

عرض صور المنتج بشكل احترافي.

### يجب أن يحتوي

- صورة رئيسية كبيرة.
- صور مصغرة thumbnails.
- اختيار صورة عند الضغط على thumbnail.
- fallback إذا لا توجد صور.
- alt مناسب.
- lazy loading للصور الثانوية.
- aspect ratio ثابت.
- دعم RTL.

### Desktop

- thumbnails بجانب الصورة أو أسفلها.
- الصورة كبيرة وواضحة.
- يمكن إضافة zoom بسيط عند hover إن كان سهلًا.

### Mobile

- يمكن عرض الصور كسلايدر بسيط أو صورة رئيسية مع thumbnails أسفلها.
- لا تضف مكتبة slider ثقيلة إن لم تكن موجودة.
- لا تجعل الصور تسبب overflow.

### ممنوع

- ممنوع كسر الصفحة إذا المنتج بدون صور.
- ممنوع استخدام صور وهمية خارجية غير موثوقة.
- ممنوع بناء lightbox معقد إذا سيؤخر المرحلة.

---

## 8.3 ProductPurchasePanel

### الهدف

لوحة الشراء الرئيسية التي تقنع المستخدم وتسمح له بالشراء.

### يجب أن تحتوي

- اسم المنتج.
- البراند إن وجد.
- التصنيف إن وجد.
- SKU إن وجد.
- السعر الحالي.
- السعر قبل الخصم إن وجد.
- نسبة الخصم إن وجدت.
- حالة التوفر.
- اختيار المتغيرات إن وجدت.
- اختيار الكمية.
- زر إضافة للسلة.
- زر المفضلة إن كان مدعومًا.
- معلومات مختصرة عن الشحن/الضمان.
- مشاركة المنتج اختياريًا.

### التصميم

- Card أو panel واضح.
- على الديسكتوب يمكن أن يكون sticky خفيفًا داخل viewport إذا لا يسبب مشاكل.
- لا يكون fixed bottom على الديسكتوب.
- الأزرار واضحة وكبيرة.

---

## 8.4 ProductQuantitySelector

### الهدف

اختيار الكمية قبل الإضافة للسلة.

### يجب أن يدعم

- زر زيادة.
- زر نقصان.
- إدخال أو عرض الكمية.
- حد أدنى 1.
- حد أعلى حسب stock إن كان معروفًا.
- تعطيل الزيادة إذا وصلت الكمية للحد الأعلى.
- تعطيل selector إذا المنتج غير متوفر.

### Validation

- لا يقبل كمية 0.
- لا يقبل أرقام سالبة.
- لا يسمح بتجاوز المخزون إذا المخزون معروف.

---

## 8.5 ProductVariantSelector

### الهدف

اختيار المتغيرات إذا كان المنتج يحتوي variants/options.

### أنواع متغيرات محتملة

- اللون.
- الحجم.
- السعة.
- النوع.
- أي attribute آخر.

### المطلوب

- افحص بيانات المنتج أولًا.
- إذا لا توجد variants، لا تعرض selector.
- إذا توجد variants، اعرضها بشكل واضح.
- إذا اختيار معين غير متاح، اجعله disabled.
- عند اختيار variant، يجب تحديث:
  - السعر إن كان مختلفًا.
  - التوفر.
  - SKU إن وجد.
  - الصورة إن كانت مرتبطة بالمتغير.

### مهم

لا تبنِ نظام متغيرات وهمي.  
استخدم فقط البيانات الموجودة.

---

## 8.6 ProductTrustInfo

### الهدف

رفع ثقة المستخدم داخل صفحة المنتج.

### عناصر مقترحة

- ضمان موثوق.
- توصيل متاح.
- سياسة استرجاع واضحة.
- دعم فني.
- دفع آمن إن كان مناسبًا.
- خدمة صيانة إن كان المشروع يدعمها.

### التصميم

- Cards صغيرة أو rows.
- نص قصير.
- أيقونات بسيطة.
- i18n.

### لا تحتاج API

يمكن أن تكون static من الترجمة، ما لم يوجد config في المشروع.

---

## 8.7 ProductInfoTabs

### الهدف

تنظيم معلومات المنتج بدل وضع كل شيء في كتلة طويلة.

### التبويبات المقترحة

1. الوصف.
2. المواصفات.
3. الشحن والاسترجاع.
4. التقييمات اختياري placeholder إذا لا يوجد backend.
5. الأسئلة الشائعة اختياري إذا توجد بيانات.

### يجب

- تكون سهلة الاستخدام على الديسكتوب.
- على الموبايل يمكن أن تكون accordion بدل tabs إذا أفضل.
- لا تعرض تبويب فارغ.
- لا تعرض بيانات وهمية.

---

## 8.8 ProductDescription

### الهدف

عرض وصف المنتج بشكل واضح.

### يجب أن يدعم

- نص عادي.
- HTML آمن إذا الوصف يأتي HTML.
- فقرات.
- fallback إذا لا يوجد وصف.

### تحذير

إذا الوصف HTML، لا تستخدم `dangerouslySetInnerHTML` بدون التأكد من أن البيانات sanitized أو أن النظام الحالي يتعامل معها.  
إذا غير مؤكد، اعرض النص فقط.

---

## 8.9 ProductSpecifications

### الهدف

عرض المواصفات أو attributes بشكل مرتب.

### مصدر البيانات المحتمل

```txt
specifications
attributes
metadata
features
variant attributes
```

### التصميم

- Table بسيط.
- أو grid key/value.
- يدعم RTL.
- لا يعرض حقول فارغة.
- إذا لا توجد مواصفات، أخف التبويب أو اعرض رسالة بسيطة.

---

## 8.10 Shipping & Returns Tab

### الهدف

عرض معلومات الشحن والاسترجاع.

### يمكن أن يكون static مؤقتًا من الترجمة

لكن لا تكتب وعودًا غير صحيحة مثل:

- توصيل مجاني دائمًا.
- إرجاع خلال مدة محددة غير مؤكدة.

استخدم نصوص عامة آمنة:

```txt
تختلف خيارات الشحن والاسترجاع حسب المدينة ونوع المنتج. تواصل معنا لمزيد من التفاصيل.
```

---

## 8.11 RelatedProductsSection

### الهدف

عرض منتجات مشابهة لزيادة الاستكشاف والشراء.

### مصدر البيانات

الأفضل حسب المتاح:

1. API related products إن وجد.
2. منتجات من نفس التصنيف.
3. منتجات مميزة كحل أخير.

### السلوك

- لا تعرض المنتج الحالي ضمن المنتجات المشابهة.
- استخدم `ProductCard` من المرحلة الثالثة.
- اعرض 4 إلى 8 منتجات.
- إذا لا توجد منتجات، أخف القسم.
- لا تعرض Empty state مزعج.

---

## 8.12 RecentlyViewedSection اختياري

### الهدف

عرض المنتجات التي شاهدها المستخدم مؤخرًا.

### التنفيذ المقبول

- استخدم localStorage فقط إذا سهل وآمن.
- لا تبالغ في التعقيد.
- لا تنفذ إذا سيؤخر المرحلة.

### السلوك

- لا تعرض المنتج الحالي.
- لا تعرض القسم إذا لا توجد منتجات.
- استخدم `ProductCardCompact` أو `ProductCard`.

---

## 8.13 ProductMobileStickyBar

### الهدف

تسهيل الشراء على الموبايل فقط.

### يظهر فقط على الموبايل

```txt
md:hidden
```

### يحتوي على

- السعر.
- زر إضافة للسلة.
- حالة التوفر مختصرة.

### مهم

- لا يظهر على الديسكتوب.
- لا يغطي BottomNav بطريقة سيئة.
- إذا يوجد BottomNav، يجب ضبط spacing.
- يمكن أن يظهر فوق BottomNav أو بدلًا منه في صفحة المنتج حسب أفضل UX.

### ممنوع

- ممنوع fixed bottom purchase bar على الديسكتوب.
- ممنوع أن يغطي المحتوى أو التبويبات.

---

# 9. Data & Helper Requirements

أنشئ:

```txt
productDetails.helpers.ts
```

## وظائف مقترحة

```ts
getProductId(product)
getProductName(product)
getProductSlug(product)
getProductImages(product)
getProductMainImage(product)
getProductPrice(product, selectedVariant?)
getProductComparePrice(product, selectedVariant?)
getProductCurrency(product)
getProductSku(product, selectedVariant?)
getProductStock(product, selectedVariant?)
isProductInStock(product, selectedVariant?)
getProductCategory(product)
getProductBrand(product)
getProductDescription(product)
getProductSpecifications(product)
getProductVariants(product)
getProductBreadcrumbItems(product)
```

### الهدف

تجنب تكرار منطق قراءة بيانات المنتج في كل مكون.

---

# 10. Add to Cart Requirements

## يجب

- استخدام منطق السلة الحالي.
- تمرير المنتج أو productId بالشكل الذي يتوقعه cart store.
- تمرير quantity المختارة.
- تمرير variant المختار إن كان مطلوبًا.
- منع الإضافة إذا المنتج غير متوفر.
- منع الإضافة إذا لم يختَر المستخدم متغيرًا مطلوبًا.
- إظهار feedback بسيط إن كان النظام يدعم toast أو alert داخلي.

## ممنوع

- ممنوع تغيير cart store جذريًا.
- ممنوع كسر صفحة السلة.
- ممنوع إضافة منتج بدون variant إذا variant مطلوب.
- ممنوع استخدام API جديد غير موجود.

---

# 11. Breadcrumb Requirements

استخدم `Breadcrumbs` من المرحلة الأولى.

## أمثلة

```txt
الرئيسية / المنتجات / اسم المنتج
```

أو إذا يوجد تصنيف:

```txt
الرئيسية / التصنيفات / الإلكترونيات / اسم المنتج
```

### يجب

- العنصر الأخير ليس رابطًا.
- التصنيف رابط إن أمكن.
- يدعم RTL.

---

# 12. Loading / Error / Not Found States

## Loading

استخدم `ProductDetailsSkeleton`.

يجب أن يشبه layout الصفحة:

- skeleton للصورة.
- skeleton للمعلومات.
- skeleton للتبويبات.
- skeleton للمنتجات المشابهة.

## Error

إذا فشل API:

- اعرض رسالة واضحة.
- زر إعادة المحاولة إن أمكن.
- رابط العودة للمنتجات.

## Not Found

إذا المنتج غير موجود:

- اعرض حالة:
  - المنتج غير موجود.
  - زر العودة للمنتجات.
  - زر العودة للرئيسية.

---

# 13. Responsive Requirements

## Mobile

- Gallery فوق.
- PurchasePanel تحت.
- Sticky bar للموبايل فقط.
- Tabs يمكن أن تكون accordion.
- المنتجات المشابهة 2 columns أو carousel بسيط.
- لا يوجد overflow أفقي.
- لا يوجد fixed bar يغطي BottomNav.

## Tablet

- layout يمكن أن يكون عمودًا واحدًا أو عمودين حسب العرض.
- تجنب ازدحام panel.

## Desktop

- Gallery + purchase panel في صف واحد.
- panel واضح.
- لا يوجد Bottom sticky add-to-cart.
- المنتجات المشابهة grid.
- التبويبات واسعة ومريحة.

---

# 14. i18n Requirements

أضف مفاتيح ترجمة.

## ar.json مقترح

```json
{
  "productDetails": {
    "breadcrumb": {
      "home": "الرئيسية",
      "products": "المنتجات",
      "categories": "التصنيفات"
    },
    "actions": {
      "addToCart": "أضف للسلة",
      "buyNow": "اشترِ الآن",
      "addToFavorites": "إضافة للمفضلة",
      "removeFromFavorites": "إزالة من المفضلة",
      "share": "مشاركة المنتج",
      "retry": "إعادة المحاولة",
      "backToProducts": "العودة للمنتجات",
      "backHome": "العودة للرئيسية"
    },
    "labels": {
      "sku": "رمز المنتج",
      "brand": "البراند",
      "category": "التصنيف",
      "availability": "التوفر",
      "quantity": "الكمية",
      "price": "السعر",
      "selectVariant": "اختر الخيار",
      "selectedVariant": "الخيار المحدد"
    },
    "stock": {
      "inStock": "متوفر",
      "outOfStock": "غير متوفر",
      "lowStock": "كمية محدودة"
    },
    "tabs": {
      "description": "الوصف",
      "specifications": "المواصفات",
      "shippingReturns": "الشحن والاسترجاع",
      "reviews": "التقييمات",
      "faq": "الأسئلة الشائعة"
    },
    "trust": {
      "warranty": {
        "title": "ضمان موثوق",
        "subtitle": "تفاصيل الضمان حسب نوع المنتج."
      },
      "delivery": {
        "title": "توصيل متاح",
        "subtitle": "خيارات توصيل مناسبة حسب المدينة."
      },
      "returns": {
        "title": "سياسة استرجاع",
        "subtitle": "تواصل معنا لمعرفة شروط الاسترجاع."
      },
      "support": {
        "title": "دعم فني",
        "subtitle": "نساعدك في اختيار المنتج المناسب."
      }
    },
    "sections": {
      "relatedProducts": "منتجات مشابهة",
      "recentlyViewed": "شوهدت مؤخرًا",
      "youMayLike": "قد يعجبك أيضًا"
    },
    "states": {
      "loading": "جاري تحميل المنتج...",
      "notFoundTitle": "المنتج غير موجود",
      "notFoundSubtitle": "ربما تم حذف المنتج أو تغيير رابطه.",
      "errorTitle": "تعذر تحميل المنتج",
      "errorSubtitle": "حدث خطأ أثناء جلب بيانات المنتج. حاول مرة أخرى.",
      "noDescription": "لا يوجد وصف متاح لهذا المنتج.",
      "noSpecifications": "لا توجد مواصفات متاحة لهذا المنتج.",
      "selectRequiredOptions": "يرجى اختيار الخيارات المطلوبة قبل الإضافة للسلة."
    },
    "shippingReturns": {
      "text": "تختلف خيارات الشحن والاسترجاع حسب المدينة ونوع المنتج. تواصل معنا لمزيد من التفاصيل."
    }
  }
}
```

## en.json مقترح

```json
{
  "productDetails": {
    "breadcrumb": {
      "home": "Home",
      "products": "Products",
      "categories": "Categories"
    },
    "actions": {
      "addToCart": "Add to Cart",
      "buyNow": "Buy Now",
      "addToFavorites": "Add to Favorites",
      "removeFromFavorites": "Remove from Favorites",
      "share": "Share Product",
      "retry": "Retry",
      "backToProducts": "Back to Products",
      "backHome": "Back Home"
    },
    "labels": {
      "sku": "SKU",
      "brand": "Brand",
      "category": "Category",
      "availability": "Availability",
      "quantity": "Quantity",
      "price": "Price",
      "selectVariant": "Select option",
      "selectedVariant": "Selected option"
    },
    "stock": {
      "inStock": "In Stock",
      "outOfStock": "Out of Stock",
      "lowStock": "Low Stock"
    },
    "tabs": {
      "description": "Description",
      "specifications": "Specifications",
      "shippingReturns": "Shipping & Returns",
      "reviews": "Reviews",
      "faq": "FAQ"
    },
    "trust": {
      "warranty": {
        "title": "Reliable Warranty",
        "subtitle": "Warranty details depend on product type."
      },
      "delivery": {
        "title": "Delivery Available",
        "subtitle": "Delivery options depend on the city."
      },
      "returns": {
        "title": "Return Policy",
        "subtitle": "Contact us to learn about return conditions."
      },
      "support": {
        "title": "Technical Support",
        "subtitle": "We help you choose the right product."
      }
    },
    "sections": {
      "relatedProducts": "Related Products",
      "recentlyViewed": "Recently Viewed",
      "youMayLike": "You May Also Like"
    },
    "states": {
      "loading": "Loading product...",
      "notFoundTitle": "Product not found",
      "notFoundSubtitle": "The product may have been removed or its link changed.",
      "errorTitle": "Could not load product",
      "errorSubtitle": "An error occurred while fetching product details. Please try again.",
      "noDescription": "No description is available for this product.",
      "noSpecifications": "No specifications are available for this product.",
      "selectRequiredOptions": "Please select the required options before adding to cart."
    },
    "shippingReturns": {
      "text": "Shipping and return options vary depending on the city and product type. Contact us for more details."
    }
  }
}
```

ضع المفاتيح حسب بنية ملفات الترجمة الحالية.

---

# 15. UX Rules

## يجب

- صفحة المنتج تقنع المستخدم.
- السعر واضح جدًا.
- زر الإضافة للسلة واضح.
- حالة التوفر واضحة.
- الصور واضحة.
- المتغيرات مفهومة.
- التبويبات منظمة.
- الثقة موجودة.
- المنتجات المشابهة تظهر إذا توجد بيانات.
- الموبايل سهل الشراء.
- الديسكتوب لا يحتوي fixed bottom bar.

## ممنوع

- ممنوع ترك زر الشراء مثبتًا أسفل الديسكتوب.
- ممنوع عرض تبويبات فارغة.
- ممنوع عرض بيانات وهمية كأنها حقيقية.
- ممنوع كسر add to cart.
- ممنوع إضافة منتج غير متوفر للسلة.
- ممنوع تجاهل اختيار variant المطلوب.
- ممنوع تجاهل RTL.
- ممنوع استخدام lightbox أو slider ثقيل بدون ضرورة.
- ممنوع استخدام HTML غير آمن للوصف.
- ممنوع إعادة بناء ProductCard.

---

# 16. Accessibility Requirements

- أزرار حقيقية.
- `aria-label` للصور المصغرة.
- `alt` لكل صورة.
- tabs قابلة للتنقل بالكيبورد إن أمكن.
- quantity buttons لها labels.
- variant options لها labels واضحة.
- disabled state واضح.
- focus states واضحة.
- لا تعتمد على اللون فقط للتوفر أو الخصم.
- لا تجعل الكرت كله clickable إذا داخله أزرار.

---

# 17. Performance Requirements

- lazy loading للصور غير الرئيسية.
- لا تحمل related products إذا المنتج لم يتحمل بعد.
- لا تستخدم مكتبات slider ثقيلة.
- لا تستخدم حسابات كبيرة داخل render.
- استخدم memoization عند الحاجة فقط.
- لا تخزن صور كبيرة في state.
- skeleton layout أفضل من spinner.

---

# 18. خطوات التنفيذ

## Step 1 — فحص Product API والـ Types

حدد:

- طريقة جلب المنتج.
- route المستخدم id أو slug.
- شكل الصور.
- شكل السعر.
- شكل المخزون.
- شكل المتغيرات.
- شكل المواصفات.
- شكل التصنيف والبراند.
- هل يوجد related products endpoint.

وثق ذلك في `IMPLEMENTATION_NOTES_PHASE_5.md`.

---

## Step 2 — إنشاء helpers وtypes

أنشئ:

```txt
productDetails.helpers.ts
productDetails.types.ts
```

لتوحيد قراءة بيانات المنتج.

---

## Step 3 — بناء ProductDetailsSkeleton

- Gallery skeleton.
- Panel skeleton.
- Tabs skeleton.
- Related products skeleton.

---

## Step 4 — بناء ProductGallery

- صورة رئيسية.
- thumbnails.
- fallback.
- responsive.
- alt.
- اختيار الصورة.

---

## Step 5 — بناء ProductPurchasePanel

- معلومات المنتج.
- السعر.
- المخزون.
- الكمية.
- المتغيرات.
- add to cart.
- favorite إن وجد.
- trust مختصر.

---

## Step 6 — بناء Quantity وVariants

- Quantity selector.
- Variant selector إن وجدت variants.
- تحديث السعر/المخزون حسب variant إن البيانات تدعم.

---

## Step 7 — بناء ProductTrustInfo

- ضمان.
- توصيل.
- استرجاع.
- دعم.

استخدم i18n.

---

## Step 8 — بناء ProductInfoTabs

- description.
- specifications.
- shipping returns.
- reviews placeholder فقط إذا مناسب وغير مضلل.

---

## Step 9 — بناء RelatedProductsSection

- استخدم endpoint إن وجد.
- أو منتجات من نفس التصنيف.
- استخدم ProductCard.
- أخف القسم إذا لا توجد بيانات.

---

## Step 10 — بناء MobileStickyBar

- يظهر فقط على الموبايل.
- السعر + add to cart.
- لا يظهر على الديسكتوب.
- لا يغطي BottomNav.

---

## Step 11 — تحديث ProductPage الحالية

استبدل أو اربط الصفحة الحالية بمكونات المرحلة الجديدة.

تأكد أن route يعمل كما كان.

---

## Step 12 — إضافة الترجمة

أضف مفاتيح ar/en وتأكد من عدم ظهور مفاتيح خام.

---

## Step 13 — اختبار build

شغّل:

```bash
npm run lint
npm run build
```

أو:

```bash
pnpm lint
pnpm build
```

أو:

```bash
yarn lint
yarn build
```

حسب المشروع.

---

# 19. معايير القبول النهائية

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

## Product Details

- [ ] صفحة المنتج تعمل من route الحالي.
- [ ] تعرض Breadcrumbs.
- [ ] تعرض Gallery احترافي.
- [ ] تعرض اسم المنتج.
- [ ] تعرض السعر.
- [ ] تعرض السعر قبل الخصم إن وجد.
- [ ] تعرض حالة التوفر.
- [ ] تعرض SKU/Brand/Category إن وجدت.
- [ ] تعرض Quantity selector.
- [ ] تعرض Variants إذا وجدت.
- [ ] زر Add to Cart يعمل.
- [ ] لا يمكن إضافة منتج غير متوفر.
- [ ] لا يمكن إضافة منتج يحتاج variant دون اختياره.

## Gallery

- [ ] صورة رئيسية واضحة.
- [ ] thumbnails تعمل.
- [ ] fallback عند عدم وجود صور.
- [ ] لا يوجد overflow على الموبايل.

## Tabs

- [ ] وصف المنتج يظهر.
- [ ] المواصفات تظهر إذا وجدت.
- [ ] تبويب الشحن والاسترجاع يظهر بنص آمن.
- [ ] لا توجد تبويبات فارغة.

## Related Products

- [ ] المنتجات المشابهة تظهر إذا توجد.
- [ ] المنتج الحالي لا يظهر ضمنها.
- [ ] تستخدم ProductCard من المرحلة الثالثة.
- [ ] القسم يختفي إذا لا توجد منتجات.

## Mobile

- [ ] Sticky Add to Cart يظهر فقط على الموبايل.
- [ ] لا يغطي BottomNav.
- [ ] لا يظهر على الديسكتوب.
- [ ] الصفحة لا يحدث لها overflow.

## Desktop

- [ ] لا يوجد fixed bottom purchase bar.
- [ ] Gallery و PurchasePanel يظهران كتخطيط Web.
- [ ] الصفحة لا تبدو كتطبيق.

## i18n

- [ ] مفاتيح عربية موجودة.
- [ ] مفاتيح إنجليزية موجودة.
- [ ] لا تظهر مفاتيح خام.

## Build

- [ ] TypeScript بدون أخطاء.
- [ ] Build ناجح.
- [ ] لا توجد أخطاء Console واضحة.

---

# 20. اختبار يدوي

## Desktop

اختبر:

```txt
/products/:id
/products/:slug
```

حسب route المستخدم.

تحقق من:

- Breadcrumbs.
- الصور.
- thumbnails.
- السعر.
- التوفر.
- الكمية.
- الإضافة للسلة.
- التبويبات.
- المنتجات المشابهة.
- عدم وجود bottom sticky.

## Mobile

تحقق من:

- الصور لا تكسر الشاشة.
- زر sticky ظاهر.
- BottomNav لا يغطي الزر.
- الكمية تعمل.
- المتغيرات تعمل.
- الإضافة للسلة تعمل.

## Edge Cases

اختبر منتجات:

- بدون صور.
- بدون وصف.
- بدون مواصفات.
- غير متوفرة.
- لديها خصم.
- لديها أكثر من صورة.
- لديها variants.
- بدون related products.
- id/slug غير موجود.
- API error.

---

# 21. تعليمات صارمة لوكيل التنفيذ

## ممنوع

- ممنوع بناء Cart جديد.
- ممنوع بناء Checkout.
- ممنوع تغيير API.
- ممنوع كسر routes.
- ممنوع إظهار Sticky Add to Cart على الديسكتوب.
- ممنوع استخدام بيانات وهمية للمنتج.
- ممنوع عرض tabs فارغة.
- ممنوع استخدام HTML غير آمن.
- ممنوع كسر ProductCard.
- ممنوع إضافة مكتبات slider كبيرة بدون ضرورة.
- ممنوع تجاهل variants.
- ممنوع إضافة منتج غير متوفر للسلة.

## مطلوب

- كود منظم.
- مكونات صغيرة.
- Helpers واضحة.
- TypeScript آمن.
- Responsive ممتاز.
- Fallbacks آمنة.
- Loading/Error/NotFound states.
- i18n.
- Build ناجح.
- Notes واضحة.

---

# 22. مخرجات المرحلة المطلوبة

في نهاية المرحلة يجب تسليم:

1. ProductDetailsPage جديدة أو محسنة.
2. ProductGallery.
3. ProductPurchasePanel.
4. ProductQuantitySelector.
5. ProductVariantSelector.
6. ProductTrustInfo.
7. ProductInfoTabs.
8. ProductSpecifications.
9. ProductDescription.
10. ProductMobileStickyBar.
11. RelatedProductsSection.
12. ProductDetailsSkeleton.
13. ProductNotFoundState.
14. ProductDetailsErrorState.
15. Helpers و Types.
16. مفاتيح ترجمة عربية وإنجليزية.
17. ملف ملاحظات تنفيذ:

```txt
IMPLEMENTATION_NOTES_PHASE_5.md
```

---

# 23. نموذج IMPLEMENTATION_NOTES_PHASE_5.md

```md
# Implementation Notes — Phase 5

## Completed

- Rebuilt Product Details Page.
- Added ProductGallery.
- Added ProductPurchasePanel.
- Added ProductQuantitySelector.
- Added ProductVariantSelector.
- Added ProductTrustInfo.
- Added ProductInfoTabs.
- Added ProductSpecifications.
- Added ProductDescription.
- Added ProductMobileStickyBar.
- Added RelatedProductsSection.
- Added loading, error, and not found states.
- Added product details translation keys.

## Product API Mapping

- Product route param:
- Product ID field:
- Product slug field:
- Product name field:
- Product images field:
- Product price field:
- Product compare price field:
- Product stock field:
- Product SKU field:
- Product brand field:
- Product category field:
- Product description field:
- Product specifications field:
- Product variants field:

## Related Products Source

- Endpoint used:
- Fallback used:

## Decisions

- Sticky Add to Cart is mobile-only.
- No fixed purchase bar on desktop.
- Empty tabs are hidden.
- Shipping/returns text is generic and safe.
- Related products section is hidden if no products are available.

## Modified Files

- src/features/product/details/ProductDetailsPage.tsx
- src/features/product/details/ProductGallery.tsx
- src/features/product/details/ProductPurchasePanel.tsx
- src/features/product/details/ProductQuantitySelector.tsx
- src/features/product/details/ProductVariantSelector.tsx
- src/features/product/details/ProductTrustInfo.tsx
- src/features/product/details/ProductInfoTabs.tsx
- src/features/product/details/ProductSpecifications.tsx
- src/features/product/details/ProductDescription.tsx
- src/features/product/details/ProductMobileStickyBar.tsx
- src/features/product/details/RelatedProductsSection.tsx
- src/features/product/details/ProductDetailsSkeleton.tsx
- src/features/product/details/ProductNotFoundState.tsx
- src/features/product/details/ProductDetailsErrorState.tsx
- src/features/product/details/productDetails.helpers.ts
- src/features/product/details/productDetails.types.ts
- src/features/product/ProductPage.tsx
- src/config/routes.tsx
- src/core/i18n/locales/ar/*.json
- src/core/i18n/locales/en/*.json

## Pending for Phase 6

- Rebuild Cart page.
- Rebuild checkout UX.
- Add order summary.
- Add coupon/shipping estimate if supported.
- Improve empty cart.
```

---

# 24. Definition of Done

تعتبر المرحلة الخامسة مغلقة عندما تصبح صفحة تفاصيل المنتج:

> صفحة بيع احترافية تحتوي صور واضحة، معلومات منظمة، سعر وتوفر، اختيار كمية ومتغيرات، ثقة، تبويبات، ومنتجات مشابهة.

وليست:

> صفحة منتج بسيطة تشبه تطبيق موبايل مع زر شراء مثبت في الأسفل.

بعد إغلاق هذه المرحلة ننتقل إلى المرحلة السادسة:

**Cart & Checkout UX Rebuild**
