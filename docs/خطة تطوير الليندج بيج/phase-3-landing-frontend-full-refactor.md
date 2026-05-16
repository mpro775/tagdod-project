# Phase 3 — Landing Frontend Full Refactor

## الهدف العام

تحويل مشروع `landing-page` إلى واجهة احترافية تعتمد بالكامل على بيانات الباك إند القادمة من:

```http
GET /landing/home
```

بحيث تصبح صفحة اللاندينج مجرد عارض ديناميكي للبيانات القادمة من الـ Backend Landing CMS، مع إزالة الاعتماد على البيانات الثابتة الأساسية داخل الكود، وتحسين التصميم، وتجربة المستخدم، والـ responsive، والـ SEO.

---

## نطاق هذه المرحلة

هذه المرحلة خاصة بمشروع:

```txt
landing-page
```

ولا يُسمح بتعديل الباك إند أو لوحة التحكم إلا إذا كان هناك خطأ بسيط جدًا في أسماء الحقول ويجب توثيقه فقط. الأصل أن Phase 1 و Phase 2 قد أغلقتا الباك إند ولوحة التحكم.

---

## قاعدة صارمة قبل البدء

يجب اعتبار الباك إند هو المصدر الوحيد للحقيقة.

ممنوع أن تبقى هذه الأقسام Static كبيانات أساسية داخل الفرونت:

```txt
Hero
About
Stats
Features
Projects
Products Showcase
Brands
Articles / News
App Showcase
Download CTA
Service Center
Contact Info
SEO
Section Order
```

المسموح فقط:

- fallback بسيط عند غياب البيانات.
- skeleton loading.
- empty state.
- error state.
- constants تقنية لا تمثل محتوى اللاندينج.

---

## المخرجات النهائية المطلوبة

بنهاية هذه المرحلة يجب أن تكون اللاندينج:

1. تقرأ كل بيانات الصفحة من `/landing/home`.
2. تعرض الأقسام حسب `sectionOrder` القادم من الباك إند.
3. تخفي أي قسم `enabled = false`.
4. تعرض محتوى عربي/إنجليزي حسب لغة الواجهة.
5. تدعم loading states.
6. تدعم error states.
7. تدعم empty states لكل قسم.
8. ترسل نموذج التواصل إلى المسار الصحيح.
9. تستخدم SEO data القادمة من API.
10. لا تحتوي على بيانات ثابتة أساسية للأقسام.
11. تكون responsive ومناسبة للموبايل والتابلت والديسكتوب.
12. تكون بتصميم احترافي موحد ومتناسق مع هوية المشروع.

---

# 1. فحص البنية الحالية

ابدأ بفحص مشروع `landing-page` بالكامل، خصوصًا:

```txt
src/
components/
pages/
app/
api/
services/
hooks/
lib/
utils/
styles/
```

وابحث تحديدًا عن:

- أماكن استدعاء `/landing/home`.
- أي استدعاءات متفرقة لـ projects/articles/about/brands/products.
- أي arrays ثابتة للأقسام.
- أي محتوى عربي أو إنجليزي مكتوب مباشرة داخل components.
- أي روابط ثابتة لـ Google Play / App Store.
- أي معلومات تواصل ثابتة.
- أي stats ثابتة.
- أي features ثابتة.
- أي steps ثابتة في app showcase.
- أي SEO metadata ثابت.

ثم وثّق الملفات التي سيتم تعديلها داخل ملف تنفيذ أو في ملخص نهائي.

---

# 2. إنشاء Landing API Client

يجب إنشاء أو تعديل API client مخصص للاندينج.

مثال أسماء مقترحة:

```txt
src/api/landingApi.ts
src/services/landingService.ts
src/lib/api/landing.ts
```

اختر المسار الأنسب حسب هيكلة المشروع الحالية.

## المطلوب

إنشاء دالة رئيسية:

```ts
getLandingHome(): Promise<LandingHomeResponse>
```

تستدعي:

```http
GET /landing/home
```

مع الالتزام بـ:

- استخدام base URL الموجود في المشروع.
- عدم تكرار axios/fetch logic في كل component.
- معالجة الأخطاء بشكل موحد.
- دعم AbortController إن كان المشروع يستخدم fetch.
- دعم token فقط إذا كان مطلوبًا، لكن صفحة اللاندينج العامة غالبًا لا تحتاج token.

