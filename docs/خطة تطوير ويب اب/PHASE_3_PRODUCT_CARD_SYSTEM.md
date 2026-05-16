# Phase 3 — Product Card System Rebuild

## مشروع: تطوير الويب أب إلى متجر ويب احترافي

## المرحلة الثالثة: إعادة بناء نظام كروت المنتجات Product Cards

---

# 1. الهدف الرئيسي

تحويل كروت المنتجات الحالية من كروت بسيطة تشبه تطبيق موبايل إلى **نظام كروت منتجات احترافي قابل لإعادة الاستخدام** في كل صفحات المتجر.

هذه المرحلة تركّز على شكل وتجربة عرض المنتج داخل القوائم والأقسام، وليس على بناء صفحة المنتج التفصيلية أو الفلاتر.

بعد تنفيذ هذه المرحلة يجب أن تصبح كل المنتجات في:

- الصفحة الرئيسية.
- صفحة التصنيفات.
- صفحة البحث.
- المنتجات المشابهة مستقبلًا.
- أي قسم يعرض منتجات.

تظهر بشكل موحد، احترافي، Web-first، ومناسب للديسكتوب والموبايل.

---

# 2. الاعتماد على المراحل السابقة

هذه المرحلة تعتمد على:

## Phase 1

- `StoreLayout`
- `DesktopHeader`
- `MobileHeader`
- `StoreFooter`
- `Container`
- BottomNav للموبايل فقط

## Phase 2

- Home sections الجديدة.
- `HomeProductSection`
- أقسام المنتجات في الصفحة الرئيسية.
- Grid responsive للمنتجات.

المطلوب الآن هو تحسين العنصر الأساسي داخل هذه الأقسام: **Product Card**.

---

# 3. المشكلة الحالية

الكرت الحالي غالبًا يعاني من واحد أو أكثر من التالي:

- تصميم قريب من تطبيق موبايل.
- معلومات قليلة.
- زر إضافة للسلة صغير أو غير واضح.
- لا يوجد Hover state مناسب للديسكتوب.
- لا يوجد عرض واضح للخصم.
- لا يوجد تمييز لحالة التوفر.
- لا يوجد عرض للسعر قبل الخصم.
- لا يوجد Favorite button واضح.
- لا يوجد Quick View placeholder.
- لا يوجد اختلاف بين كرت Grid وكرت Horizontal.
- لا يوجد Skeleton موحد للكروت.
- لا يوجد Empty state قريب من تجربة المتجر.
- الكرت غير مجهز للتوسع لاحقًا.

الهدف هو بناء Product Card System وليس مجرد تعديل CSS بسيط.

---

# 4. نطاق المرحلة

## داخل النطاق

يجب تنفيذ التالي:

1. إعادة بناء `ProductCard` الرئيسي.
2. إنشاء `ProductCardCompact`.
3. إنشاء `ProductCardHorizontal`.
4. إنشاء `ProductCardSkeleton`.
5. إنشاء helper لقراءة بيانات المنتج بشكل آمن.
6. دعم Badges:
   - جديد.
   - مميز.
   - خصم.
   - غير متوفر.
7. دعم السعر والسعر قبل الخصم.
8. دعم حالة التوفر.
9. دعم زر إضافة للسلة.
10. دعم زر المفضلة.
11. دعم hover actions للديسكتوب.
12. دعم responsive card behavior.
13. تحسين fallback image.
14. تحسين accessibility.
15. توحيد استخدام الكرت في الصفحة الرئيسية وصفحات المنتجات الحالية.
16. إضافة مفاتيح ترجمة للكرت.
17. ضمان عدم كسر منطق السلة الحالي.

## خارج النطاق

لا تنفذ في هذه المرحلة:

- صفحة المنتج التفصيلية الجديدة.
- فلاتر المنتجات.
- Quick View Modal كامل.
- Compare system كامل.
- Reviews system كامل.
- Wishlist backend جديد.
- API جديد للمنتجات.
- Checkout أو Cart redesign.
- SEO كامل.
- Pagination جديدة.

يمكن وضع placeholders أو TODOs آمنة للميزات المستقبلية.

---

# 5. الملفات الحالية المهمة للفحص

افحص قبل التنفيذ:

```txt
src/components/shared/ProductCard.tsx
src/features/home/components/HomeProductSection.tsx
src/features/home/HomePage.tsx
src/features/categories/ProductsByCategoryPage.tsx
src/features/search/SearchPage.tsx
src/features/product/*
src/features/cart/*
src/stores/*
src/services/*
src/api/*
src/types/*
src/core/i18n/*
src/index.css
```

