# نظام ثنائي اللغة (عربي/إنجليزي) - Tagadodo

> 🌍 **دعم كامل للغة العربية والإنجليزية في جميع الأنظمة**

**التاريخ:** 13 أكتوبر 2025  
**الحالة:** ✅ مكتمل وجاهز

---

## 📋 نظرة عامة

تم تجهيز المشروع بالكامل لدعم لغتين:
- 🇸🇦 **العربية** (اللغة الافتراضية)
- 🇬🇧 **الإنجليزية**

---

## 🗂️ الحقول المدعومة

### 1. المنتجات (Products)

```typescript
Product {
  name: string;           // "قميص رياضي"
  nameEn: string;         // "Sport Shirt"
  description: string;    // "قميص رياضي عالي الجودة..."
  descriptionEn: string;  // "High quality sport shirt..."
}
```

---

### 2. الفئات (Categories)

```typescript
Category {
  name: string;           // "إلكترونيات"
  nameEn: string;         // "Electronics"
  description: string;    // "جميع المنتجات الإلكترونية"
  descriptionEn: string;  // "All electronic products"
}
```

---

### 3. السمات (Attributes)

```typescript
Attribute {
  name: string;           // "اللون"
  nameEn: string;         // "Color"
}

AttributeValue {
  value: string;          // "أحمر"
  valueEn: string;        // "Red"
}
```

**ملاحظة:** ✅ **تم بالفعل** في النظام الأساسي!

---

### 4. البراندات (Brands)

```typescript
Brand {
  name: string;           // "سامسونج"
  nameEn: string;         // "Samsung"
  description: string;    // "براند عالمي..."
  descriptionEn: string;  // "Global brand..."
}
```

---

## 🎯 كيفية الاستخدام

### 1. إنشاء محتوى ثنائي اللغة

#### مثال: إنشاء فئة

```http
POST /admin/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "إلكترونيات",
  "nameEn": "Electronics",
  "description": "جميع المنتجات الإلكترونية",
  "descriptionEn": "All electronic products",
  "parentId": null,
  "imageId": "media123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cat_elec",
    "name": "إلكترونيات",
    "nameEn": "Electronics",
    "slug": "electronics",
    "description": "جميع المنتجات الإلكترونية",
    "descriptionEn": "All electronic products"
  }
}
```

---

#### مثال: إنشاء منتج

```http
POST /admin/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "قميص رياضي Nike",
  "nameEn": "Nike Sport Shirt",
  "description": "قميص رياضي عالي الجودة مصنوع من تقنية Dri-FIT",
  "descriptionEn": "High quality sport shirt made with Dri-FIT technology",
  "categoryId": "cat_fashion",
  "attributes": ["attr_color", "attr_size"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "prod_shirt_001",
    "name": "قميص رياضي Nike",
    "nameEn": "Nike Sport Shirt",
    "slug": "nike-sport-shirt",
    "description": "...",
    "descriptionEn": "..."
  }
}
```

**ملاحظة:** الـ `slug` يتم توليده من `nameEn` تلقائياً ✅

---

### 2. طلب محتوى بلغة معينة

#### الطريقة 1: Query Parameter

```http
# بالعربية (افتراضي)
GET /products/prod_shirt_001

# بالإنجليزية
GET /products/prod_shirt_001?lang=en
```

---

#### الطريقة 2: Accept-Language Header

```http
GET /products/prod_shirt_001
Accept-Language: en
```

---

#### الطريقة 3: استخدام @Language Decorator

```typescript
// في Controller:
@Get(':id')
async getProduct(
  @Param('id') id: string,
  @Language() lang: 'ar' | 'en'
) {
  const product = await this.productsService.getProduct(id);
  
  // إرجاع النسخة المترجمة
  return {
    data: localizeObject(product, lang)
  };
}
```

---

## 🛠️ Helper Functions

### getLocalizedField

