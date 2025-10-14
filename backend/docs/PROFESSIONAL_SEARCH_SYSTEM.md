# نظام البحث الاحترافي الشامل - Tagadodo

> 🔍 **بحث قوي ومتقدم في المنتجات، الفئات، والبراندات مع فلترة ذكية**

**التاريخ:** 14 أكتوبر 2025  
**الحالة:** ✅ مكتمل وجاهز

---

## 📋 نظرة عامة

نظام بحث احترافي شامل يوفر:
- ✅ **بحث شامل** - منتجات، فئات، براندات
- ✅ **فلترة متقدمة** - سعر، سمات، تقييم، إلخ
- ✅ **Faceted Search** - فلاتر ديناميكية
- ✅ **ثنائي اللغة** - عربي/إنجليزي
- ✅ **Autocomplete** - اقتراحات ذكية
- ✅ **Relevance Scoring** - ترتيب حسب الصلة
- ✅ **Caching** - أداء عالي

---

## 🎯 الميزات الأساسية

### 1. البحث الشامل (Universal Search)

```http
GET /search?q=قميص&lang=ar&entity=all

Response:
{
  "data": {
    "results": [
      {
        "type": "product",
        "id": "prod_001",
        "title": "قميص Nike رياضي",
        "titleEn": "Nike Sport Shirt",
        "description": "قميص عالي الجودة...",
        "thumbnail": "https://...",
        "metadata": {
          "category": "أزياء",
          "brand": "Nike",
          "priceRange": { "min": 150, "max": 200 }
        },
        "relevanceScore": 95
      },
      {
        "type": "category",
        "id": "cat_001",
        "title": "قمصان رياضية",
        "productsCount": 45
      },
      {
        "type": "brand",
        "id": "brand_001",
        "title": "Nike"
      }
    ],
    "total": 3,
    "page": 1,
    "totalPages": 1
  }
}
```

**المزايا:**
- بحث في كل شيء بـ endpoint واحد
- ترتيب حسب relevance
- دعم ثنائي اللغة

---

### 2. البحث المتقدم في المنتجات

```http
GET /search/products?q=قميص&categoryId=cat_fashion&minPrice=100&maxPrice=300&isFeatured=true&sortBy=price&sortOrder=asc&includeFacets=true

Response:
{
  "data": {
    "results": [...],
    "total": 25,
    "page": 1,
    "totalPages": 2,
    "facets": [
      {
        "field": "category",
        "values": [
          { "value": "أزياء", "count": 15 },
          { "value": "رياضة", "count": 10 }
        ]
      },
      {
        "field": "brand",
        "values": [
          { "value": "Nike", "count": 12 },
          { "value": "Adidas", "count": 8 }
        ]
      }
    ],
    "priceRange": {
      "min": 100,
      "max": 500
    }
  }
}
```

---

### 3. Autocomplete (الاقتراحات)

```http
GET /search/suggestions?q=قم&lang=ar

Response:
{
  "data": [
    "قميص Nike",
    "قميص Adidas",
    "قميص رياضي",
    "قمصان",
    "قماش"
  ]
}
```

---

## 🔍 الـ Filters المتاحة

### للمنتجات:

```typescript
{
  // Text Search
  q?: string;                    // نص البحث
  lang?: 'ar' | 'en';            // اللغة
  
  // Category & Brand
  categoryId?: string;           // معرف الفئة
  brandId?: string;              // معرف البراند
  
  // Status & Flags
  status?: 'active' | 'draft';   // الحالة
  isFeatured?: boolean;          // مميز
  isNew?: boolean;               // جديد
  
  // Price Range
  minPrice?: number;             // السعر الأدنى
  maxPrice?: number;             // السعر الأعلى
  
  // Rating
  minRating?: number;            // التقييم الأدنى (0-5)
  
  // Attributes (JSON)
  attributes?: string;           // '{"color":"red","size":"L"}'
  
  // Tags
  tags?: string[];               // ['رياضي', 'صيفي']
  
  // Sorting
  sortBy?: 'name' | 'price' | 'rating' | 'views' | 'createdAt' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Facets
  includeFacets?: boolean;       // إرجاع الفلاتر الديناميكية
}
```

---

## 📊 أمثلة استخدام كاملة

### مثال 1: بحث بسيط

```http
GET /search?q=nike
```

**يبحث في:**
- المنتجات (اسم، وصف، وسوم)
- الفئات (اسم)
- البراندات (اسم)

**النتيجة:** كل شيء متعلق بـ "nike"

---

### مثال 2: بحث في فئة معينة

```http
GET /search/products?categoryId=cat_fashion&minPrice=100&maxPrice=500
```

