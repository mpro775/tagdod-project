# Admin Dashboard — Phase 2 Execution Plan
## إعادة بناء تجربة الصفحات الأساسية بعد المرحلة 0 و 1

> هذا الملف موجّه إلى وكيل AI/Codex لتنفيذ **المرحلة 2** في مشروع لوحة التحكم.
> الهدف من هذه المرحلة هو إعادة بناء تجربة الصفحات الرئيسية في لوحة التحكم باستخدام الـ Design System الذي تم تأسيسه في المرحلة 1، مع الحفاظ على الوظائف التي تم إصلاحها في المرحلة 0.

---

## 0. القاعدة الذهبية لهذه المرحلة

هذه المرحلة ليست مرحلة Responsive شاملة وليست مرحلة إصلاح Backend عشوائية.

يجب تنفيذ الآتي بالترتيب:

1. الحفاظ على كل إصلاحات المرحلة 0.
2. استخدام مكونات المرحلة 1 المشتركة بدل بناء UI عشوائي داخل كل صفحة.
3. إعادة تصميم الصفحات الأساسية فقط.
4. عدم إزالة أي عملية موجودة إلا إذا كانت مكسورة أو غير مدعومة من الـ API ويتم توثيق ذلك.
5. عدم تغيير contracts الخاصة بالـ API إلا إذا كان ضروريًا جدًا، وفي هذه الحالة يجب توثيقه بوضوح.
6. التركيز على Desktop / Tablet layout أولًا، ثم تجهيز البنية للريسبونسف بدون تنفيذه بالكامل.
7. كل صفحة يتم تعديلها يجب أن تحتوي على:
   - Loading state
   - Empty state
   - Error state
   - Permission-aware actions
   - Confirm dialogs للعمليات الخطرة
   - Toast واضح بعد كل عملية
   - لا توجد أزرار غير فعالة بدون سبب واضح

---

## 1. المتطلبات قبل البدء

قبل تنفيذ المرحلة 2 يجب التأكد من وجود نتائج المرحلة 0 و 1.

### تحقق من المرحلة 0

يجب وجود أو تحقق التالي:

- إصلاح route الإعدادات.
- توحيد Toast/Snackbar.
- تفعيل Cart Reminder.
- إصلاح Zero Results أو تجهيز أساسه.
- إصلاح Edit Engineer أو توثيق ما تبقى.
- إصلاح API envelope normalization.
- ضبط route permissions.
- وجود تقرير:

```txt
PHASE_0_RESULTS.md
```

### تحقق من المرحلة 1

يجب وجود Design System أو مكونات مشتركة مشابهة لهذه:

```txt
src/shared/theme/
src/shared/components/ui/
src/shared/components/layout/
```

ومكونات مثل:

```txt
PageShell
PageHeader
SectionCard
StatCard
StatusChip
DataToolbar
EmptyState
ErrorState
LoadingState
ConfirmDialog
DetailsDrawer
PermissionGuard
FormActionBar
```

ويجب وجود تقرير:

```txt
PHASE_1_DESIGN_SYSTEM_RESULTS.md
```

إذا لم تكن هذه الملفات أو المكونات موجودة، لا تبدأ المرحلة 2 قبل إكمال المرحلة 1 أو توثيق النواقص.

---

## 2. هدف المرحلة 2

تحويل لوحة التحكم من مجموعة صفحات متفرقة إلى تجربة Admin احترافية متماسكة.

الصفحات المستهدفة في هذه المرحلة:

1. Dashboard
2. Orders
3. Products
4. Cart / Abandoned Carts
5. Website Content
6. Support / Tejo
7. Analytics

هذه الصفحات هي قلب لوحة التحكم، ويجب أن تصبح هي النموذج الذي تُبنى عليه بقية الصفحات لاحقًا.

---

## 3. مبدأ التنفيذ العام لكل صفحة

