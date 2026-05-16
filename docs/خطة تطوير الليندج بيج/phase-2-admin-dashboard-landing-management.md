# Phase 2 — Admin Dashboard Full Landing Management

## الهدف العام

إغلاق المرحلة الثانية من تطوير نظام اللاندينج عبر تحويل لوحة التحكم إلى مركز إدارة كامل لكل محتوى صفحة اللاندينج، بحيث يستطيع الأدمن التحكم في النصوص، الصور، الترتيب، التفعيل/التعطيل، المنتجات، البراندات، المشاريع، المقالات، السيو، والمعاينة دون تعديل الكود.

بعد إنهاء هذه المرحلة يجب أن تكون لوحة التحكم قادرة على إدارة صفحة اللاندينج بالكامل اعتمادًا على APIs التي تم تجهيزها في Phase 1.

---

## نطاق هذه المرحلة

هذه المرحلة خاصة بمشروع لوحة التحكم فقط:

```txt
admin-dashboard/
```

المطلوب هو تطوير واجهات الإدارة والربط مع الباك إند.

يُمنع تعديل الباك إند إلا في حالات بسيطة جدًا مثل تصحيح typing أو توثيق endpoint مفقود تم اكتشافه أثناء الربط. أي نقص حقيقي في API يجب توثيقه في `IMPLEMENTATION_NOTES.md` ولا يتم بناء workaround عشوائي في الفرونت.

يُمنع تعديل مشروع اللاندينج العام:

```txt
landing-page/
```

لأن ربط اللاندينج نفسها سيتم في Phase 3.

---

## الاعتماد الإجباري على Phase 1

يجب أن تفترض هذه المرحلة أن Phase 1 وفرت APIs إدارية واضحة مثل:

```http
GET    /admin/landing/home
GET    /admin/landing/settings
PATCH  /admin/landing/settings
GET    /admin/landing/sections
PATCH  /admin/landing/sections/:key
POST   /admin/landing/sections/reorder
GET    /admin/landing/features
POST   /admin/landing/features
PATCH  /admin/landing/features/:id
DELETE /admin/landing/features/:id
POST   /admin/landing/features/reorder
GET    /admin/landing/stats
POST   /admin/landing/stats
PATCH  /admin/landing/stats/:id
DELETE /admin/landing/stats/:id
POST   /admin/landing/stats/reorder
GET    /admin/landing/app-showcase
PATCH  /admin/landing/app-showcase
GET    /admin/landing/download-cta
PATCH  /admin/landing/download-cta
GET    /admin/landing/service-center
PATCH  /admin/landing/service-center
GET    /admin/landing/contact-info
PATCH  /admin/landing/contact-info
GET    /admin/landing/seo
PATCH  /admin/landing/seo
GET    /admin/landing/products
PATCH  /admin/landing/products/:id
POST   /admin/landing/products/bulk-update
GET    /admin/landing/brands
PATCH  /admin/landing/brands/:id
POST   /admin/landing/brands/bulk-update
GET    /admin/landing/preview
POST   /admin/landing/publish
POST   /admin/landing/unpublish
```

إذا كانت أسماء المسارات النهائية في Phase 1 مختلفة، يجب استخدام المسارات الفعلية من الباك إند، لكن بدون تغيير الهدف الوظيفي.

---

## المشكلة الحالية في لوحة التحكم

يوجد حاليًا أساس جيد في لوحة التحكم لبعض أجزاء اللاندينج، مثل:

```txt
src/features/landing-settings/
src/features/landing-products/
src/features/landing-brands/
src/features/projects/
src/features/articles/
src/features/about/
src/features/contact-requests/
```

لكن الإدارة ليست موحدة وليست كاملة. بعض الأقسام ما زالت غير موجودة كإدارة مستقلة، مثل:

```txt
Features
Statistics
App Showcase
Download CTA
Service Center
SEO الكامل
Sections Order
Preview / Publish Workflow
```

كما أن بعض الصفحات الحالية قد تعتمد على endpoints قديمة أو غير متطابقة مع Phase 1.

المطلوب في هذه المرحلة ليس مجرد إضافة صفحات متفرقة، بل بناء تجربة إدارة متماسكة باسم:

```txt
Landing Page Management Center
```

---

## النتيجة النهائية المطلوبة

بعد إنهاء المرحلة يجب أن توجد لوحة إدارة كاملة للاندينج تشمل تبويبات/أقسام:

```txt
1. Overview
2. Hero & Main Settings
3. Sections Order
4. About
5. Statistics
6. Features
7. Projects Showcase
8. Products Showcase
9. Brands Showcase
10. Articles / News
11. App Showcase
12. Download CTA
13. Service Center
14. Contact Info
15. SEO
16. Preview & Publish
```

ويجب أن يكون كل قسم:

