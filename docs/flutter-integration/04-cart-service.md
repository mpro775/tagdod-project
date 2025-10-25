# 🛒 خدمة السلة (Cart Service)

خدمة السلة توفر endpoints لإدارة سلة التسوق للمستخدمين المسجلين والزوار.

> ✅ **تم التحقق وتحديث هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/cart`

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
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2
      },
      {
        "itemId": "item_002",
        "variantId": "var_012",
        "qty": 1
      }
    ]
  },
  "requestId": "req_cart_001"
}
```

> **ملاحظة:** الـ response يحتوي على قائمة بسيطة من العناصر فقط. للحصول على التفاصيل الكاملة والأسعار، استخدم `/cart/preview`

### Response - سلة فارغة

```json
{
  "success": true,
  "data": {
    "items": []
  },
  "requestId": "req_cart_001"
}
```

### كود Flutter

```dart
Future<CartItemsResponse> getCart() async {
  final response = await _dio.get('/cart');

  final apiResponse = ApiResponse<CartItemsResponse>.fromJson(
    response.data,
    (json) => CartItemsResponse.fromJson(json as Map<String, dynamic>),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class CartItemsResponse {
  final List<CartItemSimple> items;

  CartItemsResponse({required this.items});

  factory CartItemsResponse.fromJson(Map<String, dynamic> json) {
    return CartItemsResponse(
      items: (json['items'] as List)
          .map((item) => CartItemSimple.fromJson(item))
          .toList(),
    );
  }
}

class CartItemSimple {
  final String itemId;
  final String variantId;
  final int qty;

  CartItemSimple({
    required this.itemId,
    required this.variantId,
    required this.qty,
  });

  factory CartItemSimple.fromJson(Map<String, dynamic> json) {
    return CartItemSimple(
      itemId: json['itemId'],
      variantId: json['variantId'],
      qty: json['qty'],
    );
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
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2
      }
    ]
  },
  "requestId": "req_cart_002"
}
```

### Response - فشل (منتج غير موجود)

```json
{
  "success": false,
  "error": {
    "code": "VARIANT_NOT_FOUND",
    "message": "المتغير غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_cart_002"
}
```

> **ملاحظة:** الكود الحالي لا يتحقق من المخزون عند الإضافة. التحقق يتم في مرحلة الـ Checkout.

### كود Flutter

```dart
Future<CartItemsResponse> addToCart({
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

  final apiResponse = ApiResponse<CartItemsResponse>.fromJson(
    response.data,
    (json) => CartItemsResponse.fromJson(json as Map<String, dynamic>),
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
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 5
      }
    ]
  },
  "requestId": "req_cart_003"
}
```

> **ملاحظة:** إذا لم يتم العثور على العنصر، يتم إرجاع السلة كما هي بدون رمي خطأ.

### كود Flutter

```dart
Future<CartItemsResponse> updateCartItem({
  required String itemId,
  required int qty,
}) async {
  final response = await _dio.patch(
    '/cart/items/$itemId',
    data: {'qty': qty},
  );

  final apiResponse = ApiResponse<CartItemsResponse>.fromJson(
    response.data,
    (json) => CartItemsResponse.fromJson(json as Map<String, dynamic>),
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
    "items": []
  },
  "requestId": "req_cart_004"
}
```

### كود Flutter

```dart
Future<CartItemsResponse> removeFromCart(String itemId) async {
  final response = await _dio.delete('/cart/items/$itemId');

  final apiResponse = ApiResponse<CartItemsResponse>.fromJson(
    response.data,
    (json) => CartItemsResponse.fromJson(json as Map<String, dynamic>),
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
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2
      },
      {
        "itemId": "item_002",
        "variantId": "var_012",
        "qty": 1
      }
    ]
  },
  "requestId": "req_cart_005"
}
```

### كود Flutter