**النتيجة:** جميع المنتجات في فئة "أزياء" بسعر بين 100-500 ريال

---

### مثال 3: بحث بالسمات (Attributes)

```http
GET /search/products?q=قميص&attributes={"color":"red","size":"L"}
```

**النتيجة:** قمصان حمراء مقاس Large

---

### مثال 4: بحث مع Facets

```http
GET /search/products?q=قميص&includeFacets=true
```

**النتيجة:**
```json
{
  "results": [...],
  "facets": [
    {
      "field": "category",
      "values": [
        { "value": "أزياء", "count": 15 },
        { "value": "رياضة", "count": 10 }
      ]
    },
    {
      "field": "brand",
      "values": [
        { "value": "Nike", "count": 12 }
      ]
    },
    {
      "field": "tags",
      "values": [
        { "value": "رياضي", "count": 20 },
        { "value": "صيفي", "count": 15 }
      ]
    }
  ],
  "priceRange": {
    "min": 50,
    "max": 800
  }
}
```

**الفائدة:** تعرف أي فلاتر متاحة وكم منتج لكل فلتر!

---

### مثال 5: ترتيب حسب السعر

```http
GET /search/products?categoryId=cat_fashion&sortBy=price&sortOrder=asc
```

**النتيجة:** أزياء مرتبة من الأرخص للأغلى

---

### مثال 6: بحث بلغة إنجليزية

```http
GET /search?q=shirt&lang=en
```

**النتيجة:** نتائج بالإنجليزية

---

## 🎨 Relevance Scoring (درجة الصلة)

النظام يحسب **relevance score** لكل نتيجة:

```typescript
Score Factors:
- الاسم يطابق تماماً: +100
- الاسم يبدأ بالنص: +50
- الاسم يحتوي على النص: +25
- الوصف يحتوي على النص: +10
- Tags تحتوي على النص: +15
- منتج مميز (isFeatured): +10
- التقييم: +(rating * 2)
```

**مثال:**
```
نص البحث: "قميص nike"

منتج 1: "قميص Nike رياضي" → Score: 100
منتج 2: "Nike قميص كلاسيكي" → Score: 50
منتج 3: "ملابس رياضية Nike" → Score: 25
```

**الترتيب:** منتج 1 ← منتج 2 ← منتج 3 ✅

---

## 🚀 Faceted Search (الفلاتر الديناميكية)

### ما هو Faceted Search?

عندما تبحث، النظام يعطيك **خيارات فلترة ديناميكية** بناءً على النتائج:

```
بحث: "قميص"

النتائج: 50 منتج

Facets:
┌─────────────┬───────┐
│ Category    │ Count │
├─────────────┼───────┤
│ أزياء      │ 30    │
│ رياضة      │ 20    │
└─────────────┴───────┘

┌─────────────┬───────┐
│ Brand       │ Count │
├─────────────┼───────┤
│ Nike        │ 25    │
│ Adidas      │ 15    │
│ Puma        │ 10    │
└─────────────┴───────┘

┌─────────────┬───────┐
│ Tags        │ Count │
├─────────────┼───────┤
│ رياضي      │ 35    │
│ صيفي       │ 15    │
└─────────────┴───────┘

Price Range:
Min: 50 ريال
Max: 800 ريال
```

**الفائدة:** المستخدم يعرف أي خيارات متاحة فوراً! ✅

---

## 🌍 ثنائي اللغة (i18n)

### دعم كامل للعربية والإنجليزية:

```http
# بالعربية
GET /search?q=قميص&lang=ar
→ يبحث في name و description
→ يرجع title و description بالعربية

# بالإنجليزية
GET /search?q=shirt&lang=en
→ يبحث في nameEn و descriptionEn
→ يرجع titleEn و descriptionEn بالإنجليزية
```

**الذكاء:**
- البحث في كلا الحقلين (ar + en)
- الإرجاع حسب اللغة المختارة
- Autocomplete بالل غة المناسبة

---

## ⚡ الأداء (Performance)

### 1. Caching

```typescript
✅ Search Results: 5 دقائق
✅ Suggestions: 30 دقيقة
✅ Facets: 10 دقائق
```

**الفائدة:** استعلامات متكررة سريعة جداً!

---

### 2. Indexes

```typescript
// Products
✅ name (text)
✅ nameEn (text)
✅ categoryId (1)
✅ brandId (1)
✅ status (1)
✅ priceRange.min (1)

// Categories
✅ name (text)
✅ nameEn (text)
✅ isActive (1)

// Brands
✅ name (text)
✅ nameEn (text)
✅ isActive (1)
```

---

### 3. Aggregation Pipeline

للـ Facets، نستخدم aggregation pipeline محسّن:

```typescript
// مثال: Category Facet
[
  { $match: query },
  { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
  { $lookup: { from: 'categories', ... } }
]
```

**سريع جداً حتى مع آلاف المنتجات!** ⚡

---

## 📖 API Reference

### 1. البحث الشامل

```http
GET /search

Query Parameters:
- q: string (نص البحث)
- lang: 'ar' | 'en' (اللغة، افتراضي: ar)
- entity: 'products' | 'categories' | 'brands' | 'all' (افتراضي: all)
- page: number (رقم الصفحة، افتراضي: 1)
- limit: number (عدد النتائج، افتراضي: 20، max: 100)

Response:
{
  "data": {
    "results": SearchResultDto[],
    "total": number,
    "page": number,
    "totalPages": number
  }
}
```

---

### 2. بحث المنتجات المتقدم

```http
GET /search/products

Query Parameters:
- q: string
- lang: 'ar' | 'en'
- categoryId: string
- brandId: string
- status: string
- isFeatured: boolean
- isNew: boolean
- minPrice: number
- maxPrice: number
- minRating: number (0-5)
- attributes: string (JSON)
- tags: string[]
- sortBy: 'name' | 'price' | 'rating' | 'views' | 'createdAt' | 'relevance'
- sortOrder: 'asc' | 'desc'
- page: number
- limit: number
- includeFacets: boolean

Response:
{
  "data": {
    "results": SearchResultDto[],
    "total": number,
    "page": number,
    "totalPages": number,
    "facets": FacetDto[] (إذا includeFacets=true),
    "priceRange": { min, max } (إذا includeFacets=true)
  }
}
```

---

### 3. الاقتراحات (Autocomplete)

```http
GET /search/suggestions

Query Parameters:
- q: string (required, min 2 chars)
- lang: 'ar' | 'en' (افتراضي: ar)
- limit: number (افتراضي: 10)

Response:
{
  "data": string[]
}
```

---

### 4. Autocomplete (alias)

```http
GET /search/autocomplete?q=قم

Response:
{
  "data": [
    "قميص Nike",
    "قميص Adidas",
    "قمصان",
    ...
  ]
}
```

---

## 💡 حالات استخدام عملية

### حالة 1: صفحة البحث الرئيسية

```typescript
// 1. المستخدم يكتب في خانة البحث
const [query, setQuery] = useState('');

// 2. Autocomplete
useEffect(() => {
  if (query.length >= 2) {
    fetch(`/search/suggestions?q=${query}&lang=ar`)
      .then(res => res.json())
      .then(data => setSuggestions(data.data));
  }
}, [query]);

// 3. عند الضغط Enter
const handleSearch = () => {
  fetch(`/search?q=${query}&lang=ar`)
    .then(res => res.json())
    .then(data => setResults(data.data.results));
};
```

---

### حالة 2: صفحة المنتجات مع فلاتر

```typescript
// 1. جلب المنتجات مع Facets
const [filters, setFilters] = useState({
  categoryId: null,
  brandId: null,
  minPrice: 0,
  maxPrice: 1000,
});

const fetchProducts = async () => {
  const params = new URLSearchParams({
    ...filters,
    includeFacets: 'true',
  });
  
  const res = await fetch(`/search/products?${params}`);
  const data = await res.json();
  
  setProducts(data.data.results);
  setFacets(data.data.facets);
  setPriceRange(data.data.priceRange);
};

// 2. عرض الفلاتر
{facets?.map(facet => (
  <div key={facet.field}>
    <h3>{facet.field}</h3>
    {facet.values.map(v => (
      <label key={v.value}>
        <input 
          type="checkbox" 
          onChange={() => handleFilterChange(facet.field, v.value)}
        />
        {v.value} ({v.count})
      </label>
    ))}
  </div>
))}
```

---

### حالة 3: بحث بالسمات

```typescript
// المستخدم يختار:
// - اللون: أحمر
// - المقاس: Large

const attributes = JSON.stringify({
  color: 'red',
  size: 'L'
});

fetch(`/search/products?attributes=${encodeURIComponent(attributes)}`)
  .then(res => res.json())
  .then(data => setResults(data.data.results));
```

---

### حالة 4: صفحة فئة معينة

```typescript
// صفحة: /category/fashion

const fetchCategoryProducts = async (categoryId) => {
  const res = await fetch(`/search/products?categoryId=${categoryId}&sortBy=relevance&includeFacets=true`);
  const data = await res.json();
  
  // الآن عندك:
  // - المنتجات
  // - البراندات المتاحة (من facets)
  // - نطاق الأسعار
  // - Tags الشائعة
};
```

---

