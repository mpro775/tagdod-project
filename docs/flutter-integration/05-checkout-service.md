# 💳 خدمة الدفع والطلبات (Checkout & Orders Service)

خدمة الدفع توفر endpoints لإتمام الطلبات وإدارتها.

> ✅ **تم التحقق وتحديث هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/checkout`

---

## 📋 جدول المحتويات

1. [معاينة الطلب](#1-معاينة-الطلب)
2. [تأكيد الطلب](#2-تأكيد-الطلب)
3. [قائمة طلباتي](#3-قائمة-طلباتي)
4. [تفاصيل طلب](#4-تفاصيل-طلب)
5. [إلغاء طلب](#5-إلغاء-طلب)
6. [Models في Flutter](#models-في-flutter)

---

## 1. معاينة الطلب

يسترجع معاينة الطلب قبل التأكيد مع الأسعار النهائية.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/orders/checkout/preview`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "currency": "YER",
  "couponCode": "SUMMER20"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `currency` | `string` | ✅ نعم | العملة (`YER`, `USD`, إلخ) |
| `couponCode` | `string` | ❌ لا | كود الكوبون (اختياري) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "preview": {
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
        }
      ],
      "subtotal": 1120000,
      "shipping": 0,
      "total": 1120000,
      "currency": "YER",
      "deliveryOptions": [],
      "appliedCoupon": {
        "code": "SUMMER20",
        "name": "خصم الصيف",
        "discountValue": 10,
        "type": "percentage"
      },
      "couponDiscount": 112000
    },
    "message": "تم إنشاء معاينة الطلب بنجاح"
  },
  "requestId": "req_checkout_001"
}
```

> **ملاحظة:** 
> - `shipping` افتراضياً 0 (يتم تحديده لاحقاً من قبل الأدمن)
> - `deliveryOptions` فارغة حالياً
> - `total = subtotal - couponDiscount + shipping`

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "فشل في معاينة الطلب",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_checkout_001"
}
```

> **ملاحظة:** الكود الحالي يرمي `BadRequestException` عامة وليس أكواد خطأ محددة

### كود Flutter

```dart
Future<CheckoutPreview> previewCheckout({
  String currency = 'YER',
  String? couponCode,
}) async {
  final response = await _dio.post(
    '/orders/checkout/preview',
    data: {
      'currency': currency,
      if (couponCode != null) 'couponCode': couponCode,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return CheckoutPreview.fromJson(apiResponse.data!['preview']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. تأكيد الطلب

يؤكد الطلب ويقوم بإنشائه.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/orders/checkout/confirm`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "currency": "YER",
  "paymentMethod": "COD",
  "paymentProvider": null,
  "deliveryAddressId": "addr_123",
  "shippingMethod": "standard",
  "customerNotes": "يرجى التوصيل في المساء",
  "couponCode": "SUMMER20"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `currency` | `string` | ✅ نعم | العملة |
| `paymentMethod` | `string` | ✅ نعم | طريقة الدفع (`COD`, `ONLINE`) |
| `paymentProvider` | `string` | ❌ لا | مزود الدفع (إذا كان ONLINE) |
| `deliveryAddressId` | `string` | ✅ نعم | ID عنوان التوصيل |
| `shippingMethod` | `string` | ❌ لا | طريقة الشحن (standard, express) |
| `customerNotes` | `string` | ❌ لا | ملاحظات العميل |
| `couponCode` | `string` | ❌ لا | كود الكوبون |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "order": {
      "orderId": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-2025-001234",
      "status": "pending_payment",
      "payment": {
        "intentId": "pi_123456",
        "provider": "stripe",
        "amount": 1120000,
        "signature": "sig_abc123"
      }
    },
    "message": "تم إنشاء الطلب بنجاح"
  },
  "requestId": "req_checkout_002"
}
```

> **ملاحظة:** الـ response البسيط يحتوي فقط على `orderId`, `orderNumber`, `status`, و `payment` (إذا كان online). للحصول على تفاصيل كاملة، استخدم `GET /orders/:id`

### Response الكامل (من GET /orders/:id)

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_123",
      "orderNumber": "ORD-2025-001234",
      "userId": "user_456",
      "status": "pending_payment",
      "paymentStatus": "pending",
      "paymentMethod": "COD",
      "items": [
      {
        "productId": "prod_123",
        "variantId": "var_789",
        "qty": 2,
        "basePrice": 150000,
        "discount": 15000,
        "finalPrice": 135000,
        "lineTotal": 270000,
        "currency": "YER",
        "appliedPromotionId": "promo_123",
        "snapshot": {
          "name": "لوح شمسي 550 واط",
          "sku": "SP-550-001",
          "slug": "solar-panel-550w",
          "image": "https://cdn.example.com/products/solar-panel.jpg",
          "brandName": "SolarTech",
          "categoryName": "الألواح الشمسية",
          "attributes": {
            "color": "أسود",
            "size": "2m x 1m"
          }
        }
      }
    ],
    "deliveryAddress": {
      "addressId": "addr_123",
      "label": "المنزل",
      "line1": "شارع الزبيري",
      "city": "صنعاء",
      "coords": {
        "lat": 15.3694,
        "lng": 44.1910
      },
      "notes": "بجانب مسجد الرحمن"
    },
    "subtotal": 1120000,
    "total": 1120000,
    "currency": "YER",
    "shippingMethod": "standard",
    "customerNotes": "يرجى التوصيل في المساء",
    "statusHistory": [
      {
        "status": "pending_payment",
        "changedAt": "2025-10-15T12:00:00.000Z",
        "changedBy": "user_456",
        "changedByRole": "customer",
        "notes": "تم إنشاء الطلب"
      }
    ],
    "createdAt": "2025-10-15T12:00:00.000Z",
    "updatedAt": "2025-10-15T12:00:00.000Z"
    },
    "message": "تم الحصول على تفاصيل الطلب"
  },
  "requestId": "req_checkout_002"
}
```

