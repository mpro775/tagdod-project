# خطة تنفيذ تطوير وربط الـ Landing Page بالباك إند ولوحة التحكم

## 1. الهدف العام

الهدف من هذه الخطة هو تحويل الـ Landing Page الحالية من صفحة ثابتة تعتمد على بيانات Hardcoded إلى موقع رسمي ديناميكي مرتبط بالباك إند ولوحة التحكم، مع الحفاظ على دورها الأساسي كواجهة تعريفية وتسويقية للشركة وليس كمتجر بيع.

الـ Landing Page يجب أن تعرض:

- نبذة عن الشركة.
- الإحصائيات.
- المشاريع والمنظومات والمقاولات.
- الأخبار والمقالات.
- البراندات.
- المنتجات كعرض تعريفي فقط وليس للبيع.
- بيانات التواصل.
- الدعم الفني.
- مركز الصيانة.
- أوقات الدوام.
- العنوان.
- أرقام الاتصال.
- الأقسام الحالية المهمة مثل Hero و Features و App Showcase و Download CTA.

---

## 2. الوضع الحالي المختصر

### 2.1 الـ Landing Page الحالية

الصفحة الحالية تحتوي على أقسام ثابتة تقريبًا:

```tsx
<Hero />
<Features />
<Stats />
<AppShowcase />
<DownloadCTA />
```

المشكلة أن أغلب البيانات داخل ملفات React وليست قادمة من API.

### 2.2 الباك إند الحالي

يوجد لدينا بالفعل Modules يمكن الاستفادة منها:

```txt
backend/src/modules/about
backend/src/modules/brands
backend/src/modules/products
backend/src/modules/support
backend/src/modules/services
```

لكن ينقصنا Modules أو endpoints واضحة خاصة بمحتوى الموقع الرسمي مثل:

```txt
landing
projects
articles
contact-requests
```

### 2.3 لوحة التحكم الحالية

يوجد في لوحة التحكم صفحات لإدارة:

- About.
- Products.
- Brands.
- Services.
- Support.

لكن لا يوجد حتى الآن قسم موحد لإدارة محتوى الـ Landing Page.

---

## 3. القرار المعماري المعتمد

لا نعيد بناء الـ Landing Page من الصفر.

نعمل على:

1. ربط الأقسام الحالية بالباك إند.
2. استخدام الـ Modules الموجودة مثل About و Products و Brands.
3. إضافة Modules ناقصة للمشاريع والأخبار وطلبات التواصل.
4. إضافة قسم جديد في لوحة التحكم باسم: `محتوى الموقع`.
5. إنشاء endpoint موحد للصفحة الرئيسية باسم:

```http
GET /landing/home
```

يرجع كل بيانات الصفحة دفعة واحدة لتقليل عدد الطلبات وتحسين الأداء.

---

## 4. الأقسام المطلوبة في Landing Page

الصفحة النهائية المقترحة تكون بهذا الترتيب:

```tsx
<Hero />
<AboutCompany />
<Stats />
<Features />
<ProductShowcase />
<ProjectsShowcase />
<BrandsShowcase />
<NewsArticles />
<ServiceCenter />
<ContactSupport />
<AppShowcase />
<DownloadCTA />
```

يمكن تعديل الترتيب من إعدادات لوحة التحكم لاحقًا.

---

# المرحلة الأولى: الباك إند

## 5. إنشاء Landing Module

### 5.1 المسار المقترح

```txt
backend/src/modules/landing/
├── landing.module.ts
├── landing.public.controller.ts
├── landing.admin.controller.ts
├── landing.service.ts
├── dto/
│   ├── update-landing-settings.dto.ts
│   ├── landing-home-query.dto.ts
│   └── create-contact-request.dto.ts
└── schemas/
    ├── landing-settings.schema.ts
    └── contact-request.schema.ts
```

### 5.2 وظيفة Landing Module

هذا الموديول لا يستبدل الموديولات الموجودة، بل يجمع البيانات منها للـ Landing Page.

يقوم بجلب:

- بيانات About.
- الإحصائيات.
- البراندات التي تظهر في الصفحة.
- المنتجات المختارة للعرض.
- المشاريع المميزة.
- الأخبار والمقالات المنشورة.
- بيانات التواصل.
- إعدادات الصفحة.

