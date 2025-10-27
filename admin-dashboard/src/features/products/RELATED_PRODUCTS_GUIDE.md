# دليل المنتجات الشبيهة - لوحة التحكم

## نظرة عامة

تم إضافة ميزة المنتجات الشبيهة مباشرة في نموذج إضافة/تعديل المنتج، مما يسهل إدارة المنتجات المشابهة بشكل بسيط ومباشر.

## الملفات المضافة/المعدلة

### 1. **الأنواع (Types)**
📁 `types/product.types.ts`

**التغييرات:**
```typescript
// إضافة relatedProducts في Product interface
relatedProducts?: string[]; // IDs of related products

// إضافة relatedProducts في CreateProductDto
relatedProducts?: string[]; // Related product IDs

// إضافة relatedProducts في UpdateProductDto
relatedProducts?: string[]; // Related product IDs
```

---

### 2. **API**
📁 `api/productsApi.ts`

**الدوال المضافة:**

#### `getRelatedProducts(productId, limit?)`
الحصول على قائمة المنتجات الشبيهة

```typescript
const products = await productsApi.getRelatedProducts('product-id', 10);
```

#### `updateRelatedProducts(productId, relatedProductIds)`
تحديث المنتجات الشبيهة (استبدال كامل)

```typescript
await productsApi.updateRelatedProducts('product-id', ['id1', 'id2', 'id3']);
```

#### `addRelatedProduct(productId, relatedProductId)`
إضافة منتج شبيه واحد

```typescript
await productsApi.addRelatedProduct('product-id', 'related-product-id');
```

#### `removeRelatedProduct(productId, relatedProductId)`
حذف منتج شبيه

```typescript
await productsApi.removeRelatedProduct('product-id', 'related-product-id');
```

---

### 3. **المكونات (Components)**
📁 `components/RelatedProductsSelector.tsx`

**مكون جديد:** `<RelatedProductsSelector />`

**Props:**
```typescript
interface RelatedProductsSelectorProps {
  value: string[];                // IDs of selected products
  onChange: (productIds: string[]) => void;
  currentProductId?: string;      // To exclude current product
}
```

**الميزات:**
- ✅ Autocomplete مع بحث
- ✅ Multi-select (اختيار متعدد)
- ✅ عرض الأسماء بالعربي والإنجليزي
- ✅ عرض الفئة
- ✅ Preview للمنتجات المحددة
- ✅ استبعاد المنتج الحالي تلقائياً
- ✅ تحميل المنتجات النشطة فقط
- ✅ Loading state
- ✅ Error handling

**الاستخدام:**
```tsx
<RelatedProductsSelector
  value={relatedProducts}
  onChange={setRelatedProducts}
  currentProductId={isEditMode ? id : undefined}
/>
```

---

### 4. **الصفحات (Pages)**
📁 `pages/ProductFormPage.tsx`

**التحديثات:**

#### State جديد:
```typescript
const [relatedProducts, setRelatedProducts] = useState<string[]>([]);
```

#### تحميل البيانات في وضع التعديل:
```typescript
useEffect(() => {
  if (isEditMode && product) {
    setRelatedProducts(product.relatedProducts || []);
  }
}, [product, isEditMode]);
```

#### إرسال البيانات:
```typescript
const productData: CreateProductDto = {
  // ... other fields
  relatedProducts: relatedProducts,
};
```

#### عرض المكون في الفورم:
يتم عرض قسم المنتجات الشبيهة بعد قسم الشارات وقبل قسم السعر والكمية الافتراضية.

---

## كيفية الاستخدام

### 1. إضافة منتج جديد مع منتجات شبيهة

1. افتح صفحة إضافة منتج جديد
2. املأ المعلومات الأساسية (الاسم، الوصف، الفئة، إلخ)
3. في قسم **"المنتجات الشبيهة"**:
   - ابحث عن منتج باستخدام Autocomplete
   - اختر المنتجات المشابهة (يمكن اختيار أكثر من منتج)
   - ستظهر المنتجات المحددة في Preview بالأسفل
4. اضغط **حفظ**

### 2. تعديل منتج موجود وإضافة منتجات شبيهة

1. افتح صفحة تعديل المنتج
2. انتقل إلى قسم **"المنتجات الشبيهة"**
3. ستظهر المنتجات الشبيهة الحالية (إن وجدت)
4. يمكنك:
   - إضافة منتجات جديدة
   - حذف منتجات موجودة (عن طريق الضغط على X في Chip)
   - استبدال كل المنتجات
5. اضغط **حفظ**

### 3. إزالة كل المنتجات الشبيهة

