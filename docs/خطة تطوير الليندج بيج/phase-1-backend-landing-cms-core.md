# Phase 1 — Backend Landing CMS Core

## الهدف العام

إغلاق المرحلة الأولى من تطوير نظام اللاندينج عبر جعل الباك إند هو المصدر الوحيد للحقيقة لكل بيانات صفحة اللاندينج، وتجهيز API موحد واحترافي يُستخدم من الواجهة العامة ولوحة التحكم.

بعد إنهاء هذه المرحلة يجب أن يكون لدينا:

```txt
GET /landing/home
```

يرجع كل بيانات صفحة اللاندينج بشكل كامل ومنظم، بدل أن يرجع إعدادات بسيطة فقط.

---

## نطاق هذه المرحلة

هذه المرحلة خاصة بالباك إند فقط.

لا تقم بتعديل تصميم الواجهة العامة للـ Landing Page إلا إذا كان مطلوبًا فقط لاختبار API بشكل بسيط.
لا تقم ببناء واجهات لوحة التحكم في هذه المرحلة.
المطلوب هنا هو تجهيز البنية الخلفية الكاملة التي ستعتمد عليها المرحلتان الثانية والثالثة.

---

## المشاريع المعنية

```txt
backend/
```

ويُمنع تنفيذ تغييرات رئيسية في:

```txt
landing-page/
admin-dashboard/
```

إلا في حالة وجود shared types أو test call بسيط جدًا، والأفضل تأجيل ذلك للمرحلتين 2 و 3.

---

## المشكلة الحالية

حاليًا يوجد مسار:

```http
GET /landing/home
```

لكنه لا يرجع كل بيانات اللاندينج، بل يرجع إعدادات محدودة غالبًا من Landing Settings.

الفرونت يحتاج بيانات مثل:

```ts
{
  settings,
  hero,
  about,
  stats,
  features,
  projects,
  products,
  brands,
  articles,
  appShowcase,
  downloadCta,
  serviceCenter,
  contact,
  seo,
  sectionOrder
}
```

لكن الباك إند الحالي لا يوفر هذا الشكل الكامل.

كما توجد مشاكل عدم تطابق في بعض المسارات، مثل:

```http
POST /landing/contact
```

مقابل الموجود:

```http
POST /contact-requests
```

وكذلك اختلاف:

```http
PATCH /admin/contact-requests/:id/note
```

مقابل:

```http
PATCH /admin/contact-requests/:id/notes
```

وأيضًا وجود استدعاءات متوقعة في الفرونت/الأدمن مثل:

```http
PATCH /admin/projects/:id/toggle-featured
PATCH /admin/articles/:id/toggle-featured
```

قد لا تكون موجودة فعليًا أو غير متطابقة.

---

## الهدف التقني النهائي للمرحلة

بناء Backend Landing CMS Core يدعم:

1. API عام موحد للاندينج.
2. إدارة الأقسام من الباك إند.
3. تفعيل/تعطيل الأقسام.
4. ترتيب الأقسام.
5. حالة النشر Draft / Published.
6. SEO كامل.
7. بيانات ثنائية اللغة عربي/إنجليزي.
8. ربط المنتجات والبراندات كعناصر عرض في اللاندينج.
9. إصلاح مسارات التواصل.
10. إصلاح المسارات غير المتطابقة.
11. تجهيز APIs إدارية للمرحلة الثانية.

---

# 1. مراجعة الكود الحالي قبل التنفيذ

قبل كتابة أي كود، افحص الملفات الحالية في الباك إند وحدد الموجود فعليًا.

ابحث عن:

```txt
landing
landing-settings
about
projects
articles
brands
products
contact-requests
settings
seo
```

ثم سجّل ملاحظاتك داخل ملف مؤقت أو في رسالة التنفيذ النهائية.

يجب تحديد:

- أين يوجد Landing Module الحالي؟
- أين يوجد Landing Settings Entity/Schema؟
- هل النظام يستخدم PostgreSQL / Prisma / TypeORM / Mongoose؟
- ما هي طريقة تعريف DTOs الحالية؟
- ما هي طريقة auth guards في admin routes؟
- ما هي طريقة public routes؟
- هل يوجد upload service للصور؟
- هل يوجد soft delete؟
- هل يوجد publish status في المشاريع والمقالات؟
- هل المنتجات والبراندات تحتوي حقول landing أم لا؟

لا تبدأ بإضافة جداول جديدة قبل التأكد من الموجود.

---

