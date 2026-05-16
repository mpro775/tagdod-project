# Phase 2 — Professional Home Page Storefront Rebuild

## مشروع: تطوير الويب أب إلى متجر ويب احترافي

## المرحلة الثانية: إعادة بناء الصفحة الرئيسية كتجربة متجر ويب احترافية

---

# 1. الهدف الرئيسي

تحويل الصفحة الرئيسية الحالية من صفحة تشبه تطبيق موبايل إلى **واجهة متجر إلكتروني احترافية** تعطي انطباعًا تجاريًا قويًا من أول زيارة.

بعد تنفيذ هذه المرحلة، يجب أن يشعر المستخدم عند فتح الصفحة الرئيسية أنه داخل متجر ويب حقيقي، وليس داخل واجهة تطبيق موبايل مكبّرة.

هذه المرحلة تعتمد على مخرجات المرحلة الأولى:

- `StoreLayout`
- `DesktopHeader`
- `MobileHeader`
- `StoreFooter`
- `Container`
- `Breadcrumbs`
- BottomNav للموبايل فقط

---

# 2. المشكلة الحالية

الصفحة الرئيسية الحالية غالبًا تعتمد على منطق قريب من التطبيقات:

- Banner بسيط.
- تصنيفات أفقية scroll مثل تطبيق.
- أقسام منتجات بسيطة.
- غياب Hero تجاري قوي.
- غياب Trust sections.
- غياب عرض واضح لقيمة المتجر.
- غياب تقسيم ديسكتوب احترافي.
- المحتوى يبدو ضيقًا أو mobile-first فقط.
- المنتجات والتصنيفات لا تظهر كواجهة Web Commerce.

المطلوب في هذه المرحلة هو إعادة بناء الصفحة الرئيسية فقط، مع الحفاظ على البيانات والخدمات الحالية قدر الإمكان.

---

# 3. نطاق المرحلة

## داخل النطاق

يجب تنفيذ التالي:

1. إعادة بناء `HomePage`.
2. إنشاء Hero Commerce Section احترافي.
3. إنشاء Category Showcase مناسب للديسكتوب والموبايل.
4. إعادة تنظيم أقسام المنتجات:
   - منتجات مميزة.
   - منتجات جديدة.
   - عروض أو خصومات إن كانت مدعومة.
   - الأكثر مبيعًا إن كانت مدعومة.
5. إضافة Trust Features Section.
6. إضافة Service/Maintenance CTA إذا كان مناسبًا لطبيعة المشروع.
7. إضافة Brands Section إن كانت البيانات موجودة أو إنشاء placeholder آمن.
8. تحسين Loading states.
9. تحسين Empty states.
10. تحسين Error states.
11. استخدام `Container` من المرحلة الأولى.
12. استخدام مفاتيح ترجمة بدل النصوص المباشرة.
13. تحسين responsive behavior للصفحة.
14. عدم كسر أي API أو منطق بيانات حالي.

## خارج النطاق

لا تنفذ في هذه المرحلة:

- إعادة بناء ProductCard بشكل جذري. هذا للمرحلة الثالثة.
- بناء صفحة فلاتر احترافية. هذا للمرحلة الرابعة.
- إعادة بناء صفحة المنتج. هذا للمرحلة الخامسة.
- إعادة بناء السلة. هذا للمرحلة السادسة.
- SEO كامل. هذا للمرحلة السابعة.
- Checkout جديد.
- Mega Menu متقدم.
- نظام CMS للصفحة الرئيسية.

يمكن تحسين استخدام الكرت الحالي مؤقتًا، لكن لا تحول هذه المرحلة إلى إعادة بناء كاملة لنظام كروت المنتجات.

---

# 4. الملفات الحالية المهمة للفحص

افحص قبل التنفيذ:

```txt
src/features/home/HomePage.tsx
src/components/layout/Container.tsx
src/components/layout/StoreLayout.tsx
src/components/shared/ProductCard.tsx
src/features/products/*
src/features/categories/*
src/services/*
src/api/*
src/hooks/*
src/core/i18n/*
src/index.css
src/config/routes.tsx
```

