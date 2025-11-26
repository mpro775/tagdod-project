# نظام التصدير والتخزين - Export & Storage System

## نظرة عامة

تم إعداد نظام كامل للتصدير والتخزين مع تكامل Bunny.net Storage. النظام يدعم:

- ✅ توليد ملفات PDF
- ✅ توليد ملفات Excel (XLSX)
- ✅ توليد ملفات CSV
- ✅ توليد ملفات JSON
- ✅ رفع الملفات إلى Bunny.net Storage
- ✅ إرجاع روابط CDN حقيقية

## الملفات الجديدة

### 1. `services/file-storage.service.ts`
خدمة إدارة التخزين مع Bunny.net:
- `uploadBuffer()` - رفع ملف من Buffer
- `deleteFile()` - حذف ملف
- `fileExists()` - التحقق من وجود ملف
- `getFileInfo()` - الحصول على معلومات الملف

### 2. `services/export.service.ts`
خدمة توليد الملفات:
- `exportData()` - تصدير البيانات بأي صيغة
- `exportToPDF()` - توليد PDF
- `exportToExcel()` - توليد Excel
- `exportToCSV()` - توليد CSV
- `exportToJSON()` - توليد JSON

## الاستخدام

### تصدير تقرير

```typescript
// في advanced-analytics.service.ts
const exportResult = await this.exportService.exportData({
  format: 'pdf', // أو 'xlsx', 'csv', 'json'
  filename: 'report_123.pdf',
  folder: 'analytics/reports',
  title: 'Sales Report',
  data: reportData,
});

// النتيجة تحتوي على:
// - url: رابط CDN للملف
// - filename: اسم الملف
// - format: صيغة الملف
// - size: حجم الملف بالبايت
// - path: المسار في التخزين
```

### تصدير بيانات المبيعات

```typescript
// في advanced-analytics.service.ts
const fileUrl = await this.exportSalesData('xlsx', '2024-01-01', '2024-12-31');
// يعيد رابط CDN للملف
```

## الإعدادات المطلوبة

### متغيرات البيئة

```env
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_API_KEY=your-bunny-api-key
BUNNY_HOSTNAME=storage.bunnycdn.com
BUNNY_CDN_HOSTNAME=your-cdn-hostname.b-cdn.net
```

### المكتبات المطلوبة

تم إضافة المكتبات التالية إلى `package.json`:
- `pdfkit` - لتوليد PDF
- `@types/pdfkit` - أنواع TypeScript لـ pdfkit
- `xlsx` - موجودة مسبقاً

## التحديثات

### `advanced-analytics.service.ts`
- تحديث `exportReport()` لاستخدام ExportService
- تحديث `exportSalesData()` لاستخدام ExportService
- تحديث `exportProductsData()` لاستخدام ExportService
- تحديث `exportCustomersData()` لاستخدام ExportService

### `analytics.controller.ts`
- تحديث `generateReport()` لتوليد ملفات فعلية بدلاً من روابط وهمية

### `analytics.module.ts`
- إضافة `FileStorageService` و `ExportService` إلى providers و exports

## هيكل الملفات في Bunny.net

```
analytics/
├── reports/          # التقارير المولدة
│   └── report_123_1234567890.pdf
├── exports/
│   ├── sales/        # تصدير بيانات المبيعات
│   ├── products/     # تصدير بيانات المنتجات
│   └── customers/    # تصدير بيانات العملاء
```

## ملاحظات

1. جميع الملفات تُرفع إلى Bunny.net Storage تلقائياً
2. الروابط تُرجع كروابط CDN إذا كان `BUNNY_CDN_HOSTNAME` مضبوطاً
3. في حالة عدم وجود CDN، تُرجع روابط Storage المباشرة
4. النظام يتعامل مع الأخطاء ويعيد رسائل واضحة

## الاختبار

لاختبار النظام:

1. تأكد من إعداد متغيرات البيئة
2. قم بإنشاء تقرير:
   ```http
   POST /analytics/reports/generate
   {
     "reportType": "monthly_report",
     "formats": ["pdf", "xlsx"],
     "startDate": "2024-01-01",
     "endDate": "2024-12-31"
   }
   ```

3. تحقق من أن `fileUrls` تحتوي على روابط حقيقية من Bunny.net

## الدعم

في حالة وجود مشاكل:
- تحقق من إعدادات Bunny.net
- تحقق من logs في `FileStorageService` و `ExportService`
- تأكد من أن API Key صحيح

