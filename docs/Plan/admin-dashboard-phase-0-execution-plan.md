# خطة تنفيذ المرحلة 0 — إصلاح تشغيل لوحة التحكم قبل إعادة تصميم UI/UX

> هذا الملف موجه لوكيل AI / Codex لتنفيذ **المرحلة 0 كاملة** على مشروع لوحة التحكم.  
> الهدف من هذه المرحلة ليس إعادة تصميم الواجهات، بل جعل اللوحة موثوقة: كل مسار صحيح، كل زر ظاهر يعمل، كل API مستخدم في الواجهة موجود أو يتم تعديل الواجهة لتطابق الموجود، ولا توجد أخطاء runtime واضحة قبل الدخول في مرحلة إعادة التصميم الشاملة.

---

## 1. نطاق التنفيذ

### المشاريع المستهدفة

نفّذ على المشروعين فقط:

```txt
admin-dashboard/
backend/
```

### ممنوع في هذه المرحلة

لا تقم بالتالي في المرحلة 0:

- لا تعيد تصميم Dashboard أو Sidebar أو صفحات كاملة.
- لا تغيّر نظام الألوان أو الـ Design System.
- لا تبدأ تحسينات Responsive الشاملة.
- لا تحذف صفحات كاملة بدون إثبات أنها غير مستخدمة.
- لا تضف endpoints وهمية ترجع بيانات مزيفة.
- لا تكسر شكل استجابات API الحالي في كل المشروع مرة واحدة.
- لا تغيّر صلاحيات حساسة بدون توثيق واضح.

### مسموح في هذه المرحلة

مسموح فقط بإصلاحات تشغيلية وتحضيرية:

- إصلاح المسارات الخاطئة.
- إصلاح أزرار موجودة لكنها غير فعالة.
- إصلاح hooks أو providers التي تسبب runtime error.
- إضافة endpoints ناقصة في الباك إند عندما تكون الواجهة تستخدمها فعلًا.
- إزالة أو تعديل API client methods غير مستخدمة إذا كانت تشير إلى endpoints غير موجودة.
- توحيد التوستات في الملفات المتأثرة.
- إضافة مكونات بسيطة لإكمال صفحات Placeholder إذا كان الـ API موجودًا.
- إصلاح permission mapping للروترات الموجودة فعليًا.
- تشغيل build/lint/test وتوثيق النتائج.

---

## 2. أوامر الفحص قبل التعديل

ابدأ من جذر كل مشروع.

### Frontend

```bash
cd admin-dashboard
npm ci
npm run lint
npm run build
npm run test
```

### Backend

```bash
cd backend
npm ci
npm run build
npm test -- --runInBand
```

> إذا فشل أي أمر قبل التعديل بسبب مشاكل قديمة، لا تتجاهله. وثّق الخطأ في ملف `PHASE_0_RESULTS.md` ثم أصلح ما يقع ضمن نطاق المرحلة 0 فقط.

---

## 3. ملفات يجب فحصها أولًا

### Frontend

```txt
admin-dashboard/src/App.tsx
admin-dashboard/src/core/api/client.ts
admin-dashboard/src/core/router/routes.tsx
admin-dashboard/src/shared/components/Layout/Header.tsx
admin-dashboard/src/shared/components/Layout/Sidebar.tsx
admin-dashboard/src/shared/components/RouteGuard.tsx
admin-dashboard/src/shared/constants/route-permissions.ts
admin-dashboard/src/shared/constants/permissions.ts
admin-dashboard/src/features/cart/api/cartApi.ts
admin-dashboard/src/features/cart/hooks/useCart.ts
admin-dashboard/src/features/cart/pages/SendReminderDialog.tsx
admin-dashboard/src/features/cart/pages/AbandonedCartsPage.tsx
admin-dashboard/src/features/cart/pages/CartManagementPage.tsx
admin-dashboard/src/features/search/pages/SearchDashboardPage.tsx
admin-dashboard/src/features/search/api/searchApi.ts
admin-dashboard/src/features/search/hooks/useSearch.ts
admin-dashboard/src/features/search/types/search.types.ts
admin-dashboard/src/features/services/pages/EngineersManagementPage.tsx
admin-dashboard/src/features/audit/api/auditApi.ts
admin-dashboard/src/features/media/api/mediaApi.ts
admin-dashboard/src/features/notifications/api/notificationsApi.ts
admin-dashboard/src/features/products/api/productsApi.ts
```

