# 💳 خدمة الدفع والطلبات (Checkout & Orders Service)

خدمة الدفع توفر endpoints لإتمام الطلبات وإدارتها.

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
- **Endpoint:** `/checkout/preview`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "currency": "YER"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `currency` | `string` | ✅ نعم | العملة (`YER`, `USD`, إلخ) |

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
        "unit": {
          "base": 150000,
          "final": 135000,
          "currency": "YER",
          "appliedRule": {
            "type": "percentage",
            "value": 10,
            "name": "خصم العميل المميز"
          }
        },
        "lineTotal": 270000
      }
    ],
    "subtotal": 1120000,
    "shipping": 50000,
    "tax": 0,
    "discount": 150000,
    "total": 1020000,
    "currency": "YER",
    "deliveryOptions": [
      {
        "id": "standard",
        "name": "التوصيل العادي",
        "cost": 50000,
        "estimatedDays": "3-5 أيام"
      },
      {
        "id": "express",
        "name": "التوصيل السريع",
        "cost": 100000,
        "estimatedDays": "1-2 أيام"
      }
    ],
    "meta": {
      "wholesaleDiscountPercent": 10,
      "wholesaleDiscountAmount": 150000,
      "appliedCoupons": ["SUMMER20"],
      "availableCoupons": ["WELCOME10", "FIRSTORDER"]
    }
  },
  "requestId": "req_checkout_001"
}
```

### Response - فشل (سلة فارغة)

```json
{
  "success": false,
  "error": {
    "code": "CART_EMPTY",
    "message": "السلة فارغة",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_checkout_001"
}
```

### كود Flutter

```dart
Future<CheckoutPreview> previewCheckout({
  String currency = 'YER',
}) async {
  final response = await _dio.post(
    '/checkout/preview',
    data: {'currency': currency},
  );

  final apiResponse = ApiResponse<CheckoutPreview>.fromJson(
    response.data,
    (json) => CheckoutPreview.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
- **Endpoint:** `/checkout/confirm`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "currency": "YER",
  "paymentMethod": "CASH_ON_DELIVERY",
  "paymentProvider": null,
  "deliveryAddressId": "addr_123"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `currency` | `string` | ✅ نعم | العملة |
| `paymentMethod` | `string` | ✅ نعم | طريقة الدفع (`CASH_ON_DELIVERY`, `CREDIT_CARD`, إلخ) |
| `paymentProvider` | `string` | ❌ لا | مزود الدفع (إذا كان غير نقدي) |
| `deliveryAddressId` | `string` | ✅ نعم | ID عنوان التوصيل |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "orderId": "order_123",
    "orderNumber": "ORD-2025-001234",
    "status": "pending",
    "totalAmount": 1020000,
    "currency": "YER",
    "paymentUrl": null,
    "estimatedDelivery": "2025-10-20T00:00:00.000Z",
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
      "recipientName": "أحمد محمد",
      "recipientPhone": "777123456",
      "line1": "شارع الزبيري",
      "line2": "عمارة 10 - الطابق الثالث",
      "city": "صنعاء",
      "region": "الحصبة",
      "country": "اليمن",
      "coords": {
        "lat": 15.3694,
        "lng": 44.1910
      },
      "notes": "بجانب مسجد الرحمن"
    },
    "pricing": {
      "subtotal": 1120000,
      "itemsDiscount": 150000,
      "appliedCouponCode": "SUMMER20",
      "couponDiscount": 50000,
      "couponDetails": {
        "code": "SUMMER20",
        "title": "خصم الصيف",
        "type": "percentage"
      },
      "shippingCost": 50000,
      "tax": 0,
      "totalDiscount": 200000,
      "total": 1020000,
      "currency": "YER"
    },
    "paymentMethod": "COD",
    "paymentProvider": null,
    "paymentStatus": "pending",
    "shippingMethod": "standard",
    "customerNotes": "يرجى التوصيل في المساء",
    "statusHistory": [
      {
        "status": "pending",
        "changedAt": "2025-10-15T12:00:00.000Z",
        "changedBy": "user_456",
        "changedByRole": "customer",
        "notes": "تم إنشاء الطلب"
      }
    ],
    "metadata": {
      "cartId": "cart_123",
      "source": "mobile",
      "rating": null,
      "review": null,
      "ratedAt": null
    },
    "createdAt": "2025-10-15T12:00:00.000Z",
    "updatedAt": "2025-10-15T12:00:00.000Z"
  },
  "requestId": "req_checkout_002"
}
```

### Response - فشل (عنوان غير موجود)

```json
{
  "success": false,
  "error": {
    "code": "ADDRESS_NOT_FOUND",
    "message": "العنوان غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_checkout_002"
}
```

### كود Flutter

```dart
Future<OrderConfirmation> confirmCheckout({
  required String currency,
  required String paymentMethod,
  String? paymentProvider,
  required String deliveryAddressId,
}) async {
  final response = await _dio.post(
    '/checkout/confirm',
    data: {
      'currency': currency,
      'paymentMethod': paymentMethod,
      if (paymentProvider != null) 'paymentProvider': paymentProvider,
      'deliveryAddressId': deliveryAddressId,
    },
  );

  final apiResponse = ApiResponse<OrderConfirmation>.fromJson(
    response.data,
    (json) => OrderConfirmation.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
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
  "data": [
    {
      "_id": "order_123",
      "orderNumber": "ORD-2025-001234",
      "status": "PROCESSING",
      "paymentStatus": "PAID",
      "pricing": {
        "total": 1170000,
        "currency": "YER"
      },
      "createdAt": "2025-10-15T12:00:00.000Z"
    },
    {
      "_id": "order_124",
      "orderNumber": "ORD-2025-001235",
      "status": "DELIVERED",
      "paymentStatus": "PAID",
      "pricing": {
        "total": 850000,
        "currency": "YER"
      },
      "createdAt": "2025-10-10T09:00:00.000Z"
    }
  ],
  "meta": null,
  "requestId": "req_orders_001"
}
```

### كود Flutter

```dart
Future<List<Order>> getMyOrders() async {
  final response = await _dio.get('/orders');

  final apiResponse = ApiResponse<List<Order>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Order.fromJson(item))
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
    "_id": "order_123",
    "orderNumber": "ORD-2025-001234",
    "userId": "user_456",
    "status": "PROCESSING",
    "paymentMethod": "CASH_ON_DELIVERY",
    "paymentStatus": "PENDING",
    "items": [
      {
        "variantId": "var_789",
        "productName": {
          "ar": "لوح شمسي 550 واط",
          "en": "Solar Panel 550W"
        },
        "productImage": "https://cdn.example.com/products/solar-panel.jpg",
        "sku": "SP-550-001",
        "qty": 2,
        "unitPrice": 135000,
        "lineTotal": 270000
      }
    ],
    "pricing": {
      "subtotal": 1120000,
      "shipping": 50000,
      "tax": 0,
      "discount": 0,
      "total": 1170000,
      "currency": "YER"
    },
    "deliveryAddress": {
      "fullName": "أحمد محمد",
      "phone": "777123456",
      "city": "صنعاء",
      "district": "الحصبة",
      "street": "شارع الزبيري",
      "building": "عمارة 10",
      "floor": "الطابق الثالث",
      "notes": "بجانب مسجد الرحمن"
    },
    "timeline": [
      {
        "status": "PENDING",
        "timestamp": "2025-10-15T12:00:00.000Z",
        "note": "تم إنشاء الطلب"
      },
      {
        "status": "PROCESSING",
        "timestamp": "2025-10-15T14:30:00.000Z",
        "note": "جاري تحضير الطلب"
      }
    ],
    "createdAt": "2025-10-15T12:00:00.000Z",
    "updatedAt": "2025-10-15T14:30:00.000Z"
  },
  "meta": null,
  "requestId": "req_orders_002"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "الطلب غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_orders_002"
}
```

### كود Flutter

```dart
Future<OrderDetails> getOrderDetails(String orderId) async {
  final response = await _dio.get('/orders/$orderId');

  final apiResponse = ApiResponse<OrderDetails>.fromJson(
    response.data,
    (json) => OrderDetails.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
    "cancelled": true,
    "order": {
      "_id": "order_123",
      "status": "CANCELLED"
    }
  },
  "meta": null,
  "requestId": "req_orders_003"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "ORDER_CANNOT_BE_CANCELLED",
    "message": "لا يمكن إلغاء الطلب في هذه الحالة",
    "details": {
      "currentStatus": "SHIPPED"
    },
    "fieldErrors": null
  },
  "requestId": "req_orders_003"
}
```

### كود Flutter

```dart
Future<bool> cancelOrder(String orderId) async {
  final response = await _dio.post('/orders/$orderId/cancel');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  return apiResponse.isSuccess && 
      apiResponse.data!['cancelled'] == true;
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
  final double tax;
  final double discount;
  final double total;
  final String currency;
  final List<DeliveryOption> deliveryOptions;
  final CheckoutMeta meta;

  CheckoutPreview({
    required this.items,
    required this.subtotal,
    required this.shipping,
    required this.tax,
    required this.discount,
    required this.total,
    required this.currency,
    required this.deliveryOptions,
    required this.meta,
  });

  factory CheckoutPreview.fromJson(Map<String, dynamic> json) {
    return CheckoutPreview(
      items: (json['items'] as List)
          .map((item) => CheckoutItem.fromJson(item))
          .toList(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shipping: (json['shipping'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      deliveryOptions: (json['deliveryOptions'] as List?)
          ?.map((option) => DeliveryOption.fromJson(option))
          .toList() ?? [],
      meta: CheckoutMeta.fromJson(json['meta'] ?? {}),
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

class CheckoutMeta {
  final double wholesaleDiscountPercent;
  final double wholesaleDiscountAmount;
  final List<String> appliedCoupons;
  final List<String> availableCoupons;

  CheckoutMeta({
    required this.wholesaleDiscountPercent,
    required this.wholesaleDiscountAmount,
    required this.appliedCoupons,
    required this.availableCoupons,
  });

  factory CheckoutMeta.fromJson(Map<String, dynamic> json) {
    return CheckoutMeta(
      wholesaleDiscountPercent: (json['wholesaleDiscountPercent'] ?? 0).toDouble(),
      wholesaleDiscountAmount: (json['wholesaleDiscountAmount'] ?? 0).toDouble(),
      appliedCoupons: List<String>.from(json['appliedCoupons'] ?? []),
      availableCoupons: List<String>.from(json['availableCoupons'] ?? []),
    );
  }
}

class OrderPricing {
  final double subtotal;
  final double shipping;
  final double tax;
  final double discount;
  final double total;
  final String currency;

  OrderPricing({
    required this.subtotal,
    required this.shipping,
    required this.tax,
    required this.discount,
    required this.total,
    required this.currency,
  });

  factory OrderPricing.fromJson(Map<String, dynamic> json) {
    return OrderPricing(
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shipping: (json['shipping'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
    );
  }

  bool get hasDiscount => discount > 0;
  double get savings => discount;
}

class OrderConfirmation {
  final String orderId;
  final String orderNumber;
  final String status;
  final double totalAmount;
  final String currency;
  final String? paymentUrl;
  final DateTime? estimatedDelivery;
  final List<OrderItem> items;
  final DeliveryAddress deliveryAddress;
  final OrderPricing pricing;
  final String paymentMethod;
  final String? paymentProvider;
  final String paymentStatus;
  final String? shippingMethod;
  final String? customerNotes;
  final List<OrderStatusHistory> statusHistory;
  final OrderMetadata metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  OrderConfirmation({
    required this.orderId,
    required this.orderNumber,
    required this.status,
    required this.totalAmount,
    required this.currency,
    this.paymentUrl,
    this.estimatedDelivery,
    required this.items,
    required this.deliveryAddress,
    required this.pricing,
    required this.paymentMethod,
    this.paymentProvider,
    required this.paymentStatus,
    this.shippingMethod,
    this.customerNotes,
    required this.statusHistory,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderConfirmation.fromJson(Map<String, dynamic> json) {
    return OrderConfirmation(
      orderId: json['orderId'],
      orderNumber: json['orderNumber'],
      status: json['status'],
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      paymentUrl: json['paymentUrl'],
      estimatedDelivery: json['estimatedDelivery'] != null 
          ? DateTime.parse(json['estimatedDelivery'])
          : null,
      items: (json['items'] as List?)
          ?.map((item) => OrderItem.fromJson(item))
          .toList() ?? [],
      deliveryAddress: DeliveryAddress.fromJson(json['deliveryAddress']),
      pricing: OrderPricing.fromJson(json['pricing']),
      paymentMethod: json['paymentMethod'],
      paymentProvider: json['paymentProvider'],
      paymentStatus: json['paymentStatus'],
      shippingMethod: json['shippingMethod'],
      customerNotes: json['customerNotes'],
      statusHistory: (json['statusHistory'] as List?)
          ?.map((item) => OrderStatusHistory.fromJson(item))
          .toList() ?? [],
      metadata: OrderMetadata.fromJson(json['metadata'] ?? {}),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

class Order {
  final String id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final OrderPricing pricing;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentStatus,
    required this.pricing,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'],
      orderNumber: json['orderNumber'],
      status: json['status'],
      paymentStatus: json['paymentStatus'],
      pricing: OrderPricing.fromJson(json['pricing']),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  // حالات الطلب
  bool get isPending => status == 'PENDING';
  bool get isProcessing => status == 'PROCESSING';
  bool get isShipped => status == 'SHIPPED';
  bool get isDelivered => status == 'DELIVERED';
  bool get isCancelled => status == 'CANCELLED';
  bool get isCompleted => status == 'COMPLETED';

  // يمكن الإلغاء فقط إذا كان PENDING
  bool get canBeCancelled => isPending;

  // لون الحالة
  String getStatusColor() {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'PROCESSING':
        return 'blue';
      case 'SHIPPED':
        return 'purple';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'grey';
    }
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
  final OrderPricing pricing;
  final DeliveryAddress deliveryAddress;
  final List<OrderTimeline>? timeline;
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
    required this.pricing,
    required this.deliveryAddress,
    this.timeline,
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
      pricing: OrderPricing.fromJson(json['pricing']),
      deliveryAddress: DeliveryAddress.fromJson(json['deliveryAddress']),
      timeline: json['timeline'] != null
          ? (json['timeline'] as List)
              .map((item) => OrderTimeline.fromJson(item))
              .toList()
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  int get totalItems => items.fold(0, (sum, item) => sum + item.qty);
}

class OrderItem {
  final String productId;
  final String variantId;
  final int qty;
  final double basePrice;
  final double discount;
  final double finalPrice;
  final double lineTotal;
  final String currency;
  final String? appliedPromotionId;
  final OrderItemSnapshot snapshot;

  OrderItem({
    required this.productId,
    required this.variantId,
    required this.qty,
    required this.basePrice,
    required this.discount,
    required this.finalPrice,
    required this.lineTotal,
    required this.currency,
    this.appliedPromotionId,
    required this.snapshot,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'],
      variantId: json['variantId'],
      qty: json['qty'],
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
      appliedPromotionId: json['appliedPromotionId'],
      snapshot: OrderItemSnapshot.fromJson(json['snapshot']),
    );
  }

  bool get hasDiscount => discount > 0;
  double get discountPercent => hasDiscount ? (discount / basePrice * 100) : 0;
}

class OrderItemSnapshot {
  final String name;
  final String? sku;
  final String slug;
  final String? image;
  final String? brandName;
  final String? categoryName;
  final Map<String, String> attributes;

  OrderItemSnapshot({
    required this.name,
    this.sku,
    required this.slug,
    this.image,
    this.brandName,
    this.categoryName,
    required this.attributes,
  });

  factory OrderItemSnapshot.fromJson(Map<String, dynamic> json) {
    return OrderItemSnapshot(
      name: json['name'] ?? '',
      sku: json['sku'],
      slug: json['slug'] ?? '',
      image: json['image'],
      brandName: json['brandName'],
      categoryName: json['categoryName'],
      attributes: Map<String, String>.from(json['attributes'] ?? {}),
    );
  }
}

class DeliveryAddress {
  final String addressId;
  final String recipientName;
  final String recipientPhone;
  final String line1;
  final String? line2;
  final String city;
  final String? region;
  final String country;
  final DeliveryCoords? coords;
  final String? notes;

  DeliveryAddress({
    required this.addressId,
    required this.recipientName,
    required this.recipientPhone,
    required this.line1,
    this.line2,
    required this.city,
    this.region,
    required this.country,
    this.coords,
    this.notes,
  });

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) {
    return DeliveryAddress(
      addressId: json['addressId'],
      recipientName: json['recipientName'],
      recipientPhone: json['recipientPhone'],
      line1: json['line1'],
      line2: json['line2'],
      city: json['city'],
      region: json['region'],
      country: json['country'],
      coords: json['coords'] != null 
          ? DeliveryCoords.fromJson(json['coords'])
          : null,
      notes: json['notes'],
    );
  }

  String get fullAddress {
    final parts = [
      line1,
      if (line2 != null) line2,
      city,
      if (region != null) region,
      country,
    ];
    return parts.join(', ');
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
  final String? changedBy;
  final String? changedByRole;
  final String? notes;

  OrderStatusHistory({
    required this.status,
    required this.changedAt,
    this.changedBy,
    this.changedByRole,
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

class OrderMetadata {
  final String? cartId;
  final String? source;
  final int? rating;
  final String? review;
  final String? ratedAt;

  OrderMetadata({
    this.cartId,
    this.source,
    this.rating,
    this.review,
    this.ratedAt,
  });

  factory OrderMetadata.fromJson(Map<String, dynamic> json) {
    return OrderMetadata(
      cartId: json['cartId'],
      source: json['source'],
      rating: json['rating'],
      review: json['review'],
      ratedAt: json['ratedAt'],
    );
  }
}
```

---

## 📝 ملاحظات مهمة

1. **حالات الطلب:**
   - `pending`: قيد الانتظار (يمكن الإلغاء)
   - `confirmed`: مؤكد
   - `processing`: جاري التحضير
   - `ready_to_ship`: جاهز للشحن
   - `shipped`: تم الشحن
   - `out_for_delivery`: في الطريق للتوصيل
   - `delivered`: تم التوصيل
   - `completed`: مكتمل
   - `cancelled`: ملغي
   - `refunded`: مسترد
   - `returned`: مرتجع
   - `payment_failed`: فشل الدفع

2. **حالات الدفع:**
   - `pending`: في الانتظار
   - `paid`: مدفوع
   - `failed`: فشل
   - `refunded`: مسترد

3. **طرق الدفع:**
   - `COD`: الدفع عند الاستلام
   - `ONLINE`: الدفع الإلكتروني
   - يمكن إضافة مزودي دفع مختلفين

4. **الخصومات:**
   - `itemsDiscount`: خصم على المنتجات
   - `couponDiscount`: خصم الكوبون
   - `totalDiscount`: إجمالي الخصم
   - `appliedCouponCode`: الكوبون المطبق

5. **تتبع الطلب:**
   - `statusHistory`: تاريخ تغيير الحالات
   - `trackingNumber`: رقم التتبع
   - `trackingUrl`: رابط التتبع
   - `estimatedDeliveryDate`: تاريخ التوصيل المتوقع

6. **الإلغاء:**
   - يمكن إلغاء الطلب فقط في حالة `pending`
   - بعد `processing` يجب التواصل مع الدعم

7. **العنوان:**
   - عنوان التوصيل مطلوب قبل تأكيد الطلب
   - يتضمن إحداثيات GPS للتوصيل الدقيق
   - تأكد من أن المستخدم لديه عنوان نشط

---

**التالي:** [خدمة التصنيفات (Categories)](./06-categories-service.md)

