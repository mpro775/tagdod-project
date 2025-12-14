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

| المعامل                | النوع     | مطلوب | الوصف                                                                         |
| ---------------------- | --------- | ----- | ----------------------------------------------------------------------------- |
| `page`                 | `number`  | ❌    | رقم الصفحة (افتراضي: 1)                                                       |
| `limit`                | `number`  | ❌    | عدد العناصر في الصفحة (افتراضي: 20)                                           |
| `search`               | `string`  | ❌    | نص البحث                                                                      |
| `categoryId`           | `string`  | ❌    | ID الفئة للفلترة (يتضمن الفئات الفرعية افتراضياً)                             |
| `includeSubcategories` | `boolean` | ❌    | تضمين المنتجات من الفئات الفرعية (افتراضي: `true`)                            |
| `brandId`              | `string`  | ❌    | ID البراند للفلترة                                                            |
| `isFeatured`           | `boolean` | ❌    | فقط المنتجات المميزة                                                          |
| `isNew`                | `boolean` | ❌    | فقط المنتجات الجديدة                                                          |
| `currency`             | `string`  | ❌    | رمز العملة المطلوبة (USD, YER, SAR) - افتراضي: USD أو العملة المفضلة للمستخدم |
| `sortBy`               | `string`  | ❌    | حقل الترتيب (افتراضي: `createdAt`)                                            |
| `sortOrder`            | `string`  | ❌    | اتجاه الترتيب: `asc` أو `desc` (افتراضي: `desc` - الأحدث أولاً)               |

### مثال الطلب

```
GET /products?page=1&limit=20&categoryId=64abc123&search=solar
GET /products?categoryId=64abc123&includeSubcategories=true&sortBy=createdAt&sortOrder=desc
GET /products?sortBy=name&sortOrder=asc
```

