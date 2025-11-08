# 🛍️ خدمة المنتجات (Products Service)

خدمة المنتجات توفر endpoints لعرض وتصفح المنتجات **للمستخدمين والزوار**.

> ✅ **تم التحقق من صحة هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/products`  
> ⚠️ **هذا الملف للمستخدمين فقط** - endpoints الأدمن موجودة في `products.controller.ts`

---

## 📋 جدول المحتويات

1. [قائمة المنتجات](#1-قائمة-المنتجات)
2. [تفاصيل منتج](#2-تفاصيل-منتج)
3. [تفاصيل منتج بالـ Slug](#3-تفاصيل-منتج-بالـ-slug)
4. [المنتجات المميزة](#4-المنتجات-المميزة)
5. [المنتجات الجديدة](#5-المنتجات-الجديدة)
6. [Variants المنتج](#6-variants-المنتج)
7. [سعر Variant](#7-سعر-variant)
8. [التحقق من التوفر](#8-التحقق-من-التوفر)
9. [نطاق أسعار المنتج](#9-نطاق-أسعار-المنتج)
10. [المنتجات الشبيهة](#10-المنتجات-الشبيهة)
11. [إحصائيات المنتجات](#11-إحصائيات-المنتجات)
12. [Models في Flutter](#models-في-flutter)

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
      "nameAr": "لوح شمسي 550 واط",
      "nameEn": "Solar Panel 550W",
      "descriptionAr": "لوح شمسي عالي الكفاءة",
      "descriptionEn": "High efficiency solar panel",
      "slug": "solar-panel-550w",
      "categoryId": {
        "_id": "64cat123",
        "nameAr": "الألواح الشمسية",
        "nameEn": "Solar Panels"
      },
      "brandId": "64brand123",
      "sku": "SP-550-001",
      "status": "ACTIVE",
      "isFeatured": true,
      "isNew": false,
      "mainImageId": {
        "_id": "64img123",
        "url": "https://cdn.example.com/products/solar-panel-1.jpg",
        "alt": "Solar Panel Front"
      },
      "imageIds": [
        {
          "_id": "64img123",
          "url": "https://cdn.example.com/products/solar-panel-1.jpg",
          "alt": "Solar Panel Front"
        },
        {
          "_id": "64img124",
          "url": "https://cdn.example.com/products/solar-panel-2.jpg",
          "alt": "Solar Panel Back"
        }
      ],
      "specifications": {
        "power": "550W",
        "efficiency": "21%",
        "warranty": "25 years"
      },
      "tags": ["solar", "renewable", "energy"],
      "viewsCount": 1250,
      "variantsCount": 3,
      "salesCount": 45,
      "reviewsCount": 12,
      "averageRating": 4.5,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-20T14:30:00.000Z"
    }
  ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
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

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `currency` | `string` | ❌ | رمز العملة (USD, YER, SAR) للحصول على الأسعار المحولة |

### مثال الطلب

```
GET /products/64prod123?currency=YER
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "64prod123",
      "nameAr": "لوح شمسي 550 واط",
      "nameEn": "Solar Panel 550W",
      "descriptionAr": "لوح شمسي عالي الكفاءة مع ضمان 25 سنة",
      "descriptionEn": "High efficiency solar panel with 25 years warranty",
      "slug": "solar-panel-550w",
      "categoryId": {
        "_id": "64cat123",
        "nameAr": "الألواح الشمسية",
        "nameEn": "Solar Panels"
      },
      "brandId": "64brand123",
      "sku": "SP-550-001",
      "status": "ACTIVE",
      "isFeatured": true,
      "isNew": false,
      "mainImageId": {
        "_id": "64img123",
        "url": "https://cdn.example.com/products/solar-panel-1.jpg",
        "alt": "Solar Panel Front"
      },
      "imageIds": [
        {
          "_id": "64img123",
          "url": "https://cdn.example.com/products/solar-panel-1.jpg",
          "alt": "Solar Panel Front"
        }
      ],
      "specifications": {
        "power": "550W",
        "efficiency": "21%",
        "warranty": "25 years",
        "weight": "28kg"
      },
      "tags": ["solar", "renewable", "energy"],
      "viewsCount": 1250,
      "variantsCount": 3,
      "salesCount": 45,
      "reviewsCount": 12,
      "averageRating": 4.5,
      "attributesDetails": [
        {
          "id": "64attr001",
          "name": "اللون",
          "nameEn": "Color",
          "values": [
            { "id": "64attrVal001", "value": "أسود", "valueEn": "Black" },
            { "id": "64attrVal002", "value": "أبيض", "valueEn": "White" }
          ]
        }
      ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-20T14:30:00.000Z"
    },
    "variants": [
      {
        "_id": "64var123",
        "productId": "64prod123",
        "sku": "SP-550-001-BLK",
        "attributeValues": [
          {
            "attributeId": "64attr001",
            "valueId": "64attrVal001",
            "name": "اللون",
            "nameEn": "Color",
            "value": "أسود",
            "valueEn": "Black"
          }
        ],
        "pricing": {
          "basePrice": 150000,
          "compareAtPrice": 180000,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 150000,
          "currency": "YER",
          "exchangeRate": 250,
          "formattedPrice": "150,000 ر.ي",
          "formattedFinalPrice": "150,000 ر.ي"
        },
        "pricingByCurrency": {
          "USD": {
            "basePrice": 600,
            "compareAtPrice": 720,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 600,
            "currency": "USD",
            "formattedPrice": "$600.00"
          },
          "SAR": {
            "basePrice": 2250,
            "compareAtPrice": 2700,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 2250,
            "currency": "SAR",
            "formattedPrice": "2,250.00 ر.س"
          },
          "YER": {
            "basePrice": 150000,
            "compareAtPrice": 180000,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 150000,
            "currency": "YER",
            "formattedPrice": "150,000 ر.ي",
            "formattedFinalPrice": "150,000 ر.ي"
          }
        },
        "inventory": {
          "quantity": 50,
          "reserved": 5,
          "available": 45
        },
        "isDefault": true,
        "isActive": true
      }
    ],
    "userDiscount": {
      "isMerchant": false,
      "discountPercent": 0
    },
    "pricingByCurrency": {
      "USD": {
        "basePrice": 600,
        "compareAtPrice": 720,
        "discountPercent": 0,
        "discountAmount": 0,
        "finalPrice": 600,
        "currency": "USD",
        "formattedPrice": "$600.00",
        "formattedFinalPrice": "$600.00"
      },
      "SAR": {
        "basePrice": 2250,
        "compareAtPrice": 2700,
        "discountPercent": 0,
        "discountAmount": 0,
        "finalPrice": 2250,
        "currency": "SAR",
        "formattedPrice": "2,250.00 ر.س",
        "formattedFinalPrice": "2,250.00 ر.س"
      },
      "YER": {
        "basePrice": 150000,
        "compareAtPrice": 180000,
        "discountPercent": 0,
        "discountAmount": 0,
        "finalPrice": 150000,
        "currency": "YER",
        "formattedPrice": "150,000 ر.ي",
        "formattedFinalPrice": "150,000 ر.ي"
      }
    }
  },
  "requestId": "req_prod_002"
}
```

> **ملاحظة:** يتم زيادة عداد المشاهدات تلقائياً عند استدعاء هذا الـ endpoint.

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_300",
    "message": "المنتج غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "path": "/api/products/64prod123"
}
```

