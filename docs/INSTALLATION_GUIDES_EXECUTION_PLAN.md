# خطة تنفيذ ميزة "طرق التركيب"

## الهدف
إضافة قسم محتوى تعليمي داخل صفحة البروفايل العامة في التطبيق بعنوان `طرق التركيب`، بحيث يعرض للمستخدم بطاقات محتوى تعليمية خاصة بتركيب المنتجات، ثم يتيح الدخول إلى صفحة تفاصيل تحتوي على:

- فيديو
- وصف
- منتج مرتبط اختياري

هذه الوثيقة هي خطة تنفيذ فقط، وتغطي:

- `backend`
- `admin-dashboard`
- `tagadod_app`

ولا تتضمن أي تنفيذ برمجي.

---

## النتيجة المتوقعة في التطبيق

### 1. نقطة الدخول
إضافة عنصر جديد داخل القائمة الرئيسية في صفحة `/profile` بعنوان:

- `طرق التركيب`

عند الضغط عليه ينتقل المستخدم إلى صفحة قائمة المحتوى التعليمي.

### 2. صفحة القائمة
تعرض المحتوى على شكل بطاقات، وكل بطاقة تحتوي على:

- صورة غلاف
- عنوان
- تاق

عند الضغط على البطاقة ينتقل المستخدم إلى صفحة التفاصيل.

### 3. صفحة التفاصيل
تعرض:

- عنوان المحتوى
- فيديو الشرح
- وصف المحتوى
- بطاقة منتج مرتبطة إذا كان المحتوى مرتبطاً بمنتج

إذا لم يوجد منتج مرتبط، لا يتم عرض أي قسم خاص بالمنتج.

---

## النطاق الوظيفي

### خصائص المحتوى التعليمي
كل عنصر محتوى يجب أن يدعم الحقول التالية:

- `titleAr`
- `titleEn`
- `tagAr`
- `tagEn`
- `descriptionAr`
- `descriptionEn`
- `coverImageId`
- `videoId`
- `linkedProductId` اختياري
- `sortOrder`
- `isActive`
- `createdBy`
- `lastUpdatedBy`
- `createdAt`
- `updatedAt`

### ملاحظات أساسية
- لا نحتاج `slug` في النسخة الأولى.
- كل عنصر يحتوي:
  - صورة غلاف واحدة
  - فيديو واحد
  - منتج مرتبط واحد اختياري
  - تاق واحد ظاهر
- الوصف في النسخة الأولى نص عادي وليس HTML.

---

## خطة الـ Backend

## 1. إنشاء موديول مستقل
إنشاء موديول جديد باسم:

- `installation-guides`

داخل:

- `backend/src/modules`

الهدف من فصله عن `policies` هو أن هذه الميزة تعتمد على:

- بطاقات
- صورة
- فيديو
- ربط منتج
- إدارة نشر وترتيب

وهذا يختلف وظيفياً عن صفحة السياسات النصية.

## 2. الـ Schema / Model
إنشاء Schema باسم:

- `InstallationGuide`

ويحتوي الحقول التالية:

- `titleAr: string`
- `titleEn: string`
- `tagAr: string`
- `tagEn: string`
- `descriptionAr: string`
- `descriptionEn: string`
- `coverImageId: ObjectId -> Media` إجباري
- `videoId: string` إجباري
- `linkedProductId: ObjectId -> Product` اختياري
- `sortOrder: number = 0`
- `isActive: boolean = true`
- `createdBy: ObjectId -> User`
- `lastUpdatedBy: ObjectId -> User`
- timestamps

## 3. DTOs المطلوبة
إنشاء DTOs التالية:

- `CreateInstallationGuideDto`
- `UpdateInstallationGuideDto`
- `ToggleInstallationGuideDto`
- `InstallationGuideListItemDto`
- `InstallationGuideDetailDto`

ويفضل أيضاً إضافة DTO خاص بقائمة لوحة التحكم لتسهيل الفلترة والصفحات:

- `ListInstallationGuidesDto`

## 4. Admin API
إضافة endpoints للإدارة:

- `GET /admin/installation-guides`
- `POST /admin/installation-guides`
- `GET /admin/installation-guides/:id`
- `PUT /admin/installation-guides/:id`
- `POST /admin/installation-guides/:id/toggle`
- `DELETE /admin/installation-guides/:id`

### سلوك قائمة الإدارة
تدعم:

- `page`
- `limit`
- `search`
- `isActive`
- `sortBy`
- `sortOrder`

ويكون البحث على:

- `titleAr`
- `titleEn`
- `tagAr`
- `tagEn`

## 5. Public API
إضافة endpoints عامة:

- `GET /installation-guides/public`
- `GET /installation-guides/public/:id`

### سلوك `public list`
يعيد فقط العناصر:

- `isActive = true`

بالترتيب:

- `sortOrder ASC`
- ثم `createdAt DESC`

ويعيد بيانات البطاقة فقط:

- `id`
- `titleAr`
- `titleEn`
- `tagAr`
- `tagEn`
- `coverImageUrl`

### سلوك `public detail`
يعيد:

- `id`
- `titleAr`
- `titleEn`
- `tagAr`
- `tagEn`
- `descriptionAr`
- `descriptionEn`
- `coverImageUrl`
- `video`
- `linkedProduct`

وصيغة الفيديو المقترحة:

```json
{
  "id": "video-guid",
  "url": "string",
  "embedUrl": "string",
  "hlsUrl": "string",
  "mp4Url": "string",
  "thumbnailUrl": "string",
  "status": "processing | ready | failed"
}
```

وصيغة المنتج المرتبط:

```json
{
  "id": "product-id",
  "name": "string",
  "nameEn": "string",
  "mainImageUrl": "string"
}
```

إذا كان `linkedProductId` موجوداً لكن المنتج:

- محذوف
- أو غير نشط
- أو غير صالح للعرض

فيجب إعادة:

- `linkedProduct = null`

بدون كسر المحتوى.

## 6. التحقق Validation
في الخدمة يجب التحقق من:

- رفض أي `coverImageId` غير موجود
- رفض أي `linkedProductId` غير صالح
- رفض الإنشاء أو التحديث بدون `videoId`

## 7. الصلاحيات
للوحة التحكم يوصى باستخدام:

- `MARKETING_READ`
- `MARKETING_UPDATE`
- مع `ADMIN_ACCESS`

لأن المحتوى هنا أقرب إلى إدارة المحتوى التسويقي/التوعوي.

## 8. التوثيق
تحديث:

- Swagger
- وثيقة التكامل الخاصة بالتطبيق

لإضافة الـ endpoints الجديدة وصيغ الاستجابة.

---

## خطة لوحة التحكم Admin Dashboard

## 1. Feature جديدة
إنشاء feature جديدة داخل:

- `admin-dashboard/src/features/installation-guides`

## 2. المسار
إضافة صفحة إدارة تحت قسم `Marketing` على المسار:

- `/marketing/installation-guides`

## 3. تحديثات الربط
تحديث الملفات التالية:

- `routes.tsx`
- `Sidebar.tsx`
- `route-permissions.ts`
- `permissions.ts`
- i18n

## 4. الصلاحيات
ربط الصفحة بـ:

- `MARKETING_READ`
- `MARKETING_UPDATE`

مع تحديث preset:

- `CONTENT_MANAGER`

في الواجهة ليشمل صلاحيات التسويق اللازمة، حتى لا تُحجب الصفحة عن فريق المحتوى.

## 5. شاشة الإدارة
الشاشة المقترحة تتكون من:

- قائمة محتوى
- فلاتر
- إجراءات
- نموذج إنشاء/تعديل

### القائمة
تعرض لكل عنصر:

- صورة مصغرة
- عنوان
- تاق
- حالة
- ترتيب
- آخر تحديث

