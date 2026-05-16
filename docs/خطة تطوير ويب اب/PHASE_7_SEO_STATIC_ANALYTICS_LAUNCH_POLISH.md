# Phase 7 — SEO, Static Pages, Analytics & Launch Polish

## مشروع: تطوير الويب أب إلى متجر ويب احترافي

## المرحلة السابعة: الإغلاق النهائي، SEO، الصفحات الثابتة، التحليلات، والأداء

---

# 1. الهدف الرئيسي

إغلاق الويب أب كمتجر ويب احترافي جاهز للإطلاق أو التسليم، بعد اكتمال المراحل السابقة الخاصة بالهيكل، الصفحة الرئيسية، كروت المنتجات، صفحات المنتجات، صفحة المنتج، والسلة.

هذه المرحلة تركّز على التفاصيل التي تجعل المتجر يبدو منتجًا نهائيًا وليس مجرد واجهة مطورة:

- SEO أساسي.
- Meta tags.
- Open Graph.
- صفحات ثابتة مهمة.
- Footer links مكتملة.
- تحسين الأداء.
- تحسين الوصولية Accessibility.
- مراجعة Responsive شاملة.
- مراجعة RTL/LTR.
- تحسين حالات الخطأ والفراغ.
- إضافة Analytics events.
- تنظيف الكود.
- توثيق الإغلاق النهائي.
- اختبار شامل قبل التسليم.

بعد هذه المرحلة يجب أن يكون الويب أب جاهزًا للتجربة الرسمية أو الإطلاق التجريبي.

---

# 2. الاعتماد على المراحل السابقة

هذه المرحلة تعتمد على اكتمال:

## Phase 1 — Storefront Foundation

- StoreLayout.
- Header.
- Footer.
- Container.
- Breadcrumbs.
- BottomNav للموبايل فقط.

## Phase 2 — Professional Home Page

- HomePage احترافية.
- Hero.
- Categories.
- Trust features.
- Product sections.

## Phase 3 — Product Card System

- ProductCard.
- ProductCardCompact.
- ProductCardHorizontal.
- ProductCardSkeleton.
- Product helpers.

## Phase 4 — Product Listing & Filters

- Products page.
- Category page.
- Search page.
- Filters.
- Sort.
- Query params.

## Phase 5 — Product Details Page

- Product gallery.
- Purchase panel.
- Product tabs.
- Related products.
- Mobile sticky add-to-cart.

## Phase 6 — Cart & Checkout UX

- Cart page.
- Order summary.
- Cart item rows/cards.
- Mobile checkout bar.
- Empty/loading/error states.

المرحلة السابعة لا تعيد بناء هذه الصفحات، بل تغلقها وتلمّعها وتجهزها للإطلاق.

---

# 3. نطاق المرحلة

## داخل النطاق

يجب تنفيذ التالي:

1. إضافة/تحسين SEO الأساسي.
2. إضافة Meta title و description للصفحات المهمة.
3. إضافة Open Graph و Twitter meta إن كان مناسبًا.
4. إضافة canonical URLs إذا كان المشروع يدعمها.
5. تجهيز صفحات ثابتة:
   - من نحن.
   - تواصل معنا.
   - سياسة الخصوصية.
   - سياسة الاسترجاع.
   - الشحن والتوصيل.
   - الشروط والأحكام.
   - الأسئلة الشائعة.
6. ربط صفحات الفوتر بالمسارات الصحيحة.
7. تحسين صفحة 404.
8. تحسين حالات الخطأ العامة.
9. مراجعة كاملة للـ Responsive.
10. مراجعة RTL/LTR.
11. تحسين Accessibility.
12. تحسين Performance.
13. إضافة Analytics events.
14. مراجعة الصور والـ lazy loading.
15. مراجعة الترجمة ومفاتيح i18n.
16. تنظيف الكود والـ imports.
17. إزالة الأكواد القديمة غير المستخدمة بعد التأكد.
18. توثيق الإغلاق النهائي.
19. إنشاء checklist نهائي للتسليم.
20. تشغيل lint/build وإصلاح الأخطاء.

## خارج النطاق

لا تنفذ في هذه المرحلة:

- إعادة بناء صفحات رئيسية من الصفر.
- إعادة بناء Cart أو Product Details من جديد.
- بناء CMS كامل للصفحات الثابتة.
- بناء Admin لإدارة الصفحات.
- بناء نظام مدفوعات جديد.
- بناء Backend جديد.
- بناء نظام Reviews كامل.
- بناء نظام كوبونات جديد.
- إعادة تصميم الهوية بالكامل.
- إضافة مكتبات كبيرة بلا ضرورة.

إذا كانت بعض الصفحات تحتاج إدارة من الباك إند مستقبلًا، نفذها الآن كصفحات ثابتة نظيفة مع TODO واضح.

---

# 4. الملفات الحالية المهمة للفحص

افحص قبل التنفيذ:

```txt
src/App.tsx
src/main.tsx
src/config/routes.tsx
src/router/*
src/components/layout/StoreLayout.tsx
src/components/layout/StoreFooter.tsx
src/components/layout/DesktopHeader.tsx
src/components/layout/MobileHeader.tsx
src/features/home/*
src/features/products/*
src/features/categories/*
src/features/search/*
src/features/product/*
src/features/cart/*
src/core/i18n/*
src/index.css
public/*
package.json
```

ابحث عن:

```txt
react-helmet
react-helmet-async
Helmet
meta
SEO
analytics
gtag
dataLayer
notFound
errorBoundary
i18n
locales
routes
```

لا تفترض وجود مكتبة SEO. افحص الموجود أولًا.

---

# 5. الهيكل المقترح للملفات

## SEO

```txt
src/components/seo/
├── SEO.tsx
├── seo.helpers.ts
├── seo.types.ts
└── index.ts
```

## Static Pages

```txt
src/features/static-pages/
├── AboutPage.tsx
├── ContactPage.tsx
├── PrivacyPolicyPage.tsx
├── ReturnPolicyPage.tsx
├── ShippingPolicyPage.tsx
├── TermsPage.tsx
├── FAQPage.tsx
├── StaticPageLayout.tsx
└── index.ts
```

## Analytics

```txt
src/lib/analytics/
├── analytics.ts
├── analytics.types.ts
└── index.ts
```

## Error/Not Found

```txt
src/features/errors/
├── NotFoundPage.tsx
├── GeneralErrorPage.tsx
└── index.ts
```

إذا كانت بنية المشروع مختلفة، التزم بالنمط الحالي مع الحفاظ على نفس المنطق.

---

# 6. SEO Requirements

## 6.1 إنشاء SEO Component

### الهدف

توحيد إدارة meta tags لكل صفحة.

### الملف

```txt
src/components/seo/SEO.tsx
```

### يجب أن يدعم

- title.
- description.
- canonical.
- og:title.
- og:description.
- og:image.
- og:type.
- twitter card.
- noindex اختياري.
- lang/locale اختياري حسب نظام اللغة.

### Props مقترحة

```ts
type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
};
```

### مهم

إذا المشروع يستخدم Vite/React SPA، استخدم المكتبة الموجودة إن وجدت مثل:

```txt
react-helmet-async
```

إذا لا توجد مكتبة، يمكن إضافتها فقط إذا كانت خفيفة ومناسبة.  
لا تضف مكتبات SEO كبيرة.

---

## 6.2 Default SEO

أنشئ helper أو config:

```txt
seo.helpers.ts
```

يحتوي على:

- اسم المتجر.
- وصف افتراضي.
- صورة افتراضية.
- base URL إن كان موجودًا من env.
- title template.

### مثال

```txt
{{pageTitle}} | {{storeName}}
```

---

## 6.3 SEO للصفحات الأساسية

يجب إضافة SEO إلى:

- HomePage.
- ProductsPage.
- CategoryPage.
- SearchPage.
- ProductDetailsPage.
- CartPage.
- AboutPage.
- ContactPage.
- Policy pages.
- FAQPage.
- NotFoundPage.

### أمثلة Titles

```txt
الرئيسية | اسم المتجر
كل المنتجات | اسم المتجر
نتائج البحث عن ... | اسم المتجر
اسم المنتج | اسم المتجر
السلة | اسم المتجر
```

### أمثلة Descriptions

يجب أن تكون مختصرة، طبيعية، وليست محشوة بالكلمات المفتاحية.

---