ابحث خصوصًا عن:

```txt
Product
ProductDto
product type
cartStore
useCart
addToCart
favorite
wishlist
formatPrice
currency
imageUrl
```

لا تفترض أسماء الحقول. افحص الـ types الفعلية.

---

# 6. الهيكل المقترح للملفات

إذا كان المشروع يستخدم `components/shared` حاليًا، يمكن نقل النظام إلى:

```txt
src/components/ecommerce/product-card/
├── ProductCard.tsx
├── ProductCardCompact.tsx
├── ProductCardHorizontal.tsx
├── ProductCardSkeleton.tsx
├── ProductBadges.tsx
├── ProductPrice.tsx
├── ProductImage.tsx
├── ProductActions.tsx
├── productCard.helpers.ts
├── productCard.types.ts
└── index.ts
```

أو إن كان الأفضل الالتزام بالهيكل الحالي:

```txt
src/components/shared/ProductCard.tsx
src/components/shared/ProductCardCompact.tsx
src/components/shared/ProductCardHorizontal.tsx
src/components/shared/ProductCardSkeleton.tsx
src/components/shared/ProductBadges.tsx
src/components/shared/ProductPrice.tsx
```

المهم أن لا يصبح الملف الواحد ضخمًا وغير قابل للصيانة.

---

# 7. المتطلبات التفصيلية

## 7.1 ProductCard الرئيسي

### الهدف

كرت Grid احترافي مناسب لعرض المنتجات في الصفحة الرئيسية وصفحة المنتجات.

### يجب أن يحتوي

- صورة المنتج.
- Badge الخصم إن وجد.
- Badge مميز/جديد إن وجد.
- زر المفضلة.
- اسم المنتج.
- التصنيف أو البراند إن وجد.
- السعر الحالي.
- السعر قبل الخصم إن وجد.
- حالة التوفر.
- زر واضح لإضافة المنتج للسلة.
- hover actions على الديسكتوب.

### التصميم المطلوب

Desktop:

- Card بارتفاع متوازن.
- صورة في الأعلى بنسبة ثابتة.
- عند hover:
  - تكبير بسيط للصورة.
  - ظهور quick actions.
  - shadow خفيف.
- زر إضافة للسلة واضح.

Mobile:

- لا تعتمد على hover.
- زر الإضافة ظاهر دائمًا.
- الكرت مختصر وواضح.
- لا تجعل النصوص طويلة جدًا.

---

## 7.2 ProductCardCompact

### الهدف

نسخة أصغر للأقسام الجانبية أو المنتجات المقترحة مستقبلًا.

### يستخدم في

- منتجات مشابهة صغيرة.
- Dropdown search suggestions مستقبلًا.
- Recently viewed.
- Cart recommendations.

### يحتوي على

- صورة صغيرة.
- اسم مختصر.
- السعر.
- حالة التوفر أو badge صغير.
- رابط للمنتج.

### لا يحتاج

- Hover actions كثيرة.
- Add to cart كبير.
- تفاصيل كثيرة.

---

## 7.3 ProductCardHorizontal

### الهدف

نسخة أفقية مناسبة للبحث أو السلة أو list view مستقبلًا.

### يحتوي على

- صورة يسار/يمين حسب RTL.
- معلومات المنتج.
- السعر.
- التوفر.
- زر إضافة للسلة.
- زر المفضلة.
- وصف مختصر إن وجد.

### الاستخدام المتوقع

- List view في صفحة المنتجات.
- نتائج البحث.
- منتجات مقترحة داخل صفحات معينة.

---

## 7.4 ProductCardSkeleton

### الهدف

توحيد loading state للكروت.

### يجب أن يدعم

- Grid card skeleton.
- Compact skeleton اختياري.
- Horizontal skeleton اختياري.

### مثال props

```ts
type ProductCardSkeletonProps = {
  variant?: 'grid' | 'compact' | 'horizontal';
};
```

---

## 7.5 ProductImage

### الهدف

توحيد عرض صورة المنتج ومعالجة fallback.

### يجب أن يدعم

- صورة المنتج.
- fallback image أو placeholder.
- alt text.
- lazy loading.
- object-fit مناسب.
- aspect ratio ثابت.
- loading shimmer إن كان متاحًا.

### ممنوع