---

## 6. Endpoint الصفحة الرئيسية

### 6.1 Public API

```http
GET /landing/home
```

### 6.2 الاستجابة المقترحة

```json
{
  "settings": {
    "heroTitleAr": "",
    "heroTitleEn": "",
    "heroSubtitleAr": "",
    "heroSubtitleEn": "",
    "heroImage": "",
    "primaryCtaTextAr": "",
    "primaryCtaTextEn": "",
    "primaryCtaUrl": "",
    "secondaryCtaTextAr": "",
    "secondaryCtaTextEn": "",
    "secondaryCtaUrl": ""
  },
  "about": {},
  "stats": [],
  "features": [],
  "products": [],
  "projects": [],
  "brands": [],
  "articles": [],
  "contactInfo": {},
  "serviceCenter": {}
}
```

### 6.3 ملاحظات مهمة

- لا تعرض إلا البيانات المنشورة أو النشطة.
- لا تعرض المنتجات غير النشطة.
- لا تعرض المقالات Draft.
- لا تعرض المشاريع غير المنشورة.
- يجب ترتيب النتائج حسب `landingOrder` أو `sortOrder`.

---

## 7. Landing Settings Schema

نحتاج إعدادات عامة للصفحة حتى لا تبقى بيانات Hero و CTA ثابتة داخل React.

### 7.1 الحقول المقترحة

```ts
{
  heroTitleAr: string;
  heroTitleEn?: string;
  heroSubtitleAr?: string;
  heroSubtitleEn?: string;
  heroImage?: string;
  heroVideo?: string;

  primaryCtaTextAr?: string;
  primaryCtaTextEn?: string;
  primaryCtaUrl?: string;

  secondaryCtaTextAr?: string;
  secondaryCtaTextEn?: string;
  secondaryCtaUrl?: string;

  appStoreUrl?: string;
  playStoreUrl?: string;

  enableAboutSection: boolean;
  enableStatsSection: boolean;
  enableFeaturesSection: boolean;
  enableProductsSection: boolean;
  enableProjectsSection: boolean;
  enableBrandsSection: boolean;
  enableArticlesSection: boolean;
  enableContactSection: boolean;
  enableServiceCenterSection: boolean;

  sectionOrder: string[];

  isPublished: boolean;
}
```

### 7.2 sectionOrder مثال

```json
[
  "hero",
  "about",
  "stats",
  "features",
  "products",
  "projects",
  "brands",
  "articles",
  "serviceCenter",
  "contact",
  "appShowcase",
  "downloadCta"
]
```

---

## 8. تعديل Products Module

المنتجات موجودة بالفعل، لكن نحتاج تمييز المنتجات التي تظهر في Landing Page.

### 8.1 الحقول الجديدة

أضف إلى Product Schema:

```ts
showOnLanding: boolean;
landingOrder: number;
landingLabelAr?: string;
landingLabelEn?: string;
landingDescriptionAr?: string;
landingDescriptionEn?: string;
```

### 8.2 الهدف

عدم استخدام منطق البيع في صفحة الهبوط.

المنتج في Landing Page يظهر كـ Showcase فقط:

- صورة.
- اسم.
- وصف مختصر.
- براند.
- تصنيف.
- CTA للتواصل أو معرفة المزيد.

لا نعرض:

- سلة.
- شراء.
- دفع.
- كمية.
- Checkout.

### 8.3 API مقترح

```http
GET /products/landing/showcase
```

أو يتم جلبها داخليًا من خلال:

```http
GET /landing/home
```

---

## 9. تعديل Brands Module

البراندات موجودة بالفعل، لكن نحتاج تحديد ما يظهر في Landing Page.

### 9.1 الحقول الجديدة

أضف إلى Brand Schema:

```ts
showOnLanding: boolean;
landingOrder: number;
landingDescriptionAr?: string;
landingDescriptionEn?: string;
```

### 9.2 API مقترح

```http
GET /brands/landing
```

أو يتم جلبها داخليًا من خلال:

```http
GET /landing/home
```

---

## 10. إنشاء Projects Module

هذا الموديول جديد ومهم لأن الشركة ستدخل في مشاريع منظومات ومقاولات.

### 10.1 المسار المقترح

