# 🛍️ خدمة المنتجات (Products Service)

خدمة المنتجات توفر endpoints لعرض وتصفح المنتجات.

---

## 📋 جدول المحتويات

1. [قائمة المنتجات](#1-قائمة-المنتجات)
2. [تفاصيل منتج](#2-تفاصيل-منتج)
3. [المنتجات المميزة](#3-المنتجات-المميزة)
4. [المنتجات الجديدة](#4-المنتجات-الجديدة)
5. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة المنتجات

يسترجع قائمة المنتجات مع إمكانية التصفية والبحث.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد العناصر في الصفحة (افتراضي: 20) |
| `search` | `string` | ❌ | نص البحث |
| `categoryId` | `string` | ❌ | ID الفئة للفلترة |
| `brandId` | `string` | ❌ | ID البراند للفلترة |
| `isFeatured` | `boolean` | ❌ | فقط المنتجات المميزة |
| `isNew` | `boolean` | ❌ | فقط المنتجات الجديدة |

### مثال الطلب

```
GET /products?page=1&limit=20&categoryId=64abc123&search=solar
```

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64prod123",
      "name": {
        "ar": "لوح شمسي 550 واط",
        "en": "Solar Panel 550W"
      },
      "description": {
        "ar": "لوح شمسي عالي الكفاءة",
        "en": "High efficiency solar panel"
      },
      "slug": "solar-panel-550w",
      "categoryId": "64cat123",
      "brandId": "64brand123",
      "sku": "SP-550-001",
      "status": "ACTIVE",
      "isFeatured": true,
      "isNew": false,
      "images": [
        {
          "url": "https://cdn.example.com/products/solar-panel-1.jpg",
          "alt": "Solar Panel Front",
          "isPrimary": true
        },
        {
          "url": "https://cdn.example.com/products/solar-panel-2.jpg",
          "alt": "Solar Panel Back",
          "isPrimary": false
        }
      ],
      "specifications": {
        "power": "550W",
        "efficiency": "21%",
        "warranty": "25 years"
      },
      "tags": ["solar", "renewable", "energy"],
      "views": 1250,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-20T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "requestId": "req_prod_001"
}
```

### كود Flutter

```dart
class ProductsFilter {
  final int page;
  final int limit;
  final String? search;
  final String? categoryId;
  final String? brandId;
  final bool? isFeatured;
  final bool? isNew;

  ProductsFilter({
    this.page = 1,
    this.limit = 20,
    this.search,
    this.categoryId,
    this.brandId,
    this.isFeatured,
    this.isNew,
  });

  Map<String, dynamic> toQueryParams() {
    return {
      'page': page,
      'limit': limit,
      if (search != null) 'search': search,
      if (categoryId != null) 'categoryId': categoryId,
      if (brandId != null) 'brandId': brandId,
      if (isFeatured != null) 'isFeatured': isFeatured.toString(),
      if (isNew != null) 'isNew': isNew.toString(),
    };
  }
}

Future<PaginatedProducts> getProducts(ProductsFilter filter) async {
  final response = await _dio.get(
    '/products',
    queryParameters: filter.toQueryParams(),
  );

  final apiResponse = ApiResponse<PaginatedProducts>.fromJson(
    response.data,
    (json) => PaginatedProducts.fromJson(json as Map<String, dynamic>),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. تفاصيل منتج

يسترجع تفاصيل منتج محدد.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/:id`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (10 دقائق)

### مثال الطلب

```
GET /products/64prod123
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64prod123",
    "name": {
      "ar": "لوح شمسي 550 واط",
      "en": "Solar Panel 550W"
    },
    "description": {
      "ar": "لوح شمسي عالي الكفاءة مع ضمان 25 سنة",
      "en": "High efficiency solar panel with 25 years warranty"
    },
    "longDescription": {
      "ar": "وصف تفصيلي طويل...",
      "en": "Long detailed description..."
    },
    "slug": "solar-panel-550w",
    "categoryId": "64cat123",
    "brandId": "64brand123",
    "sku": "SP-550-001",
    "status": "ACTIVE",
    "isFeatured": true,
    "isNew": false,
    "images": [
      {
        "url": "https://cdn.example.com/products/solar-panel-1.jpg",
        "alt": "Solar Panel Front",
        "isPrimary": true
      }
    ],
    "variants": [
      {
        "_id": "64var123",
        "productId": "64prod123",
        "sku": "SP-550-001-BLK",
        "attributes": {
          "color": "أسود",
          "size": "2m x 1m"
        },
        "pricing": [
          {
            "currency": "YER",
            "basePrice": 150000,
            "salePrice": null
          }
        ],
        "inventory": {
          "quantity": 50,
          "reserved": 5,
          "available": 45
        },
        "isDefault": true,
        "isActive": true
      }
    ],
    "specifications": {
      "power": "550W",
      "efficiency": "21%",
      "warranty": "25 years",
      "weight": "28kg"
    },
    "tags": ["solar", "renewable", "energy"],
    "seo": {
      "title": "لوح شمسي 550 واط - أفضل الأسعار",
      "description": "لوح شمسي عالي الكفاءة...",
      "keywords": ["solar", "panel", "550w"]
    },
    "views": 1250,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-20T14:30:00.000Z"
  },
  "meta": null,
  "requestId": "req_prod_002"
}
```

> **ملاحظة:** يتم زيادة عداد المشاهدات تلقائياً عند استدعاء هذا الـ endpoint.

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "المنتج غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_prod_002"
}
```

### كود Flutter

```dart
Future<Product> getProduct(String id) async {
  final response = await _dio.get('/products/$id');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return Product.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. المنتجات المميزة

يسترجع المنتجات المميزة فقط.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/featured/list`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (10 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64prod123",
      "name": {
        "ar": "لوح شمسي 550 واط",
        "en": "Solar Panel 550W"
      },
      "isFeatured": true
      // ... باقي البيانات
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  },
  "requestId": "req_prod_003"
}
```

### كود Flutter

```dart
Future<List<Product>> getFeaturedProducts() async {
  final response = await _dio.get('/products/featured/list');

  final apiResponse = ApiResponse<List<Product>>.fromJson(
    response.data,
    (json) => (json as List)
        .map((item) => Product.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. المنتجات الجديدة

يسترجع المنتجات الجديدة فقط.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/new/list`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (10 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64prod456",
      "name": {
        "ar": "بطارية ليثيوم 10 كيلو واط",
        "en": "Lithium Battery 10kW"
      },
      "isNew": true
      // ... باقي البيانات
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  },
  "requestId": "req_prod_004"
}
```

### كود Flutter

```dart
Future<List<Product>> getNewProducts() async {
  final response = await _dio.get('/products/new/list');

  final apiResponse = ApiResponse<List<Product>>.fromJson(
    response.data,
    (json) => (json as List)
        .map((item) => Product.fromJson(item))
        .toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/product/product_models.dart`

```dart
class LocalizedString {
  final String ar;
  final String? en;

  LocalizedString({required this.ar, this.en});

  factory LocalizedString.fromJson(Map<String, dynamic> json) {
    return LocalizedString(
      ar: json['ar'] ?? '',
      en: json['en'],
    );
  }

  // الحصول على النص حسب اللغة الحالية
  String get(String locale) {
    if (locale == 'en' && en != null) return en!;
    return ar;
  }
}

class ProductImage {
  final String url;
  final String? alt;
  final bool isPrimary;

  ProductImage({
    required this.url,
    this.alt,
    required this.isPrimary,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      url: json['url'],
      alt: json['alt'],
      isPrimary: json['isPrimary'] ?? false,
    );
  }
}

class ProductVariant {
  final String id;
  final String productId;
  final String sku;
  final Map<String, dynamic> attributes;
  final List<VariantPricing> pricing;
  final VariantInventory inventory;
  final bool isDefault;
  final bool isActive;

  ProductVariant({
    required this.id,
    required this.productId,
    required this.sku,
    required this.attributes,
    required this.pricing,
    required this.inventory,
    required this.isDefault,
    required this.isActive,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['_id'],
      productId: json['productId'],
      sku: json['sku'],
      attributes: json['attributes'] ?? {},
      pricing: (json['pricing'] as List)
          .map((e) => VariantPricing.fromJson(e))
          .toList(),
      inventory: VariantInventory.fromJson(json['inventory']),
      isDefault: json['isDefault'] ?? false,
      isActive: json['isActive'] ?? true,
    );
  }

  // الحصول على السعر لعملة معينة
  VariantPricing? getPricing(String currency) {
    try {
      return pricing.firstWhere((p) => p.currency == currency);
    } catch (e) {
      return null;
    }
  }

  // السعر النهائي (مع الخصم إن وجد)
  double? getFinalPrice(String currency) {
    final price = getPricing(currency);
    return price?.salePrice ?? price?.basePrice;
  }
}

class VariantPricing {
  final String currency;
  final double basePrice;
  final double? salePrice;

  VariantPricing({
    required this.currency,
    required this.basePrice,
    this.salePrice,
  });

  factory VariantPricing.fromJson(Map<String, dynamic> json) {
    return VariantPricing(
      currency: json['currency'],
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      salePrice: json['salePrice']?.toDouble(),
    );
  }

  bool get hasDiscount => salePrice != null && salePrice! < basePrice;
  double get discountPercent => 
      hasDiscount ? ((basePrice - salePrice!) / basePrice * 100) : 0;
}

class VariantInventory {
  final int quantity;
  final int reserved;
  final int available;

  VariantInventory({
    required this.quantity,
    required this.reserved,
    required this.available,
  });

  factory VariantInventory.fromJson(Map<String, dynamic> json) {
    return VariantInventory(
      quantity: json['quantity'] ?? 0,
      reserved: json['reserved'] ?? 0,
      available: json['available'] ?? 0,
    );
  }

  bool get inStock => available > 0;
}

class Product {
  final String id;
  final LocalizedString name;
  final LocalizedString description;
  final LocalizedString? longDescription;
  final String slug;
  final String categoryId;
  final String? brandId;
  final String sku;
  final String status;
  final bool isFeatured;
  final bool isNew;
  final List<ProductImage> images;
  final List<ProductVariant>? variants;
  final Map<String, dynamic> specifications;
  final List<String> tags;
  final int views;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    this.longDescription,
    required this.slug,
    required this.categoryId,
    this.brandId,
    required this.sku,
    required this.status,
    required this.isFeatured,
    required this.isNew,
    required this.images,
    this.variants,
    required this.specifications,
    required this.tags,
    required this.views,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'],
      name: LocalizedString.fromJson(json['name']),
      description: LocalizedString.fromJson(json['description']),
      longDescription: json['longDescription'] != null
          ? LocalizedString.fromJson(json['longDescription'])
          : null,
      slug: json['slug'],
      categoryId: json['categoryId'],
      brandId: json['brandId'],
      sku: json['sku'],
      status: json['status'],
      isFeatured: json['isFeatured'] ?? false,
      isNew: json['isNew'] ?? false,
      images: (json['images'] as List?)
              ?.map((e) => ProductImage.fromJson(e))
              .toList() ??
          [],
      variants: json['variants'] != null
          ? (json['variants'] as List)
              .map((e) => ProductVariant.fromJson(e))
              .toList()
          : null,
      specifications: json['specifications'] ?? {},
      tags: List<String>.from(json['tags'] ?? []),
      views: json['views'] ?? 0,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  // الحصول على الصورة الرئيسية
  ProductImage? get primaryImage {
    try {
      return images.firstWhere((img) => img.isPrimary);
    } catch (e) {
      return images.isNotEmpty ? images.first : null;
    }
  }

  // الحصول على الـ variant الافتراضي
  ProductVariant? get defaultVariant {
    if (variants == null || variants!.isEmpty) return null;
    try {
      return variants!.firstWhere((v) => v.isDefault);
    } catch (e) {
      return variants!.first;
    }
  }

  // السعر الأساسي
  double? getBasePrice(String currency) {
    return defaultVariant?.getPricing(currency)?.basePrice;
  }

  // السعر النهائي
  double? getFinalPrice(String currency) {
    return defaultVariant?.getFinalPrice(currency);
  }

  // هل المنتج متوفر
  bool get inStock => defaultVariant?.inventory.inStock ?? false;
}

class PaginatedProducts {
  final List<Product> products;
  final PaginationMeta meta;

  PaginatedProducts({required this.products, required this.meta});

  factory PaginatedProducts.fromJson(Map<String, dynamic> json) {
    return PaginatedProducts(
      products: (json['data'] as List)
          .map((item) => Product.fromJson(item))
          .toList(),
      meta: PaginationMeta.fromJson(json['meta']),
    );
  }
}

class PaginationMeta {
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginationMeta({
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
      totalPages: json['totalPages'],
    );
  }

  bool get hasMore => page < totalPages;
  int get nextPage => page + 1;
}
```

---

## 📝 ملاحظات مهمة

1. **اللغات:**
   - جميع النصوص متوفرة بالعربي والإنجليزي
   - استخدم `LocalizedString.get(locale)` للحصول على النص المناسب

2. **الصور:**
   - `isPrimary` يحدد الصورة الرئيسية
   - استخدم `primaryImage` getter للحصول عليها بسهولة

3. **Variants:**
   - كل منتج له variants مختلفة (ألوان، أحجام، إلخ)
   - لكل variant سعر ومخزون منفصل
   - استخدم `defaultVariant` للحصول على الخيار الافتراضي

4. **الأسعار:**
   - `basePrice`: السعر الأساسي
   - `salePrice`: سعر الخصم (إن وجد)
   - استخدم `getFinalPrice()` للحصول على السعر النهائي

5. **المخزون:**
   - `quantity`: الكمية الكلية
   - `reserved`: الكمية المحجوزة في طلبات معلقة
   - `available`: المتوفر للطلب
   - استخدم `inStock` للتحقق من التوفر

6. **Cache:**
   - جميع الـ endpoints مع cache من جهة السيرفر
   - يمكنك إضافة cache في التطبيق أيضاً

---

**التالي:** [خدمة السلة (Cart)](./04-cart-service.md)

