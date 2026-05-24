# خطة تنفيذ المرحلة 1 — تأسيس Design System احترافي للوحة التحكم Admin Dashboard

> هذا الملف مخصص لوكيل AI/Codex لتنفيذ المرحلة 1 بعد إكمال المرحلة 0.
> الهدف من هذه المرحلة هو بناء أساس تصميمي وواجهاتي موحد داخل لوحة التحكم، وليس إعادة تصميم كل الصفحات بالكامل بعد.

---

## 0. سياق مهم قبل التنفيذ

المشروع المستهدف:

- `admin-dashboard`
- React + Vite + TypeScript
- MUI
- React Router
- React Query
- Zustand
- RTL + Arabic UI

هذه المرحلة تأتي بعد المرحلة 0 التي يفترض أنها أصلحت:

- المسارات الخاطئة.
- الأزرار المعطلة المهمة.
- بعض مشاكل الـ API.
- مشاكل الـ permissions.
- مشاكل toast/snackbar.
- العمليات التي تسبب runtime errors.

لا تبدأ المرحلة 1 قبل التأكد أن المرحلة 0 انتهت أو أن مشاكلها الحرجة تم حلها.

---

## 1. الهدف العام للمرحلة 1

بناء Design System داخلي موحد يجعل كل الصفحات القادمة تعتمد على نفس الأساس بدل تكرار التصميم داخل كل صفحة.

الهدف ليس فقط تحسين الألوان، بل تأسيس منظومة كاملة تشمل:

1. Theme موحد.
2. Design tokens واضحة.
3. مكونات مشتركة قابلة لإعادة الاستخدام.
4. حالات موحدة للتحميل، الخطأ، الفراغ، والتأكيد.
5. Layout موحد للصفحات.
6. أسلوب موحد للأزرار، البطاقات، الجداول، الفلاتر، العناوين، والحالة.
7. دعم RTL بشكل نظيف.
8. تجهيز أساس الريسبونسف بدون تنفيذ إعادة تصميم responsive كامل الآن.

---

## 2. قواعد صارمة للوكيل المنفذ

### ممنوع في هذه المرحلة

- ممنوع إعادة تصميم كل الصفحات دفعة واحدة.
- ممنوع تغيير business logic إلا إذا كان ضروريًا لإزالة تكرار UI فقط.
- ممنوع حذف صفحات أو خصائص موجودة.
- ممنوع تغيير عقود API.
- ممنوع إدخال مكتبة UI كبيرة جديدة بدون ضرورة.
- ممنوع تغيير نظام الصلاحيات أو routing logic بشكل جذري في هذه المرحلة.
- ممنوع استخدام ألوان عشوائية داخل الصفحات بعد إنشاء theme tokens.
- ممنوع كتابة styles inline متكررة إذا كان يمكن وضعها داخل component أو theme.

### مطلوب في هذه المرحلة

- إنشاء أساس موحد للتصميم.
- نقل التكرار الشائع إلى shared components.
- توحيد حالات loading/error/empty.
- توحيد Page Header لكل صفحة.
- توحيد طريقة عرض الإحصائيات والبطاقات والجداول.
- تحديث عدد محدود من الصفحات كنموذج تطبيقي فقط، وليس كل النظام.
- كتابة تقرير نهائي بما تم إنجازه وما بقي للمرحلة 2.

---

## 3. الملفات والمجلدات المتوقع العمل عليها

افحص أولًا البنية الحالية داخل:

```txt
admin-dashboard/src
```

ثم ركز على هذه المناطق غالبًا:

```txt
src/shared
src/shared/components
src/shared/components/Layout
src/shared/theme
src/shared/constants
src/shared/utils
src/features/dashboard
src/features/orders
src/features/products
src/features/users
```

إذا لم تكن بعض المجلدات موجودة، أنشئها بشكل منظم.

البنية المقترحة:

```txt
src/shared/design-system/
  components/
    PageShell.tsx
    PageHeader.tsx
    SectionCard.tsx
    StatCard.tsx
    DataToolbar.tsx
    StatusChip.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingState.tsx
    ConfirmDialog.tsx
    DetailsDrawer.tsx
    FormActionBar.tsx
    PermissionGuard.tsx
    MediaPicker.tsx
  hooks/
    usePageTitle.ts
  tokens/
    colors.ts
    spacing.ts
    radius.ts
    shadows.ts
    typography.ts
  index.ts
```

