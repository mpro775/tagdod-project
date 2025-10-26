# Search Module

> 🔍 **نظام بحث احترافي شامل مع فلترة متقدمة وتحليلات Admin**

---

## نظرة عامة

نظام بحث قوي يتيح:
- ✅ بحث شامل (منتجات، فئات، براندات)
- ✅ فلترة متقدمة (سعر، سمات، تقييم)
- ✅ Faceted Search (فلاتر ديناميكية)
- ✅ ثنائي اللغة (عربي/إنجليزي)
- ✅ Autocomplete (اقتراحات ذكية)
- ✅ Relevance Scoring (ترتيب دقيق)
- ✅ **إحصائيات وتحليلات للأدمن** 🆕

---

## API Endpoints

### 👤 User Endpoints (عامة)

**Base URL:** `/search`

جميع المسارات أدناه متاحة للمستخدمين للبحث في المنتجات والمحتوى.

### 🔐 Admin Endpoints (محمية - Admin Only)

**Base URL:** `/admin/search`

**الصلاحيات المطلوبة:**
- `AdminPermission.ANALYTICS_READ`
- `AdminPermission.SYSTEM_MAINTENANCE` (للكاش فقط)
- `AdminPermission.ADMIN_ACCESS`

**الأدوار المسموحة:** `ADMIN`, `SUPER_ADMIN`

**عدد المسارات:** 10 endpoints

📖 **[التوثيق الكامل لـ Admin API](./ADMIN_API_DOCUMENTATION.md)**

#### ملخص سريع - Admin Endpoints:

**الإحصائيات والتحليلات:**
1. `GET /admin/search/stats` - إحصائيات شاملة
2. `GET /admin/search/top-terms` - الكلمات الأكثر بحثاً
3. `GET /admin/search/zero-results` - بحث بدون نتائج
4. `GET /admin/search/trends` - اتجاهات البحث عبر الزمن

**سجلات وتحليل:**
5. `GET /admin/search/logs` - سجلات عمليات البحث
6. `GET /admin/search/most-searched-products` - المنتجات الأكثر ظهوراً
7. `GET /admin/search/most-searched-categories` - الفئات الأكثر بحثاً
8. `GET /admin/search/most-searched-brands` - العلامات التجارية الشائعة

**النظام والأداء:**
9. `GET /admin/search/performance` - مؤشرات أداء البحث
10. `POST /admin/search/clear-cache` - مسح ذاكرة التخزين المؤقت

---

## User API Endpoints

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

## ✅ حالة النظام

**نظام Search مكتمل بالكامل ويعمل كما هو موثق:**
- ✅ بحث شامل عبر المنتجات والفئات والبراندات
- ✅ فلترة متقدمة شاملة (سعر، سمات، تقييم، حالة)
- ✅ Faceted Search مع فلاتر ديناميكية
- ✅ دعم ثنائي اللغة كامل
- ✅ Autocomplete و Suggestions ذكية
- ✅ Relevance Scoring متقدم
- ✅ Caching و تحسينات الأداء
- ✅ جميع APIs مطبقة وتعمل

**النظام جاهز للإنتاج ولا يحتاج تحديثات إضافية!**

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