## 6.4 Product SEO

في صفحة المنتج:

- title من اسم المنتج.
- description من وصف المنتج أو fallback.
- og:image من صورة المنتج الرئيسية.
- og:type يمكن أن يكون `product` إن مدعوم.
- canonical من رابط المنتج.

### لا تفعل

- لا تعرض `undefined`.
- لا تجعل الوصف طويلًا جدًا.
- لا تستخدم صورة فارغة كـ og:image.

---

## 6.5 Category SEO

في صفحة التصنيف:

- title من اسم التصنيف.
- description من وصف التصنيف أو fallback.
- canonical من رابط التصنيف.

---

## 6.6 Search SEO

صفحة البحث غالبًا لا تحتاج index لكل query.

### المطلوب

- ضع `noIndex` لصفحات البحث إذا مناسب.
- خصوصًا `/search?q=...`.

---

## 6.7 Cart SEO

صفحة السلة يجب أن تكون:

```txt
noindex
```

لأنها صفحة خاصة بالمستخدم وليست للظهور في محركات البحث.

---

# 7. Static Pages Requirements

## 7.1 StaticPageLayout

### الهدف

توحيد تصميم الصفحات الثابتة.

### يحتوي على

- Breadcrumbs.
- عنوان.
- وصف اختياري.
- Content card أو article layout.
- Sidebar اختياري إذا مناسب.
- SEO.

### تصميم مطلوب

- Web page نظيفة.
- نصوص مقروءة.
- max-width مناسب.
- لا تشبه شاشة تطبيق.

---

## 7.2 AboutPage — من نحن

### يجب أن تحتوي

- تعريف مختصر بالمتجر/الشركة.
- ماذا يقدم المتجر.
- لماذا يثق المستخدم بالمتجر.
- رابط للتواصل.
- رابط للمنتجات.

### نص آمن مقترح

لا تذكر معلومات غير مؤكدة أو وعود كبيرة.  
استخدم نصوص عامة قابلة للتعديل لاحقًا.

---

## 7.3 ContactPage — تواصل معنا

### يجب أن تحتوي

- رقم هاتف إن كان موجودًا في config أو المشروع.
- البريد إن كان موجودًا.
- العنوان إن كان موجودًا.
- ساعات العمل إن وجدت.
- روابط social إن وجدت.
- نموذج تواصل فقط إذا كان backend يدعمه.

### إذا لا يوجد backend للنموذج

- لا تبني form وهمي.
- اعرض معلومات التواصل فقط.
- أو اجعل form disabled مع TODO داخلي، لكن لا تعرض form لا يعمل للمستخدم.

---

## 7.4 PrivacyPolicyPage

### يجب أن تحتوي

- نص سياسة خصوصية عام وآمن.
- توضيح جمع البيانات الأساسية.
- استخدام البيانات للطلبات والتواصل.
- عدم بيع البيانات.
- حق المستخدم في التواصل للاستفسار.

### تحذير

هذه ليست استشارة قانونية.  
لا تكتب وعودًا قانونية معقدة لا يمكن ضمانها.

---

## 7.5 ReturnPolicyPage

### يجب أن تحتوي

- شروط عامة للاسترجاع.
- أن الاسترجاع يعتمد على حالة المنتج ونوعه.
- ضرورة التواصل مع الدعم.
- المنتجات المستخدمة/المتضررة قد لا تقبل.
- مدة الاسترجاع إن كانت مؤكدة فقط.

### لا تفعل

- لا تحدد مدة مثل 7 أو 14 يومًا إن لم تكن مؤكدة من صاحب المشروع.

---

## 7.6 ShippingPolicyPage

### يجب أن تحتوي

- الشحن حسب المدينة والمنطقة.
- التكلفة تختلف حسب الطلب.
- مدة التوصيل تقديرية.
- التواصل للتأكيد.

### لا تفعل

- لا تذكر توصيل مجاني إلا إذا مؤكد.
- لا تذكر مدة محددة إلا إذا مؤكدة.

---

## 7.7 TermsPage

### يجب أن تحتوي

- استخدام المتجر.
- دقة الأسعار والتوفر.
- إمكانية تعديل الأسعار.
- مسؤولية المستخدم عن صحة البيانات.
- حدود عامة للخدمة.