قد تختلف أسماء الخدمات حسب المشروع.  
ابحث عن:

```txt
productService
categoryService
homeService
bannerService
useProducts
useCategories
useFeaturedProducts
useNewProducts
```

---

# 5. الهيكل المقترح للصفحة الرئيسية الجديدة

يجب أن تكون الصفحة الرئيسية بهذا التسلسل المنطقي:

```txt
HomePage
├── HomeHeroSection
├── HomeCategoryShowcase
├── HomeTrustFeatures
├── FeaturedProductsSection
├── NewProductsSection
├── OffersSection / DealsSection
├── BrandsSection
├── MaintenanceOrServiceSection
└── HomeFinalCTA
```

ليس شرطًا أن تكون كل الأقسام مربوطة ببيانات حقيقية من أول تنفيذ، لكن يجب أن تكون البنية جاهزة ومرنة.

---

# 6. الهيكل المقترح للملفات

أنشئ مجلدًا للـ home components:

```txt
src/features/home/components/
├── HomeHeroSection.tsx
├── HomeCategoryShowcase.tsx
├── HomeProductSection.tsx
├── HomeTrustFeatures.tsx
├── HomeBrandsSection.tsx
├── HomeServiceSection.tsx
├── HomeSectionHeader.tsx
├── HomeSkeleton.tsx
├── HomeEmptyState.tsx
└── index.ts
```

إذا كانت بنية المشروع مختلفة، التزم بالنمط الحالي لكن حافظ على التقسيم المنطقي.

---

# 7. المتطلبات التفصيلية

## 7.1 إعادة بناء HomePage

### الملف

```txt
src/features/home/HomePage.tsx
```

### المطلوب

- الصفحة يجب أن تكون نظيفة وتستدعي components صغيرة.
- ممنوع وضع كل التصميم داخل ملف واحد ضخم.
- استخدم `Container`.
- استخدم spacing واضح بين الأقسام.
- لا تعتمد على scroll أفقي للديسكتوب إلا عند الحاجة.
- حافظ على mobile experience لكن لا تجعلها تتحكم بالديسكتوب.

### مثال هيكل

```tsx
export function HomePage() {
  return (
    <div className="bg-background">
      <HomeHeroSection />
      <HomeCategoryShowcase />
      <HomeTrustFeatures />
      <HomeProductSection type="featured" />
      <HomeProductSection type="new" />
      <HomeProductSection type="offers" />
      <HomeBrandsSection />
      <HomeServiceSection />
    </div>
  );
}
```

---

## 7.2 HomeHeroSection

### الهدف

إضافة بداية قوية للمتجر.

### يجب أن يحتوي

- عنوان واضح.
- وصف مختصر.
- CTA رئيسي.
- CTA ثانوي.
- صورة أو banner.
- Search box اختياري إذا كان مناسبًا.
- مساحة للديسكتوب بتخطيط من عمودين.
- على الموبايل يصبح عمودًا واحدًا.

### محتوى مقترح بالعربية

```txt
كل ما تحتاجه في مكان واحد
تصفح المنتجات، العروض، والخدمات بسهولة من متجرنا الإلكتروني.
```

### CTAs مقترحة

- تسوق الآن
- تصفح التصنيفات

### التصميم المطلوب

Desktop:

```txt
Left:
- Badge صغير
- Title
- Description
- CTAs
- Trust mini metrics

Right:
- Hero image / gradient card / product collage
```

Mobile:

```txt
- Title
- Description
- CTAs
- Image تحت النص
```

### ملاحظات

- لا تستخدم صورة hardcoded غير موجودة.
- إن لم توجد صور، استخدم gradient card أنيق مع رموز أو منتجات من البيانات.
- لا تجعل الهيرو يشبه شاشة Splash App.

---

## 7.3 HomeCategoryShowcase

### الهدف

عرض التصنيفات بشكل Web مناسب.

### المطلوب

Desktop:

- Grid cards.
- 4 إلى 8 تصنيفات بارزة.
- كل كرت يحتوي:
  - اسم التصنيف.
  - صورة أو أيقونة.
  - عدد المنتجات إن كان متوفرًا.
  - رابط للتصنيف.

Mobile:

- يمكن استخدام horizontal scroll.
- لكن يجب ألا يتحكم هذا الشكل بالديسكتوب.

### ممنوع

- ممنوع أن تكون التصنيفات على الديسكتوب مجرد شريط أفقي مثل تطبيق.
- ممنوع عرض تصنيفات كثيرة جدًا بدون تنظيم.

### Empty state

إذا لا توجد تصنيفات:

- اعرض رسالة بسيطة.
- لا تكسر الصفحة.

---

## 7.4 HomeTrustFeatures

### الهدف

زيادة الثقة وإظهار مزايا المتجر.

### عناصر مقترحة

- توصيل سريع.
- ضمان على المنتجات.
- دعم فني.
- دفع آمن.
- خدمة صيانة إن كانت مناسبة.

### التصميم

- Grid من 4 عناصر على الديسكتوب.
- 2 columns على التابلت.
- 1 column أو 2 columns على الموبايل.
- أيقونات بسيطة.
- نص قصير وواضح.

### ملاحظة

لا تحتاج بيانات API. هذا section static مع i18n.

---

## 7.5 HomeProductSection

### الهدف

توحيد طريقة عرض أقسام المنتجات في الصفحة الرئيسية.

### Props مقترحة

```ts
type HomeProductSectionProps = {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading?: boolean;
  error?: unknown;
  viewAllHref?: string;
};
```

أو إذا المشروع يستخدم type معين للمنتج، استخدمه.

### السلوك المطلوب

- يعرض عنوان القسم.
- يعرض subtitle اختياري.
- زر "عرض الكل".
- Grid responsive.
- Loading skeleton.
- Empty state.
- Error state.
- يستخدم ProductCard الحالي مؤقتًا.

### Grid مطلوب

```txt
Mobile: 2 columns
Tablet: 3 columns
Desktop: 4 columns
Large Desktop: 5 columns أو 6 حسب عرض الكرت
```

مثال Tailwind:

```txt
grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
```

### ملاحظة مهمة

إذا كان `ProductCard` الحالي غير مناسب تمامًا، لا تعِد بناءه جذريًا هنا.  
ضع تحسينات بسيطة فقط أو جهز className، واترك المرحلة الثالثة لإعادة بناء كاملة.

---

## 7.6 FeaturedProductsSection

### الهدف

عرض المنتجات المميزة.

### مصدر البيانات

استخدم المصدر الحالي إن وجد:

```txt
isFeatured=true
featured products endpoint
home products endpoint
```

إذا لا يوجد endpoint واضح:

- استخدم نفس قائمة المنتجات العامة بشكل مؤقت.
- ضع TODO واضح في notes.
- لا تكسر الصفحة.

---

## 7.7 NewProductsSection

### الهدف

عرض المنتجات الجديدة.

### مصدر البيانات

استخدم:

```txt
sort=newest
createdAt desc
new products endpoint
```

أو المتاح في المشروع.

إذا لا يوجد دعم:

- استخدم المنتجات العامة مؤقتًا.
- لا تضف منطق وهمي معقد.

---

## 7.8 OffersSection / DealsSection

### الهدف

عرض العروض إن كان المنتج يحتوي خصمًا أو سعرًا قبل الخصم.

### السلوك

- إذا توجد منتجات عليها خصم، اعرض القسم.
- إذا لا توجد، يمكن إخفاء القسم بدل عرض Empty state.
- لا تعرض قسم عروض فارغ للمستخدم.

### طريقة معرفة الخصم

افحص type المنتج. قد توجد حقول مثل:

```txt
discount
discountPrice
compareAtPrice
salePrice
oldPrice
priceBeforeDiscount
```

لا تفترض اسم الحقل. افحص الموجود فعليًا.

---