### Backend

```txt
backend/src/modules/audit/audit.controller.ts
backend/src/shared/services/audit.service.ts
backend/src/modules/upload/media.controller.ts
backend/src/modules/upload/media.service.ts
backend/src/modules/notifications/controllers/unified-notification.controller.ts
backend/src/modules/cart/admin-cart.controller.ts
backend/src/modules/search/search.admin.controller.ts
backend/src/shared/constants/permissions.ts
```

---

## 4. المهمة 0.1 — إصلاح رابط الإعدادات في Header

### المشكلة

في الملف:

```txt
admin-dashboard/src/shared/components/Layout/Header.tsx
```

يوجد انتقال إلى:

```ts
navigate('/settings')
```

بينما المسار الحقيقي في الراوتر هو:

```txt
/system/settings
```

### المطلوب

عدّل زر الإعدادات في قائمة المستخدم إلى:

```ts
navigate('/system/settings')
```

### معايير القبول

- الضغط على زر الإعدادات في الهيدر يفتح صفحة إعدادات النظام.
- لا تظهر صفحة 404.
- لا يبقى استخدام `/settings` في Header.

---

## 5. المهمة 0.2 — إصلاح نظام التوستات وإزالة خطأ notistack

### المشكلة

المشروع يستخدم `react-hot-toast` في `App.tsx`، لكن ملفات السلة تستخدم:

```ts
useSnackbar from 'notistack'
```

ولا يوجد `SnackbarProvider` في جذر التطبيق. هذا قد يسبب runtime error عند فتح صفحات Cart أو تنفيذ العمليات.

الملفات المتأثرة:

```txt
admin-dashboard/src/features/cart/hooks/useCart.ts
admin-dashboard/src/features/cart/pages/AbandonedCartsPage.tsx
admin-dashboard/src/features/cart/pages/CartManagementPage.tsx
```

### المطلوب

اعتمد `react-hot-toast` فقط في ملفات السلة.

استبدل:

```ts
import { useSnackbar } from 'notistack';
const { enqueueSnackbar } = useSnackbar();
enqueueSnackbar('...', { variant: 'success' });
```

بـ:

```ts
import toast from 'react-hot-toast';
toast.success('...');
toast.error('...');
```

### مهم جدًا

في الملف:

```txt
admin-dashboard/src/features/cart/api/cartApi.ts
```

يوجد interceptors إضافية على `apiClient` تستخدم مفتاح تخزين مختلف:

```ts
localStorage.getItem('authToken')
```

بينما `src/core/api/client.ts` يستخدم مفاتيح `STORAGE_KEYS`.  
أزل interceptors المحلية من `cartApi.ts` بالكامل واعتمد على `core/api/client.ts` فقط.

### هل نحذف notistack من package.json؟

بعد الاستبدال، ابحث:

```bash
grep -R "notistack\|useSnackbar\|SnackbarProvider" -n src package.json
```

إذا لم يعد مستخدمًا إطلاقًا، احذف `notistack` من `package.json` ثم نفذ:

```bash
npm install
```

أو اتركه إذا كان مستخدمًا في مكان آخر، لكن يجب ألا يبقى أي استخدام لـ `useSnackbar` بدون provider.

### معايير القبول

- لا يوجد runtime error من notistack.
- لا يوجد `useSnackbar` في صفحات السلة.
- لا يوجد interceptor مكرر داخل `cartApi.ts`.
- عمليات السلة تعرض toast نجاح/خطأ بشكل موحد.
- `npm run build` ينجح.

---

## 6. المهمة 0.3 — تفعيل إرسال تذكير السلة بدل Coming Soon

### المشكلة

في:

```txt
admin-dashboard/src/features/cart/pages/SendReminderDialog.tsx
```

الزر معطل عمدًا:

```tsx
disabled={true}
```

مع Alert يعرض أن الميزة قادمة قريبًا، رغم أن الـ API والـ hook موجودان:

Frontend:

```txt
useSendCartReminder
cartApi.sendCartReminder
POST /admin/carts/:id/send-reminder
```

Backend:

```txt
backend/src/modules/cart/admin-cart.controller.ts
@Post(':id/send-reminder')
@Post('send-reminders')
```

### المطلوب