# 2. تصميم Response موحد لمسار `/landing/home`

يجب أن يرجع المسار العام:

```http
GET /landing/home
```

الشكل التالي أو ما يعادله مع الالتزام بنفس المنطق:

```ts
export interface LandingHomeResponseDto {
  meta: {
    version: string;
    generatedAt: string;
    locale?: 'ar' | 'en';
    preview: boolean;
  };

  settings: LandingSettingsDto;

  seo: LandingSeoDto;

  sectionOrder: LandingSectionKey[];

  sections: {
    hero: LandingHeroSectionDto | null;
    about: LandingAboutSectionDto | null;
    stats: LandingStatDto[];
    features: LandingFeatureDto[];
    projects: LandingProjectDto[];
    products: LandingProductShowcaseDto[];
    brands: LandingBrandShowcaseDto[];
    articles: LandingArticleDto[];
    appShowcase: LandingAppShowcaseDto | null;
    downloadCta: LandingDownloadCtaDto | null;
    serviceCenter: LandingServiceCenterDto | null;
    contact: LandingContactDto | null;
  };
}
```

## قواعد مهمة

- لا تعرض الأقسام المعطلة للعامة.
- لا تعرض البيانات غير المنشورة للعامة.
- لا تعرض مشاريع أو مقالات أو منتجات غير منشورة.
- لا تعرض منتجات أو براندات `showOnLanding = false`.
- في وضع `preview=true` يمكن إرجاع المسودات للمستخدم الإداري فقط.
- إذا كان القسم مفعّلًا لكن لا توجد بيانات له، يرجع `null` أو `[]` حسب نوع القسم، ولا يكسر الصفحة.

---

# 3. تعريف مفاتيح الأقسام الرسمية

اعتمد مفاتيح ثابتة للأقسام:

```ts
export enum LandingSectionKey {
  HERO = 'hero',
  ABOUT = 'about',
  STATS = 'stats',
  FEATURES = 'features',
  PROJECTS = 'projects',
  PRODUCTS = 'products',
  BRANDS = 'brands',
  ARTICLES = 'articles',
  APP_SHOWCASE = 'appShowcase',
  DOWNLOAD_CTA = 'downloadCta',
  SERVICE_CENTER = 'serviceCenter',
  CONTACT = 'contact',
}
```

يجب استخدام هذه المفاتيح في:

- `sectionOrder`
- `enableSections`
- DTOs
- Validation
- Admin APIs

ممنوع استخدام strings عشوائية في أكثر من مكان.

---

# 4. بناء/تحديث Landing Settings

راجع الكيان الحالي الخاص بإعدادات اللاندينج. إن كان موجودًا، قم بتوسيعه بدون كسر البيانات القديمة.

يجب أن يدعم على الأقل:

```ts
{
  id: string;

  status: 'draft' | 'published';

  heroTitleAr: string;
  heroTitleEn?: string;
  heroSubtitleAr?: string;
  heroSubtitleEn?: string;
  heroImage?: string;
  heroVideo?: string;

  primaryCtaLabelAr?: string;
  primaryCtaLabelEn?: string;
  primaryCtaUrl?: string;

  secondaryCtaLabelAr?: string;
  secondaryCtaLabelEn?: string;
  secondaryCtaUrl?: string;

  googlePlayUrl?: string;
  appStoreUrl?: string;

  enableSections: Record<LandingSectionKey, boolean>;
  sectionOrder: LandingSectionKey[];

  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## شروط التنفيذ

- إذا لم توجد إعدادات، أنشئ default settings تلقائيًا.
- لا تجعل `/landing/home` يفشل بسبب عدم وجود settings.
- يجب أن توجد fallback defaults آمنة.
- يجب ألا تكون fallback defaults بديلًا عن البيانات الحقيقية، فقط تمنع الكسر.

---

# 5. بناء Landing Sections Management في الباك إند

نحتاج طبقة تمثل حالة كل قسم، إما داخل Landing Settings أو ككيان مستقل.

الأفضل احترافيًا:

```ts
LandingSectionEntity
```

بالمثال:

```ts
{
  id: string;
  key: LandingSectionKey;
  enabled: boolean;
  sortOrder: number;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

لكن إذا كان المشروع الحالي يعتمد `enableSections` و `sectionOrder` داخل settings، يمكن اعتماد ذلك مبدئيًا بشرط:

- وجود API واضح لتحديث ترتيب الأقسام.
- وجود API واضح لتفعيل/تعطيل الأقسام.
- عدم كسر التوافق مع الفرونت الحالي.

## المطلوب كحد أدنى

```http
GET /admin/landing/sections
PATCH /admin/landing/sections
PATCH /admin/landing/sections/order
PATCH /admin/landing/sections/:key/toggle
```

---

# 6. SEO للاندينج

أضف أو وسّع SEO خاص بالصفحة الرئيسية للاندينج.

يجب دعم:

```ts
{
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  ogTitleAr?: string;
  ogTitleEn?: string;
  ogDescriptionAr?: string;
  ogDescriptionEn?: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywordsAr?: string[];
  keywordsEn?: string[];
  robotsIndex: boolean;
  robotsFollow: boolean;
  structuredData?: Record<string, any>;
}
```

## APIs مطلوبة

```http
GET /admin/landing/seo
PATCH /admin/landing/seo
GET /landing/seo
```

أو يمكن أن يكون SEO ضمن:

```http
GET /landing/home
```

لكن يجب أن توجد API إدارية لتعديله.

---

# 7. Features Section

حاليًا المميزات غالبًا Static في الفرونت. المطلوب تجهيزها من الباك إند.

## Entity/Model مقترح

```ts
LandingFeature
```

```ts
{
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Admin APIs

```http
GET /admin/landing/features
POST /admin/landing/features
PATCH /admin/landing/features/:id
DELETE /admin/landing/features/:id
PATCH /admin/landing/features/:id/toggle
PATCH /admin/landing/features/reorder
```

## Public Output

يتم تضمينها داخل:

```http
GET /landing/home
```

في:

```ts
sections.features
```

ولا تحتاج Public API منفصلة إلا إذا كان النمط الحالي في المشروع يتطلب ذلك.

---

# 8. Statistics Section

يجب أن تصبح الإحصائيات مدارة من الباك إند.

## Entity/Model مقترح

```ts
LandingStat
```

```ts
{
  id: string;
  labelAr: string;
  labelEn?: string;
  value: string;
  suffixAr?: string;
  suffixEn?: string;
  icon?: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Admin APIs

```http
GET /admin/landing/stats
POST /admin/landing/stats
PATCH /admin/landing/stats/:id
DELETE /admin/landing/stats/:id
PATCH /admin/landing/stats/:id/toggle
PATCH /admin/landing/stats/reorder
```

## Public Output

داخل:

```ts
sections.stats
```

---

# 9. App Showcase Section

يجب تجهيز بنية لإدارة قسم عرض التطبيق أو الخطوات.

## Model مقترح

```ts
LandingAppShowcase
```

```ts
{
  id: string;
  titleAr: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  image?: string;
  enabled: boolean;
  steps: LandingAppShowcaseStep[];
  createdAt: Date;
  updatedAt: Date;
}
```

```ts
LandingAppShowcaseStep
```

```ts
{
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  enabled: boolean;
}
```

## Admin APIs

```http
GET /admin/landing/app-showcase
PATCH /admin/landing/app-showcase
POST /admin/landing/app-showcase/steps
PATCH /admin/landing/app-showcase/steps/:id
DELETE /admin/landing/app-showcase/steps/:id
PATCH /admin/landing/app-showcase/steps/reorder
```

---

# 10. Download CTA Section

يجب أن تكون روابط التحميل والنصوص من الباك إند.

## Model مقترح

```ts
LandingDownloadCta
```

```ts
{
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  qrCodeImage?: string;
  backgroundImage?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Admin APIs

```http
GET /admin/landing/download-cta
PATCH /admin/landing/download-cta
```

## ملاحظة

إذا كانت روابط Google Play و App Store موجودة داخل Landing Settings، لا تكررها في أكثر من مكان بشكل يسبب تعارض.

اختر أحد القرارين:

1. الروابط داخل Landing Settings وتقرأ منها Download CTA.
2. الروابط داخل Download CTA فقط.

الأفضل: الروابط داخل Download CTA، وLanding Settings تبقى عامة للـ Hero والصفحة.

---

# 11. Service Center Section

يجب بناء قسم مركز الصيانة/الدعم كمحتوى مدخل من لوحة التحكم.

## Model مقترح

```ts
LandingServiceCenter
```

```ts
{
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  addressAr?: string;
  addressEn?: string;
  workingHoursAr?: string;
  workingHoursEn?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  mapUrl?: string;
  image?: string;
  enabled: boolean;
  services: LandingServiceItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

```ts
LandingServiceItem
```

```ts
{
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  sortOrder: number;
  enabled: boolean;
}
```

## Admin APIs

```http
GET /admin/landing/service-center
PATCH /admin/landing/service-center
POST /admin/landing/service-center/services
PATCH /admin/landing/service-center/services/:id
DELETE /admin/landing/service-center/services/:id
PATCH /admin/landing/service-center/services/reorder
```

---

# 12. Products Showcase

المنتجات في اللاندينج للعرض فقط، وليست للبيع.

راجع Product entity الحالي وأضف حقول Landing إن لم تكن موجودة.

## حقول مقترحة على المنتج أو جدول ربط مستقل

الأفضل احترافيًا إنشاء جدول/كيان مستقل:

```ts
LandingProductShowcase
```

يرتبط بـ Product.

```ts
{
  id: string;
  productId: string;
  showOnLanding: boolean;
  landingTitleAr?: string;
  landingTitleEn?: string;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
  landingImage?: string;
  landingBadgeAr?: string;
  landingBadgeEn?: string;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

إذا كان الأسهل على بنية المشروع الحالية إضافة الحقول مباشرة إلى Product، يمكن ذلك بشرط عدم تلويث منطق المنتج التجاري.

## Admin APIs مطلوبة

```http
GET /admin/landing/products
PATCH /admin/landing/products/:id
POST /admin/landing/products/bulk-update
PATCH /admin/landing/products/reorder
```

## Backward compatibility

إذا كان الأدمن الحالي يستخدم:

```http
GET /admin/products/landing
PATCH /admin/products/:id/landing
```

إما:

- اجعل هذه المسارات تعمل كـ alias.
- أو وثق أن المرحلة الثانية ستعدل الأدمن للمسارات الجديدة.

الأفضل في هذه المرحلة دعم الاثنين مؤقتًا لتجنب كسر الموجود.

## Public Output

داخل:

```ts
sections.products
```

ويجب أن يرجع فقط المنتجات التي:

```txt
showOnLanding = true
product is active/published
```

---

# 13. Brands Showcase

نفس منطق المنتجات.

## Model مقترح

```ts
LandingBrandShowcase
```

```ts
{
  id: string;
  brandId: string;
  showOnLanding: boolean;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  logo?: string;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Admin APIs

```http
GET /admin/landing/brands
PATCH /admin/landing/brands/:id
POST /admin/landing/brands/bulk-update
PATCH /admin/landing/brands/reorder
```

## Backward compatibility

إذا كان الأدمن الحالي يستخدم:

```http
GET /admin/brands/landing
PATCH /admin/brands/:id/landing
```

ادعمها كـ alias مؤقتًا إن أمكن.

---

# 14. Projects Section

المشاريع موجودة غالبًا. المطلوب التأكد من الربط مع اللاندينج.

## يجب دعم الحقول التالية في Project أو mapping مناسب

```ts
{
  showOnLanding: boolean;
  isFeatured: boolean;
  landingSortOrder?: number;
  landingDescriptionAr?: string;
  landingDescriptionEn?: string;
}
```

## APIs يجب التأكد منها

```http
GET /projects/featured
GET /admin/projects
PATCH /admin/projects/:id
PATCH /admin/projects/:id/toggle-featured
PATCH /admin/projects/:id/toggle-landing
PATCH /admin/projects/reorder-landing
```

إذا لم تكن موجودة، أضفها.

## Public Output

داخل:

```ts
sections.projects
```

يجب أن تعرض فقط:

```txt
published = true
showOnLanding = true
```

مع ترتيب واضح.

---

# 15. Articles / News Section

المقالات موجودة غالبًا. المطلوب التأكد من الربط مع اللاندينج.

## يجب دعم الحقول التالية

```ts
{
  showOnLanding: boolean;
  isFeatured: boolean;
  landingSortOrder?: number;
}
```

## APIs يجب التأكد منها

```http
GET /articles/featured
GET /admin/articles
PATCH /admin/articles/:id
PATCH /admin/articles/:id/toggle-featured
PATCH /admin/articles/:id/toggle-landing
PATCH /admin/articles/reorder-landing
```

إذا لم تكن موجودة، أضفها.

## Public Output

داخل:

```ts
sections.articles
```

يجب أن تعرض فقط:

```txt
published = true
showOnLanding = true
```

---

# 16. About Section

قسم عن الشركة موجود غالبًا في:

```http
/admin/about
/about/public
```

المطلوب:

- التأكد من أن `/landing/home` يجلب بيانات About.
- عدم نسخ البيانات في مكانين.
- استعمال المصدر الحالي إن كان مناسبًا.
- إرجاع `sections.about` بشكل مبسط ومناسب للفرونت.

## Output مقترح

```ts
{
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  visionAr?: string;
  visionEn?: string;
  missionAr?: string;
  missionEn?: string;
  image?: string;
  values?: Array<{
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
  }>;
}
```

---

# 17. Contact Info + Contact Requests

## 17.1 Contact Info

يجب إرجاع معلومات التواصل داخل:

```ts
sections.contact
```

من المصدر الأنسب:

- About contact info
- System settings
- Landing contact settings

لكن يجب ألا تكون مشتتة بدون قرار.

Output مقترح:

```ts
{
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressAr?: string;
  addressEn?: string;
  mapUrl?: string;
  workingHoursAr?: string;
  workingHoursEn?: string;
}
```

## 17.2 Contact Form Route

أضف المسار التالي:

```http
POST /landing/contact
```

ويجب أن ينشئ Contact Request بنفس منطق:

```http
POST /contact-requests
```

## DTO مقترح

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

## Validation

- `name` مطلوب.
- `message` مطلوب.
- إما `email` أو `phone` مطلوب.
- تحقق من صيغة البريد إن وجد.
- لا تسمح برسالة فارغة.
- أضف rate limiting إن كان موجودًا في المشروع.

## Admin route compatibility

وحّد:

```http
PATCH /admin/contact-requests/:id/note
```

و:

```http
PATCH /admin/contact-requests/:id/notes
```

الأفضل دعم الاثنين مؤقتًا لتجنب كسر لوحة التحكم، مع اعتماد واحد رسميًا:

```http
PATCH /admin/contact-requests/:id/notes
```

---

# 18. Preview / Published Logic

يجب دعم وضعين:

## Public mode

```http
GET /landing/home
```

يرجع المنشور فقط.

## Preview mode

```http
GET /landing/home?preview=true
```

أو:

```http
GET /admin/landing/preview
```

يرجع المسودة والبيانات غير المنشورة للمستخدم الإداري فقط.

## قواعد أمنية

- `preview=true` لا يعمل للعامة بدون Admin Auth.
- إذا تم طلب preview بدون صلاحية، يرجع `401` أو `403`.
- لا تسرب بيانات draft للعامة.

---

# 19. Admin APIs الأساسية المطلوبة للمرحلة الثانية

يجب أن تكون هذه APIs جاهزة بعد المرحلة الأولى:

```http
GET /admin/landing/home
GET /admin/landing/preview
GET /admin/landing/settings
PATCH /admin/landing/settings
POST /admin/landing/publish
POST /admin/landing/unpublish

GET /admin/landing/sections
PATCH /admin/landing/sections
PATCH /admin/landing/sections/order
PATCH /admin/landing/sections/:key/toggle

GET /admin/landing/seo
PATCH /admin/landing/seo

GET /admin/landing/features
POST /admin/landing/features
PATCH /admin/landing/features/:id
DELETE /admin/landing/features/:id
PATCH /admin/landing/features/:id/toggle
PATCH /admin/landing/features/reorder

GET /admin/landing/stats
POST /admin/landing/stats
PATCH /admin/landing/stats/:id
DELETE /admin/landing/stats/:id
PATCH /admin/landing/stats/:id/toggle
PATCH /admin/landing/stats/reorder

GET /admin/landing/app-showcase
PATCH /admin/landing/app-showcase
POST /admin/landing/app-showcase/steps
PATCH /admin/landing/app-showcase/steps/:id
DELETE /admin/landing/app-showcase/steps/:id
PATCH /admin/landing/app-showcase/steps/reorder

GET /admin/landing/download-cta
PATCH /admin/landing/download-cta

GET /admin/landing/service-center
PATCH /admin/landing/service-center
POST /admin/landing/service-center/services
PATCH /admin/landing/service-center/services/:id
DELETE /admin/landing/service-center/services/:id
PATCH /admin/landing/service-center/services/reorder

GET /admin/landing/products
PATCH /admin/landing/products/:id
POST /admin/landing/products/bulk-update
PATCH /admin/landing/products/reorder

GET /admin/landing/brands
PATCH /admin/landing/brands/:id
POST /admin/landing/brands/bulk-update
PATCH /admin/landing/brands/reorder
```

إذا كان المشروع الحالي لا يحتاج كل هذه المسارات بسبب وجود Services جاهزة، يمكن تقليل المسارات، لكن يجب ألا ينقص أي سلوك وظيفي مطلوب.

---

# 20. Public APIs المطلوبة

كحد أدنى:

```http
GET /landing/home
POST /landing/contact
```

اختياريًا:

```http
GET /landing/seo
GET /landing/products
GET /landing/brands
GET /landing/features
```

لكن الأفضل للصفحة الرئيسية الاعتماد على:

```http
GET /landing/home
```

كمسار واحد.

---

# 21. Validation Rules

كل DTO يجب أن يحتوي Validation واضح.

استخدم أسلوب المشروع الحالي، مثل:

```ts
class-validator
class-transformer
Zod
Yup
```

حسب المعتمد في المشروع.

## قواعد عامة

- النصوص العربية الأساسية مطلوبة في الأقسام المهمة.
- النصوص الإنجليزية اختيارية.
- الروابط يجب أن تكون URL صحيح.
- الصور يجب أن تكون URL أو path صالح حسب نظام المشروع.
- `sortOrder` رقم.
- `enabled` Boolean.
- `status` enum.
- `sectionKey` enum.
- لا تقبل مفاتيح أقسام غير معرفة.

---

# 22. Database Migration

إذا كان المشروع يستخدم migrations، يجب إنشاء migration رسمية.

## المطلوب

- إضافة الجداول/الأعمدة الجديدة.
- الحفاظ على البيانات القديمة.
- إضافة default values.
- عدم حذف أعمدة حالية بدون ضرورة.
- عدم كسر seed الحالي.
- إضافة indexes على:
  - `enabled`
  - `sortOrder`
  - `showOnLanding`
  - `isFeatured`
  - `status`

## أمثلة جداول محتملة

```txt
landing_features
landing_stats
landing_app_showcase
landing_app_showcase_steps
landing_download_cta
landing_service_center
landing_service_items
landing_product_showcase
landing_brand_showcase
landing_seo
landing_sections
```

إذا كان المشروع يفضل JSON داخل settings بدل جداول كثيرة، يمكن استخدام JSON لبعض الأقسام، لكن للمنتجات/البراندات/المشاريع/المقالات يفضل علاقات واضحة.

---

# 23. Seed / Default Data

أضف seed آمن للبيئة التطويرية فقط إن كان نظام المشروع يدعم seed.

يجب توفير default records لـ:

- Landing Settings
- Sections
- SEO basic
- Features sample
- Stats sample
- Download CTA sample
- Service Center sample

لكن لا تجعل بيانات seed تظهر في الإنتاج إن كانت غير مناسبة.

---

# 24. Security

## Public

المسارات العامة:

```http
GET /landing/home
POST /landing/contact
```

## Admin

كل المسارات التالية يجب أن تكون محمية:

```http
/admin/landing/*
/admin/projects/* toggle landing/featured
/admin/articles/* toggle landing/featured
/admin/contact-requests/*
```

استخدم نفس Guards وصلاحيات المشروع الحالية.

## Rate Limiting

يفضل تطبيق rate limit على:

```http
POST /landing/contact
```

لحماية النموذج من السبام.

---

# 25. Error Handling

يجب أن تكون الأخطاء موحدة مع أسلوب المشروع.

## أمثلة

عند إرسال section key غير صحيح:

```json
{
  "message": "Invalid landing section key",
  "code": "INVALID_LANDING_SECTION"
}
```

عند محاولة preview بدون صلاحية:

```json
{
  "message": "Unauthorized preview access",
  "code": "LANDING_PREVIEW_UNAUTHORIZED"
}
```

عند عدم وجود عنصر:

```json
{
  "message": "Landing feature not found",
  "code": "LANDING_FEATURE_NOT_FOUND"
}
```

---

# 26. Caching

إذا يوجد Redis/cache في المشروع، يمكن إضافة cache لـ:

```http
GET /landing/home
```

لكن بشرط:

- يتم مسح cache عند أي تعديل في إعدادات اللاندينج.
- يتم مسح cache عند publish/unpublish.
- يتم مسح cache عند تعديل features/stats/products/brands/articles/projects.
- لا يتم cache للـ preview.

إذا لم يكن cache جاهزًا، لا تضف تعقيدًا كبيرًا في هذه المرحلة. اكتفِ بتجهيز service method قابلة للكاش لاحقًا.

---

# 27. Logging

أضف logs مناسبة عند:

- نشر اللاندينج.
- إلغاء النشر.
- تحديث الأقسام.
- فشل contact request.
- فشل تحميل landing home بسبب خطأ داخلي.

لا تطبع بيانات حساسة.

---

# 28. Testing

يجب إضافة اختبارات حسب نمط المشروع.

## Unit Tests

اختبر:

- تجميع `LandingHomeResponse`.
- فلترة الأقسام المعطلة.
- فلترة العناصر غير المنشورة.
- ترتيب الأقسام.
- validation للـ DTOs.
- contact request creation.

## Integration/E2E Tests

اختبر على الأقل:

```http
GET /landing/home
POST /landing/contact
GET /admin/landing/settings
PATCH /admin/landing/settings
GET /admin/landing/preview
POST /admin/landing/publish
```

## Test Cases إلزامية

1. عند عدم وجود إعدادات، يتم إنشاء default أو يرجع response آمن.
2. عند تعطيل قسم features لا يظهر للعامة.
3. عند تفعيل preview بدون admin يرجع 401/403.
4. عند showOnLanding=false للمنتج لا يظهر في `sections.products`.
5. عند مقال draft لا يظهر للعامة.
6. عند مشروع unpublished لا يظهر للعامة.
7. عند إرسال contact بدون email وبدون phone يرجع validation error.
8. عند إرسال contact صحيح يتم إنشاء طلب.

---

# 29. توثيق API

إذا كان المشروع يستخدم Swagger، يجب تحديثه.

وثق:

- `GET /landing/home`
- `POST /landing/contact`
- كل `/admin/landing/*`

ويجب أن تظهر DTOs بشكل واضح في Swagger.

---

# 30. Backward Compatibility

لا تكسر المسارات التي تعتمد عليها لوحة التحكم الحالية.

إذا وجدت مسارات مستخدمة حاليًا مثل:

```http
GET /admin/products/landing
GET /admin/brands/landing
PATCH /admin/products/:id/landing
PATCH /admin/brands/:id/landing
```

فإما أن:

1. تبقيها وتربطها بالخدمات الجديدة.
2. أو تضيف aliases مؤقتة.

لا تحذفها في هذه المرحلة.

---

# 31. ممنوعات في هذه المرحلة

ممنوع:

- بناء UI كامل في admin-dashboard.
- إعادة تصميم landing-page.
- حذف كيانات موجودة بدون داعي.
- كسر routes قديمة.
- الاعتماد على mock data في `/landing/home`.
- جعل `/landing/home` يجمع بيانات static من الكود.
- إظهار draft للعامة.
- وضع نصوص عربية فقط في أماكن تحتاج دعم إنجليزي اختياري.
- تجاهل validation.
- تجاهل migrations.

---

# 32. خطوات التنفيذ المقترحة

## Step 1 — Inventory

افحص modules الحالية:

```txt
landing
about
projects
articles
products
brands
contact-requests
settings
```

واكتب قائمة بما هو موجود وما يحتاج إضافة.

## Step 2 — DTOs & Types

أنشئ أو حدّث:

```txt
LandingHomeResponseDto
LandingSettingsDto
LandingSeoDto
LandingSectionDto
LandingFeatureDto
LandingStatDto
LandingProductShowcaseDto
LandingBrandShowcaseDto
LandingAppShowcaseDto
LandingDownloadCtaDto
LandingServiceCenterDto
LandingContactDto
```

## Step 3 — Database

أضف migrations/fields المطلوبة.

## Step 4 — Services

أنشئ service مركزي:

```ts
LandingHomeService
```

مسؤول عن تجميع البيانات.

## Step 5 — Admin Services

جهز services لإدارة:

- settings
- sections
- seo
- features
- stats
- app showcase
- download cta
- service center
- products showcase
- brands showcase

## Step 6 — Controllers

أضف/حدّث controllers العامة والإدارية.

## Step 7 — Compatibility Routes

أضف aliases للمسارات الحالية غير المتطابقة.

## Step 8 — Tests

أضف unit/e2e tests.

## Step 9 — Swagger/Docs

وثق المسارات والـ DTOs.

## Step 10 — Final Validation

شغّل:

```bash
npm run lint
npm run test
npm run build
```

أو أوامر المشروع الفعلية.

---

# 33. Acceptance Criteria

لا تعتبر المرحلة مكتملة إلا إذا تحقق الآتي:

## Public Landing

- [ ] `GET /landing/home` يعمل بدون أخطاء.
- [ ] يرجع settings.
- [ ] يرجع seo.
- [ ] يرجع sectionOrder.
- [ ] يرجع sections كاملة.
- [ ] لا يرجع الأقسام المعطلة.
- [ ] لا يرجع draft للعامة.
- [ ] لا يرجع منتجات غير مفعلة للاندينج.
- [ ] لا يرجع براندات غير مفعلة للاندينج.
- [ ] لا يرجع مشاريع أو مقالات غير منشورة.

## Contact

- [ ] `POST /landing/contact` يعمل.
- [ ] ينشئ Contact Request.
- [ ] يحتوي validation صحيح.
- [ ] يدعم source = landing.
- [ ] لا يكسر `/contact-requests` القديم.

## Admin

- [ ] `GET /admin/landing/settings` يعمل.
- [ ] `PATCH /admin/landing/settings` يعمل.
- [ ] `GET /admin/landing/preview` يعمل.
- [ ] preview محمي بصلاحيات admin.
- [ ] publish/unpublish يعملان.
- [ ] إدارة sections تعمل.
- [ ] إدارة SEO تعمل.
- [ ] إدارة features تعمل.
- [ ] إدارة stats تعمل.
- [ ] إدارة app showcase تعمل.
- [ ] إدارة download CTA تعمل.
- [ ] إدارة service center تعمل.
- [ ] إدارة landing products تعمل.
- [ ] إدارة landing brands تعمل.

## Compatibility

- [ ] مسارات products القديمة لا تنكسر.
- [ ] مسارات brands القديمة لا تنكسر.
- [ ] `toggle-featured` للمشاريع موجود أو الفرونت لن يحتاجه لاحقًا.
- [ ] `toggle-featured` للمقالات موجود أو الفرونت لن يحتاجه لاحقًا.
- [ ] `note/notes` في contact requests لا يكسر لوحة التحكم.

## Code Quality

- [ ] لا توجد mock data في production response.
- [ ] DTOs واضحة.
- [ ] Validation موجود.
- [ ] Migrations موجودة.
- [ ] Tests موجودة أو على الأقل checklist يدوي مفصل إذا المشروع لا يحتوي tests.
- [ ] Build ينجح.
- [ ] Lint ينجح.
- [ ] Swagger محدث إن وجد.

---

# 34. Manual Testing Commands

بعد التنفيذ، اختبر يدويًا.

## Landing Home

```bash
curl -X GET "http://localhost:3000/landing/home" \
  -H "Accept: application/json"
```

يجب أن ترى:

```json
{
  "meta": {},
  "settings": {},
  "seo": {},
  "sectionOrder": [],
  "sections": {}
}
```

## Contact

```bash
curl -X POST "http://localhost:3000/landing/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "phone":"777777777",
    "message":"Test landing contact message"
  }'
```

يجب أن يرجع نجاح ويتم إنشاء Contact Request.

## Admin Preview

```bash
curl -X GET "http://localhost:3000/admin/landing/preview" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Accept: application/json"
```

## Update Settings

```bash
curl -X PATCH "http://localhost:3000/admin/landing/settings" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "heroTitleAr":"عنوان جديد",
    "heroSubtitleAr":"وصف جديد"
  }'
```

---

# 35. Expected Final Output من وكيل AI

عند إنهاء التنفيذ، يجب أن يسلّم الوكيل تقريرًا يحتوي:

```md
## Phase 1 Completion Report

### Implemented
- ...

### Updated Files
- ...

### New Files
- ...

### Database Changes
- ...

### API Endpoints Added/Updated
- ...

### Tests Added
- ...

### Manual Test Results
- ...

### Notes for Phase 2
- ...

### Known Limitations
- ...
```

---

# 36. ملاحظات مهمة للمرحلة الثانية

بعد إغلاق هذه المرحلة، المرحلة الثانية ستبني لوحة التحكم فوق هذه المسارات.

لذلك يجب أن تكون أسماء المسارات والـ DTOs مستقرة وواضحة.

لا تغير شكل:

```http
GET /landing/home
```

بعد تسليمه إلا لسبب قوي جدًا، لأن المرحلة الثالثة ستربط اللاندينج عليه بالكامل.

---

# 37. خلاصة المرحلة

هذه المرحلة لا هدفها تجميل الصفحة، بل بناء الأساس الصلب:

```txt
Backend Landing CMS Core
```

إذا تم تنفيذها بشكل صحيح، سيكون لدينا باك إند قادر على إدارة كل محتوى اللاندينج، وتجهيز لوحة التحكم والفرونت للربط الكامل في المراحل القادمة.