```typescript
import { getLocalizedField } from '../../shared/utils/i18n.util';

const name = getLocalizedField(product, 'name', 'en');
// Returns: "Nike Sport Shirt"

const nameAr = getLocalizedField(product, 'name', 'ar');
// Returns: "قميص رياضي Nike"
```

---

### localizeObject

```typescript
import { localizeObject } from '../../shared/utils/i18n.util';

const product = {
  name: "قميص رياضي",
  nameEn: "Sport Shirt",
  description: "وصف بالعربية",
  descriptionEn: "English description"
};

// بالعربية
const arProduct = localizeObject(product, 'ar');
// Result: { name: "قميص رياضي", description: "وصف بالعربية" }

// بالإنجليزية
const enProduct = localizeObject(product, 'en');
// Result: { name: "Sport Shirt", description: "English description" }
```

---

### localizeArray

```typescript
import { localizeArray } from '../../shared/utils/i18n.util';

const categories = [
  { name: "إلكترونيات", nameEn: "Electronics" },
  { name: "أزياء", nameEn: "Fashion" }
];

// بالإنجليزية
const enCategories = localizeArray(categories, 'en');
// Result: [
//   { name: "Electronics" },
//   { name: "Fashion" }
// ]
```

---

## 📊 الحقول المحدثة

### Product Schema:

```typescript
✅ name → nameEn
✅ description → descriptionEn
```

---

### Category Schema:

```typescript
✅ name → nameEn
✅ description → descriptionEn
```

---

### Attribute Schema:

```typescript
✅ name → nameEn (كان موجوداً بالفعل)
```

---

### AttributeValue Schema:

```typescript
✅ value → valueEn (كان موجوداً بالفعل)
```

---

### Brand Schema:

```typescript
✅ name → nameEn
✅ description → descriptionEn
```

---

## 🎯 أمثلة عملية كاملة

### سيناريو 1: إنشاء فئة بلغتين

```http
POST /admin/categories
{
  "name": "هواتف ذكية",
  "nameEn": "Smart Phones",
  "description": "جميع أنواع الهواتف الذكية",
  "descriptionEn": "All types of smart phones",
  "parentId": "cat_electronics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "cat_phones",
    "name": "هواتف ذكية",
    "nameEn": "Smart Phones",
    "slug": "smart-phones",
    "path": "/electronics/smart-phones"
  }
}
```

---

### سيناريو 2: إنشاء منتج بلغتين

```http
POST /admin/products
{
  "name": "هاتف سامسونج جالاكسي S24",
  "nameEn": "Samsung Galaxy S24",
  "description": "هاتف ذكي متطور بشاشة 6.2 بوصة وكاميرا 200 ميجابكسل",
  "descriptionEn": "Advanced smartphone with 6.2-inch display and 200MP camera",
  "categoryId": "cat_phones",
  "brandId": "brand_samsung",
  "attributes": ["attr_color", "attr_memory"]
}
```

---

### سيناريو 3: إنشاء سمة بلغتين

```http
POST /admin/attributes
{
  "name": "الذاكرة الداخلية",
  "nameEn": "Internal Memory",
  "type": "select",
  "isFilterable": true
}
# Response: attr_memory

# إضافة قيم
POST /admin/attributes/attr_memory/values
{
  "value": "128 جيجابايت",
  "valueEn": "128GB"
}

POST /admin/attributes/attr_memory/values
{
  "value": "256 جيجابايت",
  "valueEn": "256GB"
}
```

---

## 🌍 في الواجهة (Frontend)

### React/Next.js Example:

```typescript
// 1. تحديد اللغة
const [lang, setLang] = useState<'ar' | 'en'>('ar');

// 2. طلب البيانات
const response = await fetch(`/products/${id}?lang=${lang}`);

// 3. عرض النص المناسب
<h1>{product.name}</h1>  // يعرض الاسم حسب اللغة المختارة

// أو يدوياً:
<h1>{lang === 'ar' ? product.name : product.nameEn}</h1>
```