---

# 3. تعريف Types واضحة

يجب إنشاء types للبيانات القادمة من الباك إند.

مثال:

```txt
src/types/landing.ts
```

## شكل عام مقترح

```ts
export type LandingSectionKey =
  | 'hero'
  | 'about'
  | 'stats'
  | 'features'
  | 'projects'
  | 'products'
  | 'brands'
  | 'articles'
  | 'appShowcase'
  | 'downloadCta'
  | 'serviceCenter'
  | 'contact';

export interface LandingHomeResponse {
  settings: LandingSettings;
  sections: LandingSections;
  sectionOrder: LandingSectionConfig[];
  seo?: LandingSeo;
}

export interface LandingSectionConfig {
  key: LandingSectionKey;
  enabled: boolean;
  sortOrder: number;
  titleAr?: string;
  titleEn?: string;
}
```

ثم عرّف Types لكل قسم:

```txt
LandingHero
LandingAbout
LandingStat
LandingFeature
LandingProject
LandingProduct
LandingBrand
LandingArticle
LandingAppShowcase
LandingDownloadCta
LandingServiceCenter
LandingContactInfo
LandingSeo
```

## ملاحظات مهمة

- لا تستخدم `any` إلا مؤقتًا وبأضيق نطاق.
- لا تكسر المشروع إن رجع حقل اختياري `null`.
- اجعل الصور والروابط optional.
- اجعل الحقول متعددة اللغة واضحة مثل:

```ts
titleAr?: string;
titleEn?: string;
descriptionAr?: string;
descriptionEn?: string;
```

أو إذا كان الباك إند يستخدم:

```ts
title: { ar: string; en: string }
```

التزم بشكل الباك إند الحقيقي ولا تخترع شكلًا مختلفًا.

---

# 4. بناء Hook رئيسي للصفحة

أنشئ hook مركزي:

```ts
useLandingHome()
```

في مكان مناسب مثل:

```txt
src/hooks/useLandingHome.ts
```

## يجب أن يرجع

```ts
{
  data,
  isLoading,
  error,
  refetch
}
```

أو حسب المكتبة المستخدمة في المشروع مثل React Query.

## إن كان المشروع يستخدم React Query

استخدم query key واضح:

```ts
['landing-home']
```

مع إعدادات مناسبة:

```ts
staleTime: 5 * 60 * 1000
retry: 1
```

## إن لم يكن يستخدم React Query

استخدم `useEffect` و `useState` بشكل نظيف مع منع memory leaks.

---

# 5. بناء LandingHomeProvider اختياريًا

إذا كانت البيانات تمر عبر components كثيرة، أنشئ Provider:

```txt
src/providers/LandingHomeProvider.tsx
```

أو:

```txt
src/context/LandingHomeContext.tsx
```

## الهدف

منع تمرير props عميقة جدًا، وتوحيد مصدر البيانات داخل الصفحة.

## ممنوع

- استدعاء `/landing/home` في كل section.
- جعل كل section يجلب بياناته بنفسه.

---

# 6. بناء Dynamic Section Renderer

يجب أن يصبح ترتيب الأقسام من الباك إند، وليس ثابتًا في الكود.

أنشئ component مثل:

```txt
src/components/landing/DynamicSectionRenderer.tsx
```

## منطق العرض

```ts
const sectionComponents = {
  hero: HeroSection,
  about: AboutSection,
  stats: StatsSection,
  features: FeaturesSection,
  projects: ProjectsSection,
  products: ProductsShowcaseSection,
  brands: BrandsSection,
  articles: ArticlesSection,
  appShowcase: AppShowcaseSection,
  downloadCta: DownloadCtaSection,
  serviceCenter: ServiceCenterSection,
  contact: ContactSection,
};
```

ثم:

```ts
sectionOrder
  .filter(section => section.enabled)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map(section => renderSection(section.key));
```

## قواعد مهمة

- إذا جاء key غير معروف من الباك إند، تجاهله بدون كسر الصفحة.
- إذا كان القسم enabled لكن بياناته فارغة، اعرض empty state مناسب أو أخفه حسب طبيعة القسم.
- لا تجعل الصفحة تنهار بسبب missing field.

