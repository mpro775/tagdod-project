# 🛒 خدمة السلة (Cart Service)

خدمة السلة توفر endpoints لإدارة سلة التسوق للمستخدمين المسجلين والزوار.

---

## 📋 جدول المحتويات

1. [الحصول على السلة](#1-الحصول-على-السلة)
2. [إضافة منتج للسلة](#2-إضافة-منتج-للسلة)
3. [تحديث كمية منتج](#3-تحديث-كمية-منتج)
4. [حذف منتج من السلة](#4-حذف-منتج-من-السلة)
5. [دمج سلة الزائر مع المستخدم](#5-دمج-سلة-الزائر-مع-المستخدم)
6. [معاينة السلة (مع الأسعار)](#6-معاينة-السلة-مع-الأسعار)
7. [Models في Flutter](#models-في-flutter)

---

## 1. الحصول على السلة

يسترجع سلة المستخدم الحالي.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/cart`
- **Auth Required:** ✅ نعم (Bearer Token)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "cart_123",
    "userId": "user_456",
    "status": "active",
    "items": [
      {
        "_id": "item_001",
        "variantId": "var_789",
        "productId": "prod_123",
        "qty": 2,
        "addedAt": "2025-10-15T10:00:00.000Z",
        "productSnapshot": {
          "name": "لوح شمسي 550 واط",
          "slug": "solar-panel-550w",
          "image": "https://cdn.example.com/products/solar-panel.jpg",
          "brandId": "brand_123",
          "brandName": "SolarTech",
          "categoryId": "cat_123"
        },
        "pricing": {
          "currency": "YER",
          "basePrice": 150000,
          "finalPrice": 135000,
          "discount": 15000,
          "appliedPromotionId": "promo_123"
        }
      },
      {
        "_id": "item_002",
        "variantId": "var_012",
        "productId": "prod_456",
        "qty": 1,
        "addedAt": "2025-10-15T11:30:00.000Z",
        "productSnapshot": {
          "name": "بطارية ليثيوم 10 كيلو واط",
          "slug": "lithium-battery-10kw",
          "image": "https://cdn.example.com/products/battery.jpg",
          "brandId": "brand_456",
          "brandName": "BatteryPro",
          "categoryId": "cat_456"
        },
        "pricing": {
          "currency": "YER",
          "basePrice": 850000,
          "finalPrice": 850000,
          "discount": 0
        }
      }
    ],
    "currency": "YER",
    "accountType": "customer",
    "appliedCouponCode": "SUMMER20",
    "couponDiscount": 50000,
    "autoAppliedCouponCodes": ["WELCOME10"],
    "autoAppliedDiscounts": [25000],
    "pricingSummary": {
      "subtotal": 1000000,
      "promotionDiscount": 15000,
      "couponDiscount": 50000,
      "autoDiscount": 25000,
      "totalDiscount": 90000,
      "total": 910000,
      "itemsCount": 2,
      "currency": "YER",
      "lastCalculatedAt": "2025-10-15T11:30:00.000Z"
    },
    "lastActivityAt": "2025-10-15T11:30:00.000Z",
    "isAbandoned": false,
    "abandonmentEmailsSent": 0,
    "isMerged": false,
    "metadata": {
      "source": "mobile",
      "campaign": "summer_sale",
      "utmSource": "facebook",
      "utmMedium": "social",
      "utmCampaign": "summer2025"
    },
    "expiresAt": "2025-11-15T11:30:00.000Z",
    "createdAt": "2025-10-10T08:00:00.000Z",
    "updatedAt": "2025-10-15T11:30:00.000Z"
  },
  "requestId": "req_cart_001"
}
```

### Response - سلة فارغة

```json
{
  "success": true,
  "data": {
    "_id": "cart_123",
    "userId": "user_456",
    "status": "active",
    "items": [],
    "currency": "YER",
    "accountType": "customer",
    "pricingSummary": {
      "subtotal": 0,
      "promotionDiscount": 0,
      "couponDiscount": 0,
      "autoDiscount": 0,
      "totalDiscount": 0,
      "total": 0,
      "itemsCount": 0,
      "currency": "YER",
      "lastCalculatedAt": "2025-10-10T08:00:00.000Z"
    },
    "lastActivityAt": "2025-10-10T08:00:00.000Z",
    "isAbandoned": false,
    "abandonmentEmailsSent": 0,
    "isMerged": false,
    "metadata": {},
    "expiresAt": "2025-11-10T08:00:00.000Z",
    "createdAt": "2025-10-10T08:00:00.000Z",
    "updatedAt": "2025-10-10T08:00:00.000Z"
  },
  "requestId": "req_cart_001"
}
```

### كود Flutter

```dart
Future<Cart> getCart() async {
  final response = await _dio.get('/cart');

  final apiResponse = ApiResponse<Cart>.fromJson(
    response.data,
    (json) => Cart.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. إضافة منتج للسلة

يضيف منتج جديد أو يزيد الكمية إذا كان موجوداً.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/cart/items`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "variantId": "var_789",
  "qty": 2
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `variantId` | `string` | ✅ نعم | ID الـ variant المراد إضافته |
| `qty` | `number` | ✅ نعم | الكمية (يجب أن تكون > 0) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "cart_123",
    "userId": "user_456",
    "items": [
      {
        "_id": "item_001",
        "variantId": "var_789",
        "qty": 2,
        "addedAt": "2025-10-15T10:00:00.000Z"
        // ... باقي البيانات
      }
    ],
    "itemsCount": 1
  },
  "meta": null,
  "requestId": "req_cart_002"
}
```

### Response - فشل (منتج غير متوفر)

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "المنتج غير متوفر بالكمية المطلوبة",
    "details": {
      "requestedQty": 10,
      "availableQty": 3,
      "variantId": "var_789"
    },
    "fieldErrors": null
  },
  "requestId": "req_cart_002"
}
```

### كود Flutter

```dart
Future<Cart> addToCart({
  required String variantId,
  required int qty,
}) async {
  final response = await _dio.post(
    '/cart/items',
    data: {
      'variantId': variantId,
      'qty': qty,
    },
  );

  final apiResponse = ApiResponse<Cart>.fromJson(
    response.data,
    (json) => Cart.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. تحديث كمية منتج

يحدث كمية منتج موجود في السلة.

### معلومات الطلب

- **Method:** `PATCH`
- **Endpoint:** `/cart/items/:itemId`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "qty": 5
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `qty` | `number` | ✅ نعم | الكمية الجديدة |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "cart_123",
    "items": [
      {
        "_id": "item_001",
        "variantId": "var_789",
        "qty": 5
        // ... باقي البيانات
      }
    ]
  },
  "meta": null,
  "requestId": "req_cart_003"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "CART_ITEM_NOT_FOUND",
    "message": "عنصر السلة غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_cart_003"
}
```

### كود Flutter

```dart
Future<Cart> updateCartItem({
  required String itemId,
  required int qty,
}) async {
  final response = await _dio.patch(
    '/cart/items/$itemId',
    data: {'qty': qty},
  );

  final apiResponse = ApiResponse<Cart>.fromJson(
    response.data,
    (json) => Cart.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. حذف منتج من السلة

يحذف منتج من السلة.

### معلومات الطلب

- **Method:** `DELETE`
- **Endpoint:** `/cart/items/:itemId`
- **Auth Required:** ✅ نعم (Bearer Token)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "cart_123",
    "items": [],
    "itemsCount": 0
  },
  "meta": null,
  "requestId": "req_cart_004"
}
```

### كود Flutter

```dart
Future<Cart> removeFromCart(String itemId) async {
  final response = await _dio.delete('/cart/items/$itemId');

  final apiResponse = ApiResponse<Cart>.fromJson(
    response.data,
    (json) => Cart.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. دمج سلة الزائر مع المستخدم

عند تسجيل الدخول، يدمج سلة الزائر (حسب deviceId) مع سلة المستخدم.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/cart/merge`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "deviceId": "device_abc123"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "cart_123",
    "userId": "user_456",
    "items": [
      // المنتجات المدمجة من السلتين
    ],
    "itemsCount": 3
  },
  "meta": null,
  "requestId": "req_cart_005"
}
```

### كود Flutter

```dart
Future<Cart> mergeCart(String deviceId) async {
  final response = await _dio.post(
    '/cart/merge',
    data: {'deviceId': deviceId},
  );

  final apiResponse = ApiResponse<Cart>.fromJson(
    response.data,
    (json) => Cart.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 6. معاينة السلة (مع الأسعار)

يسترجع ملخص السلة مع حساب الأسعار والخصومات.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/cart/preview`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "currency": "YER"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2,
        "product": {
          "name": {
            "ar": "لوح شمسي 550 واط",
            "en": "Solar Panel 550W"
          }
        },
        "unitPrice": 135000,
        "lineTotal": 270000
      },
      {
        "itemId": "item_002",
        "variantId": "var_012",
        "qty": 1,
        "product": {
          "name": {
            "ar": "بطارية ليثيوم 10 كيلو واط",
            "en": "Lithium Battery 10kW"
          }
        },
        "unitPrice": 850000,
        "lineTotal": 850000
      }
    ],
    "summary": {
      "subtotal": 1120000,
      "shipping": 0,
      "tax": 0,
      "discount": 0,
      "total": 1120000,
      "currency": "YER"
    }
  },
  "meta": null,
  "requestId": "req_cart_006"
}
```

### كود Flutter

```dart
Future<CartPreview> previewCart({
  String currency = 'YER',
}) async {
  final response = await _dio.post(
    '/cart/preview',
    data: {'currency': currency},
  );

  final apiResponse = ApiResponse<CartPreview>.fromJson(
    response.data,
    (json) => CartPreview.fromJson((json as Map<String, dynamic>)['data']),
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

### ملف: `lib/models/cart/cart_models.dart`

```dart
class Cart {
  final String id;
  final String? userId;
  final String status;
  final List<CartItem> items;
  final String currency;
  final String? accountType;
  final String? appliedCouponCode;
  final double couponDiscount;
  final List<String> autoAppliedCouponCodes;
  final List<double> autoAppliedDiscounts;
  final CartPricingSummary? pricingSummary;
  final DateTime? lastActivityAt;
  final bool isAbandoned;
  final int abandonmentEmailsSent;
  final bool isMerged;
  final String? mergedIntoUserId;
  final DateTime? mergedAt;
  final CartMetadata? metadata;
  final DateTime? expiresAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Cart({
    required this.id,
    this.userId,
    required this.status,
    required this.items,
    required this.currency,
    this.accountType,
    this.appliedCouponCode,
    required this.couponDiscount,
    required this.autoAppliedCouponCodes,
    required this.autoAppliedDiscounts,
    this.pricingSummary,
    this.lastActivityAt,
    required this.isAbandoned,
    required this.abandonmentEmailsSent,
    required this.isMerged,
    this.mergedIntoUserId,
    this.mergedAt,
    this.metadata,
    this.expiresAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: json['_id'],
      userId: json['userId'],
      status: json['status'] ?? 'active',
      items: (json['items'] as List?)
          ?.map((item) => CartItem.fromJson(item))
          .toList() ?? [],
      currency: json['currency'] ?? 'YER',
      accountType: json['accountType'],
      appliedCouponCode: json['appliedCouponCode'],
      couponDiscount: (json['couponDiscount'] ?? 0).toDouble(),
      autoAppliedCouponCodes: List<String>.from(json['autoAppliedCouponCodes'] ?? []),
      autoAppliedDiscounts: List<double>.from(json['autoAppliedDiscounts'] ?? []),
      pricingSummary: json['pricingSummary'] != null 
          ? CartPricingSummary.fromJson(json['pricingSummary'])
          : null,
      lastActivityAt: json['lastActivityAt'] != null 
          ? DateTime.parse(json['lastActivityAt'])
          : null,
      isAbandoned: json['isAbandoned'] ?? false,
      abandonmentEmailsSent: json['abandonmentEmailsSent'] ?? 0,
      isMerged: json['isMerged'] ?? false,
      mergedIntoUserId: json['mergedIntoUserId'],
      mergedAt: json['mergedAt'] != null 
          ? DateTime.parse(json['mergedAt'])
          : null,
      metadata: json['metadata'] != null 
          ? CartMetadata.fromJson(json['metadata'])
          : null,
      expiresAt: json['expiresAt'] != null 
          ? DateTime.parse(json['expiresAt'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isEmpty => items.isEmpty;
  bool get isNotEmpty => items.isNotEmpty;

  // الحصول على عنصر محدد
  CartItem? getItem(String itemId) {
    try {
      return items.firstWhere((item) => item.id == itemId);
    } catch (e) {
      return null;
    }
  }

  // إجمالي عدد القطع
  int get totalQuantity {
    return items.fold(0, (sum, item) => sum + item.qty);
  }

  // إجمالي السعر
  double get totalPrice => pricingSummary?.total ?? 0.0;
}

class CartItem {
  final String id;
  final String variantId;
  final String? productId;
  final int qty;
  final DateTime addedAt;
  final CartItemProductSnapshot? productSnapshot;
  final CartItemPricing? pricing;

  CartItem({
    required this.id,
    required this.variantId,
    this.productId,
    required this.qty,
    required this.addedAt,
    this.productSnapshot,
    this.pricing,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['_id'],
      variantId: json['variantId'],
      productId: json['productId'],
      qty: json['qty'],
      addedAt: DateTime.parse(json['addedAt']),
      productSnapshot: json['productSnapshot'] != null 
          ? CartItemProductSnapshot.fromJson(json['productSnapshot'])
          : null,
      pricing: json['pricing'] != null 
          ? CartItemPricing.fromJson(json['pricing'])
          : null,
    );
  }

  // السعر الإجمالي للسطر
  double get lineTotal {
    if (pricing == null) return 0.0;
    return pricing!.finalPrice * qty;
  }

  // هل هناك خصم
  bool get hasDiscount => pricing?.discount != null && pricing!.discount > 0;
}

class CartItemProductSnapshot {
  final String name;
  final String slug;
  final String? image;
  final String? brandId;
  final String? brandName;
  final String? categoryId;

  CartItemProductSnapshot({
    required this.name,
    required this.slug,
    this.image,
    this.brandId,
    this.brandName,
    this.categoryId,
  });

  factory CartItemProductSnapshot.fromJson(Map<String, dynamic> json) {
    return CartItemProductSnapshot(
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      image: json['image'],
      brandId: json['brandId'],
      brandName: json['brandName'],
      categoryId: json['categoryId'],
    );
  }
}

class CartItemPricing {
  final String currency;
  final double basePrice;
  final double finalPrice;
  final double discount;
  final String? appliedPromotionId;

  CartItemPricing({
    required this.currency,
    required this.basePrice,
    required this.finalPrice,
    required this.discount,
    this.appliedPromotionId,
  });

  factory CartItemPricing.fromJson(Map<String, dynamic> json) {
    return CartItemPricing(
      currency: json['currency'] ?? 'YER',
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      appliedPromotionId: json['appliedPromotionId'],
    );
  }

  bool get hasDiscount => discount > 0;
  double get discountPercent => 
      hasDiscount ? (discount / basePrice * 100) : 0;
}

class CartPricingSummary {
  final double subtotal;
  final double promotionDiscount;
  final double couponDiscount;
  final double autoDiscount;
  final double totalDiscount;
  final double total;
  final int itemsCount;
  final String currency;
  final DateTime lastCalculatedAt;

  CartPricingSummary({
    required this.subtotal,
    required this.promotionDiscount,
    required this.couponDiscount,
    required this.autoDiscount,
    required this.totalDiscount,
    required this.total,
    required this.itemsCount,
    required this.currency,
    required this.lastCalculatedAt,
  });

  factory CartPricingSummary.fromJson(Map<String, dynamic> json) {
    return CartPricingSummary(
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      promotionDiscount: (json['promotionDiscount'] ?? 0).toDouble(),
      couponDiscount: (json['couponDiscount'] ?? 0).toDouble(),
      autoDiscount: (json['autoDiscount'] ?? 0).toDouble(),
      totalDiscount: (json['totalDiscount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      itemsCount: json['itemsCount'] ?? 0,
      currency: json['currency'] ?? 'YER',
      lastCalculatedAt: DateTime.parse(json['lastCalculatedAt']),
    );
  }

  bool get hasDiscount => totalDiscount > 0;
  double get savingsAmount => totalDiscount;
}

class CartMetadata {
  final String? source;
  final String? campaign;
  final String? referrer;
  final String? utmSource;
  final String? utmMedium;
  final String? utmCampaign;

  CartMetadata({
    this.source,
    this.campaign,
    this.referrer,
    this.utmSource,
    this.utmMedium,
    this.utmCampaign,
  });

  factory CartMetadata.fromJson(Map<String, dynamic> json) {
    return CartMetadata(
      source: json['source'],
      campaign: json['campaign'],
      referrer: json['referrer'],
      utmSource: json['utmSource'],
      utmMedium: json['utmMedium'],
      utmCampaign: json['utmCampaign'],
    );
  }
}

class CartPreview {
  final List<CartPreviewItem> items;
  final CartSummary summary;

  CartPreview({
    required this.items,
    required this.summary,
  });

  factory CartPreview.fromJson(Map<String, dynamic> json) {
    return CartPreview(
      items: (json['items'] as List)
          .map((item) => CartPreviewItem.fromJson(item))
          .toList(),
      summary: CartSummary.fromJson(json['summary']),
    );
  }
}

class CartPreviewItem {
  final String itemId;
  final String variantId;
  final int qty;
  final CartItemProductSnapshot product;
  final double unitPrice;
  final double lineTotal;

  CartPreviewItem({
    required this.itemId,
    required this.variantId,
    required this.qty,
    required this.product,
    required this.unitPrice,
    required this.lineTotal,
  });

  factory CartPreviewItem.fromJson(Map<String, dynamic> json) {
    return CartPreviewItem(
      itemId: json['itemId'],
      variantId: json['variantId'],
      qty: json['qty'],
      product: CartItemProductSnapshot.fromJson(json['product']),
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
    );
  }
}

class CartSummary {
  final double subtotal;
  final double shipping;
  final double tax;
  final double discount;
  final double total;
  final String currency;

  CartSummary({
    required this.subtotal,
    required this.shipping,
    required this.tax,
    required this.discount,
    required this.total,
    required this.currency,
  });

  factory CartSummary.fromJson(Map<String, dynamic> json) {
    return CartSummary(
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shipping: (json['shipping'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
    );
  }

  bool get hasDiscount => discount > 0;
  double get savingsAmount => discount;
}
```

---

## 📝 ملاحظات مهمة

1. **سلة الزائر vs المستخدم:**
   - للزوار: استخدم `deviceId` وخزن السلة محلياً
   - عند تسجيل الدخول: استدعِ `/cart/merge` لدمج السلتين

2. **البيانات المخزنة:**
   - `productSnapshot`: معلومات المنتج المحفوظة في السلة
   - `pricing`: الأسعار المحفوظة مع الخصومات
   - `pricingSummary`: ملخص شامل للأسعار

3. **تحديث السلة:**
   - بعد أي عملية، يتم إرجاع السلة الكاملة محدثة
   - احفظها في State Management (Provider, Bloc, إلخ)

4. **الأسعار والخصومات:**
   - `basePrice`: السعر الأساسي
   - `finalPrice`: السعر النهائي بعد الخصم
   - `discount`: مبلغ الخصم
   - `appliedPromotionId`: ID العرض المطبق

5. **الكوبونات:**
   - `appliedCouponCode`: الكوبون المطبق يدوياً
   - `autoAppliedCouponCodes`: الكوبونات المطبقة تلقائياً
   - `couponDiscount`: إجمالي خصم الكوبونات

6. **تتبع النشاط:**
   - `lastActivityAt`: آخر نشاط في السلة
   - `isAbandoned`: هل السلة مهجورة
   - `abandonmentEmailsSent`: عدد رسائل التذكير المرسلة

7. **معالجة الأخطاء:**
   - `PRODUCT_OUT_OF_STOCK`: اعرض الكمية المتوفرة
   - `CART_ITEM_NOT_FOUND`: قم بتحديث السلة
   - `VARIANT_NOT_FOUND`: المنتج قد يكون محذوف

---

**التالي:** [خدمة الدفع والطلبات (Checkout)](./05-checkout-service.md)