> **ملاحظة:** الترتيب الافتراضي هو الأحدث أولاً (`createdAt: desc`). عند تحديد `categoryId`، يتم تضمين المنتجات من الفئات الفرعية تلقائياً ما لم يتم تعطيل `includeSubcategories=false`.

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64prod123",
      "name": "لوح شمسي 550 واط",
      "nameEn": "Solar Panel 550W",
      "status": "ACTIVE",
      "category": {
        "_id": "64cat123",
        "name": "الألواح الشمسية",
        "nameEn": "Solar Panels"
      },
      "brand": {
        "_id": "64brand123",
        "name": "Brand Name",
        "nameEn": "Brand Name"
      },
      "mainImage": {
        "_id": "64img123",
        "url": "https://cdn.example.com/products/solar-panel-1.jpg"
      },
      "isFeatured": true,
      "isNew": false,
      "hasVariants": true,
      "isAvailable": true,
      "salesCount": 45,
      "minOrderQuantity": 1,
      "maxOrderQuantity": 0,
      "stock": 182,
      "pricingByCurrency": {
        "USD": {
          "basePrice": 600,
          "compareAtPrice": 720,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 600,
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
          "basePrice": 2250,
          "compareAtPrice": 2700,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 2250,
          "currency": "SAR"
        }
      },
      "defaultPricing": {
        "basePrice": 600,
        "compareAtPrice": 720,
        "discountPercent": 0,
        "discountAmount": 0,
        "finalPrice": 600,
        "currency": "USD"
      },
      "priceRangeByCurrency": {
        "USD": {
          "minPrice": 500,
          "maxPrice": 800,
          "currency": "USD",
          "hasDiscountedVariant": false
        },
        "YER": {
          "minPrice": 125000,
          "maxPrice": 200000,
          "currency": "YER",
          "hasDiscountedVariant": false
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "requestId": "req_prod_001"
}
```

> **ملاحظة:** الـ response مبسط للعرض في القائمة. الحقول المتاحة:
>
> - `_id`: معرف المنتج
> - `name`, `nameEn`: الاسم بالعربي والإنجليزي
> - `category`: كائن مبسط يحتوي على `_id`, `name`, `nameEn`
> - `brand`: كائن مبسط يحتوي على `_id`, `name`, `nameEn` (أو `null`)
> - `mainImage`: كائن مبسط يحتوي على `_id`, `url` (أو `null`)
> - `isAvailable`: متاح للبيع أم لا (boolean)
> - `salesCount`: عدد المبيعات (number)
> - `minOrderQuantity`: الحد الأدنى للطلب (number، افتراضي: 1)
> - `maxOrderQuantity`: الحد الأقصى للطلب (number، 0 يعني لا يوجد حد)
> - `stock`: المخزون (number، للمنتجات البسيطة بدون variants)
> - `pricingByCurrency`: أسعار المنتج بجميع العملات (USD, YER, SAR)
> - `defaultPricing`: السعر الافتراضي (بالعملة المطلوبة)
> - `priceRangeByCurrency`: نطاق الأسعار لكل عملة (للمنتجات ذات variants متعددة)
> - `hasVariants`: هل المنتج يحتوي على variants

### كود Flutter

```dart
class ProductsFilter {
  final int page;
  final int limit;
  final String? search;
  final String? categoryId;
  final bool? includeSubcategories; // افتراضي: true
  final String? brandId;
  final bool? isFeatured;
  final bool? isNew;
  final String? currency; // USD, YER, SAR
  final String? sortBy; // مثل: 'createdAt', 'name', 'basePriceUSD'
  final String? sortOrder; // 'asc' أو 'desc'

  ProductsFilter({
    this.page = 1,
    this.limit = 20,
    this.search,
    this.categoryId,
    this.includeSubcategories = true, // افتراضي: true
    this.brandId,
    this.isFeatured,
    this.isNew,
    this.currency,
    this.sortBy,
    this.sortOrder,
  });

  Map<String, dynamic> toQueryParams() {
    return {
      'page': page,
      'limit': limit,
      if (search != null) 'search': search,
      if (categoryId != null) 'categoryId': categoryId,
      if (includeSubcategories != null) 'includeSubcategories': includeSubcategories.toString(),
      if (brandId != null) 'brandId': brandId,
      if (isFeatured != null) 'isFeatured': isFeatured.toString(),
      if (isNew != null) 'isNew': isNew.toString(),
      if (currency != null) 'currency': currency,
      if (sortBy != null) 'sortBy': sortBy,
      if (sortOrder != null) 'sortOrder': sortOrder,
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

| المعامل    | النوع    | مطلوب | الوصف                                                 |
| ---------- | -------- | ----- | ----------------------------------------------------- |
| `currency` | `string` | ❌    | رمز العملة (USD, YER, SAR) للحصول على الأسعار المحولة |

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
      "name": "لوح شمسي 550 واط",
      "nameEn": "Solar Panel 550W",
      "description": "لوح شمسي عالي الكفاءة مع ضمان 25 سنة",
      "descriptionEn": "High efficiency solar panel with 25 years warranty",
      "status": "ACTIVE",
      "category": {
        "_id": "64cat123",
        "name": "الألواح الشمسية",
        "nameEn": "Solar Panels"
      },
      "brand": {
        "_id": "64brand123",
        "name": "Brand Name",
        "nameEn": "Brand Name"
      },
      "mainImage": {
        "_id": "64img123",
        "url": "https://cdn.example.com/products/solar-panel-1.jpg"
      },
      "images": [
        {
          "_id": "64img123",
          "url": "https://cdn.example.com/products/solar-panel-1.jpg"
        },
        {
          "_id": "64img124",
          "url": "https://cdn.example.com/products/solar-panel-2.jpg"
        }
      ],
      "isFeatured": true,
      "isNew": false,
      "hasVariants": true,
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
      "pricingByCurrency": {
        "USD": {
          "basePrice": 600,
          "compareAtPrice": 720,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 600,
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
          "basePrice": 2250,
          "compareAtPrice": 2700,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 2250,
          "currency": "SAR"
        }
      },
      "priceRangeByCurrency": {
        "USD": {
          "minPrice": 500,
          "maxPrice": 800,
          "currency": "USD",
          "hasDiscountedVariant": false
        },
        "YER": {
          "minPrice": 125000,
          "maxPrice": 200000,
          "currency": "YER",
          "hasDiscountedVariant": false
        }
      },
      "averageRating": 4.5,
      "reviewsCount": 12,
      "salesCount": 45,
      "isAvailable": true,
      "minOrderQuantity": 1,
      "maxOrderQuantity": 0,
      "stock": 182
    },
    "variants": [
      {
        "_id": "64var123",
        "stock": 50,
        "isAvailable": true,
        "stockStatus": "in_stock",
        "salesCount": 12,
        "minOrderQuantity": 1,
        "maxOrderQuantity": 0,
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
          "basePrice": 600,
          "compareAtPrice": 720,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 600,
          "currency": "USD"
        },
        "pricingByCurrency": {
          "USD": {
            "basePrice": 600,
            "compareAtPrice": 720,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 600,
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
            "basePrice": 2250,
            "compareAtPrice": 2700,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 2250,
            "currency": "SAR"
          }
        },
        "isActive": true
      }
    ],
    "relatedProducts": [
      {
        "_id": "64prod789",
        "name": "لوح شمسي 600 واط",
        "nameEn": "Solar Panel 600W",
        "category": {
          "_id": "64cat123",
          "name": "الألواح الشمسية",
          "nameEn": "Solar Panels"
        },
        "mainImage": {
          "_id": "64img789",
          "url": "https://cdn.example.com/products/solar-600.jpg"
        },
        "isFeatured": true,
        "hasVariants": true,
        "pricingByCurrency": {
          "USD": {
            "basePrice": 700,
            "finalPrice": 700,
            "currency": "USD"
          }
        }
      }
    ],
    "userDiscount": {
      "isMerchant": false,
      "discountPercent": 0
    }
  },
  "requestId": "req_prod_002"
}
```

> **ملاحظة:**
>
> - `product`: يحتوي على جميع تفاصيل المنتج مع `attributesDetails`, `pricingByCurrency`, `priceRangeByCurrency`
> - `variants`: قائمة variants مع `pricing` (بالعملة المطلوبة) و `pricingByCurrency` (بجميع العملات). **جميع المتغيرات تظهر حتى لو كانت الكمية 0**، مع `isAvailable: false` و `stockStatus: 'out_of_stock'` للمتغيرات غير المتوفرة
> - `relatedProducts`: منتجات شبيهة (بنية مبسطة)
> - `userDiscount`: معلومات خصم التاجر (إذا كان المستخدم تاجر معتمد)

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

- 🔐 **للمستخدمين المسجلين:** يتم تطبيق خصم التاجر تلقائياً إذا كان معتمد (`userDiscount.isMerchant = true`)
- 👤 **للزوار:** `userDiscount.discountPercent = 0` و `userDiscount.isMerchant = false`
- 💰 **العملة:** تُحدد من `preferredCurrency` للمستخدم أو من query parameter `currency`
- 🌍 **متعدد العملات:** يتم إرجاع `pricingByCurrency` في المنتج وكل variant ويحتوي على الأسعار بالعملات `USD`, `YER`, `SAR` دائماً
- 📊 **السعر الافتراضي:** `defaultPricing` يحتوي على السعر بالعملة المطلوبة
- 📈 **نطاق الأسعار:** `priceRangeByCurrency` موجود فقط للمنتجات التي تحتوي على variants متعددة

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
  final List<Product> relatedProducts;
  final UserDiscount userDiscount;

  ProductDetails({
    required this.product,
    required this.variants,
    required this.relatedProducts,
    required this.userDiscount,
  });

  factory ProductDetails.fromJson(Map<String, dynamic> json) {
    return ProductDetails(
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
      variants: (json['variants'] as List)
          .map((v) => ProductVariant.fromJson(v as Map<String, dynamic>))
          .toList(),
      relatedProducts: (json['relatedProducts'] as List?)
              ?.map((p) => Product.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      userDiscount: UserDiscount.fromJson(json['userDiscount'] as Map<String, dynamic>),
    );
  }
}

class UserDiscount {
  final bool isMerchant;
  final double discountPercent;

  UserDiscount({
    required this.isMerchant,
    required this.discountPercent,
  });

  factory UserDiscount.fromJson(Map<String, dynamic> json) {
    return UserDiscount(
      isMerchant: json['isMerchant'] ?? false,
      discountPercent: (json['discountPercent'] ?? 0).toDouble(),
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

| المعامل    | النوع    | مطلوب | الوصف                                                 |
| ---------- | -------- | ----- | ----------------------------------------------------- |
| `currency` | `string` | ❌    | رمز العملة (USD, YER, SAR) للحصول على الأسعار المحولة |

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
        "name": "لوح شمسي 550 واط",
        "nameEn": "Solar Panel 550W",
        "status": "ACTIVE",
        "category": {
          "_id": "64cat123",
          "name": "الألواح الشمسية",
          "nameEn": "Solar Panels"
        },
        "mainImage": {
          "_id": "64img123",
          "url": "https://cdn.example.com/products/solar-panel-1.jpg"
        },
        "isFeatured": true,
        "hasVariants": true,
        "pricingByCurrency": {
          "USD": {
            "basePrice": 600,
            "finalPrice": 600,
            "currency": "USD"
          }
        },
        "defaultPricing": {
          "basePrice": 600,
          "finalPrice": 600,
          "currency": "USD"
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

> **ملاحظة:** نفس بنية قائمة المنتجات (`/products`) لكن فقط المنتجات المميزة.

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
        "name": "بطارية ليثيوم 10 كيلو واط",
        "nameEn": "Lithium Battery 10kW",
        "status": "ACTIVE",
        "category": {
          "_id": "64cat456",
          "name": "البطاريات",
          "nameEn": "Batteries"
        },
        "mainImage": {
          "_id": "64img456",
          "url": "https://cdn.example.com/products/battery-10kw.jpg"
        },
        "isNew": true,
        "hasVariants": true,
        "pricingByCurrency": {
          "USD": {
            "basePrice": 1200,
            "finalPrice": 1200,
            "currency": "USD"
          }
        },
        "defaultPricing": {
          "basePrice": 1200,
          "finalPrice": 1200,
          "currency": "USD"
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

> **ملاحظة:** نفس بنية قائمة المنتجات (`/products`) لكن فقط المنتجات الجديدة.

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

| المعامل    | النوع    | مطلوب | الوصف                                                |
| ---------- | -------- | ----- | ---------------------------------------------------- |
| `currency` | `string` | ❌    | رمز العملة (افتراضي: USD أو العملة المفضلة للمستخدم) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64var123",
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
          "basePrice": 600,
          "compareAtPrice": 720,
          "discountPercent": 0,
          "discountAmount": 0,
          "finalPrice": 600,
          "currency": "USD"
        },
        "pricingByCurrency": {
          "USD": {
            "basePrice": 600,
            "compareAtPrice": 720,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 600,
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
            "basePrice": 2250,
            "compareAtPrice": 2700,
            "discountPercent": 0,
            "discountAmount": 0,
            "finalPrice": 2250,
            "currency": "SAR"
          }
        },
        "isActive": true,
        "isAvailable": true,
        "stockStatus": "in_stock",
        "stock": 50,
        "salesCount": 12,
        "minOrderQuantity": 1,
        "maxOrderQuantity": 0
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

> **ملاحظة:**
>
> - `data`: قائمة variants مع `pricing` (بالعملة المطلوبة) و `pricingByCurrency` (بجميع العملات)
> - `userDiscount`: معلومات خصم التاجر (يتم تطبيقه تلقائياً على `finalPrice`)
> - **جميع المتغيرات تظهر حتى لو كانت الكمية 0**، مع `isAvailable: false` و `stockStatus: 'out_of_stock'` للمتغيرات غير المتوفرة

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

| المعامل    | النوع    | مطلوب | الوصف                     |
| ---------- | -------- | ----- | ------------------------- |
| `currency` | `string` | ❌    | رمز العملة (افتراضي: USD) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "basePrice": 600,
    "compareAtPrice": 720,
    "discountPercent": 15,
    "discountAmount": 90,
    "finalPrice": 510,
    "currency": "USD",
    "userDiscount": {
      "isMerchant": true,
      "discountPercent": 15
    }
  },
  "requestId": "req_price_001"
}
```