- كسر الكرت إذا الصورة غير موجودة.
- استخدام صورة خارجية وهمية غير مضمونة.
- ترك alt فارغ دائمًا.

---

## 7.6 ProductBadges

### الهدف

توحيد badges.

### أنواع badges

```txt
discount
featured
new
outOfStock
lowStock
```

### قواعد الظهور

- إذا المنتج غير متوفر، يظهر badge "غير متوفر".
- إذا يوجد خصم، يظهر badge نسبة الخصم أو نص "خصم".
- إذا المنتج مميز، يظهر "مميز".
- إذا المنتج جديد، يظهر "جديد".
- لا تزدحم الصورة بأكثر من 2-3 badges.

### ملاحظة

لا تفترض أسماء الحقول.  
اكتب helper يقرأ الحقول المتاحة بأمان.

---

## 7.7 ProductPrice

### الهدف

توحيد عرض الأسعار.

### يجب أن يدعم

- السعر الحالي.
- السعر قبل الخصم.
- العملة.
- تنسيق السعر.
- حالة عدم وجود سعر.
- RTL/LTR.

### أمثلة حقول محتملة

```txt
price
salePrice
finalPrice
oldPrice
compareAtPrice
priceBeforeDiscount
discountPrice
currency
```

افحص الموجود فعليًا.

### قواعد

- إذا يوجد سعر قبل الخصم أكبر من السعر الحالي، اعرضه مشطوبًا.
- إذا لا يوجد خصم، اعرض السعر فقط.
- إذا العملة غير موجودة، استخدم العملة الافتراضية للمشروع.
- بما أن المشروع يعتمد الريال اليمني في التسعير عند الحاجة، لا تستخدم USD افتراضيًا إلا إذا كان المشروع نفسه يستخدمه.
- يفضل عرض العملة من البيانات أو config.

---

## 7.8 ProductActions

### الهدف

توحيد أزرار الإجراءات.

### Actions المطلوبة

- Add to cart.
- Favorite.
- View details.
- Quick view placeholder اختياري.

### Add to cart

يجب أن:

- يستخدم منطق السلة الحالي.
- لا يكسر cart store.
- يمنع الإضافة إذا المنتج غير متوفر.
- يعطي feedback بصري بسيط عند الإضافة إن كان النظام يدعم toast.
- لا يضيف مكتبة Toast جديدة إذا غير موجودة.

### Favorite

إذا يوجد منطق مفضلة:

- استخدمه.

إذا لا يوجد:

- اجعل الزر موجودًا بشكل اختياري أو أخفه.
- لا تبني backend جديد.

---

# 8. Helper لتوحيد قراءة بيانات المنتج

بسبب احتمالية اختلاف أسماء الحقول، أنشئ helper مثل:

```txt
productCard.helpers.ts
```

## وظائف مقترحة

```ts
getProductId(product)
getProductName(product)
getProductImage(product)
getProductPrice(product)
getProductComparePrice(product)
getProductCurrency(product)
getProductHref(product)
getProductStockStatus(product)
getProductDiscountPercent(product)
isProductFeatured(product)
isProductNew(product)
isProductOutOfStock(product)
```

### لماذا؟

حتى لا يتكرر منطق قراءة الحقول داخل كل كرت.  
وحتى إذا تغيرت بيانات المنتج لاحقًا نعدل في مكان واحد.

### مهم

استخدم TypeScript بطريقة آمنة.  
لا تستخدم `any` إلا إذا كان ضروريًا جدًا ومع تضييق واضح.

---

# 9. واجهة Props مقترحة

## ProductCard

```ts
type ProductCardProps = {
  product: Product;
  className?: string;
  showCategory?: boolean;
  showBrand?: boolean;
  showActions?: boolean;
  showAddToCart?: boolean;
  showFavorite?: boolean;
  priorityImage?: boolean;
};
```

## ProductCardCompact

```ts
type ProductCardCompactProps = {
  product: Product;
  className?: string;
};
```

## ProductCardHorizontal

```ts
type ProductCardHorizontalProps = {
  product: Product;
  className?: string;
  showDescription?: boolean;
  showActions?: boolean;
};
```

استخدم type المنتج الحقيقي من المشروع.

---

# 10. قواعد التصميم

## Grid Card

- Aspect ratio للصورة:
  - يفضل `aspect-square` أو `aspect-[4/3]`.
- Padding داخلي متوازن.
- Border خفيف.
- Shadow خفيف عند hover.
- Rounded corners موحدة.
- اسم المنتج:
  - لا يتجاوز سطرين.
  - يستخدم line-clamp إن متاح.
