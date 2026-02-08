# خطة تطوير وإصلاحات إدارة الإشعارات

## نظرة عامة

هذا المستند يحدد خطة تطوير وإصلاحات لتحسين نظام إدارة الإشعارات، مع التركيز على:

- **Batch (الدفعات)**: ربط منطق التجميع بالإجراءات بشكل صحيح
- **Campaign (الحملات)**: دعم الحملات التسويقية في الإشعارات
- **واجهة الإدارة**: تمييز واضح بين الإشعارات الفردية والدفعات

---

## 1. التحليل: المشاكل الحالية

### 1.1 إجراءات Edit/Send/Delete على صفوف Batch

| المشكلة                  | الوصف                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| **تطبيق على إشعار واحد** | عند النقر على Edit أو Send أو Delete لصف batch، يُطبَّق الإجراء على `_id` (أول إشعار في الدفعة) فقط |
| **سلوك مضلل**            | المستخدم يتوقع أن الإجراء يطال كل المستلمين في الدفعة                                               |
| **الموقع**               | `NotificationsListPage.tsx` → `handleSend`, `handleEdit`, `handleDelete`                            |

### 1.2 عدم وجود تبديل groupByBatch

| المشكلة        | الوصف                                                         |
| -------------- | ------------------------------------------------------------- |
| **قيمة ثابتة** | `groupByBatch: true` مقيمة في الكود ولا يمكن المستخدم تغييرها |
| **عدم مرونة**  | لا يمكن التبديل بين عرض مجمع (حسب batch) وعرض كل إشعار فردي   |
| **الموقع**     | `NotificationsListPage.tsx`, `NotificationFilters.tsx`        |

### 1.3 عرض المستخدم في تفاصيل Batch

| المشكلة             | الوصف                                                   |
| ------------------- | ------------------------------------------------------- |
| **مستخدم واحد فقط** | قسم "المستخدم" يعرض `notification.user` (أول مستلم)     |
| **مضلل للدفعات**    | الإشعار موجه لعدة مستلمين ولكن الواجهة توحي بمستلم واحد |
| **الموقع**          | `NotificationViewDialog.tsx`                            |

### 1.4 عدم دعم فلتر Campaign

| المشكلة       | الوصف                                          |
| ------------- | ---------------------------------------------- |
| **Backend**   | `ListNotificationsDto` لا يدعم فلتر `campaign` |
| **Frontend**  | لا يوجد حقل campaign في واجهة الفلاتر          |
| **التحليلات** | التحليلات تدعم campaign لكن القائمة لا تدعمه   |

### 1.5 التباس المصطلحات (Batch vs Campaign)

| المشكلة               | الوصف                                                                           |
| --------------------- | ------------------------------------------------------------------------------- |
| **API Documentation** | `@ApiParam({ name: 'batchId', description: 'معرف الحملة' })` يخلط بين المفهومين |
| **الفارق**            | **batch** = تجميع تقني، **campaign** = حملة تسويقية لها اسم                     |

### 1.6 حذف وتحديث على مستوى Batch

| المشكلة         | الوصف                                                           |
| --------------- | --------------------------------------------------------------- |
| **Bulk Delete** | يحذف حسب `_id` فقط (إشعارات فردية)، لا يوجد حذف batch كامل      |
| **Edit**        | يعدّل إشعاراً واحداً، لا يوجد خيار لتعديل كل الإشعارات في batch |

### 1.7 عدم تمرير Campaign عند الإنشاء

| المشكلة                     | الوصف                                              |
| --------------------------- | -------------------------------------------------- |
| **CreateNotificationDto**   | لا يحتوي على حقل `campaign` أو `metadata.campaign` |
| **BulkSendNotificationDto** | لا يحتوي على حقل `campaign`                        |
| **النتيجة**                 | لا يمكن تصنيف الإشعارات by campaign من المصدر      |

---

## 2. خطة التنفيذ

### المرحلة 1: إصلاح إجراءات Batch (أولوية عالية)

#### المهام

- [x] **1.1** تعديل سلوك Edit/Send/Delete لصفوف Batch

  | الإجراء    | السلوك المقترح                                                                          |
  | ---------- | --------------------------------------------------------------------------------------- |
  | **Edit**   | إخفاء زر Edit للصفوف المجمعة (batch) - أو فتح modal يوضح "لن يطال التعديل كل الإشعارات" |
  | **Send**   | إما إخفاء الزر، أو استدعاء API جديد لإرسال كل الإشعارات في الـ batch                    |
  | **Delete** | استدعاء endpoint حذف batch كامل بدلاً من حذف إشعار واحد                                 |

  **الملفات:**

  - `NotificationActions.tsx` — إضافة شرط `batchId && recipientCount > 1`
  - `NotificationsListPage.tsx` — تعديل `handleSend`, `handleDelete`
  - `notificationHelpers.tsx` — إضافة `canEditBatch`, `canSendBatch`