1. احذف Alert الخاص بـ Coming Soon.
2. فعّل زر الإرسال.
3. اجعل تعطيل الزر فقط في الحالات التالية:
   - لا توجد سلة `!cart`
   - الطلب قيد التنفيذ `sendReminderMutation.isPending`
   - النموذج غير صالح عند الحاجة
4. عند الضغط، أرسل:

```ts
{
  cartId: cart._id,
  reminderType,
  customMessage: customMessage.trim() || undefined
}
```

5. بعد النجاح:
   - أغلق الـ Dialog.
   - نفّذ `onSuccess()`.
   - أعد تحميل بيانات السلات عبر invalidation الموجود في hook.
6. عند الخطأ:
   - لا تغلق النافذة.
   - اعرض رسالة خطأ واضحة.

### ملاحظة Backend

الدالة الحالية في الباك إند قد تتجاهل `reminderType` و `customMessage`. لا مشكلة في المرحلة 0 إذا كان الإرسال يتم بنجاح. لكن لا تجعل الواجهة توهم المستخدم بإرسال رسالة مخصصة إذا لم يكن الباك إند يستخدمها. أحد حلّين مقبولين:

- إما تعديل الباك إند لاستخدام `customMessage` و `reminderType` فعليًا.
- أو تعديل النص في الواجهة ليكون واضحًا أن نوع التذكير تنظيمي داخلي وليس قالب رسالة مخصص إذا لم تكن مدعومة.

الأفضل: دعم `customMessage` في الباك إند إن كان ذلك ممكنًا بدون تغييرات كبيرة.

### معايير القبول

- زر إرسال التذكير يعمل.
- لا يظهر نص Coming Soon.
- عند النجاح يظهر toast نجاح.
- عند الخطأ يظهر toast/Alert خطأ.
- لا يحدث crash عند فتح صفحات Cart.
- Endpoint المستخدم موجود فعلًا في الباك إند.

---

## 7. المهمة 0.4 — إكمال تبويب Zero Results في Search Dashboard

### المشكلة

في:

```txt
admin-dashboard/src/features/search/pages/SearchDashboardPage.tsx
```

تبويب `Zero Results` يظهر Placeholder / Coming Soon. لكن الـ API موجود:

Frontend:

```txt
searchApi.getZeroResults
useZeroResultSearches
```

Backend:

```txt
GET /admin/search/zero-results
backend/src/modules/search/search.admin.controller.ts
```

### المطلوب

أنشئ مكونًا جديدًا:

```txt
admin-dashboard/src/features/search/components/ZeroResultsTable.tsx
```

يعرض البيانات من:

```ts
useZeroResultSearches(limit, page)
```

### الأعمدة المطلوبة

```txt
query
count
lastSearchedAt
actions
```

### الإجراءات المسموحة داخل actions

لا تضف أزرار وهمية. استخدم فقط إجراءات حقيقية:

- نسخ عبارة البحث إلى Clipboard.
- فتح صفحة إضافة منتج مع query parameter إن كانت صفحة المنتجات تستطيع تجاهله بدون كسر:

```txt
/products/new?source=zero-result&query=<encoded-query>
```

- أو فتح صفحة البحث نفسها مع فلتر إن كان موجودًا.

إذا لم يوجد إجراء حقيقي، اجعل الزر `Copy` فقط.

### حالات واجبة

يجب دعم:

- Loading state.
- Error state.
- Empty state عندما لا توجد بيانات.
- Pagination بسيط.
- عرض التاريخ بصيغة مفهومة.

### تحديث صفحة SearchDashboardPage

استبدل الـ Placeholder في التبويب الثاني بـ:

```tsx
<ZeroResultsTable />
```

### ملاحظة مهمة عن شكل الاستجابة

الـ backend يرجع تقريبًا:

```ts
{ success: true, data: ZeroResultSearch[], pagination: ... }
```

تأكد أن `searchApi.getZeroResults` يتعامل مع الشكل الفعلي بدون double wrapping.

### معايير القبول

- تبويب Zero Results يعرض جدولًا حقيقيًا.
- لا توجد رسالة Coming Soon.
- البيانات تُقرأ من API حقيقي.
- الجدول لا ينهار إذا رجعت `data` فارغة أو `pagination` غير موجودة.
- `npm run build` ينجح.

---

## 8. المهمة 0.5 — إصلاح زر تعديل المهندس