### الفلاتر
تدعم:

- `search`
- `isActive`
- `page`
- `limit`

### الإجراءات
تدعم:

- إضافة
- تعديل
- تفعيل/تعطيل
- حذف

## 6. نموذج الإدخال
يعيد استخدام المكونات الموجودة حالياً قدر الإمكان:

- `ImageField` أو `MediaPicker` لصورة الغلاف
- `VideoUploader` للفيديو
- `Autocomplete` للمنتج

### الحقول
- `titleAr`
- `titleEn`
- `tagAr`
- `tagEn`
- `descriptionAr`
- `descriptionEn`
- `coverImageId`
- `videoId`
- `linkedProductId` اختياري
- `sortOrder`
- `isActive`

## 7. المعاينة Preview
يفضل إضافة preview بسيط داخل النموذج يعرض:

- شكل البطاقة
- صورة الغلاف
- العنوان
- التاق
- حالة ربط المنتج

## 8. ملاحظات تنفيذية
- لا نحتاج محرر HTML.
- يكفي `textarea` أو `multiline text field`.
- البحث عن المنتج يكون شبيهاً بما هو موجود في `banners` أو أجزاء مشابهة.

---

## خطة التطبيق Flutter

هذه الخطة تخص التطبيق فقط من ناحية التكامل المستقبلي بعد اكتمال الـ backend.

## 1. إنشاء feature مستقلة
إنشاء feature جديدة داخل:

- `tagadod_app/lib/features/installation_guides`

وبنفس أسلوب المشروع الحالي:

- `data`
- `domain`
- `presentation`

## 2. المسارات
إضافة route constants:

- `/installation-guides`
- `/installation-guides/:id`

## 3. الربط في DI و Router
تسجيل:

- datasource
- repository
- cubits
- route dependencies

بنفس النمط المستخدم في features المشابهة مثل:

- `policies`

## 4. صفحة البروفايل
إضافة عنصر جديد داخل `ProfileMenuSection` بعنوان:

- `طرق التركيب`

وعند الضغط عليه ينتقل إلى صفحة القائمة.

## 5. صفحة القائمة
تعتمد على:

- `GET /installation-guides/public`

وتعرض:

- صورة
- عنوان
- تاق

مع دعم الحالات:

- `loading`
- `empty`
- `error`
- `retry`

## 6. صفحة التفاصيل
تعتمد على:

- `GET /installation-guides/public/:id`

وتعرض:

- عنوان المحتوى
- صورة أو معاينة الفيديو
- الوصف الكامل
- بطاقة منتج مرتبطة إن وجدت

## 7. الفيديو
في النسخة الأولى يفضل إعادة استخدام آلية الفيديو الحالية الموجودة في التطبيق، مثل:

- `showVideoPlayerPopup`

بدلاً من بناء player جديد من الصفر.

## 8. بطاقة المنتج المرتبط
بطاقة خفيفة مخصصة لهذه الصفحة فقط، تعرض:

- صورة المنتج
- اسم المنتج

وعند الضغط:

- الانتقال إلى `/products/:id`

ولا يفضل استخدام Product Card الكامل حتى لا نفرض بيانات إضافية غير مطلوبة.

## 9. الوصول Guest Mode
إذا كانت صفحة `/profile` متاحة للزائر حسب السلوك الحالي، فينبغي أن تتبعها هذه الميزة بنفس المنطق:

- صفحة القائمة
- وصفحة التفاصيل

بحيث لا تتعطل إذا دخل الزائر من البروفايل العام.

## 10. الترجمة
إضافة مفاتيح ترجمة جديدة في:

- `app_ar.arb`
- `app_en.arb`

مثل:

- `installationGuides`
- `installationGuidesTitle`
- `installationGuidesEmpty`
- `installationGuidesRetry`
- `installationGuideLinkedProduct`

---

## تسلسل التنفيذ المقترح

