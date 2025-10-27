# Fix NaN Stock Values

## المشكلة (Problem)

واجهنا خطأ في قاعدة البيانات حيث كانت بعض الـ variants تحتوي على قيم `NaN` (Not a Number) في حقول `stock` و `minStock`. هذا يسبب أخطاء عند محاولة الاستعلام عن البيانات:

```
Cast to Number failed for value "NaN" (type number) at path "stock" for model "Variant"
```

We encountered an error in the database where some variants had `NaN` (Not a Number) values in the `stock` and `minStock` fields. This caused errors when trying to query the data.

## الحل (Solution)

تم تطبيق الحلول التالية / The following solutions were implemented:

### 1. إصلاح الكود (Code Fixes)

#### أ. تحديث Inventory Service
تم إضافة فلترة وتحقق من قيم NaN في الدوال التالية:
- `getLowStockVariants()` - Added NaN filtering
- `getOutOfStockVariants()` - Added NaN filtering  
- `checkLowStock()` - Added NaN validation
- `checkAvailability()` - Added NaN validation

#### ب. تحديث Variant Schema
تم إضافة:
- **Custom validators** لمنع حفظ قيم NaN
- **Pre-save hooks** لتنظيف القيم تلقائياً قبل الحفظ

```typescript
// Custom validators
VariantSchema.path('stock').validate(function(value: number) {
  return !isNaN(value) && isFinite(value) && value >= 0;
}, 'Stock must be a valid non-negative number');

// Pre-save hook
VariantSchema.pre('save', function(next) {
  if (typeof this.stock !== 'number' || isNaN(this.stock) || !isFinite(this.stock)) {
    this.stock = 0;
  }
  next();
});
```

### 2. تنظيف البيانات الموجودة (Clean Existing Data)

تم إنشاء سكريبت لتنظيف البيانات الموجودة في قاعدة البيانات:

#### تشغيل السكريبت (Running the Script)

**على Windows:**
```bash
cd backend
npm run fix-nan-values
# أو
scripts\fix-nan-values.bat
```

**على Linux/Mac:**
```bash
cd backend
npm run fix-nan-values
# أو
./scripts/fix-nan-values.sh
```

**أو مباشرة:**
```bash
cd backend
npx ts-node scripts/fix-nan-stock-values.ts
```

#### ماذا يفعل السكريبت (What the Script Does)

1. يتصل بقاعدة البيانات MongoDB
2. يفحص جميع الـ variants بحثاً عن قيم NaN
3. يستبدل أي قيم NaN بـ 0 (صفر)
4. يطبع تقرير مفصل عن العملية

The script:
1. Connects to MongoDB
2. Scans all variants for NaN values
3. Replaces any NaN values with 0 (zero)
4. Prints a detailed report

## إضافة الأمر إلى package.json (Add Command to package.json)

أضف هذا الأمر إلى `backend/package.json`:

```json
{
  "scripts": {
    "fix-nan-values": "ts-node scripts/fix-nan-stock-values.ts"
  }
}
```

## الوقاية المستقبلية (Future Prevention)

التحديثات التي تم إجراؤها تمنع ظهور هذه المشكلة مرة أخرى:

1. **Schema Validation**: يمنع حفظ قيم NaN في قاعدة البيانات
2. **Pre-save Hooks**: ينظف القيم تلقائياً قبل الحفظ
3. **Service Layer Filtering**: يفلتر قيم NaN عند الاستعلام
4. **Error Handling**: معالجة أفضل للأخطاء مع رسائل واضحة

The updates prevent this issue from happening again:

1. **Schema Validation**: Prevents saving NaN values
2. **Pre-save Hooks**: Auto-cleans values before saving
3. **Service Layer Filtering**: Filters NaN values when querying
4. **Error Handling**: Better error handling with clear messages

## التحقق من الإصلاح (Verify the Fix)

بعد تشغيل السكريبت، يمكنك التحقق من نجاح الإصلاح عن طريق:

1. الوصول إلى صفحة المخزون في لوحة التحكم
2. محاولة عرض المنتجات ذات المخزون المنخفض
3. التحقق من عدم وجود أخطاء NaN

After running the script, verify the fix by:

1. Accessing the inventory page in the admin dashboard
2. Trying to view low stock products
3. Verifying no NaN errors appear

## الملفات المعدلة (Modified Files)

- `backend/src/modules/products/services/inventory.service.ts`
- `backend/src/modules/products/schemas/variant.schema.ts`
- `backend/scripts/fix-nan-stock-values.ts` (جديد / new)
- `backend/scripts/fix-nan-values.bat` (جديد / new)
- `backend/scripts/fix-nan-values.sh` (جديد / new)

## ملاحظات (Notes)

- السكريبت آمن للتشغيل عدة مرات (idempotent)
- يمكن تشغيله على قاعدة بيانات الإنتاج بأمان
- يطبع تقرير مفصل عن جميع التغييرات

- The script is safe to run multiple times (idempotent)
- Can be safely run on production database
- Prints detailed report of all changes

## الدعم (Support)

إذا واجهت أي مشاكل، تحقق من:
1. اتصال قاعدة البيانات MongoDB
2. صلاحيات الكتابة على قاعدة البيانات
3. سجلات الأخطاء في `backend/logs/`

If you encounter any issues, check:
1. MongoDB database connection
2. Database write permissions
3. Error logs in `backend/logs/`