كل صفحة يتم إعادة بنائها يجب أن تتبع هذا الهيكل:

```tsx
<PageShell>
  <PageHeader
    title=""
    description=""
    breadcrumbs={[]}
    actions={[]}
  />

  <PageSummaryGrid>
    <StatCard />
    <StatCard />
    <StatCard />
  </PageSummaryGrid>

  <SectionCard>
    <DataToolbar />
    <MainContent />
  </SectionCard>
</PageShell>
```

مع الالتزام بالتالي:

- لا تستخدم `Box` و `Paper` بشكل عشوائي في كل صفحة.
- لا تكرر styling inline إذا كان يمكن وضعه في مكون مشترك.
- لا تكتب ألوان hard-coded إلا إذا كانت من theme tokens.
- لا تكرر حالات loading/error/empty داخل كل صفحة.
- لا تجعل action خطيرًا يعمل مباشرة بدون ConfirmDialog.
- لا تعرض زرًا لا يملك المستخدم صلاحية تنفيذه.
- لا تعرض زرًا غير مربوط أو disabled دائمًا بدون tooltip يشرح السبب.

---

## 4. المرحلة 2.1 — Dashboard Redesign

### الملفات المتوقعة

ابحث داخل:

```txt
src/features/dashboard/
src/pages/dashboard/
src/shared/components/
```

قد تختلف أسماء الملفات، لذلك استخدم البحث عن:

```txt
Dashboard
Stats
Overview
RecentOrders
Analytics
```

### الهدف

تحويل Dashboard إلى مركز قيادة حقيقي.

### الشكل المطلوب

يجب أن تحتوي الصفحة على:

#### 1. Hero / Command Center

في أعلى الصفحة:

- تحية أو عنوان واضح.
- وصف مختصر لحالة النظام.
- آخر تحديث للبيانات.
- Quick actions حسب الصلاحية:
  - إضافة منتج
  - مراجعة الطلبات
  - فتح التذاكر
  - إنشاء تقرير

#### 2. KPI Cards

بطاقات رئيسية:

- إجمالي المبيعات
- الطلبات الجديدة
- المستخدمون الجدد
- المنتجات منخفضة المخزون
- تذاكر الدعم المفتوحة
- السلات المتروكة

كل بطاقة يجب أن تحتوي:

- رقم رئيسي
- وصف
- trend إذا توفر
- رابط للصفحة المرتبطة
- loading skeleton
- error fallback صغير

#### 3. Attention Center

قسم مهم جدًا باسم مثل:

```txt
ما يحتاج انتباهك الآن
```

يعرض:

- طلبات معلقة
- منتجات منخفضة المخزون
- سلات متروكة عالية القيمة
- تذاكر دعم غير محلولة
- عمليات فاشلة أو تنبيهات نظام إن وجدت

يجب أن يكون القسم عمليًا وليس مجرد أرقام.

#### 4. Recent Activity

عرض آخر العمليات أو السجلات:

- طلب جديد
- مستخدم جديد
- تحديث منتج
- عملية دعم
- Audit log إن وجد

#### 5. Charts

لا تكثر الرسوم. يكفي:

- مبيعات آخر 7/30 يوم
- توزيع الطلبات حسب الحالة
- أفضل المنتجات

### ممنوعات

- ممنوع Dashboard مزدحم جدًا.
- ممنوع أرقام بلا معنى أو بلا رابط.
- ممنوع استخدام ألوان عشوائية.
- ممنوع ترك card فارغ إذا لا توجد بيانات؛ استخدم EmptyState.

### Acceptance Criteria

- Dashboard تعرض معلومات مفيدة خلال أول 5 ثوانٍ.
- كل card رئيسي يقود إلى صفحة مرتبطة.
- لا توجد console errors.
- لا توجد أزرار شكلية فقط.
- الصفحة تستخدم مكونات Design System من المرحلة 1.

---

