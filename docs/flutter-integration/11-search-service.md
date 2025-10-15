# 🔍 خدمة البحث (Search Service)

خدمة البحث توفر endpoints للبحث الشامل والمتقدم.

---

## Endpoints

### 1. البحث الشامل
- **GET** `/search?q=solar&lang=ar&entity=all`
- **Auth:** ❌ No
- **Query Parameters:**
  - `q`: نص البحث (required)
  - `lang`: `ar` أو `en` (optional)
  - `entity`: `products`, `categories`, `brands`, `all` (optional)
  - `page`: رقم الصفحة (optional)
  - `limit`: عدد النتائج (optional)

- **Response:**
```json
{
  "success": true,
  "data": {
    "products": {
      "items": [...],
      "total": 45
    },
    "categories": {
      "items": [...],
      "total": 5
    },
    "brands": {
      "items": [...],
      "total": 3
    }
  }
}
```

### 2. البحث المتقدم في المنتجات
- **GET** `/search/products`
- **Auth:** ❌ No
- **Query Parameters:**
  - `q`: نص البحث
  - `categoryId`: ID الفئة
  - `brandId`: ID البراند
  - `minPrice`: الحد الأدنى للسعر
  - `maxPrice`: الحد الأقصى للسعر
  - `minRating`: الحد الأدنى للتقييم
  - `sortBy`: `name`, `price`, `rating`, `views`, `createdAt`, `relevance`
  - `sortOrder`: `asc`, `desc`
  - `includeFacets`: `true` لإرجاع facets (filters)

- **Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 45,
    "facets": {
      "brands": [
        {"id": "brand_123", "name": "Longi", "count": 12}
      ],
      "priceRanges": [
        {"min": 0, "max": 100000, "count": 15},
        {"min": 100000, "max": 200000, "count": 20}
      ]
    }
  }
}
```

### 3. اقتراحات البحث (Autocomplete)
- **GET** `/search/suggestions?q=sol&lang=ar&limit=10`
- **Auth:** ❌ No
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "text": "لوح شمسي",
      "type": "product",
      "matches": 45
    },
    {
      "text": "بطارية شمسية",
      "type": "product",
      "matches": 28
    }
  ]
}
```

### 4. Autocomplete (مختصر)
- **GET** `/search/autocomplete?q=sol&lang=ar`
- **Auth:** ❌ No

---

## Models في Flutter

```dart
class SearchResult {
  final SearchProducts? products;
  final SearchCategories? categories;
  final SearchBrands? brands;

  SearchResult({
    this.products,
    this.categories,
    this.brands,
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    return SearchResult(
      products: json['products'] != null
          ? SearchProducts.fromJson(json['products'])
          : null,
      categories: json['categories'] != null
          ? SearchCategories.fromJson(json['categories'])
          : null,
      brands: json['brands'] != null
          ? SearchBrands.fromJson(json['brands'])
          : null,
    );
  }
}

class SearchProducts {
  final List<Product> items;
  final int total;

  SearchProducts({required this.items, required this.total});

  factory SearchProducts.fromJson(Map<String, dynamic> json) {
    return SearchProducts(
      items: (json['items'] as List)
          .map((item) => Product.fromJson(item))
          .toList(),
      total: json['total'],
    );
  }
}

class SearchSuggestion {
  final String text;
  final String type;
  final int matches;

  SearchSuggestion({
    required this.text,
    required this.type,
    required this.matches,
  });

  factory SearchSuggestion.fromJson(Map<String, dynamic> json) {
    return SearchSuggestion(
      text: json['text'],
      type: json['type'],
      matches: json['matches'] ?? 0,
    );
  }
}
```

---

**التالي:** [خدمة الكوبونات (Coupons)](./12-coupons-service.md)