- مربوطًا بالباك إند.
- يدعم العربية والإنجليزية.
- يدعم التفعيل والتعطيل إن كان قسمًا عامًا.
- يدعم الترتيب إن كان يحتوي عناصر متعددة.
- يدعم حالة loading.
- يدعم error state.
- يدعم empty state.
- لا يعتمد على mock/static data.
- يستخدم نظام الترجمة الحالي i18n.
- يحترم تصميم لوحة التحكم الحالي.

---

## قواعد صارمة للتنفيذ

### 1. لا بيانات ثابتة

ممنوع بناء قوائم ثابتة للمحتوى الحقيقي مثل:

```ts
const features = [...]
const stats = [...]
const appSteps = [...]
```

المسموح فقط:

- قائمة مفاتيح أقسام ثابتة `section keys` إذا كانت جزءًا من contract مع الباك إند.
- fallback UI عند فشل التحميل، بدون اعتباره محتوى حقيقي.

---

### 2. لا API calls مباشرة داخل الصفحات

يجب الالتزام بنمط المشروع:

```txt
api/
hooks/
types/
pages/
components/
```

مثال:

```txt
src/features/landing-management/api/landingManagementApi.ts
src/features/landing-management/hooks/useLandingManagement.ts
src/features/landing-management/types/landing-management.types.ts
src/features/landing-management/pages/LandingManagementPage.tsx
src/features/landing-management/components/
```

أو يمكن التوسعة داخل features الحالية إذا كان ذلك أنظف، لكن يجب أن يكون التنظيم واضحًا.

---

### 3. لا تكرار غير ضروري

إذا كانت هناك صفحات قديمة مثل:

```txt
landing-settings
landing-products
landing-brands
```

فلا تبنِ صفحات جديدة منفصلة بالكامل وتترك القديمة تعمل بشكل متضارب.

إما:

1. دمجها داخل Landing Management Center.
2. أو إبقاؤها كصفحات فرعية لكن يتم الوصول إليها من المركز نفسه.
3. أو تحويلها لمكونات reusable داخل المركز.

الأهم: لا يوجد مصدرين مختلفين لنفس الإدارة.

---

### 4. الالتزام بالترجمة

كل نص ظاهر للمستخدم يجب أن يكون من ملفات i18n.

أضف namespace جديد إن لزم:

```txt
landingManagement
```

مع الملفات:

```txt
src/core/i18n/locales/ar/landingManagement.json
src/core/i18n/locales/en/landingManagement.json
```

ثم أضفه إلى:

```txt
src/core/i18n/config.ts
```

لا تترك نصوص عربية أو إنجليزية hardcoded داخل المكونات.

---

### 5. التوافق مع الصلاحيات

إذا كان المشروع يدعم permissions/roles، يجب إضافة صلاحية أو الاعتماد على صلاحية مناسبة مثل:

```txt
landing:read
landing:update
landing:publish
```

إذا لم يكن نظام الصلاحيات مفعلًا بهذه الصيغة، لا تكسر المشروع. استخدم النمط الموجود حاليًا ووثق المقترح في `IMPLEMENTATION_NOTES.md`.

---

## هيكل الملفات المقترح

أنشئ feature موحد:

```txt
src/features/landing-management/
├── api/
│   └── landingManagementApi.ts
├── components/
│   ├── LandingManagementHeader.tsx
│   ├── LandingOverviewCards.tsx
│   ├── LandingSectionStatusCard.tsx
│   ├── LandingSectionToggle.tsx
│   ├── LandingSectionOrderEditor.tsx
│   ├── HeroSettingsForm.tsx
│   ├── AboutLandingPanel.tsx
│   ├── StatsManager.tsx
│   ├── StatItemDialog.tsx
│   ├── FeaturesManager.tsx
│   ├── FeatureItemDialog.tsx
│   ├── ProjectsShowcaseManager.tsx
│   ├── ProductsShowcaseManager.tsx
│   ├── BrandsShowcaseManager.tsx
│   ├── ArticlesShowcaseManager.tsx
│   ├── AppShowcaseForm.tsx
│   ├── AppShowcaseStepDialog.tsx
│   ├── DownloadCtaForm.tsx
│   ├── ServiceCenterForm.tsx
│   ├── ContactInfoForm.tsx
│   ├── SeoSettingsForm.tsx
│   ├── PreviewPublishPanel.tsx
│   ├── UnsavedChangesGuard.tsx
│   └── index.ts
├── hooks/
│   ├── useLandingHomeAdmin.ts
│   ├── useLandingSettingsMutations.ts
│   ├── useLandingSections.ts
│   ├── useLandingFeatures.ts
│   ├── useLandingStats.ts
│   ├── useLandingProducts.ts
│   ├── useLandingBrands.ts
│   ├── useLandingPreview.ts
│   └── index.ts
├── pages/
│   └── LandingManagementPage.tsx
├── types/
│   └── landing-management.types.ts
└── index.ts
```