```txt
backend/src/modules/projects/
├── projects.module.ts
├── projects.public.controller.ts
├── projects.admin.controller.ts
├── projects.service.ts
├── dto/
│   ├── create-project.dto.ts
│   ├── update-project.dto.ts
│   └── project-query.dto.ts
└── schemas/
    └── project.schema.ts
```

### 10.2 Project Schema المقترح

```ts
{
  titleAr: string;
  titleEn?: string;
  slug: string;

  shortDescriptionAr?: string;
  shortDescriptionEn?: string;

  descriptionAr?: string;
  descriptionEn?: string;

  type: 'system' | 'contracting' | 'maintenance' | 'installation' | 'supply' | 'partnership' | 'other';

  status: 'planned' | 'in_progress' | 'completed';

  clientName?: string;
  location?: string;
  city?: string;

  coverImage?: string;
  images?: string[];

  startDate?: Date;
  endDate?: Date;

  metrics?: {
    labelAr: string;
    labelEn?: string;
    value: string;
  }[];

  tags?: string[];

  isFeatured: boolean;
  showOnLanding: boolean;
  landingOrder: number;

  isPublished: boolean;

  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
}
```

### 10.3 Public APIs

```http
GET /projects
GET /projects/featured
GET /projects/:slug
```

### 10.4 Admin APIs

```http
GET /admin/projects
POST /admin/projects
PATCH /admin/projects/:id
DELETE /admin/projects/:id
PATCH /admin/projects/:id/toggle-landing
PATCH /admin/projects/reorder
```

---

## 11. إنشاء Articles / News Module

نحتاج موديول للأخبار والمقالات.

### 11.1 المسار المقترح

```txt
backend/src/modules/articles/
├── articles.module.ts
├── articles.public.controller.ts
├── articles.admin.controller.ts
├── articles.service.ts
├── dto/
│   ├── create-article.dto.ts
│   ├── update-article.dto.ts
│   └── article-query.dto.ts
└── schemas/
    └── article.schema.ts
```

### 11.2 Article Schema المقترح

```ts
{
  titleAr: string;
  titleEn?: string;
  slug: string;

  excerptAr?: string;
  excerptEn?: string;

  contentAr: string;
  contentEn?: string;

  coverImage?: string;

  type: 'news' | 'article';
  category?: string;
  tags?: string[];

  authorName?: string;
  publishDate?: Date;

  status: 'draft' | 'published' | 'archived';

  isFeatured: boolean;
  showOnLanding: boolean;
  landingOrder: number;

  readTime?: number;

  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
}
```

### 11.3 Public APIs

```http
GET /articles
GET /articles/featured
GET /articles/:slug
```

### 11.4 Admin APIs

```http
GET /admin/articles
POST /admin/articles
PATCH /admin/articles/:id
DELETE /admin/articles/:id
PATCH /admin/articles/:id/publish
PATCH /admin/articles/:id/archive
PATCH /admin/articles/reorder
```

---

## 12. إنشاء Contact Requests Module

لا نستخدم Support Ticket مباشرة للزوار لأن نظام الدعم الحالي غالبًا مخصص لمستخدم مسجل.

ننشئ موديول مستقل لطلبات الموقع العامة.

### 12.1 المسار المقترح

```txt
backend/src/modules/contact-requests/
├── contact-requests.module.ts
├── contact-requests.public.controller.ts
├── contact-requests.admin.controller.ts
├── contact-requests.service.ts
├── dto/
│   ├── create-contact-request.dto.ts
│   ├── update-contact-request-status.dto.ts
│   └── contact-request-query.dto.ts
└── schemas/
    └── contact-request.schema.ts
```

### 12.2 Contact Request Schema المقترح

```ts
{
  name: string;
  phone: string;
  email?: string;
  city?: string;

  requestType: 'general' | 'technical_support' | 'service_center' | 'maintenance' | 'contracting' | 'partnership' | 'other';

  subject?: string;
  message: string;

  source: 'landing_page' | 'website' | 'mobile_app' | 'admin';

  status: 'new' | 'in_review' | 'contacted' | 'converted' | 'closed';

  assignedTo?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}
```

### 12.3 Public API

```http
POST /contact-requests
```

أو:

```http
POST /landing/contact
```

### 12.4 Admin APIs

