# 🔍 خدمة البحث (Search Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: يناير 2025  
> 🔄 **تحديثات حديثة**: 
>   - **تغيير جذري**: البحث المتقدم في المنتجات (`/search/products`) الآن يرجع نفس تنسيق قائمة المنتجات المميزة (`/products/featured/list`)
>   - المنتجات تحتوي على `hasVariants` لتحديد ما إذا كان المنتج يحتوي على متغيرات
>   - المنتجات تحتوي على `pricingByCurrency` و `defaultPricing` و `priceRangeByCurrency`
>   - تم إضافة `currency` parameter للبحث
>   - الصورة الرئيسية تُرجع من `mainImageId` المملوء

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
| `currency` | `string` | ❌ | العملة (USD, YER, SAR) - افتراضي: USD أو من المستخدم |
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
          "priceRangeByCurrency": {
            "USD": {
              "minPrice": 200,
              "maxPrice": 240,
              "currency": "USD",
              "hasDiscountedVariant": false
            },
            "YER": {
              "minPrice": 150000,
              "maxPrice": 180000,
              "currency": "YER",
              "hasDiscountedVariant": false
            },
            "SAR": {
              "minPrice": 750,
              "maxPrice": 900,
              "currency": "SAR",
              "hasDiscountedVariant": false
            }
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
  String? currency,
  int page = 1,
  int limit = 20,
}) async {
  final response = await _dio.get('/search', queryParameters: {
    if (query != null) 'q': query,
    'lang': lang,
    'entity': entity,
    if (currency != null) 'currency': currency,
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
| `currency` | `string` | ❌ | العملة (USD, YER, SAR) - افتراضي: USD أو من المستخدم |
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
| `sortBy` | `string` | ❌ | ترتيب حسب (name, price, rating, views, createdAt, relevance) - **افتراضي: relevance** |
| `sortOrder` | `string` | ❌ | اتجاه الترتيب (asc, desc) - **افتراضي: desc** |
| `includeFacets` | `boolean` | ❌ | إرجاع الـ Facets |
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد النتائج (افتراضي: 20) |

### Response - نجاح

> **⚠️ مهم**: البحث المتقدم في المنتجات الآن يرجع نفس تنسيق قائمة المنتجات المميزة (`/products/featured/list`)

> **🔍 تحسين البحث**: عند استخدام `sortBy=relevance` (الافتراضي)، يتم ترتيب النتائج حسب الصلة الحقيقية:
> - **أولوية عالية**: المنتجات التي تطابق في الاسم (1000 نقطة للمطابقة التامة، 500 للبداية، 250 للاحتواء)
> - **أولوية منخفضة**: المنتجات التي تطابق فقط في الوصف/الوسوم (5-8 نقاط)
> - **فلترة ذكية**: إذا كانت هناك منتجات تطابق في الاسم، يتم إخفاء المنتجات التي تطابق فقط في الوصف/الوسوم
> - **الترتيب**: relevanceScore → isFeatured → createdAt

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "64product123",
        "name": "لوح شمسي 550W",
        "nameEn": "Solar Panel 550W",
        "status": "active",
        "category": {
          "_id": "64cat123",
          "name": "ألواح شمسية",
          "nameEn": "Solar Panels"
        },
        "brand": {
          "_id": "64brand123",
          "name": "Longi",
          "nameEn": "Longi"
        },
        "mainImage": {
          "_id": "64img123",
          "url": "https://cdn.example.com/products/solar-panel.jpg"
        },
        "isFeatured": true,
        "isNew": false,
        "hasVariants": true,
        "pricingByCurrency": {
          "USD": {
            "basePrice": 200,
            "compareAtPrice": 240,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 200,
            "currency": "USD"
          },
          "YER": {
            "basePrice": 150000,
            "compareAtPrice": 180000,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 150000,
            "currency": "YER"
          },
          "SAR": {
            "basePrice": 750,
            "compareAtPrice": 900,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 750,
            "currency": "SAR"
          }
        },
        "defaultPricing": {
          "basePrice": 200,
          "compareAtPrice": 240,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 200,
          "currency": "USD"
        },
        "priceRangeByCurrency": {
          "USD": {
            "minPrice": 200,
            "maxPrice": 240,
            "currency": "USD",
            "hasDiscountedVariant": false
          },
          "YER": {
            "minPrice": 150000,
            "maxPrice": 180000,
            "currency": "YER",
            "hasDiscountedVariant": false
          },
          "SAR": {
            "minPrice": 750,
            "maxPrice": 900,
            "currency": "SAR",
            "hasDiscountedVariant": false
          }
        },
        "isAvailable": true,
        "salesCount": 45,
        "minOrderQuantity": 1,
        "maxOrderQuantity": 0,
        "averageRating": 4.5,
        "reviewsCount": 120
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

> **ملاحظة:** المنتجات الآن بنفس تنسيق قائمة المنتجات المميزة. الحقول المتاحة:
> - `_id`: معرف المنتج
> - `name`, `nameEn`: الاسم بالعربي والإنجليزي
> - `category`: كائن مبسط يحتوي على `_id`, `name`, `nameEn`
> - `brand`: كائن مبسط يحتوي على `_id`, `name`, `nameEn` (أو `null`)
> - `mainImage`: كائن مبسط يحتوي على `_id`, `url` (أو `null`)
> - `hasVariants`: boolean - يحدد ما إذا كان المنتج يحتوي على متغيرات
> - `pricingByCurrency`: أسعار المنتج بجميع العملات (USD, YER, SAR)
> - `defaultPricing`: السعر الافتراضي (بالعملة المطلوبة)
> - `priceRangeByCurrency`: نطاق الأسعار لكل عملة (للمنتجات ذات variants متعددة)
> - `isAvailable`: متاح للبيع أم لا
> - `salesCount`: عدد المبيعات
> - `minOrderQuantity`, `maxOrderQuantity`: حدود الطلب

### كود Flutter

```dart
Future<ProductSearchResult> advancedProductSearch({
  String? query,
  String lang = 'ar',
  String? currency,
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
    if (currency != null) 'currency': currency,
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
  Map<String, dynamic>? get priceRangeByCurrency => metadata['priceRangeByCurrency'];
  Map<String, dynamic>? get priceRangeUSD => priceRangeByCurrency?['USD'];
  Map<String, dynamic>? get priceRangeYER => priceRangeByCurrency?['YER'];
  Map<String, dynamic>? get priceRangeSAR => priceRangeByCurrency?['SAR'];
  // Legacy support - get first available currency or USD
  Map<String, dynamic>? get priceRange => priceRangeByCurrency?['USD'] ?? 
      (priceRangeByCurrency?.isNotEmpty == true 
          ? priceRangeByCurrency?.values.first 
          : null);
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
  final List<Product> results; // الآن Product بدلاً من SearchResultItem
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
          .map((item) => Product.fromJson(item)) // استخدام Product model
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

class PriceRangeByCurrency {
  final double minPrice;
  final double maxPrice;
  final String currency;
  final bool hasDiscountedVariant;

  PriceRangeByCurrency({
    required this.minPrice,
    required this.maxPrice,
    required this.currency,
    required this.hasDiscountedVariant,
  });

  factory PriceRangeByCurrency.fromJson(Map<String, dynamic> json) {
    return PriceRangeByCurrency(
      minPrice: (json['minPrice'] ?? 0).toDouble(),
      maxPrice: (json['maxPrice'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      hasDiscountedVariant: json['hasDiscountedVariant'] ?? false,
    );
  }

  double get range => maxPrice - minPrice;
  bool get hasRange => minPrice < maxPrice;
  double get midPoint => (minPrice + maxPrice) / 2;
  bool get isSinglePrice => minPrice == maxPrice;
}

// Helper extension for SearchResultItem
extension SearchResultItemPriceExtension on SearchResultItem {
  PriceRangeByCurrency? getPriceRangeForCurrency(String currency) {
    final priceRangeData = priceRangeByCurrency?[currency.toUpperCase()];
    if (priceRangeData == null) return null;
    return PriceRangeByCurrency.fromJson(priceRangeData);
  }

  PriceRangeByCurrency? get usdPriceRange => getPriceRangeForCurrency('USD');
  PriceRangeByCurrency? get yerPriceRange => getPriceRangeForCurrency('YER');
  PriceRangeByCurrency? get sarPriceRange => getPriceRangeForCurrency('SAR');
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
   - `sortBy`: ترتيب حسب (name, price, rating, views, createdAt, relevance) - **افتراضي: relevance**
   - `sortOrder`: اتجاه الترتيب (asc, desc) - **افتراضي: desc**
   - **نظام حساب الصلة (Relevance Scoring)**:
     - **مطابقة تامة في الاسم**: 1000 نقطة
     - **يبدأ بنص البحث في الاسم**: 500 نقطة
     - **يحتوي على نص البحث في الاسم**: 250 نقطة
     - **مطابقة في الاسم باللغة الأخرى**: 800/400/200 نقطة
     - **مطابقة فقط في الوصف**: 5 نقاط
     - **مطابقة فقط في الوسوم**: 8 نقاط
     - **فلترة ذكية**: إذا كانت هناك منتجات تطابق في الاسم (score >= 200)، يتم إخفاء المنتجات التي تطابق فقط في الوصف/الوسوم (score < 200)
     - **الترتيب النهائي**: relevanceScore (تنازلي) → isFeatured → createdAt (تنازلي)

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
    - **البحث المتقدم في المنتجات**: استخدم `Product` model (نفس تنسيق قائمة المنتجات المميزة)
    - **البحث الشامل**: استخدم `SearchResultItem` للتمييز بين المنتجات والفئات والبراندات
    - استخدم `getTitle(locale)` و `getDescription(locale)` للغات (فقط في Universal Search)
    - استخدم `isProduct`, `isCategory`, `isBrand` للتمييز (فقط في Universal Search)
    - استخدم `hasThumbnail` للصور (فقط في Universal Search)
    - استخدم `metadata` للمعلومات الإضافية (فقط في Universal Search)
    - **للأسعار في البحث المتقدم**: استخدم `pricingByCurrency` و `defaultPricing` و `priceRangeByCurrency` (نفس تنسيق قائمة المنتجات المميزة)
    - **للأسعار في البحث الشامل**: استخدم `priceRangeByCurrency` من `metadata`
    - استخدم `hasVariants` لتحديد ما إذا كان المنتج يحتوي على متغيرات
    - **للترتيب حسب الصلة**: استخدم `sortBy=relevance` (الافتراضي) للحصول على أفضل النتائج - المنتجات التي تطابق في الاسم تظهر أولاً

11. **التحسين:**
    - **نظام البحث الذكي**: عند البحث، المنتجات التي تطابق في الاسم تظهر أولاً دائماً
    - **فلترة تلقائية**: إذا كانت هناك منتجات تطابق في الاسم، المنتجات التي تطابق فقط في الوصف/الوسوم لا تظهر
    - استخدم `sortBy=relevance` (الافتراضي) للحصول على أفضل النتائج
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
2. ✅ **تغيير جذري**: Advanced Product Search (`/search/products`) الآن يرجع نفس تنسيق قائمة المنتجات المميزة (`/products/featured/list`)
3. ✅ **تغيير جذري**: `ProductSearchResult.results` الآن من نوع `List<Product>` بدلاً من `List<SearchResultItem>`
4. ✅ **إضافة**: `hasVariants` في المنتجات لتحديد ما إذا كان المنتج يحتوي على متغيرات
5. ✅ **إضافة**: `pricingByCurrency` و `defaultPricing` في المنتجات
6. ✅ **إضافة**: `currency` parameter للبحث (Universal و Advanced)
7. ✅ **تحديث الأسعار**: `priceRangeByCurrency` يحتوي على نطاق الأسعار لكل عملة (USD, YER, SAR)
8. ✅ **تحديث الصور**: الصورة الرئيسية الآن تُرجع من `mainImageId` المملوء بدلاً من `mainImage` المباشر
9. ✅ Suggestions و Autocomplete يعيدون `{ data: [strings] }` وليس objects
10. ✅ تحديث `SearchResultItem` - إزالة `descriptionEn` المكررة وإضافة metadata helpers
11. ✅ تحديث `SearchFacet` - `isTag` للـ tags field
12. ✅ إزالة `SearchSuggestion` model - لم يعد مطلوباً
13. ✅ **تحسين جذري في نظام البحث**: نظام حساب الصلة المحسّن مع أولوية عالية للمطابقة في الاسم
14. ✅ **فلترة ذكية**: المنتجات التي تطابق فقط في الوصف/الوسوم لا تظهر إذا كانت هناك منتجات تطابق في الاسم
15. ✅ **ترتيب محسّن**: الترتيب حسب relevanceScore → isFeatured → createdAt

**ملاحظات مهمة:**
- **البحث المتقدم في المنتجات**: الآن يرجع نفس تنسيق قائمة المنتجات المميزة - استخدم `Product` model من `03-products-service.md`
- **`hasVariants`**: boolean يحدد ما إذا كان المنتج يحتوي على متغيرات (variants)
- **`pricingByCurrency`**: أسعار المنتج بجميع العملات (USD, YER, SAR) - نفس تنسيق قائمة المنتجات المميزة
- **`defaultPricing`**: السعر الافتراضي بالعملة المطلوبة (من `currency` parameter أو `preferredCurrency` للمستخدم)
- **`priceRangeByCurrency`**: نطاق الأسعار لكل عملة (للمنتجات ذات variants متعددة)
- **`currency` parameter**: تم إضافته للبحث الشامل والمتقدم - يستخدم `preferredCurrency` للمستخدم إذا كان مسجل دخول
- **نظام حساب الصلة المحسّن**:
  - **مطابقة تامة في الاسم**: 1000 نقطة
  - **يبدأ بنص البحث في الاسم**: 500 نقطة
  - **يحتوي على نص البحث في الاسم**: 250 نقطة
  - **مطابقة فقط في الوصف/الوسوم**: 5-8 نقاط
  - **فلترة ذكية**: إذا كانت هناك منتجات تطابق في الاسم (score >= 200)، المنتجات التي تطابق فقط في الوصف/الوسوم (score < 200) لا تظهر
  - **الترتيب**: relevanceScore (تنازلي) → isFeatured → createdAt (تنازلي)
- `relevanceScore` هو number (score فعلي: 0-1000+) - فقط في Universal Search
- `metadata` مختلف حسب النوع (product, category, brand) - فقط في Universal Search
- Suggestions/Autocomplete يعيدون strings فقط (أسماء المنتجات والفئات)
- `includeFacets` يجب تمريره كـ `true` للحصول على facets و priceRange
- **الصور**: `mainImage` الآن يُرجع من `mainImageId` المملوء (URL من Media collection)
- الأسعار تُحسب من الـ variants الفعلية وليس من `priceRange` المخزن في المنتج
- **`sortBy=relevance` (الافتراضي)**: يضمن أن المنتجات التي تطابق في الاسم تظهر أولاً دائماً

**ملفات Backend المرجعية:**
- `backend/src/modules/search/search.controller.ts` - جميع endpoints
- `backend/src/modules/search/search.service.ts` - منطق البحث والـ relevance scoring
- `backend/src/modules/search/dto/search.dto.ts` - DTOs

---

**التالي:** [خدمة الكوبونات (Coupons)](./12-coupons-service.md)