## 7.9 HomeBrandsSection

### الهدف

إظهار البراندات أو الشركاء إن كانت البيانات موجودة.

### السلوك

- إذا توجد brands API أو بيانات brand داخل المنتجات، اعرضها.
- إذا لا توجد، يمكن بناء section بسيط placeholder مخفي أو static آمن.
- لا تضف بيانات وهمية كثيرة تظهر للمستخدم كأنها حقيقية.

### التصميم

- Cards صغيرة أو logos.
- Grid / horizontal على الموبايل.
- رابط لكل brand إن كانت صفحة brand موجودة.

---

## 7.10 HomeServiceSection

### الهدف

إبراز الخدمات أو الصيانة إذا كانت مهمة للمشروع.

### محتوى مقترح

```txt
هل تحتاج إلى صيانة أو دعم؟
تواصل معنا وسنساعدك في اختيار الخدمة أو المنتج المناسب.
```

### CTA

- تواصل معنا
- اطلب خدمة
- مركز الصيانة

### ملاحظة

إذا لا توجد صفحة خدمة، اجعل الرابط إلى صفحة التواصل أو أخف الزر الثاني.

---

## 7.11 HomeSectionHeader

### الهدف

توحيد رؤوس الأقسام.

### Props مقترحة

```ts
type HomeSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
};
```

### يجب أن يدعم

- عنوان.
- وصف.
- زر عرض الكل.
- responsive layout.

---

## 7.12 Loading States

### المطلوب

- لا تعرض الصفحة فارغة أثناء التحميل.
- استخدم skeletons للأقسام.
- لا تجعل Skeleton ضخم جدًا.
- لا تستخدم Spinner فقط في منتصف الصفحة لكل شيء.

### ملفات مقترحة

```txt
HomeSkeleton.tsx
ProductGridSkeleton.tsx
CategoryGridSkeleton.tsx
```

إذا توجد مكونات Skeleton عامة، استخدمها بدل إنشاء جديدة.

---

## 7.13 Empty States

### المطلوب

لكل قسم يعتمد على API:

- إذا لا توجد بيانات، اعرض Empty state بسيط أو أخف القسم حسب نوعه.
- التصنيفات: اعرض رسالة.
- المنتجات المميزة: يمكن إخفاء القسم أو عرض رسالة.
- العروض: الأفضل إخفاؤه إذا لا توجد عروض.

---

## 7.14 Error States

### المطلوب

- إذا فشل تحميل التصنيفات، لا تكسر الصفحة.
- إذا فشل تحميل قسم منتجات، اعرض رسالة صغيرة داخل section.
- لا تجعل كامل الصفحة تفشل بسبب قسم واحد.

---

# 8. Responsive Requirements

## Mobile

- الهيرو عمود واحد.
- التصنيفات يمكن أن تكون scroll أفقي.
- المنتجات 2 columns.
- المسافات مريحة.
- لا يوجد ازدحام.
- BottomNav من المرحلة الأولى لا يغطي المحتوى.

## Tablet

- الهيرو يمكن أن يبقى عمودًا واحدًا أو عمودين حسب العرض.
- التصنيفات grid.
- المنتجات 3 columns.
- Trust features 2 columns.

## Desktop

- الهيرو عمودين.
- التصنيفات grid.
- المنتجات 4 أو 5 columns.
- Trust features 4 columns.
- الصفحة داخل `Container`.
- لا تشبه تطبيق موبايل.

## Large Desktop

- لا تجعل المحتوى يتمدد بشكل مبالغ.
- استخدم max-width من `Container`.

---

# 9. متطلبات الترجمة

أضف مفاتيح ترجمة للصفحة الرئيسية.

## ar.json مقترح

