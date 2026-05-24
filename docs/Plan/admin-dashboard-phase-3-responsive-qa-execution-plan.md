# المرحلة 3 — Responsive, QA, Polish & Production Hardening
## Admin Dashboard — Phase 3 Execution Plan for AI/Codex Agent

> الهدف من هذه المرحلة هو تحويل لوحة التحكم بعد إصلاح المرحلة 0، وتأسيس Design System في المرحلة 1، وإعادة بناء الصفحات الأساسية في المرحلة 2، إلى لوحة احترافية قابلة للاستخدام على مختلف الشاشات، مع اختبار شامل لكل الأزرار والعمليات والحالات.
>
> **ممنوع في هذه المرحلة إضافة ميزات جديدة كبيرة أو تغيير منطق الباك-إند إلا إذا كان هناك عطل يمنع الريسبونسف أو التشغيل.**
>
> التركيز هنا:
> - Responsive كامل.
> - QA وظيفي للعمليات.
> - تحسين الأداء والتجربة.
> - توحيد التفاصيل النهائية.
> - إزالة أي بقايا UI قديمة أو أزرار غير فعالة.
> - تجهيز اللوحة لمرحلة احترافية مستقرة.

---

## 0. قواعد صارمة قبل التنفيذ

### 0.1 لا تبدأ من الصفر

يجب البناء على نتائج المراحل السابقة:

- المرحلة 0: إصلاح التشغيل، الأزرار، المسارات، الـ API، الصلاحيات.
- المرحلة 1: Design System ومكونات مشتركة.
- المرحلة 2: إعادة بناء الصفحات الأساسية.

لا تقم بإعادة كتابة كل شيء إذا كان يمكن تحسينه بأمان.

### 0.2 ممنوع كسر الوظائف

أي تعديل responsive يجب ألا يكسر:

- التحميل من API.
- الفلاتر.
- التصفح pagination.
- البحث.
- التصدير.
- الحذف.
- الإضافة.
- التعديل.
- الحوارات dialogs.
- الأدراج drawers.
- الصلاحيات permissions.
- Toasts.
- loading/error/empty states.

### 0.3 ممنوع ترك أزرار وهمية

أي زر في اللوحة يجب أن يكون واحدًا من التالي:

1. يعمل ويرتبط بوظيفة حقيقية.
2. مخفي إذا كانت الوظيفة غير متوفرة.
3. معطل بسبب صلاحية أو حالة واضحة، مع Tooltip يشرح السبب.

ممنوع:
- `disabled={true}` بدون سبب.
- أزرار `TODO`.
- أزرار لا تفعل شيئًا.
- `alert()` مؤقت.
- `console.log()` كبديل للعملية الحقيقية.

---

## 1. الهدف النهائي للمرحلة 3

في نهاية هذه المرحلة يجب أن تكون لوحة التحكم:

- قابلة للاستخدام بشكل ممتاز على Desktop.
- قابلة للاستخدام بشكل جيد جدًا على Tablet.
- قابلة للاستخدام بشكل مقبول ومرتب على Mobile، حتى لو لم تكن كل العمليات الثقيلة مثالية على الهاتف.
- لا تحتوي على overflow مزعج.
- لا تحتوي على جداول تكسر الشاشة.
- لا تحتوي على dialogs كبيرة تخرج خارج الشاشة.
- لا تحتوي على drawers تختفي خلف عناصر أخرى.
- جميع العمليات الأساسية تعمل.
- كل الصفحات المهمة لها loading/error/empty states موحدة.
- الواجهة موحدة بصريًا مع Design System.
- الأداء مقبول ولا توجد rerenders أو fetches مبالغ فيها.

---

## 2. Breakpoints المعتمدة

اعتمد هذه المقاسات أثناء التنفيذ والاختبار:

```ts
const BREAKPOINTS = {
  mobileSmall: 360,
  mobile: 430,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920,
};
```

يجب اختبار الواجهات يدويًا على:

- 360px
- 430px
- 768px
- 1024px
- 1440px
- 1920px

---

## 3. الملفات والمناطق المتوقعة للتعديل

قد تختلف المسارات حسب بنية المشروع، لكن افحص وعدل ما يقابلها:

```txt
src/app/
src/shared/components/Layout/
src/shared/components/ui/
src/shared/theme/
src/shared/constants/
src/shared/hooks/
src/shared/utils/
src/features/dashboard/
src/features/orders/
src/features/products/
src/features/cart/
src/features/users/
src/features/analytics/
src/features/support/
src/features/services/
src/features/projects/
src/features/articles/
src/features/website/
src/features/system/
```

---

## 4. Responsive Layout الأساسي

### 4.1 Layout العام

افحص:

```txt
src/shared/components/Layout/
```

المطلوب:

- Sidebar ثابت ومريح على desktop.
- Sidebar يتحول إلى Drawer على tablet/mobile.
- Header لا يكسر العرض.
- Page content لا يعمل horizontal overflow.
- Main content يستخدم `min-width: 0`.
- الجداول والبطاقات لا توسع الصفحة خارج الشاشة.
- العنوان والأزرار تتكدس بشكل جيد على الشاشات الصغيرة.

### 4.2 قواعد مهمة للـ CSS/MUI

استخدم هذه القواعد حيث يلزم:

```tsx
sx={{
  minWidth: 0,
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
}}
```

وفي containers التي تحتوي جداول:

```tsx
sx={{
  width: '100%',
  overflowX: 'auto',
}}
```

وفي Grid layouts:

```tsx
gridTemplateColumns: {
  xs: '1fr',
  sm: 'repeat(2, minmax(0, 1fr))',
  lg: 'repeat(4, minmax(0, 1fr))',
}
```

### 4.3 قبول هذه المهمة

يجب ألا يظهر horizontal scroll في الصفحة العامة على:

- Dashboard
- Orders
- Products
- Cart
- Users
- Analytics
- Support
- Settings

إلا داخل حاوية جدول محددة ومقصودة.

---

## 5. Sidebar & Navigation Responsive

### 5.1 Desktop

على desktop:

- Sidebar واضح وقابل للطي.
- لا يغطي المحتوى.
- active item واضح.
- المجموعات navigation groups مرتبة.
- لا يوجد تكرار في العناصر.

### 5.2 Tablet/Mobile

على mobile/tablet:

- Sidebar يتحول إلى Drawer.
- زر فتح القائمة واضح في Header.
- Drawer يغلق بعد اختيار الصفحة.
- لا يختفي خلف dialogs أو overlays.
- z-index مضبوط.
- لا يوجد scroll مكسور داخل القائمة.

### 5.3 تحسينات مطلوبة

- إضافة search داخل القائمة إذا كان موجودًا من المرحلة 1/2 أو تحسينه.
- تقليل كثافة العناصر.
- المحافظة على RTL.
- عدم إظهار صفحات لا يملك المستخدم صلاحيتها.

### 5.4 Acceptance Criteria

- عند 430px يستطيع المستخدم فتح وإغلاق القائمة بسهولة.
- لا يوجد عنصر navigation خارج الشاشة.
- active route يظهر صحيحًا.
- الروابط الحساسة مخفية حسب الصلاحيات.

---

## 6. Header Responsive

### 6.1 المطلوب

في:

```txt
src/shared/components/Layout/Header.tsx
```

أو ما يقابله:

- العنوان لا يطغى على الأزرار.
- User menu يعمل.
- زر الإعدادات يذهب للمسار الصحيح `/system/settings`.
- Notifications لا تكسر الهيدر.
- Search إن وجد يكون responsive.
- في mobile يتم إخفاء العناصر الثانوية أو نقلها لقائمة.

### 6.2 سلوك مقترح

Desktop:

```txt
[Page Title / Breadcrumb]          [Search] [Notifications] [Profile]
```

Mobile:

```txt
[Menu] [Short Title]                         [Notifications] [Profile]
```

### 6.3 Acceptance Criteria

- لا يوجد overlap بين العنوان والأيقونات.
- user menu يفتح ويغلق بشكل صحيح.
- زر logout يعمل.
- زر settings يعمل.
- لا يوجد horizontal overflow.

---

## 7. PageHeader / PageShell Responsive

افحص المكونات التي تم إنشاؤها في المرحلة 1:

