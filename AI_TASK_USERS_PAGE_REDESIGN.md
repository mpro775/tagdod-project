أنت وكيل AI داخل مشروع admin-dashboard لمشروع تجدد.
المطلوب تنفيذ إعادة تصميم احترافية لصفحة إدارة المستخدمين مع التركيز على تعديل المكونات العامة حتى تستفيد منها باقي صفحات الإدارة.

مهم جداً:
- لا تعدل الباك اند.
- لا تكسر منطق البيانات الحالي.
- لا تحذف أي ميزة.
- لا تغيّر أسماء API أو العقود الحالية.
- الهدف UI/UX + Design System + تنظيف الصفحة.
- بعد التنفيذ شغّل build/lint إن أمكن وأصلح الأخطاء.

المشكلة الحالية:
صفحة إدارة المستخدمين /users ثقيلة جداً:
1. PageHeader كبير ويأخذ مساحة كبيرة.
2. كروت الإحصائيات ضخمة جداً.
3. فلاتر البحث داخل Card كبير وغير عصري.
4. أزرار الإضافة والتصدير داخل كارد منفصل بلا داعي.
5. الجدول ثقيل والصفوف كبيرة والإجراءات متداخلة.
6. هناك عناوين مكررة ومساحات عمودية كثيرة.

المطلوب تنفيذه:

1) تعديل PageShell
افحص:
src/shared/design-system/components/PageShell.tsx

أضف أو فعّل spacing compact:
- compact يكون صغير تقريباً 1.25 أو 1.5
- normal لا يكون كبيراً جداً
- صفحات الإدارة تستخدم compact إن أمكن

2) تعديل PageHeader
افحص:
src/shared/design-system/components/PageHeader.tsx

أضف prop:
variant?: 'default' | 'compact'

في compact:
- اجعل الهيدر أصغر بكثير.
- العنوان h5 أو حجم قريب من 24px بدل h4 ضخم.
- breadcrumb يكون صغير جداً أو في نفس السطر أعلى العنوان بدون مساحة كبيرة.
- الوصف يكون body2/caption ولا يأخذ مساحة كبيرة.
- actions تظهر بجانب العنوان في نفس الصف إن أمكن.
- قلل margin/padding/spacing بشكل واضح.
- حافظ على التوافق مع الصفحات الأخرى.

3) تعديل StatCard
افحص:
src/shared/design-system/components/StatCard.tsx

المكون لديه compact لكن يبدو غير مستغل فعلياً.
نفذ compact حقيقي:
- minHeight في compact بين 64 و 76px.
- padding في compact صغير.
- الأيقونة 28px تقريباً.
- الرقم 20-22px.
- العنوان صغير وواضح.
- لا تعرض Progress bar في compact إلا إذا كان prop يسمح بذلك.
- أضف prop مثل showProgress?: boolean إن احتجت.
- حافظ على الشكل الحالي في default حتى لا تكسر صفحات أخرى.

4) تعديل PageSummaryGrid
افحص:
src/shared/design-system/components/PageSummaryGrid.tsx

اجعل الكروت تعرض بشكل أكثر ذكاء:
- xs: عمودين
- sm: 3 أعمدة
- md: 4 أعمدة
- xl أو lg: auto-fit/minmax بحيث تظهر الكروت صغيرة
- أضف dense أو compact spacing إن لم يكن موجوداً.
- الهدف أن إحصائيات المستخدمين لا تأخذ نصف الصفحة.

5) تطوير DataToolbar
افحص:
src/shared/design-system/components/DataToolbar.tsx

اجعله الشريط الرئيسي للفلاتر والبحث:
- Search input بعرض مناسب.
- Selects للفلاتر inline.
- actions في نفس السطر.
- زر مسح الفلاتر صغير.
- تصميم حديث بدون Card ضخمة.
- مناسب RTL.
- Responsive: في الشاشات الصغيرة يلتف بسلاسة.

6) إعادة بناء فلاتر المستخدمين
افحص:
src/features/users/components/UsersFilter.tsx