---

## 7.8 FAQPage

### أسئلة مقترحة

- كيف أطلب منتجًا؟
- كيف أعرف توفر المنتج؟
- هل يوجد توصيل؟
- كيف أتواصل مع الدعم؟
- هل يمكن إرجاع المنتج؟
- هل الأسعار نهائية؟
- كيف أتابع طلبي؟

لا تضع إجابات قطعية غير مؤكدة.

---

# 8. Footer & Navigation Links

بعد إنشاء الصفحات الثابتة، حدّث Footer من المرحلة الأولى.

## يجب أن يحتوي Footer على روابط تعمل

- من نحن.
- تواصل معنا.
- سياسة الخصوصية.
- سياسة الاسترجاع.
- الشحن والتوصيل.
- الشروط والأحكام.
- الأسئلة الشائعة.
- المنتجات.
- التصنيفات.
- السلة.

### ممنوع

- ممنوع ترك روابط `#`.
- ممنوع ترك روابط مكسورة.
- إذا الصفحة غير موجودة، أنشئها أو أخف الرابط.

---

# 9. Not Found & Error Pages

## 9.1 NotFoundPage

### يجب أن تحتوي

- رسالة واضحة.
- زر العودة للرئيسية.
- زر تصفح المنتجات.
- تصميم Web احترافي.
- SEO noindex.

### نص مقترح

```txt
الصفحة غير موجودة
ربما تم حذف الصفحة أو تغيير الرابط.
```

## 9.2 GeneralErrorPage

إذا يوجد ErrorBoundary أو يمكن إضافته ببساطة:

- اعرض رسالة خطأ عامة.
- زر إعادة المحاولة.
- زر العودة للرئيسية.

لا تبالغ في بناء نظام Error Boundary إذا المشروع غير جاهز، لكن حسّن الموجود.

---

# 10. Analytics Requirements

## 10.1 إنشاء Analytics Helper

أنشئ:

```txt
src/lib/analytics/analytics.ts
```

### الهدف

توحيد تتبع الأحداث دون ربط الكود مباشرة بـ provider معين.

### وظائف مقترحة

```ts
trackEvent(name, params)
trackPageView(path, title)
trackViewProduct(product)
trackAddToCart(product, quantity)
trackSearch(query)
trackViewCategory(category)
trackBeginCheckout(cart)
trackRemoveFromCart(item)
```

### يجب

- تعمل بأمان حتى لو لم يوجد analytics provider.
- لا تسبب أخطاء في console.
- لا تكسر SSR/SPA.
- تستخدم `window` بعد التأكد من وجوده.

---

## 10.2 Events المطلوبة

أضف تتبع للأحداث التالية إذا ممكن:

- `page_view`
- `view_home`
- `view_product`
- `view_category`
- `search`
- `add_to_cart`
- `remove_from_cart`
- `begin_checkout`
- `view_cart`
- `filter_products`
- `sort_products`

### لا تفعل

- لا ترسل بيانات شخصية حساسة.
- لا ترسل رقم هاتف أو عنوان.
- لا ترسل بيانات غير ضرورية.
- لا تكسر التجربة إذا analytics غير موجود.

---

# 11. Performance Polish

## 11.1 Images

راجع:

- Product images.
- Hero images.
- Category images.
- OG images.

### يجب

- lazy loading للصور غير المهمة.
- صورة المنتج الرئيسية يمكن priority إذا الصفحة تحتاج.
- fallback images.
- object-fit مضبوط.
- لا توجد صور ضخمة بلا داعي.

---

## 11.2 Bundle

افحص:

- imports غير مستخدمة.
- مكتبات غير ضرورية.
- مكونات ضخمة.
- أي console.log متروك.

### مطلوب

- إزالة console.log غير الضرورية.
- إزالة الأكواد القديمة غير المستخدمة بعد التأكد.
- تنظيف imports.

---

## 11.3 Loading States

راجع كل الصفحات:

- Home.
- Products.
- Category.
- Search.
- Product Details.
- Cart.

تأكد أن loading states متناسقة وليست spinners عشوائية.

---

## 11.4 Empty States

راجع:

- لا منتجات.
- لا تصنيفات.
- لا نتائج بحث.
- سلة فارغة.
- منتج غير موجود.