```dart
Future<CartItemsResponse> mergeCart(String deviceId) async {
  final response = await _dio.post(
    '/cart/merge',
    data: {'deviceId': deviceId},
  );

  final apiResponse = ApiResponse<CartItemsResponse>.fromJson(
    response.data,
    (json) => CartItemsResponse.fromJson(json as Map<String, dynamic>),
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
    "currency": "YER",
    "subtotal": 1120000,
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2,
        "unit": {
          "base": 150000,
          "final": 135000,
          "currency": "YER",
          "appliedRule": null
        },
        "lineTotal": 270000
      },
      {
        "itemId": "item_002",
        "variantId": "var_012",
        "qty": 1,
        "unit": {
          "base": 850000,
          "final": 850000,
          "currency": "YER",
          "appliedRule": null
        },
        "lineTotal": 850000
      }
    ],
    "meta": {
      "count": 2,
      "wholesaleDiscountPercent": 0,
      "wholesaleDiscountAmount": 0
    }
  },
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
    (json) => CartPreview.fromJson(json as Map<String, dynamic>),
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
// الـ Response البسيط من GET, POST, PATCH, DELETE
class CartItemsResponse {
  final List<CartItemSimple> items;

  CartItemsResponse({required this.items});

  factory CartItemsResponse.fromJson(Map<String, dynamic> json) {
    return CartItemsResponse(
      items: (json['items'] as List)
          .map((item) => CartItemSimple.fromJson(item))
          .toList(),
    );
  }

  bool get isEmpty => items.isEmpty;
  bool get isNotEmpty => items.isNotEmpty;
  int get totalQuantity => items.fold(0, (sum, item) => sum + item.qty);
}

class CartItemSimple {
  final String itemId;
  final String variantId;
  final int qty;

  CartItemSimple({
    required this.itemId,
    required this.variantId,
    required this.qty,
  });

  factory CartItemSimple.fromJson(Map<String, dynamic> json) {
    return CartItemSimple(
      itemId: json['itemId'],
      variantId: json['variantId'],
      qty: json['qty'],
    );
  }
}

// الـ Response من POST /cart/preview
class CartPreviewMeta {
  final int count;
  final double wholesaleDiscountPercent;
  final double wholesaleDiscountAmount;

  CartPreviewMeta({
    required this.count,
    required this.wholesaleDiscountPercent,
    required this.wholesaleDiscountAmount,
  });

  factory CartPreviewMeta.fromJson(Map<String, dynamic> json) {
    return CartPreviewMeta(
      count: json['count'] ?? 0,
      wholesaleDiscountPercent: (json['wholesaleDiscountPercent'] ?? 0).toDouble(),
      wholesaleDiscountAmount: (json['wholesaleDiscountAmount'] ?? 0).toDouble(),
    );
  }
}

class CartPreview {
  final String currency;
  final double subtotal;
  final List<CartLineItem> items;
  final CartPreviewMeta meta;

  CartPreview({
    required this.currency,
    required this.subtotal,
    required this.items,
    required this.meta,
  });

  factory CartPreview.fromJson(Map<String, dynamic> json) {
    return CartPreview(
      currency: json['currency'] ?? 'YER',
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      items: (json['items'] as List)
          .map((item) => CartLineItem.fromJson(item))
          .toList(),
      meta: CartPreviewMeta.fromJson(json['meta']),
    );
  }

  bool get hasWholesaleDiscount => meta.wholesaleDiscountPercent > 0;
  double get total => subtotal; // في الحالي، total = subtotal
}

class CartLineItem {
  final String itemId;
  final String variantId;
  final int qty;
  final UnitPrice unit;
  final double lineTotal;

  CartLineItem({
    required this.itemId,
    required this.variantId,
    required this.qty,
    required this.unit,
    required this.lineTotal,
  });

  factory CartLineItem.fromJson(Map<String, dynamic> json) {
    return CartLineItem(
      itemId: json['itemId'],
      variantId: json['variantId'],
      qty: json['qty'],
      unit: UnitPrice.fromJson(json['unit']),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
    );
  }

  bool get hasDiscount => unit.final < unit.base;
}

class UnitPrice {
  final double base;
  final double final;
  final String currency;
  final dynamic appliedRule;

  UnitPrice({
    required this.base,
    required this.final,
    required this.currency,
    this.appliedRule,
  });

  factory UnitPrice.fromJson(Map<String, dynamic> json) {
    return UnitPrice(
      base: (json['base'] ?? 0).toDouble(),
      final: (json['final'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      appliedRule: json['appliedRule'],
    );
  }

  bool get hasDiscount => final < base;
  double get discountAmount => base - final;
  double get discountPercent => hasDiscount ? ((base - final) / base * 100) : 0;
}
```