إذا كان المشروع يستخدم بنية مختلفة داخل `shared/components`، حافظ على أسلوب المشروع ولا تنشئ بنية غريبة، لكن النتيجة يجب أن تكون واضحة وقابلة للتوسع.

---

## 4. المهمة 1 — تأسيس Design Tokens

### المطلوب

أنشئ tokens واضحة بدل القيم العشوائية في الصفحات.

ملفات مقترحة:

```txt
src/shared/design-system/tokens/colors.ts
src/shared/design-system/tokens/spacing.ts
src/shared/design-system/tokens/radius.ts
src/shared/design-system/tokens/shadows.ts
src/shared/design-system/tokens/typography.ts
```

### محتوى tokens المطلوب

#### Colors

يجب أن تحتوي على الأقل:

- `brand.primary`
- `brand.primaryDark`
- `brand.primaryLight`
- `brand.accent`
- `surface.default`
- `surface.paper`
- `surface.raised`
- `surface.soft`
- `text.primary`
- `text.secondary`
- `text.disabled`
- `border.default`
- `border.soft`
- `status.success`
- `status.warning`
- `status.error`
- `status.info`
- `status.neutral`

> لا تستخدم ألوان صارخة أو كثيرة. اجعل النظام هادئًا، إداريًا، احترافيًا، ومناسبًا للوحة تحكم عربية.

#### Spacing

اعتمد scale واضح:

```ts
xs, sm, md, lg, xl, xxl
```

#### Radius

اعتمد:

```ts
sm, md, lg, xl, xxl, pill
```

#### Shadows

اعتمد:

```ts
card, dropdown, drawer, modal
```

#### Typography

حدد:

- أحجام العناوين.
- أحجام النصوص.
- وزن الخط للعناوين.
- line-height مناسب للعربية.

### معايير القبول

- لا توجد tokens غير مستخدمة بشكل عبثي.
- الأسماء واضحة ومفهومة.
- يمكن استخدام tokens داخل theme ومكونات shared.
- لا يتم فرض لون hard-coded في المكونات الجديدة إلا عند الضرورة القصوى.

---

## 5. المهمة 2 — تحديث MUI Theme

### المطلوب

افحص theme الحالي، ثم حسّنه بحيث يعتمد على tokens.

ابحث عن ملفات مثل:

```txt
src/shared/theme
src/theme
src/app/theme
```

### يجب ضبط التالي

1. Direction RTL.
2. Palette من tokens.
3. Typography مناسب للعربية.
4. Shape border radius.
5. Component overrides لـ:
   - `MuiButton`
   - `MuiCard`
   - `MuiPaper`
   - `MuiTextField`
   - `MuiSelect`
   - `MuiChip`
   - `MuiDialog`
   - `MuiDrawer`
   - `MuiTabs`
   - `MuiTableCell`
   - `MuiDataGrid` إذا كان مستخدمًا من MUI X.

### قواعد مهمة

- الأزرار الأساسية يجب أن تكون واضحة وليست مبالغ فيها.
- الجداول يجب أن تكون مريحة بصريًا.
- الـ dialogs والدراور يجب أن يكون لها padding ومسافات موحدة.
- لا تجعل كل شيء بزوايا دائرية ضخمة؛ استخدم radius بشكل متوازن.

### معايير القبول

- التطبيق يبني بدون أخطاء TypeScript.
- theme لا يكسر الصفحات القديمة.
- المكونات الجديدة تستخدم theme بدل sx عشوائي قدر الإمكان.
- RTL يعمل بدون انقلاب سيئ للأيقونات أو المسافات.

---

## 6. المهمة 3 — إنشاء PageShell

### الهدف

كل صفحة في لوحة التحكم يجب أن يكون لها وعاء موحد.

### الملف المقترح

```txt
src/shared/design-system/components/PageShell.tsx
```

### الخصائص المطلوبة

```ts
interface PageShellProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  spacing?: 'compact' | 'normal' | 'relaxed';
  fullHeight?: boolean;
}
```