تأكد أنها احترافية وتحتوي CTA واضح.

---

# 12. Accessibility Polish

راجع العناصر الأساسية:

## Header

- search input له label/aria-label.
- cart icon له aria-label.
- menu button له aria-label.
- language switch واضح.

## Product Cards

- الصور لها alt.
- أزرار الإضافة والمفضلة لها labels.
- focus states واضحة.

## Filters

- inputs لها labels.
- checkboxes واضحة.
- drawer يغلق بالزر.
- keyboard navigation قدر الإمكان.

## Product Details

- thumbnails buttons.
- quantity buttons.
- variants labels.
- tabs/accordion واضحة.

## Cart

- quantity controls labels.
- remove buttons labels.
- checkout button واضح.

## عام

- لا تعتمد على اللون فقط.
- contrast جيد.
- النصوص قابلة للقراءة.
- لا يوجد trap للكيبورد داخل drawer/modal.

---

# 13. RTL/LTR Polish

إذا المشروع يدعم العربية والإنجليزية:

## يجب اختبار

- Header.
- Footer.
- Home.
- Product Listing.
- Filters.
- Product Details.
- Cart.
- Static pages.
- Breadcrumbs.

## تحقق من

- اتجاه النصوص.
- محاذاة الأيقونات.
- ترتيب breadcrumbs.
- اتجاه arrows.
- موضع sidebar إذا مطلوب.
- السعر والعملة.
- عدم وجود overflow بسبب النص العربي أو الإنجليزي.

---

# 14. Responsive QA

اختبر على المقاسات:

## Mobile

```txt
360px
390px
430px
```

## Tablet

```txt
768px
820px
1024px
```

## Desktop

```txt
1280px
1440px
1920px
```

## صفحات يجب اختبارها

```txt
/
 /products
 /categories
 /categories/:id
 /search?q=test
 /products/:id
 /cart
 /about
 /contact
 /privacy-policy
 /return-policy
 /shipping-policy
 /terms
 /faq
 /not-found
```

---

# 15. i18n Final Review

## المطلوب

- لا تظهر مفاتيح ترجمة خام.
- لا توجد نصوص عربية hardcoded في مكونات تدعم الترجمة.
- لا توجد نصوص إنجليزية hardcoded في مكونات تدعم الترجمة.
- مفاتيح ar/en متطابقة قدر الإمكان.
- النصوص ليست طويلة بشكل يكسر التصميم.
- Footer و static pages مترجمة.

## ملاحظة

إذا الصفحات الثابتة تحتوي نصوص طويلة، يمكن وضعها في ملفات ترجمة أو داخل المكونات حسب بنية المشروع، لكن الأفضل دعم اللغتين.

---

# 16. Routing Final Review

## يجب

- كل روابط الهيدر تعمل.
- كل روابط الفوتر تعمل.
- روابط المنتجات تعمل.
- روابط التصنيفات تعمل.
- `/cart` يعمل.
- `/products` يعمل.
- `/categories` يعمل.
- old redirects تعمل إن أضيفت في المرحلة الأولى.
- catch-all route يذهب إلى NotFoundPage.

## ممنوع

- روابط `#`.
- روابط مكسورة.
- routes قديمة بدون redirect إذا كانت مستخدمة في مكان آخر.
- صفحات فارغة.

---

# 17. Security & Safety UI Review

## يجب

- عدم عرض HTML غير آمن بدون sanitization.
- عدم عرض أخطاء API التقنية للمستخدم.
- عدم كشف tokens أو env في الواجهة.
- عدم إرسال بيانات شخصية عبر analytics.
- عدم تخزين بيانات حساسة في localStorage دون سبب.
- التعامل مع الصور والروابط الخارجية بحذر.

---

# 18. خطوات التنفيذ

## Step 1 — فحص الوضع النهائي بعد المراحل السابقة

افتح وراجع:

- Home.
- Products.
- Product Details.
- Cart.
- Header/Footer.
- Routes.
- i18n.

وثق المشاكل المتبقية في notes.

---

## Step 2 — إنشاء SEO Component

- أنشئ `SEO.tsx`.
- أضف default SEO config.
- استخدمه في الصفحات الأساسية.
- ضع noindex للبحث والسلة و404 إن مناسب.