```json
{
  "home": {
    "hero": {
      "eyebrow": "متجر إلكتروني متكامل",
      "title": "كل ما تحتاجه في مكان واحد",
      "subtitle": "تصفح المنتجات، العروض، والخدمات بسهولة من متجرنا الإلكتروني.",
      "primaryCta": "تسوق الآن",
      "secondaryCta": "تصفح التصنيفات",
      "searchPlaceholder": "ابحث عن منتج أو خدمة..."
    },
    "sections": {
      "categories": {
        "title": "تصفح حسب التصنيف",
        "subtitle": "اختر التصنيف المناسب للوصول أسرع للمنتجات.",
        "viewAll": "كل التصنيفات"
      },
      "trust": {
        "delivery": {
          "title": "توصيل سريع",
          "subtitle": "خيارات توصيل مناسبة لطلباتك."
        },
        "warranty": {
          "title": "ضمان موثوق",
          "subtitle": "منتجات وخدمات بضمان واضح."
        },
        "support": {
          "title": "دعم فني",
          "subtitle": "فريقنا جاهز لمساعدتك."
        },
        "secure": {
          "title": "تجربة آمنة",
          "subtitle": "تسوق بثقة وسهولة."
        }
      },
      "featuredProducts": {
        "title": "منتجات مميزة",
        "subtitle": "اختيارات مختارة بعناية.",
        "viewAll": "عرض الكل"
      },
      "newProducts": {
        "title": "وصل حديثًا",
        "subtitle": "أحدث المنتجات المضافة.",
        "viewAll": "عرض الكل"
      },
      "offers": {
        "title": "عروض وخصومات",
        "subtitle": "فرص مميزة لفترة محدودة.",
        "viewAll": "عرض العروض"
      },
      "brands": {
        "title": "البراندات",
        "subtitle": "تصفح المنتجات حسب العلامة التجارية."
      },
      "service": {
        "title": "هل تحتاج إلى مساعدة أو صيانة؟",
        "subtitle": "تواصل معنا وسنساعدك في اختيار المنتج أو الخدمة المناسبة.",
        "primaryCta": "تواصل معنا",
        "secondaryCta": "مركز الصيانة"
      }
    },
    "states": {
      "loading": "جاري تحميل البيانات...",
      "emptyProducts": "لا توجد منتجات متاحة حاليًا.",
      "emptyCategories": "لا توجد تصنيفات متاحة حاليًا.",
      "error": "تعذر تحميل هذا القسم. حاول لاحقًا."
    }
  }
}
```

## en.json مقترح

```json
{
  "home": {
    "hero": {
      "eyebrow": "Complete Online Store",
      "title": "Everything you need in one place",
      "subtitle": "Browse products, offers, and services easily through our online store.",
      "primaryCta": "Shop Now",
      "secondaryCta": "Browse Categories",
      "searchPlaceholder": "Search for a product or service..."
    },
    "sections": {
      "categories": {
        "title": "Shop by Category",
        "subtitle": "Choose the right category to find products faster.",
        "viewAll": "All Categories"
      },
      "trust": {
        "delivery": {
          "title": "Fast Delivery",
          "subtitle": "Delivery options that suit your orders."
        },
        "warranty": {
          "title": "Reliable Warranty",
          "subtitle": "Products and services with clear warranty."
        },
        "support": {
          "title": "Technical Support",
          "subtitle": "Our team is ready to help you."
        },
        "secure": {
          "title": "Secure Experience",
          "subtitle": "Shop with confidence and ease."
        }
      },
      "featuredProducts": {
        "title": "Featured Products",
        "subtitle": "Carefully selected picks.",
        "viewAll": "View All"
      },
      "newProducts": {
        "title": "New Arrivals",
        "subtitle": "Latest added products.",
        "viewAll": "View All"
      },
      "offers": {
        "title": "Deals & Offers",
        "subtitle": "Special opportunities for a limited time.",
        "viewAll": "View Offers"
      },
      "brands": {
        "title": "Brands",
        "subtitle": "Browse products by brand."
      },
      "service": {
        "title": "Need help or maintenance?",
        "subtitle": "Contact us and we will help you choose the right product or service.",
        "primaryCta": "Contact Us",
        "secondaryCta": "Maintenance Center"
      }
    },
    "states": {
      "loading": "Loading data...",
      "emptyProducts": "No products are available right now.",
      "emptyCategories": "No categories are available right now.",
      "error": "Could not load this section. Please try again later."
    }
  }
}
```