### Response - فشل (عنوان غير موجود)

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Address not found or invalid",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_checkout_002"
}
```

### كود Flutter

```dart
Future<OrderConfirmationResponse> confirmCheckout({
  required String currency,
  required String paymentMethod,
  String? paymentProvider,
  required String deliveryAddressId,
  String? shippingMethod,
  String? customerNotes,
  String? couponCode,
}) async {
  final response = await _dio.post(
    '/orders/checkout/confirm',
    data: {
      'currency': currency,
      'paymentMethod': paymentMethod,
      if (paymentProvider != null) 'paymentProvider': paymentProvider,
      'deliveryAddressId': deliveryAddressId,
      if (shippingMethod != null) 'shippingMethod': shippingMethod,
      if (customerNotes != null) 'customerNotes': customerNotes,
      if (couponCode != null) 'couponCode': couponCode,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return OrderConfirmationResponse.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class OrderConfirmationResponse {
  final String orderId;
  final String orderNumber;
  final String status;
  final PaymentInfo? payment;
  final String message;

  OrderConfirmationResponse({
    required this.orderId,
    required this.orderNumber,
    required this.status,
    this.payment,
    required this.message,
  });

  factory OrderConfirmationResponse.fromJson(Map<String, dynamic> json) {
    final order = json['order'] as Map<String, dynamic>;
    return OrderConfirmationResponse(
      orderId: order['orderId'],
      orderNumber: order['orderNumber'],
      status: order['status'],
      payment: order['payment'] != null 
          ? PaymentInfo.fromJson(order['payment'])
          : null,
      message: json['message'] ?? '',
    );
  }
}

class PaymentInfo {
  final String intentId;
  final String? provider;
  final double amount;
  final String signature;

  PaymentInfo({
    required this.intentId,
    this.provider,
    required this.amount,
    required this.signature,
  });

  factory PaymentInfo.fromJson(Map<String, dynamic> json) {
    return PaymentInfo(
      intentId: json['intentId'],
      provider: json['provider'],
      amount: (json['amount'] ?? 0).toDouble(),
      signature: json['signature'],
    );
  }
}
```

---

## 3. قائمة طلباتي

يسترجع جميع طلبات المستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/orders`
- **Auth Required:** ✅ نعم (Bearer Token)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "order_123",
        "orderNumber": "ORD-2025-001234",
        "status": "processing",
        "paymentStatus": "paid",
        "total": 1170000,
        "currency": "YER",
        "createdAt": "2025-10-15T12:00:00.000Z"
      },
      {
        "_id": "order_124",
        "orderNumber": "ORD-2025-001235",
        "status": "delivered",
        "paymentStatus": "paid",
        "total": 850000,
        "currency": "YER",
        "createdAt": "2025-10-10T09:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    },
    "message": "تم الحصول على الطلبات بنجاح"
  },
  "requestId": "req_orders_001"
}
```

### كود Flutter

```dart
Future<OrdersListResponse> getMyOrders({
  int page = 1,
  int limit = 10,
}) async {
  final response = await _dio.get(
    '/orders',
    queryParameters: {
      'page': page,
      'limit': limit,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return OrdersListResponse.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class OrdersListResponse {
  final List<OrderSummary> orders;
  final PaginationInfo pagination;
  final String message;

  OrdersListResponse({
    required this.orders,
    required this.pagination,
    required this.message,
  });

  factory OrdersListResponse.fromJson(Map<String, dynamic> json) {
    return OrdersListResponse(
      orders: (json['orders'] as List)
          .map((item) => OrderSummary.fromJson(item))
          .toList(),
      pagination: PaginationInfo.fromJson(json['pagination']),
      message: json['message'] ?? '',
    );
  }
}

class OrderSummary {
  final String id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final double total;
  final String currency;
  final DateTime createdAt;

  OrderSummary({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentStatus,
    required this.total,
    required this.currency,
    required this.createdAt,
  });

  factory OrderSummary.fromJson(Map<String, dynamic> json) {
    return OrderSummary(
      id: json['_id'],
      orderNumber: json['orderNumber'],
      status: json['status'],
      paymentStatus: json['paymentStatus'],
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class PaginationInfo {
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginationInfo({
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginationInfo.fromJson(Map<String, dynamic> json) {
    return PaginationInfo(
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 10,
      totalPages: json['totalPages'] ?? 1,
    );
  }
}
```

---

## 4. تفاصيل طلب

يسترجع تفاصيل طلب محدد.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/orders/:id`
- **Auth Required:** ✅ نعم (Bearer Token)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_123",
      "orderNumber": "ORD-2025-001234",
      "userId": "user_456",
      "status": "processing",
      "paymentMethod": "COD",
      "paymentStatus": "pending",
      "items": [
        {
          "productId": "prod_123",
          "variantId": "var_789",
          "qty": 2,
          "basePrice": 150000,
          "finalPrice": 135000,
          "lineTotal": 270000,
          "currency": "YER",
          "snapshot": {
            "name": "لوح شمسي 550 واط",
            "sku": "SP-550-001",
            "slug": "solar-panel-550w",
            "attributes": {}
          }
        }
      ],
      "deliveryAddress": {
        "addressId": "addr_123",
        "label": "المنزل",
        "line1": "شارع الزبيري",
        "city": "صنعاء",
        "coords": {
          "lat": 15.3694,
          "lng": 44.1910
        },
        "notes": "بجانب مسجد الرحمن"
      },
      "subtotal": 1120000,
      "total": 1120000,
      "currency": "YER",
      "statusHistory": [
        {
          "status": "pending_payment",
          "changedAt": "2025-10-15T12:00:00.000Z",
          "changedBy": "user_456",
          "changedByRole": "customer",
          "notes": "تم إنشاء الطلب"
        }
      ],
      "createdAt": "2025-10-15T12:00:00.000Z",
      "updatedAt": "2025-10-15T14:30:00.000Z"
    },
    "message": "تم الحصول على تفاصيل الطلب"
  },
  "requestId": "req_orders_002"
}
```

### كود Flutter

```dart
Future<OrderDetails> getOrderDetails(String orderId) async {
  final response = await _dio.get('/orders/$orderId');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return OrderDetails.fromJson(apiResponse.data!['order']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. إلغاء طلب

يلغي طلب (يجب أن يكون في حالة PENDING).

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/orders/:id/cancel`
- **Auth Required:** ✅ نعم (Bearer Token)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_123",
      "orderNumber": "ORD-2025-001234",
      "status": "cancelled",
      "paymentStatus": "pending"
    },
    "message": "تم إلغاء الطلب بنجاح"
  },
  "requestId": "req_orders_003"
}
```

### كود Flutter

```dart
Future<OrderDetails> cancelOrder(String orderId, {String? reason}) async {
  final response = await _dio.post(
    '/orders/$orderId/cancel',
    data: {
      if (reason != null) 'reason': reason,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return OrderDetails.fromJson(apiResponse.data!['order']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/order/order_models.dart`

```dart
class CheckoutPreview {
  final List<CheckoutItem> items;
  final double subtotal;
  final double shipping;
  final double total;
  final String currency;
  final List<DeliveryOption> deliveryOptions;
  final CouponInfo? appliedCoupon;
  final double couponDiscount;

  CheckoutPreview({
    required this.items,
    required this.subtotal,
    required this.shipping,
    required this.total,
    required this.currency,
    required this.deliveryOptions,
    this.appliedCoupon,
    required this.couponDiscount,
  });

  factory CheckoutPreview.fromJson(Map<String, dynamic> json) {
    return CheckoutPreview(
      items: (json['items'] as List)
          .map((item) => CheckoutItem.fromJson(item))
          .toList(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shipping: (json['shipping'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      deliveryOptions: (json['deliveryOptions'] as List?)
          ?.map((option) => DeliveryOption.fromJson(option))
          .toList() ?? [],
      appliedCoupon: json['appliedCoupon'] != null
          ? CouponInfo.fromJson(json['appliedCoupon'])
          : null,
      couponDiscount: (json['couponDiscount'] ?? 0).toDouble(),
    );
  }

  bool get hasCoupon => appliedCoupon != null;
  double get totalDiscount => couponDiscount;
}

class CouponInfo {
  final String code;
  final String name;
  final double discountValue;
  final String type;

  CouponInfo({
    required this.code,
    required this.name,
    required this.discountValue,
    required this.type,
  });

  factory CouponInfo.fromJson(Map<String, dynamic> json) {
    return CouponInfo(
      code: json['code'],
      name: json['name'],
      discountValue: (json['discountValue'] ?? 0).toDouble(),
      type: json['type'],
    );
  }
}

class CheckoutItem {
  final String itemId;
  final String variantId;
  final int qty;
  final CheckoutUnit unit;
  final double lineTotal;

  CheckoutItem({
    required this.itemId,
    required this.variantId,
    required this.qty,
    required this.unit,
    required this.lineTotal,
  });

  factory CheckoutItem.fromJson(Map<String, dynamic> json) {
    return CheckoutItem(
      itemId: json['itemId'],
      variantId: json['variantId'],
      qty: json['qty'],
      unit: CheckoutUnit.fromJson(json['unit']),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
    );
  }
}

class CheckoutUnit {
  final double base;
  final double final;
  final String currency;
  final CheckoutAppliedRule? appliedRule;

  CheckoutUnit({
    required this.base,
    required this.final,
    required this.currency,
    this.appliedRule,
  });

  factory CheckoutUnit.fromJson(Map<String, dynamic> json) {
    return CheckoutUnit(
      base: (json['base'] ?? 0).toDouble(),
      final: (json['final'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      appliedRule: json['appliedRule'] != null 
          ? CheckoutAppliedRule.fromJson(json['appliedRule'])
          : null,
    );
  }

  bool get hasDiscount => final < base;
  double get discountAmount => base - final;
  double get discountPercent => hasDiscount ? (discountAmount / base * 100) : 0;
}

class CheckoutAppliedRule {
  final String type;
  final double value;
  final String name;

  CheckoutAppliedRule({
    required this.type,
    required this.value,
    required this.name,
  });

  factory CheckoutAppliedRule.fromJson(Map<String, dynamic> json) {
    return CheckoutAppliedRule(
      type: json['type'] ?? '',
      value: (json['value'] ?? 0).toDouble(),
      name: json['name'] ?? '',
    );
  }
}

class DeliveryOption {
  final String id;
  final String name;
  final double cost;
  final String estimatedDays;

  DeliveryOption({
    required this.id,
    required this.name,
    required this.cost,
    required this.estimatedDays,
  });

  factory DeliveryOption.fromJson(Map<String, dynamic> json) {
    return DeliveryOption(
      id: json['id'],
      name: json['name'],
      cost: (json['cost'] ?? 0).toDouble(),
      estimatedDays: json['estimatedDays'],
    );
  }
}


class OrderDetails {
  final String id;
  final String orderNumber;
  final String userId;
  final String status;
  final String paymentMethod;
  final String paymentStatus;
  final List<OrderItem> items;
  final DeliveryAddress deliveryAddress;
  final double subtotal;
  final double total;
  final String currency;
  final List<OrderStatusHistory> statusHistory;
  final DateTime createdAt;
  final DateTime updatedAt;

  OrderDetails({
    required this.id,
    required this.orderNumber,
    required this.userId,
    required this.status,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.items,
    required this.deliveryAddress,
    required this.subtotal,
    required this.total,
    required this.currency,
    required this.statusHistory,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderDetails.fromJson(Map<String, dynamic> json) {
    return OrderDetails(
      id: json['_id'],
      orderNumber: json['orderNumber'],
      userId: json['userId'],
      status: json['status'],
      paymentMethod: json['paymentMethod'],
      paymentStatus: json['paymentStatus'],
      items: (json['items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList(),
      deliveryAddress: DeliveryAddress.fromJson(json['deliveryAddress']),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      statusHistory: (json['statusHistory'] as List)
          .map((item) => OrderStatusHistory.fromJson(item))
          .toList(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  int get totalItems => items.fold(0, (sum, item) => sum + item.qty);
  bool get isPending => status == 'pending_payment';
  bool get canBeCancelled => status == 'pending_payment' || status == 'confirmed';
}

class OrderItem {
  final String? productId;
  final String variantId;
  final int qty;
  final double basePrice;
  final double finalPrice;
  final double lineTotal;
  final String currency;
  final OrderItemSnapshot snapshot;

  OrderItem({
    this.productId,
    required this.variantId,
    required this.qty,
    required this.basePrice,
    required this.finalPrice,
    required this.lineTotal,
    required this.currency,
    required this.snapshot,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'],
      variantId: json['variantId'],
      qty: json['qty'],
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      snapshot: OrderItemSnapshot.fromJson(json['snapshot']),
    );
  }

  bool get hasDiscount => finalPrice < basePrice;
  double get discountAmount => basePrice - finalPrice;
}

class OrderItemSnapshot {
  final String name;
  final String slug;
  final String? sku;
  final Map<String, dynamic> attributes;

  OrderItemSnapshot({
    required this.name,
    required this.slug,
    this.sku,
    required this.attributes,
  });

  factory OrderItemSnapshot.fromJson(Map<String, dynamic> json) {
    return OrderItemSnapshot(
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      sku: json['sku'],
      attributes: Map<String, dynamic>.from(json['attributes'] ?? {}),
    );
  }
}

class DeliveryAddress {
  final String addressId;
  final String? label;
  final String line1;
  final String city;
  final DeliveryCoords? coords;
  final String? notes;

  DeliveryAddress({
    required this.addressId,
    this.label,
    required this.line1,
    required this.city,
    this.coords,
    this.notes,
  });

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) {
    return DeliveryAddress(
      addressId: json['addressId'],
      label: json['label'],
      line1: json['line1'],
      city: json['city'],
      coords: json['coords'] != null 
          ? DeliveryCoords.fromJson(json['coords'])
          : null,
      notes: json['notes'],
    );
  }
}

class DeliveryCoords {
  final double lat;
  final double lng;

  DeliveryCoords({
    required this.lat,
    required this.lng,
  });

  factory DeliveryCoords.fromJson(Map<String, dynamic> json) {
    return DeliveryCoords(
      lat: (json['lat'] ?? 0).toDouble(),
      lng: (json['lng'] ?? 0).toDouble(),
    );
  }
}

class OrderStatusHistory {
  final String status;
  final DateTime changedAt;
  final String changedBy;
  final String changedByRole;
  final String? notes;

  OrderStatusHistory({
    required this.status,
    required this.changedAt,
    required this.changedBy,
    required this.changedByRole,
    this.notes,
  });

  factory OrderStatusHistory.fromJson(Map<String, dynamic> json) {
    return OrderStatusHistory(
      status: json['status'],
      changedAt: DateTime.parse(json['changedAt']),
      changedBy: json['changedBy'],
      changedByRole: json['changedByRole'],
      notes: json['notes'],
    );
  }
}
```

---

## 📝 ملاحظات مهمة

1. **Endpoints:**
   - Checkout endpoints في `/orders/checkout/...` وليس `/checkout/...`
   - Orders endpoints في `/orders/...`

2. **حالات الطلب:**
   - `draft`: مسودة
   - `pending_payment`: في انتظار الدفع (يمكن الإلغاء)
   - `confirmed`: مؤكد (يمكن الإلغاء)
   - `processing`: جاري التحضير
   - `ready_to_ship`: جاهز للشحن
   - `shipped`: تم الشحن
   - `out_for_delivery`: في الطريق للتوصيل
   - `delivered`: تم التسليم
   - `completed`: مكتمل
   - `cancelled`: ملغي
   - `refunded`: مسترد
   - `returned`: مرتجع

3. **حالات الدفع:**
   - `pending`: في الانتظار
   - `paid`: مدفوع
   - `failed`: فشل
   - `refunded`: مسترد

4. **طرق الدفع:**
   - `COD`: الدفع عند الاستلام (يتم التأكيد فوراً)
   - `ONLINE`: الدفع الإلكتروني (يحتاج تأكيد الدفع)

5. **الشحن:**
   - `shipping` افتراضياً 0
   - يتم تحديد رسوم الشحن من قبل الأدمن لكل طلب
   - `deliveryOptions` فارغة حالياً (قيد التطوير)

6. **الإلغاء:**
   - يمكن الإلغاء في حالة `pending_payment` أو `confirmed`
   - بعد `processing` لا يمكن الإلغاء

7. **Endpoints إضافية:**
   - `GET /orders/recent?limit=5` - الطلبات الأخيرة
   - `GET /orders/:id/track` - تتبع الطلب
   - `POST /orders/:id/rate` - تقييم الطلب
   - `POST /orders/:id/notes` - إضافة ملاحظات
   - `GET /orders/stats/summary` - إحصائيات الطلبات

---

## 📝 ملاحظات التحديث

> ⚠️ **تم تحديث هذه الوثيقة بالكامل** - الوثيقة القديمة كانت تحتوي على endpoints وresponses مختلفة

### التغييرات الرئيسية:
1. ✅ تصحيح endpoints من `/checkout/...` إلى `/orders/checkout/...`
2. ✅ تحديث preview response ليطابق الكود
3. ✅ تحديث confirm response (بسيط جداً - فقط orderId, orderNumber, status)
4. ✅ تحديث orders list response (يحتوي على pagination)
5. ✅ تحديث Flutter Models لتطابق البنية الفعلية
6. ✅ إضافة ملاحظة عن endpoints إضافية

### الملفات المرجعية:
- **Controller:** `backend/src/modules/checkout/controllers/order.controller.ts`
- **Service:** `backend/src/modules/checkout/services/order.service.ts`

---

**التالي:** [خدمة التصنيفات (Categories)](./06-categories-service.md)

