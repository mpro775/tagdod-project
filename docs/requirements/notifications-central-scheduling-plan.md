# خطة تطوير نظام جدولة الإشعارات (توقيت مركزي)

## الهدف
بناء نظام جدولة احترافي فوق البنية الحالية في مشروع الإشعارات، مع اعتماد **توقيت مركزي موحد** (مثل `Asia/Riyadh`) في الإصدار الأول، لضمان البساطة التشغيلية وتقليل التعقيد والمخاطر.

---

## الوضع الحالي (مختصر)
- يوجد دعم `scheduledFor` في الـ DTO والخدمة.
- توجد طوابير Bull تشمل طابورًا للمجدول (`notification-scheduled`) وطابور إرسال (`notification-send`) وطابور إعادة المحاولة.
- يوجد Cron احتياطي يعالج الإشعارات المستحقة دوريًا.
- لوحة الإدارة لا تقدم تجربة جدولة مكتملة (اختيار وقت/منطقة زمنية/إدارة دورة حياة الجدولة).

---

## قرار معماري
**الاعتماد على التوقيت المركزي فقط في V1**:
- كل الإشعارات المجدولة تُفسَّر وتُنفَّذ وفق timezone مركزي واحد (افتراضي: `Asia/Riyadh`).
- لا يوجد تحويل حسب توقيت كل مستخدم في V1.
- دعم per-user timezone يؤجل إلى V2 بعد استقرار النظام.

**سبب القرار**:
- يقلل تعقيد المنطق والاختبارات.
- يسهّل المراقبة والتحقيق في المشاكل.
- يسرّع الإطلاق الآمن.

---

## الفجوات التي يجب إغلاقها
1. لا توجد طبقة Schedule مستقلة بدورة حياة واضحة (Draft/Scheduled/Running/Completed/Cancelled).
2. لا يوجد ربط واضح بين schedule والـ queue jobs (jobId) لدعم cancel/reschedule بشكل موثوق.
3. سيناريوهات role-based مع الجدولة تحتاج تصميم أدق (snapshot vs dynamic audience).
4. تفضيلات المستخدم (quiet hours/frequency/channel opt-out) غير مدمجة بشكل إلزامي في خط التنفيذ.
5. ينقص النظام Idempotency صارم، DLQ واضح، ومؤشرات مراقبة تشغيلية كافية.

---

## الخطة التنفيذية

## المرحلة 1: تأسيس طبقة الجدولة (Foundation)
### النطاق
- إنشاء كيان جديد `NotificationSchedule` (أو ما يعادله) يحتوي:
  - `scheduleId`
  - `title`, `message`, `type`, `channel`, `priority`
  - `audienceType` (single, batch, role-based, filtered)
  - `audienceSnapshot` (اختياري)
  - `scheduledAt` (UTC)
  - `timezone` (افتراضي مركزي)
  - `status` (draft/scheduled/running/completed/cancelled/failed)
  - `queueJobId` أو قائمة job IDs
  - `createdBy`, `createdAt`, `updatedAt`

### API
- `POST /notifications/admin/schedules` إنشاء جدولة.
- `GET /notifications/admin/schedules` قائمة + فلترة.
- `GET /notifications/admin/schedules/:id` تفاصيل.
- `PATCH /notifications/admin/schedules/:id` تعديل وقت/محتوى قبل التنفيذ.
- `POST /notifications/admin/schedules/:id/cancel` إلغاء.
- `POST /notifications/admin/schedules/:id/pause` (اختياري).
- `POST /notifications/admin/schedules/:id/resume` (اختياري).

### قواعد العمل
- أي وقت يدخل من UI يُفسر على أنه timezone مركزي ثم يحفظ UTC.
- منع تعديل schedule إذا بدأ التنفيذ (`running`).

### مخرجات المرحلة
- بنية بيانات واضحة للجدولة.
- CRUD + cancel/reschedule بشكل موثوق.

---

## المرحلة 2: محرك التنفيذ (Execution Engine)
### النطاق
- اعتماد Bull delayed jobs كمسار التنفيذ الأساسي للجدولة.
- جعل Cron دورًا احتياطيًا للتصالح (reconciliation) فقط.
- عند استحقاق schedule:
  - تحويل الحالة `scheduled -> running`.
  - توليد دفعات إرسال داخلية chunked.
  - دفعها لطوابير الإرسال الحالية.

### موثوقية التنفيذ
- Distributed lock لمنع التنفيذ المكرر في بيئة متعددة instances.
- تحديث الحالات بشكل ذري قدر الإمكان (atomic transitions).

### مخرجات المرحلة
- تنفيذ مستقر وقابل للتوسع للأحجام الكبيرة.

---

