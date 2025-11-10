# 🛒 خدمة السلة (Cart Service)

خدمة السلة توفر endpoints لإدارة سلة التسوق للمستخدمين المسجلين فقط.

> ✅ **تم التحقق وتحديث هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/cart`

---

## 📋 جدول المحتويات

1. [الحصول على السلة](#1-الحصول-على-السلة)
2. [إضافة منتج للسلة](#2-إضافة-منتج-للسلة)
3. [تحديث كمية منتج](#3-تحديث-كمية-منتج)
4. [حذف منتج من السلة](#4-حذف-منتج-من-السلة)
5. [معاينة السلة (مع الأسعار)](#5-معاينة-السلة-مع-الأسعار)
6. [Models في Flutter](#models-في-flutter)

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
        "productId": "prod_123",
        "qty": 2
      },
      {
        "itemId": "item_002",
        "productId": "prod_456",
        "variantId": null,
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
| `variantId` | `string` | ✅ نعم (أو `productId`) | ID الـ variant المراد إضافته |
| `productId` | `string` | ✅ نعم (أو `variantId`) | معرف المنتج عند عدم وجود متغيرات |
| `qty` | `number` | ✅ نعم | الكمية (يجب أن تكون > 0) |

> **ملاحظة:** أرسل `productId` عند التعامل مع منتج بدون متغيرات، بشرط أن يكون للمنتج سعر افتراضي معرف (`basePriceUSD`).
>
> **ملاحظة إضافية:** العناصر في الرد تحتوي على أحد الحقلين `variantId` أو `productId` (أو كلاهما) بحسب نوع المنتج في السلة.

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

## 5. معاينة السلة (مع الأسعار)

يسترجع ملخص السلة مع حساب الأسعار والخصومات.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/cart/preview`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body (اختياري)

```json
{
  "currency": "USD"
}
```