- [x] **1.2** إضافة endpoint حذف Batch في Backend

  ```
  DELETE /notifications/admin/batch/:batchId
  ```

  **الملفات:**

  - `unified-notification.controller.ts`
  - `notification.service.ts` — `deleteBatchNotifications(batchId: string)`

- [x] **1.3** إضافة endpoint إرسال Batch (اختياري)

  ```
  POST /notifications/admin/batch/:batchId/send
  ```

  **الملفات:**

  - `unified-notification.controller.ts`
  - `notification.service.ts` — `sendBatchNotifications(batchId: string)`

---

### المرحلة 2: تبديل groupByBatch وتجربة المستخدم (أولوية عالية)

#### المهام

- [x] **2.1** إضافة خيار تبديل العرض في الفلاتر

  - **الموقع:** `NotificationFilters.tsx`
  - **عنصر UI:** Switch أو Toggle بين "عرض مجمع" و "عرض مفصل"
  - **التسمية:** "تجميع حسب الدفعة" / "عرض كل إشعار"

- [x] **2.2** ربط التبديل بحالة الفلاتر

  - **الموقع:** `NotificationsListPage.tsx`
  - تحديث `handleFilterChange` لدعم `groupByBatch`
  - إزالة القيمة الثابتة `groupByBatch: true`

- [x] **2.3** تمييز صفوف Batch في الجدول

  - **الموقع:** `NotificationTableColumns.tsx`
  - إبراز صفوف batch (مثلاً Chip أو أيقونة) لتمييزها عن الإشعارات الفردية

---

### المرحلة 3: تحسين عرض تفاصيل Batch (أولوية متوسطة)

#### المهام

- [x] **3.1** تعديل قسم "المستخدم" في NotificationViewDialog

  - **للإشعارات الفردية:** عرض المستلم كما هو حالياً
  - **للدفعات (batchId موجود):** استبدال قسم "المستخدم" بعنوان مثل "دفعة لـ X مستلمين" مع رابط أو accordion يفتح جدول المستلمين
  - **الموقع:** `NotificationViewDialog.tsx`

- [x] **3.2** إظهار batchId في تفاصيل الإشعار

  - إضافة حقل "معرف الدفعة" (batchId) في قسم التفاصيل عند وجوده
  - يساعد في التتبع والتصحيح

---

### المرحلة 4: دعم Campaign (أولوية متوسطة)

#### المهام

- [x] **4.1** إضافة campaign إلى DTOs

  | DTO                       | التعديل                             |
  | ------------------------- | ----------------------------------- |
  | `CreateNotificationDto`   | إضافة `campaign?: string` (اختياري) |
  | `BulkSendNotificationDto` | إضافة `campaign?: string` (اختياري) |

  **الملفات:**

  - `unified-notification.dto.ts`

- [x] **4.2** ربط campaign بـ metadata عند الحفظ

  - **الموقع:** `notification.service.ts` — `createNotification`, `bulkSendNotifications`
  - عند وجود `dto.campaign` → `metadata.campaign = dto.campaign`

- [x] **4.3** إضافة فلتر campaign في Backend List

  - **الموقع:** `unified-notification.dto.ts` — `ListNotificationsDto`
  - **الموقع:** `notification.service.ts` — `listNotifications` في بناء الـ filter

- [x] **4.4** إضافة فلتر campaign في واجهة الفلاتر

  - **الموقع:** `NotificationFilters.tsx`
  - حقل بحث أو Select للـ campaign (قائمة من القيم الموجودة أو إدخال حر)

- [x] **4.5** إضافة حقل campaign في نماذج الإنشاء والإرسال الجماعي

  - **الموقع:** `NotificationCreateWizard.tsx`, `BulkSendForm.tsx`
  - حقل اختياري "اسم الحملة"

---

### المرحلة 5: توحيد المصطلحات والوثائق (أولوية منخفضة)

#### المهام

- [x] **5.1** تصحيح وصف API

  - `@ApiParam({ name: 'batchId', description: 'معرف الدفعة (Batch)' })`
  - توضيح الفرق بين batch و campaign في التعليقات

- [x] **5.2** مراجعة ملفات الترجمة

  - إضافة/تحديث مفاتيح: `batch`, `campaign`, `groupByBatch`, إلخ.
  - **الملفات:** `notifications.json` (ar, en)