1. افتح صفحة تعديل المنتج
2. في قسم المنتجات الشبيهة، احذف جميع الـ Chips
3. اضغط **حفظ**

---

## مثال عملي

### السيناريو: إضافة منتجات شبيهة لـ "لوحة شمسية 300W"

```
المنتج الأساسي: لوحة شمسية 300W

المنتجات الشبيهة المقترحة:
1. لوحة شمسية 400W
2. لوحة شمسية 250W  
3. منظم شحن شمسي 40A
4. بطارية شمسية 200Ah
```

**الخطوات:**
1. افتح تعديل "لوحة شمسية 300W"
2. في قسم المنتجات الشبيهة:
   - ابحث عن "لوحة شمسية 400W" واختره
   - ابحث عن "لوحة شمسية 250W" واختره
   - ابحث عن "منظم شحن" واختر "منظم شحن شمسي 40A"
   - ابحث عن "بطارية" واختر "بطارية شمسية 200Ah"
3. اضغط حفظ

**النتيجة:**
عند زيارة صفحة تفاصيل "لوحة شمسية 300W" في التطبيق، سيتم عرض هذه المنتجات الأربعة في قسم "منتجات مشابهة".

---

## المميزات

### ✅ سهولة الاستخدام
- قسم واحد في نموذج المنتج
- لا حاجة لصفحة منفصلة
- Autocomplete سهل وسريع

### ✅ البحث الذكي
- بحث بالاسم العربي
- بحث بالاسم الإنجليزي
- عرض الفئة للتوضيح

### ✅ منع الأخطاء
- لا يمكن إضافة المنتج لنفسه (يتم استبعاده تلقائياً)
- لا يمكن إضافة نفس المنتج مرتين
- تحميل المنتجات النشطة فقط

### ✅ تجربة مستخدم ممتازة
- Loading state عند التحميل
- Error handling عند الفشل
- Preview للمنتجات المحددة
- Chips ملونة وواضحة

---

## الاتصال بالـ Backend

يتم حفظ المنتجات الشبيهة تلقائياً عند حفظ المنتج:

### عند إنشاء منتج جديد:
```http
POST /admin/products
{
  "name": "...",
  "nameEn": "...",
  "relatedProducts": ["id1", "id2", "id3"],
  ...
}
```

### عند تحديث منتج:
```http
PATCH /admin/products/:id
{
  "relatedProducts": ["id1", "id2", "id3"],
  ...
}
```

---

## نصائح وأفضل الممارسات

### 📌 عدد المنتجات الشبيهة
- **المقترح:** 4-8 منتجات
- **الحد الأقصى:** 15 منتج
- **السبب:** التطبيق يعرض فقط 10 منتجات بشكل افتراضي

### 📌 اختيار المنتجات المناسبة
1. **منتجات من نفس الفئة:** لوحات شمسية مختلفة القدرة
2. **منتجات مكملة:** بطاريات، منظمات، كابلات
3. **منتجات بديلة:** نفس المنتج بمواصفات مختلفة
4. **منتجات ذات علاقة:** إكسسوارات، أدوات تركيب

### 📌 تحديث دوري
- راجع المنتجات الشبيهة بشكل دوري
- احذف المنتجات غير المتوفرة
- أضف المنتجات الجديدة ذات الصلة

---

## استكشاف الأخطاء

### ❌ لا تظهر المنتجات في القائمة
**الحل:**
- تأكد من أن المنتجات منشورة (status: active)
- تأكد من الاتصال بالـ Backend
- افتح Console للتحقق من الأخطاء

### ❌ لا يتم حفظ المنتجات الشبيهة
**الحل:**
- تأكد من الضغط على زر "حفظ"
- تحقق من Console للأخطاء
- تأكد من صلاحيات الأدمن

### ❌ لا تظهر المنتجات المحددة سابقاً
**الحل:**
- انتظر قليلاً حتى يتم تحميل البيانات
- تحديث الصفحة
- التحقق من أن المنتجات لم يتم حذفها

---

## الإصدارات القادمة

### 🔮 ميزات مقترحة:
- [ ] اقتراحات تلقائية بناءً على الفئة
- [ ] Drag & Drop لترتيب المنتجات
- [ ] عرض صور المنتجات في Autocomplete
- [ ] فلترة حسب الفئة أو العلامة التجارية
- [ ] إحصائيات: أكثر المنتجات الشبيهة نقراً
- [ ] نسخ المنتجات الشبيهة من منتج آخر

---

## الدعم

إذا واجهت أي مشاكل:
1. راجع هذا الدليل
2. افحص Console للأخطاء
3. تواصل مع فريق التطوير

---

**تاريخ الإنشاء:** 2025-10-27  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للاستخدام