---

# 7. ربط Hero Section

حوّل Hero ليقرأ من API.

## يجب دعم

- title عربي/إنجليزي.
- subtitle عربي/إنجليزي.
- description إن وجد.
- primary CTA.
- secondary CTA.
- صورة Hero.
- فيديو Hero إن وجد.
- badges أو trust indicators إن وجدت.
- روابط التطبيقات إن كانت تظهر في Hero.

## المطلوب تصميميًا

- Hero واضح وقوي.
- CTA بارز.
- تصميم responsive.
- الصورة أو الفيديو لا تكسر الأداء.
- استخدام lazy loading للصور غير الحرجة.
- الاهتمام بـ LCP إذا كانت صورة Hero أساسية.

---

# 8. ربط About Section

يجب جلب بيانات About من `sections.about` أو حسب response Phase 1.

## يجب دعم

- عنوان القسم.
- وصف الشركة.
- الرؤية.
- الرسالة.
- القيم.
- صورة أو illustration إن وجدت.
- زر CTA إن وجد.

## ملاحظة

إذا كانت About تحتوي على محتوى طويل، اعرضه بشكل مختصر في الصفحة الرئيسية مع رابط تفاصيل إن كان موجودًا.

---

# 9. ربط Stats Section

يجب أن تأتي الإحصائيات من API.

## مثال بيانات

```ts
stats: [
  {
    labelAr: 'مشروع مكتمل',
    labelEn: 'Completed Projects',
    value: 120,
    suffix: '+',
    icon: 'briefcase',
    sortOrder: 1
  }
]
```

## المطلوب

- عرض الإحصائيات بشكل جذاب.
- دعم suffix/prefix.
- دعم icon اختياري.
- إخفاء القسم إذا لا توجد stats.
- عدم استخدام أرقام ثابتة من الكود.

---

# 10. ربط Features Section

يجب إزالة array الثابتة الخاصة بالمميزات.

## المطلوب

- عرض features القادمة من API.
- دعم title/description عربي وإنجليزي.
- دعم icon أو image.
- دعم sortOrder.
- إخفاء feature غير مفعّلة إن كان موجودًا.
- تصميم cards احترافي.

## Empty State

إذا لا توجد features، لا تعرض القسم أو اعرض رسالة بسيطة حسب القرار العام.

---

# 11. ربط Projects Section

يجب عرض المشاريع المختارة للاندينج فقط.

## المطلوب

- عرض المشاريع القادمة من `/landing/home`.
- عدم جلب المشاريع من API منفصل إلا إذا كان ذلك مصممًا صراحة في Phase 1.
- دعم:
  - title
  - description
  - image
  - category/type
  - technologies
  - slug
  - featured badge
  - sortOrder
- زر “عرض المزيد” إن كان هناك صفحة مشاريع.

## تصميم الكارد

يجب تحسين كارد المشروع:

- صورة واضحة.
- عنوان مختصر.
- وصف لا يتجاوز عدد أسطر محدد.
- badges للتقنيات الحقيقية.
- CTA واضح.
- hover effect ناعم.
- responsive grid.

---

# 12. ربط Products Showcase

هذا القسم للعرض فقط وليس للبيع.

## المطلوب

- عرض المنتجات المختارة في لوحة التحكم للظهور في اللاندينج.
- عدم عرض زر شراء أو سلة.
- عرض المنتج كـ showcase.
- دعم:
  - landingTitle
  - landingDescription
  - landingImage
  - badge
  - category
  - brand
  - sortOrder

## ممنوع

- تحويل القسم إلى متجر بيع.
- استخدام بيانات products عامة غير مفلترة.
- عرض منتجات غير مفعلة للاندينج.

---

# 13. ربط Brands Section

## المطلوب

- عرض البراندات القادمة من API.
- دعم logo.
- دعم description إن وجد.
- دعم sortOrder.
- دعم showOnLanding.
- تصميم مناسب مثل carousel أو grid حسب الموجود.

## ملاحظة تصميمية

لا تجعل البراندات مزدحمة. إن كان العدد كبيرًا، استخدم slider أو marquee خفيف بدون إزعاج.

---

# 14. ربط Articles / News Section

## المطلوب

- عرض المقالات/الأخبار المختارة للاندينج.
- دعم:
  - title
  - excerpt
  - cover image
  - publishedAt
  - category
  - slug
  - featured
- زر “قراءة المزيد”.
- زر “كل الأخبار” إن وجدت صفحة مقالات.

## قواعد

- لا تعرض مقالات draft.
- لا تعرض مقالات غير منشورة.
- لا تستخدم بيانات static.

---

# 15. ربط App Showcase Section

يجب إزالة خطوات التطبيق الثابتة من الكود.

## المطلوب

- عنوان القسم.
- وصف القسم.
- صورة أو مجموعة screenshots.
- خطوات الاستخدام من API.
- دعم icon لكل خطوة.
- دعم sortOrder.
- CTA إن وجد.

## تصميم مقترح

- Layout فيه صورة تطبيق من جهة وخطوات من جهة.
- على الموبايل تصبح الصورة ثم الخطوات.
- animations خفيفة بدون مبالغة.

---

# 16. ربط Download CTA

## المطلوب

- العنوان من API.
- الوصف من API.
- رابط Google Play من API.
- رابط App Store من API.
- QR Code إن وجد.
- صورة أو خلفية القسم من API.

## قواعد

- إذا رابط App Store غير موجود، لا تعرض الزر.
- إذا رابط Google Play غير موجود، لا تعرض الزر.
- لا تستخدم روابط ثابتة.

---

# 17. ربط Service Center Section

## المطلوب

- العنوان.
- الوصف.
- الخدمات.
- أوقات الدوام.
- العنوان.
- أرقام التواصل.
- واتساب.
- إيميل.
- الخريطة إن وجدت.
- CTA للحجز أو التواصل.

## مهم

هذا القسم يجب أن يكون Dynamic بالكامل من API، ولا تبقى بيانات المركز ثابتة داخل الكود.

---

# 18. ربط Contact Section / Form

يجب إصلاح نموذج التواصل ليستخدم المسار الصحيح المعتمد في Phase 1:

```http
POST /landing/contact
```

## الحقول المقترحة

```ts
{
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  source?: 'landing';
}
```

## المطلوب

- validation واضح.
- رسائل خطأ مفهومة.
- رسالة نجاح بعد الإرسال.
- منع الإرسال المكرر أثناء loading.
- reset form بعد النجاح.
- ربط معلومات التواصل المعروضة من API.

## ممنوع

- إرسال إلى `/contact-requests` مباشرة إذا تم اعتماد `/landing/contact`.
- إخفاء أخطاء API بدون رسالة.

---

# 19. دعم اللغة العربية والإنجليزية

يجب أن تعرض كل النصوص حسب لغة المستخدم.

## المطلوب

إنشاء helper مثل:

```ts
getLocalizedValue({ ar, en }, locale)
```

أو:

```ts
pickLocalized(entity, 'title', locale)
```

حسب شكل البيانات.

## قواعد

- إذا اللغة عربية استخدم النص العربي.
- إذا اللغة إنجليزية استخدم النص الإنجليزي.
- إذا النص المطلوب غير موجود، استخدم اللغة الأخرى كـ fallback.
- لا تعرض `undefined` أو نص فارغ بطريقة سيئة.

---

# 20. SEO من API

يجب ربط metadata من `seo` القادم من `/landing/home`.

## إذا المشروع Next.js App Router

استخدم:

```ts
export async function generateMetadata()
```

واجلب SEO من API أو استخدم endpoint خفيف إن وجد.

## إذا المشروع React SPA

استخدم `react-helmet-async` أو الآلية الموجودة في المشروع.

## يجب دعم

- title.
- description.
- keywords.
- canonical.
- og:title.
- og:description.
- og:image.
- twitter card.
- robots index/noindex.
- JSON-LD إن كان مدعومًا.

## ممنوع

- إبقاء SEO ثابت فقط في index.html أو layout.

---

# 21. Loading / Error / Empty States

## Loading

أضف Skeleton مناسب:

```txt
HeroSkeleton
SectionSkeleton
CardSkeleton
```

لا تعرض شاشة بيضاء.