> **ملاحظة:**
>
> - `finalPrice`: السعر النهائي بعد تطبيق خصم التاجر (إذا كان المستخدم تاجر معتمد)
> - `userDiscount`: معلومات خصم التاجر
> - العملة تُحدد من query parameter أو من `preferredCurrency` للمستخدم

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

| المعامل    | النوع    | مطلوب  | الوصف           |
| ---------- | -------- | ------ | --------------- |
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

| المعامل    | النوع    | مطلوب | الوصف                     |
| ---------- | -------- | ----- | ------------------------- |
| `currency` | `string` | ❌    | رمز العملة (افتراضي: USD) |

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

| المعامل | النوع    | مطلوب | الوصف                      |
| ------- | -------- | ----- | -------------------------- |
| `limit` | `number` | ❌    | عدد المنتجات (افتراضي: 10) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64prod789",
        "name": "لوح شمسي 600 واط",
        "nameEn": "Solar Panel 600W",
        "category": {
          "_id": "64cat123",
          "name": "الألواح الشمسية",
          "nameEn": "Solar Panels"
        },
        "mainImage": {
          "_id": "64img789",
          "url": "https://cdn.example.com/products/solar-600.jpg"
        },
        "isFeatured": true,
        "hasVariants": true,
        "pricingByCurrency": {
          "USD": {
            "basePrice": 700,
            "finalPrice": 700,
            "currency": "USD"
          }
        }
      }
    ],
    "count": 5
  },
  "requestId": "req_related_001"
}
```

> **ملاحظة:** بنية مبسطة للمنتجات الشبيهة (نفس بنية القائمة).

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

> ⚠️ **تنبيه مهم:**
>
> - الواجهات تستخدم `name` و `nameEn` (وليس `nameAr`)
> - `category` و `brand` كائنات مبسطة (فقط `_id`, `name`, `nameEn`)
> - `mainImage` و `images` كائنات مبسطة (فقط `_id`, `url`)
> - `pricingByCurrency` موجود في المنتج وكل variant
> - `defaultPricing` و `priceRangeByCurrency` موجودان في المنتج
> - `hasVariants` boolean يحدد إذا كان المنتج يحتوي على variants

### ملف: `lib/models/product/product_models.dart`

```dart
class Category {
  final String id;
  final String name;
  final String nameEn;