## 5. المرحلة 2.2 — Orders Experience Redesign

### الملفات المتوقعة

ابحث داخل:

```txt
src/features/orders/
src/pages/orders/
```

وابحث عن:

```txt
OrdersPage
OrderDetails
OrderStatus
OrderTable
```

### الهدف

تحويل صفحة الطلبات إلى أداة تشغيل يومية واضحة.

### المتطلبات

#### 1. Page Header

يجب أن يحتوي:

- العنوان: الطلبات
- وصف: إدارة الطلبات، الحالات، الشحن، والإجراءات
- Actions:
  - تصدير
  - تحديث
  - إنشاء طلب يدوي إن كان مدعومًا

#### 2. Status Tabs

بدل جدول واحد فقط، أضف تبويبات واضحة:

- الكل
- جديد
- قيد المعالجة
- قيد الشحن
- مكتمل
- ملغي
- مسترد / مرتجع إن كان مدعومًا

كل تبويب يظهر count إذا متاح.

#### 3. Filters

يجب توفير:

- بحث برقم الطلب أو اسم العميل أو الهاتف
- فلتر الحالة
- فلتر التاريخ
- فلتر طريقة الدفع إن كانت موجودة
- فلتر المدينة/المنطقة إن كانت موجودة

#### 4. Orders Table

الجدول يجب أن يعرض:

- رقم الطلب
- العميل
- المبلغ
- الحالة
- الدفع
- تاريخ الإنشاء
- آخر تحديث
- إجراءات

#### 5. Order Details Drawer

عند الضغط على طلب، افتح DetailsDrawer بدل التنقل العشوائي إذا كان مناسبًا.

يحتوي:

- بيانات العميل
- المنتجات
- حالة الطلب
- الدفع
- الشحن
- Timeline للحالة
- ملاحظات
- أزرار الإجراءات

#### 6. Status Workflow

الأزرار حسب الحالة، مثال:

- قبول الطلب
- تجهيز
- شحن
- إكمال
- إلغاء
- استرداد

يجب استخدام ConfirmDialog للعمليات الخطرة مثل الإلغاء أو الاسترداد.

#### 7. Bulk Actions

إذا كان الجدول يدعم selection:

- تغيير الحالة لمجموعة
- تصدير المحدد
- طباعة إن كان مدعومًا

إذا غير مدعوم API، لا تضف action وهمي. وثّق في التقرير.

### Acceptance Criteria

- يمكن للمدير معرفة الطلبات المهمة بسرعة.
- كل status action يملك loading/error/success.
- لا يوجد زر status يؤدي لفشل صامت.
- التفاصيل تظهر بشكل واضح بدون ازدحام.
- لا يتم تغيير أي order status بدون تأكيد إذا كانت العملية خطرة.

---

## 6. المرحلة 2.3 — Products Experience Redesign

### الملفات المتوقعة

ابحث داخل:

```txt
src/features/products/
src/pages/products/
```

وابحث عن:

```txt
ProductsPage
ProductForm
ProductDetails
Inventory
Linked
Unlinked
```

### الهدف

تحويل إدارة المنتجات إلى تجربة واضحة للكتالوج، المخزون، الربط، والنشر.

### المتطلبات

#### 1. Product Overview

في أعلى الصفحة:

- إجمالي المنتجات
- المنشورة
- غير المنشورة
- منخفضة المخزون
- غير المربوطة
- تحتاج مراجعة

#### 2. Product Views

وفر view switch:

- Table View
- Compact Card View

لكن لا تبالغ. إذا كان الوقت محدودًا، نفذ Table View احترافي فقط وجهز مكان view switch لاحقًا.

#### 3. Filters

- بحث باسم المنتج أو SKU
- فلتر التصنيف
- فلتر الحالة
- فلتر المخزون
- فلتر الربط linked/unlinked
- فلتر النشر published/unpublished

#### 4. Product Row/Card