ضع المفاتيح في ملفات الترجمة المناسبة حسب بنية المشروع.

---

# 10. ربط البيانات

## المنتجات

استخدم الموجود حاليًا.

أمثلة محتملة:

```txt
getProducts()
getFeaturedProducts()
getNewProducts()
getProducts({ isFeatured: true })
getProducts({ sort: 'newest' })
```

لا تفترض دوال غير موجودة.  
افحص الخدمات الحالية واستخدم المتاح.

## التصنيفات

استخدم:

```txt
getCategories()
categoryService
useCategories
```

## العروض

لا تنشئ API جديد في هذه المرحلة.  
استخرج العروض من المنتجات إذا كانت الحقول موجودة.

مثال منطقي:

```ts
const offerProducts = products.filter(product => product.compareAtPrice && product.compareAtPrice > product.price);
```

لكن لا تستخدم هذا الاسم إلا إذا كان موجودًا فعليًا في type.

---

# 11. UX Rules

## يجب

- الصفحة تبدأ برسالة واضحة.
- CTA واضح للشراء.
- التصنيفات سهلة الوصول.
- المنتجات تظهر بشكل منظم.
- كل قسم له هدف.
- كل قسم له عنوان ووصف.
- حالات التحميل والخطأ لا تكسر الصفحة.
- الموبايل يبقى سريعًا وبسيطًا.
- الديسكتوب يظهر كمتجر ويب.

## ممنوع

- ممنوع استخدام تصميم يشبه Splash screen.
- ممنوع الاعتماد على horizontal scroll في الديسكتوب كحل أساسي.
- ممنوع عرض أقسام فارغة كثيرة.
- ممنوع استخدام بيانات وهمية تظهر كأنها حقيقية.
- ممنوع كسر ProductCard أو منطق السلة.
- ممنوع جعل الصفحة ملفًا واحدًا ضخمًا.
- ممنوع تجاهل RTL.
- ممنوع وضع نصوص عربية مباشرة إذا يوجد i18n.
- ممنوع تغيير API أو types بشكل يكسر بقية الصفحات.

---

# 12. Visual Direction

## الأسلوب المطلوب

- Web commerce.
- نظيف.
- واسع.
- واضح.
- ثقة واحتراف.
- ليس App UI.

## الألوان

استخدم نظام الألوان الحالي للمشروع.  
لا تختر هوية جديدة في هذه المرحلة.

## المسافات

- استخدم مسافات كبيرة نسبيًا بين الأقسام.
- داخل الأقسام استخدم spacing متوازن.
- لا تجعل الصفحة مزدحمة.

## البطاقات

- Border خفيف.
- Shadow خفيف عند الحاجة.
- Rounded corners متناسقة.
- Hover states على الديسكتوب.

---

# 13. خطوات التنفيذ

## Step 1 — فحص HomePage الحالي

افهم:

- كيف يتم جلب المنتجات.
- كيف يتم جلب التصنيفات.
- كيف تعرض المنتجات حاليًا.
- ما هي المكونات المشتركة.
- أين توجد ملفات الترجمة.

---

## Step 2 — إنشاء مكونات Home الجديدة

أنشئ:

```txt
HomeHeroSection.tsx
HomeCategoryShowcase.tsx
HomeProductSection.tsx
HomeTrustFeatures.tsx
HomeBrandsSection.tsx
HomeServiceSection.tsx
HomeSectionHeader.tsx
HomeSkeleton.tsx
HomeEmptyState.tsx
```

واستخدم `index.ts` للتصدير إذا هذا نمط المشروع.

---

## Step 3 — بناء Hero

- استخدم `Container`.
- أضف title/subtitle/CTAs.
- أضف visual area.
- اربط CTA بالمسارات الموجودة:
  - `/products`
  - `/categories`

إذا لم تكن المسارات موجودة، استخدم المسارات الأقرب أو أضفها إذا تمت في المرحلة الأولى.