## Error

في حال فشل `/landing/home`:

- اعرض رسالة واضحة.
- وفر زر إعادة المحاولة.
- لا تكسر الصفحة.

مثال:

```txt
تعذر تحميل الصفحة حاليًا. حاول مرة أخرى.
```

## Empty

إذا كان قسم معين لا يحتوي بيانات:

- أخفِ القسم إن كان ظهوره غير مفيد.
- أو اعرض empty state بسيط في الأقسام الإدارية فقط إن كان مناسبًا.

---

# 22. تحسين التصميم والهوية

يجب توحيد شكل اللاندينج بالكامل.

## المطلوب

- نظام ألوان موحد.
- خلفيات متناسقة.
- باترن خفيف إن كان ضمن الهوية.
- كاردات حديثة.
- مسافات موحدة.
- Typography واضح.
- Buttons موحدة.
- Section headers موحدة.
- responsive grid.
- hover states ناعمة.
- animations بسيطة وغير مزعجة.

## ممنوع

- قسم dark وقسم light عشوائي بدون نظام.
- ألوان غير من الهوية.
- اختلاف كبير بين كاردات المشاريع والمنتجات والمقالات بدون سبب.
- ازدحام بصري.

---

# 23. Responsive Design

يجب اختبار وتحسين:

```txt
Mobile: 360px - 480px
Tablet: 768px - 1024px
Desktop: 1280px+
Large: 1440px+
```

## المطلوب

- Hero لا ينكسر على الموبايل.
- الصور لا تخرج من الشاشة.
- grids تتحول بشكل صحيح.
- carousels تعمل باللمس.
- النصوص لا تكون كبيرة جدًا أو صغيرة جدًا.
- الأزرار سهلة الضغط.

---

# 24. تحسين الصور والأداء

## المطلوب

- استخدام image optimization إن كان Next.js.
- إضافة width/height للصور قدر الإمكان.
- lazy loading للصور غير الأساسية.
- عدم تحميل فيديو Hero تلقائيًا بشكل يضر الأداء إلا إذا كان ضروريًا.
- استخدام placeholder أو blur إن كان متاحًا.
- منع layout shift.

---

# 25. إزالة أو عزل البيانات الثابتة

بعد الربط، ابحث عن كل البيانات الثابتة للأقسام.

## يجب إزالة أو تحويل التالي

```txt
features array
stats array
app steps array
brands mock array
projects mock array
products mock array
articles mock array
contact static info
service center static info
download links static values
hero static content
```

## المسموح

ملف fallback واحد فقط مثل:

```txt
src/constants/landingFallback.ts
```

ويستخدم فقط عند غياب بيانات اختيارية، وليس كبديل دائم للـ API.

---

# 26. Validation قبل التسليم

نفذ الأوامر المناسبة حسب المشروع:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

أو:

```bash
yarn lint
yarn typecheck
yarn build
```

أو حسب package manager المستخدم.

يجب إصلاح أي أخطاء TypeScript أو ESLint ناتجة عن هذه المرحلة.

---

# 27. اختبار يدوي مطلوب

اختبر السيناريوهات التالية:

## الصفحة الرئيسية

- فتح اللاندينج مع API يعمل.
- فتح اللاندينج مع API لا يعمل.
- فتح اللاندينج مع قسم معطل.
- فتح اللاندينج مع قسم فارغ.
- تغيير ترتيب الأقسام من الباك إند والتحقق من ظهوره.
- تغيير اللغة والتحقق من النصوص.

## النموذج

- إرسال نموذج صحيح.
- إرسال نموذج ناقص.
- فشل API.
- نجاح API.
- منع الضغط المتكرر.

## Responsive

- فحص الموبايل.
- فحص التابلت.
- فحص الديسكتوب.

## SEO

- فحص عنوان الصفحة.
- فحص الوصف.
- فحص OG image.
- فحص canonical.

---

# 28. الملفات المتوقعة التي قد تتغير

قد تختلف حسب هيكلة المشروع، لكن غالبًا ستعدل أو تضيف ملفات مثل:

```txt
src/api/landingApi.ts
src/services/landingService.ts
src/types/landing.ts
src/hooks/useLandingHome.ts
src/providers/LandingHomeProvider.tsx
src/components/landing/DynamicSectionRenderer.tsx
src/components/Hero.tsx
src/components/About.tsx
src/components/Stats.tsx
src/components/Features.tsx
src/components/Projects.tsx
src/components/ProductsShowcase.tsx
src/components/Brands.tsx
src/components/Articles.tsx
src/components/AppShowcase.tsx
src/components/DownloadCTA.tsx
src/components/ServiceCenter.tsx
src/components/Contact.tsx
src/pages/Home.tsx
src/app/page.tsx
src/app/layout.tsx
src/styles/*
```

لا تنشئ ملفات مكررة إذا كانت توجد ملفات مناسبة بالفعل. عدّل الموجود بدل صناعة بنية متوازية.

---

# 29. معايير القبول النهائية

تعتبر Phase 3 مكتملة فقط إذا تحقق التالي:

```txt
[ ] GET /landing/home هو مصدر بيانات الصفحة الرئيسي.
[ ] لا توجد بيانات static أساسية للأقسام.
[ ] Dynamic Section Renderer يعمل حسب sectionOrder.
[ ] الأقسام المعطلة لا تظهر.
[ ] Hero مربوط بالباك إند.
[ ] About مربوط بالباك إند.
[ ] Stats مربوطة بالباك إند.
[ ] Features مربوطة بالباك إند.
[ ] Projects مربوطة بالباك إند.
[ ] Products Showcase مربوط بالباك إند.
[ ] Brands مربوطة بالباك إند.
[ ] Articles مربوطة بالباك إند.
[ ] App Showcase مربوط بالباك إند.
[ ] Download CTA مربوط بالباك إند.
[ ] Service Center مربوط بالباك إند.
[ ] Contact Form يرسل إلى /landing/contact.
[ ] SEO مربوط من API.
[ ] loading states موجودة.
[ ] error states موجودة.
[ ] empty states آمنة.
[ ] التصميم موحد واحترافي.
[ ] الصفحة responsive.
[ ] npm/yarn build يعمل بدون أخطاء.
[ ] lint/typecheck يعملان أو تم توثيق سبب عدم توفرهما.
```

---

# 30. ممنوعات صارمة

يُمنع أثناء تنفيذ هذه المرحلة:

1. تعديل الباك إند بشكل جذري.
2. اختراع response shape مختلف عن Phase 1.
3. إبقاء features/stats/app steps static.
4. استخدام mock data كبيانات رئيسية.
5. تكرار استدعاء `/landing/home` داخل كل component.
6. كسر اللغة العربية أو اتجاه RTL.
7. كسر responsive.
8. تجاهل أخطاء API.
9. إخفاء الأقسام الفارغة بطريقة تسبب فراغات كبيرة.
10. ترك TypeScript errors.
11. إضافة مكتبات ثقيلة بدون ضرورة.

---

# 31. تقرير التسليم المطلوب من وكيل التنفيذ

بعد الانتهاء، يجب أن يكتب الوكيل تقريرًا مختصرًا يحتوي:

```md
# Phase 3 Delivery Report

## Completed
- ...

## Files Changed
- ...

## API Integration
- Main endpoint used: GET /landing/home
- Contact endpoint used: POST /landing/contact

## Removed Static Data
- ...

## UI/UX Improvements
- ...

## SEO Changes
- ...

## Validation Commands
- npm run lint: passed/failed
- npm run typecheck: passed/failed
- npm run build: passed/failed

## Known Notes
- ...

## Final Checklist
- [x] ...
```

---

# 32. النتيجة المتوقعة بعد Phase 3

بعد تنفيذ هذه المرحلة، يجب أن تصبح اللاندينج:

```txt
Dynamic
Managed from Backend
Controlled by Admin Dashboard
Responsive
SEO-ready
Professionally designed
Safe against missing data
Ready for final QA in Phase 4
```

هذه المرحلة لا تعتبر مغلقة إذا كانت الصفحة جميلة بصريًا فقط، لكنها ما زالت تعتمد على بيانات ثابتة. الجمال وحده ليس كافيًا. الإغلاق الحقيقي هو أن كل شيء أساسي يأتي من الباك إند ويُدار من لوحة التحكم.
