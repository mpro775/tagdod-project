# Search Module

> 🔍 **نظام بحث احترافي شامل مع فلترة متقدمة**

---

## نظرة عامة

نظام بحث قوي يتيح:
- ✅ بحث شامل (منتجات، فئات، براندات)
- ✅ فلترة متقدمة (سعر، سمات، تقييم)
- ✅ Faceted Search (فلاتر ديناميكية)
- ✅ ثنائي اللغة (عربي/إنجليزي)
- ✅ Autocomplete (اقتراحات ذكية)
- ✅ Relevance Scoring (ترتيب دقيق)

---

## API Endpoints

### 1. البحث الشامل
```http
GET /search?q=nike&lang=ar&entity=all
```

### 2. بحث المنتجات المتقدم
```http
GET /search/products?q=قميص&categoryId=cat_001&minPrice=100&maxPrice=500&includeFacets=true
```

### 3. الاقتراحات
```http
GET /search/suggestions?q=قم&lang=ar
```

### 4. Autocomplete
```http
GET /search/autocomplete?q=nike
```

---

## الميزات

### Filters المتاحة:
- Text search (نص)
- Category & Brand (فئة وبراند)
- Price range (نطاق السعر)
- Rating (تقييم)
- Attributes (سمات JSON)
- Tags (وسوم)
- Status (حالة)
- Featured/New flags

### Sorting:
- name, price, rating, views, createdAt, relevance

### Faceted Search:
```json
{
  "facets": [
    {
      "field": "category",
      "values": [
        { "value": "أزياء", "count": 15 }
      ]
    }
  ],
  "priceRange": { "min": 50, "max": 800 }
}
```

---

## الاستخدام

### بحث بسيط:
```typescript
GET /search?q=nike
```

### بحث متقدم:
```typescript
GET /search/products?q=قميص&categoryId=cat_fashion&minPrice=100&maxPrice=300&sortBy=price&sortOrder=asc
```

### بحث بالسمات:
```typescript
GET /search/products?attributes={"color":"red","size":"L"}
```

---

## الأداء

- ✅ Caching (5-30 دقيقة)
- ✅ Indexes محسّنة
- ✅ Aggregation سريع
- ✅ Query optimization

---

## للتوثيق الكامل

اقرأ: [`PROFESSIONAL_SEARCH_SYSTEM.md`](../../../PROFESSIONAL_SEARCH_SYSTEM.md)

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready
