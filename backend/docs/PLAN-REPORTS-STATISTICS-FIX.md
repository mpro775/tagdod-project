# خطة إصلاح قسم التقارير والإحصائيات

هذه الخطة تغطي إصلاح النواقص والتناقضات في التقارير والإحصائيات، وتوحيد التصدير مع آلية فواتير الطلبات مع التخزين في Bunny.

---

## 1. ملخص الوضع الحالي

| المكون                                  | المصدر  | المنطق                           | التصدير/التخزين           |
| --------------------------------------- | ------- | -------------------------------- | ------------------------- |
| إحصائيات الطلبات `getStats`             | ✅ صحيح | ✅ صحيح                          | —                         |
| إحصائيات الدعم                          | ✅ صحيح | ✅ صحيح                          | —                         |
| إحصائيات السلة                          | ✅ صحيح | ✅ صحيح                          | —                         |
| تقارير العمولات                         | ✅ صحيح | ✅ صحيح                          | —                         |
| التقرير المالي                          | ✅ صحيح | ❌ إيراد من كل الطلبات           | —                         |
| تحليلات الإيرادات `getRevenueAnalytics` | ✅ صحيح | ❌ بدون فلتر حالة                | —                         |
| تحليلات الإدارة `getAdminAnalytics`     | ✅ صحيح | ❌ متوسط قيمة الطلب مضلل         | —                         |
| تحليلات الخدمات (Analytics Snapshot)    | ✅ صحيح | ❌ `completed` بدل `COMPLETED`   | —                         |
| الداشبورد (الخدمات النشطة)              | ✅ صحيح | ⚠️ حالة `IN_PROGRESS` غير موجودة | —                         |
| Snapshot (أعلى منتجات/حسب الفئة)        | ✅ صحيح | ❌ بدون فلتر حالة                | —                         |
| تقارير الطلبات PDF/Excel                | ✅ صحيح | ✅ صحيح                          | ❌ حفظ محلي فقط، لا Bunny |
| تصدير التحليلات `exportOrderAnalytics`  | —       | ❌ رابط وهمي                     | ❌ لا رفع فعلي            |

**آلية الفواتير الحالية (مرجع):**  
توليد PDF في الذاكرة → `UploadService.uploadFile(buffer, 'invoices', fileName)` → Bunny → إرجاع `uploadedResult.url`.

---

## 2. أهداف الخطة

1. **تصحيح منطق التقارير والإحصائيات** بحيث تعتمد على مصادر ومعايير صحيحة (مثلاً: إيراد = طلبات مكتملة + مدفوعة فقط).
2. **توحيد التصدير** مع آلية فواتير الطلبات: توليد الملف (PDF/Excel/CSV) ثم رفعه عبر **Bunny** (نفس `UploadService` المستخدم للفواتير).
3. **عدم إدخال خدمات تخزين جديدة:** استخدام `UploadService` (Bunny) لجميع تقارير الطلبات وتصدير التحليلات، مع مجلدات منظمة (مثل `reports`, `exports`).

---

## 3. مراحل التنفيذ

### المرحلة 1: إصلاح منطق التقارير والإحصائيات

#### 1.1 التقرير المالي — `order.service.ts` → `generateFinancialReport()`

- **الملف:** `backend/src/modules/checkout/services/order.service.ts`
- **المشكلة:** تجميع `total` من كل الطلبات في الشهر بدون فلتر `status` أو `paymentStatus`.
- **الإجراء:**
  - إضافة `$match` قبل الـ `$group`:
    - `status: OrderStatus.COMPLETED`
    - `paymentStatus: PaymentStatus.PAID` (أو `'paid'` حسب الـ schema).
  - خصم المرتجعات من صافي الإيراد (الاحتفاظ بحساب `totalRefunds` من `returnInfo` كما هو).
- **التحقق:** التأكد من أن الحقول المستخدمة (`total`, `totalDiscount`, `returnInfo.isReturned`, `returnInfo.returnAmount`, `shippingCost`) مطابقة لـ `order.schema.ts`.

#### 1.2 تحليلات الإيرادات — `order.service.ts` → `getRevenueAnalytics()`