```txt
PageShell
PageHeader
SectionCard
DataToolbar
```

### 7.1 المطلوب

على Desktop:

- العنوان والوصف يسار/يمين حسب RTL.
- Actions بجانب العنوان.

على Mobile:

- العنوان في سطر.
- الوصف تحته.
- الأزرار أسفل العنوان بعرض كامل أو في قائمة more actions.

### 7.2 مثال سلوك

```tsx
<Stack
  direction={{ xs: 'column', md: 'row' }}
  alignItems={{ xs: 'stretch', md: 'center' }}
  justifyContent="space-between"
  spacing={2}
>
```

### 7.3 Acceptance Criteria

- كل صفحة لها header واضح.
- الأزرار لا تختفي.
- لا يحدث كسر في النصوص الطويلة.
- دعم RTL صحيح.

---

## 8. DataGrid / Tables Responsive

هذه من أهم نقاط المرحلة.

### 8.1 المشكلة المتوقعة

الجداول الكبيرة غالبًا تكسر شاشات mobile/tablet.

المطلوب ليس فقط `overflowX: auto`، بل تجربة ذكية حسب الصفحة.

### 8.2 القاعدة العامة

Desktop:

- استخدم DataGrid/Table عادي.

Tablet:

- قلل الأعمدة.
- اجعل الأعمدة الأقل أهمية مخفية أو داخل details drawer.

Mobile:

- استخدم cards/list view بدل جدول كامل للصفحات المهمة.

### 8.3 الصفحات التي يجب دعمها

- Orders
- Products
- Users
- Cart
- Abandoned Carts
- Support Tickets
- Projects
- Articles
- Contact Requests
- Audit Logs
- Notifications
- Services/Engineers
- Analytics tables

### 8.4 المطلوب تنفيذه

#### أ. إنشاء أو تحسين مكون ResponsiveDataView

إذا لم يكن موجودًا، أنشئ مكونًا مشتركًا مثل:

```txt
src/shared/components/ui/ResponsiveDataView.tsx
```

فكرته:

- يعرض جدول في `md` وأكبر.
- يعرض cards في `xs/sm`.
- يقبل:
  - rows
  - columns
  - renderCard
  - loading
  - error
  - emptyState
  - actions

#### ب. لا تكرر نفس المنطق في كل صفحة

ممنوع نسخ نفس responsive code عشر مرات.

#### ج. Cards للموبايل

كل card يجب أن يحتوي على:

- العنوان الأساسي.
- الحالة status.
- أهم 3-5 بيانات.
- actions مختصرة.
- زر details.

### 8.5 Acceptance Criteria

- عند 430px لا تظهر جداول عريضة تكسر الصفحة في الصفحات الأساسية.
- لا تختفي actions المهمة.
- لا تضيع الحالة status.
- يمكن فتح التفاصيل أو تنفيذ action من card.

---

## 9. Filters & Toolbars Responsive

### 9.1 Desktop

الفلاتر تظهر في toolbar أفقي:

```txt
[Search] [Status] [Date Range] [Category] [Export] [Create]
```

### 9.2 Mobile

الفلاتر يجب أن تتحول إلى:

- زر "الفلاتر"
- Drawer أو Bottom Sheet
- أزرار apply/reset واضحة

### 9.3 المطلوب

تحسين `DataToolbar` أو إنشاء:

```txt
ResponsiveFiltersDrawer
```

يدعم:

- open/close
- apply
- reset
- active filter count badge
- RTL
- full width fields

### 9.4 Acceptance Criteria

- لا تزدحم الفلاتر على mobile.
- المستخدم يعرف كم فلتر مفعل.
- reset يعمل.
- apply لا يكسر البيانات.
- البحث search يعمل بدون كسر layout.

---

## 10. Dialogs Responsive

### 10.1 المطلوب

كل Dialog في اللوحة يجب أن يكون responsive.

على Desktop:

- maxWidth مناسب.
- محتوى مرتب.

على Mobile:

- fullScreen أو قريب من fullScreen.
- الأزرار sticky أسفل dialog إذا كان طويلًا.
- لا يوجد محتوى خارج الشاشة.
- يمكن الإغلاق بوضوح.

### 10.2 افحص خصوصًا