بما أن التطبيق لن يُبنى قبل اكتمال الباك اند، فالترتيب الأنسب هو:

1. تنفيذ الـ Backend بالكامل
2. تنفيذ لوحة التحكم وربطها مع الـ API
3. إدخال محتوى تجريبي من لوحة التحكم
4. تثبيت العقود النهائية للـ API
5. بناء Feature التطبيق Flutter بعد استقرار الـ API

هذا الترتيب سيقلل إعادة العمل داخل التطبيق.

---

## العقود النهائية التي يحتاجها مطور التطبيق

قبل بدء Flutter، يجب تثبيت هذه الأمور من فريق الـ backend:

### 1. شكل الاستجابة النهائي
تأكيد الصيغة النهائية لـ:

- list response
- detail response
- video object
- linked product object

### 2. طريقة الفيديو
تأكيد ما إذا كان المعتمد في التطبيق سيكون:

- `embedUrl`
- أو `hlsUrl`
- أو `mp4Url`

حتى يتم اختيار طريقة التشغيل المناسبة في Flutter.

### 3. سياسة المنتج المرتبط
تأكيد ما إذا كان المنتج المرتبط:

- يجب أن يكون نشطاً فقط
- أو يكفي أن يكون موجوداً

والخطة الحالية توصي بإرجاع `null` إذا لم يعد صالحاً للعرض.

### 4. الصور
تأكيد أن `coverImageUrl` و`mainImageUrl` يعادان مباشرة كروابط جاهزة للاستهلاك من التطبيق.

---

## حالات الاختبار المطلوبة

## Backend
- إنشاء محتوى جديد بصورة وفيديو ومنتج مرتبط
- تعديل المحتوى بدون فقدان الفيديو أو المنتج المرتبط
- قبول المحتوى بدون `linkedProductId`
- إخفاء العناصر غير النشطة من `public list`
- إعادة `404` عند طلب `public detail` لعنصر غير موجود أو غير نشط

## Admin Dashboard
- رفع فيديو ناجح وتخزين `videoId`
- اختيار منتج من البحث وحفظه
- تعديل `sortOrder` وانعكاسه في القائمة العامة
- تعطيل عنصر واختفاؤه من التطبيق

## Flutter App
- ظهور خيار `طرق التركيب` داخل `/profile`
- الانتقال من القائمة إلى صفحة البطاقات ثم التفاصيل
- عرض الفيديو وفتح المشغل
- إخفاء بطاقة المنتج إذا لم يوجد ربط
- فتح صفحة المنتج عند الضغط على البطاقة المرتبطة
- تغطية حالات `loading/empty/error`

---

## المخاطر والنقاط التي تحتاج حسم

### 1. الفيديو
إذا لم يتم تثبيت صيغة الفيديو النهائية من الـ backend مبكراً، قد يحتاج التطبيق إلى إعادة عمل في طبقة التشغيل.

### 2. المنتج المرتبط
إذا تغيرت سياسة عرض المنتج المرتبط بعد التنفيذ، قد يلزم تعديل backend والتطبيق معاً.

### 3. الصلاحيات
قد تظهر الصفحة في الـ backend لكن لا تظهر في لوحة التحكم إذا لم يتم تحديث preset الصلاحيات في الواجهة.

### 4. الترجمات
بما أن المحتوى ثنائي اللغة من البداية، يجب التأكد من أن الإدخال في لوحة التحكم لا يسمح بترك الحقول الأساسية فارغة في إحدى اللغتين.

---

## القرار المقترح

النسخة الأولى `v1` تكون بالشكل التالي:

- بطاقات صورة + عنوان + تاق
- صفحة تفاصيل تحتوي فيديو + وصف + منتج مرتبط اختياري
- إدخال ثنائي اللغة
- بدون `slug`
- بدون HTML
- بدون pagination في التطبيق العام
- مع pagination/filtering في لوحة التحكم فقط

وهذا يحقق الهدف بأقل تعقيد وأوضح مسار تنفيذ.