إذا قررت استخدام features الحالية بدل إنشاء feature جديد، يجب أن تكون النتيجة النهائية بنفس مستوى التنظيم.

---

## المطلوب تفصيليًا

# 1. إنشاء Landing Management Center

## الهدف

بناء صفحة مركزية لإدارة اللاندينج بالكامل.

## المسار المقترح

```txt
/landing-management
```

أو حسب نظام routes الحالي:

```txt
/admin/landing
```

استخدم نمط المشروع في:

```txt
src/core/router/routes.tsx
```

## واجهة الصفحة

يجب أن تحتوي على:

1. Header واضح باسم إدارة صفحة الهبوط.
2. حالة النشر الحالية.
3. آخر تحديث.
4. زر معاينة.
5. زر نشر.
6. زر إلغاء النشر إن كان مناسبًا.
7. Tabs أو Sidebar داخلي للتنقل بين أقسام الإدارة.

## تبويبات الصفحة

```txt
Overview
Hero & Settings
Sections Order
About
Statistics
Features
Projects
Products
Brands
Articles
App Showcase
Download CTA
Service Center
Contact Info
SEO
Preview & Publish
```

## معايير القبول

- تظهر الصفحة من القائمة الجانبية أو routes.
- لا تكسر الصفحات القديمة.
- تستدعي بيانات overview من API.
- تعرض loading عند التحميل.
- تعرض error state عند الفشل.
- تستخدم i18n بالكامل.

---

# 2. Overview Dashboard

## الهدف

إعطاء الأدمن ملخصًا سريعًا لحالة اللاندينج.

## البيانات المطلوبة

من API مثل:

```http
GET /admin/landing/home
```

أو:

```http
GET /admin/landing/overview
```

## يجب عرض

- حالة النشر: Published / Draft / Unpublished.
- عدد الأقسام المفعلة.
- عدد الأقسام المعطلة.
- عدد المنتجات المعروضة.
- عدد البراندات المعروضة.
- عدد المشاريع المعروضة.
- عدد المقالات المعروضة.
- حالة SEO: مكتمل / ناقص.
- آخر تاريخ تحديث.
- تحذيرات مثل: لا توجد صورة OG، لا يوجد description، قسم Hero ناقص، لا توجد منتجات مفعلة.

## معايير القبول

- تعرض البطاقات بشكل واضح.
- لا تعتمد على أرقام static.
- تعرض تحذيرات مفيدة من البيانات.

---

# 3. Hero & Main Settings

## الهدف

تطوير إدارة إعدادات اللاندينج الأساسية والـ Hero.

## الحقول المطلوبة

```ts
{
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroDescriptionAr?: string;
  heroDescriptionEn?: string;
  heroImage?: string;
  heroVideoUrl?: string;
  primaryCtaTextAr?: string;
  primaryCtaTextEn?: string;
  primaryCtaUrl?: string;
  secondaryCtaTextAr?: string;
  secondaryCtaTextEn?: string;
  secondaryCtaUrl?: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  isPublished?: boolean;
}
```

استخدم الحقول الفعلية من Phase 1 إن اختلفت الأسماء.

## المطلوب في الواجهة

- Form واضح مقسم إلى أقسام.
- حقول عربية وإنجليزية بجانب بعض أو بتبويبات لغة.
- رفع/اختيار صورة من Media إذا كان المشروع يدعم ذلك.
- preview صغير لصورة Hero.
- validation للروابط.
- حفظ التعديلات.

## معايير القبول

- يمكن تعديل العنوان والوصف والروابط والصور.
- يتم الحفظ عبر API.
- تظهر رسالة نجاح/فشل.
- لا يوجد hardcoded content.

---

# 4. Sections Order & Visibility

## الهدف

إدارة ترتيب وتفعيل أقسام اللاندينج.

## الأقسام المتوقعة

```txt
hero
about
stats
features
projects
products
brands
articles
appShowcase
downloadCta
serviceCenter
contact
```

## الواجهة المطلوبة

- قائمة أقسام قابلة للترتيب.
- toggle لكل قسم enabled/disabled.
- عرض اسم القسم بالعربية والإنجليزية من i18n.
- حفظ الترتيب.
- منع حذف المفاتيح الأساسية.
- تحذير إذا تم تعطيل أقسام مهمة مثل hero أو contact.

## Drag & Drop

استخدم مكتبة موجودة في المشروع إن كانت موجودة. إذا لا توجد، يمكن استخدام حل بسيط بزر up/down لتجنب إدخال dependency جديدة كبيرة.

## API المتوقع

```http
GET  /admin/landing/sections
POST /admin/landing/sections/reorder
PATCH /admin/landing/sections/:key
```

## معايير القبول

- يمكن تغيير ترتيب الأقسام.
- يمكن تفعيل/تعطيل الأقسام.
- الترتيب الجديد ينعكس بعد refresh.
- لا يحصل mismatch بين UI والـ API.

---

# 5. About Panel

## الهدف

ربط قسم عن الشركة داخل مركز اللاندينج.

## ملاحظة مهمة

يوجد feature حالي:

```txt
src/features/about/
```

لا تكرر نفس الإدارة بشكل كامل إذا كانت موجودة. المطلوب إما:

- تضمين مكون إدارة About الحالي داخل Landing Management.
- أو بناء panel مختصر يستخدم نفس API.
- أو ربط المستخدم بصفحة About الحالية مع ملخص وحالة القسم.

## الحقول المطلوبة

حسب الموجود في الباك إند:

- titleAr/titleEn
- descriptionAr/descriptionEn
- visionAr/visionEn
- missionAr/missionEn
- values
- team
- stats إن كانت ضمن about

## معايير القبول

- يمكن تعديل بيانات About التي تظهر في اللاندينج.
- لا يوجد تضارب بين صفحة About القديمة ومركز Landing.
- إذا كان About مستقلًا، يجب أن يوضح UI أن هذا القسم يغذي اللاندينج.

---

# 6. Statistics Manager

## الهدف

إدارة الإحصائيات التي تظهر في اللاندينج من لوحة التحكم.

## الحقول المطلوبة لكل إحصائية

```ts
{
  id: string;
  labelAr: string;
  labelEn: string;
  value: string | number;
  suffixAr?: string;
  suffixEn?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}
```

## الواجهة المطلوبة

- جدول أو cards للإحصائيات.
- زر إضافة إحصائية.
- تعديل.
- حذف.
- تفعيل/تعطيل.
- ترتيب.

## validation

- labelAr مطلوب.
- labelEn مطلوب.
- value مطلوب.
- sortOrder رقم.

## معايير القبول

- يمكن إدارة الإحصائيات بالكامل.
- لا توجد إحصائيات ثابتة في لوحة التحكم.
- الترتيب محفوظ.

---

# 7. Features Manager

## الهدف

إدارة مميزات اللاندينج بدل أن تكون ثابتة في الفرونت.

## الحقول المطلوبة لكل feature

```ts
{
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}
```

## الواجهة المطلوبة

- عرض features كجدول أو cards.
- إضافة feature.
- تعديل feature.
- حذف feature.
- تفعيل/تعطيل.
- ترتيب.
- اختيار icon أو image.

## معايير القبول

- يمكن إنشاء feature جديدة.
- يمكن تعديل وحذف وترتيب.
- لا تعتمد على static list.

---

# 8. Projects Showcase Manager

## الهدف

إدارة المشاريع التي تظهر في اللاندينج.

## الوضع الحالي

يوجد feature للمشاريع غالبًا:

```txt
src/features/projects/
```

وفيه حقول مثل:

```txt
showOnLanding
landingOrder
isFeatured
isPublished
```

## المطلوب

- عرض المشاريع التي يمكن إظهارها في اللاندينج.
- فلترة حسب published/landing/featured.
- toggle showOnLanding.
- toggle featured إن كان مدعومًا.
- تعديل landingOrder.
- bulk reorder.
- رابط سريع لتعديل المشروع الكامل.

## API المتوقع

```http
GET   /admin/projects
PATCH /admin/projects/:id/toggle-landing
PATCH /admin/projects/:id/toggle-featured
POST  /admin/projects/reorder-landing
```

أو حسب Phase 1.

## معايير القبول

- يمكن اختيار المشاريع المعروضة في اللاندينج.
- يمكن ترتيبها.
- لا تظهر المشاريع غير المنشورة في اللاندينج العام.
- لا يوجد endpoint mismatch.

---

# 9. Products Showcase Manager

## الهدف

إدارة المنتجات التي تظهر كعرض فقط في اللاندينج.

## ملاحظة مهمة

منتجات اللاندينج ليست للبيع من صفحة اللاندينج، بل للعرض التسويقي فقط.

## الحقول المطلوبة

```ts
{
  productId: string;
  nameAr: string;
  nameEn: string;
  image?: string;
  showOnLanding: boolean;
  landingTitleAr?: string;
  landingTitleEn?: string;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
  landingBadgeAr?: string;
  landingBadgeEn?: string;
  landingImage?: string;
  landingOrder: number;
  isFeatured?: boolean;
}
```

## الوضع الحالي

يوجد feature:

```txt
src/features/landing-products/
```

يجب تحديثه ليتوافق مع APIs النهائية من Phase 1.

## الواجهة المطلوبة

