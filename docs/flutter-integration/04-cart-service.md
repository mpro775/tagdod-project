# 🛒 خدمة السلة (Cart Service)

خدمة السلة الآن تعمل **محلياً بالكامل** داخل تطبيق Flutter، ولا يتم استدعاء الـ API إلا عند رغبة المستخدم في إتمام الطلب. كل عمليات الإضافة والحذف والتحديث تتم على الذاكرة المحلية، ثم يتم إرسال snapshot نهائي للخادم عبر نقطة نهاية واحدة فقط.

> ✅ **تم التحقق وتحديث هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/cart`

---

## 📋 جدول المحتويات

1. [نظرة عامة](#1-نظرة-عامة)
2. [مزامنة السلة الكاملة](#2-مزامنة-السلة-الكاملة)
3. [Models في Flutter](#3-models-في-flutter)
4. [ملاحظات مهمة](#4-ملاحظات-مهمة)

---

## 1. نظرة عامة

- لم يعد هناك اعتماد على الـ endpoints الخاصة بالإضافة والتعديل والحذف (`GET /cart`, `POST /cart/items`, ...إلخ).
- يتم حفظ حالة السلة محلياً (state management في التطبيق) حتى لحظة الضغط على "إتمام الشراء".
- عند الضغط على "إتمام الشراء"، نقوم بإرسال snapshot كامل إلى الخادم باستخدام `POST /cart/sync` ليتم التحقق من الأسعار، الكميات، الخصومات، والعملة المطلوبة قبل الانتقال لمرحلة الـ Checkout.

---

## 2. مزامنة السلة الكاملة

تُستخدم لإرسال السلة المحلية دفعة واحدة إلى الخادم، حيث يتم إعادة بناء السلة الحالية للمستخدم وإعادة احتساب الأسعار والخصومات والتحويلات.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/cart/sync`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "items": [
    { "variantId": "var_789", "qty": 2 },
    { "productId": "prod_456", "qty": 1 }
  ],
  "currency": "SAR",
  "accountType": "merchant"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `items` | `array` | ✅ نعم | قائمة العناصر المطلوب مزامنتها. يمكن إرسال مصفوفة فارغة لمسح السلة. |
| `items[].variantId` | `string` | ✅ نعم (أو `productId`) | معرف المتغير في حالة المنتجات ذات الخيارات. |
| `items[].productId` | `string` | ✅ نعم (أو `variantId`) | معرف المنتج البسيط بدون متغيرات. |
| `items[].qty` | `number` | ✅ نعم | الكمية النهائية لكل عنصر (1-999). |
| `currency` | `string` | ❌ اختياري | العملة المفضلة (`USD`, `YER`, `SAR`). يتم تحويلها إلى uppercase تلقائياً. |
| `accountType` | `string` | ❌ اختياري | نوع الحساب (`retail`, `merchant`, `engineer`). |

> ⚠️ يتم تجاهل أي أسعار مرسلة من الطرف العميل، حيث يُعاد احتساب كل شيء من الباك-إند لضمان دقة الخصومات والكوبونات.

### Response - نجاح

يعيد نفس بنية `GET /cart` مع ملخص الأسعار المحدّث:

```json
{
  "success": true,
  "data": {
    "currency": "SAR",
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2,
        "unit": { "base": 225, "final": 202.5, "currency": "SAR" },
        "lineTotal": 405
      },
      {
        "itemId": "item_002",
        "productId": "prod_456",
        "qty": 1,
        "unit": { "base": 150, "final": 150, "currency": "SAR" },
        "lineTotal": 150
      }
    ],
    "pricingSummaryByCurrency": {
      "SAR": {
        "currency": "SAR",
        "subtotal": 555,
        "total": 552.5,
        "promotionDiscount": 2.5
      }
    }
  },
  "requestId": "req_cart_sync_001"
}
```

### كود Flutter

```dart
Future<CartResponse> syncCart({
  required List<CartSyncItem> items,
  String? currency,
  String? accountType,
}) async {
  final response = await _dio.post(
    '/cart/sync',
    data: {
      'items': items.map((e) => e.toJson()).toList(),
      if (currency != null) 'currency': currency,
      if (accountType != null) 'accountType': accountType,
    },
  );

  final apiResponse = ApiResponse<CartResponse>.fromJson(
    response.data,
    (json) => CartResponse.fromJson(json as Map<String, dynamic>),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. Models في Flutter

### ملف: `lib/models/cart/cart_models.dart`

```dart
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

## 4. ملاحظات مهمة