يجب أن يظهر:

- صورة المنتج
- الاسم
- SKU
- السعر
- المخزون
- الحالة
- الربط
- آخر تحديث
- إجراءات

#### 5. Product Details Drawer

عند الضغط:

- معلومات المنتج
- الصور
- الأسعار
- المخزون
- الربط
- إحصائيات إن كانت مدعومة
- إجراءات سريعة

#### 6. Product Form Improvements

صفحات إنشاء/تعديل المنتج يجب تحسينها جزئيًا ضمن هذه المرحلة:

- تقسيم النموذج إلى Sections:
  - البيانات الأساسية
  - السعر والمخزون
  - الصور
  - التصنيف
  - SEO/الظهور إن وجد
- استخدام FormActionBar ثابت في الأسفل.
- استخدام MediaPicker بدل إدخال URL يدوي إذا كان Media موجودًا.
- Preview بسيط للصورة والبطاقة.

#### 7. التعامل مع update-stats

إذا وجدت في الواجهة action مثل:

```txt
/products/:id/update-stats
```

وكان endpoint غير موجود في الباك إند:

- لا تترك الزر يفشل.
- إما احذفه مؤقتًا من الواجهة مع توثيق.
- أو اربطه endpoint صحيح إن كان موجودًا باسم آخر.
- أو أضف backend endpoint فقط إذا كان ذلك مطلوبًا بوضوح ومطابقًا للبنية.

### Acceptance Criteria

- إدارة المنتج لا تعتمد على جدول خام فقط.
- حالة المنتج والمخزون والربط واضحة.
- لا يوجد action مكسور.
- forms أصبحت منظمة وأقل إرباكًا.
- الصور لا تعتمد فقط على إدخال URL إذا كان Media Library متاحًا.

---

## 7. المرحلة 2.4 — Cart / Abandoned Carts Redesign

### الملفات المتوقعة

ابحث داخل:

```txt
src/features/cart/
```

وابحث عن:

```txt
CartManagement
AbandonedCarts
SendReminder
CartReminder
```

### الهدف

تحويل السلات المتروكة من صفحة عرض إلى أداة استرجاع مبيعات.

### المتطلبات

#### 1. Summary Cards

- إجمالي السلات
- السلات المتروكة
- قيمة السلات المتروكة
- reminders المرسلة
- recovered carts إن كانت مدعومة

#### 2. Abandoned Cart Table

يعرض:

- العميل
- الهاتف/الإيميل إن وجد
- عدد المنتجات
- القيمة
- آخر نشاط
- حالة التذكير
- إجراءات

#### 3. Cart Details Drawer

يحتوي:

- بيانات العميل
- المنتجات
- القيمة
- آخر نشاط
- سجل التذكيرات
- أزرار:
  - إرسال تذكير
  - عرض المستخدم
  - عرض المنتجات

#### 4. Send Reminder Dialog

يجب أن يكون مكتملًا:

- اختيار template إن وجد
- معاينة الرسالة
- قناة الإرسال إن كانت مدعومة
- إرسال
- loading
- success toast
- error toast

ممنوع ترك الزر disabled دائمًا.

#### 5. Reminder History

إذا يوجد API لسجل التذكيرات، اعرضه.
إذا لا يوجد، اعرض EmptyState واضح ووثق في التقرير.

### Acceptance Criteria

- يمكن إرسال تذكير فعلي من الواجهة.
- لا يوجد notistack runtime error.
- تفاصيل السلة واضحة.
- لا توجد رسائل "Coming soon" للميزات الموجودة فعليًا في API.

---

## 8. المرحلة 2.5 — Website Content Experience

### الملفات المتوقعة

ابحث داخل:

```txt
src/features/website/
src/features/articles/
src/features/projects/
src/features/landing/
```

وابحث عن:

```txt
Articles
Projects
ContactRequests
Landing
Website
```

### الهدف