---

## Step 3 — إنشاء الصفحات الثابتة

أنشئ:

- AboutPage.
- ContactPage.
- PrivacyPolicyPage.
- ReturnPolicyPage.
- ShippingPolicyPage.
- TermsPage.
- FAQPage.
- StaticPageLayout.

أضف routes لها.

---

## Step 4 — تحديث Footer

- اربط كل الروابط بالصفحات الجديدة.
- احذف أي `#`.
- تأكد من أن الروابط تعمل.

---

## Step 5 — إنشاء NotFoundPage

- أضف catch-all route.
- أضف SEO noindex.
- أضف CTAs.

---

## Step 6 — إضافة Analytics Helper

- أنشئ analytics helper.
- أضف events الأساسية.
- لا تكسر التجربة إذا analytics غير مفعّل.

---

## Step 7 — ربط Analytics Events

اربط الأحداث في:

- Home view.
- Product view.
- Category view.
- Search.
- Add to cart.
- Remove from cart.
- Begin checkout.
- View cart.
- Filter/sort products.

---

## Step 8 — Performance Cleanup

- إزالة console.log.
- إزالة imports غير مستخدمة.
- مراجعة lazy loading.
- مراجعة skeletons.
- مراجعة الصور.

---

## Step 9 — Accessibility Pass

- aria labels.
- alt texts.
- focus states.
- drawer/modal keyboard behavior.
- forms labels.

---

## Step 10 — Responsive & RTL QA

اختبر المقاسات المذكورة وسجّل أي مشاكل وأصلحها.

---

## Step 11 — i18n Final Pass

راجع مفاتيح الترجمة بالعربية والإنجليزية.

---

## Step 12 — Build & Final Validation

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

## SEO

- [ ] يوجد SEO component.
- [ ] Home لها title/description.
- [ ] Products لها title/description.
- [ ] Category لها SEO مناسب.
- [ ] Product Details لها SEO مبني من المنتج.
- [ ] Cart عليها noindex.
- [ ] Search عليها noindex إذا مناسب.
- [ ] 404 عليها noindex.
- [ ] Open Graph موجود على الصفحات المهمة.

## Static Pages

- [ ] AboutPage موجودة.
- [ ] ContactPage موجودة.
- [ ] PrivacyPolicyPage موجودة.
- [ ] ReturnPolicyPage موجودة.
- [ ] ShippingPolicyPage موجودة.
- [ ] TermsPage موجودة.
- [ ] FAQPage موجودة.
- [ ] كلها تستخدم Layout موحد.
- [ ] كلها مربوطة من Footer.

## Navigation

- [ ] لا توجد روابط `#`.
- [ ] روابط الهيدر تعمل.
- [ ] روابط الفوتر تعمل.
- [ ] Catch-all route يعمل.
- [ ] old redirects لا تزال تعمل إن وجدت.

## Analytics

- [ ] analytics helper موجود.
- [ ] view_product event موجود.
- [ ] add_to_cart event موجود.
- [ ] search event موجود.
- [ ] begin_checkout event موجود.
- [ ] لا يتم إرسال بيانات حساسة.
- [ ] لا يحدث error إذا analytics provider غير موجود.

## Performance

- [ ] الصور غير المهمة lazy-loaded.
- [ ] لا توجد console.log غير ضرورية.
- [ ] لا توجد imports واضحة غير مستخدمة.
- [ ] loading states متناسقة.
- [ ] build size لم يزد بسبب مكتبات غير ضرورية.

## Accessibility

- [ ] أزرار الأيقونات لها aria-labels.
- [ ] الصور لها alt مناسب.
- [ ] inputs لها labels.
- [ ] focus states واضحة.
- [ ] لا توجد عناصر مهمة تعتمد على اللون فقط.

## Responsive

- [ ] Mobile 360/390/430 يعمل.
- [ ] Tablet 768/820/1024 يعمل.
- [ ] Desktop 1280/1440/1920 يعمل.
- [ ] لا يوجد overflow أفقي غير مقصود.
- [ ] BottomNav لا يغطي عناصر مهمة.

## i18n

- [ ] العربية تعمل.
- [ ] الإنجليزية تعمل.
- [ ] لا تظهر مفاتيح خام.
- [ ] RTL جيد.
- [ ] LTR جيد.