- Confirm delete dialogs
- Create/Edit dialogs
- Send reminder dialog
- Engineer edit dialog
- Order action dialogs
- Product dialogs
- User dialogs
- Notification dialogs
- Media dialogs

### 10.3 قاعدة تنفيذ

استخدم hook مثل:

```tsx
const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
```

ثم:

```tsx
<Dialog fullScreen={fullScreen} maxWidth="md" fullWidth>
```

### 10.4 Acceptance Criteria

- كل Dialog قابل للاستخدام عند 430px.
- أزرار الإلغاء/الحفظ ظاهرة.
- لا يوجد overflow خارج الشاشة.
- لا تختفي خلف Drawer أو Header.

---

## 11. Drawers Responsive

### 11.1 المطلوب

أي DetailsDrawer أو SideDrawer يجب أن:

- يكون بعرض مناسب على desktop.
- يتحول إلى full width على mobile.
- لا يختفي خلف Sidebar/Header.
- z-index مضبوط.
- داخله scroll مستقل.
- actions واضحة في الأعلى أو الأسفل.

### 11.2 أحجام مقترحة

```tsx
width: {
  xs: '100vw',
  sm: 420,
  md: 520,
  lg: 640,
}
```

### 11.3 Acceptance Criteria

- Details drawer في Orders/Support/Products يعمل على mobile.
- لا يوجد تداخل مع sidebar drawer.
- لا يختفي أي زر داخل drawer.

---

## 12. Forms Responsive

### 12.1 الصفحات المستهدفة

- Product form
- Project form
- Article form
- User form
- Engineer form
- Settings forms
- Website content forms

### 12.2 المطلوب

- تقسيم forms إلى sections.
- استخدام grid responsive.
- الحقول تأخذ عرض كامل على mobile.
- action bar sticky في الأسفل أو أعلى الصفحة.
- validation messages واضحة.
- Media picker responsive.
- Preview لا يكسر layout.

### 12.3 Grid مقترح

```tsx
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    ...
  </Grid>
</Grid>
```

أو حسب إصدار MUI المستخدم في المشروع.

### 12.4 Acceptance Criteria

- لا يوجد حقل خارج الشاشة.
- يمكن حفظ النموذج من mobile.
- رسائل الخطأ لا تكسر التصميم.
- الأقسام واضحة.

---

## 13. Cards & Stats Responsive

### 13.1 المطلوب

في Dashboard وAnalytics وباقي الصفحات:

- stat cards تتحول من 4 أعمدة إلى 2 ثم 1.
- النصوص الطويلة لا تكسر الكارد.
- الأرقام واضحة.
- trends لا تختفي.
- Skeleton loading مطابق للحجم.

### 13.2 Grid مقترح

```tsx
display: 'grid',
gridTemplateColumns: {
  xs: '1fr',
  sm: 'repeat(2, minmax(0, 1fr))',
  lg: 'repeat(4, minmax(0, 1fr))',
},
gap: 2,
```

### 13.3 Acceptance Criteria

- Dashboard عند 430px يظهر كبطاقات مرتبة.
- لا يوجد ضغط بصري شديد.
- cards لا تتداخل.

---

## 14. Charts Responsive

### 14.1 المطلوب

كل الرسوم البيانية يجب أن تكون responsive:

- لا تكسر العرض.
- ارتفاع مناسب على mobile.
- legends لا تزدحم.
- tooltips تعمل.
- empty state إذا لا توجد بيانات.

### 14.2 افحص

- Dashboard charts
- Analytics charts
- Sales charts
- Products charts
- Users charts
- Cart recovery charts

### 14.3 Acceptance Criteria

- الرسم يظهر بوضوح عند 430px.
- لا يوجد horizontal overflow من chart.
- tooltip لا يخرج بشكل مزعج.
- عند عدم وجود بيانات تظهر empty state.

---

## 15. Loading / Error / Empty States

### 15.1 المطلوب

توحيد الحالات في كل الصفحات:

- Loading
- Error
- Empty
- No search results
- Permission denied
- Offline/network error إن أمكن

### 15.2 استخدم مكونات المرحلة 1

- `LoadingState`
- `ErrorState`
- `EmptyState`
- `PermissionState`
- `PageState`

