# Phase 4 — Product Listing Page & Filters

## مشروع: تطوير الويب أب إلى متجر ويب احترافي

## المرحلة الرابعة: بناء صفحة المنتجات والتصنيفات والفلاتر الاحترافية PLP

---

# 1. الهدف الرئيسي

تحويل صفحات عرض المنتجات والتصنيفات والبحث من عرض بسيط يشبه تطبيق موبايل إلى **Product Listing Page احترافية** مثل المتاجر الإلكترونية الحقيقية.

هذه المرحلة هي قلب تجربة التصفح في المتجر، لأنها تجعل المستخدم قادرًا على:

- تصفح المنتجات بشكل منظم.
- استخدام الفلاتر.
- ترتيب النتائج.
- الانتقال بين Grid و List.
- رؤية عدد النتائج.
- استخدام روابط قابلة للمشاركة مع query params.
- الوصول للمنتج بسهولة.
- التصفح بشكل ممتاز على الديسكتوب والموبايل.

بعد تنفيذ هذه المرحلة يجب أن تصبح صفحات المنتجات والتصنيفات والبحث Web-first وليست Mobile App-first.

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

- بنية الصفحة الرئيسية الجديدة.
- أقسام المنتجات المنظمة.

## Phase 3 — Product Card System

- `ProductCard`
- `ProductCardHorizontal`
- `ProductCardSkeleton`
- `ProductPrice`
- `ProductBadges`
- product helpers

المرحلة الرابعة يجب أن تستخدم نظام الكروت الجديد، ولا تعيد بناء ProductCard من جديد.

---

# 3. المشكلة الحالية

صفحات المنتجات الحالية غالبًا تعاني من:

- عرض منتجات فقط بدون تجربة تصفح Web حقيقية.
- لا توجد Sidebar Filters للديسكتوب.
- لا يوجد Drawer Filters للموبايل.
- لا يوجد Sort واضح.
- لا يوجد View mode بين Grid/List.
- لا يوجد Results count.
- لا توجد Active filter chips.
- لا توجد Breadcrumbs قوية.
- لا توجد Category Hero.
- لا توجد query params منظمة في الرابط.
- البحث قد يكون صفحة منفصلة فقيرة.
- لا يوجد Pagination أو Load More واضح.
- التجربة تبدو مثل تطبيق موبايل أكثر من متجر ويب.

---

# 4. نطاق المرحلة

## داخل النطاق

يجب تنفيذ التالي:

1. بناء أو إعادة بناء صفحة منتجات عامة `/products`.
2. تحسين صفحة التصنيف `/categories/:id`.
3. تحسين صفحة البحث `/search`.
4. إنشاء `ProductListingPage` أو مكونات PLP عامة.
5. إنشاء `ProductListingToolbar`.
6. إنشاء `FiltersSidebar` للديسكتوب.
7. إنشاء `MobileFiltersDrawer` للموبايل.
8. إنشاء `ActiveFiltersChips`.
9. إنشاء `SortSelect`.
10. إنشاء `ViewModeToggle`.
11. إنشاء `ProductResultsGrid`.
12. إنشاء `ProductResultsList`.
13. إضافة Breadcrumbs.
14. إضافة Category/Header section.
15. دعم query params للفلاتر والفرز والبحث.
16. دعم loading, empty, error states.
17. دعم pagination أو load more حسب الموجود في API.
18. توحيد استخدام ProductCard من المرحلة الثالثة.
19. إضافة مفاتيح ترجمة عربية وإنجليزية.
20. عدم كسر API أو السلة أو صفحة المنتج.

## خارج النطاق

لا تنفذ في هذه المرحلة:

- إعادة بناء صفحة المنتج التفصيلية PDP.
- إعادة بناء السلة.
- Checkout.
- SEO الكامل.
- نظام reviews كامل.
- Quick View modal.
- نظام wishlist backend.
- بناء backend جديد للفلاتر إلا إذا كان موجودًا جزئيًا وتحتاج فقط لربطه.
- تغيير جذري في الـ API بدون ضرورة.

إذا كان الباك إند لا يدعم بعض الفلاتر، جهّز الواجهة بطريقة progressive enhancement، واستخدم المتاح فقط.

---

# 5. الملفات الحالية المهمة للفحص

افحص قبل التنفيذ:

```txt
src/features/categories/ProductsByCategoryPage.tsx
src/features/categories/*
src/features/products/*
src/features/search/SearchPage.tsx
src/components/ecommerce/product-card/*
src/components/shared/ProductCard.tsx
src/components/layout/Breadcrumbs.tsx
src/components/layout/Container.tsx
src/services/*
src/api/*
src/hooks/*
src/stores/*
src/types/*
src/config/routes.tsx
src/core/i18n/*
```

ابحث عن:

```txt
getProducts
getProductsByCategory
searchProducts
getCategories
ProductFilters
ProductQuery
pagination
page
limit
sort
categoryId
minPrice
maxPrice
inStock
brand
attributes
```

لا تفترض وجود كل الحقول. افحص الموجود فعليًا.

---

# 6. الهيكل المقترح للملفات

أنشئ مجلدًا واضحًا لواجهة عرض المنتجات:

```txt
src/features/products/listing/
├── ProductListingPage.tsx
├── ProductListingToolbar.tsx
├── ProductListingHeader.tsx
├── ProductResultsGrid.tsx
├── ProductResultsList.tsx
├── FiltersSidebar.tsx
├── MobileFiltersDrawer.tsx
├── FilterGroup.tsx
├── PriceFilter.tsx
├── CategoryFilter.tsx
├── StockFilter.tsx
├── BrandFilter.tsx
├── ActiveFiltersChips.tsx
├── SortSelect.tsx
├── ViewModeToggle.tsx
├── ProductListingSkeleton.tsx
├── ProductListingEmptyState.tsx
├── ProductListingErrorState.tsx
├── productListing.helpers.ts
├── productListing.types.ts
└── index.ts
```

إذا كانت بنية المشروع مختلفة، التزم بها لكن حافظ على هذا التقسيم المنطقي.

---

# 7. التصميم العام المطلوب للصفحة

## Desktop Layout

```txt
ProductListingPage
├── Breadcrumbs
├── ProductListingHeader / CategoryHero
├── ProductListingToolbar
└── Content Layout
    ├── FiltersSidebar
    └── Results Area
        ├── ActiveFiltersChips
        ├── ProductResultsGrid / ProductResultsList
        └── Pagination / Load More
```

## Mobile Layout

```txt
ProductListingPage
├── Breadcrumbs
├── ProductListingHeader
├── Mobile Toolbar
│   ├── Sort
│   ├── Filter button
│   └── View toggle optional
├── ActiveFiltersChips
├── ProductResultsGrid
├── Load More / Pagination
└── MobileFiltersDrawer
```

---

# 8. المتطلبات التفصيلية

## 8.1 ProductListingPage

### الهدف

مكون عام قابل للاستخدام في:

- `/products`
- `/categories/:id`
- `/search`

### يجب أن يدعم

- title.
- subtitle.
- breadcrumb items.
- initial filters.
- categoryId اختياري.
- search query اختياري.
- products data.
- loading/error/empty.
- sort.
- view mode.
- filters.
- pagination.

### ملاحظة مهمة

يمكن بناء صفحة عامة واحدة مع props، أو بناء hook ومكونات مشتركة تستخدمها الصفحات الثلاث.

الأفضل:

```txt
ProductListingPage
├── يستخدم في ProductsPage
├── يستخدم في ProductsByCategoryPage
└── يستخدم في SearchPage
```

---

## 8.2 ProductListingHeader / CategoryHero

### الهدف

إعطاء الصفحة هوية واضحة.

### في صفحة المنتجات العامة

يعرض:

- العنوان: كل المنتجات.
- الوصف: تصفح جميع المنتجات المتاحة.
- عدد النتائج إن وجد.

### في صفحة التصنيف

يعرض:

- اسم التصنيف.
- وصف التصنيف إن وجد.
- صورة التصنيف إن وجدت.
- عدد المنتجات إن وجد.

### في صفحة البحث

يعرض:

- نتائج البحث عن: `query`
- عدد النتائج.
- رسالة إذا البحث فارغ.

### التصميم

- لا يكون ضخمًا جدًا.
- مناسب للديسكتوب والموبايل.
- يستخدم `Container`.
- يدعم RTL.

---

## 8.3 ProductListingToolbar

### الهدف

التحكم العلوي في النتائج.

### يجب أن يحتوي

Desktop:

- عدد النتائج.
- Sort select.
- View mode toggle.
- Clear filters إذا توجد فلاتر.
- زر الفلاتر مخفي لأن sidebar ظاهر.

Mobile:

- زر "الفلاتر".
- Sort.
- عدد النتائج.
- View mode اختياري.

### Props مقترحة

```ts
type ProductListingToolbarProps = {
  total?: number;
  sort: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenFilters: () => void;
  activeFiltersCount?: number;
};
```

---

## 8.4 FiltersSidebar

### الهدف

فلاتر جانبية للديسكتوب.

### تظهر فقط على الديسكتوب

```txt
hidden lg:block
```

### الفلاتر الأساسية المطلوبة

1. التصنيفات.
2. السعر.
3. التوفر.
4. البراند إن كان موجودًا.
5. الخصائص إن كانت موجودة.
6. العروض/الخصومات إن أمكن.

### الحد الأدنى المقبول

إذا الـ API لا يدعم كل شيء، نفذ:

- category
- price
- inStock
- sort

وجهز البنية لباقي الفلاتر.

### التصميم

- sidebar بعرض مناسب.
- section لكل filter.
- collapse اختياري.
- clear button.
- لا يكون مزدحمًا.

---

## 8.5 MobileFiltersDrawer

### الهدف

عرض الفلاتر في الموبايل دون إفساد الصفحة.

### السلوك

- يفتح من زر في toolbar.
- يحتوي نفس filters.
- يوجد زر تطبيق.
- يوجد زر مسح.
- يغلق عند التطبيق.
- لا يغطي BottomNav بطريقة سيئة.
- يدعم RTL.

### لا تضف مكتبة جديدة إن كان المشروع لديه Drawer/Modal.

إذا لا يوجد، يمكن بناء drawer بسيط بـ CSS/Tailwind.

---

## 8.6 FilterGroup

### الهدف

مكون عام لتجميع filter section.

### Props مقترحة

```ts
type FilterGroupProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};
```

### السلوك

- عنوان واضح.
- إمكانية collapse اختيارية.
- padding مناسب.
- border bottom بين المجموعات.

---

## 8.7 PriceFilter

### الهدف

فلترة السعر.

### المطلوب

- min price.
- max price.
- تطبيق.
- مسح.
- validation بسيط:
  - لا يكون min أكبر من max.
  - لا يقبل قيم سالبة.
- تحديث query params.

### ملاحظة

إذا العملة YER في المشروع، اعرض العملة بشكل مناسب.  
لا تستخدم USD كافتراضي.

---

## 8.8 StockFilter

### الهدف

فلترة التوفر.

### خيارات مقترحة

- كل المنتجات.
- المتوفر فقط.
- غير المتوفر اختياري.

### تعتمد على API

إذا API يدعم:

```txt
inStock=true
```

استخدمه.

إذا لا يدعم، لا تعمل فلترة وهمية إلا إذا البيانات كاملة client-side، وضع ملاحظة في notes.

---

## 8.9 CategoryFilter

### الهدف

فلترة حسب التصنيف.

### في صفحة المنتجات العامة

- تظهر قائمة التصنيفات.
- الضغط على التصنيف يمكن:
  - يغير query param.
  - أو ينقل إلى `/categories/:id`.

الأفضل إذا المشروع يعتمد صفحات التصنيف:

```txt
click category -> /categories/:id
```

### في صفحة تصنيف محدد

- يمكن إظهار التصنيفات الفرعية إن وجدت.
- أو إخفاء فلتر التصنيفات إذا لا توجد بيانات.

---

## 8.10 BrandFilter

### الهدف

فلترة حسب البراند إن كان موجودًا.

### قواعد

- إذا لا توجد brands في البيانات أو API، لا تعرض هذا الفلتر.
- لا تعرض بيانات وهمية.
- إذا brand موجود داخل المنتج فقط ويمكن استخراجه بأمان من النتائج، يمكن عرضه كفلتر client-side مؤقت مع ملاحظة.

---

## 8.11 ActiveFiltersChips

### الهدف

إظهار الفلاتر المفعلة فوق النتائج.

### أمثلة

```txt
السعر: 1000 - 5000
متوفر فقط
التصنيف: إلكترونيات
البراند: Samsung
بحث: شاشة
```

### السلوك

- كل chip له زر إزالة.
- يوجد زر "مسح الكل".
- إزالة chip تحدث query params.
- يدعم RTL.