- جدول منتجات.
- بحث.
- فلترة حسب showOnLanding.
- toggle إظهار في اللاندينج.
- تعديل وصف اللاندينج الخاص بالمنتج.
- تعديل badge.
- تعديل صورة العرض إن وجدت.
- تعديل الترتيب.
- bulk save.

## معايير القبول

- يمكن اختيار المنتجات المعروضة.
- يمكن تعديل بيانات العرض التسويقي.
- يمكن ترتيب المنتجات.
- لا يتم كسر صفحة المنتجات الأساسية.

---

# 10. Brands Showcase Manager

## الهدف

إدارة البراندات المعروضة في اللاندينج.

## الوضع الحالي

يوجد feature:

```txt
src/features/landing-brands/
```

يجب تحديثه وربطه بالـ API النهائي.

## الحقول المطلوبة

```ts
{
  brandId: string;
  nameAr: string;
  nameEn: string;
  logo?: string;
  showOnLanding: boolean;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
  landingOrder: number;
  isFeatured?: boolean;
}
```

## الواجهة المطلوبة

- جدول براندات.
- بحث.
- toggle showOnLanding.
- تعديل الوصف.
- تعديل الترتيب.
- معاينة الشعار.
- bulk update.

## معايير القبول

- يمكن اختيار البراندات وترتيبها.
- لا يوجد endpoint قديم غير متطابق.

---

# 11. Articles / News Manager

## الهدف

إدارة المقالات والأخبار التي تظهر في اللاندينج.

## الوضع الحالي

يوجد feature:

```txt
src/features/articles/
```

وفيه غالبًا حقول:

```txt
showOnLanding
landingOrder
isFeatured
isPublished
```

## المطلوب

- عرض المقالات.
- فلترة landing/published/featured.
- toggle showOnLanding.
- toggle featured إن كان مدعومًا.
- تعديل landingOrder.
- رابط سريع لتعديل المقال.

## معايير القبول

- يمكن اختيار المقالات المعروضة.
- يمكن ترتيبها.
- لا تظهر المقالات غير المنشورة للعامة.
- كل النصوص مترجمة.

---

# 12. App Showcase Manager

## الهدف

إدارة قسم عرض التطبيق وخطوات استخدامه.

## الحقول المطلوبة

```ts
{
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  mainImage?: string;
  screenshots?: string[];
  steps: Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    icon?: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
  }>;
}
```

## الواجهة المطلوبة

- Form لإعدادات القسم العامة.
- إدارة خطوات التطبيق.
- إضافة/تعديل/حذف خطوة.
- ترتيب الخطوات.
- رفع/اختيار صور.

## معايير القبول

- كل محتوى App Showcase قابل للإدارة.
- لا توجد خطوات ثابتة في admin.
- يحفظ ويرجع البيانات من API.

---

# 13. Download CTA Manager

## الهدف

إدارة قسم الدعوة لتحميل التطبيق أو التواصل.

## الحقول المطلوبة

```ts
{
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  directDownloadUrl?: string;
  qrCodeImage?: string;
  backgroundImage?: string;
  primaryButtonTextAr?: string;
  primaryButtonTextEn?: string;
  primaryButtonUrl?: string;
  isActive: boolean;
}
```

## الواجهة المطلوبة

- Form كامل.
- validation للروابط.
- preview للأزرار.
- preview للـ QR إن وجد.

## معايير القبول

- يمكن تعديل كل نصوص وروابط Download CTA.
- لا يتم الاعتماد على روابط ثابتة في لوحة التحكم.

---

# 14. Service Center Manager

## الهدف

إدارة قسم مركز الصيانة/الدعم الموجود في اللاندينج.

## الحقول المطلوبة

```ts
{
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  workingHoursAr?: string;
  workingHoursEn?: string;
  addressAr?: string;
  addressEn?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  mapUrl?: string;
  services?: Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr?: string;
    descriptionEn?: string;
    icon?: string;
    sortOrder: number;
    isActive: boolean;
  }>;
  isActive: boolean;
}
```

## الواجهة المطلوبة

- Form للبيانات العامة.
- إدارة خدمات الصيانة/الدعم.
- validation للهاتف والإيميل والروابط.
- إمكانية إخفاء القسم من Sections.

## معايير القبول

- كل بيانات مركز الصيانة قابلة للإدارة.
- لا يوجد content ثابت.

---

# 15. Contact Info Manager

## الهدف

إدارة معلومات التواصل العامة التي تظهر في اللاندينج.

## الحقول المطلوبة

```ts
{
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressAr?: string;
  addressEn?: string;
  mapUrl?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
}
```

## المطلوب

- Form واضح.
- validation للروابط.
- validation للإيميل.
- حفظ عبر API.

## معايير القبول

- يمكن تعديل معلومات التواصل.
- المعلومات تظهر ضمن preview/admin home response.

---

# 16. SEO Settings Manager

## الهدف

إدارة SEO الخاص باللاندينج من لوحة التحكم.

## الحقول المطلوبة

```ts
{
  metaTitleAr: string;
  metaTitleEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  ogTitleAr?: string;
  ogTitleEn?: string;
  ogDescriptionAr?: string;
  ogDescriptionEn?: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywordsAr?: string[];
  keywordsEn?: string[];
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  structuredData?: Record<string, unknown>;
}
```

## الواجهة المطلوبة

- Form SEO منظم.
- عداد طول العنوان والوصف.
- preview لشكل Google Result تقريبًا.
- preview لـ Open Graph.
- JSON editor بسيط للـ structuredData إن كان مدعومًا.
- validation للـ canonical URL.

## معايير القبول

- يمكن تعديل SEO كاملًا.
- تظهر تحذيرات عند نقص meta title أو description أو og image.
- لا توجد قيم hardcoded.

---

# 17. Preview & Publish Workflow

## الهدف

إتاحة حفظ التعديلات كمسودة ثم معاينتها ونشرها.

## المطلوب

- زر Preview يفتح رابط معاينة أو modal.
- زر Publish.
- زر Unpublish إن كان مدعومًا.
- عرض حالة النشر الحالية.
- تحذير عند وجود بيانات ناقصة قبل النشر.
- منع النشر إذا كانت البيانات الأساسية ناقصة، أو على الأقل إظهار confirmation قوي.

## API المتوقع

```http
GET  /admin/landing/preview
POST /admin/landing/publish
POST /admin/landing/unpublish
```

## معايير القبول

- يمكن معاينة اللاندينج من لوحة التحكم.
- يمكن نشر التعديلات.
- حالة النشر تتغير فورًا في UI.
- لا يتم النشر بصمت بدون feedback.

---

# 18. تحديث القائمة الجانبية والراوتات

## المطلوب

أضف صفحة Landing Management إلى navigation/sidebar حسب النمط الحالي.

الاسم العربي:

```txt
إدارة صفحة الهبوط
```

الاسم الإنجليزي:

```txt
Landing Page Management
```

مع أيقونة مناسبة.

## ملاحظة

إذا كانت صفحات:

```txt
Landing Settings
Landing Products
Landing Brands
```

موجودة في القائمة، قرر أحد الخيارات:

1. إخفاؤها من القائمة الرئيسية ووضعها داخل Landing Management.
2. إبقاؤها كروابط فرعية تحت Landing Management.
3. تحويلها لمسارات legacy redirects إلى المركز الجديد.

لا تترك القائمة مزدحمة بصفحات مكررة ومربكة.

---

# 19. تحسين UX العام

## المطلوب

- استخدام Cards منظمة.
- استخدام Tabs أو Sidebar داخلي.
- رسائل نجاح وفشل واضحة.
- Empty states مفيدة.
- Loading skeletons.
- Dialogs للإضافة والتعديل.
- Confirm dialog للحذف والنشر.
- حفظ واضح لكل قسم.
- تحذير عند وجود تغييرات غير محفوظة إن أمكن.

## لا تفعل

- لا تجعل الصفحة ضخمة جدًا بدون تقسيم.
- لا تضع كل forms في صفحة واحدة طويلة جدًا بدون تبويبات.
- لا تعتمد على alerts خام.
- لا تترك أخطاء API تظهر كنصوص تقنية للمستخدم.

---

# 20. React Query / Cache Invalidation

## المطلوب

استخدم النمط الموجود في المشروع غالبًا مع React Query.

بعد كل mutation يجب تحديث الكاش المناسب:

```ts
queryClient.invalidateQueries({ queryKey: ['landing-management'] })
queryClient.invalidateQueries({ queryKey: ['landing-settings'] })
queryClient.invalidateQueries({ queryKey: ['landing-products'] })
queryClient.invalidateQueries({ queryKey: ['landing-brands'] })
```

استخدم أسماء query keys منظمة وثابتة.

## معايير القبول

- بعد الحفظ تظهر البيانات الجديدة بدون refresh يدوي.
- لا يحصل stale UI بعد toggle أو reorder.

---

# 21. Typescript Types

## المطلوب

عرّف types واضحة متوافقة مع Phase 1.