  Category({
    required this.id,
    required this.name,
    required this.nameEn,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }
}

class ProductImage {
  final String id;
  final String url;

  ProductImage({
    required this.id,
    required this.url,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: json['_id'] ?? '',
      url: json['url'] ?? '',
    );
  }
}

class AttributeValue {
  final String attributeId;
  final String valueId;
  final String name;
  final String nameEn;
  final String value;
  final String valueEn;

  AttributeValue({
    required this.attributeId,
    required this.valueId,
    required this.name,
    required this.nameEn,
    required this.value,
    required this.valueEn,
  });

  factory AttributeValue.fromJson(Map<String, dynamic> json) {
    return AttributeValue(
      attributeId: json['attributeId'] ?? '',
      valueId: json['valueId'] ?? '',
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      value: json['value'] ?? '',
      valueEn: json['valueEn'] ?? '',
    );
  }
}

class ProductVariant {
  final String id;
  final List<AttributeValue> attributeValues;
  final VariantPricing? pricing; // السعر بالعملة المطلوبة
  final Map<String, VariantPricing>? pricingByCurrency; // الأسعار بجميع العملات
  final bool isActive;
  final bool isAvailable; // متاح للبيع
  final String stockStatus; // حالة المخزون: 'in_stock' أو 'out_of_stock'
  final int stock; // المخزون
  final int salesCount; // عدد المبيعات
  final int minOrderQuantity; // الحد الأدنى للطلب
  final int maxOrderQuantity; // الحد الأقصى للطلب (0 يعني لا يوجد حد)