```http
GET /admin/contact-requests
GET /admin/contact-requests/:id
PATCH /admin/contact-requests/:id/status
PATCH /admin/contact-requests/:id/assign
DELETE /admin/contact-requests/:id
```

### 12.5 سلوك مهم

عند وصول طلب جديد:

- يحفظ في قاعدة البيانات.
- يظهر في لوحة التحكم.
- يمكن لاحقًا ربطه بإشعار داخلي.
- يمكن لاحقًا تحويله إلى تذكرة دعم أو طلب صيانة.

---

# المرحلة الثانية: لوحة التحكم

## 13. إضافة قسم جديد في Sidebar

أضف مجموعة جديدة في لوحة التحكم:

```txt
محتوى الموقع
```

وتحتها:

```txt
- إعدادات صفحة الهبوط
- عن الشركة
- المشاريع
- الأخبار والمقالات
- منتجات صفحة الهبوط
- براندات صفحة الهبوط
- طلبات التواصل
```

---

## 14. صفحة إعدادات صفحة الهبوط

### 14.1 الهدف

تمكين الإدارة من تعديل محتوى الـ Hero والـ CTA وتفعيل وتعطيل الأقسام.

### 14.2 الحقول المطلوبة

- عنوان Hero عربي.
- عنوان Hero إنجليزي.
- وصف Hero عربي.
- وصف Hero إنجليزي.
- صورة Hero.
- رابط فيديو اختياري.
- نص الزر الأساسي.
- رابط الزر الأساسي.
- نص الزر الثانوي.
- رابط الزر الثانوي.
- رابط App Store.
- رابط Google Play.
- تفعيل/تعطيل الأقسام.
- ترتيب الأقسام.
- حالة النشر.

---

## 15. صفحة المشاريع

### 15.1 المطلوب

إدارة كاملة للمشاريع.

### 15.2 المكونات

- جدول المشاريع.
- زر إضافة مشروع.
- فلترة حسب النوع.
- فلترة حسب الحالة.
- فلترة حسب النشر.
- فلترة حسب الظهور في Landing Page.
- ترتيب المشاريع.
- رفع صورة الغلاف.
- معرض صور.
- حقول SEO.

### 15.3 الإجراءات

- إضافة.
- تعديل.
- حذف.
- نشر/إخفاء.
- إظهار/إخفاء في Landing Page.
- جعله Featured.
- ترتيب العرض.

---

## 16. صفحة الأخبار والمقالات

### 16.1 المطلوب

إدارة المحتوى التحريري للموقع.

### 16.2 المكونات

- جدول الأخبار والمقالات.
- إضافة مقال.
- محرر نصوص Rich Text أو Markdown.
- اختيار نوع المحتوى: خبر أو مقال.
- صورة غلاف.
- وسوم.
- تصنيف.
- حالة النشر.
- تاريخ النشر.
- حقول SEO.

### 16.3 الإجراءات

- إنشاء Draft.
- نشر.
- أرشفة.
- تعديل.
- حذف.
- إظهار/إخفاء في Landing Page.
- ترتيب العرض.

---

## 17. صفحة منتجات صفحة الهبوط

### 17.1 الهدف

اختيار المنتجات التي تظهر في Landing Page كعرض فقط.

### 17.2 المكونات

- قائمة المنتجات الحالية.
- بحث عن منتج.
- تفعيل `showOnLanding`.
- ترتيب المنتجات.
- تعديل وصف Landing الخاص بالمنتج.
- تعديل Label خاص بالعرض.

### 17.3 ملاحظة مهمة

هذه الصفحة لا تضيف منتج جديد. الإضافة الأصلية تبقى من صفحة المنتجات الحالية.

هذه الصفحة فقط تتحكم بما يظهر في Landing Page.

---

## 18. صفحة براندات صفحة الهبوط

### 18.1 الهدف

اختيار البراندات التي تظهر في Landing Page.

### 18.2 المكونات

- قائمة البراندات الحالية.
- تفعيل `showOnLanding`.
- ترتيب البراندات.
- وصف مختصر اختياري للبراند في Landing Page.

---

## 19. صفحة طلبات التواصل

### 19.1 الهدف

عرض وإدارة كل الطلبات القادمة من Landing Page.

### 19.2 المكونات