مثال:

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
```

مع أنواع:

```ts
LandingHomeAdminDto
LandingSettingsDto
LandingSectionDto
LandingFeatureDto
LandingStatDto
LandingProductDto
LandingBrandDto
LandingSeoDto
LandingPublishStatus
```

## معايير القبول

- لا تستخدم `any` إلا عند الضرورة القصوى.
- إذا استخدمت `unknown` للـ structuredData، عالجه بأمان.
- لا تكسر typecheck.

---

# 22. Validation

## المطلوب

استخدم validation بسيط وعملي.

الحد الأدنى:

- required للحقول الأساسية.
- URL validation للروابط.
- email validation.
- number validation للترتيب.
- منع sortOrder سلبي إن لم يكن مدعومًا.
- تحذير عند نقص النص الإنجليزي أو العربي.

يمكن استخدام مكتبة validation موجودة في المشروع إن كانت موجودة، أو validation يدوي خفيف.

---

# 23. Error Mapping

## المطلوب

تعامل مع أخطاء API بشكل واضح.

- Validation errors تظهر بجانب الحقول إن أمكن.
- أخطاء عامة تظهر Toast.
- أخطاء الصلاحيات تعرض رسالة مناسبة.
- أخطاء الشبكة تعرض إعادة محاولة.

لا تعرض للمستخدم:

```txt
Request failed with status code 400
```

بل اعرض رسالة مفهومة من i18n.

---

# 24. الترجمة المطلوبة

أضف مفاتيح عربية وإنجليزية لكل:

- عنوان الصفحة.
- وصف الصفحة.
- أسماء التبويبات.
- أسماء الحقول.
- الأزرار.
- رسائل النجاح.
- رسائل الخطأ.
- رسائل التأكيد.
- empty states.
- loading states.
- SEO warnings.
- publish warnings.

مثال بنية:

```json
{
  "page": {
    "title": "إدارة صفحة الهبوط",
    "description": "تحكم كامل بمحتوى وأقسام صفحة الهبوط"
  },
  "tabs": {
    "overview": "نظرة عامة",
    "hero": "القسم الرئيسي",
    "sections": "ترتيب الأقسام",
    "stats": "الإحصائيات",
    "features": "المميزات",
    "seo": "السيو"
  },
  "actions": {
    "save": "حفظ",
    "publish": "نشر",
    "preview": "معاينة",
    "unpublish": "إلغاء النشر",
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف"
  }
}
```

---

# 25. ربط Media Upload

إذا كان المشروع يحتوي Media Manager، استخدمه لاختيار/رفع الصور.

الأماكن التي تحتاج صور:

- Hero image.
- OG image.
- Feature image.
- App showcase image.
- Screenshots.
- Download CTA background.
- QR image.
- Service icons/images.
- Product landing image.
- Brand logo preview.

إذا لا يوجد Media Picker جاهز، استخدم input URL مؤقتًا لكن وثق ذلك بوضوح في `IMPLEMENTATION_NOTES.md`.

---

# 26. التعامل مع الصفحات الحالية

## landing-settings

يجب تحديثها أو دمجها ضمن Hero & Main Settings.

## landing-products

يجب تحديث endpoints والـ types لتطابق Phase 1.

## landing-brands

يجب تحديث endpoints والـ types لتطابق Phase 1.

## projects/articles

يجب إصلاح أي endpoint mismatch مثل:

```http
PATCH /admin/projects/:id/toggle-featured
PATCH /admin/articles/:id/toggle-featured
```

إذا تم إغلاقها في Phase 1، اربطها مباشرة.

## contact-requests

تأكد من أن note/notes endpoint مطابق لما تم اعتماده في Phase 1.

---

# 27. المطلوب في API Client

في:

```txt
src/features/landing-management/api/landingManagementApi.ts
```

أنشئ دوال واضحة مثل:

```ts
getAdminHome()
getSettings()
updateSettings(data)
getSections()
updateSection(key, data)
reorderSections(items)
getStats()
createStat(data)
updateStat(id, data)
deleteStat(id)
reorderStats(items)
getFeatures()
createFeature(data)
updateFeature(id, data)
deleteFeature(id)
reorderFeatures(items)
getProducts()
updateProductLanding(id, data)
bulkUpdateProducts(data)
getBrands()
updateBrandLanding(id, data)
bulkUpdateBrands(data)
getAppShowcase()
updateAppShowcase(data)
getDownloadCta()
updateDownloadCta(data)
getServiceCenter()
updateServiceCenter(data)
getContactInfo()
updateContactInfo(data)
getSeo()
updateSeo(data)
getPreview()
publish()
unpublish()
```

كل دالة يجب أن تتعامل مع شكل `ApiResponse<T>` المستخدم في المشروع.

---

# 28. الاختبارات اليدوية المطلوبة

بعد التنفيذ، اختبر يدويًا:

## Navigation

- صفحة Landing Management تظهر من القائمة.
- كل التبويبات تعمل.
- لا يوجد crash عند refresh.

## Settings

- تعديل Hero عربي/إنجليزي.
- تعديل CTA.
- تعديل صورة.
- الحفظ يعمل.

## Sections

- تعطيل قسم.
- تفعيل قسم.
- تغيير ترتيب.
- refresh والتأكد من بقاء الترتيب.

## Stats

- إضافة إحصائية.
- تعديلها.
- حذفها.
- ترتيبها.

## Features

- إضافة ميزة.
- تعديلها.
- حذفها.
- تفعيل/تعطيل.

## Products

- تفعيل منتج للاندينج.
- تعديل وصفه التسويقي.
- ترتيبه.

## Brands

- تفعيل براند.
- تعديل وصفه.
- ترتيبه.

## Projects / Articles

- تفعيل للاندينج.
- featured.
- ترتيب.

## SEO

- تعديل meta title/description.
- رفع OG image أو إدخال URL.
- حفظ.

## Publish

- Preview.
- Publish.
- Unpublish إن وجد.

---

# 29. أوامر الفحص المطلوبة

نفّذ ما يناسب المشروع من الأوامر التالية:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

إذا كانت الأوامر مختلفة في المشروع، استخدم الموجودة في `package.json`.

يجب عدم ترك TypeScript errors.

---

# 30. ملفات يجب مراجعتها غالبًا

```txt
src/core/router/routes.tsx
src/core/i18n/config.ts
src/core/i18n/locales/ar/*.json
src/core/i18n/locales/en/*.json
src/features/landing-settings/
src/features/landing-products/
src/features/landing-brands/
src/features/projects/
src/features/articles/
src/features/about/
src/features/contact-requests/
src/shared/
src/components/
```

راجع أيضًا نظام الـ API client العام، غالبًا في:

```txt
src/lib/
src/shared/
src/core/
```

واستخدم نفس النمط الموجود.

---

# 31. ممنوعات المرحلة

يُمنع:

- بناء backend جديد داخل هذه المرحلة.
- تعديل landing-page العام.
- استخدام mock data كمصدر دائم.
- ترك endpoints قديمة متضاربة.
- ترك نصوص hardcoded.
- استخدام `any` بشكل عشوائي.
- ترك forms بدون loading/error states.
- إنشاء صفحات مكررة تربك الأدمن.
- كسر features موجودة مثل projects/articles/products.

---

# 32. مخرجات المرحلة المطلوبة

بعد التنفيذ يجب تسليم:

## 1. كود محدث في admin-dashboard

يشمل Landing Management Center وكل المكونات والـ hooks والـ API clients.

## 2. تحديث الترجمة

ملفات عربية وإنجليزية مضافة/محدثة.

## 3. تحديث routes/navigation

رابط واضح لإدارة صفحة الهبوط.

## 4. توثيق التنفيذ

أنشئ ملف:

```txt
IMPLEMENTATION_NOTES_PHASE_2.md
```

ويتضمن:

```md
# Phase 2 Implementation Notes

## Completed
- ...

## APIs Used
- ...

## Existing Pages Merged or Updated
- ...

## Known Limitations
- ...

## Manual Test Checklist
- [ ] ...

## Required Follow-up for Phase 3
- ...
```

---

# 33. معايير القبول النهائية

لا تعتبر المرحلة مغلقة إلا إذا تحقق الآتي:

```txt
[ ] توجد صفحة مركزية لإدارة اللاندينج.
[ ] يمكن إدارة Hero والإعدادات الأساسية.
[ ] يمكن تفعيل/تعطيل الأقسام.
[ ] يمكن ترتيب الأقسام.
[ ] يمكن إدارة About أو ربطه بوضوح.
[ ] يمكن إدارة Statistics.
[ ] يمكن إدارة Features.
[ ] يمكن إدارة Projects للاندينج.
[ ] يمكن إدارة Products Showcase.
[ ] يمكن إدارة Brands Showcase.
[ ] يمكن إدارة Articles / News.
[ ] يمكن إدارة App Showcase.
[ ] يمكن إدارة Download CTA.
[ ] يمكن إدارة Service Center.
[ ] يمكن إدارة Contact Info.
[ ] يمكن إدارة SEO.
[ ] يمكن Preview.
[ ] يمكن Publish/Unpublish حسب دعم Phase 1.
[ ] كل النصوص من i18n.
[ ] لا توجد بيانات mock كمصدر دائم.
[ ] لا توجد أخطاء TypeScript.
[ ] لا ينكسر build.
[ ] تم إنشاء IMPLEMENTATION_NOTES_PHASE_2.md.
```

---

## القرار النهائي لهذه المرحلة

هذه المرحلة يجب أن تحول لوحة التحكم من صفحات جزئية متفرقة إلى نظام إدارة Landing CMS كامل.

الهدف ليس فقط أن "توجد صفحة إعدادات"، بل أن يستطيع الأدمن إدارة صفحة الهبوط بالكامل دون الرجوع للمطور، وأن تكون كل البيانات القادمة للاندينج قابلة للتحكم من لوحة التحكم.