- **الملف:** `backend/src/modules/checkout/services/order.service.ts`
- **المشكلة:** `totalRevenue`, `revenueByDay`, `revenueByStatus`, و`getTopSellingProducts` تجمع من كل الطلبات.
- **الإجراء:**
  - إضافة فلتر موحد للطلبات المعتمدة في الإيراد في كل الـ aggregates:
    - `status: OrderStatus.COMPLETED`
    - `paymentStatus: 'paid'`.
  - تطبيق نفس الفلتر في `getTopSellingProducts` (يُستدعى من داخل `getRevenueAnalytics`).
- **التحقق:** مقارنة أرقام الإيراد قبل/بعد مع لوحة تعرض فقط الطلبات المكتملة والمدفوعة.

#### 1.3 تحليلات الإدارة — `order.service.ts` → `getAdminAnalytics()`

- **الملف:** `backend/src/modules/checkout/services/order.service.ts`
- **المشكلة:** `averageOrderValue = totalRevenue / totalOrders` بينما `totalRevenue` من المكتملة فقط و`totalOrders` عدد كل الطلبات.
- **الإجراء:**
  - حساب عدد الطلبات المكتملة في نفس الفترة (من نفس الـ `matchFilter` مع `status: OrderStatus.COMPLETED`).
  - جعل `averageOrderValue = totalRevenue / completedOrdersCount` (مع حماية من القسمة على صفر).
- **اختياري:** إرجاع حقل إضافي مثل `completedOrdersCount` للواجهة إذا لزم.

#### 1.4 تحليلات الخدمات (Snapshot) — `analytics.service.ts` → `calculateServiceAnalytics()`

- **الملف:** `backend/src/modules/analytics/analytics.service.ts`
- **المشكلة:** استخدام `status: 'completed'` (lowercase) بينما في `service-request.schema` القيمة مخزنة كـ `'COMPLETED'`.
- **الإجراء:**
  - استبدال كل `status: 'completed'` بـ `status: 'COMPLETED'` في:
    - عد الطلبات المكتملة (`completedRequests`).
    - تجميع أفضل المهندسين (`topEngineers`).
  - مراجعة أي استعلام آخر في نفس الدالة يستخدم حالة الخدمة.
- **التحقق:** التأكد من أن قيم الـ enum في الـ schema هي نفسها المستخدمة في الـ queries.

#### 1.5 الداشبورد — الخدمات النشطة — `analytics.service.ts` → `getDashboardData()`

- **الملف:** `backend/src/modules/analytics/analytics.service.ts`
- **المشكلة:** استخدام `status: { $in: [..., 'IN_PROGRESS'] }` بينما الـ schema لا تحتوي على `IN_PROGRESS`.
- **الإجراء:**
  - إزالة `'IN_PROGRESS'` من المصفوفة، أو استبدالها بالحالة الصحيحة إن وُجدت في النموذج.
  - الإبقاء على: `['OPEN', 'OFFERS_COLLECTING', 'ASSIGNED']` للخدمات "النشطة" (قبل الإكمال/التقييم/الإلغاء).
- **التحقق:** مقارنة عدد الخدمات النشطة مع استعلام مباشر على الـ DB بنفس الفلتر.

#### 1.6 Snapshot الطلبات — أعلى منتجات وإيراد حسب الفئة — `analytics.service.ts` → `calculateOrderAnalytics()`

- **الملف:** `backend/src/modules/analytics/analytics.service.ts`
- **المشكلة:** `topProductsResult` و`categoryRevenueResult` (إيراد حسب الفئة) يعتمدان فقط على `createdAt` بدون فلتر حالة.
- **الإجراء:**
  - إضافة فلتر في الـ aggregates:
    - `status: 'completed'` (أو `OrderStatus.COMPLETED` إن تم استيراده).
    - `paymentStatus: 'paid'`.
  - تطبيقه على:
    - تجميع أعلى المنتجات (top products).
    - تجميع الإيراد حسب الفئة (revenue by category).
- **التحقق:** مقارنة النتائج مع تقرير إيرادات يعتمد فقط على طلبات مكتملة ومدفوعة.

---

### المرحلة 2: توحيد التصدير مع الفواتير والتخزين في Bunny