### 15.3 قواعد النصوص

يجب أن تكون النصوص عربية واضحة، مثال:

```txt
لا توجد بيانات حتى الآن
لم نتمكن من تحميل البيانات
لا توجد نتائج مطابقة للفلاتر الحالية
ليس لديك صلاحية للوصول لهذه الصفحة
```

### 15.4 Acceptance Criteria

- لا توجد صفحة تعرض شاشة بيضاء عند فشل API.
- لا توجد صفحة تعرض جدول فارغ بدون شرح.
- retry يعمل حيث يلزم.
- reset filters يظهر في no results.

---

## 16. Permissions UI Polish

### 16.1 المطلوب

بعد إصلاحات المرحلة 0، راجع UI الخاص بالصلاحيات:

- إخفاء الروابط غير المسموحة.
- إخفاء actions غير المسموحة.
- أو تعطيلها مع Tooltip إذا كان من الأفضل إعلام المستخدم.
- لا تعتمد فقط على حماية route، بل actions أيضًا.

### 16.2 أمثلة

- مستخدم لا يملك حذف منتج: لا يرى زر الحذف.
- مستخدم لا يملك تصدير: لا يرى export.
- مستخدم يملك مشاهدة فقط: يرى details بدون edit/delete.

### 16.3 Acceptance Criteria

- لا يظهر زر يؤدي إلى 403 متوقع.
- الصفحات المحمية تعرض PermissionState واضح.
- route permissions و action permissions متناسقة.

---

## 17. Final Functional QA

يجب تنفيذ فحص يدوي أو شبه يدوي لكل صفحة أساسية.

### 17.1 Dashboard

تحقق من:

- تحميل الإحصائيات.
- charts.
- quick actions.
- الروابط المختصرة.
- حالات empty/error.
- responsive.

### 17.2 Orders

تحقق من:

- عرض الطلبات.
- البحث.
- الفلاتر.
- pagination.
- details drawer.
- تغيير الحالة.
- cancel/refund إن وجدت.
- export إن وجد.
- permissions.
- responsive cards.

### 17.3 Products

تحقق من:

- عرض المنتجات.
- إضافة.
- تعديل.
- حذف.
- الصور.
- المخزون.
- الربط/unlinked/linked إن موجود.
- الفلاتر.
- responsive.

### 17.4 Cart / Abandoned Carts

تحقق من:

- عرض السلال.
- التفاصيل.
- إرسال reminder.
- حالات النجاح والفشل.
- الفلاتر.
- responsive.

### 17.5 Users

تحقق من:

- عرض المستخدمين.
- إضافة/تعديل.
- الحظر/التفعيل إن موجود.
- activity page إن موجودة.
- permissions.
- responsive.

### 17.6 Support / Tejo

تحقق من:

- قائمة المحادثات/التذاكر.
- فتح التفاصيل.
- الرد/تغيير الحالة إن موجود.
- assignment إن موجود.
- notes إن وجدت.
- responsive.

### 17.7 Website Content

تحقق من:

- Projects.
- Articles.
- Contact Requests.
- Landing sections.
- create/edit/delete/publish.
- media picker.
- responsive.

### 17.8 Analytics

تحقق من:

- الفلاتر.
- charts.
- exports.
- scheduled reports إن موجودة.
- responsive.

### 17.9 Settings

تحقق من:

- تحميل الإعدادات.
- تعديل وحفظ.
- validation.
- permissions.
- responsive.

---

## 18. Accessibility & UX Polish

### 18.1 المطلوب

- كل icon button له aria-label.
- كل field له label واضح.
- contrast مقبول.
- focus states واضحة.
- keyboard navigation لا ينكسر في dialogs.
- Escape يغلق dialogs/drawers حيث مناسب.
- الأزرار الخطرة لها confirmation.
- رسائل toast واضحة.

### 18.2 RTL

تحقق من:

- اتجاه النصوص.
- اتجاه breadcrumbs.
- icons التي تحتاج عكس.
- drawers من الجهة المناسبة.
- alignment.

### 18.3 Acceptance Criteria