- جدول الطلبات.
- فلترة حسب نوع الطلب.
- فلترة حسب الحالة.
- فلترة حسب التاريخ.
- بحث بالاسم أو الهاتف.
- صفحة تفاصيل الطلب.
- تحديث الحالة.
- إضافة ملاحظات داخلية.
- إسناد الطلب لشخص من الفريق لاحقًا.

### 19.3 الحالات

```txt
new
in_review
contacted
converted
closed
```

---

# المرحلة الثالثة: الـ Landing Page Frontend

## 20. إنشاء API Client

### 20.1 المسار المقترح

```txt
landing-page/src/lib/api.ts
landing-page/src/services/landing.service.ts
landing-page/src/types/landing.ts
```

### 20.2 وظائف الخدمة

```ts
getLandingHome()
submitContactRequest(payload)
getProjectBySlug(slug)
getArticleBySlug(slug)
```

---

## 21. ربط الصفحة الرئيسية

بدل استخدام البيانات الثابتة، يتم جلب البيانات من:

```http
GET /landing/home
```

### 21.1 التعامل مع الحالات

يجب دعم:

- Loading State.
- Error State.
- Empty State.
- Fallback Data في حال فشل الاتصال.

---

## 22. قسم About Company

### 22.1 مصدر البيانات

من:

```json
about
```

القادم من `/landing/home`.

### 22.2 يعرض

- عنوان القسم.
- وصف مختصر.
- صورة الشركة.
- الرؤية.
- الرسالة.
- القيم بشكل مختصر.

---

## 23. قسم Stats

### 23.1 مصدر البيانات

من:

```json
stats
```

### 23.2 يعرض

- عدد المشاريع.
- عدد العملاء.
- عدد سنوات الخبرة.
- عدد المنتجات أو الخدمات.

حسب الموجود في لوحة التحكم.

---

## 24. قسم Product Showcase

### 24.1 مصدر البيانات

من:

```json
products
```

### 24.2 طريقة العرض

يعرض المنتجات كـ Showcase فقط.

### 24.3 ممنوع عرض

- سلة.
- شراء.
- دفع.
- Checkout.

### 24.4 CTA المقترح

- تواصل معنا.
- اطلب استشارة.
- اعرف المزيد.

---

## 25. قسم Projects Showcase

### 25.1 مصدر البيانات

من:

```json
projects
```

### 25.2 طريقة العرض

- Cards احترافية.
- نوع المشروع.
- الحالة.
- صورة الغلاف.
- وصف مختصر.
- أرقام مختصرة إن وجدت.
- زر عرض التفاصيل.

### 25.3 صفحات مستقبلية

```txt
/projects
/projects/:slug
```

---

## 26. قسم Brands Showcase

### 26.1 مصدر البيانات

من:

```json
brands
```

### 26.2 طريقة العرض

- شعار البراند.
- اسم البراند.
- وصف مختصر اختياري.
- عرض كشريط أفقي أو Grid.

---

## 27. قسم News & Articles

### 27.1 مصدر البيانات

من:

```json
articles
```

### 27.2 طريقة العرض

- آخر 3 أو 4 مقالات.
- صورة الغلاف.
- نوع المحتوى.
- التاريخ.
- عنوان.
- وصف مختصر.
- زر قراءة المزيد.

### 27.3 صفحات مستقبلية

```txt
/news
/news/:slug
```

---

## 28. قسم Service Center

### 28.1 مصدر البيانات

من:

```json
serviceCenter
```

أو من إعدادات About/Contact.

### 28.2 يعرض

- عنوان مركز الصيانة.
- أوقات الدوام.
- رقم الاتصال.
- العنوان.
- نوع الخدمات.
- CTA لإرسال طلب صيانة.

---

## 29. قسم Contact Support

### 29.1 مصدر البيانات

يعرض بيانات التواصل من:

```json
contactInfo
```

ويرسل النموذج إلى:

```http
POST /landing/contact
```

### 29.2 حقول النموذج

- الاسم.
- رقم الهاتف.
- البريد الإلكتروني اختياري.
- المدينة.
- نوع الطلب.
- الرسالة.

### 29.3 أنواع الطلب

```txt
استفسار عام
دعم فني
مركز صيانة
طلب صيانة
طلب مقاولة
شراكة
أخرى
```