المبدأ: **نفس آلية الفواتير** — توليد الملف (buffer) ثم رفعه عبر `UploadService.uploadFile(..., folder, fileName)` وإرجاع الـ URL من Bunny.

#### 2.1 تقارير الطلبات PDF — `order.service.ts` → `generateOrdersPDF()`

- **الملف:** `backend/src/modules/checkout/services/order.service.ts`
- **الوضع الحالي:** إنشاء PDF ثم حفظه في `uploads/reports` وإرجاع مسار محلي.
- **الإجراء:**
  1. الاحتفاظ بتوليد الـ PDF في الذاكرة (`pdfBuffer`) كما في الفواتير.
  2. بعد `page.pdf(...)` استدعاء:
     - `this.uploadService.uploadFile({ buffer: pdfBuffer, originalname: fileName, mimetype: 'application/pdf', size: pdfBuffer.length }, 'reports', fileName)`
     - مع `fileName` مثل: `orders-report-${date}.pdf`.
  3. إرجاع `uploadedResult.url` بدلاً من المسار المحلي.
  4. جعل الحفظ المؤقت المحلي (إن وُجد) اختيارياً أو إزالته لتجنب ازدواج التخزين.
- **التحقق:** طلب تقرير PDF من لوحة التحكم والتأكد من أن الاستجابة تحتوي على رابط Bunny قابل للتحميل.

#### 2.2 تقارير الطلبات Excel — `order.service.ts` → `generateOrdersExcel()`

- **الملف:** `backend/src/modules/checkout/services/order.service.ts`
- **الوضع الحالي:** إنشاء Excel ثم `XLSX.writeFile(workbook, filePath)` وحفظ محلي وإرجاع مسار.
- **الإجراء:**
  1. توليد الـ buffer في الذاكرة بدلاً من الكتابة إلى القرص:
     - استخدام `XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })` (أو الصيغة المناسبة لمكتبة xlsx المستخدمة).
  2. استدعاء `this.uploadService.uploadFile({ buffer: excelBuffer, originalname: fileName, mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: excelBuffer.length }, 'reports', fileName)`.
  3. إرجاع `uploadedResult.url` فقط (إزالة الاعتماد على المسار المحلي).
- **التحقق:** طلب تقرير Excel والتأكد من أن الرابط من Bunny ويُحمّل الملف بشكل صحيح.

#### 2.3 تصدير تحليلات الطلبات — `order.service.ts` → `exportOrderAnalytics()`

- **الملف:** `backend/src/modules/checkout/services/order.service.ts`
- **الوضع الحالي:** إرجاع `fileUrl: 'https://api.example.com/exports/...'` وهمي بدون إنشاء ملف أو رفع.
- **الإجراء:**
  1. حسب الـ `format` (csv / xlsx / json):
     - جلب البيانات من `getAdminAnalytics(params)` و(إن وُجدت) `getRevenueAnalytics({ fromDate, toDate })` و`getPerformanceAnalytics()`.
     - توليد الملف في الذاكرة:
       - **JSON:** `Buffer.from(JSON.stringify(data, null, 2), 'utf-8')`.
       - **CSV:** تحويل البيانات إلى صفوف وعمود واستخدام مكتبة أو دالة لإنشاء CSV ثم `Buffer.from(csvString, 'utf-8')`.
       - **XLSX:** نفس أسلوب تقرير Excel (ورقة أو أكثر للتحليلات والإيرادات والأداء).
  2. اسم ملف واضح، مثلاً: `order_analytics_${timestamp}.${extension}`.
  3. استدعاء `this.uploadService.uploadFile({ buffer, originalname: fileName, mimetype, size: buffer.length }, 'reports', fileName)` (أو مجلد `exports` إذا فضّل الفريق فصل التقارير عن التصدير).
  4. إرجاع الاستجابة مع `fileUrl: uploadedResult.url` و`fileName` و`exportedAt` و`recordCount` و`summary` كما في الـ API الحالي.
- **التحقق:** استدعاء `POST .../admin/orders/analytics/export?format=csv` (وباقي الصيغ) والتأكد من وجود رابط Bunny صالح وحجم البيانات متوقع.

#### 2.4 الاعتماد على UploadService في OrderService

