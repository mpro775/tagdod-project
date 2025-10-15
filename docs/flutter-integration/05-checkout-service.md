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
        "variantId": "var_789",
        "productName": {
          "ar": "لوح شمسي 550 واط",
          "en": "Solar Panel 550W"
        },
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
    "paymentMethods": ["CASH_ON_DELIVERY", "CREDIT_CARD"],
    "needsAddress": true
  },
  "meta": null,
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
    "order": {
      "_id": "order_123",
      "orderNumber": "ORD-2025-001234",
      "userId": "user_456",
      "status": "PENDING",
      "items": [
        {
          "variantId": "var_789",
          "productName": {
            "ar": "لوح شمسي 550 واط",
            "en": "Solar Panel 550W"
          },
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
      "paymentMethod": "CASH_ON_DELIVERY",
      "paymentStatus": "PENDING",
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
      "createdAt": "2025-10-15T12:00:00.000Z",
      "updatedAt": "2025-10-15T12:00:00.000Z"
    },
    "paymentIntent": null
  },
  "meta": null,
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
  final OrderPricing pricing;
  final List<String> paymentMethods;
  final bool needsAddress;

  CheckoutPreview({
    required this.items,
    required this.pricing,
    required this.paymentMethods,
    required this.needsAddress,
  });

  factory CheckoutPreview.fromJson(Map<String, dynamic> json) {
    return CheckoutPreview(
      items: (json['items'] as List)
          .map((item) => CheckoutItem.fromJson(item))
          .toList(),
      pricing: OrderPricing.fromJson(json['pricing']),
      paymentMethods: List<String>.from(json['paymentMethods'] ?? []),
      needsAddress: json['needsAddress'] ?? true,
    );
  }
}

class CheckoutItem {
  final String variantId;
  final LocalizedString productName;
  final int qty;
  final double unitPrice;
  final double lineTotal;

  CheckoutItem({
    required this.variantId,
    required this.productName,
    required this.qty,
    required this.unitPrice,
    required this.lineTotal,
  });

  factory CheckoutItem.fromJson(Map<String, dynamic> json) {
    return CheckoutItem(
      variantId: json['variantId'],
      productName: LocalizedString.fromJson(json['productName']),
      qty: json['qty'],
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
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
  final OrderDetails order;
  final dynamic paymentIntent;

  OrderConfirmation({
    required this.order,
    this.paymentIntent,
  });

  factory OrderConfirmation.fromJson(Map<String, dynamic> json) {
    return OrderConfirmation(
      order: OrderDetails.fromJson(json['order']),
      paymentIntent: json['paymentIntent'],
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
  final String variantId;
  final LocalizedString productName;
  final String productImage;
  final String sku;
  final int qty;
  final double unitPrice;
  final double lineTotal;

  OrderItem({
    required this.variantId,
    required this.productName,
    required this.productImage,
    required this.sku,
    required this.qty,
    required this.unitPrice,
    required this.lineTotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      variantId: json['variantId'],
      productName: LocalizedString.fromJson(json['productName']),
      productImage: json['productImage'] ?? '',
      sku: json['sku'] ?? '',
      qty: json['qty'],
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
    );
  }
}

class DeliveryAddress {
  final String fullName;
  final String phone;
  final String city;
  final String district;
  final String street;
  final String? building;
  final String? floor;
  final String? notes;

  DeliveryAddress({
    required this.fullName,
    required this.phone,
    required this.city,
    required this.district,
    required this.street,
    this.building,
    this.floor,
    this.notes,
  });

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) {
    return DeliveryAddress(
      fullName: json['fullName'],
      phone: json['phone'],
      city: json['city'],
      district: json['district'],
      street: json['street'],
      building: json['building'],
      floor: json['floor'],
      notes: json['notes'],
    );
  }

  String get fullAddress {
    final parts = [
      city,
      district,
      street,
      if (building != null) building,
      if (floor != null) floor,
    ];
    return parts.join(', ');
  }
}

class OrderTimeline {
  final String status;
  final DateTime timestamp;
  final String? note;

  OrderTimeline({
    required this.status,
    required this.timestamp,
    this.note,
  });

  factory OrderTimeline.fromJson(Map<String, dynamic> json) {
    return OrderTimeline(
      status: json['status'],
      timestamp: DateTime.parse(json['timestamp']),
      note: json['note'],
    );
  }
}
```

---

## 📝 ملاحظات مهمة

1. **حالات الطلب:**
   - `PENDING`: قيد الانتظار (يمكن الإلغاء)
   - `PROCESSING`: جاري التحضير
   - `SHIPPED`: تم الشحن
   - `DELIVERED`: تم التوصيل
   - `COMPLETED`: مكتمل
   - `CANCELLED`: ملغي

2. **طرق الدفع:**
   - `CASH_ON_DELIVERY`: الدفع عند الاستلام
   - `CREDIT_CARD`: بطاقة ائتمان
   - يمكن إضافة طرق أخرى حسب Integration

3. **الإلغاء:**
   - يمكن إلغاء الطلب فقط في حالة `PENDING`
   - بعد `PROCESSING` يجب التواصل مع الدعم

4. **العنوان:**
   - عنوان التوصيل مطلوب قبل تأكيد الطلب
   - تأكد من أن المستخدم لديه عنوان نشط

---

**التالي:** [خدمة التصنيفات (Categories)](./06-categories-service.md)

