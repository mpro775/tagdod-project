# خطة الإكمال والتوافق الكامل — لوحة التحكم مع الباك‌اند (التقارير والإحصائيات والتصدير)

هذا الملف يحدد المهام التفصيلية لإكمال التوافق بين **لوحة التحكم (admin-dashboard)** و**الباك‌اند** في كل ما يخص التقارير، الإحصائيات، والتصدير.

---

## 1. الهدف العام

- توحيد **شكل الرد** و**الحقول** بين الباك‌اند والفرونت‌اند.
- استغلال **روابط التصدير الحقيقية** (Bunny) في الواجهة بدلاً من توليد الملفات محلياً فقط.
- إكمال **تصدير قائمة الطلبات** في الباك‌اند (توليد ملف ورفعه إلى Bunny).
- إضافة الحقول الجديدة في الأنواع والواجهات عند الحاجة.

---

## 2. الباك‌اند — مهام متبقية

### 2.1 تصدير قائمة الطلبات `exportOrders` — إنشاء ملف حقيقي ورفعه إلى Bunny

| البند       | التفاصيل                                                                                                                                                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **الملف**   | `backend/src/modules/checkout/services/order.service.ts`                                                                                                                                                                                                         |
| **الدالة**  | `exportOrders(format: string, query: ListOrdersDto)`                                                                                                                                                                                                             |
| **المشكلة** | الدالة ترجع حالياً `fileUrl: 'https://api.example.com/exports/...'` وهمي بدون إنشاء ملف أو رفع.                                                                                                                                                                  |
| **المطلوب** | 1) حسب `format` (مثلاً csv أو xlsx) توليد الملف من `orders` (نفس أسلوب تقرير Excel أو CSV). 2) رفع الملف عبر `this.uploadService.uploadFile(..., 'reports', fileName)`. 3) إرجاع `fileUrl: uploadedResult.url` و`fileName` و`recordCount` و`summary` ضمن `data`. |
| **مرجع**    | نفس منطق `exportOrderAnalytics` و`generateOrdersExcel` (توليد buffer ثم رفع ثم إرجاع URL).                                                                                                                                                                       |

**شكل الاستجابة المقترح (بعد التعديل):**

```ts
return {
  success: true,
  data: {
    fileUrl: string, // رابط Bunny
    format: string,
    exportedAt: string,
    fileName: string,
    recordCount: number,
    summary: { totalOrders, exportedOrders, filters, stats },
  },
};
```

---

## 3. الفرونت‌اند — مهام التوافق

### 3.1 تصدير تحليلات الطلبات — استغلال `fileUrl` من الباك‌اند

| البند               | التفاصيل                                                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **الملف**           | `admin-dashboard/src/features/orders/hooks/useOrders.ts`                                                                                                                                                                         |
| **الدالة/الـ Hook** | `useExportOrderAnalytics` — داخل `onSuccess`                                                                                                                                                                                     |
| **المشكلة**         | الـ `onSuccess` يبني الملف (CSV/JSON/PDF) من `data` و`summary` في المتصفح ولا يستخدم `data.fileUrl` الذي يرجعه الباك‌اند (رابط Bunny).                                                                                           |
| **المطلوب**         | في بداية `onSuccess`: إذا وُجد `data.fileUrl` وكان غير فارغ، ففتحه في نافذة جديدة (`window.open(data.fileUrl, '_blank')`) أو تحميله، وإظهار `toast.success` ثم `return`. وإلا الاستمرار بالسلوك الحالي (توليد محلي) كـ fallback. |
| **ملاحظة**          | التعامل مع حالة `data.success === false` (مثلاً عندما لا تتوفر خدمة الرفع) بعرض رسالة مناسبة وعدم فتح رابط.                                                                                                                      |

**منطق مقترح (نصي):**

```
onSuccess(data):
  if (data?.success === false أو data?.error) → toast.error و return
  if (data?.fileUrl) → window.open(data.fileUrl, '_blank'); toast.success(...); return
  // Fallback: السلوك الحالي (توليد CSV/JSON/PDF من data و summary)
```

---

### 3.2 نوع تحليلات الطلبات — إضافة `completedOrdersCount`