---

## 8.12 SortSelect

### خيارات مقترحة

```txt
relevance
newest
price_asc
price_desc
popular
best_selling
```

### بالعربية

- الأهم.
- الأحدث.
- السعر: من الأقل للأعلى.
- السعر: من الأعلى للأقل.
- الأكثر شعبية.
- الأكثر مبيعًا.

### ملاحظة

لا ترسل sort غير مدعوم للـ API إذا كان يسبب خطأ.  
استخدم map بين UI sort و API sort.

---

## 8.13 ViewModeToggle

### الهدف

التبديل بين:

- Grid.
- List.

### Desktop

يظهر بوضوح.

### Mobile

اختياري. يمكن إبقاء Grid فقط إن كان List مزدحمًا.

### السلوك

- Grid يستخدم `ProductCard`.
- List يستخدم `ProductCardHorizontal`.
- يمكن حفظ mode في query param أو local state.
- لا يجب أن يكسر الصفحة.

---

## 8.14 ProductResultsGrid

### الهدف

عرض المنتجات في Grid responsive.

### Grid مقترح

```txt
Mobile: 2 columns
Tablet: 3 columns
Desktop: 3 أو 4 columns مع sidebar
Large desktop: 4 columns
```

مثال:

```txt
grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4
```

إذا sidebar موجود، لا تستخدم 6 أعمدة حتى لا تصبح الكروت ضيقة.

---

## 8.15 ProductResultsList

### الهدف

عرض المنتجات بنمط أفقي.

### يستخدم

`ProductCardHorizontal` من المرحلة الثالثة.

### يظهر غالبًا على الديسكتوب والتابلت.  
على الموبايل يمكن إبقاء grid إذا list غير مناسب.

---

## 8.16 Pagination / Load More

### المطلوب

افحص API:

- إذا يدعم pagination:
  - `page`
  - `limit`
  - `total`
  - `totalPages`
- طبق Pagination أو Load More.

### الأفضل للمشروع

في المتاجر، الأفضل غالبًا:

- Desktop: Pagination.
- Mobile: Load More.

لكن لتقليل التعقيد، يمكن استخدام Load More موحد إذا كان API يدعم page.

### لا تفعل

- لا تعمل infinite scroll معقد في هذه المرحلة.
- لا تحمل كل المنتجات دفعة واحدة إذا العدد كبير.

---

# 9. Query Params Requirements

يجب أن تنعكس حالة الصفحة في الرابط.

## أمثلة

```txt
/products?sort=newest&page=2
/products?minPrice=1000&maxPrice=5000&inStock=true
/products?categoryId=abc&sort=price_asc
/search?q=phone&sort=relevance
/categories/123?minPrice=1000&inStock=true
```

## الفوائد

- الرابط قابل للمشاركة.
- الرجوع للخلف يعمل.
- تحديث الصفحة يحافظ على الفلاتر.
- SEO أفضل لاحقًا.

## ممنوع

- حفظ كل الفلاتر في state فقط دون الرابط.
- كسر back/forward في المتصفح.

---

# 10. Data & API Rules

## استخدم الموجود

لا تنشئ API جديد إلا إذا كان موجودًا في المشروع.

استخدم services الحالية:

```txt
productService
categoryService
searchService
```

## Mapping

أنشئ helper يحول UI filters إلى API params:

```ts
mapListingStateToApiParams(state)
```

## إذا API لا يدعم فلتر معين

- لا تعرض الفلتر.
- أو عطله مع TODO داخلي.
- لا ترسل params تسبب أخطاء.
- وثق ذلك في notes.

---

# 11. Loading / Empty / Error States

## Loading

- استخدم `ProductCardSkeleton`.
- لا تستخدم spinner فقط.
- sidebar يمكن أن يظهر skeleton بسيط.

## Empty

إذا لا توجد نتائج:

- اعرض رسالة واضحة.
- اعرض زر مسح الفلاتر.
- اعرض رابط العودة للتصنيفات أو المنتجات.

### نص مقترح

```txt
لم نجد منتجات مطابقة
جرّب إزالة بعض الفلاتر أو البحث بكلمات مختلفة.
```

## Error

إذا فشل التحميل:

- اعرض رسالة.
- زر إعادة المحاولة إن أمكن.
- لا تكسر كامل layout.

---

# 12. Search Page Requirements