### المشكلة

في:

```txt
admin-dashboard/src/features/services/pages/EngineersManagementPage.tsx
```

يوجد TODO:

```ts
// TODO: Navigate to edit page or open edit dialog
```

زر التعديل يفتح تفاصيل المهندس بدل تعديل حقيقي.

### المطلوب المفضل في المرحلة 0

لا تنشئ صفحة جديدة إذا لم تكن ضرورية. استخدم صفحة تعديل المستخدم الموجودة:

```txt
/users/:id
```

عدّل `handleEditEngineer` ليحاول استخراج معرف المستخدم الصحيح:

```ts
const engineerUserId = engineer.engineerId || engineer.userId || engineer._id;
```

ثم:

```ts
navigate(`/users/${engineerUserId}`);
```

إذا لم يوجد ID:

- اعرض toast خطأ.
- لا تفتح نافذة التفاصيل.

### المطلوب الإضافي

- أزل تعليق TODO.
- اجعل Tooltip واضحًا: `تعديل بيانات المستخدم/المهندس`.
- إذا كانت صفحة `/users/:id` لا تصلح للمهندس، أنشئ Dialog تعديل بسيط يستخدم `useUpdateUser`، لكن لا تبدأ إعادة تصميم كبيرة.

### معايير القبول

- زر العين يفتح التفاصيل.
- زر القلم يفتح تعديل حقيقي أو Dialog تعديل حقيقي.
- لا يوجد TODO متبقٍ لهذا الزر.
- لا يوجد زر تعديل يفتح التفاصيل بالخطأ.

---

## 9. المهمة 0.6 — إصلاح endpoints غير المتطابقة بين الواجهة والباك إند

نفذ هذه المهمة بحذر. القاعدة:

> إذا كانت الواجهة تستخدم endpoint وله زر/عملية ظاهرة للمستخدم، أضف endpoint في الباك إند أو عدّل الواجهة إلى endpoint الصحيح.  
> إذا كانت الدالة غير مستخدمة إطلاقًا، احذفها أو علّقها بتوثيق واضح بدل إضافة endpoint غير ضروري.

---

### 9.1 Audit Export

#### المشكلة

Frontend:

```txt
GET /admin/audit/export
admin-dashboard/src/features/audit/api/auditApi.ts
```

Backend لا يحتوي endpoint مطابق في:

```txt
backend/src/modules/audit/audit.controller.ts
```

#### المطلوب

أضف endpoint:

```txt
GET /admin/audit/export
```

يدعم نفس فلاتر `getAuditLogs`:

```txt
userId
performedBy
action
resource
resourceId
startDate
endDate
isSensitive
```

ويرجع ملف CSV كـ Blob مناسب للواجهة.

#### صيغة CSV المقترحة

```csv
createdAt,performedBy,action,resource,resourceId,isSensitive,ipAddress,userAgent
```

استخدم escaping صحيح للقيم النصية.

#### معايير القبول

- زر/عملية تصدير Audit لا تفشل بـ 404.
- الاستجابة تحمل headers مناسبة:

```txt
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="audit-logs-YYYY-MM-DD.csv"
```

- لا يتم تغليف ملف CSV داخل JSON.

---

### 9.2 Media Usage

#### المشكلة

Frontend:

```txt
POST /admin/media/usage
admin-dashboard/src/features/media/api/mediaApi.ts
```

Backend لا يحتوي route مطابق، لكن `MediaService` يحتوي:

```ts
incrementUsage(id, usedInId)
decrementUsage(id, usedInId)
```

#### المطلوب

أضف endpoint في:

```txt
backend/src/modules/upload/media.controller.ts
```

بصيغة:

```txt
POST /admin/media/usage
```

Body:

```ts
{
  mediaId: string;
  usedInId: string;
  action: 'increment' | 'decrement';
}
```

ثم اربطه بـ:

```ts
mediaService.incrementUsage(mediaId, usedInId)
mediaService.decrementUsage(mediaId, usedInId)
```

#### المطلوب في الواجهة

تأكد أن:

```txt
admin-dashboard/src/features/media/api/mediaApi.ts
```

يرسل نفس الحقول المتفق عليها.

#### معايير القبول

- `POST /admin/media/usage` لا يرجع 404.
- usageCount يزيد/ينقص حسب action.
- لا ينقص usageCount عن صفر.
- عند mediaId غير موجود يرجع خطأ مفهوم.

---

### 9.3 Notifications Device Unregister

#### المشكلة

Frontend يستخدم:

```ts
DELETE /notifications/devices/:id
```

لكن Backend يستخدم:

```txt
POST /notifications/devices/unregister
Body: { token: string }
```

#### المطلوب

لا تضف DELETE جديد إلا إذا كانت الواجهة لا تستطيع الحصول على token. الأفضل تعديل الواجهة لتطابق الباك إند.

في:

```txt
admin-dashboard/src/features/notifications/api/notificationsApi.ts
```

عدّل:

```ts
unregisterDevice(id: string)
```

إلى:

```ts
unregisterDevice(token: string)
```

واستخدم:

```ts
await apiClient.post('/notifications/devices/unregister', { token });
```

ثم راجع hook:

```txt
admin-dashboard/src/features/notifications/hooks/useNotifications.ts
```

ليمرر token لا id.

إذا كانت كل الشاشات تمرر id فقط ولا يوجد token، نفّذ أحد الخيارين:

1. اعرض token في بيانات الأجهزة القادمة من API بشكل آمن لاستخدامه داخليًا.
2. أو أضف endpoint backend `DELETE /notifications/devices/:id` مع صلاحيات مناسبة.

لا تترك دالة frontend تستدعي endpoint غير موجود.

#### معايير القبول

- لا يوجد استدعاء `DELETE /notifications/devices/:id` إلا إذا أضفت endpoint مطابق.
- إلغاء تسجيل الجهاز يعمل فعليًا.
- لا توجد 404 عند العملية.

---

### 9.4 Product Update Stats

#### المشكلة

في:

```txt
admin-dashboard/src/features/products/api/productsApi.ts
```

يوجد:

```ts
POST /admin/products/:id/update-stats
```

لكن Backend لا يحتوي endpoint مطابق للمنتجات. يوجد endpoint مشابه للتصنيفات فقط:

```txt
/admin/categories/:id/update-stats
```

#### المطلوب

ابحث أولًا:

```bash
grep -R "updateStats\|productsApi.updateStats" -n admin-dashboard/src
```

إذا لم تكن مستخدمة:

- احذف `productsApi.updateStats` من `productsApi.ts`.
- لا تضف endpoint جديد في الباك إند.

إذا كانت مستخدمة في زر ظاهر:

- إما أضف endpoint حقيقي في الباك إند يحسب إحصائيات المنتج.
- أو احذف الزر من الواجهة مع توضيح سبب الحذف في `PHASE_0_RESULTS.md`.

#### معايير القبول

- لا يبقى frontend method يشير إلى endpoint غير موجود بدون استخدام واضح.
- لا يوجد زر ظاهر يستدعي endpoint غير موجود.

---

## 10. المهمة 0.7 — إضافة API response normalizer بدون كسر المشروع

### المشكلة

في المشروع استخدام واسع لـ:

```ts
response.data.data
```

وبعض الملفات تعالج حالات double wrapping يدويًا:

```ts
response.data.data?.data ?? response.data.data
```

لا تغيّر interceptor ليعيد `response.data` مباشرة، لأن هذا سيكسر مئات الاستدعاءات الحالية.

### المطلوب الصحيح في المرحلة 0

أنشئ helper مركزي غير كاسر:

```txt
admin-dashboard/src/core/api/response.ts
```

مثال مقترح:

```ts
export function unwrapApiData<T>(payload: unknown, fallback?: T): T {
  const value = payload as any;

  if (value?.success === true && 'data' in value) {
    const inner = value.data;
    if (inner?.success === true && 'data' in inner) {
      return inner.data as T;
    }
    return inner as T;
  }

  if (value?.data?.success === true && 'data' in value.data) {
    return value.data.data as T;
  }

  if (value?.data !== undefined) {
    return value.data as T;
  }

  return (fallback ?? value) as T;
}

export function unwrapApiMeta(payload: unknown): any {
  const value = payload as any;
  return value?.meta ?? value?.data?.meta ?? value?.pagination ?? value?.data?.pagination;
}
```

### أين نستخدمه الآن؟

لا تعمل migration لكل المشروع في المرحلة 0. استخدمه فقط في الملفات التي ستلمسها ضمن هذه المرحلة، خصوصًا:

```txt
src/features/search/api/searchApi.ts
src/features/audit/api/auditApi.ts
src/features/media/api/mediaApi.ts
src/features/cart/api/cartApi.ts
src/features/notifications/api/notificationsApi.ts
```

### معايير القبول

- لا يتغير contract العام لـ `apiClient`.
- لا تنكسر الاستدعاءات القديمة.
- الملفات المعدلة تتعامل مع double wrapping بشكل موحد.
- لا يبقى comments مثل: `Backend يرجع data.data.data` في الملفات المعدلة؛ استبدلها باستخدام helper.

---

## 11. المهمة 0.8 — إزالة console logs غير الضرورية من API client

### المشكلة

في:

```txt
admin-dashboard/src/core/api/client.ts
```

يوجد logging لكل request:

```ts
console.log('🔑 Adding token to request:', config.url);
console.log('❌ No token found for request:', config.url);
```

هذا يسبب ضوضاء وقد يكشف معلومات غير مناسبة في production.

### المطلوب

إما احذف هذه السجلات، أو اجعلها تعمل في بيئة التطوير فقط:

```ts
if (import.meta.env.DEV) {
  console.debug(...)
}
```

الأفضل حذفها بالكامل.

### معايير القبول

- لا تظهر logs لكل API request في production.
- لا يوجد `eslint-disable-next-line no-console` لهذا السبب.

---

## 12. المهمة 0.9 — إصلاح route permissions mapping

### المشكلة

يوجد routes في:

```txt
admin-dashboard/src/core/router/routes.tsx
```

ليست موجودة في:

```txt
admin-dashboard/src/shared/constants/route-permissions.ts
```

وهذا يجعل `getRoutePermissions` يرجع fallback عام:

```ts
return [PERMISSIONS.ADMIN_ACCESS];
```

هذا غير دقيق، لأن كل route يجب أن يكون له permission واضح.

### routes التي يجب إضافتها أو مراجعتها

أضف mapping لهذه المسارات على الأقل:

```txt
/profile
/users/activity
/products/:id/view
/products/:id/variants
/products/integration
/products/unlinked
/products/linked
/attributes/:id/values
/orders/out-of-stock
/analytics/scheduled-reports
/analytics/export-center
/marketing/price-rules/new
/marketing/price-rules/:id/edit
/marketing/price-rules/:id
/coupons/:id/analytics
/banners/analytics
/services/engineers/coupons
/support/tejo/sessions
/support/tejo/sessions/:id
/support/:id
/exchange-rates/sync-jobs/:id
/website/landing-settings
/website/projects
/website/projects/new
/website/projects/:id
/website/articles
/website/articles/new
/website/articles/:id
/website/landing-products
/website/landing-brands
/website/contact-requests
/website/contact-requests/:id
```

### mapping مقترح

استخدم أقرب صلاحيات موجودة:

```ts
'/profile': [],
'/users/activity': [PERMISSIONS.USERS_READ, PERMISSIONS.ADMIN_ACCESS],

'/products/:id/view': [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
'/products/:id/variants': [PERMISSIONS.PRODUCTS_UPDATE, PERMISSIONS.ADMIN_ACCESS],
'/products/integration': [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
'/products/unlinked': [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],
'/products/linked': [PERMISSIONS.PRODUCTS_READ, PERMISSIONS.ADMIN_ACCESS],

'/attributes/:id/values': [PERMISSIONS.ATTRIBUTES_UPDATE, PERMISSIONS.ADMIN_ACCESS],

'/orders/out-of-stock': [PERMISSIONS.ORDERS_READ, PERMISSIONS.ADMIN_ACCESS],

'/analytics/scheduled-reports': [PERMISSIONS.REPORTS_SCHEDULE, PERMISSIONS.ADMIN_ACCESS],
'/analytics/export-center': [PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.ADMIN_ACCESS],

'/marketing/price-rules/new': [PERMISSIONS.MARKETING_CREATE, PERMISSIONS.ADMIN_ACCESS],
'/marketing/price-rules/:id/edit': [PERMISSIONS.MARKETING_UPDATE, PERMISSIONS.ADMIN_ACCESS],
'/marketing/price-rules/:id': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],

'/coupons/:id/analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],
'/banners/analytics': [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ADMIN_ACCESS],

'/services/engineers/coupons': [PERMISSIONS.MARKETING_READ, PERMISSIONS.ADMIN_ACCESS],

'/support/tejo/sessions': [PERMISSIONS.TEJO_READ, PERMISSIONS.ADMIN_ACCESS],
'/support/tejo/sessions/:id': [PERMISSIONS.TEJO_READ, PERMISSIONS.ADMIN_ACCESS],
'/support/:id': [PERMISSIONS.SUPPORT_READ, PERMISSIONS.ADMIN_ACCESS],

'/exchange-rates/sync-jobs/:id': [PERMISSIONS.EXCHANGE_RATES_READ, PERMISSIONS.ADMIN_ACCESS],

'/website/landing-settings': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/projects': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/projects/new': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/projects/:id': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/articles': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/articles/new': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/articles/:id': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/landing-products': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/landing-brands': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/contact-requests': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
'/website/contact-requests/:id': [PERMISSIONS.SETTINGS_READ, PERMISSIONS.ADMIN_ACCESS],
```

> إذا توجد صلاحيات محتوى/موقع أكثر دقة في الباك إند، استخدمها بدل `SETTINGS_READ`. لا تختر صلاحيات عشوائية.

### تعديل fallback

بعد إضافة كل mappings، عدّل fallback في `getRoutePermissions` ليكون آمنًا أثناء التطوير.

مقترح:

```ts
if (import.meta.env.DEV) {
  console.error(`Missing route permission mapping for: ${pathname}`);
}
return [PERMISSIONS.SUPER_ADMIN_ACCESS];
```

هذا يمنع فتح route غير موثق لأي admin عادي.

### معايير القبول

- كل route في `routes.tsx` له mapping واضح.
- لا يعتمد النظام على fallback العام إلا في حالة route غير متوقع.
- عند route غير mapped في dev يظهر warning/error واضح.
- لا يتم منع Super Admin من العمل.

---

## 13. المهمة 0.10 — فحص الأزرار والعمليات الواضحة في الصفحات الأساسية

بعد تنفيذ المهام السابقة، افحص الأزرار الظاهرة في هذه الصفحات على الأقل:

```txt
/dashboard
/users
/products
/orders
/carts
/carts/abandoned
/admin/search
/services/engineers
/audit
/media
/notifications
/system/settings
```

### المطلوب

لكل زر ظاهر:

- إذا كان يعمل: اتركه.
- إذا كان يفتح route خطأ: أصلح route.
- إذا كان يستدعي endpoint غير موجود: أصلح endpoint أو عدّل الواجهة.
- إذا كان Coming Soon: لا تتركه إلا إذا كان مخفيًا أو موثقًا كخارج المرحلة 0.
- إذا كان TODO: عالجه أو حوّله إلى behavior واضح.

### ابحث باستخدام

```bash
grep -R "TODO\|Coming Soon\|comingSoon\|disabled={true}\|alert(" -n admin-dashboard/src
```

### لا تصلح كل TODO في المشروع عشوائيًا

أصلح فقط ما يتعلق بزر أو عملية ظاهرة في لوحة التحكم الرئيسية.  
وثّق الباقي في `PHASE_0_RESULTS.md` تحت قسم `Deferred TODOs`.

---

## 14. ملف نتائج مطلوب بعد التنفيذ

أنشئ ملفًا جديدًا:

```txt
PHASE_0_RESULTS.md
```

في جذر المشروع أو داخل مجلد docs إن كان موجودًا.

يجب أن يحتوي:

```md
# Phase 0 Results

## Summary
- ...

## Fixed
- ...

## Files Changed
- ...

## Backend Endpoints Added/Changed
- ...

## Frontend API Changes
- ...

## Permission Mapping Changes
- ...

## Commands Run
- npm run lint: pass/fail
- npm run build: pass/fail
- npm run test: pass/fail
- backend build: pass/fail
- backend tests: pass/fail

## Manual QA Checklist
- [ ] Header settings opens /system/settings
- [ ] Cart reminder dialog sends reminder
- [ ] Abandoned carts page does not crash
- [ ] Search zero-results tab displays real data
- [ ] Engineer edit button opens a real edit flow
- [ ] Audit export downloads CSV
- [ ] Media usage endpoint works
- [ ] Notification unregister uses existing backend contract
- [ ] Every route has permission mapping

## Deferred Items
- ...
```

---

## 15. أوامر التحقق النهائية

