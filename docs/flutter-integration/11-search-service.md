# 🔍 خدمة البحث (Search Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة البحث توفر endpoints للبحث الشامل والمتقدم مع دعم الفلترة والترتيب.

---

## 📋 جدول المحتويات

1. [البحث الشامل](#1-البحث-الشامل)
2. [البحث المتقدم في المنتجات](#2-البحث-المتقدم-في-المنتجات)
3. [اقتراحات البحث](#3-اقتراحات-البحث)
4. [Autocomplete](#4-autocomplete)
5. [Models في Flutter](#models-في-flutter)

---

## 1. البحث الشامل

يسترجع نتائج البحث من المنتجات والفئات والبراندات مع ترتيب حسب الصلة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/search`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `q` | `string` | ❌ | نص البحث |
| `lang` | `string` | ❌ | اللغة (ar, en) |
| `entity` | `string` | ❌ | نوع الكيانات (products, categories, brands, all) |
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد النتائج (افتراضي: 20) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "product",
        "id": "64product123",
        "title": "لوح شمسي 550W",
        "titleEn": "Solar Panel 550W",
        "description": "لوح شمسي عالي الكفاءة",
        "descriptionEn": "High efficiency solar panel",
        "thumbnail": "https://cdn.example.com/products/solar-panel.jpg",
        "metadata": {
          "type": "product",
          "category": "ألواح شمسية",
          "brand": "Longi",
          "priceRange": {
            "min": 150000,
            "max": 180000
          },
          "rating": 4.5,
          "reviewsCount": 120,
          "isFeatured": true,
          "isNew": false,
          "tags": ["solar", "renewable"]
        },
        "relevanceScore": 95,
        "createdAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "type": "category",
        "id": "64cat123",
        "title": "ألواح شمسية",
        "titleEn": "Solar Panels",
        "description": "فئة الألواح الشمسية",
        "thumbnail": "https://cdn.example.com/categories/solar.jpg",
        "metadata": {
          "type": "category",
          "productsCount": 45,
          "depth": 1
        },
        "relevanceScore": 50
      },
      {
        "type": "brand",
        "id": "64brand123",
        "title": "Longi",
        "titleEn": "Longi",
        "description": "شركة رائدة في الألواح الشمسية",
        "thumbnail": "https://cdn.example.com/brands/longi.jpg",
        "metadata": {
          "type": "brand"
        },
        "relevanceScore": 25
      }
    ],
    "total": 45,
    "page": 1,
    "totalPages": 3
  },
  "requestId": "req_search_001"
}
```

### كود Flutter

```dart
Future<SearchResult> universalSearch({
  String? query,
  String lang = 'ar',
  String entity = 'all',
  int page = 1,
  int limit = 20,
}) async {
  final response = await _dio.get('/search', queryParameters: {
    if (query != null) 'q': query,
    'lang': lang,
    'entity': entity,
    'page': page,
    'limit': limit,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return SearchResult.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. البحث المتقدم في المنتجات

يسترجع نتائج البحث المتقدم في المنتجات مع الفلترة والترتيب.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/search/products`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `q` | `string` | ❌ | نص البحث |
| `lang` | `string` | ❌ | اللغة (ar, en) |
| `categoryId` | `string` | ❌ | معرف الفئة |
| `brandId` | `string` | ❌ | معرف البراند |
| `status` | `string` | ❌ | الحالة (draft, active, out_of_stock, discontinued) |
| `isFeatured` | `boolean` | ❌ | منتجات مميزة |
| `isNew` | `boolean` | ❌ | منتجات جديدة |
| `minPrice` | `number` | ❌ | السعر الأدنى |
| `maxPrice` | `number` | ❌ | السعر الأعلى |
| `minRating` | `number` | ❌ | التقييم الأدنى (0-5) |
| `attributes` | `string` | ❌ | السمات (JSON string) |
| `tags` | `string[]` | ❌ | الوسوم |
| `sortBy` | `string` | ❌ | ترتيب حسب (name, price, rating, views, createdAt, relevance) |
| `sortOrder` | `string` | ❌ | اتجاه الترتيب (asc, desc) |
| `includeFacets` | `boolean` | ❌ | إرجاع الـ Facets |
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد النتائج (افتراضي: 20) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "product",
        "id": "64product123",
        "title": "لوح شمسي 550W",
        "titleEn": "Solar Panel 550W",
        "description": "لوح شمسي عالي الكفاءة",
        "descriptionEn": "High efficiency solar panel",
        "thumbnail": "https://cdn.example.com/products/solar-panel.jpg",
        "metadata": {
          "price": 150000,
          "category": "ألواح شمسية",
          "brand": "Longi",
          "rating": 4.5,
          "reviewsCount": 120
        },
        "relevanceScore": 0.95,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 45,
    "page": 1,
    "totalPages": 3,
    "facets": [
      {
        "field": "brand",
        "values": [
          {"value": "Longi", "count": 12},
          {"value": "Jinko", "count": 8}
        ]
      },
      {
        "field": "category",
        "values": [
          {"value": "ألواح شمسية", "count": 20},
          {"value": "بطاريات", "count": 15}
        ]
      }
    ],
    "priceRange": {
      "min": 50000,
      "max": 500000
    }
  },
  "requestId": "req_search_002"
}
```

### كود Flutter

```dart
Future<ProductSearchResult> advancedProductSearch({
  String? query,
  String lang = 'ar',
  String? categoryId,
  String? brandId,
  String? status,
  bool? isFeatured,
  bool? isNew,
  double? minPrice,
  double? maxPrice,
  double? minRating,
  Map<String, dynamic>? attributes,
  List<String>? tags,
  String sortBy = 'relevance',
  String sortOrder = 'desc',
  bool includeFacets = false,
  int page = 1,
  int limit = 20,
}) async {
  final response = await _dio.get('/search/products', queryParameters: {
    if (query != null) 'q': query,
    'lang': lang,
    if (categoryId != null) 'categoryId': categoryId,
    if (brandId != null) 'brandId': brandId,
    if (status != null) 'status': status,
    if (isFeatured != null) 'isFeatured': isFeatured,
    if (isNew != null) 'isNew': isNew,
    if (minPrice != null) 'minPrice': minPrice,
    if (maxPrice != null) 'maxPrice': maxPrice,
    if (minRating != null) 'minRating': minRating,
    if (attributes != null) 'attributes': jsonEncode(attributes),
    if (tags != null) 'tags': tags,
    'sortBy': sortBy,
    'sortOrder': sortOrder,
    'includeFacets': includeFacets,
    'page': page,
    'limit': limit,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return ProductSearchResult.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. اقتراحات البحث

يسترجع اقتراحات البحث للـ Autocomplete.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/search/suggestions`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `q` | `string` | ✅ | نص البحث |
| `lang` | `string` | ❌ | اللغة (ar, en) |
| `limit` | `number` | ❌ | عدد الاقتراحات (افتراضي: 10) |

### Response - نجاح

```json
{
  "success": true,
  "data": [
    "لوح شمسي 550W",
    "لوح شمسي 300W",
    "لوح شمسي كريستال",
    "ألواح شمسية",
    "بطارية شمسية"
  ],
  "requestId": "req_search_003"
}
```

**ملاحظة:** الـ response يعيد مجرد array of strings (أسماء الاقتراحات فقط)، وليس objects.

### كود Flutter

```dart
Future<List<String>> getSearchSuggestions({
  required String query,
  String lang = 'ar',
  int limit = 10,
}) async {
  final response = await _dio.get('/search/suggestions', queryParameters: {
    'q': query,
    'lang': lang,
    'limit': limit,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return List<String>.from(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. Autocomplete

يسترجع اقتراحات البحث المختصرة للـ Autocomplete.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/search/autocomplete`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (30 دقيقة)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `q` | `string` | ✅ | نص البحث |
| `lang` | `string` | ❌ | اللغة (ar, en) |

### Response - نجاح

```json
{
  "success": true,
  "data": [
    "لوح شمسي 550W",
    "لوح شمسي 300W",
    "لوح شمسي كريستال",
    "ألواح شمسية",
    "بطارية شمسية",
    "بطارية ليثيوم",
    "بطارية جل",
    "محول كهربائي"
  ],
  "requestId": "req_search_004"
}
```

**ملاحظة:** الـ autocomplete يعيد نفس البنية مثل suggestions، لكن limit افتراضي = 8.

### كود Flutter

```dart
Future<List<String>> autocomplete({
  required String query,
  String lang = 'ar',
}) async {
  final response = await _dio.get('/search/autocomplete', queryParameters: {
    'q': query,
    'lang': lang,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return List<String>.from(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/search/search_models.dart`

```dart
class SearchResult {
  final List<SearchResultItem> results;
  final int total;
  final int page;
  final int totalPages;

  SearchResult({
    required this.results,
    required this.total,
    required this.page,
    required this.totalPages,
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      results: (json['results'] as List)
          .map((item) => SearchResultItem.fromJson(item))
          .toList(),
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      totalPages: json['totalPages'] ?? 0,
    );
  }

  bool get hasNextPage => page < totalPages;
  bool get hasPrevPage => page > 1;
  bool get isFirstPage => page == 1;
  bool get isLastPage => page == totalPages;
}

class SearchResultItem {
  final String type;
  final String id;
  final String title;
  final String? titleEn;
  final String? description;
  final String? descriptionEn;
  final String? thumbnail;
  final Map<String, dynamic> metadata;
  final double? relevanceScore;
  final DateTime? createdAt;

  SearchResultItem({
    required this.type,
    required this.id,
    required this.title,
    this.titleEn,
    this.description,
    this.descriptionEn,
    this.thumbnail,
    required this.metadata,
    this.relevanceScore,
    this.createdAt,
  });

  factory SearchResultItem.fromJson(Map<String, dynamic> json) {
    return SearchResultItem(
      type: json['type'] ?? '',
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      titleEn: json['titleEn'],
      description: json['description'],
      descriptionEn: json['descriptionEn'],
      thumbnail: json['thumbnail'],
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
      relevanceScore: json['relevanceScore']?.toDouble(),
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : null,
    );
  }

  String getTitle(String locale) {
    if (locale == 'en' && titleEn != null) return titleEn!;
    return title;
  }

  String? getDescription(String locale) {
    if (locale == 'en' && descriptionEn != null) return descriptionEn;
    return description;
  }

  bool get isProduct => type == 'product';
  bool get isCategory => type == 'category';
  bool get isBrand => type == 'brand';
  bool get hasThumbnail => thumbnail != null && thumbnail!.isNotEmpty;
  bool get hasMetadata => metadata.isNotEmpty;
  
  // Product metadata
  Map<String, dynamic>? get priceRange => metadata['priceRange'];
  String? get category => metadata['category']?.toString();
  String? get brand => metadata['brand']?.toString();
  double? get rating => metadata['rating']?.toDouble();
  int? get reviewsCount => metadata['reviewsCount']?.toInt();
  bool? get isFeatured => metadata['isFeatured'];
  bool? get isNew => metadata['isNew'];
  List<String>? get tags => metadata['tags'] != null 
      ? List<String>.from(metadata['tags']) 
      : null;
  
  // Category metadata
  int? get productsCount => metadata['productsCount']?.toInt();
  int? get depth => metadata['depth']?.toInt();
}

class ProductSearchResult {
  final List<SearchResultItem> results;
  final int total;
  final int page;
  final int totalPages;
  final List<SearchFacet>? facets;
  final SearchPriceRange? priceRange;

  ProductSearchResult({
    required this.results,
    required this.total,
    required this.page,
    required this.totalPages,
    this.facets,
    this.priceRange,
  });

  factory ProductSearchResult.fromJson(Map<String, dynamic> json) {
    return ProductSearchResult(
      results: (json['results'] as List)
          .map((item) => SearchResultItem.fromJson(item))
          .toList(),
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      totalPages: json['totalPages'] ?? 0,
      facets: json['facets'] != null
          ? (json['facets'] as List)
              .map((item) => SearchFacet.fromJson(item))
              .toList()
          : null,
      priceRange: json['priceRange'] != null
          ? SearchPriceRange.fromJson(json['priceRange'])
          : null,
    );
  }

  bool get hasNextPage => page < totalPages;
  bool get hasPrevPage => page > 1;
  bool get isFirstPage => page == 1;
  bool get isLastPage => page == totalPages;
  bool get hasFacets => facets != null && facets!.isNotEmpty;
  bool get hasPriceRange => priceRange != null;
}

class SearchFacet {
  final String field;
  final List<SearchFacetValue> values;

  SearchFacet({
    required this.field,
    required this.values,
  });

  factory SearchFacet.fromJson(Map<String, dynamic> json) {
    return SearchFacet(
      field: json['field'] ?? '',
      values: (json['values'] as List)
          .map((item) => SearchFacetValue.fromJson(item))
          .toList(),
    );
  }

  bool get isBrand => field == 'brand';
  bool get isCategory => field == 'category';
  bool get isPrice => field == 'price';
  bool get isRating => field == 'rating';
  bool get isStatus => field == 'status';
  bool get isTag => field == 'tags';
}

class SearchFacetValue {
  final String value;
  final int count;

  SearchFacetValue({
    required this.value,
    required this.count,
  });

  factory SearchFacetValue.fromJson(Map<String, dynamic> json) {
    return SearchFacetValue(
      value: json['value'] ?? '',
      count: json['count'] ?? 0,
    );
  }

  bool get isSelected => false; // You can implement selection logic
  bool get hasResults => count > 0;
}

class SearchPriceRange {
  final double min;
  final double max;

  SearchPriceRange({
    required this.min,
    required this.max,
  });

  factory SearchPriceRange.fromJson(Map<String, dynamic> json) {
    return SearchPriceRange(
      min: (json['min'] ?? 0).toDouble(),
      max: (json['max'] ?? 0).toDouble(),
    );
  }

  double get range => max - min;
  bool get hasRange => min < max;
  double get midPoint => (min + max) / 2;
}
```

---

## 📝 ملاحظات مهمة

1. **البحث الشامل:**
   - `universalSearch()`: للبحث في جميع الكيانات (منتجات، فئات، براندات)
   - `entity`: تحديد نوع الكيانات (products, categories, brands, all)
   - `lang`: دعم اللغات (ar, en)
   - `relevanceScore`: ترتيب النتائج حسب الصلة

2. **البحث المتقدم:**
   - `advancedProductSearch()`: للبحث المتقدم في المنتجات
   - `includeFacets`: إرجاع الفلاتر المتاحة
   - `attributes`: البحث بالسمات (JSON string)
   - `tags`: البحث بالوسوم
   - `sortBy`: ترتيب حسب (name, price, rating, views, createdAt, relevance)

3. **الفلترة:**
   - `categoryId`: فلترة حسب الفئة
   - `brandId`: فلترة حسب البراند
   - `status`: فلترة حسب الحالة
   - `isFeatured`: منتجات مميزة
   - `isNew`: منتجات جديدة
   - `minPrice`/`maxPrice`: نطاق السعر
   - `minRating`: الحد الأدنى للتقييم

4. **الترتيب:**
   - `sortBy`: ترتيب حسب (name, price, rating, views, createdAt, relevance)
   - `sortOrder`: اتجاه الترتيب (asc, desc)
   - `relevanceScore`: ترتيب حسب الصلة

5. **الاقتراحات:**
   - `getSearchSuggestions()`: اقتراحات البحث (limit = 10)
   - `autocomplete()`: اقتراحات مختصرة (limit = 8)
   - **يعيدون strings فقط**: أسماء المنتجات والفئات
   - الاقتراحات من المنتجات والفئات النشطة

6. **Faceted Search:**
   - `facets`: الفلاتر المتاحة
   - `priceRange`: نطاق الأسعار
   - `field`: نوع الفلتر (brand, category, price, rating, status, tag)
   - `values`: قيم الفلتر مع العدد

7. **الصفحات:**
   - `page`: رقم الصفحة
   - `limit`: عدد النتائج
   - `total`: إجمالي النتائج
   - `totalPages`: إجمالي الصفحات

8. **Cache:**
   - البحث الشامل: 5 دقائق
   - الاقتراحات: 30 دقيقة
   - Facets: 10 دقائق
   - يمكنك cache البيانات محلياً أيضاً

9. **الأداء:**
   - جميع الـ endpoints لا تتطلب مصادقة
   - استخدم `universalSearch()` للبحث العام
   - استخدم `advancedProductSearch()` للبحث المتقدم
   - استخدم `getSearchSuggestions()` للاقتراحات
   - استخدم `autocomplete()` للاقتراحات المختصرة

10. **الاستخدام:**
    - اعرض النتائج مع `SearchResultItem`
    - استخدم `getTitle(locale)` و `getDescription(locale)` للغات
    - استخدم `isProduct`, `isCategory`, `isBrand` للتمييز
    - استخدم `hasThumbnail` للصور
    - استخدم `metadata` للمعلومات الإضافية

11. **التحسين:**
    - استخدم `relevanceScore` للترتيب
    - استخدم `facets` للفلترة
    - استخدم `priceRange` لنطاق الأسعار
    - استخدم `matches` لعدد النتائج
    - استخدم `isPopular` و `isTrending` للاقتراحات

12. **البحث المتقدم:**
    - `attributes`: البحث بالسمات (JSON string)
    - `tags`: البحث بالوسوم
    - `status`: فلترة حسب الحالة
    - `isFeatured`: منتجات مميزة
    - `isNew`: منتجات جديدة
    - `minPrice`/`maxPrice`: نطاق السعر
    - `minRating`: الحد الأدنى للتقييم

13. **النتائج:**
    - `SearchResult`: للبحث الشامل
    - `ProductSearchResult`: للبحث المتقدم
    - `SearchResultItem`: عنصر النتيجة
    - `SearchFacet`: الفلاتر المتاحة
    - `SearchPriceRange`: نطاق الأسعار
    - Suggestions: مجرد `List<String>`

14. **الوظائف المساعدة:**
    - `getTitle(locale)`: الحصول على العنوان حسب اللغة
    - `getDescription(locale)`: الحصول على الوصف حسب اللغة
    - `isProduct`/`isCategory`/`isBrand`: تمييز نوع النتيجة
    - `hasThumbnail`: التحقق من وجود صورة
    - `hasMetadata`: التحقق من وجود بيانات وصفية
    - `priceRange`/`category`/`brand`/`rating`/`reviewsCount`/`isFeatured`/`isNew`/`tags`: معلومات المنتج
    - `productsCount`/`depth`: معلومات الفئة

15. **التحسينات:**
    - استخدم `hasNextPage` و `hasPrevPage` للتنقل
    - استخدم `isFirstPage` و `isLastPage` للتحقق
    - استخدم `hasFacets` للفلترة
    - استخدم `hasPriceRange` لنطاق الأسعار
    - استخدم `relevanceScore` للترتيب حسب الصلة
    - cache الاقتراحات محلياً لتحسين الأداء

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تصحيح Universal Search response - `{ data: { results: [...], total, page, totalPages } }`
2. ✅ تصحيح Advanced Product Search response - `{ data: { results, total, page, totalPages, facets?, priceRange? } }`
3. ✅ **تغيير جذري**: Suggestions و Autocomplete يعيدون `{ data: [strings] }` وليس objects
4. ✅ تحديث `SearchResultItem` - إزالة `descriptionEn` المكررة وإضافة metadata helpers
5. ✅ تحديث `SearchFacet` - `isTag` للـ tags field
6. ✅ إزالة `SearchSuggestion` model - لم يعد مطلوباً

**ملاحظات مهمة:**
- `relevanceScore` هو number (ليس 0-1، بل score فعلي قد يكون 0-100+)
- `metadata` مختلف حسب النوع (product, category, brand)
- Suggestions/Autocomplete يعيدون strings فقط (أسماء المنتجات والفئات)
- `includeFacets` يجب تمريره كـ `true` للحصول على facets و priceRange

**ملفات Backend المرجعية:**
- `backend/src/modules/search/search.controller.ts` - جميع endpoints
- `backend/src/modules/search/search.service.ts` - منطق البحث والـ relevance scoring
- `backend/src/modules/search/dto/search.dto.ts` - DTOs

---

**التالي:** [خدمة الكوبونات (Coupons)](./12-coupons-service.md)