## المطلوب

تحسين صفحة البحث لتستخدم نفس PLP components.

### SearchPage يجب أن:

- تقرأ `q` من query params.
- تعرض نتائج البحث.
- تعرض العنوان:
  - نتائج البحث عن "..."
- تستخدم toolbar.
- تستخدم filters إن كانت منطقية.
- تستخدم sort.
- تستخدم ProductCard/Grid/List.

## إذا لا يوجد query

اعرض حالة:

```txt
ابدأ البحث عن منتج
اكتب اسم المنتج أو القطعة التي تبحث عنها.
```

---

# 13. Category Page Requirements

## المطلوب

تحسين صفحة التصنيف لتستخدم PLP.

### يجب أن:

- تقرأ category id أو slug من route.
- تجلب بيانات التصنيف إن أمكن.
- تعرض breadcrumb:
  - الرئيسية / التصنيفات / اسم التصنيف
- تعرض منتجات التصنيف.
- تسمح بالفلاتر والفرز داخل التصنيف.
- لا تعرض فلتر التصنيف العام بطريقة مربكة إذا المستخدم داخل تصنيف محدد.

---

# 14. Products Page Requirements

## المطلوب

إنشاء أو تحسين `/products`.

### يجب أن:

- تعرض كل المنتجات.
- تعرض filters sidebar.
- تعرض sort.
- تعرض view mode.
- تعرض pagination/load more.
- تكون هي الوجهة الأساسية من الهيدر.

---

# 15. i18n Requirements

أضف مفاتيح ترجمة.

## ar.json مقترح

```json
{
  "productListing": {
    "titles": {
      "allProducts": "كل المنتجات",
      "categoryProducts": "منتجات التصنيف",
      "searchResults": "نتائج البحث",
      "searchResultsFor": "نتائج البحث عن: {{query}}"
    },
    "subtitles": {
      "allProducts": "تصفح جميع المنتجات المتاحة في المتجر.",
      "categoryProducts": "استكشف المنتجات المتوفرة داخل هذا التصنيف.",
      "searchEmpty": "اكتب اسم المنتج أو القطعة التي تبحث عنها."
    },
    "toolbar": {
      "resultsCount": "{{count}} منتج",
      "filters": "الفلاتر",
      "sortBy": "ترتيب حسب",
      "viewGrid": "عرض شبكي",
      "viewList": "عرض قائمة",
      "clearFilters": "مسح الفلاتر",
      "activeFilters": "الفلاتر المفعلة"
    },
    "sort": {
      "relevance": "الأهم",
      "newest": "الأحدث",
      "priceAsc": "السعر: من الأقل للأعلى",
      "priceDesc": "السعر: من الأعلى للأقل",
      "popular": "الأكثر شعبية",
      "bestSelling": "الأكثر مبيعًا"
    },
    "filters": {
      "title": "تصفية المنتجات",
      "categories": "التصنيفات",
      "price": "السعر",
      "minPrice": "أقل سعر",
      "maxPrice": "أعلى سعر",
      "stock": "التوفر",
      "inStock": "المتوفر فقط",
      "outOfStock": "غير المتوفر",
      "brand": "البراند",
      "offers": "العروض",
      "apply": "تطبيق",
      "reset": "إعادة تعيين",
      "clear": "مسح"
    },
    "states": {
      "loading": "جاري تحميل المنتجات...",
      "emptyTitle": "لم نجد منتجات مطابقة",
      "emptySubtitle": "جرّب إزالة بعض الفلاتر أو البحث بكلمات مختلفة.",
      "emptySearchTitle": "ابدأ البحث عن منتج",
      "errorTitle": "تعذر تحميل المنتجات",
      "errorSubtitle": "حدث خطأ أثناء جلب المنتجات. حاول مرة أخرى.",
      "retry": "إعادة المحاولة"
    },
    "pagination": {
      "loadMore": "تحميل المزيد",
      "previous": "السابق",
      "next": "التالي",
      "page": "صفحة {{page}}"
    }
  }
}
```

## en.json مقترح