## Build

- [ ] TypeScript بدون أخطاء.
- [ ] Lint ناجح أو الأخطاء موثقة إذا المشروع فيه أخطاء قديمة.
- [ ] Build ناجح.
- [ ] لا توجد أخطاء Console واضحة في الاستخدام الأساسي.

---

# 20. اختبار يدوي نهائي

## User Journey 1 — Browse to Cart

1. افتح الرئيسية.
2. انتقل إلى المنتجات.
3. استخدم فلتر أو sort.
4. افتح منتج.
5. اختر كمية أو variant إن وجد.
6. أضف للسلة.
7. افتح السلة.
8. عدّل الكمية.
9. اضغط checkout.

يجب أن يعمل المسار بدون أخطاء.

---

## User Journey 2 — Search

1. استخدم البحث.
2. افتح صفحة النتائج.
3. اختبر حالة لا توجد نتائج.
4. افتح منتج من النتائج.
5. أضفه للسلة.

---

## User Journey 3 — Static Pages

1. افتح Footer.
2. افتح كل صفحة ثابتة.
3. تأكد من النصوص.
4. تأكد من Breadcrumbs.
5. تأكد من SEO title.

---

## User Journey 4 — Mobile

1. افتح الموقع على 390px.
2. اختبر header.
3. اختبر bottom nav.
4. اختبر product listing filters drawer.
5. اختبر product details sticky bar.
6. اختبر cart checkout bar.

---

# 21. تعليمات صارمة لوكيل التنفيذ

## ممنوع

- ممنوع إعادة بناء صفحات المراحل السابقة من الصفر.
- ممنوع إضافة مكتبات كبيرة بلا ضرورة.
- ممنوع ترك روابط `#`.
- ممنوع كتابة وعود قانونية أو تجارية غير مؤكدة.
- ممنوع إرسال بيانات شخصية في analytics.
- ممنوع كسر RTL.
- ممنوع تعطيل build بسبب تغييرات تجميلية.
- ممنوع إظهار HTML غير آمن.
- ممنوع حذف كود قد يكون مستخدمًا دون فحص.
- ممنوع ترك console.log.
- ممنوع ترك صفحات فارغة.

## مطلوب

- إغلاق احترافي.
- SEO أساسي.
- صفحات ثابتة واضحة.
- Footer مكتمل.
- 404 احترافي.
- Analytics آمن.
- Accessibility pass.
- Performance pass.
- Responsive QA.
- i18n final review.
- Build ناجح.
- ملف توثيق نهائي.

---

# 22. مخرجات المرحلة المطلوبة

في نهاية المرحلة يجب تسليم:

1. SEO component.
2. SEO helpers/types.
3. AboutPage.
4. ContactPage.
5. PrivacyPolicyPage.
6. ReturnPolicyPage.
7. ShippingPolicyPage.
8. TermsPage.
9. FAQPage.
10. StaticPageLayout.
11. NotFoundPage.
12. GeneralErrorPage إن أمكن.
13. Analytics helper.
14. Analytics events integration.
15. Footer links updated.
16. Final i18n keys.
17. Performance cleanup.
18. Accessibility fixes.
19. Responsive fixes.
20. ملف ملاحظات تنفيذ:

```txt
IMPLEMENTATION_NOTES_PHASE_7.md
```

21. ملف إغلاق نهائي:

```txt
STOREFRONT_FINAL_QA_CHECKLIST.md
```

---

# 23. نموذج IMPLEMENTATION_NOTES_PHASE_7.md

