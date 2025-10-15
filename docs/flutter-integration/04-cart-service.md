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
    "items": [
      {
        "_id": "item_001",
        "variantId": "var_789",
        "qty": 2,
        "addedAt": "2025-10-15T10:00:00.000Z",
        "product": {
          "name": {
            "ar": "لوح شمسي 550 واط",
            "en": "Solar Panel 550W"
          },
          "image": "https://cdn.example.com/products/solar-panel.jpg",
          "sku": "SP-550-001"
        },
        "pricing": {
          "currency": "YER",
          "basePrice": 150000,
          "salePrice": 135000
        },
        "availability": {
          "inStock": true,
          "available": 45,
          "maxQty": 45
        }
      },
      {
        "_id": "item_002",
        "variantId": "var_012",
        "qty": 1,
        "addedAt": "2025-10-15T11:30:00.000Z",
        "product": {
          "name": {
            "ar": "بطارية ليثيوم 10 كيلو واط",
            "en": "Lithium Battery 10kW"
          },
          "image": "https://cdn.example.com/products/battery.jpg",
          "sku": "BAT-10K-001"
        },
        "pricing": {
          "currency": "YER",
          "basePrice": 850000,
          "salePrice": null
        },
        "availability": {
          "inStock": true,
          "available": 12,
          "maxQty": 12
        }
      }
    ],
    "itemsCount": 2,
    "createdAt": "2025-10-10T08:00:00.000Z",
    "updatedAt": "2025-10-15T11:30:00.000Z"
  },
  "meta": null,
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
    "items": [],
    "itemsCount": 0,
    "createdAt": "2025-10-10T08:00:00.000Z",
    "updatedAt": "2025-10-10T08:00:00.000Z"
  },
  "meta": null,
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
  final String userId;
  final List<CartItem> items;
  final int itemsCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Cart({
    required this.id,
    required this.userId,
    required this.items,
    required this.itemsCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: json['_id'],
      userId: json['userId'],
      items: (json['items'] as List)
          .map((item) => CartItem.fromJson(item))
          .toList(),
      itemsCount: json['itemsCount'] ?? json['items'].length,
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
}

class CartItem {
  final String id;
  final String variantId;
  final int qty;
  final DateTime addedAt;
  final CartItemProduct product;
  final CartItemPricing pricing;
  final CartItemAvailability availability;

  CartItem({
    required this.id,
    required this.variantId,
    required this.qty,
    required this.addedAt,
    required this.product,
    required this.pricing,
    required this.availability,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['_id'],
      variantId: json['variantId'],
      qty: json['qty'],
      addedAt: DateTime.parse(json['addedAt']),
      product: CartItemProduct.fromJson(json['product']),
      pricing: CartItemPricing.fromJson(json['pricing']),
      availability: CartItemAvailability.fromJson(json['availability']),
    );
  }

  // السعر الإجمالي للسطر
  double get lineTotal {
    final price = pricing.salePrice ?? pricing.basePrice;
    return price * qty;
  }

  // هل يمكن زيادة الكمية
  bool get canIncreaseQty => qty < availability.maxQty;

  // الكمية المتوفرة للإضافة
  int get availableToAdd => availability.maxQty - qty;
}

class CartItemProduct {
  final LocalizedString name;
  final String image;
  final String sku;

  CartItemProduct({
    required this.name,
    required this.image,
    required this.sku,
  });

  factory CartItemProduct.fromJson(Map<String, dynamic> json) {
    return CartItemProduct(
      name: LocalizedString.fromJson(json['name']),
      image: json['image'] ?? '',
      sku: json['sku'] ?? '',
    );
  }
}

class CartItemPricing {
  final String currency;
  final double basePrice;
  final double? salePrice;

  CartItemPricing({
    required this.currency,
    required this.basePrice,
    this.salePrice,
  });

  factory CartItemPricing.fromJson(Map<String, dynamic> json) {
    return CartItemPricing(
      currency: json['currency'],
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      salePrice: json['salePrice']?.toDouble(),
    );
  }

  bool get hasDiscount => salePrice != null && salePrice! < basePrice;
  double get finalPrice => salePrice ?? basePrice;
  double get discountAmount => hasDiscount ? basePrice - salePrice! : 0;
  double get discountPercent => 
      hasDiscount ? (discountAmount / basePrice * 100) : 0;
}

class CartItemAvailability {
  final bool inStock;
  final int available;
  final int maxQty;

  CartItemAvailability({
    required this.inStock,
    required this.available,
    required this.maxQty,
  });

  factory CartItemAvailability.fromJson(Map<String, dynamic> json) {
    return CartItemAvailability(
      inStock: json['inStock'] ?? false,
      available: json['available'] ?? 0,
      maxQty: json['maxQty'] ?? 0,
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
  final CartItemProduct product;
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
      product: CartItemProduct.fromJson(json['product']),
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

2. **التحقق من التوفر:**
   - تحقق من `availability.inStock` قبل إضافة المنتج
   - استخدم `availability.maxQty` لمعرفة الحد الأقصى

3. **تحديث السلة:**
   - بعد أي عملية، يتم إرجاع السلة الكاملة محدثة
   - احفظها في State Management (Provider, Bloc, إلخ)

4. **الأسعار:**
   - الأسعار في السلة قد تتغير (عروض، خصومات)
   - استخدم `/cart/preview` للحصول على الأسعار المحدثة

5. **معالجة الأخطاء:**
   - `PRODUCT_OUT_OF_STOCK`: اعرض الكمية المتوفرة
   - `CART_ITEM_NOT_FOUND`: قم بتحديث السلة
   - `VARIANT_NOT_FOUND`: المنتج قد يكون محذوف

---

**التالي:** [خدمة الدفع والطلبات (Checkout)](./05-checkout-service.md)