- لا يوجد icon button غامض.
- لا يوجد نص إنجليزي عشوائي في واجهة عربية إلا مصطلحات تقنية مقصودة.
- التجربة RTL متماسكة.

---

## 19. Performance Polish

### 19.1 المطلوب

راجع الأداء بعد إعادة التصميم:

- لا يوجد refetch غير ضروري.
- React Query keys مستقرة.
- pagination لا يحمل كل البيانات إذا API يدعم pagination.
- dialogs الثقيلة lazy loaded إن أمكن.
- charts الثقيلة لا ترندر إذا خارج الصفحة أو لا توجد بيانات.
- الصور optimized.
- لا توجد rerenders واضحة بسبب objects/functions inline بشكل مبالغ.

### 19.2 افحص

- Dashboard
- Products
- Orders
- Analytics
- Media
- Support

### 19.3 Acceptance Criteria

- فتح الصفحات الأساسية سريع.
- لا يوجد freezing عند فتح جدول كبير.
- لا يوجد تحميل متكرر لنفس endpoint بدون سبب.
- build لا يعطي تحذيرات خطيرة.

---

## 20. Cleanup

### 20.1 احذف أو أصلح

- TODOs المتعلقة بأزرار ظاهرة.
- console.log.
- alert.
- dead code.
- imports غير مستخدمة.
- components مكررة.
- styles قديمة تكسر النظام.
- hard-coded colors خارج theme.
- نصوص غير مترجمة أو غير موحدة.

### 20.2 لا تحذف بدون فهم

قبل حذف أي صفحة أو component:

- تحقق أنه غير مستخدم.
- تحقق من routes.
- تحقق من imports.
- إذا هناك شك، اتركه واذكره في التقرير.

---

## 21. أوامر الفحص النهائية

نفذ الأوامر المناسبة حسب package manager الموجود في المشروع.

### 21.1 تثبيت الحزم

```bash
npm install
```

### 21.2 فحص TypeScript

```bash
npm run type-check
```

إذا لا يوجد script:

```bash
npx tsc --noEmit
```

### 21.3 Lint

```bash
npm run lint
```

### 21.4 Build

```bash
npm run build
```

### 21.5 تشغيل محلي

```bash
npm run dev
```

ثم اختبر يدويًا على المقاسات المذكورة.

---

## 22. اختبار المتصفح المطلوب

اختبر على الأقل:

- Chrome
- Edge

واختبر المقاسات:

```txt
360x800
430x932
768x1024
1024x768
1440x900
1920x1080
```

---

## 23. قائمة الصفحات المطلوب فحصها قبل تسليم المرحلة

ضع علامة أمام كل صفحة بعد الفحص:

```txt
[ ] Login
[ ] Dashboard
[ ] Orders
[ ] Order Details
[ ] Products
[ ] Product Create/Edit
[ ] Product Linked/Unlinked إن وجدت
[ ] Users
[ ] User Activity
[ ] Cart Management
[ ] Abandoned Carts
[ ] Send Cart Reminder
[ ] Analytics Overview
[ ] Analytics Export Center
[ ] Scheduled Reports
[ ] Support Tickets
[ ] Tejo Sessions
[ ] Services
[ ] Engineers
[ ] Engineer Edit
[ ] Projects
[ ] Project Create/Edit
[ ] Articles
[ ] Article Create/Edit
[ ] Contact Requests
[ ] Website/Landing Settings
[ ] Notifications
[ ] Audit Logs
[ ] Media Library
[ ] Exchange Rates
[ ] System Settings
[ ] Profile/User Menu
[ ] Permission Denied page
[ ] Not Found page
```

---

## 24. تقرير التسليم الإلزامي

بعد الانتهاء، أنشئ ملف:

```txt
PHASE_3_RESPONSIVE_QA_RESULTS.md
```

يجب أن يحتوي على:

```md
# Phase 3 Results — Responsive, QA, Polish

## 1. Summary
- ماذا تم إنجازه؟
- ما الصفحات التي تم تحسينها؟
- ما المشاكل التي تم حلها؟

## 2. Responsive Work
- Layout
- Sidebar
- Header
- Tables/DataGrid
- Cards
- Dialogs
- Drawers
- Forms
- Charts

## 3. Functional QA
جدول:
| Page | Desktop | Tablet | Mobile | Actions Tested | Notes |
|---|---|---|---|---|---|

## 4. Fixed Issues
- قائمة المشاكل التي تم إصلاحها.

## 5. Remaining Issues
- أي مشكلة متبقية مع السبب.
- هل تحتاج backend؟
- هل تحتاج قرار product؟

## 6. Changed Files
- قائمة الملفات المهمة التي تم تعديلها.

## 7. Commands Run
- npm install
- npm run type-check
- npm run lint
- npm run build

## 8. Screens Tested
- 360px
- 430px
- 768px
- 1024px
- 1440px
- 1920px

## 9. Final Recommendation
- هل اللوحة جاهزة للمرحلة التالية؟
- ما أهم 5 تحسينات لاحقة؟
```

---

## 25. Definition of Done

لا تعتبر المرحلة 3 مكتملة إلا إذا تحقق التالي:

```txt
[ ] لا يوجد horizontal overflow عام في الصفحات الأساسية.
[ ] Sidebar يعمل كـ drawer على mobile/tablet.
[ ] Header responsive ولا يكسر الشاشة.
[ ] PageHeader actions تظهر بشكل صحيح.
[ ] الجداول المهمة لها تجربة mobile مقبولة.
[ ] الفلاتر لا تزدحم على mobile.
[ ] dialogs تعمل على mobile.
[ ] drawers تعمل على mobile.
[ ] forms قابلة للاستخدام على mobile.
[ ] charts responsive.
[ ] كل صفحة مهمة لها loading/error/empty states.
[ ] كل زر ظاهر إما يعمل أو مخفي/معطل بسبب واضح.
[ ] لا توجد TODOs لأزرار مرئية.
[ ] لا توجد console.log أو alert مؤقتة في production UI.
[ ] الصلاحيات مطبقة على routes وactions.
[ ] TypeScript ينجح.
[ ] Lint ينجح أو يتم توثيق أي تحذير غير قابل للإصلاح الآن.
[ ] Build ينجح.
[ ] تم إنشاء PHASE_3_RESPONSIVE_QA_RESULTS.md.
```

---

## 26. ترتيب التنفيذ المقترح

نفذ بهذا الترتيب:

```txt
1. افحص Layout/Header/Sidebar.
2. أصلح responsive العام ومنع overflow.
3. أصلح PageShell/PageHeader.
4. أنشئ/حسن ResponsiveDataView.
5. طبّق تجربة الجداول/cards على الصفحات الأساسية.
6. حسّن filters للـ mobile.
7. حسّن dialogs.
8. حسّن drawers.
9. حسّن forms.
10. حسّن charts.
11. وحّد loading/error/empty states.
12. راجع permissions UI.
13. نفذ functional QA.
14. نفذ performance cleanup.
15. نفذ build/lint/type-check.
16. أنشئ تقرير PHASE_3_RESPONSIVE_QA_RESULTS.md.
```

---

## 27. ملاحظات مهمة للوكيل

- لا تخلط هذه المرحلة مع إعادة بناء features جديدة.
- لا تغير API contracts إلا للضرورة القصوى.
- لا تعتمد على التصميم فقط؛ اختبر العمليات.
- لا تترك أزرارًا لا تعمل.
- لا تجعل الجداول هي الحل الوحيد على الهاتف.
- لا تكرر components؛ ابنِ abstractions مشتركة.
- احترم RTL واللغة العربية.
- حافظ على اتساق الهوية البصرية التي تم تأسيسها في المرحلة 1.
- التزم بمكونات المرحلة 1 قدر الإمكان.
- أي مشكلة لا تستطيع حلها الآن، وثقها بوضوح في تقرير المرحلة 3.

---

## 28. الخرج النهائي المطلوب من الوكيل

عند الانتهاء، يجب أن يسلّم الوكيل:

1. كود معدل.
2. Build ناجح.
3. تقرير:
   ```txt
   PHASE_3_RESPONSIVE_QA_RESULTS.md
   ```
4. قائمة مختصرة بالمشاكل المتبقية إن وجدت.
5. تأكيد أن كل صفحة أساسية تم اختبارها على desktop/tablet/mobile.