### السلوك المطلوب

- يضيف padding موحد للصفحات.
- يمنع التصاق المحتوى بالحواف.
- يحافظ على عرض مناسب للصفحات الكبيرة.
- يدعم الحالات التي تحتاج full width مثل الجداول الكبيرة.

### معايير القبول

- استخدامه في 3 صفحات نموذجية على الأقل.
- لا يكسر Layout الرئيسي.
- يعمل مع RTL.

---

## 7. المهمة 4 — إنشاء PageHeader

### الهدف

توحيد عنوان الصفحة، الوصف، breadcrumbs، والأكشنات.

### الملف المقترح

```txt
src/shared/design-system/components/PageHeader.tsx
```

### الخصائص المطلوبة

```ts
interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  actions?: PageHeaderAction[];
  meta?: React.ReactNode;
}
```

### المطلوب بصريًا

- عنوان واضح.
- وصف قصير.
- actions في الطرف المقابل بشكل متناسق مع RTL.
- breadcrumbs اختيارية.
- دعم action loading.

### معايير القبول

- يتم استخدامه في Dashboard وصفحتين أخريين كنموذج.
- لا يتم تكرار header يدوي في الصفحات النموذجية.
- يجب أن يكون مناسبًا للموبايل لاحقًا، حتى لو لم ننفذ responsive كامل الآن.

---

## 8. المهمة 5 — إنشاء SectionCard

### الهدف

توحيد البطاقات الحاوية للأقسام.

### الملف المقترح

```txt
src/shared/design-system/components/SectionCard.tsx
```

### الخصائص المطلوبة

```ts
interface SectionCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}
```

### معايير القبول

- تصلح للجداول، النماذج، الرسوم، والقوائم.
- لا تستخدم Card styles مختلفة في كل صفحة جديدة.
- تستخدم theme shadows/radius/tokens.

---

## 9. المهمة 6 — إنشاء StatCard

### الهدف

توحيد كروت الإحصائيات في Dashboard والصفحات التحليلية.

### الملف المقترح

```txt
src/shared/design-system/components/StatCard.tsx
```

### الخصائص المطلوبة

```ts
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  loading?: boolean;
}
```

### المطلوب بصريًا

- قيمة واضحة.
- عنوان مختصر.
- أيقونة بسيطة.
- trend indicator واضح.
- Skeleton عند loading.

### معايير القبول

- يستخدم في Dashboard كنموذج.
- لا يعتمد على ألوان hard-coded.
- يعرض الأرقام العربية أو الإنجليزية حسب أسلوب المشروع الحالي، ولا يغير formatting العام بدون قرار واضح.

---

## 10. المهمة 7 — إنشاء StatusChip

### الهدف

توحيد حالات الطلبات، المنتجات، المستخدمين، الدفع، الدعم، وغيرها.

### الملف المقترح

```txt
src/shared/design-system/components/StatusChip.tsx
```

### الخصائص المطلوبة

```ts
interface StatusChipProps {
  label: string;
  status?:
    | 'active'
    | 'inactive'
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'cancelled'
    | 'draft'
    | 'published'
    | 'archived'
    | 'paid'
    | 'unpaid'
    | 'partial'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral';
  size?: 'small' | 'medium';
  variant?: 'soft' | 'outlined' | 'solid';
}
```

### معايير القبول

- يتم استخدامه في 2 صفحات نموذجية على الأقل.
- الحالات غير المعروفة ترجع إلى neutral بدل كسر الواجهة.
- ألوان الحالات موحدة من tokens.

---

## 11. المهمة 8 — إنشاء حالات Loading / Error / Empty

### الملفات المقترحة

```txt
src/shared/design-system/components/LoadingState.tsx
src/shared/design-system/components/ErrorState.tsx
src/shared/design-system/components/EmptyState.tsx
```

### EmptyState Props

```ts
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}
```

### ErrorState Props

```ts
interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}
```

### LoadingState Props

```ts
interface LoadingStateProps {
  variant?: 'page' | 'section' | 'table' | 'cards';
  rows?: number;
}
```

### معايير القبول