تحويل إدارة محتوى الموقع إلى تجربة تحرير احترافية.

### الصفحات المستهدفة

- Articles
- Projects
- Contact Requests
- Landing Products
- Landing Brands
- Landing Settings
- Banners إن كانت ضمن الموقع

### المتطلبات العامة

#### 1. Content Dashboard

إن وجد قسم website، أضف صفحة overview أو حسّن الموجودة:

- المقالات المنشورة
- المشاريع
- طلبات التواصل الجديدة
- البنرات النشطة
- آخر تحديث للموقع

#### 2. Articles

- جدول أو cards للمقالات
- حالة النشر
- الكاتب
- آخر تحديث
- زر معاينة
- زر تعديل
- زر نشر/إلغاء نشر إن كان مدعومًا

Form المقال يجب أن يحتوي:

- العنوان
- slug
- excerpt
- content
- cover image من MediaPicker
- SEO fields إن وجدت
- publish status
- preview

#### 3. Projects

- لا تجعل المشروع مجرد كارد فقط إذا كانت تفاصيل المشروع تمثل رحلة.
- يجب أن تكون صفحة المشروع أو form المشروع مقسمة إلى:
  - معلومات أساسية
  - صور
  - مراحل/رحلة المشروع إن كانت موجودة في النموذج
  - الحالة
  - الظهور في الموقع
- إن لم يكن backend يدعم مراحل رحلة المشروع، وثّق ذلك في التقرير ولا تخترع بيانات frontend فقط.

#### 4. Contact Requests

- Inbox-like layout
- فلتر الحالة:
  - جديد
  - تمت المراجعة
  - مغلق
- drawer للتفاصيل
- action لتغيير الحالة إن كان API يدعم
- ملاحظات داخلية إن كانت مدعومة

#### 5. Landing Settings

- Sections واضحة
- Preview إن أمكن
- Save bar ثابت
- عدم الاعتماد على حقول مبعثرة

### Acceptance Criteria

- إدارة المحتوى لا تبدو كـ CRUD خام.
- يوجد preview أو على الأقل card preview للمحتوى.
- الصور تستخدم MediaPicker عندما يكون ممكنًا.
- لا توجد أزرار نشر/حذف/تعديل غير مربوطة.
- طلبات التواصل تصبح قابلة للمتابعة لا مجرد جدول.

---

## 9. المرحلة 2.6 — Support / Tejo Redesign

### الملفات المتوقعة

ابحث داخل:

```txt
src/features/support/
src/features/tejo/
```

وابحث عن:

```txt
Support
Tickets
Tejo
Sessions
Conversations
```

### الهدف

تحويل الدعم إلى مركز محادثات وتذاكر واضح.

### المتطلبات

#### 1. Support Overview

- التذاكر المفتوحة
- التذاكر المتأخرة
- المحادثات النشطة
- متوسط وقت الرد إن كان موجودًا
- آخر التذاكر

#### 2. Inbox Layout

بدل جدول فقط:

- عمود قائمة المحادثات/التذاكر
- منطقة تفاصيل
- Drawer أو panel للبيانات الجانبية

إذا كان صعبًا، نفذ table + details drawer بشكل احترافي.

#### 3. Ticket Details

يجب أن يظهر:

- بيانات المستخدم
- الحالة
- الأولوية
- آخر رسالة
- الرسائل أو notes إن وجدت
- المسؤول المعين إن كان مدعومًا
- actions:
  - تغيير الحالة
  - تعيين
  - إضافة ملاحظة
  - إغلاق

#### 4. Tejo Sessions

إذا كانت جلسات Tejo موجودة:

- عرض الجلسات
- حالة الجلسة
- آخر نشاط
- تفاصيل الرسائل أو summary
- لا تعرض أزرار غير مدعومة.

### Acceptance Criteria

