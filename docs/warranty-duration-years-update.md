# Warranty Duration Years Update

هذا الملف يشرح للمطور ما تم تنفيذه لإضافة حقل الضمان كقيمة رقمية سنوية باسم:

- `warrantyDurationYears`

الحقل أصبح جزءاً من:

- إنشاء/تعديل المنتج في لوحة التحكم.
- استجابات تفاصيل وقوائم المنتجات في الـ API.
- طبقة قراءة البيانات في الويب (`tagadod-web`).

---

## 1) ماذا تغير في الـ Backend

### Schema + DTO

- تم إضافة الحقل في `backend/src/modules/products/schemas/product.schema.ts` كرقم:
  - النوع: `Number`
  - الحد الأدنى: `0`
  - القيمة الافتراضية: `0`

- تم إضافته في DTOs داخل `backend/src/modules/products/dto/product.dto.ts`:
  - `CreateProductDto`
  - `UpdateProductDto`
  - التحقق: `@IsNumber() @IsInt() @Min(0)`

### Public responses (كل endpoints المبنية على presenter)

- تم تضمين الحقل في الـ presenter داخل:
  - `backend/src/modules/products/services/public-products.presenter.ts`

الآن مخرجات المنتج المبسطة/التفصيلية تتضمن دائماً:

- `warrantyDurationYears` (مع fallback إلى `0` إذا القيمة غير موجودة).

### Admin list/detail fallback

- تم إضافة fallback في service الأدمن داخل:
  - `backend/src/modules/products/services/product.service.ts`

بحيث عند الإرجاع تكون القيمة `0` إذا المنتج قديم ولم يكن يحمل الحقل سابقاً.

---

## 2) ماذا تغير في لوحة التحكم (Admin Dashboard)

### Types

- تم تحديث الأنواع في:
  - `admin-dashboard/src/features/products/types/product.types.ts`

واستبدال الحقل النصي القديم إلى:

- `warrantyDurationYears?: number`

### Product form (Create / Edit)

- تم إضافة إدخال رقمي للحقل في:
  - `admin-dashboard/src/features/products/pages/ProductFormPage.tsx`

خصائص الإدخال:

- `type="number"`
- `min=0`
- يتم إرسال القيمة كرقم سنوي في payload.

### Product view

- تم عرض الحقل في صفحة التفاصيل:
  - `admin-dashboard/src/features/products/pages/ProductViewPage.tsx`

### i18n

- تمت إضافة ترجمة المفتاح الجديد:
  - `admin-dashboard/src/core/i18n/locales/ar/products.json`
  - `admin-dashboard/src/core/i18n/locales/en/products.json`

المفتاح:

- `form.warrantyDurationYears`
- `view.warrantyDurationYears`

### Normalization in hooks

- تم تحويل القيمة إلى رقم وضمان `>= 0` قبل الإرسال في:
  - `admin-dashboard/src/features/products/hooks/useProducts.ts`

---

## 3) ماذا تغير في Web App (`tagadod-web`)

### Types

- تم إضافة الحقل للنوع `Product`:
  - `tagadod-web/src/types/product.ts`

### Service normalization

- تم إضافة الحقل أثناء التطبيع من API داخل:
  - `tagadod-web/src/services/productService.ts`

وذلك في:

- normalize product list
- normalize product detail
- normalize collection products

بحيث تصبح القيمة متاحة في الواجهة دائماً كرقم، مع fallback إلى `0`.

---

## 4) Backfill للمنتجات القديمة

تم إنشاء سكربت مخصص لتعبئة المنتجات القديمة بالقيمة الافتراضية `0`:

- `backend/scripts/backfill-product-warranty-years.ts`

وتم إضافة أمر npm:

- `backend/package.json`
- script: `db:backfill-product-warranty-years`

طريقة التشغيل:

```bash
cd backend
npm run db:backfill-product-warranty-years
```

ملاحظة: في بيئة التنفيذ الحالية، تشغيل السكربت فشل بسبب عدم الوصول إلى DNS لقاعدة البيانات (`ENOTFOUND`).
عند تشغيله داخل بيئة السيرفر الصحيحة أو مع إعدادات اتصال صحيحة سيقوم بتحديث المنتجات القديمة فعلياً.

---

## 5) كيف يرجع تفاصيل منتج الآن مع قيمة الضمان

### Endpoint عام (Public)

يمكنك جلب التفاصيل عبر أي endpoint تفاصيل منتج مستخدم حالياً، مثل:

```http
GET /products/:id
```

مثال استجابة (مختصرة):

```json
{
  "success": true,
  "data": {
    "_id": "65f0c7e2a19d0e0012ab34cd",
    "name": "Solar Inverter X",
    "slug": "solar-inverter-x",
    "warrantyDurationYears": 2,
    "pricing": {
      "basePriceUSD": 1200,
      "finalPriceUSD": 1100
    }
  }
}
```

### Endpoint الأدمن (Admin)

مثال:

```http
GET /admin/products/:id
```

المنتج الآن يحتوي:

- `warrantyDurationYears`

وفي حال منتج قديم بدون قيمة مخزنة، يوجد fallback في طبقة الخدمة ليظهر `0`.

---

## 6) ملاحظة التسمية النهائية

الاسم المعتمد النهائي في جميع الطبقات هو:

- `warrantyDurationYears`

وتم إلغاء النسخة النصية السابقة (`warrantyDuration`) من التعديل الأخير.