## المرحلة 3: منطق الجمهور والتفضيلات (Audience + Preferences)
### النطاق
- دعم طريقتين للجمهور:
  - **Snapshot audience**: تثبيت المستلمين وقت إنشاء الجدولة.
  - **Dynamic audience**: إعادة احتساب المستلمين عند وقت التنفيذ.
- في V1 يوصى بالبدء بـ Snapshot لتقليل عدم التوقع.

### دمج التفضيلات
- تمرير كل مستلم على:
  - إعدادات القناة المسموحة.
  - quiet hours.
  - frequency limits.
- سياسة واضحة عند التعارض:
  - transactional: يمكن defer أو override حسب النوع.
  - marketing: skip/defer حسب الإعدادات.

### مخرجات المرحلة
- التزام حقيقي بتفضيلات المستخدم وتقليل الإزعاج.

---

## المرحلة 4: الاعتمادية والمراقبة (Reliability + Observability)
### النطاق
- Idempotency key لكل عملية إرسال:
  - `scheduleId + recipientId + channel + plannedAt`
- DLQ واضح للإشعارات التي استنفدت المحاولات.
- سياسة retry لكل قناة (backoff + max attempts) موحدة ومعلنة.

### المقاييس والتنبيهات
- Metrics:
  - `schedules_created_total`
  - `schedules_due_lag_seconds`
  - `notifications_sent_total`
  - `notifications_failed_total`
  - `notifications_retried_total`
  - `dlq_size`
- Alerts:
  - ارتفاع lag
  - تضخم backlog
  - ارتفاع نسبة الفشل
  - فشل الاتصال بـ Redis/Queue

### مخرجات المرحلة
- قابلية تشغيل عالية وثقة أكبر بالإطلاق.

---

## المرحلة 5: الإطلاق التدريجي (Rollout)
### النطاق
- Migration للبيانات الحالية المرتبطة بـ `scheduledFor` إلى model الجديد (إذا تم اعتماد model منفصل).
- Feature flag لتفعيل الجدولة الجديدة تدريجيًا.
- تفعيل على مراحل (10% ثم 50% ثم 100%).

### جاهزية التشغيل
- Runbook للتعامل مع:
  - إيقاف scheduler مؤقتًا.
  - إعادة تشغيل schedule فاشل.
  - تفريغ DLQ أو إعادة معالجته.

### مخرجات المرحلة
- إطلاق آمن مع قدرة على الرجوع والتحكم.

---

## خطة واجهة الإدارة (Admin Dashboard)
1. إضافة خيار `Send now / Schedule` في نماذج الإنشاء والإرسال المجمع.
2. حقول:
   - `scheduledDateTime` (إلزامي عند Schedule)
   - `timezone` (مقفل افتراضيًا على المركزي في V1)
3. صفحة `Schedules` للإدارة:
   - قائمة الجداول الزمنية + الحالة + وقت التنفيذ.
   - إجراءات: عرض، إلغاء، إعادة جدولة.
4. إظهار الرسائل بشكل صريح:
   - "سيتم الإرسال حسب التوقيت المركزي: Asia/Riyadh".

---

## متطلبات الجودة والاختبار
1. اختبارات وحدة:
   - حساب الوقت المركزي وتحويل UTC.
   - transitions للحالات.
   - idempotency.
2. اختبارات تكامل:
   - schedule -> due -> queue -> send.
   - cancel/reschedule قبل وبعد enqueue.
3. اختبارات ضغط:
   - bulk schedules بأحجام كبيرة.
4. اختبارات فشل:
   - Redis انقطاع.
   - worker restart أثناء التنفيذ.

---

## تعريف النجاح (Success Criteria)
- >= 99% من المجدول يُنفذ ضمن نافذة انحراف زمنية مقبولة (مثال: <= 60 ثانية).
- انخفاض التكرار المزدوج للإرسال إلى مستوى شبه صفري.
- توفر رؤية تشغيلية كاملة للحالات والـ queues والـ retries.
- قدرة واضحة على cancel/reschedule بدون حالات يتيمة.

---

## خارطة الإصدارات
- **V1 (مركزي فقط):** Full scheduling lifecycle + UI + observability + reliability baseline.
- **V2:** دعم timezone لكل مستخدم + recurring schedules + smart send windows.

---

## توصيات تنفيذية سريعة (ابدأ من هنا)
1. إنشاء `NotificationSchedule` model + migration strategy.
2. بناء API create/list/cancel/reschedule.
3. ربط schedule مع Bull delayed jobs وتخزين jobId.
4. تحديث لوحة الإدارة لإدخال الوقت المركزي.
5. إضافة metrics + alerts الأساسية قبل التفعيل الكامل.