- لا تظهر صفحات فارغة بدون تفسير.
- لا يتم استخدام نصوص عشوائية مثل `Loading...` في الصفحات النموذجية.
- Error state يحتوي زر إعادة محاولة عند توفر refetch.

---

## 12. المهمة 9 — إنشاء DataToolbar

### الهدف

توحيد شريط البحث والفلاتر والإجراءات أعلى الجداول.

### الملف المقترح

```txt
src/shared/design-system/components/DataToolbar.tsx
```

### الخصائص المطلوبة

```ts
interface DataToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  bulkActions?: React.ReactNode;
  resultCount?: number;
}
```

### السلوك المطلوب

- حقل بحث واضح.
- مكان للفلاتر.
- مكان للأكشنات.
- دعم bulk actions.
- تصميم مريح داخل SectionCard أو فوق الجدول.

### معايير القبول

- يتم استخدامه في صفحة واحدة تحتوي جدول كنموذج.
- لا يكسر صفحات DataGrid الحالية.
- مجهز للتحول إلى responsive لاحقًا.

---

## 13. المهمة 10 — إنشاء ConfirmDialog

### الهدف

إلغاء confirm/alert العشوائي وتوحيد تأكيد العمليات الخطرة.

### الملف المقترح

```txt
src/shared/design-system/components/ConfirmDialog.tsx
```

### الخصائص المطلوبة

```ts
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}
```

### معايير القبول

- يستخدم في عملية حذف أو تعطيل واحدة على الأقل كنموذج.
- لا يستخدم `window.confirm` في الصفحة التي تم تحديثها.
- يدعم loading أثناء تنفيذ العملية.

---

## 14. المهمة 11 — إنشاء DetailsDrawer

### الهدف

توحيد عرض التفاصيل الجانبية بدل التنقل الزائد أو dialogs غير المنظمة.

### الملف المقترح

```txt
src/shared/design-system/components/DetailsDrawer.tsx
```

### الخصائص المطلوبة

```ts
interface DetailsDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
  onClose: () => void;
}
```

### معايير القبول

- يستخدم في صفحة نموذجية واحدة على الأقل.
- drawer يظهر فوق المحتوى بشكل صحيح.
- لا يتعارض مع sidebar أو header.
- يدعم RTL.

---

## 15. المهمة 12 — إنشاء FormActionBar

### الهدف

توحيد أزرار الحفظ والإلغاء في صفحات النماذج.

### الملف المقترح

```txt
src/shared/design-system/components/FormActionBar.tsx
```

### الخصائص المطلوبة

```ts
interface FormActionBarProps {
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  align?: 'start' | 'end' | 'between';
  sticky?: boolean;
}
```

### معايير القبول

- يستخدم في صفحة form واحدة كنموذج.
- يدعم sticky action bar دون تغطية الحقول.
- لا يكرر أزرار الحفظ يدويًا داخل كل form.

---

## 16. المهمة 13 — إنشاء PermissionGuard

### الهدف

توحيد إخفاء أو تعطيل الأزرار حسب الصلاحيات.

### الملف المقترح

```txt
src/shared/design-system/components/PermissionGuard.tsx
```

أو إذا كان هناك نظام صلاحيات قائم، ابنِ فوقه ولا تكرره.

### الخصائص المطلوبة

```ts
interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  mode?: 'all' | 'any';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
```

### المطلوب

- يستخدم hook الصلاحيات الحالي إن وجد.
- لا يخترع permissions جديدة.
- لا يغير route protection.
- فقط يساعد في حماية أزرار وعمليات الواجهة.

### معايير القبول

- يستخدم في زر action واحد على الأقل.
- إذا لا يملك المستخدم الصلاحية، لا يظهر الزر أو يظهر fallback حسب الاستخدام.

---

## 17. المهمة 14 — إنشاء MediaPicker مبدئي

### الهدف

تجهيز أساس لاختيار الصور من Media Library بدل إدخال روابط يدوية في الصفحات المستقبلية.

### الملف المقترح

```txt
src/shared/design-system/components/MediaPicker.tsx
```

### ملاحظة مهمة

لا تبنِ Media Library كاملة من الصفر في هذه المرحلة إذا كانت كبيرة. المطلوب component مبدئي قابل للربط.