### Frontend

```bash
cd admin-dashboard
npm run lint
npm run build
npm run test
```

### Backend

```bash
cd backend
npm run build
npm test -- --runInBand
```

### بحث نهائي عن مشاكل المرحلة 0

```bash
cd admin-dashboard
grep -R "useSnackbar\|notistack\|disabled={true}\|Coming Soon\|comingSoon\|TODO: Navigate" -n src
```

```bash
cd admin-dashboard
grep -R "navigate('/settings')\|navigate(\"/settings\")" -n src
```

```bash
cd admin-dashboard
grep -R "/admin/audit/export\|/admin/media/usage\|/notifications/devices/" -n src
```

راجع النتائج. لا تترك نتائج خطيرة بدون إصلاح أو توثيق.

---

## 16. Definition of Done للمرحلة 0

تعتبر المرحلة 0 مكتملة فقط إذا تحقق التالي:

- [ ] زر إعدادات الهيدر يفتح `/system/settings`.
- [ ] صفحات السلة لا تعتمد على `notistack` بدون provider.
- [ ] `cartApi.ts` لا يضيف interceptors مكررة.
- [ ] زر إرسال تذكير السلة يعمل وغير معطل دائمًا.
- [ ] تبويب Zero Results يعرض بيانات حقيقية من API.
- [ ] زر تعديل المهندس يفتح تعديلًا حقيقيًا وليس التفاصيل.
- [ ] `GET /admin/audit/export` يعمل أو تم تعديل الواجهة بشكل صحيح.
- [ ] `POST /admin/media/usage` يعمل أو تم تعديل الواجهة بشكل صحيح.
- [ ] إلغاء تسجيل أجهزة الإشعارات يطابق عقد الباك إند.
- [ ] لا توجد دوال frontend مهمة تشير إلى endpoints غير موجودة.
- [ ] كل routes الفعلية لها permission mapping.
- [ ] `getRoutePermissions` لا يعطي fallback واسع بصمت.
- [ ] لا يوجد console logging مزعج لكل API request في production.
- [ ] تم إنشاء `PHASE_0_RESULTS.md`.
- [ ] أوامر build للواجهة والباك إند تعمل.

---

## 17. ترتيب التنفيذ الموصى به

نفّذ بهذا الترتيب لتقليل التكسير:

1. Baseline build/lint/test وتوثيق الوضع.
2. إصلاح Header settings route.
3. إصلاح notistack + cartApi interceptors.
4. تفعيل SendReminderDialog.
5. إكمال ZeroResultsTable.
6. إصلاح زر تعديل المهندس.
7. إصلاح endpoints mismatch واحدًا واحدًا.
8. إضافة response helper واستخدامه في الملفات المعدلة فقط.
9. إصلاح route permissions mapping.
10. فحص الأزرار الظاهرة والـ TODO/Coming Soon.
11. تشغيل build/lint/test النهائي.
12. كتابة `PHASE_0_RESULTS.md`.

---

## 18. ملاحظات جودة الكود

- استخدم TypeScript types ولا تستخدم `any` إلا مؤقتًا عند التعامل مع response envelope، ويفضل عزل ذلك داخل helper واحد.
- لا تكرر منطق unwrap داخل كل API file.
- لا تضف console logs جديدة.
- استخدم toast موحد.
- احترم RTL واللغة العربية في الرسائل.
- أي endpoint جديد في الباك إند يجب أن يكون محميًا بنفس guards/scope المناسب.
- لا تجعل الأزرار تختفي لتخفي المشكلة؛ الزر إما يعمل، أو يتم تعطيله بسبب صلاحية/حالة واضحة مع Tooltip.

---

## 19. نتيجة متوقعة بعد المرحلة 0

بعد هذه المرحلة، اللوحة لن تكون بتصميمها النهائي بعد، لكنها يجب أن تكون جاهزة لمرحلة UI/UX الشاملة:

- المسارات الأساسية صحيحة.
- الأزرار الرئيسية لا تفشل بصمت.
- endpoints المتصلة بالواجهة متوافقة.
- صلاحيات routes أوضح.
- لا توجد أخطاء provider/runtime واضحة في Cart.
- تبويب Search Zero Results مكتمل بدل Placeholder.
- يوجد تقرير تنفيذ واضح يمكن البناء عليه في المرحلة 1.