- السعر واضح.
- زر الإضافة واضح.

## Hover

على الديسكتوب فقط:

- الصورة تكبر قليلًا.
- actions تظهر أو تتحسن.
- shadow ناعم.

لا تعتمد على hover في الموبايل.

## Colors

استخدم نظام ألوان المشروع.  
لا تختر ألوان جديدة عشوائية.

## RTL

- تأكد من محاذاة النصوص.
- تأكد من اتجاه الأيقونات إذا يلزم.
- السعر والعملة يظهران بشكل مناسب.

---

# 11. Responsive Requirements

## Mobile

- الكرت مناسب لعمودين.
- لا يزيد عرضه أو يسبب overflow.
- زر إضافة للسلة واضح.
- النصوص مختصرة.
- لا توجد hover-only actions مخفية لا يمكن الوصول لها.

## Tablet

- الكرت متوازن داخل 3 أعمدة.
- الصور لا تصبح ضخمة جدًا.

## Desktop

- الكرت يظهر احترافيًا داخل 4-6 أعمدة.
- hover يعمل.
- quick actions لا تزعج.

---

# 12. تحديث استخدام الكرت في الصفحات

بعد بناء النظام الجديد، حدّث الاستخدام في:

```txt
src/features/home/components/HomeProductSection.tsx
src/features/categories/ProductsByCategoryPage.tsx
src/features/search/SearchPage.tsx
```

وأي صفحة أخرى تستخدم `ProductCard`.

## مهم

- لا تغير منطق جلب البيانات.
- لا تغير API.
- فقط استبدل كرت العرض.
- إذا صفحة معينة تحتاج horizontal view، استخدم `ProductCardHorizontal`.

---

# 13. الترجمة المطلوبة

أضف مفاتيح للكرت.

## ar.json مقترح

```json
{
  "productCard": {
    "addToCart": "أضف للسلة",
    "viewDetails": "عرض التفاصيل",
    "favorite": "إضافة للمفضلة",
    "removeFavorite": "إزالة من المفضلة",
    "quickView": "عرض سريع",
    "outOfStock": "غير متوفر",
    "inStock": "متوفر",
    "lowStock": "كمية محدودة",
    "new": "جديد",
    "featured": "مميز",
    "discount": "خصم",
    "off": "خصم",
    "priceUnavailable": "السعر غير متاح",
    "imageAlt": "صورة المنتج"
  }
}
```

## en.json مقترح

```json
{
  "productCard": {
    "addToCart": "Add to Cart",
    "viewDetails": "View Details",
    "favorite": "Add to Favorites",
    "removeFavorite": "Remove from Favorites",
    "quickView": "Quick View",
    "outOfStock": "Out of Stock",
    "inStock": "In Stock",
    "lowStock": "Low Stock",
    "new": "New",
    "featured": "Featured",
    "discount": "Discount",
    "off": "Off",
    "priceUnavailable": "Price unavailable",
    "imageAlt": "Product image"
  }
}
```

ضع المفاتيح حسب بنية ملفات الترجمة الحالية.

---

# 14. Accessibility Requirements

يجب مراعاة:

- `button` حقيقي للأزرار.
- `aria-label` لأزرار الأيقونات.
- `alt` مناسب للصورة.
- لا تجعل الكرت كله button إذا داخله أزرار كثيرة؛ استخدم link واضح للصورة/الاسم.
- focus states واضحة.
- لا تعتمد على اللون فقط لإظهار حالة التوفر.
- تأكد أن زر الإضافة disabled عند عدم التوفر.

---

# 15. Performance Requirements

- استخدم lazy loading للصور.
- لا تعيد حساب discount percent كثيرًا داخل render بشكل معقد.
- استخدم helpers بسيطة.
- تجنب re-render غير ضروري.
- لا تضف مكتبات جديدة ثقيلة.
- استخدم `memo` فقط إذا له فائدة واضحة وليس بشكل عشوائي.

---

# 16. Error & Fallback Handling

## إذا الصورة غير موجودة

- اعرض placeholder مناسب.
- لا تكسر layout.

## إذا السعر غير موجود

- اعرض "السعر غير متاح".
- لا تعرض `undefined`.

## إذا اسم المنتج غير موجود

- اعرض fallback آمن مثل "منتج".
- لكن ضع TODO في notes لأن هذا غالبًا مشكلة بيانات.

## إذا المنتج غير متوفر