- الدعم يصبح قابلًا للاستخدام اليومي.
- حالات التذاكر واضحة.
- لا يوجد action بدون API.
- تجربة التفاصيل لا تفتح صفحات كثيرة بلا حاجة.

---

## 10. المرحلة 2.7 — Analytics Experience Redesign

### الملفات المتوقعة

ابحث داخل:

```txt
src/features/analytics/
src/pages/analytics/
```

وابحث عن:

```txt
Analytics
Reports
Export
ScheduledReports
```

### الهدف

تحويل التحليلات إلى مركز تقارير واضح ومنظم.

### المتطلبات

#### 1. Analytics Overview

- مبيعات
- طلبات
- مستخدمون
- منتجات
- تحويلات / سلات إن وجدت
- فترة زمنية موحدة

#### 2. Global Date Filter

أضف فلتر تاريخ موحد:

- آخر 7 أيام
- آخر 30 يوم
- هذا الشهر
- مخصص

يجب أن يؤثر على الرسوم والجداول التي تدعم ذلك.

#### 3. Report Sections

قسّم الصفحة إلى:

- Sales
- Orders
- Products
- Users
- Cart Recovery
- System/Audit إن كان مناسبًا

#### 4. Export Center

إذا كانت صفحة export-center موجودة لكن API ناقص:

- لا تتركها مكسورة.
- إما تعرض EmptyState يشرح أن التصدير غير مفعّل.
- أو اربطها بـ endpoint صحيح.
- أو أضف endpoint إذا كان مطلوبًا ضمن scope.

#### 5. Scheduled Reports

إذا كانت موجودة في route/sidebar لكن غير مدعومة:

- وثق ذلك.
- اعرض placeholder احترافي فقط إذا كانت الصفحة غير مكسورة.
- لا تضع أزرار إنشاء schedule إذا لا يوجد API.

### Acceptance Criteria

- التحليلات منظمة وليست صفحة طويلة عشوائية.
- كل chart له عنوان ووصف.
- الفلاتر واضحة.
- export actions لا تفشل صامتًا.
- الصفحات غير المدعومة موثقة.

---

## 11. Navigation & Information Architecture Update

بعد إعادة بناء الصفحات الأساسية، حسّن ترتيب السايدبار بدون تغيير جذري يكسر الروابط.

### المطلوب

قسّم القائمة إلى مجموعات:

```txt
الرئيسية
- Dashboard

المبيعات
- Orders
- Carts
- Coupons

الكتالوج
- Products
- Categories
- Inventory
- Linked/Unlinked

العملاء
- Users
- Activity

المحتوى والموقع
- Articles
- Projects
- Banners
- Landing
- Contact Requests

الدعم
- Tickets
- Tejo

التحليلات
- Analytics
- Reports
- Exports

النظام
- Settings
- Audit
- Media
- Notifications
```

### قواعد

- لا تعرض عنصر لا يملك المستخدم صلاحية الوصول إليه.
- لا تجعل القائمة ضخمة بدون groups.
- يجب أن يكون active route واضحًا.
- إذا كان هناك route لا يزال غير مكتمل، لا تخفيه إلا إذا كان يسبب خطأ؛ يمكن عرضه مع disabled/tooltip فقط إذا كان قرارًا واضحًا.

---

## 12. API & Data Handling Rules

### ممنوع

- ممنوع إضافة بيانات وهمية في الصفحات الإنتاجية.
- ممنوع fake success للعمليات.
- ممنوع إخفاء error الحقيقي بالكامل.
- ممنوع تجاهل response shape.
- ممنوع تكرار axios unwrap داخل كل صفحة.

### مطلوب

- استخدام API client والnormalizer من المرحلة 0.
- استخدام React Query بشكل موحد:
  - query keys واضحة
  - invalidation بعد mutations
  - loading states
  - error states
- عند فشل API:
  - اعرض رسالة مفهومة للمستخدم
  - سجل التفاصيل للمطور فقط إذا كان نظام logging موجودًا
  - لا تكسر الصفحة كاملة إلا عند الضرورة