```json
{
  "productListing": {
    "titles": {
      "allProducts": "All Products",
      "categoryProducts": "Category Products",
      "searchResults": "Search Results",
      "searchResultsFor": "Search results for: {{query}}"
    },
    "subtitles": {
      "allProducts": "Browse all available products in the store.",
      "categoryProducts": "Explore products available in this category.",
      "searchEmpty": "Type the product or part you are looking for."
    },
    "toolbar": {
      "resultsCount": "{{count}} products",
      "filters": "Filters",
      "sortBy": "Sort by",
      "viewGrid": "Grid view",
      "viewList": "List view",
      "clearFilters": "Clear filters",
      "activeFilters": "Active filters"
    },
    "sort": {
      "relevance": "Relevance",
      "newest": "Newest",
      "priceAsc": "Price: Low to High",
      "priceDesc": "Price: High to Low",
      "popular": "Most Popular",
      "bestSelling": "Best Selling"
    },
    "filters": {
      "title": "Filter Products",
      "categories": "Categories",
      "price": "Price",
      "minPrice": "Min price",
      "maxPrice": "Max price",
      "stock": "Availability",
      "inStock": "In stock only",
      "outOfStock": "Out of stock",
      "brand": "Brand",
      "offers": "Offers",
      "apply": "Apply",
      "reset": "Reset",
      "clear": "Clear"
    },
    "states": {
      "loading": "Loading products...",
      "emptyTitle": "No matching products found",
      "emptySubtitle": "Try removing some filters or searching with different keywords.",
      "emptySearchTitle": "Start searching for a product",
      "errorTitle": "Could not load products",
      "errorSubtitle": "An error occurred while fetching products. Please try again.",
      "retry": "Retry"
    },
    "pagination": {
      "loadMore": "Load More",
      "previous": "Previous",
      "next": "Next",
      "page": "Page {{page}}"
    }
  }
}
```

ضع المفاتيح في المكان المناسب حسب بنية المشروع.

---

# 16. UX Rules

## يجب

- المستخدم يفهم أين هو.
- المستخدم يرى عدد النتائج.
- الفلاتر واضحة.
- الفرز واضح.
- الفلاتر تظهر جانبيًا على الديسكتوب.
- الفلاتر تظهر كـ drawer على الموبايل.
- الفلاتر المفعلة تظهر كـ chips.
- يمكن مسح الفلاتر بسهولة.
- الرابط يحدث مع الفلاتر.
- لا تنكسر الصفحة عند عدم وجود بيانات.

## ممنوع

- ممنوع عرض فلاتر لا تعمل.
- ممنوع إرسال query params غير مدعومة تسبب أخطاء.
- ممنوع إخفاء كل النتائج بسبب فلتر client-side ناقص.
- ممنوع استخدام horizontal mobile layout للديسكتوب.
- ممنوع إعادة بناء ProductCard.
- ممنوع تجاهل RTL.
- ممنوع إضافة مكتبات كبيرة بلا ضرورة.

---

# 17. Accessibility Requirements

- كل أزرار الفلاتر buttons حقيقية.
- Drawer له close button واضح.
- Select له label.
- Inputs السعر لها labels.
- View mode buttons لها aria-label.
- Active chips لها buttons لإزالة الفلتر.
- Focus states واضحة.
- لا تعتمد على اللون فقط.

---

# 18. Performance Requirements

- لا تحمل كل المنتجات إذا يوجد pagination.
- استخدم debounce للبحث إذا البحث مباشر.
- لا تعمل filtering client-side على آلاف المنتجات.
- استخدم memoization بحذر للفلاتر المشتقة.
- لا تضف حسابات ثقيلة داخل render.
- Skeleton أفضل من spinner.

---

# 19. خطوات التنفيذ

## Step 1 — فحص API والـ Types

حدد:

- كيف يتم جلب المنتجات.
- كيف يتم جلب منتجات التصنيف.
- كيف يتم البحث.
- هل يوجد pagination.
- ما الفلاتر المدعومة.
- ما sort المدعوم.
- شكل response:
  - data
  - total
  - page
  - limit
  - meta

وثق ذلك في `IMPLEMENTATION_NOTES_PHASE_4.md`.

---

## Step 2 — بناء types وhelpers

أنشئ:

```txt
productListing.types.ts
productListing.helpers.ts
```

لتوحيد:

- Listing state.
- Filter state.
- Query param parsing.
- API params mapping.
- Sort mapping.

---

## Step 3 — بناء UI components

أنشئ:

- ProductListingHeader.
- ProductListingToolbar.
- FiltersSidebar.
- MobileFiltersDrawer.
- ActiveFiltersChips.
- SortSelect.
- ViewModeToggle.
- ProductResultsGrid.
- ProductResultsList.
- States components.