- **الملف:** `backend/src/modules/checkout/services/order.service.ts` و`checkout.module.ts` (أو المكان الذي يُسجّل فيه `OrderService`).
- **الإجراء:**
  - التأكد من أن `UploadService` (أو الوحدة التي تصدّرها) مُحقَن في `OrderService` ومتاح في نفس الـ module (مثلما هو مستخدم لرفع الفواتير).
  - إذا كان التصدير يُنفّذ من وحدة أخرى (مثل analytics)، التأكد من أن استدعاء التصدير يمر عبر خدمة تستخدم نفس `UploadService` أو أن الـ module يوفّر الوصول إلى `UploadService` حيث تُنفّذ تصديرات الطلبات.

---

### المرحلة 3: تنظيم المجلدات في Bunny والاختبار

- **مجلدات مقترحة في Bunny (ضمن نفس الـ Storage Zone):**
  - `invoices` — فواتير الطلبات (موجود حالياً).
  - `reports` — تقارير الطلبات (PDF/Excel) وتصدير التحليلات (CSV/Excel/JSON).
  - (اختياري) `exports` إذا رغب الفريق بفصل تقارير "الطلبات" عن "تصدير التحليلات".
- **الاختبار:**
  - إنشاء طلبات مكتملة ومدفوعة وطلبات ملغاة/قيد الانتظار.
  - تشغيل التقرير المالي وتحليلات الإيرادات قبل وبعد التعديلات ومقارنة الأرقام.
  - طلب تقارير PDF و Excel وتصدير التحليلات (csv, xlsx, json) والتحقق من أن كل الاستجابات تحتوي على روابط Bunny تعمل وأن الملفات قابلة للتحميل.

---

## 4. قائمة تحقق تنفيذ

- [ ] **1.1** إصلاح `generateFinancialReport()` — فلتر COMPLETED + paid.
- [ ] **1.2** إصلاح `getRevenueAnalytics()` و`getTopSellingProducts()` — نفس الفلتر.
- [ ] **1.3** إصلاح `getAdminAnalytics()` — متوسط قيمة الطلب من المكتملة فقط.
- [ ] **1.4** إصلاح `calculateServiceAnalytics()` — استبدال `'completed'` بـ `'COMPLETED'`.
- [ ] **1.5** إصلاح الداشبورد — إزالة/تصحيح `IN_PROGRESS` في الخدمات النشطة.
- [ ] **1.6** إصلاح `calculateOrderAnalytics()` — فلتر حالة في أعلى المنتجات والإيراد حسب الفئة.
- [ ] **2.1** تعديل `generateOrdersPDF()` — رفع الـ buffer إلى Bunny عبر UploadService، إرجاع URL.
- [ ] **2.2** تعديل `generateOrdersExcel()` — توليد buffer ورفعه إلى Bunny، إرجاع URL.
- [ ] **2.3** تنفيذ `exportOrderAnalytics()` — إنشاء الملف فعلياً ورفعه إلى Bunny وإرجاع الرابط الحقيقي.
- [ ] **2.4** التحقق من حقن UploadService في OrderService/Module.
- [ ] **3** اختبار التقرير المالي، تحليلات الإيرادات، التقارير PDF/Excel، وتصدير التحليلات مع روابط Bunny.

---

## 5. ملاحظات إضافية

- **الأمان والصلاحيات:** التأكد من أن جميع endpoints التقارير والتصدير محمية بصلاحيات الإدارة (مثل AdminGuard/Roles) كما هو الحال حالياً.
- **الأداء:** تقارير كبيرة (آلاف الطلبات) قد تحتاج إلى تحسين لاحق (مثلاً stream للـ CSV أو تقسيم الـ PDF)، لكن الخطة الحالية تركز على صحة المنطق والتخزين في Bunny.
- **اللغة والتنسيق:** الاحتفاظ بتنسيق التاريخ والعملة والنصوص العربية في التقارير والتصدير كما هو متوقع من الواجهة الحالية.

بعد تنفيذ هذه الخطة يكون قسم التقارير والإحصائيات قد تم إصلاح نواقصه، ويكون التصدير موحّداً مع آلية فواتير الطلبات مع التخزين في Bunny.