### الخصائص المطلوبة

```ts
interface MediaPickerProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  accept?: 'image' | 'video' | 'document' | 'any';
}
```

### السلوك المطلوب

- يعرض preview للصورة إذا value موجود.
- يسمح بإزالة الصورة.
- إذا كان هناك API أو صفحة media حالية، اربط بها أو افتح dialog بسيط.
- إذا الربط الكامل يحتاج وقتًا، اجعله component جاهزًا مع TODO واضح، لكن بدون كسر الصفحات.

### معايير القبول

- يستخدم في صفحة form واحدة كنموذج إذا أمكن.
- لا يجبر المستخدم على إدخال URL عاري في الصفحات التي تم تحديثها كنموذج.
- لا يكسر رفع الصور الحالي إن وجد.

---

## 18. المهمة 15 — إنشاء index exports

### المطلوب

أنشئ ملف:

```txt
src/shared/design-system/index.ts
```

يصدر كل المكونات والتوكنز المهمة.

مثال:

```ts
export * from './components/PageShell';
export * from './components/PageHeader';
export * from './components/SectionCard';
export * from './components/StatCard';
export * from './components/DataToolbar';
export * from './components/StatusChip';
export * from './components/EmptyState';
export * from './components/ErrorState';
export * from './components/LoadingState';
export * from './components/ConfirmDialog';
export * from './components/DetailsDrawer';
export * from './components/FormActionBar';
export * from './components/PermissionGuard';
export * from './components/MediaPicker';
```

### معايير القبول

- يمكن لأي صفحة الاستيراد من `shared/design-system`.
- لا توجد circular imports.

---

## 19. المهمة 16 — تطبيق المكونات على صفحات نموذجية فقط

لا تعيد تصميم كل النظام في المرحلة 1.

طبّق المكونات الجديدة على 3 إلى 5 صفحات كنموذج واضح.

### الصفحات المقترحة

اختر من الموجود فعليًا في المشروع:

1. Dashboard page.
2. Products list page.
3. Orders list page.
4. Users list page.
5. صفحة Form مثل ArticleForm أو ProjectForm.

### المطلوب في كل صفحة نموذجية

- استخدام `PageShell`.
- استخدام `PageHeader`.
- استخدام `SectionCard` عند الحاجة.
- استخدام `LoadingState/ErrorState/EmptyState` بدل الحالات العشوائية.
- استخدام `StatusChip` للحالات.
- استخدام `DataToolbar` في صفحة جدول واحدة على الأقل.
- استخدام `ConfirmDialog` في عملية حذف أو تعطيل واحدة على الأقل.
- استخدام `FormActionBar` في صفحة form واحدة.

### معايير القبول

- الصفحات النموذجية تبدو متناسقة.
- لا توجد تغييرات خطيرة في منطق البيانات.
- لا توجد regressions واضحة.
- بقية الصفحات القديمة تعمل كما كانت.

---

## 20. المهمة 17 — تحسين Layout العام بدون إعادة بناء كاملة

افحص:

```txt
src/shared/components/Layout/Header.tsx
src/shared/components/Layout/Sidebar.tsx
src/shared/components/Layout/*
```

### المطلوب الآن

- تحسين المسافات العامة.
- تحسين شكل الـ Header والـ Sidebar دون تغيير جذري في navigation.
- جعل الـ Header قادرًا على استقبال title/page context لاحقًا.
- إزالة أي hard-coded page title إذا كان موجودًا.
- تحسين active state في sidebar.
- توحيد عرض avatar/user menu.

### ممنوع الآن

- ممنوع إعادة تقسيم sidebar بالكامل في المرحلة 1.
- ممنوع حذف عناصر navigation.
- ممنوع تغيير route structure.

### معايير القبول

- التنقل لا يتغير وظيفيًا.
- الشكل يصبح أكثر احترافية وتماسكًا.
- لا تنكسر أي صفحة.

---

## 21. المهمة 18 — توحيد الأزرار والإجراءات

### المطلوب

افحص استخدامات الأزرار في الصفحات النموذجية فقط، ثم طبق التالي:

- الزر الأساسي: للإجراء الرئيسي فقط.
- الزر الثانوي: للفلاتر أو الإجراءات الأقل أهمية.
- الزر الخطر: للحذف أو الإلغاء الخطير.
- الأيقونات داخل الأزرار يجب أن تكون متناسقة.
- لا تضع 5 أزرار primary في نفس المكان.

### معايير القبول

- كل صفحة نموذجية فيها action hierarchy واضح.
- لا توجد أزرار مبهمة بدون label واضح.
- الأزرار التي تحتاج loading تعرض loading.

---

## 22. المهمة 19 — توحيد النصوص العربية للـ UI States

### المطلوب

استخدم نصوص عربية واضحة في الحالات المشتركة.

أمثلة:

```txt
لا توجد بيانات حتى الآن
حدث خطأ أثناء تحميل البيانات
إعادة المحاولة
جاري التحميل...
تم الحفظ بنجاح
تم حذف العنصر بنجاح
لا يمكن تنفيذ العملية الآن
```

إذا كان المشروع يستخدم i18n، أضف النصوص إلى ملفات الترجمة بدل كتابتها مباشرة.

### معايير القبول

- لا توجد نصوص إنجليزية في المكونات المشتركة إلا إذا كان النظام متعدد اللغة ويستخدم keys.
- النصوص ليست طويلة أو تقنية للمستخدم النهائي.
- رسائل الخطأ التقنية لا تظهر كما هي للمستخدم إلا عند الحاجة.

---

## 23. المهمة 20 — تجهيز أساس الريسبونسف بدون تنفيذ المرحلة كاملة

### المطلوب في المرحلة 1 فقط

- المكونات الجديدة يجب أن تكون قابلة للتجاوب.
- `PageHeader` يجب أن يكدس actions في الشاشات الصغيرة.
- `DataToolbar` يجب أن يسمح للفلاتر بالنزول للسطر التالي.
- `SectionCard` يجب ألا يسبب overflow.
- `DetailsDrawer` يجب أن يأخذ عرض مناسب على الشاشات الصغيرة.

### ممنوع الآن

- ممنوع إعادة بناء الجداول إلى cards في هذه المرحلة.
- ممنوع تنفيذ responsive شامل لكل الصفحات.

### معايير القبول

- المكونات الجديدة لا تنكسر على عرض 768px و 430px.
- لا يوجد horizontal overflow واضح في الصفحات النموذجية بسبب المكونات الجديدة.

---

## 24. المهمة 21 — Story/Preview داخلي اختياري

إذا كان المشروع لا يحتوي Storybook، لا تضف Storybook الآن.

بدلًا من ذلك يمكن إنشاء صفحة داخلية مؤقتة للمعاينة فقط إذا كان مناسبًا:

```txt
/system/design-system-preview
```

لكن لا تضفها في sidebar للمستخدم النهائي إلا لو المشروع يسمح بذلك.

### المطلوب إذا تم تنفيذها

- تعرض PageHeader.
- تعرض StatCards.
- تعرض StatusChips.
- تعرض Empty/Error/Loading states.
- تعرض ConfirmDialog demo.

### ملاحظة

هذه المهمة اختيارية، لا تنفذها إذا ستسبب تعقيدًا أو تحتاج permissions جديدة.

---

## 25. المهمة 22 — تنظيف التكرار في الصفحات النموذجية

بعد تطبيق المكونات على الصفحات النموذجية:

- أزل تكرار card styles المحلي.
- أزل تكرار empty state المحلي.
- أزل تكرار loading spinner المحلي.
- أزل استخدام window.confirm في الصفحات المحدثة.
- قلل sx الطويل داخل الصفحات.

### معايير القبول

- الصفحات النموذجية أصبحت أقصر وأسهل قراءة.
- المكونات المشتركة لا تحتوي منطق business خاص بصفحة واحدة.

---

## 26. اختبارات وفحوصات إلزامية بعد التنفيذ

نفذ الأوامر المناسبة حسب package manager الموجود.

ابدأ بفحص الملفات:

```bash
cd admin-dashboard
```

ثم حسب المتاح:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

إذا لم يكن هناك typecheck:

```bash
npx tsc --noEmit
```