- Disable add to cart.
- اعرض badge واضح.

---

# 17. خطوات التنفيذ

## Step 1 — فحص Product Type

افحص type المنتج الفعلي وحدد الحقول:

- id
- name/title
- slug
- images/image
- price
- discount price
- stock
- category
- brand
- isFeatured
- createdAt

وثق ذلك داخل notes.

---

## Step 2 — إنشاء helpers

أنشئ:

```txt
productCard.helpers.ts
```

واكتب دوال قراءة البيانات.

لا تربط الكرت مباشرة بحقول متفرقة في كل مكان.

---

## Step 3 — إنشاء ProductImage

- يدعم fallback.
- يدعم aspect ratio.
- يدعم alt.
- يدعم lazy loading.

---

## Step 4 — إنشاء ProductPrice

- يعرض السعر الحالي.
- يعرض السعر قبل الخصم إذا موجود.
- يعرض العملة.
- يدعم السعر غير المتاح.

---

## Step 5 — إنشاء ProductBadges

- discount.
- featured.
- new.
- outOfStock.
- lowStock إن ممكن.

---

## Step 6 — إنشاء ProductActions

- Add to cart.
- Favorite إن وجد.
- View details.
- Quick view placeholder إن مناسب.

---

## Step 7 — إعادة بناء ProductCard

- استخدم components السابقة.
- لا تجعل الملف ضخمًا.
- اختبر على mobile/desktop.

---

## Step 8 — إنشاء Compact وHorizontal

- لا تبالغ بالتفاصيل.
- اجعلهما جاهزين للاستخدام المستقبلي.
- استخدم نفس helpers.

---

## Step 9 — إنشاء Skeleton

- Grid skeleton.
- Compact/horizontal إن كان بسيطًا.

---

## Step 10 — تحديث الصفحات

استبدل الكرت القديم في:

- Home product sections.
- Categories products page.
- Search results.
- أي استخدام آخر واضح.

---

## Step 11 — إضافة الترجمة

- أضف مفاتيح ar/en.
- تأكد أنها تظهر بشكل صحيح.

---

## Step 12 — اختبار

شغّل:

```bash
npm run lint
npm run build
```

أو حسب المشروع:

```bash
pnpm lint
pnpm build
```

أو:

```bash
yarn lint
yarn build
```

---

# 18. معايير القبول النهائية

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

## ProductCard

- [ ] الكرت الجديد يظهر بشكل احترافي.
- [ ] الصورة لا تنكسر عند غيابها.
- [ ] الاسم لا يكسر layout.
- [ ] السعر يظهر بشكل صحيح.
- [ ] السعر قبل الخصم يظهر عند توفره.
- [ ] badge الخصم يظهر عند توفر الخصم.
- [ ] badge غير متوفر يظهر عند نفاد المنتج.
- [ ] زر الإضافة للسلة يعمل.
- [ ] زر الإضافة يتعطل عند عدم التوفر.
- [ ] زر المفضلة لا يكسر الصفحة إذا لا يوجد منطق مفضلة.
- [ ] hover يعمل على الديسكتوب.
- [ ] تجربة الموبايل لا تعتمد على hover.

## Variants

- [ ] يوجد `ProductCardCompact`.
- [ ] يوجد `ProductCardHorizontal`.
- [ ] يوجد `ProductCardSkeleton`.

## Integration

- [ ] الصفحة الرئيسية تستخدم الكرت الجديد.
- [ ] صفحة التصنيفات تستخدم الكرت الجديد.
- [ ] صفحة البحث تستخدم الكرت الجديد إن وجدت.
- [ ] لا يوجد كسر في السلة.
- [ ] لا يوجد كسر في الروابط.

## i18n

- [ ] مفاتيح عربية موجودة.
- [ ] مفاتيح إنجليزية موجودة.
- [ ] لا تظهر مفاتيح ترجمة خام في الواجهة.

## Build

- [ ] TypeScript بدون أخطاء.
- [ ] Build ناجح.
- [ ] لا توجد أخطاء Console واضحة.

---

# 19. اختبار يدوي

## اختبر على Desktop

- افتح الصفحة الرئيسية.
- مرر فوق كرت المنتج.
- تأكد من hover.
- اضغط إضافة للسلة.
- افتح منتج من الكرت.
- اختبر منتج بدون صورة.
- اختبر منتج عليه خصم.
- اختبر منتج غير متوفر.

## اختبر على Mobile