  ProductVariant({
    required this.id,
    required this.attributeValues,
    this.pricing,
    this.pricingByCurrency,
    required this.isActive,
    required this.isAvailable,
    required this.stockStatus,
    required this.stock,
    required this.salesCount,
    required this.minOrderQuantity,
    required this.maxOrderQuantity,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    VariantPricing? pricingObj;
    if (json['pricing'] != null && json['pricing'] is Map) {
      pricingObj = VariantPricing.fromJson(json['pricing'] as Map<String, dynamic>);
    }

    Map<String, VariantPricing>? pricingByCurrencyMap;
    if (json['pricingByCurrency'] != null && json['pricingByCurrency'] is Map) {
      pricingByCurrencyMap = (json['pricingByCurrency'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(
          key,
          VariantPricing.fromJson(value as Map<String, dynamic>),
        ),
      );
    }

    return ProductVariant(
      id: json['_id'] ?? '',
      attributeValues: (json['attributeValues'] as List?)
              ?.map((e) => AttributeValue.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      pricing: pricingObj,
      pricingByCurrency: pricingByCurrencyMap,
      isActive: json['isActive'] ?? true,
      isAvailable: json['isAvailable'] ?? true,
      stockStatus: json['stockStatus'] ?? 'out_of_stock',
      stock: json['stock'] ?? 0,
      salesCount: json['salesCount'] ?? 0,
      minOrderQuantity: json['minOrderQuantity'] ?? 1,
      maxOrderQuantity: json['maxOrderQuantity'] ?? 0,
    );
  }

  // الحصول على السعر لعملة معينة
  VariantPricing? getPricingForCurrency(String currency) {
    if (pricingByCurrency != null && pricingByCurrency!.containsKey(currency)) {
      return pricingByCurrency![currency];
    }
    return pricing;
  }

  // السعر النهائي (مع الخصم إن وجد)
  double? getFinalPrice(String currency) {
    final price = getPricingForCurrency(currency);
    return price?.finalPrice ?? price?.basePrice;
  }
}

class VariantPricing {
  final String currency;
  final double basePrice;
  final double? compareAtPrice;
  final double discountPercent;
  final double discountAmount;
  final double finalPrice;

  VariantPricing({
    required this.currency,
    required this.basePrice,
    this.compareAtPrice,
    required this.discountPercent,
    required this.discountAmount,
    required this.finalPrice,
  });

  factory VariantPricing.fromJson(Map<String, dynamic> json) {
    return VariantPricing(
      currency: json['currency'] ?? 'USD',
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      compareAtPrice: json['compareAtPrice']?.toDouble(),
      discountPercent: (json['discountPercent'] ?? 0).toDouble(),
      discountAmount: (json['discountAmount'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? json['basePrice'] ?? 0).toDouble(),
    );
  }

  bool get hasDiscount => finalPrice < basePrice || discountPercent > 0;

  double get calculatedDiscountPercent {
    if (discountPercent > 0) return discountPercent;
    if (finalPrice < basePrice) {
      return ((basePrice - finalPrice) / basePrice * 100);
    }
    return 0;
  }
}

class PriceRange {
  final double minPrice;
  final double maxPrice;
  final String currency;
  final bool hasDiscountedVariant;

  PriceRange({
    required this.minPrice,
    required this.maxPrice,
    required this.currency,
    required this.hasDiscountedVariant,
  });

  factory PriceRange.fromJson(Map<String, dynamic> json) {
    return PriceRange(
      minPrice: (json['minPrice'] ?? 0).toDouble(),
      maxPrice: (json['maxPrice'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      hasDiscountedVariant: json['hasDiscountedVariant'] ?? false,
    );
  }
}

class Product {
  final String id;
  final String name;
  final String nameEn;
  final String? description;
  final String? descriptionEn;
  final String status;
  final Category? category;
  final Category? brand; // نفس بنية Category
  final ProductImage? mainImage;
  final List<ProductImage> images;
  final bool isFeatured;
  final bool isNew;
  final bool hasVariants;
  final Map<String, VariantPricing>? pricingByCurrency;
  final VariantPricing? defaultPricing;
  final Map<String, PriceRange>? priceRangeByCurrency;
  final List<ProductVariant>? variants; // في تفاصيل المنتج فقط
  final List<AttributeSummary>? attributesDetails; // في تفاصيل المنتج فقط
  final double? averageRating;
  final int? reviewsCount;
  final int? salesCount; // عدد المبيعات
  final bool? isAvailable; // متاح للبيع
  final int? minOrderQuantity; // الحد الأدنى للطلب
  final int? maxOrderQuantity; // الحد الأقصى للطلب (0 يعني لا يوجد حد)
  final int? stock; // المخزون (للمنتجات البسيطة بدون variants)

  Product({
    required this.id,
    required this.name,
    required this.nameEn,
    this.description,
    this.descriptionEn,
    required this.status,
    this.category,
    this.brand,
    this.mainImage,
    required this.images,
    required this.isFeatured,
    required this.isNew,
    required this.hasVariants,
    this.pricingByCurrency,
    this.defaultPricing,
    this.priceRangeByCurrency,
      this.variants,
      this.attributesDetails,
      this.averageRating,
      this.reviewsCount,
      this.salesCount,
      this.isAvailable,
      this.minOrderQuantity,
      this.maxOrderQuantity,
      this.stock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    Category? categoryObj;
    if (json['category'] != null && json['category'] is Map) {
      categoryObj = Category.fromJson(json['category'] as Map<String, dynamic>);
    } else if (json['categoryId'] != null && json['categoryId'] is Map) {
      categoryObj = Category.fromJson(json['categoryId'] as Map<String, dynamic>);
    }

    Category? brandObj;
    if (json['brand'] != null && json['brand'] is Map) {
      brandObj = Category.fromJson(json['brand'] as Map<String, dynamic>);
    }

    ProductImage? mainImageObj;
    if (json['mainImage'] != null && json['mainImage'] is Map) {
      mainImageObj = ProductImage.fromJson(json['mainImage'] as Map<String, dynamic>);
    } else if (json['mainImageId'] != null && json['mainImageId'] is Map) {
      mainImageObj = ProductImage.fromJson(json['mainImageId'] as Map<String, dynamic>);
    }

    List<ProductImage> imagesList = [];
    if (json['images'] != null && json['images'] is List) {
      imagesList = (json['images'] as List)
          .map((e) => ProductImage.fromJson(e as Map<String, dynamic>))
          .toList();
    } else if (json['imageIds'] != null && json['imageIds'] is List) {
      imagesList = (json['imageIds'] as List)
          .map((e) => ProductImage.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    Map<String, VariantPricing>? pricingByCurrencyMap;
    if (json['pricingByCurrency'] != null && json['pricingByCurrency'] is Map) {
      pricingByCurrencyMap = (json['pricingByCurrency'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(
          key,
          VariantPricing.fromJson(value as Map<String, dynamic>),
        ),
      );
    }

    VariantPricing? defaultPricingObj;
    if (json['defaultPricing'] != null && json['defaultPricing'] is Map) {
      defaultPricingObj = VariantPricing.fromJson(json['defaultPricing'] as Map<String, dynamic>);
    }

    Map<String, PriceRange>? priceRangeMap;
    if (json['priceRangeByCurrency'] != null && json['priceRangeByCurrency'] is Map) {
      priceRangeMap = (json['priceRangeByCurrency'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(
          key,
          PriceRange.fromJson(value as Map<String, dynamic>),
        ),
      );
    }

    List<ProductVariant>? variantsList;
    if (json['variants'] != null && json['variants'] is List) {
      variantsList = (json['variants'] as List)
          .map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    List<AttributeSummary>? attributesDetailsList;
    if (json['attributesDetails'] != null && json['attributesDetails'] is List) {
      attributesDetailsList = (json['attributesDetails'] as List)
          .map((e) => AttributeSummary.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return Product(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      description: json['description'],
      descriptionEn: json['descriptionEn'],
      status: json['status'] ?? 'ACTIVE',
      category: categoryObj,
      brand: brandObj,
      mainImage: mainImageObj,
      images: imagesList,
      isFeatured: json['isFeatured'] ?? false,
      isNew: json['isNew'] ?? false,
      hasVariants: json['hasVariants'] ?? false,
      pricingByCurrency: pricingByCurrencyMap,
      defaultPricing: defaultPricingObj,
      priceRangeByCurrency: priceRangeMap,
      variants: variantsList,
      attributesDetails: attributesDetailsList,
      averageRating: json['averageRating']?.toDouble(),
      reviewsCount: json['reviewsCount'],
      salesCount: json['salesCount'],
      isAvailable: json['isAvailable'],
      minOrderQuantity: json['minOrderQuantity'],
      maxOrderQuantity: json['maxOrderQuantity'],
      stock: json['stock'],
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }

  String? getDescription(String locale) {
    if (locale == 'en') return descriptionEn;
    return description;
  }

  // الحصول على الصورة الرئيسية
  ProductImage? get primaryImage => mainImage ?? (images.isNotEmpty ? images.first : null);

  // الحصول على السعر لعملة معينة
  VariantPricing? getPricingForCurrency(String currency) {
    if (pricingByCurrency != null && pricingByCurrency!.containsKey(currency)) {
      return pricingByCurrency![currency];
    }
    return defaultPricing;
  }

  // السعر الأساسي
  double? getBasePrice(String currency) {
    return getPricingForCurrency(currency)?.basePrice;
  }

  // السعر النهائي
  double? getFinalPrice(String currency) {
    return getPricingForCurrency(currency)?.finalPrice;
  }

  // نطاق الأسعار
  PriceRange? getPriceRange(String currency) {
    if (priceRangeByCurrency != null && priceRangeByCurrency!.containsKey(currency)) {
      return priceRangeByCurrency![currency];
    }
    return null;
  }
}

class AttributeSummary {
  final String id;
  final String name;
  final String nameEn;
  final List<AttributeValueSummary> values;

  AttributeSummary({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.values,
  });

  factory AttributeSummary.fromJson(Map<String, dynamic> json) {
    return AttributeSummary(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      values: (json['values'] as List?)
              ?.map((e) => AttributeValueSummary.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class AttributeValueSummary {
  final String id;
  final String value;
  final String? valueEn;
  final String? hexCode;

  AttributeValueSummary({
    required this.id,
    required this.value,
    this.valueEn,
    this.hexCode,
  });

  factory AttributeValueSummary.fromJson(Map<String, dynamic> json) {
    return AttributeValueSummary(
      id: json['id'] ?? '',
      value: json['value'] ?? '',
      valueEn: json['valueEn'],
      hexCode: json['hexCode'],
    );
  }
}

class PaginatedProducts {
  final List<Product> products;
  final PaginationMeta meta;

  PaginatedProducts({required this.products, required this.meta});

  factory PaginatedProducts.fromJson(Map<String, dynamic> json) {
    // json قد يكون مباشرة response.data أو response.data.data
    final data = json['data'] ?? json;
    final productsList = data is List
        ? data
        : (data['data'] as List? ?? []);

    return PaginatedProducts(
      products: (productsList as List)
          .map((item) => Product.fromJson(item as Map<String, dynamic>))
          .toList(),
      meta: PaginationMeta.fromJson(
        (data is Map && data['meta'] != null)
            ? data['meta'] as Map<String, dynamic>
            : json['meta'] as Map<String, dynamic>,
      ),
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

1. **بنية الـ Response المختلفة:**

   - **قائمة المنتجات** (`/products`, `/products/featured/list`, `/products/new/list`):
     - منتجات مبسطة مع `_id`, `name`, `nameEn`, `category`, `brand`, `mainImage`
     - `pricingByCurrency`: أسعار بجميع العملات
     - `defaultPricing`: السعر الافتراضي (بالعملة المطلوبة)
     - `priceRangeByCurrency`: نطاق الأسعار (للمنتجات ذات variants متعددة)
     - `hasVariants`: boolean يحدد إذا كان المنتج يحتوي على variants
   - **تفاصيل المنتج** (`/products/:id`, `/products/slug/:slug`):
     - `product`: منتج كامل مع `attributesDetails`, `pricingByCurrency`, `priceRangeByCurrency`
     - `variants`: قائمة variants مع `pricing` و `pricingByCurrency`
     - `relatedProducts`: منتجات شبيهة
     - `userDiscount`: معلومات خصم التاجر

2. **اللغات:**

   - جميع النصوص متوفرة بالعربي والإنجليزي
   - استخدام `name` و `nameEn` (وليس `nameAr`)
   - استخدم `getName(locale)` و `getDescription(locale)` للحصول على النص المناسب

3. **الصور:**

   - `mainImage`: كائن مبسط يحتوي على `_id`, `url` (أو `null`)
   - `images`: قائمة كائنات مبسطة (فقط `_id`, `url`)
   - استخدم `primaryImage` getter للحصول على الصورة الرئيسية

4. **Category و Brand:**

   - كائنات مبسطة تحتوي على `_id`, `name`, `nameEn` فقط
   - `brand` قد يكون `null` إذا لم يكن المنتج مرتبط ببراند

5. **Variants:**

   - كل منتج له variants مختلفة (ألوان، أحجام، إلخ)
   - لكل variant `pricing` (بالعملة المطلوبة) و `pricingByCurrency` (بجميع العملات)
   - `attributeValues`: قائمة قيم السمات مع `attributeId`, `valueId`, `name`, `nameEn`, `value`, `valueEn`
   - `isAvailable`: متاح للبيع أم لا (boolean)
   - `stockStatus`: حالة المخزون - `'in_stock'` أو `'out_of_stock'` (string)
   - `stock`: المخزون المتاح (number)
   - `salesCount`: عدد المبيعات (number)
   - `minOrderQuantity`: الحد الأدنى للطلب (افتراضي: 1)
   - `maxOrderQuantity`: الحد الأقصى للطلب (0 يعني لا يوجد حد)
   - **في تفاصيل المنتج (`/products/:id`) وقائمة المتغيرات (`/products/:id/variants`): جميع المتغيرات تظهر حتى لو كانت الكمية 0**، مع `isAvailable: false` و `stockStatus: 'out_of_stock'` للمتغيرات غير المتوفرة
   - **في قائمة المنتجات (`/products`): يتم تصفية variants التي لا تحتوي على مخزون تلقائياً**

6. **الأسعار:**

   - `basePrice`: السعر الأساسي
   - `compareAtPrice`: سعر المقارنة (السعر الأصلي قبل الخصم)
   - `finalPrice`: السعر النهائي بعد تطبيق خصم التاجر وقواعد السعر (إن وجدت)
   - `discountPercent`: نسبة الخصم (من خصم التاجر أو قواعد السعر)
   - `discountAmount`: مبلغ الخصم
   - `pricingByCurrency`: أسعار بجميع العملات (USD, YER, SAR)
   - `priceRangeByCurrency`: نطاق الأسعار لكل عملة (للمنتجات ذات variants متعددة)
   - **قواعد السعر (Price Rules):** يتم تطبيق قواعد السعر تلقائياً على جميع المنتجات في جميع الـ endpoints:
     - إذا تم تطبيق قاعدة سعر على أي عملة (مثل USD)، يتم تطبيق نفس نسبة الخصم على جميع العملات الأخرى (YER, SAR)
     - القيم مقربة إلى منزلتين عشريتين
     - يتم تطبيق قواعد السعر بناءً على شروط مثل: `categoryId`, `currency`, `minQty`, `accountType`
     - يتم تطبيق قواعد السعر على: قائمة المنتجات، تفاصيل المنتج، المنتجات المميزة، المنتجات الجديدة، البحث، منتجات الفئة، والمنتجات ذات الصلة

7. **التوفر والحدود:**

   - `isAvailable`: متاح للبيع أم لا (يتم حسابه تلقائياً بناءً على المخزون والحالة)
   - `stockStatus`: حالة المخزون - `'in_stock'` للمتغيرات المتوفرة، `'out_of_stock'` للمتغيرات غير المتوفرة
   - `salesCount`: عدد المبيعات (يتم تحديثه تلقائياً عند إكمال الطلب)
   - `minOrderQuantity`: الحد الأدنى للطلب (افتراضي: 1)
   - `maxOrderQuantity`: الحد الأقصى للطلب (0 يعني لا يوجد حد)
   - `stock`: المخزون المتاح (للمنتجات البسيطة بدون variants أو للمتغيرات)

8. **خصم التاجر (Merchant Discount):**

   - يتم تطبيقه تلقائياً للمستخدمين المعتمدين كتجار
   - يظهر في `userDiscount.isMerchant` و `userDiscount.discountPercent`
   - يتم خصمه من `finalPrice` مباشرة في الـ response
   - للزوار غير المسجلين: `discountPercent = 0` و `isMerchant = false`
   - يتم تطبيقه على جميع variants تلقائياً
   - **ملاحظة:** قواعد السعر (Price Rules) لها أولوية أعلى من خصم التاجر، وإذا تم تطبيق قاعدة سعر، سيتم استخدام السعر من قاعدة السعر بدلاً من خصم التاجر

9. **Cache:**

   - جميع الـ endpoints مع cache من جهة السيرفر (5-10 دقائق)
   - يمكنك إضافة cache في التطبيق أيضاً

10. **العملات:**

- العملات المدعومة: `USD`, `YER`, `SAR`
- العملة الافتراضية: `USD`
- يمكن تحديد العملة من query parameter `currency` أو من `preferredCurrency` للمستخدم
- `pricingByCurrency` يحتوي دائماً على الأسعار بجميع العملات

---

## 📝 ملاحظات التحديث

> ✅ **تم تحديث هذه الوثيقة بالكامل** لتطابق الكود الفعلي

### التحديثات المضافة في هذه النسخة (آخر تحديث):

1. ✅ **إضافة دعم قواعد السعر (Price Rules):**

   - يتم تطبيق قواعد السعر تلقائياً على جميع المنتجات في جميع الـ endpoints
   - إذا تم تطبيق قاعدة سعر على أي عملة، يتم تطبيق نفس نسبة الخصم على جميع العملات الأخرى
   - القيم مقربة إلى منزلتين عشريتين (`discountPercent`, `discountAmount`, `finalPrice`)
   - يتم تطبيق قواعد السعر بناءً على شروط مثل: `categoryId`, `currency`, `minQty`, `accountType`
   - يتم تطبيق قواعد السعر على: قائمة المنتجات، تفاصيل المنتج، المنتجات المميزة، المنتجات الجديدة، البحث، منتجات الفئة، والمنتجات ذات الصلة
   - قواعد السعر لها أولوية أعلى من خصم التاجر

2. ✅ **إضافة حقول جديدة للمنتجات والـ Variants:**
   - `isAvailable`: متاح للبيع أم لا (boolean)
   - `stockStatus`: حالة المخزون - `'in_stock'` أو `'out_of_stock'` (string)
   - `salesCount`: عدد المبيعات (number) - يتم تحديثه تلقائياً عند إكمال الطلب
   - `minOrderQuantity`: الحد الأدنى للطلب (number، افتراضي: 1)
   - `maxOrderQuantity`: الحد الأقصى للطلب (number، 0 يعني لا يوجد حد)
   - `stock`: المخزون (number، للمنتجات البسيطة بدون variants)
3. ✅ **تحديث سلوك المتغيرات:**
   - **في تفاصيل المنتج (`/products/:id`) وقائمة المتغيرات (`/products/:id/variants`): جميع المتغيرات تظهر حتى لو كانت الكمية 0**، مع `isAvailable: false` و `stockStatus: 'out_of_stock'` للمتغيرات غير المتوفرة
   - **في قائمة المنتجات (`/products`): يتم تصفية variants التي لا تحتوي على مخزون تلقائياً (السلوك القديم)**
4. ✅ **تحديث بنية Response:**
   - استخدام `name` و `nameEn` بدلاً من `nameAr` و `nameEn`
   - `category` و `brand` ككائنات مبسطة (فقط `_id`, `name`, `nameEn`)
   - `mainImage` و `images` ككائنات مبسطة (فقط `_id`, `url`)
   - إضافة `pricingByCurrency`, `defaultPricing`, `priceRangeByCurrency`
   - إضافة `hasVariants` boolean
5. ✅ **تحديث تفاصيل المنتج:**
   - `product` يحتوي على `attributesDetails`, `pricingByCurrency`, `priceRangeByCurrency`
   - `variants` تحتوي على `pricing` و `pricingByCurrency`
   - إضافة `relatedProducts` و `userDiscount`
6. ✅ **إضافة parameters جديدة:**
   - `includeSubcategories` - تضمين المنتجات من الفئات الفرعية (افتراضي: `true`)
   - `sortBy` و `sortOrder` - للترتيب المخصص
   - `currency` - لتحديد العملة المطلوبة
7. ✅ **تحديث الترتيب الافتراضي:**
   - الأحدث أولاً (`createdAt: desc`) تلقائياً

### التحديثات السابقة:

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

### تم التحقق من:

- ✅ جميع الـ 11 endpoints موجودة
- ✅ Query parameters مطابقة
- ✅ Response structures صحيحة ومطابقة للكود الفعلي
- ✅ Cache TTL مطابق (5 min للقائمة، 10 min للتفاصيل)
- ✅ Flutter Models شاملة ومفيدة مع معالجة صحيحة للـ response structures المختلفة
- ✅ دعم خصم التاجر تلقائياً
- ✅ دعم متعدد العملات (USD, YER, SAR)
- ✅ معالجة صحيحة لـ `name` vs `nameAr` و `category`/`brand` structure و `pricingByCurrency`

### الملفات المرجعية:

- **Controller:** `backend/src/modules/products/controllers/public-products.controller.ts`
- **Presenter:** `backend/src/modules/products/services/public-products.presenter.ts`
- **Services:**
  - `backend/src/modules/products/services/product.service.ts`
  - `backend/src/modules/products/services/variant.service.ts`
  - `backend/src/modules/products/services/pricing.service.ts`
  - `backend/src/modules/products/services/inventory.service.ts`

---

**التالي:** [خدمة السلة (Cart)](./04-cart-service.md)