---

## Step 4 — بناء Products Page

اربط `/products` بصفحة المنتجات العامة.

تأكد من:

- الفلاتر.
- الفرز.
- النتائج.
- pagination/load more.
- query params.

---

## Step 5 — تحديث Category Page

اجعل صفحة التصنيف تستخدم نفس مكونات PLP.

تأكد من:

- breadcrumb.
- category title.
- منتجات التصنيف.
- فلاتر داخل التصنيف.
- عدم تكرار فلتر التصنيف بشكل مربك.

---

## Step 6 — تحديث Search Page

اجعل صفحة البحث تستخدم نفس مكونات PLP.

تأكد من:

- قراءة `q`.
- عرض النتائج.
- حالة البحث الفارغ.
- sort/filter إن كانت مدعومة.

---

## Step 7 — إضافة الترجمة

أضف مفاتيح ar/en وتأكد من ظهورها.

---

## Step 8 — اختبار شامل

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

# 20. معايير القبول النهائية

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

## Products Page

- [ ] `/products` يعمل.
- [ ] يعرض منتجات.
- [ ] يعرض toolbar.
- [ ] يعرض filters sidebar على الديسكتوب.
- [ ] يعرض filters drawer على الموبايل.
- [ ] sort يعمل أو لا يظهر إلا المدعوم.
- [ ] view mode يعمل.
- [ ] query params تعمل.

## Category Page

- [ ] صفحة التصنيف تعمل.
- [ ] تعرض breadcrumb.
- [ ] تعرض اسم التصنيف.
- [ ] تعرض منتجات التصنيف.
- [ ] تدعم sort/filter حسب المتاح.
- [ ] لا تكسر عند تصنيف بدون منتجات.

## Search Page

- [ ] تقرأ query من الرابط.
- [ ] تعرض نتائج البحث.
- [ ] تعرض حالة البحث الفارغ.
- [ ] تدعم sort/filter حسب المتاح.
- [ ] لا تكسر عند عدم وجود نتائج.

## Filters

- [ ] price filter يعمل إن كان مدعومًا.
- [ ] stock filter يعمل إن كان مدعومًا.
- [ ] category filter يعمل.
- [ ] brand filter يظهر فقط إذا توجد بيانات.
- [ ] active filter chips تعمل.
- [ ] clear filters يعمل.
- [ ] mobile drawer يعمل.

## UI

- [ ] الديسكتوب لا يبدو كتطبيق.
- [ ] sidebar احترافي.
- [ ] toolbar واضح.
- [ ] المنتجات تستخدم ProductCard من المرحلة الثالثة.
- [ ] list mode يستخدم ProductCardHorizontal.
- [ ] loading/empty/error states موجودة.

## i18n

- [ ] مفاتيح عربية موجودة.
- [ ] مفاتيح إنجليزية موجودة.
- [ ] لا تظهر مفاتيح خام.

## Build

- [ ] TypeScript بدون أخطاء.
- [ ] Build ناجح.
- [ ] لا توجد أخطاء Console واضحة.

---

# 21. اختبار يدوي

## Desktop

اختبر:

```txt
/products
/products?sort=newest
/products?minPrice=1000&maxPrice=5000
/products?inStock=true
/categories/:id
/search?q=test
```

تحقق من:

- sidebar ظاهر.
- BottomNav غير ظاهر.
- Header/Footer ظاهرين.
- Grid مناسب.
- List mode يعمل.
- Clear filters يعمل.

## Mobile

اختبر:

- زر الفلاتر يفتح drawer.
- تطبيق الفلاتر يغلق drawer.
- المنتجات لا يحدث لها overflow.
- BottomNav لا يغطي أزرار مهمة.
- toolbar لا يكون مزدحمًا.

## Edge Cases

- لا توجد منتجات.
- لا توجد تصنيفات.
- query بحث فارغ.
- سعر min أكبر من max.
- فشل API.
- منتج بدون صورة.
- منتج غير متوفر.

---

# 22. تعليمات صارمة لوكيل التنفيذ

## ممنوع