- تأكد أن الكرت يناسب عمودين.
- لا يوجد overflow.
- زر الإضافة واضح.
- النص لا يتداخل.
- الصور متوازنة.

## اختبر صفحات متعددة

- Home.
- Category products.
- Search results.
- أي صفحة تستخدم المنتجات.

---

# 20. تعليمات صارمة لوكيل التنفيذ

## ممنوع

- ممنوع تغيير API.
- ممنوع إعادة بناء صفحة المنتج التفصيلية.
- ممنوع بناء نظام فلاتر.
- ممنوع بناء Wishlist backend جديد.
- ممنوع إضافة مكتبات ثقيلة.
- ممنوع استخدام بيانات وهمية للمستخدم النهائي.
- ممنوع استخدام `any` بشكل عشوائي.
- ممنوع كسر RTL.
- ممنوع جعل الكرت يعتمد على hover فقط.
- ممنوع كسر add to cart.
- ممنوع حذف ProductCard القديم قبل التأكد من تحديث كل الاستخدامات.

## مطلوب

- كود منظم.
- Components صغيرة.
- Types واضحة.
- Helpers مركزية.
- Responsive ممتاز.
- Fallbacks آمنة.
- Build ناجح.
- Notes واضحة.

---

# 21. مخرجات المرحلة المطلوبة

في نهاية المرحلة يجب تسليم:

1. ProductCard جديد.
2. ProductCardCompact.
3. ProductCardHorizontal.
4. ProductCardSkeleton.
5. ProductImage.
6. ProductPrice.
7. ProductBadges.
8. ProductActions.
9. Helpers لقراءة بيانات المنتج.
10. تحديث استخدام الكرت في الصفحات.
11. مفاتيح ترجمة عربية وإنجليزية.
12. ملف ملاحظات تنفيذ:

```txt
IMPLEMENTATION_NOTES_PHASE_3.md
```

---

# 22. نموذج IMPLEMENTATION_NOTES_PHASE_3.md

```md
# Implementation Notes — Phase 3

## Completed

- Rebuilt ProductCard system.
- Added ProductCardCompact.
- Added ProductCardHorizontal.
- Added ProductCardSkeleton.
- Added ProductImage component.
- Added ProductPrice component.
- Added ProductBadges component.
- Added ProductActions component.
- Added product card helpers.
- Updated home product sections to use the new card.
- Updated category/search product listings to use the new card.
- Added product card translation keys.

## Product Data Mapping

- Product ID field:
- Product name field:
- Product image field:
- Product price field:
- Product compare/old price field:
- Product stock field:
- Product category field:
- Product brand field:
- Product featured field:

## Decisions

- Quick View is only prepared as a placeholder and not implemented as a modal.
- Wishlist button is hidden or disabled when no wishlist logic exists.
- Out-of-stock products disable add-to-cart.
- Missing images use a safe placeholder.

## Modified Files

- src/components/ecommerce/product-card/ProductCard.tsx
- src/components/ecommerce/product-card/ProductCardCompact.tsx
- src/components/ecommerce/product-card/ProductCardHorizontal.tsx
- src/components/ecommerce/product-card/ProductCardSkeleton.tsx
- src/components/ecommerce/product-card/ProductImage.tsx
- src/components/ecommerce/product-card/ProductPrice.tsx
- src/components/ecommerce/product-card/ProductBadges.tsx
- src/components/ecommerce/product-card/ProductActions.tsx
- src/components/ecommerce/product-card/productCard.helpers.ts
- src/components/ecommerce/product-card/productCard.types.ts
- src/components/ecommerce/product-card/index.ts
- src/features/home/components/HomeProductSection.tsx
- src/features/categories/ProductsByCategoryPage.tsx
- src/features/search/SearchPage.tsx
- src/core/i18n/locales/ar/*.json
- src/core/i18n/locales/en/*.json

## Pending for Phase 4

- Build Product Listing Page.
- Add desktop filters sidebar.
- Add mobile filters drawer.
- Add sort and view mode.
- Add query params support.
```

---

# 23. Definition of Done

تعتبر المرحلة الثالثة مغلقة عندما يصبح عرض المنتج في كل القوائم:

> كرت متجر ويب احترافي، واضح، متجاوب، يدعم السعر والخصم والتوفر والإضافة للسلة.

وليس:

> بطاقة منتج بسيطة مستنسخة من تطبيق موبايل.

بعد إغلاق هذه المرحلة ننتقل إلى المرحلة الرابعة:

**Product Listing Page & Filters**