---

# المرحلة الرابعة: تحسين تجربة المستخدم والواجهة

## 30. قواعد تصميم مهمة

- الصفحة ليست متجر بيع.
- التركيز على الثقة والاحتراف.
- إبراز الشركة كمزود حلول ومشاريع ومنظومات.
- إبراز المنتجات كقدرات وحلول وليس كعناصر شراء.
- استخدام صور قوية وCards احترافية.
- جعل CTA واضح في كل قسم.
- دعم RTL بالكامل.
- دعم Responsive للموبايل.

---

## 31. حالات Empty State

في حال عدم وجود بيانات:

### لا توجد مشاريع

لا تظهر رسالة تقنية، بل يخفي القسم أو يعرض نصًا بسيطًا:

```txt
نعمل حاليًا على توثيق مشاريعنا، وسيتم نشرها قريبًا.
```

### لا توجد مقالات

```txt
سيتم نشر آخر الأخبار والمقالات قريبًا.
```

### لا توجد منتجات مختارة

يتم إخفاء قسم المنتجات من الصفحة.

---

## 32. SEO

يجب إضافة SEO لكل من:

- الصفحة الرئيسية.
- صفحة المشاريع.
- صفحة تفاصيل المشروع.
- صفحة الأخبار.
- صفحة تفاصيل المقال.

### 32.1 الحقول المطلوبة

- metaTitle.
- metaDescription.
- canonicalUrl.
- ogImage.
- structured data لاحقًا.

---

# المرحلة الخامسة: الاختبارات

## 33. اختبار الباك إند

اختبر التالي:

```http
GET /landing/home
POST /landing/contact
GET /projects
GET /projects/:slug
GET /articles
GET /articles/:slug
```

### 33.1 حالات الاختبار

- لا توجد بيانات.
- بيانات منشورة.
- بيانات غير منشورة.
- منتجات غير نشطة.
- براندات غير مفعلة.
- مقال Draft.
- مشروع غير Published.
- إرسال Contact Request صحيح.
- إرسال Contact Request ناقص.

---

## 34. اختبار لوحة التحكم

اختبر:

- إضافة مشروع.
- نشر مشروع.
- إظهاره في Landing Page.
- تعديل ترتيبه.
- إضافة مقال.
- نشر مقال.
- اختيار منتجات للصفحة.
- اختيار براندات للصفحة.
- إرسال طلب من الصفحة وظهوره في لوحة التحكم.
- تغيير حالة الطلب.

---

## 35. اختبار Landing Page

اختبر:

- تحميل الصفحة مع بيانات كاملة.
- تحميل الصفحة بدون مشاريع.
- تحميل الصفحة بدون مقالات.
- تحميل الصفحة بدون منتجات.
- فشل API.
- إرسال نموذج تواصل بنجاح.
- ظهور رسالة خطأ عند نقص البيانات.
- الموبايل.
- التابلت.
- الديسكتوب.
- RTL.
- الأداء.

---

# 36. ترتيب التنفيذ العملي

## المرحلة 1

Backend:

1. إنشاء Landing Module.
2. إنشاء `/landing/home`.
3. ربط About و Stats.
4. ربط Brands.
5. ربط Products.

Frontend:

1. إنشاء API Client.
2. ربط الصفحة الرئيسية بـ `/landing/home`.
3. استبدال البيانات الثابتة تدريجيًا.

---

## المرحلة 2

Backend:

1. إنشاء Contact Requests Module.
2. إنشاء `POST /landing/contact`.
3. إنشاء Admin APIs لطلبات التواصل.

Admin:

1. إضافة صفحة طلبات التواصل.
2. عرض الطلبات.
3. تحديث حالة الطلب.

Landing Page:

1. إنشاء نموذج تواصل.
2. ربطه بالـ API.

---

## المرحلة 3

Backend:

1. إنشاء Projects Module.
2. إضافة Public APIs.
3. إضافة Admin APIs.

Admin:

1. إضافة صفحة المشاريع.
2. إضافة/تعديل/نشر/ترتيب المشاريع.

Landing Page:

1. إضافة قسم Projects Showcase.
2. إضافة صفحة تفاصيل المشروع لاحقًا.

---

## المرحلة 4

Backend:

1. إنشاء Articles Module.
2. إضافة Public APIs.
3. إضافة Admin APIs.

Admin:

1. إضافة صفحة الأخبار والمقالات.
2. دعم Draft/Published/Archived.

Landing Page:

1. إضافة قسم News & Articles.
2. إضافة صفحة تفاصيل المقال لاحقًا.

---

## المرحلة 5

Backend:

1. إضافة `showOnLanding` و `landingOrder` للمنتجات.
2. إضافة `showOnLanding` و `landingOrder` للبراندات.

Admin:

1. إضافة صفحة منتجات صفحة الهبوط.
2. إضافة صفحة براندات صفحة الهبوط.

Landing Page:

1. عرض المنتجات المختارة فقط.
2. عرض البراندات المختارة فقط.

---

## المرحلة 6

1. تحسين UI للأقسام.
2. تحسين Responsive.
3. تحسين SEO.
4. تحسين الأداء.
5. اختبار شامل.
6. تجهيز Seed Data أولية.

---

# 37. Seed Data المقترحة

## 37.1 Landing Settings

```json
{
  "heroTitleAr": "حلول ذكية للطاقة والخدمات والمشاريع",
  "heroSubtitleAr": "نقدم منظومة متكاملة تجمع بين المنتجات، الصيانة، الدعم الفني، وتنفيذ المشاريع باحترافية.",
  "primaryCtaTextAr": "تواصل معنا",
  "primaryCtaUrl": "#contact",
  "secondaryCtaTextAr": "استعرض مشاريعنا",
  "secondaryCtaUrl": "#projects",
  "enableAboutSection": true,
  "enableStatsSection": true,
  "enableProductsSection": true,
  "enableProjectsSection": true,
  "enableBrandsSection": true,
  "enableArticlesSection": true,
  "enableContactSection": true,
  "enableServiceCenterSection": true,
  "isPublished": true
}
```

## 37.2 Contact Request Types

```json
[
  "general",
  "technical_support",
  "service_center",
  "maintenance",
  "contracting",
  "partnership",
  "other"
]
```

## 37.3 Project Types

```json
[
  "system",
  "contracting",
  "maintenance",
  "installation",
  "supply",
  "partnership",
  "other"
]
```

---

# 38. ملاحظات مهمة للمطور

1. لا تربط منتجات الـ Landing بمنطق السلة أو الشراء.
2. لا تعرض كل المنتجات تلقائيًا.
3. لا تعرض كل البراندات تلقائيًا.
4. استخدم `showOnLanding` لتحديد الظهور.
5. استخدم `landingOrder` لترتيب العرض.
6. اجعل `/landing/home` هو المصدر الرئيسي للصفحة.
7. حافظ على البيانات المنشورة فقط في Public APIs.
8. لا تجعل Contact Requests تحتاج تسجيل دخول.
9. اجعل Admin APIs محمية بالصلاحيات.
10. لا تكسر الصفحات الحالية في لوحة التحكم.
11. نفذ التعديلات تدريجيًا ولا تستبدل كل شيء دفعة واحدة.

---

# 39. النتيجة النهائية المتوقعة

بعد تنفيذ الخطة ستكون لدينا:

- Landing Page ديناميكية مرتبطة بالباك إند.
- لوحة تحكم تدير محتوى الموقع.
- قسم مشاريع احترافي.
- قسم أخبار ومقالات.
- قسم منتجات للعرض فقط.
- قسم براندات قابل للتحكم.
- نموذج تواصل عام للزوار.
- إدارة طلبات التواصل من لوحة التحكم.
- بيانات الشركة والإحصائيات مرتبطة من About.
- قابلية تطوير مستقبلية بدون إعادة بناء.

---

# 40. ملخص القرار النهائي

القرار النهائي هو بناء طبقة Website/Landing CMS خفيفة فوق النظام الحالي.

نستخدم الموجود:

- About.
- Products.
- Brands.
- Services.
- Support جزئيًا.

ونضيف الناقص:

- Landing Module.
- Projects Module.
- Articles Module.
- Contact Requests Module.
- Landing Settings.
- صفحات إدارة محتوى الموقع في لوحة التحكم.

بهذا تتحول الصفحة من Landing Page ثابتة إلى موقع رسمي قابل للإدارة والتوسع.