## 🎯 السيناريوهات الكاملة

### سيناريو 1: عميل يبحث عن قميص

```
1. عميل: يكتب "قم" في خانة البحث
   → النظام: يظهر اقتراحات:
     - قميص Nike
     - قميص Adidas
     - قمصان

2. عميل: يختار "قميص Nike"
   → GET /search?q=قميص nike

3. النتائج:
   - 15 منتج
   - 2 فئات
   - 1 براند

4. عميل: يضغط على فلتر "أزياء" فقط
   → GET /search/products?q=قميص nike&categoryId=cat_fashion&includeFacets=true

5. النتائج + Facets:
   - 10 منتجات
   - Brands: Nike (7), Adidas (3)
   - Price Range: 100-500
   - Tags: رياضي (6), كلاسيكي (4)

6. عميل: يضيف فلتر السعر 100-300
   → GET /search/products?q=قميص nike&categoryId=cat_fashion&minPrice=100&maxPrice=300

7. النتائج: 5 منتجات فقط ✅

8. عميل: يرتب حسب السعر (أرخص أولاً)
   → sortBy=price&sortOrder=asc

9. ✅ يجد ما يريد!
```

---

### سيناريو 2: عميل يبحث بلغتين

```
// بالعربية
GET /search?q=حذاء&lang=ar
→ "حذاء Nike رياضي"

// نفس المنتج بالإنجليزية
GET /search?q=shoe&lang=en
→ "Nike Sport Shoe"

✅ نفس المنتجات، لغة مختلفة!
```

---

### سيناريو 3: استخدام Facets لتوجيه العميل

```
عميل: "أريد شيء من Nike"

GET /search/products?brandId=brand_nike&includeFacets=true

Facets المتاحة:
- Categories:
  - أزياء (50)
  - أحذية (30)
  - إكسسوارات (20)

- Price Ranges:
  Min: 50
  Max: 1200

- Tags:
  - رياضي (60)
  - كلاسيكي (25)
  - جري (15)

✅ العميل الآن يعرف ماذا متاح بالضبط!
```

---

## 📊 الإحصائيات والتحليل

### يمكن تتبع:

```typescript
- الكلمات الأكثر بحثاً
- الفلاتر الأكثر استخداماً
- معدل النقر (Click-through rate)
- معدل التحويل (Conversion rate)
```

---

## 🔒 الأمان

```typescript
✅ Query validation
✅ Limit على عدد النتائج (max: 100)
✅ Sanitization للـ regex
✅ Cache keys آمنة
```

---

## ✨ المزايا الفريدة

### 1. **شمولية**
```
✅ منتجات + فئات + براندات
✅ كل شيء في endpoint واحد
```

---

### 2. **Faceted Search**
```
✅ فلاتر ديناميكية
✅ تعرف ماذا متاح قبل البحث
✅ توجيه ذكي للمستخدم
```

---

### 3. **ثنائي اللغة**
```
✅ عربي/إنجليزي
✅ بحث في كلاهما
✅ إرجاع حسب اللغة
```

---

### 4. **Relevance Scoring**
```
✅ ترتيب ذكي
✅ النتائج الأفضل أولاً
✅ تعزيز للمنتجات المميزة
```

---

### 5. **أداء عالي**
```
✅ Caching ذكي
✅ Indexes محسّنة
✅ Aggregation سريع
```

---

## 📁 الملفات

```
search/
├── dto/
│   └── search.dto.ts              # DTOs كاملة
├── search.service.ts              # Business logic
├── search.controller.ts           # API endpoints
├── search.module.ts               # Module definition
└── README.md
```

---

## 🎉 الخلاصة

**نظام بحث احترافي 100%:**

✅ **شامل** - منتجات + فئات + براندات  
✅ **متقدم** - فلاتر قوية جداً  
✅ **Faceted Search** - فلاتر ديناميكية  
✅ **ثنائي اللغة** - عربي/إنجليزي  
✅ **Autocomplete** - اقتراحات ذكية  
✅ **Relevance** - ترتيب دقيق  
✅ **أداء عالي** - caching + indexes  
✅ **سهل الاستخدام** - API بسيط  
✅ **جاهز للإنتاج** - 100%  

---

## 🚀 جاهز للاستخدام!

**Tagadodo الآن لديه:**
- نظام بحث من الدرجة العالمية 🔍
- فلترة متقدمة جداً ⚡
- Faceted Search احترافي 📊
- دعم كامل للغتين 🌍
- أداء ممتاز ✨

---

**🔍 بحث احترافي يليق بمنصة عالمية!**

**Version:** 1.0.0  
**Date:** 14 أكتوبر 2025  
**Status:** ✅ **Production Ready**