| البند         | التفاصيل                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| **الملف**     | `admin-dashboard/src/features/orders/types/order.types.ts`                                             |
| **الواجهة**   | `OrderAnalytics`                                                                                       |
| **المطلوب**   | إضافة حقل اختياري: `completedOrdersCount?: number` لأن الباك‌اند يرجعه من `getAdminAnalytics`.         |
| **الاستخدام** | يمكن عرضه في صفحة تحليلات الطلبات (مثلاً بجانب "إجمالي الطلبات") ليوضح عدد الطلبات المكتملة في الفترة. |

**التعديل المقترح:**

```ts
export interface OrderAnalytics {
  period: string;
  totalOrders: number;
  completedOrdersCount?: number; // إضافة
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Array<{ status: OrderStatus; count: number }>;
  recentOrders: Order[];
  revenueByDay?: Array<{ date: string; revenue: number; orders: number }>;
}
```

---

### 3.3 تقرير الطلبات (PDF/Excel) — فتح الرابط بعد النجاح

| البند        | التفاصيل                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **الملف**    | `admin-dashboard/src/features/orders/hooks/useOrders.ts`                                                                                 |
| **الـ Hook** | `useGenerateOrdersReport`                                                                                                                |
| **المشكلة**  | الـ mutation ترجع `{ url, message }` من الباك‌اند (والـ url أصبح رابط Bunny)، لكن الـ `onSuccess` الحالي يكتفي بـ toast ولا يفتح الرابط. |
| **المطلوب**  | في `onSuccess`: إذا وُجد `result.url`، فتحه في نافذة جديدة: `window.open(result.url, '_blank')`. الإبقاء على الـ toast الحالي.           |

**ملاحظة:** التأكد من أن أي واجهة تستدعي `useGenerateOrdersReport` (مثلاً من قائمة الطلبات أو صفحة التقارير) تمرر الـ `result` إلى الـ mutation وتتعامل مع `result.url` إن لزم.

---

### 3.4 التقرير المالي للطلبات — عرض البيانات إن وُجدت واجهة

| البند                  | التفاصيل                                                                                                                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **الـ API**            | `GET /admin/orders/reports/financial` → `{ report, message }`                                                                                                                                                                                                          |
| **الحقول في `report`** | totalRevenue, totalOrders, averageOrderValue, refunds, netRevenue, profitMargin, totalDiscounts, totalShipping                                                                                                                                                         |
| **المطلوب**            | إذا وُجدت صفحة أو قسم في لوحة التحكم مخصص لـ "التقرير المالي للطلبات"، التأكد من أنه يقرأ من `report` بهذه الحقول وليس من واجهة التقرير المالي في التحليلات المتقدمة (`/analytics/advanced/financial`). إن لم تكن الصفحة موجودة، يمكن توثيق شكل الرد للاستخدام لاحقاً. |

---

### 3.5 تصدير قائمة الطلبات — التوافق مع الرد بعد إصلاح الباك‌اند

| البند                   | التفاصيل                                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **الملف**               | `admin-dashboard/src/features/orders/api/ordersApi.ts`                                                                                                                                                                                                            |
| **الدالة**              | `exportOrders`                                                                                                                                                                                                                                                    |
| **الوضع الحالي**        | تستدعي `POST /admin/orders/export` وتعيد `response.data.data`. الـ hook يفتح `data.fileUrl` إن وُجد.                                                                                                                                                              |
| **بعد إصلاح الباك‌اند** | الباك‌اند سيرجع `data: { fileUrl, format, fileName, recordCount, summary }`. قد يكون الرد مغلفاً بـ `{ success, data: { ... } }`. التأكد من أن الفرونت يقرأ `fileUrl` من المكان الصحيح (مثلاً `payload.data?.fileUrl` أو `payload.fileUrl` حسب شكل الـ envelope). |

لا يلزم تغيير كبير إن كان الـ client يضع الاستجابة في `response.data.data`؛ فقط التحقق من أن `fileUrl` موجود في الكائن الذي يصل إلى `useExportOrders.onSuccess`.

---

## 4. قائمة تحقق تنفيذ (Checklist) — مكتمل

### باك‌اند

- [x] **B1** تنفيذ `exportOrders` في `order.service.ts`: توليد ملف (CSV أو xlsx) من قائمة الطلبات، رفعه إلى Bunny عبر `uploadService.uploadFile(..., 'reports', fileName)`، إرجاع `fileUrl` وبيانات الملخص ضمن `data`.

### فرونت‌اند