لا تجعله SectionCard ضخم.
حوّله إلى مكون controls خفيف أو استخدم DataToolbar مباشرة.
المطلوب:
- بحث برقم الهاتف/الاسم.
- فلتر الحالة.
- فلتر الدور.
- مسح الفلاتر.
- بدون عنوان كبير "فلاتر البحث" وبدون كارد ضخم.
- لا تكرر المساحات الكبيرة.

7) تعديل UsersListPage
افحص:
src/features/users/pages/UsersListPage.tsx

رتّب الصفحة هكذا:
- PageShell spacing="compact"
- PageHeader variant="compact" وفيه زر "إضافة مستخدم / أدمن"
- UserStatsCards compact
- DataToolbar للفلاتر والبحث والتصدير والتقرير الشهري
- DataTable فقط

احذف كارد الأزرار المنفصل:
- إضافة مستخدم / أدمن
- تصدير الأسماء
- تقرير شهري

وانقل:
- إضافة مستخدم إلى PageHeader.actions
- التصدير والتقرير إلى DataToolbar.actions

لا تجعل DataTable يعرض عنوان "إدارة المستخدمين" لأن الهيدر يكفي.

8) تعديل UserStatsCards
افحص:
src/features/users/components/UserStatsCards.tsx

استخدم StatCard compact.
قلل عدد النصوص داخل الكارد.
لا تعرض progress bar داخل كل كارد في الوضع compact.
خلي النسبة كنص صغير فقط إذا كانت مفيدة.

9) تعديل DataTable العام
افحص:
src/shared/components/DataTable/DataTable.tsx

اجعل الجدول أخف:
- rowHeight تقريباً 56
- columnHeaderHeight تقريباً 44 أو 48
- density compact
- cell padding أقل
- لا تجعل minHeight للصفوف 72px
- حافظ على RTL والتصميم الداكن الحالي
- لا تكسر pagination أو sorting أو loading أو empty state

10) تعديل أعمدة جدول المستخدمين
افحص:
src/features/users/components/UsersTableColumns.tsx

المطلوب:
- لا تعرض كل الإجراءات مباشرة داخل الجدول.
- أنشئ UserRowActions.tsx إن لم يكن موجوداً.
- استخدم زر ثلاث نقاط MoreVert.
- القائمة تحتوي:
  - تعديل
  - تفعيل / إيقاف
  - حذف
  - استعادة إذا كان محذوفاً
- اجعل عمود الإجراءات صغير ونظيف.
- اجعل الاسم ورقم الهاتف أوضح.
- اجعل Chips أصغر وأهدأ.
- إن كان عمود القدرات يسبب زحمة أخفه أو اجعله مختصراً بدون حذف البيانات من المنطق.

11) راجع CSS الخاص بالمستخدمين
افحص أي ملف مثل:
src/features/users/styles/responsive-users.css
أو أي CSS متعلق بصفحة المستخدمين.

أزل أو خفف القواعد العامة الخطيرة مثل:
.MuiButton-root
.MuiDataGrid-root
إذا كانت تؤثر على كل شيء بشكل غير مضبوط.
استبدلها classes محددة للصفحة فقط.

12) النتيجة المطلوبة بصرياً:
- أعلى الصفحة صغير واحترافي.
- الكروت صغيرة مثل KPI strip وليس Cards ضخمة.
- الفلاتر شريط واحد عصري.
- الأزرار ليست في كارد مستقل.
- الجدول يأخذ المساحة الرئيسية.
- الإجراءات لا تتداخل.
- الصفحة تعمل على RTL.
- لا توجد مساحات فارغة ضخمة.
- الشكل متناسق مع الهوية الحالية الداكنة والأزرق/الأخضر.

بعد التنفيذ:
- شغّل:
npm run build
وإن وجد:
npm run lint

ثم أصلح أي أخطاء TypeScript أو ESLint.
في النهاية أعطني ملخص الملفات التي تم تعديلها وما الذي تغير.