### ملاحظة مهمة عن الأسعار والخصومات

- 🔐 **للمستخدمين المسجلين:** يتم تطبيق خصم التاجر تلقائياً إذا كان معتمد
- 👤 **للزوار:** `userDiscount.discountPercent = 0`
- 💰 **العملة:** تُحدد من `preferredCurrency` للمستخدم أو من query parameter
- 🌍 **متعدد العملات:** يتم إرجاع `pricingByCurrency` لكل variant ويحتوي على الأسعار بالعملات `USD`, `YER`, `SAR` دائماً

### كود Flutter

```dart
Future<ProductDetails> getProduct(String id, {String currency = 'USD'}) async {
  final response = await _dio.get(
    '/products/$id',
    queryParameters: {'currency': currency},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return ProductDetails.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class ProductDetails {
  final Product product;
  final List<ProductVariant> variants;
  final Map<String, VariantPricing>? pricingByCurrency;

  ProductDetails({
    required this.product,
    required this.variants,
    this.pricingByCurrency,
  });

  factory ProductDetails.fromJson(Map<String, dynamic> json) {
    return ProductDetails(
      product: Product.fromJson(json['product']),
      variants: (json['variants'] as List)
          .map((v) => ProductVariant.fromJson(v))
          .toList(),
      pricingByCurrency: json['product']?['pricingByCurrency'] != null
          ? (json['product']['pricingByCurrency'] as Map<String, dynamic>).map(
              (key, value) => MapEntry(
                key,
                VariantPricing.fromJson(value as Map<String, dynamic>),
              ),
            )
          : null,
    );
  }
}
```