- [x] **F1** في `useExportOrderAnalytics` (`useOrders.ts`): عند وجود `data.fileUrl` (وعدم وجود خطأ)، فتح الرابط في نافذة جديدة وإظهار toast ثم إنهاء المعالجة؛ وإلا الاستمرار بالتصدير المحلي.
- [x] **F2** في `order.types.ts`: إضافة `completedOrdersCount?: number` إلى واجهة `OrderAnalytics`.
- [x] **F3** (اختياري) في صفحة تحليلات الطلبات: عرض "الطلبات المكتملة" من `analytics.completedOrdersCount` إن وُجد.
- [x] **F4** في `useGenerateOrdersReport`: في `onSuccess`، إن وُجد `result.url` فاستدعاء `window.open(result.url, '_blank')`.
- [x] **F5** التحقق من أن أي واجهة تعرض "التقرير المالي للطلبات" تقرأ من استجابة `GET /admin/orders/reports/financial` (كائن `report`) وليس من واجهة التحليلات المتقدمة فقط.
- [x] **F6** بعد تطبيق B1: التأكد من أن استدعاء تصدير قائمة الطلبات يفتح أو يحمّل الملف من `fileUrl` المرجع من الباك‌اند.

---

## 5. ترتيب مقترح للتنفيذ

1. **باك‌اند:** تنفيذ B1 (تصدير قائمة الطلبات مع رفع إلى Bunny).
2. **فرونت:** تنفيذ F1 (استغلال `fileUrl` في تصدير التحليلات).
3. **فرونت:** تنفيذ F2 و F3 (نوع وتحسين عرض تحليلات الطلبات).
4. **فرونت:** تنفيذ F4 (فتح رابط تقرير الطلبات PDF/Excel).
5. **فرونت:** تنفيذ F5 و F6 (التقرير المالي والتحقق من تصدير القائمة).

---

## 6. مراجع الملفات

| الغرض                          | المسار                                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| تصدير تحليلات الطلبات (باك)    | `backend/src/modules/checkout/services/order.service.ts` — `exportOrderAnalytics`                                                                  |
| تصدير قائمة الطلبات (باك)      | `backend/src/modules/checkout/services/order.service.ts` — `exportOrders`                                                                          |
| تقارير الطلبات PDF/Excel (باك) | `backend/src/modules/checkout/services/order.service.ts` — `generateOrdersPDF`, `generateOrdersExcel`                                              |
| تحليلات الطلبات (باك)          | `backend/src/modules/checkout/controllers/admin-order.controller.ts` — `analytics/summary`, `analytics/revenue`, `analytics/performance`           |
| تصدير التحليلات (فرونت)        | `admin-dashboard/src/features/orders/hooks/useOrders.ts` — `useExportOrderAnalytics`                                                               |
| تقرير الطلبات (فرونت)          | `admin-dashboard/src/features/orders/hooks/useOrders.ts` — `useGenerateOrdersReport`                                                               |
| أنواع الطلبات (فرونت)          | `admin-dashboard/src/features/orders/types/order.types.ts` — `OrderAnalytics`, `OrderStats`                                                        |
| استدعاءات الطلبات (فرونت)      | `admin-dashboard/src/features/orders/api/ordersApi.ts` — `exportOrderAnalytics`, `exportOrders`, `generateOrdersReport`, `generateFinancialReport` |

---

## 7. ملاحظات إضافية

- **الـ API Envelope:** إذا كان الباك‌اند يغلف كل الاستجابات بـ `{ success, data }`، فـ `response.data.data` في الفرونت هو كائن الـ `data` الداخلي؛ تأكد أن كل الـ hooks تقرأ من نفس المستوى (مثلاً دائماً من `response.data.data` ثم التعامل مع الحقول الداخلية).
- **الأخطاء:** عند `success: false` أو وجود `error` في استجابة التصدير، يعرض الفرونت رسالة خطأ ولا يحاول فتح رابط.
- **الصلاحيات:** جميع endpoints التقارير والتصدير محمية بصلاحيات الإدارة؛ لا حاجة لتغيير الصلاحيات في هذه الخطة.

بعد تنفيذ البنود أعلاه يصبح التوافق بين لوحة التحكم والباك‌اند كاملاً في مجال التقارير والإحصائيات والتصدير، مع استغلال روابط Bunny الحقيقية في الواجهة.

---

**تاريخ الإكمال:** تم تنفيذ جميع بنود الخطة (B1، F1–F6). التوافق بين لوحة التحكم والباك‌اند في التقارير والإحصائيات والتصدير مكتمل.
