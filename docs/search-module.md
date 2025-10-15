## موديول البحث (Search Module)

### ما الهدف؟
- **الغرض**: تقديم بحث موحّد ومرن عن المنتجات والفئات والبراندات، مع فلاتر متقدمة، Facets، واقتراحات (Autocomplete)، ودعم لغتين.
- **المكان**: `backend/src/modules/search/`.

### المكونات
- **SearchModule**: يهيئ مخططات `Product`, `Category`, `Brand` ويضم `CacheModule`.
- **SearchController**: يعرّف واجهات البحث العامة تحت `search/`.
- **SearchService**: منطق البحث، بناء الاستعلامات، الترتيب بالملاءمة، توليد الـ facets، الكاش.

### الـ Endpoints
- بحث شامل (Products/Categories/Brands/All):
  - `GET /search?q=&lang=ar|en&entity=products|categories|brands|all&page=&limit=`

- بحث منتجات متقدم مع فلاتر وFacets:
  - `GET /search/products?q=&lang=ar|en&categoryId=&brandId=&status=&isFeatured=&isNew=&minPrice=&maxPrice=&minRating=&attributes={...}&tags=[]&sortBy=&sortOrder=&includeFacets=&page=&limit=`

- اقتراحات البحث (Autocomplete):
  - `GET /search/suggestions?q=&lang=ar|en&limit=`
  - (Alias) `GET /search/autocomplete?q=&lang=ar|en`

### أمثلة استخدام
- بحث موحّد:
```http
GET /search?q=nike&lang=ar&entity=all
```

- بحث منتجات متقدم مع Facets:
```http
GET /search/products?q=قميص&categoryId=cat_001&minPrice=100&maxPrice=500&sortBy=price&sortOrder=asc&includeFacets=true
```

- فلترة بالسمات (attributes كـ JSON):
```http
GET /search/products?attributes={"color":"red","size":"L"}
```

- اقتراحات:
```http
GET /search/suggestions?q=قم&lang=ar&limit=10
```

### آلية العمل باختصار
1) بناء استعلام مرن حسب النص والفلاتر (حالة، فئة، براند، تقييم، وسوم، سمات JSON، نطاق سعر من `priceRange`).
2) ترتيب النتائج حسب الملاءمة أو وفق `sortBy`/`sortOrder` (الاسم/السعر/التقييم/المشاهدات/التاريخ).
3) Facets ديناميكية (فئات/براندات/وسوم) عبر Aggregation، ونطاق سعر إجمالي.
4) كاش للنتائج والاقتراحات لتحسين الأداء (`CacheModule`).

### أفضل الممارسات
- مرّر `lang` لتكييف العناوين مع اللغة.
- استخدم `includeFacets=true` عند الحاجة لفلاتر جانبية.
- حافظ على `page` و`limit` معقولة للأداء.
- لا ترسل نصًا أقل من حرفين للاقترحات.