---

### مثال كامل:

```typescript
function ProductCard({ product, lang }) {
  return (
    <div>
      <h2>{lang === 'ar' ? product.name : product.nameEn}</h2>
      <p>{lang === 'ar' ? product.description : product.descriptionEn}</p>
      <img src={product.mainImage} alt={product.name} />
    </div>
  );
}
```

---

## 🔄 التبديل بين اللغات

### في لوحة التحكم (Admin Panel):

```typescript
// زر تبديل اللغة
<button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
  {lang === 'ar' ? 'English' : 'عربي'}
</button>

// جميع الحقول تعرض باللغة المناسبة
<Input 
  label={lang === 'ar' ? 'الاسم' : 'Name'}
  value={lang === 'ar' ? product.name : product.nameEn}
/>
```

---

### في التطبيق (Customer App):

```typescript
// نفس الآلية
// كل المحتوى يتغير حسب اللغة المختارة
```

---

## 📝 نماذج الإدخال (Forms)

### إنشاء منتج:

```typescript
<Form>
  <h3>عربي</h3>
  <Input name="name" label="الاسم" required />
  <Textarea name="description" label="الوصف" required />
  
  <h3>English</h3>
  <Input name="nameEn" label="Name" required />
  <Textarea name="descriptionEn" label="Description" required />
  
  <Button>حفظ / Save</Button>
</Form>
```

---

## ✅ Checklist التحديثات

### Schemas:
- [x] Product Schema (name, nameEn, description, descriptionEn)
- [x] Category Schema (name, nameEn, description, descriptionEn)
- [x] Attribute Schema (name, nameEn) ← كان موجوداً
- [x] AttributeValue Schema (value, valueEn) ← كان موجوداً
- [x] Brand Schema (name, nameEn, description, descriptionEn)

### DTOs:
- [x] CreateProductDto
- [x] UpdateProductDto
- [x] CreateCategoryDto
- [x] UpdateCategoryDto
- [x] CreateAttributeDto ← كان موجوداً
- [x] CreateAttributeValueDto ← كان موجوداً

### Services:
- [x] Products Service (slug من nameEn)
- [x] Categories Service (slug من nameEn)
- [x] Attributes Service ← كان جاهزاً

### Helpers:
- [x] @Language Decorator
- [x] getLocalizedField()
- [x] localizeObject()
- [x] localizeArray()

---

## 🎯 المزايا

### 1. **مرونة كاملة:**

```
✅ لوحة التحكم: عربي/إنجليزي
✅ التطبيق: عربي/إنجليزي
✅ كل محتوى مترجم
✅ سهولة التبديل
```

---

### 2. **SEO محسّن:**

```
✅ slug بالإنجليزية (أفضل لـ SEO)
✅ محتوى بلغتين (Google يحب ذلك)
✅ URLs واضحة: /products/nike-sport-shirt
```

---

### 3. **تجربة مستخدم:**

```
✅ عملاء عرب: المحتوى بالعربية
✅ عملاء أجانب: المحتوى بالإنجليزية
✅ توسع عالمي سهل
```

---

## 📊 مقارنة قبل/بعد

### قبل:

```typescript
Product {
  name: "قميص رياضي Nike"  // عربي فقط
}

// العميل الأجنبي: ❌ لا يفهم
```

---

### بعد:

```typescript
Product {
  name: "قميص رياضي Nike",      // للعرب
  nameEn: "Nike Sport Shirt"     // للأجانب
}

// العميل العربي: ✅ يفهم
// العميل الأجنبي: ✅ يفهم
```

---

## 🔄 سير العمل

### للأدمن:

```
1. إنشاء محتوى
   └─ إدخال النص بالعربية
   └─ إدخال النص بالإنجليزية

2. النظام يتولى الباقي
   └─ يولد slug من الإنجليزية
   └─ يحفظ كلا النسختين
   └─ يعرض حسب اللغة المطلوبة

✅ بسيط جداً!
```