- ممنوع كسر الصفحة الرئيسية.
- ممنوع إعادة بناء ProductCard.
- ممنوع بناء PDP.
- ممنوع بناء Cart جديد.
- ممنوع عرض فلاتر وهمية لا تعمل.
- ممنوع إرسال params غير مدعومة للباك إند.
- ممنوع حذف المسارات القديمة بدون redirects.
- ممنوع تجاهل الموبايل.
- ممنوع تجاهل RTL.
- ممنوع ترك drawer بدون زر إغلاق.
- ممنوع بناء infinite scroll معقد الآن.
- ممنوع إضافة مكتبات كبيرة.

## مطلوب

- كود منظم.
- Components صغيرة.
- Query params واضحة.
- دعم loading/empty/error.
- استخدام ProductCard الجديد.
- فلاتر تعمل حسب المتاح.
- إخفاء الفلاتر غير المدعومة.
- توثيق ما يدعمه API وما لا يدعمه.
- Build ناجح.

---

# 23. مخرجات المرحلة المطلوبة

في نهاية المرحلة يجب تسليم:

1. ProductListingPage أو بنية PLP مشتركة.
2. Products page `/products`.
3. Category products page محسنة.
4. Search page محسنة.
5. FiltersSidebar.
6. MobileFiltersDrawer.
7. ActiveFiltersChips.
8. SortSelect.
9. ViewModeToggle.
10. ProductResultsGrid.
11. ProductResultsList.
12. Loading/Empty/Error states.
13. Query params support.
14. مفاتيح ترجمة عربية وإنجليزية.
15. ملف ملاحظات تنفيذ:

```txt
IMPLEMENTATION_NOTES_PHASE_4.md
```

---

# 24. نموذج IMPLEMENTATION_NOTES_PHASE_4.md

```md
# Implementation Notes — Phase 4

## Completed

- Built shared Product Listing components.
- Added Products page.
- Improved Category products page.
- Improved Search page.
- Added desktop FiltersSidebar.
- Added MobileFiltersDrawer.
- Added SortSelect.
- Added ViewModeToggle.
- Added ActiveFiltersChips.
- Added Grid/List results.
- Added query params support.
- Added loading, empty, and error states.
- Added product listing translation keys.

## API Capabilities Found

### Products endpoint

- Supports pagination:
- Supports sort:
- Supports search:
- Supports category:
- Supports price:
- Supports stock:
- Supports brand:
- Supports attributes:

### Response shape

```txt
data:
meta:
total:
page:
limit:
```

## Unsupported Filters

- Brand:
- Attributes:
- Offers:
- Rating:

## Decisions

- Hidden unsupported filters instead of showing fake controls.
- Used ProductCard from Phase 3 for grid mode.
- Used ProductCardHorizontal for list mode.
- Query params are the source of truth for filters and sort.

## Modified Files

- src/features/products/listing/ProductListingPage.tsx
- src/features/products/listing/ProductListingToolbar.tsx
- src/features/products/listing/ProductListingHeader.tsx
- src/features/products/listing/FiltersSidebar.tsx
- src/features/products/listing/MobileFiltersDrawer.tsx
- src/features/products/listing/ActiveFiltersChips.tsx
- src/features/products/listing/SortSelect.tsx
- src/features/products/listing/ViewModeToggle.tsx
- src/features/products/listing/ProductResultsGrid.tsx
- src/features/products/listing/ProductResultsList.tsx
- src/features/products/listing/productListing.helpers.ts
- src/features/products/listing/productListing.types.ts
- src/features/products/ProductsPage.tsx
- src/features/categories/ProductsByCategoryPage.tsx
- src/features/search/SearchPage.tsx
- src/config/routes.tsx
- src/core/i18n/locales/ar/*.json
- src/core/i18n/locales/en/*.json

## Pending for Phase 5

- Rebuild Product Details Page.
- Add professional gallery.
- Add purchase panel.
- Add product tabs.
- Add related products.
- Add mobile sticky add-to-cart only.
```

---

# 25. Definition of Done

تعتبر المرحلة الرابعة مغلقة عندما تصبح صفحات عرض المنتجات:

> صفحات متجر ويب احترافية فيها فلاتر، ترتيب، عرض شبكي/قائمة، حالات تحميل واضحة، وروابط query params قابلة للمشاركة.

وليست:

> صفحات تعرض كروت منتجات فقط مثل تطبيق موبايل.

بعد إغلاق هذه المرحلة ننتقل إلى المرحلة الخامسة:

**Product Details Page Rebuild**
