# 🔧 إصلاح مشكلة NaN في المخزون - Inventory NaN Fix

## ❌ المشكلة

```json
{
  "code": "PRODUCT_305",
  "message": "بيانات المنتج غير صالحة",
  "details": {
    "reason": "low_stock_query_error",
    "error": "Cast to Number failed for value \"NaN\" (type number) at path \"stock\""
  }
}
```

### السبب:
- وجود قيم `NaN` في حقل `stock` أو `minStock` في بعض الـ variants
- MongoDB لا يستطيع معالجة أو مقارنة قيم NaN في الاستعلامات
- الـ query كان يفشل قبل الوصول للفلتر في JavaScript

---

## ✅ الحل المُطبق

### 1. **استعلام آمن في getLowStockVariants**

#### قبل:
```typescript
// كان يستخدم $expr مع NaN - يفشل
const filter = {
  stock: { $type: 'number', $ne: null },
  $expr: { $lte: ['$stock', '$minStock'] }  // ❌ يفشل مع NaN
};
```

#### بعد:
```typescript
// جلب كل variants ثم تصفية في JavaScript
const variants = await this.variantModel
  .find({
    trackInventory: true,
    deletedAt: null,
    isActive: true,
  })
  .lean();

// تصفية آمنة في JavaScript
const validVariants = variants.filter(variant => {
  const stockIsValid = typeof variant.stock === 'number' && 
                      !isNaN(variant.stock) && 
                      isFinite(variant.stock);
  
  const minStockIsValid = typeof variant.minStock === 'number' && 
                         !isNaN(variant.minStock) && 
                         isFinite(variant.minStock);

  if (!stockIsValid || !minStockIsValid) {
    return false;  // تجاهل variants مع NaN
  }

  // المقارنة الآمنة
  if (threshold !== undefined) {
    return variant.stock <= threshold;
  } else {
    return variant.stock <= variant.minStock;
  }
});
```

### 2. **استعلام آمن في getOutOfStockVariants**

#### قبل:
```typescript
// كان يفشل مع NaN
.find({ stock: 0 })  // ❌ NaN !== 0
```

#### بعد:
```typescript
// تصفية آمنة
.filter(variant => {
  const stockIsValid = typeof variant.stock === 'number' && 
                      !isNaN(variant.stock) && 
                      isFinite(variant.stock);
  return stockIsValid && variant.stock === 0;
})
```

### 3. **إرجاع مصفوفة فارغة بدلاً من خطأ**

```typescript
catch (error) {
  this.logger.error('Error getting low stock variants:', error);
  this.logger.warn('Returning empty array due to query error');
  return [];  // ✅ بدلاً من throw error
}
```

---

## 🔍 التحقق من البيانات

### للتحقق من وجود NaN في قاعدة البيانات:

```javascript
// في MongoDB Shell/Compass
db.variants.find({
  $or: [
    { stock: NaN },
    { minStock: NaN },
    { stock: { $type: 'double', $eq: NaN } }
  ]
}).count()
```

---

## 🛠️ إصلاح البيانات الموجودة

### خيار 1: تحديث يدوي
```javascript
// في MongoDB Shell
db.variants.updateMany(
  {
    $or: [
      { stock: { $type: 'double', $not: { $gte: 0 } } },
      { minStock: { $type: 'double', $not: { $gte: 0 } } }
    ]
  },
  {
    $set: {
      stock: 0,
      minStock: 0
    }
  }
)
```

### خيار 2: استخدام السكريبت الموجود
```bash
cd backend
npm run fix-nan-values
# أو
node scripts/fix-nan-stock-values.ts
```

---

## ✅ النتيجة

### قبل الإصلاح:
```
GET /api/v1/admin/products/inventory/low-stock
❌ 400 Bad Request
❌ "Cast to Number failed for value 'NaN'"
```

### بعد الإصلاح:
```
GET /api/v1/admin/products/inventory/low-stock
✅ 200 OK
✅ يعيد قائمة فارغة [] أو variants صحيحة
✅ يتجاهل variants مع NaN
```

---

## 📊 التأثير

### Endpoints المحسّنة:
- ✅ `GET /admin/products/inventory/low-stock`
- ✅ `GET /admin/products/inventory/out-of-stock`

### الفوائد:
- ✅ لا مزيد من أخطاء 400
- ✅ تعامل آمن مع NaN
- ✅ إرجاع بيانات صحيحة فقط
- ✅ Logging أفضل للأخطاء

---

## 🔄 الوقاية المستقبلية

### في variant.schema.ts:
```typescript
@Prop({ type: Number, default: 0, min: 0 })
stock!: number;

@Prop({ type: Number, default: 0, min: 0 })
minStock!: number;
```

### في validation:
```typescript
// دائماً تحقق من القيم قبل الحفظ
if (isNaN(stock) || !isFinite(stock)) {
  stock = 0;
}
```

---

## 📂 الملفات المعدلة

- ✅ `backend/src/modules/products/services/inventory.service.ts`

---

تم الإصلاح! ✅

تاريخ: 2025-10-29