---

### للعملاء:

```
1. اختيار اللغة
   └─ عربي أو إنجليزي

2. تصفح
   └─ كل المحتوى باللغة المختارة

3. الشراء
   └─ نفس التجربة، لغة مختلفة

✅ تجربة سلسة!
```

---

## 🎨 أمثلة UI

### لوحة التحكم:

```typescript
// قسم إضافة منتج
<div className="bilingual-form">
  <div className="arabic-section">
    <h3>🇸🇦 العربية</h3>
    <Input 
      name="name" 
      label="اسم المنتج" 
      placeholder="مثال: قميص رياضي"
      required 
    />
    <Textarea 
      name="description" 
      label="الوصف" 
      placeholder="وصف تفصيلي..."
      required 
    />
  </div>
  
  <div className="english-section">
    <h3>🇬🇧 English</h3>
    <Input 
      name="nameEn" 
      label="Product Name" 
      placeholder="Example: Sport Shirt"
      required 
    />
    <Textarea 
      name="descriptionEn" 
      label="Description" 
      placeholder="Detailed description..."
      required 
    />
  </div>
</div>
```

---

### التطبيق (Customer):

```typescript
// زر تبديل اللغة
<header>
  <button onClick={() => toggleLanguage()}>
    {lang === 'ar' ? 'English' : 'عربي'}
  </button>
</header>

// عرض المنتج
<div className="product">
  <h1>{lang === 'ar' ? product.name : product.nameEn}</h1>
  <p>{lang === 'ar' ? product.description : product.descriptionEn}</p>
  
  <div className="attributes">
    {attributes.map(attr => (
      <div key={attr._id}>
        <label>{lang === 'ar' ? attr.name : attr.nameEn}</label>
        <select>
          {attr.values.map(val => (
            <option value={val._id}>
              {lang === 'ar' ? val.value : val.valueEn}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
</div>
```

---

## 🌐 الترجمة الكاملة

### ما تم دعمه:

```
✅ المنتجات (الاسم + الوصف)
✅ الفئات (الاسم + الوصف)
✅ السمات (الاسم)
✅ قيم السمات (القيمة)
✅ البراندات (الاسم + الوصف)
✅ slugs (من الإنجليزية)
```

---

### ما هو خارج النطاق:

```
⚠️ رسائل الأخطاء (ثابتة بالعربية حالياً)
⚠️ رسائل النظام (ثابتة بالعربية)
⚠️ واجهة الأدمن (يحتاج i18n في Frontend)
```

**ملاحظة:** يمكن إضافتها لاحقاً بسهولة

---

## 📖 أمثلة شاملة

### مثال 1: متجر الكتروني كامل بلغتين

```http
# 1. إنشاء فئة "الأزياء"
POST /admin/categories
{
  "name": "أزياء",
  "nameEn": "Fashion",
  "description": "ملابس وإكسسوارات",
  "descriptionEn": "Clothes and accessories"
}

# 2. إنشاء براند "Nike"
POST /admin/brands
{
  "name": "نايكي",
  "nameEn": "Nike",
  "description": "براند رياضي عالمي",
  "descriptionEn": "Global sports brand"
}

# 3. إنشاء سمة "اللون"
POST /admin/attributes
{
  "name": "اللون",
  "nameEn": "Color",
  "type": "select"
}

# قيم اللون
POST /admin/attributes/{id}/values
{ "value": "أحمر", "valueEn": "Red", "hexCode": "#FF0000" }
{ "value": "أزرق", "valueEn": "Blue", "hexCode": "#0000FF" }

# 4. إنشاء منتج
POST /admin/products
{
  "name": "قميص رياضي Nike",
  "nameEn": "Nike Sport Shirt",
  "description": "قميص عالي الجودة",
  "descriptionEn": "High quality shirt",
  "categoryId": "cat_fashion",
  "brandId": "brand_nike",
  "attributes": ["attr_color", "attr_size"]
}

# 5. توليد variants
POST /admin/products/{id}/variants/generate
{ "defaultPrice": 150, "defaultStock": 50 }

✅ المتجر جاهز بلغتين!
```