---

## 📝 ملاحظات مهمة

1. **Response Structure البسيط:**
   - GET, POST, PATCH, DELETE تُرجع فقط `{ items: [...] }`
   - كل item يحتوي على: `itemId`, `variantId`, `qty`
   - للحصول على الأسعار والتفاصيل، استخدم `/cart/preview`

2. **سلة الزائر vs المستخدم:**
   - للزوار: استخدم endpoints في `/cart/guest` مع `deviceId`
   - للمستخدمين: استخدم endpoints في `/cart` مع Bearer Token
   - عند تسجيل الدخول: استدعِ `/cart/merge` لدمج السلتين

3. **الأسعار والتفاصيل:**
   - `/cart/preview` يُرجع الأسعار الكاملة والخصومات
   - `unit.base`: السعر الأساسي
   - `unit.final`: السعر النهائي بعد الخصم
   - `lineTotal`: الإجمالي للسطر (unit.final × qty)

4. **Wholesale Discount:**
   - إذا كان المستخدم تاجر جملة، يتم تطبيق الخصم تلقائياً في preview
   - `wholesaleDiscountPercent`: نسبة الخصم
   - `wholesaleDiscountAmount`: مبلغ الخصم

5. **State Management:**
   - احفظ `items` في local state
   - عند الحاجة للأسعار، استدعِ `/cart/preview`
   - حدّث الـ state بعد كل عملية (add/update/remove)

6. **Error Handling:**
   - الكود الحالي يستخدم `Error` عادي وليس `AppException`
   - قد تحصل على أخطاء عامة بدون كود محدد
   - دائماً تحقق من `success` في الـ response

7. **Endpoints للزوار:**
   - `GET /cart/guest?deviceId=xxx`
   - `POST /cart/guest/items` (مع deviceId في body)
   - `PATCH /cart/guest/items/:itemId` (مع deviceId في body)
   - `DELETE /cart/guest/items/:itemId?deviceId=xxx`
   - `POST /cart/guest/preview` (مع deviceId في body)

---

## 📝 ملاحظات التحديث

> ⚠️ **تم تحديث هذه الوثيقة بالكامل** - الوثيقة القديمة كانت تحتوي على response structure مختلف

### التغييرات الرئيسية:
1. ✅ تحديث جميع الـ Responses لتُرجع `{ items: [...] }` فقط
2. ✅ تحديث `/cart/preview` response ليطابق الكود (currency, subtotal, items, meta)
3. ✅ تحديث Flutter Models لتطابق البنية الفعلية
4. ✅ إزالة حقول غير موجودة في Response (pricingSummary, currency, appliedCouponCode)
5. ✅ إضافة ملاحظة عن guest cart endpoints

### الملفات المرجعية:
- **Controller:** `backend/src/modules/cart/cart.controller.ts`
- **Service:** `backend/src/modules/cart/cart.service.ts`
- **Schema:** `backend/src/modules/cart/schemas/cart.schema.ts`

---

**التالي:** [خدمة الدفع والطلبات (Checkout)](./05-checkout-service.md)