---

## 13. Permissions Rules

كل action يجب أن يمر عبر permissions.

### أمثلة

- زر إنشاء منتج يظهر فقط لمن يملك صلاحية.
- زر حذف يظهر فقط لمن يملك صلاحية.
- زر تغيير حالة الطلب يظهر فقط لمن يملك صلاحية.
- صفحات analytics الحساسة لا تظهر دون permission مناسب.

### ممنوع

- الاعتماد فقط على إخفاء الزر في الواجهة كحماية نهائية.
- وضع fallback عام لكل الصفحات.
- ترك route جديد بدون permission mapping.

---

## 14. UX Standards

### Loading

استخدم:

```tsx
<LoadingState />
```

أو skeleton مناسب.

### Empty

كل صفحة فارغة يجب أن تشرح:

- لماذا لا توجد بيانات؟
- ما الإجراء التالي؟
- هل يوجد زر لإضافة عنصر؟

مثال:

```txt
لا توجد منتجات بعد
ابدأ بإضافة أول منتج للمتجر.
[إضافة منتج]
```

### Error

كل خطأ يجب أن يحتوي:

- رسالة مفهومة
- زر إعادة المحاولة
- تفاصيل تقنية لا تظهر للمستخدم العادي إلا عند الحاجة

### Dangerous Actions

كل عملية مثل:

- حذف
- إلغاء طلب
- استرداد
- إغلاق تذكرة
- تعطيل مستخدم

يجب أن تستخدم ConfirmDialog.

### Toasts

بعد كل عملية:

- نجاح: رسالة قصيرة وواضحة.
- فشل: سبب مفهوم.
- لا تكرر toast كثيرًا في نفس العملية.

---

## 15. Responsiveness Scope في المرحلة 2

هذه المرحلة ليست الريسبونسف الكامل.

لكن يجب تجهيز الآتي:

- لا تستخدم widths ثابتة تكسر الشاشة.
- استخدم grid responsive من MUI أو CSS.
- الجداول الكبيرة يجب أن تكون داخل containers تمنع overflow.
- drawers/dialogs يجب أن تكون قابلة للتحول لاحقًا للموبايل.
- لا تنفذ mobile card replacement كامل الآن إلا إذا كان بسيطًا جدًا.

الريسبونسف الكامل سيكون في مرحلة لاحقة.

---

## 16. Suggested Implementation Order

نفذ بهذا الترتيب:

### Step 1

افحص نتائج المرحلة 0 و 1.

### Step 2

أنشئ أو حسّن layout المشترك للصفحات:

- PageShell
- PageHeader usage
- Summary grid
- DataToolbar pattern

### Step 3

نفذ Dashboard redesign.

### Step 4

نفذ Orders redesign.

### Step 5

نفذ Products redesign.

### Step 6

نفذ Cart / Abandoned Carts redesign.

### Step 7

نفذ Website Content redesign.

### Step 8

نفذ Support / Tejo redesign.

### Step 9

نفذ Analytics redesign.

### Step 10

رتب Sidebar/navigation.

### Step 11

راجع permissions لكل route/action.

### Step 12

شغل QA كامل واكتب التقرير.

---

## 17. QA Checklist

بعد التنفيذ شغل:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

إذا لا يوجد script باسم typecheck، استخدم:

```bash
npx tsc --noEmit
```

وابحث عن:

```bash
console.log
TODO
FIXME
coming soon
disabled={true}
alert(
window.alert
```

لا تحذف TODO عشوائيًا. صنفها في التقرير.

---

## 18. Manual Test Checklist

اختبر يدويًا:

### Dashboard

- الصفحة تفتح.
- الإحصائيات تظهر.
- الروابط تعمل.
- empty/error states تعمل.

### Orders