---

### المرحلة 6: حذف وتحديث جماعي ذكي (أولوية منخفضة)

#### المهام

- [x] **6.1** تحسين Bulk Delete

  - عند اختيار صفوف batch في الحذف الجماعي، يتم حذف الدفعة كاملة تلقائياً
  - رسالة تأكيد توضح عدد الدفعات والإشعارات الفردية المحددة
  - `NotificationsListPage.tsx` — `handleBulkDelete` مع دعم batch/single

- [x] **6.2** Edit على صف batch (اختياري)

  - تم منع Edit للدفعات في المرحلة 1 (`NotificationActions.tsx`)

---

## 3. الملفات المتأثرة

### Backend

```
backend/src/modules/notifications/
├── dto/
│   └── unified-notification.dto.ts    # campaign في Create, BulkSend, List
├── services/
│   └── notification.service.ts        # deleteBatch, sendBatch, campaign في create/bulk
├── controllers/
│   └── unified-notification.controller.ts  # endpoints جديدة
└── interfaces/
    └── notification.interfaces.ts     # campaign في الـ types
```

### Frontend

```
admin-dashboard/src/features/notifications/
├── components/
│   ├── NotificationFilters.tsx        # groupByBatch toggle, campaign filter
│   ├── NotificationActions.tsx       # إخفاء/تعديل Edit/Send/Delete للـ batch
│   ├── NotificationTableColumns.tsx  # تمييز صفوف batch
│   └── NotificationViewDialog.tsx    # عرض المستلمين للدفعات
├── pages/
│   └── NotificationsListPage.tsx     # handlers للـ batch
├── api/
│   └── notificationsApi.ts           # deleteBatch, sendBatch
├── hooks/
│   └── useNotifications.ts           # mutations للـ batch
├── types/
│   └── notification.types.ts          # campaign في الـ types
└── ...
```

---

## 4. جدول الأولويات والجهد

| المرحلة | الوصف                                  | الأولوية | الجهد المقدر |
| ------- | -------------------------------------- | -------- | ------------ |
| 1       | إصلاح إجراءات Batch (Edit/Send/Delete) | عالية    | 2–3 أيام     |
| 2       | تبديل groupByBatch وتجربة المستخدم     | عالية    | 1–2 يوم      |
| 3       | تحسين عرض تفاصيل Batch                 | متوسطة   | 1 يوم        |
| 4       | دعم Campaign                           | متوسطة   | 2–3 أيام     |
| 5       | توحيد المصطلحات                        | منخفضة   | 0.5 يوم      |
| 6       | حذف وتحديث جماعي ذكي                   | منخفضة   | 1–2 يوم      |

---

## 5. معايير النجاح

- [ ] عند النقر على Delete لصف batch، يتم حذف كل الإشعارات في الدفعة
- [ ] عند النقر على Send لصف batch (إن وُجد)، يتم إرسال الإشعار لكل المستلمين
- [ ] المستخدم يمكنه التبديل بين عرض مجمع وعرض مفصل
- [ ] تفاصيل الإشعار للدفعات توضح عدد المستلمين ولا تقتصر على مستخدم واحد
- [ ] يمكن فلترة الإشعارات حسب campaign
- [ ] يمكن تعيين campaign عند إنشاء أو إرسال إشعارات مجمعة
- [ ] FCM و WebSocket يعملان كما هو دون تغيير في منطق الإرسال

---

## 6. اعتبارات تقنية

### 6.1 عدم التأثير على FCM و WebSocket

- جميع التعديلات في طبقة الإدارة والعرض
- طبقة الإرسال (Queue, FCM, WebSocket) تبقى دون تغيير
- إن وُجد استدعاء لإرسال batch، يتم استدعاء الدوال الحالية لكل إشعار

### 6.2 التوافق مع الـ API الحالي

- إضافة حقول اختيارية فقط (campaign)
- Endpoints جديدة لا تؤثر على المسارات الحالية

### 6.3 دعم RTL والترجمة

- تحديث `notifications.json` (ar/en) عند إضافة نصوص جديدة
- التأكد من دعم RTL للعناصر الجديدة

---

## 7. المراجع

- [NOTIFICATIONS_UX_IMPROVEMENT_PLAN.md](./NOTIFICATIONS_UX_IMPROVEMENT_PLAN.md) — خطة تحسين UX السابقة
- [backend/notifications/README.md](../backend/src/modules/notifications/README.md) — وثائق وحدة الإشعارات

---

_آخر تحديث: فبراير 2025_