---

### مثال 2: العميل يتصفح بالإنجليزية

```http
# طلب الفئات
GET /categories?lang=en

# Response:
{
  "data": [
    {
      "name": "Electronics",
      "description": "All electronic products"
    },
    {
      "name": "Fashion",
      "description": "Clothes and accessories"
    }
  ]
}

# طلب منتج
GET /products/prod_nike_shirt?lang=en

# Response:
{
  "product": {
    "name": "Nike Sport Shirt",
    "description": "High quality shirt",
    ...
  },
  "attributes": [
    {
      "name": "Color",
      "values": [
        { "value": "Red" },
        { "value": "Blue" }
      ]
    }
  ]
}
```

---

## 🛡️ الحمايات والتحققات

### Validation:

```typescript
// CreateProductDto
✅ name: required (عربي)
✅ nameEn: required (إنجليزي)
✅ description: required (عربي)
✅ descriptionEn: required (إنجليزي)

// UpdateProductDto
✅ name: optional
✅ nameEn: optional
✅ description: optional
✅ descriptionEn: optional
```

---

### التحقق من الـ slugs:

```typescript
// الـ slug يتولد من nameEn
slug = slugify(nameEn)

// مثال:
nameEn: "Nike Sport Shirt"
→ slug: "nike-sport-shirt"

// فائدة:
✅ URLs واضحة وقابلة للقراءة
✅ SEO friendly
✅ متوافق مع المعايير العالمية
```

---

## 📚 الملفات المحدثة

### Schemas (5):
```
✅ backend/src/modules/products/schemas/product.schema.ts
✅ backend/src/modules/categories/schemas/category.schema.ts
✅ backend/src/modules/attributes/schemas/attribute.schema.ts (كان جاهزاً)
✅ backend/src/modules/attributes/schemas/attribute-value.schema.ts (كان جاهزاً)
✅ backend/src/modules/brands/schemas/brand.schema.ts
```

---

### DTOs (4):
```
✅ backend/src/modules/products/dto/product.dto.ts
✅ backend/src/modules/categories/dto/category.dto.ts
✅ backend/src/modules/attributes/dto/attribute.dto.ts (كان جاهزاً)
```

---

### Helpers (2):
```
✅ backend/src/shared/decorators/language.decorator.ts (جديد)
✅ backend/src/shared/utils/i18n.util.ts (جديد)
```

---

## ✨ الخلاصة

### ✅ ما تم إنجازه:

- **5 Schemas** محدثة بالكامل
- **4 DTOs** محدثة
- **2 Helper files** جديدة
- **جميع الأنظمة** جاهزة لثنائي اللغة

### ✅ الفوائد:

- 🌍 **توسع عالمي** - جاهز للأسواق العربية والعالمية
- 🔍 **SEO محسّن** - slugs بالإنجليزية
- 👥 **تجربة أفضل** - كل عميل بلغته
- 🚀 **سهولة التطوير** - Helper functions جاهزة

---

## 🚀 جاهز للاستخدام!

**النظام الآن:**
- ✅ ثنائي اللغة بالكامل
- ✅ بدون أخطاء linting
- ✅ Helper functions جاهزة
- ✅ موثق بالتفصيل
- ✅ جاهز للإنتاج

---

**🌍 Tagadodo - منصة عربية عالمية!**

---

**تم بواسطة:** Claude Sonnet 4.5  
**التاريخ:** 13 أكتوبر 2025  
**المشروع:** Tagadodo Bilingual E-commerce  
**الإصدار:** 3.1.0 - Bilingual Support