- البحث يعمل.
- الفلاتر تعمل.
- فتح التفاصيل يعمل.
- تغيير الحالة يعمل أو موثق إذا غير مدعوم.
- الإلغاء/الاسترداد يستخدم ConfirmDialog.

### Products

- البحث يعمل.
- الفلاتر تعمل.
- فتح التفاصيل يعمل.
- إنشاء/تعديل منتج لا ينكسر.
- الصور تعمل أو موثقة.

### Cart

- عرض السلات يعمل.
- فتح التفاصيل يعمل.
- إرسال التذكير يعمل.
- لا توجد أزرار disabled بلا سبب.

### Website Content

- عرض المقالات/المشاريع يعمل.
- التعديل يعمل.
- preview أو card preview يعمل.
- طلبات التواصل يمكن متابعتها.

### Support

- عرض التذاكر/الجلسات يعمل.
- فتح التفاصيل يعمل.
- تغيير الحالة يعمل أو موثق.

### Analytics

- الفلاتر تعمل.
- الرسوم لا تكسر الصفحة.
- export/scheduled reports لا تفشل بصمت.

---

## 19. Deliverables

في نهاية المرحلة يجب تسليم:

### 1. كود معدل

يشمل الصفحات الأساسية والمكونات المشتركة اللازمة.

### 2. تقرير تنفيذ

أنشئ ملف:

```txt
PHASE_2_CORE_PAGES_RESULTS.md
```

ويحتوي:

```md
# Phase 2 Results

## Completed Pages
- Dashboard
- Orders
- Products
- Cart
- Website Content
- Support / Tejo
- Analytics

## Changed Files
- ...

## New Shared Components
- ...

## API Issues Found
- ...

## Permissions Updated
- ...

## Remaining Unsupported Actions
- ...

## Manual QA Results
- Dashboard: Pass/Fail
- Orders: Pass/Fail
- Products: Pass/Fail
- Cart: Pass/Fail
- Website: Pass/Fail
- Support: Pass/Fail
- Analytics: Pass/Fail

## Build Results
- lint:
- typecheck:
- build:

## Notes for Phase 3
- ...
```

### 3. لا تترك أخطاء مخفية

إذا توجد مشكلة لم تستطع حلها، يجب توثيقها بوضوح في التقرير.

---

## 20. Definition of Done

تعتبر المرحلة 2 مكتملة فقط إذا تحقق الآتي:

- Dashboard أعيد بناؤها كمركز قيادة واضح.
- Orders أصبحت قابلة للإدارة اليومية.
- Products أصبحت منظمة وتوضح الحالة والمخزون والربط.
- Cart reminders تعمل أو موثقة بدقة إن كان backend يمنع.
- Website content صار قابلًا للتحرير والمتابعة بشكل أفضل.
- Support/Tejo صار له layout واضح للتعامل مع التذاكر/الجلسات.
- Analytics صارت مقسمة ومنظمة بفلاتر واضحة.
- Sidebar أصبح أكثر تنظيمًا.
- لا توجد أزرار واضحة مكسورة أو disabled بلا سبب.
- كل صفحة تستخدم مكونات Design System.
- كل route/action حساس يملك permission واضح.
- `npm run build` ينجح.
- تقرير `PHASE_2_CORE_PAGES_RESULTS.md` موجود ومكتمل.

---

## 21. ملاحظات مهمة للوكيل

- لا تنجرف لتغيير كل شيء مرة واحدة.
- لا تعيد كتابة المشروع من الصفر.
- لا تكسر APIs تعمل حاليًا.
- لا تضف مكتبات ضخمة إلا إذا كانت موجودة مسبقًا أو ضرورية جدًا.
- لا تستخدم mock data في الإنتاج.
- لا تجعل التصميم جميلًا فقط؛ يجب أن يكون عمليًا وقابلًا للاستخدام اليومي.
- كل قرار غير واضح وثّقه في التقرير بدل التخمين.