---

## 3. تفاصيل منتج بالـ Slug

يسترجع تفاصيل منتج باستخدام الـ slug (URL friendly).

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/slug/:slug`
- **Auth Required:** ❌ لا (لكن يُنصح للحصول على خصم التاجر)
- **Cache:** ✅ نعم (10 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `currency` | `string` | ❌ | رمز العملة (USD, YER, SAR) للحصول على الأسعار المحولة |

### مثال الطلب

```
GET /products/slug/solar-panel-550w?currency=YER
```

### Response - نجاح

نفس Response المثال السابق (`GET /products/:id`)

### كود Flutter

```dart
Future<ProductDetails> getProductBySlug(String slug, {String currency = 'USD'}) async {
  final response = await _dio.get(
    '/products/slug/$slug',
    queryParameters: {'currency': currency},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return ProductDetails.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. المنتجات المميزة

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
  "data": {
    "data": [
      {
        "_id": "64prod123",
        "nameAr": "لوح شمسي 550 واط",
        "nameEn": "Solar Panel 550W",
        "slug": "solar-panel-550w",
        "categoryId": {
          "_id": "64cat123",
          "nameAr": "الألواح الشمسية",
          "nameEn": "Solar Panels"
        },
        "isFeatured": true,
        "mainImageId": {
          "_id": "64img123",
          "url": "https://cdn.example.com/products/solar-panel-1.jpg"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 12,
      "total": 12,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "requestId": "req_prod_003"
}
```

### كود Flutter

```dart
Future<PaginatedProducts> getFeaturedProducts() async {
  final response = await _dio.get('/products/featured/list');

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

## 5. المنتجات الجديدة

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
  "data": {
    "data": [
      {
        "_id": "64prod456",
        "nameAr": "بطارية ليثيوم 10 كيلو واط",
        "nameEn": "Lithium Battery 10kW",
        "slug": "lithium-battery-10kw",
        "categoryId": {
          "_id": "64cat456",
          "nameAr": "البطاريات",
          "nameEn": "Batteries"
        },
        "isNew": true,
        "mainImageId": {
          "_id": "64img456",
          "url": "https://cdn.example.com/products/battery-10kw.jpg"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 12,
      "total": 8,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "requestId": "req_prod_004"
}
```

### كود Flutter

```dart
Future<PaginatedProducts> getNewProducts() async {
  final response = await _dio.get('/products/new/list');

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

## 6. Variants المنتج

يسترجع جميع variants لمنتج معين مع الأسعار.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/:id/variants`
- **Auth Required:** ❌ لا (لكن يُنصح للحصول على خصم التاجر)
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `currency` | `string` | ❌ | رمز العملة (افتراضي: USD أو العملة المفضلة للمستخدم) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64var123",
        "productId": "64prod123",
        "sku": "SP-550-001-BLK",
        "attributeValues": [
          {
            "attributeId": "64attr001",
            "valueId": "64attrVal001",
            "name": "اللون",
            "nameEn": "Color",
            "value": "أسود",
            "valueEn": "Black"
          }
        ],
        "pricing": {
          "basePrice": 150000,
          "compareAtPrice": 180000,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 150000,
          "currency": "YER",
          "exchangeRate": 250,
          "formattedPrice": "150,000 ر.ي",
          "formattedFinalPrice": "150,000 ر.ي"
        },
        "pricingByCurrency": {
          "USD": {
            "basePrice": 600,
            "compareAtPrice": 720,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 600,
            "currency": "USD",
            "formattedPrice": "$600.00"
          },
          "SAR": {
            "basePrice": 2250,
            "compareAtPrice": 2700,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 2250,
            "currency": "SAR",
            "formattedPrice": "2,250.00 ر.س"
          },
          "YER": {
            "basePrice": 150000,
            "compareAtPrice": 180000,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 150000,
            "currency": "YER",
            "formattedPrice": "150,000 ر.ي",
            "formattedFinalPrice": "150,000 ر.ي"
          }
        },
        "inventory": {
          "quantity": 50,
          "reserved": 5,
          "available": 45
        },
        "isDefault": true,
        "isActive": true
      }
    ],
    "userDiscount": {
      "isMerchant": true,
      "discountPercent": 15
    }
  },
  "requestId": "req_var_001"
}
```

> **ملاحظة:** إذا كان المستخدم تاجر معتمد، يتم تطبيق خصم التاجر على `finalPrice` تلقائياً.
> بالإضافة إلى ذلك، يتم إرجاع قائمة `attributeValues` تحتوي على أسماء السمات بالعربية والإنجليزية، مع `pricingByCurrency` الذي يوفر الأسعار الحقيقية بالدولار والريال اليمني والريال السعودي.

### كود Flutter

```dart
Future<List<ProductVariant>> getProductVariants(
  String productId, 
  {String currency = 'USD'}
) async {
  final response = await _dio.get(
    '/products/$productId/variants',
    queryParameters: {'currency': currency},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return (apiResponse.data!['data'] as List)
        .map((v) => ProductVariant.fromJson(v))
        .toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 7. سعر Variant

يسترجع سعر variant محدد بعملة معينة مع خصم التاجر.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/variants/:id/price`
- **Auth Required:** ❌ لا (لكن يُنصح للحصول على خصم التاجر)
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `currency` | `string` | ❌ | رمز العملة (افتراضي: USD) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "basePrice": 150000,
    "compareAtPrice": 180000,
    "discountPercent": 15,
    "discountAmount": 22500,
    "finalPrice": 127500,
    "currency": "YER",
    "exchangeRate": 250,
    "formattedPrice": "150,000 ر.ي",
    "formattedFinalPrice": "127,500 ر.ي",
    "userDiscount": {
      "isMerchant": true,
      "discountPercent": 15
    }
  },
  "requestId": "req_price_001"
}
```

### كود Flutter

```dart
Future<VariantPrice> getVariantPrice(
  String variantId, 
  {String currency = 'USD'}
) async {
  final response = await _dio.get(
    '/products/variants/$variantId/price',
    queryParameters: {'currency': currency},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return VariantPrice.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class VariantPrice {
  final double basePrice;
  final double? compareAtPrice;
  final double discountPercent;
  final double discountAmount;
  final double finalPrice;
  final String currency;
  final double? exchangeRate;
  final String? formattedPrice;
  final String? formattedFinalPrice;
  final bool isMerchant;
  final double merchantDiscountPercent;

  VariantPrice({
    required this.basePrice,
    this.compareAtPrice,
    required this.discountPercent,
    required this.discountAmount,
    required this.finalPrice,
    required this.currency,
    this.exchangeRate,
    this.formattedPrice,
    this.formattedFinalPrice,
    required this.isMerchant,
    required this.merchantDiscountPercent,
  });

  factory VariantPrice.fromJson(Map<String, dynamic> json) {
    final userDiscount = json['userDiscount'] as Map<String, dynamic>?;
    return VariantPrice(
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      compareAtPrice: json['compareAtPrice']?.toDouble(),
      discountPercent: (json['discountPercent'] ?? 0).toDouble(),
      discountAmount: (json['discountAmount'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      exchangeRate: json['exchangeRate']?.toDouble(),
      formattedPrice: json['formattedPrice'],
      formattedFinalPrice: json['formattedFinalPrice'],
      isMerchant: userDiscount?['isMerchant'] ?? false,
      merchantDiscountPercent: (userDiscount?['discountPercent'] ?? 0).toDouble(),
    );
  }
  
  bool get hasDiscount => finalPrice < basePrice;
}
```

---

## 8. التحقق من التوفر

يتحقق من توفر variant بكمية معينة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/variants/:id/availability`
- **Auth Required:** ❌ لا

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `quantity` | `number` | ✅ نعم | الكمية المطلوبة |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "available": true,
    "availableStock": 45,
    "reason": null,
    "canBackorder": false
  },
  "requestId": "req_avail_001"
}
```

### Response - غير متوفر

```json
{
  "success": true,
  "data": {
    "available": false,
    "availableStock": 2,
    "reason": "INSUFFICIENT_STOCK",
    "canBackorder": false
  },
  "requestId": "req_avail_002"
}
```

### كود Flutter

```dart
class VariantAvailability {
  final bool available;
  final int? availableStock;
  final String? reason;
  final bool canBackorder;

  VariantAvailability({
    required this.available,
    this.availableStock,
    this.reason,
    this.canBackorder = false,
  });

  factory VariantAvailability.fromJson(Map<String, dynamic> json) {
    return VariantAvailability(
      available: json['available'] ?? false,
      availableStock: json['availableStock'],
      reason: json['reason'],
      canBackorder: json['canBackorder'] ?? false,
    );
  }
}

Future<VariantAvailability> checkVariantAvailability(
  String variantId, 
  int quantity
) async {
  final response = await _dio.get(
    '/products/variants/$variantId/availability',
    queryParameters: {'quantity': quantity},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return VariantAvailability.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 9. نطاق أسعار المنتج

يسترجع نطاق الأسعار لجميع variants المنتج.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/:id/price-range`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `currency` | `string` | ❌ | رمز العملة (افتراضي: USD) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "minPrice": 120000,
    "maxPrice": 180000,
    "currency": "YER",
    "formattedMinPrice": "120,000 ر.ي",
    "formattedMaxPrice": "180,000 ر.ي"
  },
  "requestId": "req_range_001"
}
```

### كود Flutter

```dart
Future<PriceRange> getProductPriceRange(
  String productId, 
  {String currency = 'USD'}
) async {
  final response = await _dio.get(
    '/products/$productId/price-range',
    queryParameters: {'currency': currency},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return PriceRange.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class PriceRange {
  final double minPrice;
  final double maxPrice;
  final String currency;
  final String? formattedMinPrice;
  final String? formattedMaxPrice;

  PriceRange({
    required this.minPrice,
    required this.maxPrice,
    required this.currency,
    this.formattedMinPrice,
    this.formattedMaxPrice,
  });

  factory PriceRange.fromJson(Map<String, dynamic> json) {
    return PriceRange(
      minPrice: (json['minPrice'] ?? 0).toDouble(),
      maxPrice: (json['maxPrice'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      formattedMinPrice: json['formattedMinPrice'],
      formattedMaxPrice: json['formattedMaxPrice'],
    );
  }
  
  String get formattedRange => 
      formattedMinPrice != null && formattedMaxPrice != null
          ? '$formattedMinPrice - $formattedMaxPrice'
          : '${minPrice.toStringAsFixed(0)} - ${maxPrice.toStringAsFixed(0)} $currency';
}
```

---

## 10. المنتجات الشبيهة

يسترجع منتجات شبيهة بمنتج معين (من نفس الفئة).

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/:id/related`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (10 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `limit` | `number` | ❌ | عدد المنتجات (افتراضي: 10) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64prod789",
        "nameAr": "لوح شمسي 600 واط",
        "nameEn": "Solar Panel 600W",
        "slug": "solar-panel-600w",
        "categoryId": {
          "_id": "64cat123",
          "nameAr": "الألواح الشمسية"
        },
        "isFeatured": true,
        "mainImageId": {
          "url": "https://cdn.example.com/products/solar-600.jpg"
        }
      }
    ],
    "count": 5
  },
  "requestId": "req_related_001"
}
```

### كود Flutter

```dart
Future<List<Product>> getRelatedProducts(
  String productId, 
  {int limit = 10}
) async {
  final response = await _dio.get(
    '/products/$productId/related',
    queryParameters: {'limit': limit},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return (apiResponse.data!['data'] as List)
        .map((item) => Product.fromJson(item))
        .toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 11. إحصائيات المنتجات

يسترجع عدد المنتجات الإجمالي.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/products/stats/count`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "count": 150
  },
  "requestId": "req_stats_001"
}
```

### كود Flutter

```dart
Future<int> getProductsCount() async {
  final response = await _dio.get('/products/stats/count');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['count'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

> ⚠️ **تنبيه مهم:** الواجهات الآن تُعيد `attributeValues` لكل variant و`pricingByCurrency` بجانب `pricing` المختارة. تأكد من تحديث موديلات Flutter للتعامل مع هذه الحقول الجديدة (مثال: إضافة قائمة `attributeValues` وخرائط `pricingByCurrency`).

### ملف: `lib/models/product/product_models.dart`

```dart
class Category {
  final String id;
  final String nameAr;
  final String nameEn;

  Category({
    required this.id,
    required this.nameAr,
    required this.nameEn,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'],
      nameAr: json['nameAr'] ?? '',
      nameEn: json['nameEn'] ?? '',
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return nameAr;
  }
}

class ProductImage {
  final String id;
  final String url;
  final String? alt;

  ProductImage({
    required this.id,
    required this.url,
    this.alt,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: json['_id'],
      url: json['url'],
      alt: json['alt'],
    );
  }
}

class ProductVariant {
  final String id;
  final String productId;
  final String sku;
  final String nameAr;
  final String nameEn;
  final Map<String, dynamic> attributes;
  final VariantPricing? pricing; // من جميع endpoints يكون object واحد
  final VariantInventory inventory;
  final bool isDefault;
  final bool isActive;
  final ProductImage? image;

  ProductVariant({
    required this.id,
    required this.productId,
    required this.sku,
    required this.nameAr,
    required this.nameEn,
    required this.attributes,
    this.pricing,
    required this.inventory,
    required this.isDefault,
    required this.isActive,
    this.image,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    // من جميع endpoints يكون pricing object واحد
    VariantPricing? pricingObj;
    final pricingData = json['pricing'];
    
    if (pricingData != null && pricingData is Map) {
      pricingObj = VariantPricing.fromJson(pricingData);
    }

    return ProductVariant(
      id: json['_id'],
      productId: json['productId'],
      sku: json['sku'],
      nameAr: json['nameAr'] ?? '',
      nameEn: json['nameEn'] ?? '',
      attributes: json['attributes'] ?? {},
      pricing: pricingObj,
      inventory: VariantInventory.fromJson(json['inventory'] ?? {}),
      isDefault: json['isDefault'] ?? false,
      isActive: json['isActive'] ?? true,
      image: json['imageId'] != null 
          ? ProductImage.fromJson(json['imageId'])
          : null,
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return nameAr;
  }

  // الحصول على السعر لعملة معينة
  VariantPricing? getPricing(String currency) {
    if (pricing != null && pricing!.currency == currency) {
      return pricing;
    }
    return null;
  }

  // السعر النهائي (مع الخصم إن وجد)
  double? getFinalPrice(String currency) {
    if (pricing != null && pricing!.currency == currency) {
      return pricing!.finalPrice ?? pricing!.basePrice;
    }
    return null;
  }
}

class VariantPricing {
  final String currency;
  final double basePrice;
  final double? compareAtPrice;
  final double? salePrice;
  final double? discountPercent;
  final double? discountAmount;
  final double? finalPrice;
  final double? exchangeRate;
  final String? formattedPrice;
  final String? formattedFinalPrice;

  VariantPricing({
    required this.currency,
    required this.basePrice,
    this.compareAtPrice,
    this.salePrice,
    this.discountPercent,
    this.discountAmount,
    this.finalPrice,
    this.exchangeRate,
    this.formattedPrice,
    this.formattedFinalPrice,
  });

  factory VariantPricing.fromJson(Map<String, dynamic> json) {
    return VariantPricing(
      currency: json['currency'] ?? 'USD',
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      compareAtPrice: json['compareAtPrice']?.toDouble(),
      salePrice: json['salePrice']?.toDouble(),
      discountPercent: json['discountPercent']?.toDouble(),
      discountAmount: json['discountAmount']?.toDouble(),
      finalPrice: json['finalPrice']?.toDouble(),
      exchangeRate: json['exchangeRate']?.toDouble(),
      formattedPrice: json['formattedPrice'],
      formattedFinalPrice: json['formattedFinalPrice'],
    );
  }

  bool get hasDiscount {
    if (finalPrice != null) {
      return finalPrice! < basePrice;
    }
    if (salePrice != null) {
      return salePrice! < basePrice;
    }
    if (discountPercent != null && discountPercent! > 0) {
      return true;
    }
    return false;
  }
  
  double get calculatedDiscountPercent {
    if (discountPercent != null) return discountPercent!;
    if (finalPrice != null) {
      return ((basePrice - finalPrice!) / basePrice * 100);
    }
    if (salePrice != null) {
      return ((basePrice - salePrice!) / basePrice * 100);
    }
    return 0;
  }
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
  final String nameAr;
  final String nameEn;
  final String descriptionAr;
  final String descriptionEn;
  final String slug;
  final Category category;
  final String? brandId;
  final String sku;
  final String status;
  final bool isFeatured;
  final bool isNew;
  final ProductImage? mainImage;
  final List<ProductImage> images;
  final List<ProductVariant>? variants;
  final Map<String, dynamic> specifications;
  final List<String> tags;
  final int viewsCount;
  final int variantsCount;
  final int salesCount;
  final int reviewsCount;
  final double averageRating;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.descriptionAr,
    required this.descriptionEn,
    required this.slug,
    required this.category,
    this.brandId,
    required this.sku,
    required this.status,
    required this.isFeatured,
    required this.isNew,
    this.mainImage,
    required this.images,
    this.variants,
    required this.specifications,
    required this.tags,
    required this.viewsCount,
    required this.variantsCount,
    required this.salesCount,
    required this.reviewsCount,
    required this.averageRating,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'],
      nameAr: json['nameAr'] ?? '',
      nameEn: json['nameEn'] ?? '',
      descriptionAr: json['descriptionAr'] ?? '',
      descriptionEn: json['descriptionEn'] ?? '',
      slug: json['slug'],
      category: Category.fromJson(json['categoryId']),
      brandId: json['brandId'],
      sku: json['sku'],
      status: json['status'],
      isFeatured: json['isFeatured'] ?? false,
      isNew: json['isNew'] ?? false,
      mainImage: json['mainImageId'] != null 
          ? ProductImage.fromJson(json['mainImageId'])
          : null,
      images: (json['imageIds'] as List?)
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
      viewsCount: json['viewsCount'] ?? 0,
      variantsCount: json['variantsCount'] ?? 0,
      salesCount: json['salesCount'] ?? 0,
      reviewsCount: json['reviewsCount'] ?? 0,
      averageRating: (json['averageRating'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return nameAr;
  }

  String getDescription(String locale) {
    if (locale == 'en') return descriptionEn;
    return descriptionAr;
  }

  // الحصول على الصورة الرئيسية
  ProductImage? get primaryImage => mainImage ?? (images.isNotEmpty ? images.first : null);

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
  final bool hasNextPage;
  final bool hasPrevPage;

  PaginationMeta({
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.hasNextPage,
    required this.hasPrevPage,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      total: json['total'],
      page: json['page'],
      limit: json['limit'],
      totalPages: json['totalPages'],
      hasNextPage: json['hasNextPage'] ?? false,
      hasPrevPage: json['hasPrevPage'] ?? false,
    );
  }

  bool get hasMore => hasNextPage;
  int get nextPage => page + 1;
}
```

---

## 📝 ملاحظات مهمة

1. **اللغات:**
   - جميع النصوص متوفرة بالعربي والإنجليزي
   - استخدم `getName(locale)` و `getDescription(locale)` للحصول على النص المناسب

2. **الصور:**
   - `mainImage`: الصورة الرئيسية للمنتج
   - `images`: قائمة بجميع صور المنتج
   - استخدم `primaryImage` getter للحصول على الصورة الرئيسية

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

6. **الإحصائيات:**
   - `viewsCount`: عدد المشاهدات
   - `variantsCount`: عدد المتغيرات
   - `salesCount`: عدد المبيعات
   - `reviewsCount`: عدد التقييمات
   - `averageRating`: متوسط التقييم

7. **Cache:**
   - جميع الـ endpoints مع cache من جهة السيرفر
   - يمكنك إضافة cache في التطبيق أيضاً

8. **خصم التاجر (Merchant Discount):**
   - يتم تطبيقه تلقائياً للمستخدمين المعتمدين كتجار
   - يظهر في `userDiscount.isMerchant` و `userDiscount.discountPercent`
   - يتم خصمه من `finalPrice` مباشرة
   - للزوار غير المسجلين: `discountPercent = 0`

---

## 📝 ملاحظات التحديث

> ✅ **تم تحديث هذه الوثيقة بالكامل** لتطابق الكود الفعلي

### التحديثات المضافة في هذه النسخة:
1. ✅ **إضافة 7 endpoints جديدة:**
   - `GET /products/slug/:slug` - البحث بالـ slug
   - `GET /products/:id/variants` - جلب variants المنتج
   - `GET /products/variants/:id/price` - سعر variant محدد
   - `GET /products/variants/:id/availability` - التحقق من التوفر
   - `GET /products/:id/price-range` - نطاق أسعار المنتج
   - `GET /products/:id/related` - المنتجات الشبيهة
   - `GET /products/stats/count` - عدد المنتجات الإجمالي
2. ✅ **تحديث Response structures** - إضافة `userDiscount` و `currency`
3. ✅ **تصحيح userDiscount structure** - استخدام `isMerchant` بدلاً من `isWholesale`
4. ✅ **تحديث checkAvailability response** - إضافة `availableStock`, `reason`, `canBackorder`
5. ✅ **تحديث price-range response** - إضافة `formattedMinPrice` و `formattedMaxPrice`
6. ✅ **تصحيح featured/new products response** - استخدام pagination structure (data + meta)
7. ✅ **تحديث variants pricing structure** - object واحد في جميع endpoints (variants و product details)
8. ✅ **تحديث Flutter Models** - إضافة `VariantPrice`, `PriceRange`, `VariantAvailability`
9. ✅ **تحديث VariantPricing model** - دعم جميع الحقول من API

### الملفات المرجعية:
- **Controller:** `backend/src/modules/products/controllers/public-products.controller.ts`
- **Services:** 
  - `backend/src/modules/products/services/product.service.ts`
  - `backend/src/modules/products/services/variant.service.ts`
  - `backend/src/modules/products/services/pricing.service.ts`
  - `backend/src/modules/products/services/inventory.service.ts`

---

**التالي:** [خدمة السلة (Cart)](./04-cart-service.md)