---

## Step 4 — بناء Category Showcase

- اجلب التصنيفات من المصدر الحالي.
- اعرضها Grid على الديسكتوب.
- اعرضها بشكل مناسب للموبايل.
- أضف زر "كل التصنيفات".
- أضف loading/empty/error.

---

## Step 5 — بناء Trust Features

- Static section.
- استخدم i18n.
- استخدم icons الموجودة في المشروع أو مكتبة الأيقونات الحالية.
- لا تضف مكتبة جديدة فقط من أجل الأيقونات.

---

## Step 6 — بناء Product Sections

- استخدم `HomeProductSection` لكل نوع:
  - Featured
  - New
  - Offers
- اجلب البيانات من الخدمات الحالية.
- لا تجعل فشل قسم واحد يكسر كل الصفحة.
- استخدم Grid responsive.

---

## Step 7 — بناء Brands Section

- إذا يوجد brand data، استخدمه.
- إذا لا يوجد، اجعله مخفيًا أو placeholder داخلي غير ظاهر للمستخدم.
- لا تعرض أسماء وهمية للمستخدم النهائي.

---

## Step 8 — بناء Service Section

- أضف CTA مناسب.
- اربطه بصفحة تواصل أو خدمة موجودة.
- إذا لا توجد صفحة، استخدم route آمن أو أخف الزر الثانوي.

---

## Step 9 — تحديث HomePage

- استبدل البنية القديمة بالمكونات الجديدة.
- تأكد من أن الصفحة قصيرة وواضحة.
- لا تنس imports والexports.

---

## Step 10 — إضافة مفاتيح الترجمة

- أضف مفاتيح العربية والإنجليزية.
- تأكد من عدم ظهور key names في الواجهة.
- راجع RTL.

---

## Step 11 — اختبار Build

شغل الأمر المناسب:

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

# 14. معايير القبول النهائية

لا تعتبر المرحلة مكتملة إلا إذا تحقق التالي:

## Home Layout

- [ ] الصفحة الرئيسية لم تعد تشبه تطبيق موبايل.
- [ ] يوجد Hero واضح واحترافي.
- [ ] توجد CTA واضحة.
- [ ] الصفحة تستخدم `Container`.
- [ ] الأقسام منظمة بمسافات احترافية.

## Categories

- [ ] التصنيفات تظهر بشكل Grid على الديسكتوب.
- [ ] التصنيفات تظهر بشكل مناسب على الموبايل.
- [ ] يوجد loading state.
- [ ] يوجد empty/error state.

## Product Sections

- [ ] المنتجات المميزة تظهر.
- [ ] المنتجات الجديدة تظهر.
- [ ] العروض تظهر فقط إذا توجد بيانات مناسبة.
- [ ] Grid responsive.
- [ ] لا ينكسر القسم عند فشل API.

## Trust / Services

- [ ] يوجد Trust Features section.
- [ ] يوجد Service أو Maintenance CTA إذا مناسب.
- [ ] النصوص مترجمة.

## Responsive

- [ ] Mobile 360px يعمل.
- [ ] Mobile 430px يعمل.
- [ ] Tablet 768px يعمل.
- [ ] Desktop 1280px يعمل.
- [ ] Desktop 1440px يعمل.
- [ ] Large desktop لا يتمدد بشكل سيئ.

## i18n

- [ ] مفاتيح عربية موجودة.
- [ ] مفاتيح إنجليزية موجودة.
- [ ] لا توجد نصوص Layout/Home الأساسية hardcoded.
- [ ] RTL جيد.

## Stability

- [ ] لا يوجد كسر في الراوتر.
- [ ] لا يوجد كسر في السلة.
- [ ] لا يوجد كسر في كروت المنتجات.
- [ ] Build ناجح.
- [ ] لا توجد أخطاء Console واضحة.

---

# 15. اختبار يدوي

## افتح الصفحة الرئيسية على Desktop

تحقق من:

- الهيدر من المرحلة الأولى ظاهر.
- الهيرو واضح.
- التصنيفات ليست شريط تطبيق.
- المنتجات منظمة.
- الفوتر ظاهر.
- لا يوجد BottomNav.

## افتح الصفحة على Mobile

تحقق من:

- MobileHeader ظاهر.
- BottomNav ظاهر.
- الهيرو لا ينكسر.
- المنتجات 2 columns أو شكل مناسب.
- لا يوجد overflow أفقي غير مقصود.

## اختبر حالات البيانات

- بدون منتجات.
- بدون تصنيفات.
- فشل جلب المنتجات.
- فشل جلب التصنيفات.
- بطء الشبكة.

---

# 16. ملاحظات مهمة للتنفيذ

## لا تبالغ في التعقيد

هذه المرحلة هدفها الصفحة الرئيسية فقط.  
لا تجعلها مشروعًا كاملًا لنظام ثيمات أو CMS.

## حافظ على الواقعية

إذا لا توجد بيانات للعروض أو البراندات، لا تخترع بيانات وهمية.  
الأفضل إخفاء القسم أو وضع TODO في notes.

## لا تؤجل مشاكل واضحة

إذا ظهر أن الصفحة تعتمد على `AppBar` قديم أو `pb-20` عام بسبب المرحلة الأولى، أصلح الاستخدام داخل الصفحة فقط دون الرجوع لتغيير كبير في layout.

---

# 17. مخرجات المرحلة المطلوبة

في نهاية المرحلة يجب تسليم:

1. `HomePage` جديدة.
2. Components مقسمة داخل `features/home/components`.
3. Hero section.
4. Category showcase.
5. Trust features.
6. Product sections.
7. Optional service section.
8. Optional brands section.
9. Loading states.
10. Empty states.
11. Error states.
12. مفاتيح ترجمة عربية وإنجليزية.
13. ملف ملاحظات تنفيذ:

```txt
IMPLEMENTATION_NOTES_PHASE_2.md
```

---

# 18. نموذج IMPLEMENTATION_NOTES_PHASE_2.md

```md
# Implementation Notes — Phase 2

## Completed

- Rebuilt HomePage using modular home sections.
- Added HomeHeroSection.
- Added HomeCategoryShowcase.
- Added HomeProductSection.
- Added HomeTrustFeatures.
- Added HomeServiceSection.
- Added HomeSectionHeader.
- Added loading, empty, and error states.
- Added home translation keys.
- Improved desktop and mobile responsive behavior.

## Modified Files

- src/features/home/HomePage.tsx
- src/features/home/components/HomeHeroSection.tsx
- src/features/home/components/HomeCategoryShowcase.tsx
- src/features/home/components/HomeProductSection.tsx
- src/features/home/components/HomeTrustFeatures.tsx
- src/features/home/components/HomeServiceSection.tsx
- src/features/home/components/HomeSectionHeader.tsx
- src/features/home/components/HomeSkeleton.tsx
- src/features/home/components/HomeEmptyState.tsx
- src/features/home/components/index.ts
- src/core/i18n/locales/ar/*.json
- src/core/i18n/locales/en/*.json

## Data Notes

- Featured products source:
- New products source:
- Offers source:
- Categories source:
- Brands source:

## Decisions

- Offers section is hidden when no discounted products are available.
- Brands section is hidden if no brand data exists.
- ProductCard was reused and not rebuilt in this phase.

## Pending for Phase 3

- Rebuild ProductCard system.
- Add compact/horizontal product card variants.
- Improve hover states.
- Add badges, stock display, and quick actions.
```

---

# 19. Definition of Done

تعتبر المرحلة الثانية مغلقة عندما تكون الصفحة الرئيسية:

> واجهة متجر ويب احترافية تعرض القيمة، التصنيفات، المنتجات، والثقة بوضوح.

وليست:

> صفحة تطبيق موبايل تحتوي بانر وبعض المنتجات.

بعد إغلاق هذه المرحلة ننتقل إلى المرحلة الثالثة:

**Product Card System Rebuild**