```md
# Implementation Notes — Phase 7

## Completed

- Added SEO component.
- Added default SEO helpers.
- Added SEO to main pages.
- Added static pages.
- Added NotFoundPage.
- Updated footer links.
- Added analytics helper.
- Integrated analytics events.
- Improved accessibility labels.
- Reviewed responsive behavior.
- Reviewed RTL/LTR.
- Cleaned unused imports and console logs.
- Added final QA checklist.

## SEO Pages Covered

- Home:
- Products:
- Category:
- Search:
- Product Details:
- Cart:
- Static Pages:
- Not Found:

## Static Pages Added

- About:
- Contact:
- Privacy Policy:
- Return Policy:
- Shipping Policy:
- Terms:
- FAQ:

## Analytics Events Added

- page_view:
- view_product:
- view_category:
- search:
- add_to_cart:
- remove_from_cart:
- begin_checkout:
- view_cart:
- filter_products:
- sort_products:

## Accessibility Fixes

- Header:
- Product Cards:
- Filters:
- Product Details:
- Cart:
- Static Pages:

## Performance Fixes

- Lazy loading:
- Removed console logs:
- Removed unused imports:
- Image fallback:
- Skeleton consistency:

## Responsive QA

- Mobile:
- Tablet:
- Desktop:

## Known Limitations

- CMS for static pages is not implemented.
- Legal texts are generic and should be reviewed before official launch.
- Analytics provider integration depends on environment configuration.
- Advanced SEO like sitemap/robots may require hosting/framework support.

## Modified Files

- src/components/seo/SEO.tsx
- src/components/seo/seo.helpers.ts
- src/components/seo/seo.types.ts
- src/features/static-pages/AboutPage.tsx
- src/features/static-pages/ContactPage.tsx
- src/features/static-pages/PrivacyPolicyPage.tsx
- src/features/static-pages/ReturnPolicyPage.tsx
- src/features/static-pages/ShippingPolicyPage.tsx
- src/features/static-pages/TermsPage.tsx
- src/features/static-pages/FAQPage.tsx
- src/features/static-pages/StaticPageLayout.tsx
- src/features/errors/NotFoundPage.tsx
- src/features/errors/GeneralErrorPage.tsx
- src/lib/analytics/analytics.ts
- src/config/routes.tsx
- src/components/layout/StoreFooter.tsx
- src/core/i18n/locales/ar/*.json
- src/core/i18n/locales/en/*.json
```

---

# 24. نموذج STOREFRONT_FINAL_QA_CHECKLIST.md

```md
# Storefront Final QA Checklist

## Core Pages

- [ ] Home page works.
- [ ] Products page works.
- [ ] Category page works.
- [ ] Search page works.
- [ ] Product details page works.
- [ ] Cart page works.
- [ ] Static pages work.
- [ ] 404 page works.

## Desktop

- [ ] Header looks professional.
- [ ] Footer links work.
- [ ] Product listing has filters.
- [ ] Product details layout is desktop-friendly.
- [ ] Cart uses two-column layout.
- [ ] No mobile bottom nav on desktop.

## Mobile

- [ ] Mobile header works.
- [ ] Bottom nav works.
- [ ] Filters drawer works.
- [ ] Product sticky add-to-cart works.
- [ ] Cart mobile checkout bar works.
- [ ] No important content is covered.

## SEO

- [ ] Meta titles exist.
- [ ] Meta descriptions exist.
- [ ] Product OG image works.
- [ ] Cart is noindex.
- [ ] Search is noindex if configured.
- [ ] 404 is noindex.

## i18n

- [ ] Arabic works.
- [ ] English works.
- [ ] No raw translation keys.
- [ ] RTL is correct.
- [ ] LTR is correct.

## Cart Flow

- [ ] Add to cart works.
- [ ] Quantity update works.
- [ ] Remove item works.
- [ ] Empty cart works.
- [ ] Checkout CTA works.

## Analytics

- [ ] page_view fires safely.
- [ ] view_product fires safely.
- [ ] add_to_cart fires safely.
- [ ] search fires safely.
- [ ] begin_checkout fires safely.
- [ ] No sensitive data is sent.

## Build

- [ ] Lint passes.
- [ ] Build passes.
- [ ] No critical console errors.
```

---

# 25. Definition of Done

تعتبر المرحلة السابعة مغلقة عندما يصبح الويب أب:

> متجر ويب احترافي مكتمل الأساسيات، لديه SEO، صفحات ثابته، روابط سليمة، تجربة Responsive، وصولية جيدة، Analytics آمن، وأداء نظيف.

وليس:

> واجهة متجر شكلها جيد لكن ناقصة تفاصيل الإطلاق والثقة والصفحات الأساسية.

بانتهاء هذه المرحلة تكون خطة تحويل الويب أب إلى متجر ويب احترافي قد اكتملت من ناحية الواجهة وتجربة المستخدم الأساسية.