1. **Local State فقط:** كل عمليات CRUD تتم على state محلي داخل التطبيق (مزود حالة، bloc، Riverpod، ...إلخ).
2. **API وحيد:** لا يتم استدعاء أي endpoint إلا `POST /cart/sync` قبل الطلب، أو `POST /orders/checkout/session` للحصول على ملخص الطلب الكامل بعد المزامنة.
3. **العملات المتعددة:** تأكد من تمرير العملة الصحيحة حسب اختيار المستخدم، وستعود كل الملخصات في الاستجابة.
4. **التحقق من المخزون:** يتم في الباك-إند كجزء من المزامنة، لذا يجب التعامل مع أي أخطاء (مثلاً نفاد المخزون) في شاشة التأكيد قبل الانتقال للدفع.
5. **مزامنة فارغة:** إذا أرسلنا مصفوفة عناصر فارغة، سيتم مسح السلة المخزّنة في الباك-إند وإرجاع ملخص فارغ بالكامل.

---

## 📝 ملاحظات التحديث

> ⚠️ **تم تحديث هذه الوثيقة بالكامل** - التركيز الآن على سيناريو المزامنة فقط

### التغييرات الرئيسية:
1. ✅ إزالة جميع السيناريوهات المتعلقة بإدارة السلة عبر الـ API واستبدالها بمفهوم السلة المحلية.
2. ✅ توثيق تفاصيل `POST /cart/sync` بشكل أوسع، وإبراز كيفية التعامل معها داخل Flutter.
3. ✅ إبقاء نماذج Flutter التي تُستخدم في التعامل مع استجابة المزامنة والملخصات المالية.

### الملفات المرجعية:
- **Controller:** `backend/src/modules/cart/cart.controller.ts`
- **Service:** `backend/src/modules/cart/cart.service.ts`
- **Schema:** `backend/src/modules/cart/schemas/cart.schema.ts`

---

**التالي:** [خدمة الدفع والطلبات (Checkout)](./05-checkout-service.md)

تُستخدم لإرسال السلة المحلية (على الجهاز) دفعة واحدة إلى الخادم عند الضغط على "إتمام الشراء"، حيث يتم إعادة بناء السلة الحالية للمستخدم وإعادة احتساب الأسعار والخصومات.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/cart/sync`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "items": [
    { "variantId": "var_789", "qty": 2 },
    { "productId": "prod_456", "qty": 1 }
  ],
  "currency": "SAR",
  "accountType": "merchant"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `items` | `array` | ✅ نعم | قائمة العناصر المطلوب مزامنتها. يمكن إرسال مصفوفة فارغة لمسح السلة. |
| `items[].variantId` | `string` | ✅ نعم (أو `productId`) | معرف المتغير في حالة المنتجات ذات الخيارات. |
| `items[].productId` | `string` | ✅ نعم (أو `variantId`) | معرف المنتج البسيط بدون متغيرات. |
| `items[].qty` | `number` | ✅ نعم | الكمية النهائية لكل عنصر (1-999). |
| `currency` | `string` | ❌ اختياري | العملة المفضلة (`USD`, `YER`, `SAR`). يتم تحويلها إلى uppercase تلقائياً. |
| `accountType` | `string` | ❌ اختياري | نوع الحساب (`retail`, `merchant`, `engineer`). |

> ⚠️ يتم تجاهل أي أسعار مرسلة من الطرف العميل، حيث يعاد احتساب كل شيء من الباك-إند لضمان دقة الخصومات والكوبونات.

### Response - نجاح

يعيد نفس بنية `GET /cart` مع ملخص الأسعار updated:

```json
{
  "success": true,
  "data": {
    "currency": "SAR",
    "items": [
      {
        "itemId": "item_001",
        "variantId": "var_789",
        "qty": 2,
        "unit": { "base": 225, "final": 202.5, "currency": "SAR" },
        "lineTotal": 405
      },
      {
        "itemId": "item_002",
        "productId": "prod_456",
        "qty": 1,
        "unit": { "base": 150, "final": 150, "currency": "SAR" },
        "lineTotal": 150
      }
    ],
    "pricingSummaryByCurrency": {
      "SAR": {
        "currency": "SAR",
        "subtotal": 555,
        "total": 552.5,
        "promotionDiscount": 2.5
      }
    }
  },
  "requestId": "req_cart_sync_001"
}
```

### كود Flutter

```dart
Future<CartResponse> syncCart({
  required List<CartSyncItem> items,
  String? currency,
  String? accountType,
}) async {
  final response = await _dio.post(
    '/cart/sync',
    data: {
      'items': items.map((e) => e.toJson()).toList(),
      if (currency != null) 'currency': currency,
      if (accountType != null) 'accountType': accountType,
    },
  );

  final apiResponse = ApiResponse<CartResponse>.fromJson(
    response.data,
    (json) => CartResponse.fromJson(json as Map<String, dynamic>),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 6. Models في Flutter

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

-