إذا كان المشروع يستخدم pnpm أو yarn، استخدمه بدل npm.

### المطلوب إصلاحه

- أي TypeScript error ناتج عن المرحلة 1.
- أي lint error ناتج عن المرحلة 1.
- أي build error ناتج عن المرحلة 1.

### لا تصلح الآن

لا تصلح مشاكل قديمة كبيرة خارج نطاق المرحلة 1 إلا إذا كانت تمنع build أو مرتبطة مباشرة بالملفات التي عدلتها.

---

## 27. QA يدوي إلزامي

بعد التشغيل المحلي:

```bash
npm run dev
```

افتح الصفحات النموذجية التي تم تحديثها وتأكد من:

1. الصفحة تفتح بدون crash.
2. العنوان والوصف يظهران بشكل صحيح.
3. الأكشنات تعمل كما كانت.
4. loading يظهر بشكل مقبول.
5. empty state يظهر عند عدم وجود بيانات.
6. error state يظهر عند فشل API.
7. الجداول لا تختفي أو تتداخل.
8. الـ drawer/dialog يظهر فوق المحتوى بشكل صحيح.
9. RTL سليم.
10. لا يوجد horizontal overflow واضح.
11. لا توجد أزرار primary كثيرة في نفس المنطقة.
12. لا توجد console errors جديدة.

---

## 28. ملف التقرير النهائي المطلوب من الوكيل

بعد الانتهاء، أنشئ ملف:

```txt
admin-dashboard/PHASE_1_DESIGN_SYSTEM_RESULTS.md
```

يجب أن يحتوي:

```md
# Phase 1 Design System Results

## Completed
- ...

## New Design System Files
- ...

## Updated Theme Files
- ...

## Updated Example Pages
- ...

## Components Created
- PageShell
- PageHeader
- SectionCard
- StatCard
- DataToolbar
- StatusChip
- EmptyState
- ErrorState
- LoadingState
- ConfirmDialog
- DetailsDrawer
- FormActionBar
- PermissionGuard
- MediaPicker

## Commands Run
- npm run typecheck: pass/fail
- npm run lint: pass/fail
- npm run build: pass/fail

## Known Issues
- ...

## Recommended Phase 2 Targets
- Dashboard redesign
- Orders redesign
- Products redesign
- Users redesign
- Website content redesign
- Analytics redesign
```

---

## 29. تعريف الانتهاء Done Criteria

تعتبر المرحلة 1 مكتملة فقط إذا تحقق التالي:

- تم إنشاء design-system folder أو ما يعادله.
- تم إنشاء tokens واضحة.
- تم تحديث MUI theme بالاعتماد على tokens.
- تم إنشاء المكونات الأساسية المطلوبة.
- تم تطبيق المكونات على 3 صفحات نموذجية على الأقل.
- لا توجد build errors ناتجة عن التعديلات.
- لا توجد TypeScript errors ناتجة عن التعديلات.
- الصفحات القديمة ما زالت تعمل.
- تم إنشاء تقرير `PHASE_1_DESIGN_SYSTEM_RESULTS.md`.

---

## 30. مخرجات المرحلة 1 المتوقعة

بعد هذه المرحلة يجب أن يصبح لدينا:

1. أساس تصميم موحد.
2. مكونات جاهزة لإعادة تصميم كل الصفحات في المرحلة 2.
3. Theme احترافي متماسك.
4. طريقة موحدة لبناء الصفحات.
5. طريقة موحدة للحالات والأخطاء والتحميل.
6. تقليل التكرار في الكود.
7. تقليل العشوائية في الواجهات.
8. لوحة جاهزة للدخول في إعادة تصميم الصفحات الأساسية بشكل آمن ومنظم.

---

## 31. ملاحظة ختامية للوكيل

نفذ هذه المرحلة كمهندس Frontend Senior، وليس كمجرد تغيير ألوان.

المطلوب هو بناء أساس طويل المدى للوحة تحكم احترافية.

لا تتوسع خارج النطاق.
لا تكسر الوظائف الحالية.
لا تعيد تصميم كل الصفحات الآن.
اجعل المرحلة 2 سهلة جدًا بعد هذه المرحلة.