> إذا لم يتم تمرير `currency` سيتم اعتماد `USD` تلقائياً للعرض، مع توفير ملخص بالعملات الثلاث (USD / YER / SAR) في نفس الاستجابة.

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "currency": "USD",
    "subtotalBeforeDiscount": 160,
    "subtotal": 148,
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2,
        "unit": {
          "base": 60,
          "final": 54,
          "finalBeforeDiscount": 60,
          "currency": "USD",
          "appliedRule": null
        },
        "lineTotal": 108
      },
      {
        "itemId": "item_002",
        "productId": "prod_456",
        "qty": 1,
        "unit": {
          "base": 40,
          "final": 40,
          "finalBeforeDiscount": 40,
          "currency": "USD",
          "appliedRule": null
        },
        "lineTotal": 40
      }
    ],
    "appliedCoupons": [],
    "meta": {
      "count": 2,
      "quantity": 3,
      "merchantDiscountPercent": 0,
      "merchantDiscountAmount": 0
    },
    "totalsInAllCurrencies": {
      "USD": {
        "subtotal": 148,
        "shippingCost": 0,
        "tax": 0,
        "totalDiscount": 12,
        "total": 148
      },
      "YER": {
        "subtotal": 78440,
        "shippingCost": 0,
        "tax": 0,
        "totalDiscount": 6360,
        "total": 78440
      },
      "SAR": {
        "subtotal": 555,
        "shippingCost": 0,
        "tax": 0,
        "totalDiscount": 45,
        "total": 555
      }
    },
    "pricingSummary": {
      "currency": "USD",
      "itemsCount": 3,
      "subtotalBeforeDiscount": 160,
      "subtotal": 148,
      "merchantDiscountAmount": 0,
      "couponDiscount": 0,
      "promotionDiscount": 12,
      "autoDiscount": 0,
      "totalDiscount": 12,
      "total": 148
    },
    "pricingSummaryByCurrency": {
      "USD": {
        "currency": "USD",
        "itemsCount": 3,
        "subtotalBeforeDiscount": 160,
        "subtotal": 148,
        "merchantDiscountAmount": 0,
        "couponDiscount": 0,
        "promotionDiscount": 12,
        "autoDiscount": 0,
        "totalDiscount": 12,
        "total": 148
      },
      "YER": {
        "currency": "YER",
        "itemsCount": 3,
        "subtotalBeforeDiscount": 84800,
        "subtotal": 78440,
        "merchantDiscountAmount": 0,
        "couponDiscount": 0,
        "promotionDiscount": 6360,
        "autoDiscount": 0,
        "totalDiscount": 6360,
        "total": 78440
      },
      "SAR": {
        "currency": "SAR",
        "itemsCount": 3,
        "subtotalBeforeDiscount": 600,
        "subtotal": 555,
        "merchantDiscountAmount": 0,
        "couponDiscount": 0,
        "promotionDiscount": 45,
        "autoDiscount": 0,
        "totalDiscount": 45,
        "total": 555
      }
    }
  },
  "requestId": "req_cart_006"
}
```

### كود Flutter

```dart
Future<CartPreview> previewCart({String? currency}) async {
  final response = await _dio.post(
    '/cart/preview',
    data: {
      if (currency != null) 'currency': currency,
    },
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
  final String? variantId;
  final String? productId;
  final int qty;

  CartItemSimple({
    required this.itemId,
    this.variantId,
    this.productId,
    required this.qty,
  });

  factory CartItemSimple.fromJson(Map<String, dynamic> json) {
    return CartItemSimple(
      itemId: json['itemId'],
      variantId: json['variantId'],
      productId: json['productId'],
      qty: json['qty'],
    );
  }
}

// الـ Response من POST /cart/preview
class CartPreviewMeta {
  final int count;
  final int quantity;
  final double merchantDiscountPercent;
  final double merchantDiscountAmount;

  CartPreviewMeta({
    required this.count,
    required this.quantity,
    required this.merchantDiscountPercent,
    required this.merchantDiscountAmount,
  });

  factory CartPreviewMeta.fromJson(Map<String, dynamic> json) {
    return CartPreviewMeta(
      count: json['count'] ?? 0,
      quantity: json['quantity'] ?? 0,
      merchantDiscountPercent: (json['merchantDiscountPercent'] ?? 0).toDouble(),
      merchantDiscountAmount: (json['merchantDiscountAmount'] ?? 0).toDouble(),
    );
  }
}

class CartTotalsEntry {
  final double subtotal;
  final double shippingCost;
  final double tax;
  final double totalDiscount;
  final double total;

  CartTotalsEntry({
    required this.subtotal,
    required this.shippingCost,
    required this.tax,
    required this.totalDiscount,
    required this.total,
  });

  factory CartTotalsEntry.fromJson(Map<String, dynamic> json) {
    return CartTotalsEntry(
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shippingCost: (json['shippingCost'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      totalDiscount: (json['totalDiscount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}

class CartPricingSummary {
  final String currency;
  final int itemsCount;
  final double subtotalBeforeDiscount;
  final double subtotal;
  final double merchantDiscountAmount;
  final double couponDiscount;
  final double promotionDiscount;
  final double autoDiscount;
  final double totalDiscount;
  final double total;

  CartPricingSummary({
    required this.currency,
    required this.itemsCount,
    required this.subtotalBeforeDiscount,
    required this.subtotal,
    required this.merchantDiscountAmount,
    required this.couponDiscount,
    required this.promotionDiscount,
    required this.autoDiscount,
    required this.totalDiscount,
    required this.total,
  });

  factory CartPricingSummary.fromJson(Map<String, dynamic> json) {
    return CartPricingSummary(
      currency: json['currency'] ?? 'USD',
      itemsCount: json['itemsCount'] ?? 0,
      subtotalBeforeDiscount: (json['subtotalBeforeDiscount'] ?? 0).toDouble(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      merchantDiscountAmount: (json['merchantDiscountAmount'] ?? 0).toDouble(),
      couponDiscount: (json['couponDiscount'] ?? 0).toDouble(),
      promotionDiscount: (json['promotionDiscount'] ?? 0).toDouble(),
      autoDiscount: (json['autoDiscount'] ?? 0).toDouble(),
      totalDiscount: (json['totalDiscount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}

class CartPreview {
  final String currency;
  final double subtotalBeforeDiscount;
  final double subtotal;
  final List<CartLineItem> items;
  final List<String> appliedCoupons;
  final CartPreviewMeta meta;
  final Map<String, CartTotalsEntry> totalsInAllCurrencies;
  final CartPricingSummary pricingSummary;
  final Map<String, CartPricingSummary> pricingSummaryByCurrency;

  CartPreview({
    required this.currency,
    required this.subtotalBeforeDiscount,
    required this.subtotal,
    required this.items,
    required this.appliedCoupons,
    required this.meta,
    required this.totalsInAllCurrencies,
    required this.pricingSummary,
    required this.pricingSummaryByCurrency,
  });

  factory CartPreview.fromJson(Map<String, dynamic> json) {
    return CartPreview(
      currency: json['currency'] ?? 'USD',
      subtotalBeforeDiscount: (json['subtotalBeforeDiscount'] ?? 0).toDouble(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      items: (json['items'] as List)
          .map((item) => CartLineItem.fromJson(item))
          .toList(),
      appliedCoupons: (json['appliedCoupons'] as List? ?? const [])
          .map((coupon) => coupon.toString())
          .toList(),
      meta: CartPreviewMeta.fromJson(json['meta'] ?? const {}),
      totalsInAllCurrencies: (json['totalsInAllCurrencies'] as Map<String, dynamic>? ?? const {})
          .map(
        (key, value) => MapEntry(key, CartTotalsEntry.fromJson(value)),
      ),
      pricingSummary: CartPricingSummary.fromJson(json['pricingSummary'] ?? const {}),
      pricingSummaryByCurrency:
          (json['pricingSummaryByCurrency'] as Map<String, dynamic>? ?? const {}).map(
        (key, value) => MapEntry(key, CartPricingSummary.fromJson(value)),
      ),
    );
  }

  bool get hasDiscounts =>
      pricingSummary.totalDiscount > 0 || pricingSummary.merchantDiscountAmount > 0;
  double get total => pricingSummary.total;
}

class CartLineItem {
  final String itemId;
  final String? variantId;
  final String? productId;
  final int qty;
  final UnitPrice unit;
  final double lineTotal;

  CartLineItem({
    required this.itemId,
    this.variantId,
    this.productId,
    required this.qty,
    required this.unit,
    required this.lineTotal,
  });

  factory CartLineItem.fromJson(Map<String, dynamic> json) {
    return CartLineItem(
      itemId: json['itemId'],
      variantId: json['variantId'],
      productId: json['productId'],
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
  final double? finalBeforeDiscount;
  final String currency;
  final dynamic appliedRule;

  UnitPrice({
    required this.base,
    required this.final,
    this.finalBeforeDiscount,
    required this.currency,
    this.appliedRule,
  });

  factory UnitPrice.fromJson(Map<String, dynamic> json) {
    return UnitPrice(
      base: (json['base'] ?? 0).toDouble(),
      final: (json['final'] ?? 0).toDouble(),
      finalBeforeDiscount: (json['finalBeforeDiscount'] as num?)?.toDouble(),
      currency: json['currency'] ?? 'USD',
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
   - كل عنصر يحتوي على `itemId`, وواحد على الأقل من (`variantId` أو `productId`) بالإضافة إلى `qty`
   - للحصول على الأسعار والتفاصيل، استخدم `/cart/preview`

2. **العملة الافتراضية والملخصات:**
   - إذا لم يتم تمرير `currency` سيتم اعتماد `USD` تلقائياً
   - الاستجابة تتضمن `totalsInAllCurrencies` و `pricingSummaryByCurrency` للعرض السريع بالعملات (USD / YER / SAR)

3. **الأسعار والتفاصيل:**
   - `/cart/preview` يُرجع الأسعار الكاملة والخصومات
   - `unit.base`: السعر الأساسي
   - `unit.final`: السعر النهائي بعد الخصم
   - `unit.finalBeforeDiscount`: السعر قبل أي خصومات مفصل لكل عنصر
   - `lineTotal`: الإجمالي للسطر (unit.final × qty)

4. **Wholesale Discount:**
   - يتم تطبيق خصم التاجر (إن وُجد) تلقائياً ويظهر في `pricingSummary`
   - يمكنك قراءة نسبة الخصم ومبلغها من `meta.merchantDiscountPercent` و `pricingSummary.merchantDiscountAmount`

5. **State Management:**
   - احفظ `items` في local state
   - عند الحاجة للأسعار، استدعِ `/cart/preview`
   - حدّث الـ state بعد كل عملية (add/update/remove)

6. **Error Handling:**
   - الكود الحالي يستخدم `Error` عادي وليس `AppException`
   - قد تحصل على أخطاء عامة بدون كود محدد
   - دائماً تحقق من `success` في الـ response

---

## 📝 ملاحظات التحديث

> ⚠️ **تم تحديث هذه الوثيقة بالكامل** - الوثيقة القديمة كانت تحتوي على response structure مختلف

### التغييرات الرئيسية:
1. ✅ مزامنة جميع الـ Responses مع الباك-إند الحالي (`{ items: [...] }` لعمليات CRUD الأساسية)
2. ✅ توثيق الملخص المالي الجديد في `/cart/preview` بما يتضمن `totalsInAllCurrencies` و `pricingSummaryByCurrency`
3. ✅ تحديث نماذج Flutter لدعم الحقول الجديدة والأسعار المتعددة العملات
4. ✅ إزالة أي إشارات لسلة الزوار من الوثيقة للحفاظ على تركيز واجهة Flutter على المستخدمين المسجلين فقط

### الملفات المرجعية:
- **Controller:** `backend/src/modules/cart/cart.controller.ts`
- **Service:** `backend/src/modules/cart/cart.service.ts`
- **Schema:** `backend/src/modules/cart/schemas/cart.schema.ts`

---

**التالي:** [خدمة الدفع والطلبات (Checkout)](./05-checkout-service.md)

