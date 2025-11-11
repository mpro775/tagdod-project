# 💳 خدمة الدفع والطلبات (Checkout & Orders Service)

خدمة الدفع توفر endpoints لإتمام الطلبات وإدارتها.

> ✅ **تم التحقق وتحديث هذه الوثيقة (v2.0.0)** - مطابقة للكود الفعلي في `backend/src/modules/checkout`
> 
> 🆕 **التحديثات الجديدة:**
> - تبسيط حالات الطلب من 15 إلى 10 حالات
> - تبسيط طرق الدفع (COD و BANK_TRANSFER فقط)
> - إضافة دعم التحويل البنكي المحلي
> - تحديث قواعد الإلغاء
> - إضافة Endpoint `GET /orders/checkout/payment-options` لتجميع خيارات الدفع وحالة أهلية COD
> - تحديث رد `POST /orders/checkout/confirm` ليعيد `paymentOptions` بعد إنشاء الطلب

---

## 📋 جدول المحتويات

1. [معاينة الطلب](#1-معاينة-الطلب)
2. [تأكيد الطلب](#2-تأكيد-الطلب)
3. [خيارات الدفع](#3-خيارات-الدفع)
4. [قائمة طلباتي](#4-قائمة-طلباتي)
5. [تفاصيل طلب](#5-تفاصيل-طلب)
6. [إلغاء طلب](#6-إلغاء-طلب)
6. [Models في Flutter](#models-في-flutter)

---

## 1. معاينة الطلب

يُنشئ ملخص الطلب الحالي مع كل الخصومات المطبقة قبل التأكيد.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/orders/checkout/preview`
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
      "paymentStatus": "paid",
      "paymentMethod": "BANK_TRANSFER",
      "paymentProvider": "local_bank",
      "localPaymentAccountId": "account_123",
      "paymentReference": "TRX-2025-001234",
      "subtotal": 520000,
      "itemsDiscount": 40000,
      "couponDiscount": 12000,
      "autoDiscountsTotal": 0,
      "totalDiscount": 52000,
      "tax": 0,
      "shippingCost": 0,
      "shippingDiscount": 0,
      "total": 468000,
      "currency": "YER",
      "totalsInAllCurrencies": {
        "USD": {
          "subtotal": 208,
          "shippingCost": 0,
          "tax": 0,
          "totalDiscount": 20.8,
          "total": 187.2
        },
        "YER": {
          "subtotal": 520000,
          
          "shippingCost": 0,
          "tax": 0,
          "totalDiscount": 52000,
          "total": 468000
        },
        "SAR": {
          "subtotal": 780,
          "shippingCost": 0,
          "tax": 0,
          "totalDiscount": 78,
          "total": 702
        }
      },
      "appliedCouponCodes": ["SUMMER20"],
      "appliedCoupons": [
        {
          "code": "SUMMER20",
          "discount": 12000,
          "details": {
            "code": "SUMMER20",
            "title": "خصم الصيف",
            "type": "percentage",
            "discountPercentage": 10
          }
        }
      ],
      "autoAppliedCoupons": [],
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
      "items": [
        {
          "productId": "prod_123",
          "variantId": "var_789",
          "qty": 2,
          "basePrice": 150000,
          "discount": 20000,
          "finalPrice": 130000,
          "lineTotal": 260000,
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
      "shippingMethod": "standard",
      "shippingCompany": null,
      "trackingNumber": null,
      "trackingUrl": null,
      "estimatedDeliveryDate": null,
      "deliveredAt": null,
      "statusHistory": [
        {
          "status": "pending_payment",
          "changedAt": "2025-10-15T12:00:00.000Z",
          "changedBy": "user_456",
          "changedByRole": "customer",
          "notes": "تم إنشاء الطلب"
        },
        {
          "status": "processing",
          "changedAt": "2025-10-16T08:15:00.000Z",
          "changedBy": "admin_001",
          "changedByRole": "admin",
          "notes": "تم استلام الدفعة والتحضير للشحن"
        }
      ],
      "customerNotes": "يرجى التوصيل في المساء",
      "createdAt": "2025-10-15T12:00:00.000Z",
      "updatedAt": "2025-10-16T08:15:00.000Z"
    },
    "message": "تم الحصول على تفاصيل الطلب"
  },
  "requestId": "req_orders_002"
}
```

### Request Body

```json
{
  "currency": "YER",
  "couponCode": "SUMMER20",
  "couponCodes": ["VIP-5"]
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `currency` | `string` | ✅ نعم | العملة (`YER`, `SAR`, `USD`، …) |
| `couponCode` | `string` | ❌ لا | كوبون واحد (للخلفية التوافقية) |
| `couponCodes` | `string[]` | ❌ لا | كوبونات متعددة تطبق تراكمياً |

> ✅ يدعم النظام الجمع بين كوبونات محفوظة في السلة (تم تطبيقها مسبقاً) وأي كوبونات يتم إرسالها في الطلب.

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "preview": {
      "items": [
        {
          "itemId": "item_001",
          "productId": "prod_123",
          "variantId": "var_789",
          "qty": 2,
          "unit": {
            "base": 150000,
            "final": 130000,
            "currency": "YER",
            "appliedRule": {
              "type": "bundle",
              "value": 20000,
              "name": "عرض حزمة 2×"
            }
          },
          "lineTotal": 260000,
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
      "subtotal": 520000,
      "shipping": 0,
      "total": 468000,
      "currency": "YER",
      "deliveryOptions": [],
      "discounts": {
        "itemsDiscount": 40000,
        "couponDiscount": 12000,
        "totalDiscount": 52000,
        "appliedCoupons": [
          {
            "code": "SUMMER20",
            "name": "خصم الصيف",
            "discountValue": 10,
            "type": "percentage",
            "discount": 12000
          }
        ]
      },
      "codEligibility": {
        "eligible": true,
        "completedOrders": 4,
        "totalOrders": 6,
        "inProgressOrders": 1,
        "cancelledOrders": 1,
        "requiredOrders": 3,
        "remainingOrders": 0,
        "progress": "4/3",
        "message": null
      },
      "customerOrderStats": {
        "totalOrders": 6,
        "completedOrders": 4,
        "inProgressOrders": 1,
        "cancelledOrders": 1,
        "requiredForCOD": 3,
        "remainingForCOD": 0,
        "codEligible": true
      },
      "appliedCoupon": {
        "code": "SUMMER20",
        "name": "خصم الصيف",
        "discountValue": 10,
        "type": "percentage",
        "discount": 12000
      },
      "couponDiscount": 12000
    },
    "message": "تم إنشاء معاينة الطلب بنجاح"
  },
  "requestId": "req_checkout_preview_001"
}
```

**تفاصيل مهمة**
- `discounts.itemsDiscount`: إجمالي خصومات العروض الترويجية على مستوى البنود.
- `discounts.couponDiscount`: إجمالي خصومات جميع الكوبونات بعد تطبيقها بالتسلسل.
- `codEligibility`: مؤشرات أهلية الدفع عند الاستلام (تشمل الآن إجمالي الطلبات، الجارية، الملغاة، المتبقي للوصول للحد الأدنى، ورسالة التوضيح).
- `customerOrderStats`: ملخص كامل لطلبات المستخدم (إجمالي/مكتمل/جاري/ملغى) مع حقلين `requiredForCOD`, `remainingForCOD` لتسهيل العرض في الواجهة.
- `appliedCoupon`: أول كوبون مطبق للحفاظ على التوافق مع الإصدارات القديمة.

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "ORDER_PREVIEW_FAILED",
    "message": "فشل في إنشاء معاينة الطلب",
    "details": null
  },
  "requestId": "req_checkout_preview_001"
}
```

> في أغلب الحالات يحدث الفشل عند تعذر جلب بيانات السلة أو احتساب الكوبونات. يمكن التحقق من الـ logs عند الحاجة.

### كود Flutter

```dart
Future<CheckoutPreview> previewCheckout({
  String currency = 'YER',
  String? couponCode,
  List<String>? couponCodes,
}) async {
  final response = await _dio.post(
    '/orders/checkout/preview',
    data: {
      'currency': currency,
      if (couponCode != null) 'couponCode': couponCode,
      if (couponCodes != null && couponCodes.isNotEmpty)
        'couponCodes': couponCodes,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return CheckoutPreview.fromJson(apiResponse.data!['preview']);
  }

  throw ApiException(apiResponse.error!);
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
  "deliveryAddressId": "65f2d65cdc11223344556677",
  "shippingMethod": "standard",
  "customerNotes": "يرجى التوصيل في المساء",
  "couponCode": "SUMMER20",
  "couponCodes": ["VIP-5"]
}
```

**مثال لطريقة التحويل البنكي المحلي:**

```json
{
  "currency": "YER",
  "paymentMethod": "BANK_TRANSFER",
  "localPaymentAccountId": "account_123",
  "paymentReference": "TRX-2025-001234",
  "paymentProvider": "local_bank",
  "deliveryAddressId": "65f2d65cdc11223344556677",
  "shippingMethod": "express",
  "customerNotes": "يرجى الاتصال قبل التوصيل",
  "couponCodes": ["FLASH-50"]
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `currency` | `string` | ✅ نعم | العملة الأساسية للطلب |
| `paymentMethod` | `string` | ✅ نعم | `COD` أو `BANK_TRANSFER` |
| `deliveryAddressId` | `string` | ✅ نعم | معرف العنوان (يتم التحقق من ملكيته للمستخدم) |
| `shippingMethod` | `string` | ❌ لا | `standard`, `express`, `same_day`, `pickup` |
| `paymentProvider` | `string` | ❌ لا | اسم مزود الدفع (للتكامل مع مزودين لاحقاً) |
| `localPaymentAccountId` | `string` | ⚠️ مع `BANK_TRANSFER` | الحساب البنكي المحلي المختار |
| `paymentReference` | `string` | ⚠️ مع `BANK_TRANSFER` | رقم الحوالة/مرجع الدفع |
| `customerNotes` | `string` | ❌ لا | ملاحظات إضافية من المستخدم |
| `couponCode` | `string` | ❌ لا | كوبون واحد (للتوافق مع الإصدارات القديمة) |
| `couponCodes` | `string[]` | ❌ لا | كوبونات متعددة تطبق بعد خصومات العروض |

**التحقق أثناء الإنشاء**
- يتم إعادة احتساب السلة لضمان صحة الأسعار والخصومات (العروض + الكوبونات).
- يتم التحقق من أهلية الدفع عند الاستلام (`COD`) بناءً على عدد الطلبات المكتملة للمستخدم.
- مع `BANK_TRANSFER` يجب أن تطابق العملة عملة الحساب وأن يتم تمرير `paymentReference`.
- بعد الإنشاء يتم تحويل السلة إلى حالة `converted` وربطها بالطلب.

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
        "intentId": "local-507f1f77bcf86cd799439011",
        "provider": "local_bank",
        "amount": 468000,
        "signature": "sig_vW1n8qJ0lY"
      }
    },
    "codEligibility": {
      "eligible": true,
      "completedOrders": 4,
      "totalOrders": 6,
      "inProgressOrders": 1,
      "cancelledOrders": 1,
      "requiredOrders": 3,
      "remainingOrders": 0,
      "progress": "4/3",
      "message": null,
      "isAdmin": false
    },
    "customerOrderStats": {
      "totalOrders": 6,
      "completedOrders": 4,
      "inProgressOrders": 1,
      "cancelledOrders": 1,
      "requiredForCOD": 3,
      "remainingForCOD": 0,
      "codEligible": true
    },
    "paymentOptions": {
      "cod": {
        "method": "COD",
        "status": "available",
        "allowed": true,
        "codEligibility": {
          "eligible": true,
          "requiredOrders": 3,
          "remainingOrders": 0,
          "totalOrders": 6,
          "completedOrders": 4,
          "inProgressOrders": 1,
          "cancelledOrders": 1,
          "progress": "4/3"
        }
      },
      "customerOrderStats": {
        "totalOrders": 6,
        "completedOrders": 4,
        "inProgressOrders": 1,
        "cancelledOrders": 1,
        "requiredForCOD": 3,
        "remainingForCOD": 0,
        "codEligible": true
      },
      "localPaymentProviders": [
        {
          "providerId": "ykb",
          "providerName": "بنك اليمن والكويت",
          "type": "bank",
          "numberingMode": "per_currency",
          "supportedCurrencies": ["YER"],
          "accounts": [
            {
              "id": "ykb-yer",
              "currency": "YER",
              "accountNumber": "1234567890",
              "isActive": true,
              "displayOrder": 1
            }
          ]
        }
      ]
    },
    "message": "تم إنشاء الطلب بنجاح"
  },
  "requestId": "req_checkout_confirm_001"
}
```

> `payment` يُعاد فقط في حالة التحويل البنكي المحلي. لطلبات `COD` يبقى الحقل `null` ويتم ترقية الحالة إلى `confirmed` مباشرة عند النجاح.  
> يتم إرجاع `codEligibility` و`customerOrderStats` بعد الإنشاء لتحديث الواجهات مباشرة دون استدعاءات إضافية، بالإضافة إلى `paymentOptions` (نفس بنية Endpoint الخيارات العامة) لتحديث شاشة التأكيد فوراً دون طلب إضافي.

### Response الكامل (من `GET /orders/:id`)

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_123",
      "orderNumber": "ORD-2025-001234",
      "userId": "user_456",
      "status": "pending_payment",
      "paymentStatus": "paid",
      "paymentMethod": "BANK_TRANSFER",
      "paymentProvider": "local_bank",
      "localPaymentAccountId": "account_123",
      "paymentReference": "TRX-2025-001234",
      "items": [
        {
          "productId": "prod_123",
          "variantId": "var_789",
          "qty": 2,
          "basePrice": 150000,
          "discount": 20000,
          "finalPrice": 130000,
          "lineTotal": 260000,
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
      "subtotal": 520000,
      "itemsDiscount": 40000,
      "couponDiscount": 12000,
      "totalDiscount": 52000,
      "tax": 0,
      "shippingCost": 0,
      "shippingMethod": "standard",
      "shippingCompany": null,
      "trackingNumber": null,
      "trackingUrl": null,
      "estimatedDeliveryDate": null,
      "totalsInAllCurrencies": {
        "USD": {
          "subtotal": 208,
          "shippingCost": 0,
          "tax": 0,
          "totalDiscount": 20.8,
          "total": 187.2
        },
        "YER": {
          "subtotal": 520000,
          "shippingCost": 0,
          "tax": 0,
          "totalDiscount": 52000,
          "total": 468000
        },
        "SAR": {
          "subtotal": 780,
          "shippingCost": 0,
          "tax": 0,
          "totalDiscount": 78,
          "total": 702
        }
      },
      "total": 468000,
      "currency": "YER",
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
      "updatedAt": "2025-10-16T08:15:00.000Z"
    },
    "message": "تم الحصول على تفاصيل الطلب"
  },
  "requestId": "req_orders_002"
}
```

### Response - فشل (عنوان غير موجود)

```json
{
  "success": false,
  "error": {
    "code": "ADDRESS_650",
    "message": "العنوان غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_checkout_002"
}
```

### Response - فشل (غير مؤهل للدفع عند الاستلام)

```json
{
  "success": false,
  "error": {
    "code": "GENERAL_004",
    "message": "بيانات غير صحيحة",
    "details": {
      "reason": "cod_not_eligible",
      "message": "يجب إكمال 3 طلبات على الأقل لاستخدام الدفع عند الاستلام. لديك 1 طلب مكتمل",
      "codEligibility": {
        "completedOrders": 1,
        "requiredOrders": 3,
        "progress": "1/3"
      }
    },
    "fieldErrors": null
  },
  "requestId": "req_checkout_002"
}
```

### Response - فشل (حساب بنكي غير صالح)

```json
{
  "success": false,
  "error": {
    "code": "GENERAL_004",
    "message": "بيانات غير صحيحة",
    "details": {
      "reason": "invalid_payment_account",
      "message": "الحساب المحدد غير موجود أو غير مفعل"
    },
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
  String? localPaymentAccountId,
  String? paymentReference,
  required String deliveryAddressId,
  String? shippingMethod,
  String? customerNotes,
  String? couponCode,
  List<String>? couponCodes,
}) async {
  final response = await _dio.post(
    '/orders/checkout/confirm',
    data: {
      'currency': currency,
      'paymentMethod': paymentMethod,
      if (paymentProvider != null) 'paymentProvider': paymentProvider,
      if (localPaymentAccountId != null) 'localPaymentAccountId': localPaymentAccountId,
      if (paymentReference != null) 'paymentReference': paymentReference,
      'deliveryAddressId': deliveryAddressId,
      if (shippingMethod != null) 'shippingMethod': shippingMethod,
      if (customerNotes != null) 'customerNotes': customerNotes,
      if (couponCode != null) 'couponCode': couponCode,
      if (couponCodes != null && couponCodes.isNotEmpty) 'couponCodes': couponCodes,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return OrderConfirmationResponse.fromJson(apiResponse.data!);
  }

  throw ApiException(apiResponse.error!);
}

class OrderConfirmationResponse {
  final String orderId;
  final String orderNumber;
  final String status;
  final PaymentInfo? payment;
  final CodEligibility? codEligibility;
  final CustomerOrderStats? customerOrderStats;
  final String message;

  OrderConfirmationResponse({
    required this.orderId,
    required this.orderNumber,
    required this.status,
    this.payment,
    this.codEligibility,
    this.customerOrderStats,
    required this.message,
  });

  factory OrderConfirmationResponse.fromJson(Map<String, dynamic> json) {
    final order = json['order'] as Map<String, dynamic>;
    return OrderConfirmationResponse(
      orderId: order['orderId'] as String,
      orderNumber: order['orderNumber'] as String,
      status: order['status'] as String,
      payment: order['payment'] != null
          ? PaymentInfo.fromJson(order['payment'] as Map<String, dynamic>)
          : null,
      codEligibility: json['codEligibility'] != null
          ? CodEligibility.fromJson(json['codEligibility'] as Map<String, dynamic>)
          : null,
      customerOrderStats: json['customerOrderStats'] != null
          ? CustomerOrderStats.fromJson(json['customerOrderStats'] as Map<String, dynamic>)
          : null,
      message: json['message'] as String? ?? '',
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
      intentId: json['intentId'] as String,
      provider: json['provider'] as String?,
      amount: (json['amount'] ?? 0).toDouble(),
      signature: json['signature'] as String,
    );
  }
}
```

---

## 3. خيارات الدفع

يعرض جميع خيارات الدفع المتاحة للمستخدم الحالي، بما في ذلك حالة أهلية الدفع عند الاستلام (COD) والحسابات البنكية/المحافظ المحلية المفعلّة. نفس البيانات تُعاد أيضاً داخل رد تأكيد الطلب لتسهيل تحديث الشاشة فوراً.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/orders/checkout/payment-options`
- **Auth Required:** ✅ نعم (Bearer Token)

| الاستعلام | النوع | الوصف |
|----------|------|--------|
| `currency` | `string` | ❌ لا | فلترة الحسابات المحلية حسب العملة (`YER`, `SAR`, `USD`). في حال الإغفال يعاد جميع المزودين المفعلين. |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "paymentOptions": {
      "cod": {
        "method": "COD",
        "status": "available",
        "allowed": true,
        "reason": null,
        "codEligibility": {
          "eligible": true,
          "requiredOrders": 3,
          "remainingOrders": 0,
          "totalOrders": 6,
          "completedOrders": 4,
          "inProgressOrders": 1,
          "cancelledOrders": 1,
          "progress": "4/3",
          "message": null,
          "isAdmin": false
        }
      },
      "customerOrderStats": {
        "totalOrders": 6,
        "completedOrders": 4,
        "inProgressOrders": 1,
        "cancelledOrders": 1,
        "requiredForCOD": 3,
        "remainingForCOD": 0,
        "codEligible": true
      },
      "localPaymentProviders": [
        {
          "providerId": "jaib-wallet",
          "providerName": "محفظة جيب",
          "type": "wallet",
          "numberingMode": "per_currency",
          "supportedCurrencies": ["YER"],
          "icon": {
            "id": "media_123",
            "url": "https://cdn.example.com/icons/jaib.png",
            "name": "Jaib Wallet"
          },
          "accounts": [
            {
              "id": "acc_123",
              "currency": "YER",
              "accountNumber": "777777777",
              "isActive": true,
              "displayOrder": 1,
              "notes": "تحويل خلال دقائق"
            }
          ]
        }
      ]
    },
    "message": "تم الحصول على خيارات الدفع بنجاح"
  },
  "requestId": "req_payment_options_001"
}
```

> **ملاحظة:** `customerOrderStats` داخل `paymentOptions` هي نفس الهيكل المعاد في ردود الطلبات الأخرى، ما يسمح بإظهار رسالة التقدم نحو أهلية COD بسهولة.

### كود Flutter

```dart
Future<PaymentOptions> getPaymentOptions({String? currency}) async {
  final response = await _dio.get(
    '/orders/checkout/payment-options',
    queryParameters: {
      if (currency != null) 'currency': currency,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return PaymentOptions.fromJson(apiResponse.data!['paymentOptions']);
  }

  throw ApiException(apiResponse.error!);
}

class PaymentOptions {
  final CodOption cod;
  final CustomerOrderStats customerOrderStats;
  final List<LocalPaymentProvider> localPaymentProviders;

  PaymentOptions({
    required this.cod,
    required this.customerOrderStats,
    required this.localPaymentProviders,
  });

  factory PaymentOptions.fromJson(Map<String, dynamic> json) {
    return PaymentOptions(
      cod: CodOption.fromJson(json['cod'] as Map<String, dynamic>),
      customerOrderStats:
          CustomerOrderStats.fromJson(json['customerOrderStats'] as Map<String, dynamic>),
      localPaymentProviders: (json['localPaymentProviders'] as List<dynamic>)
          .map((item) => LocalPaymentProvider.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class CodOption {
  final String status;
  final bool allowed;
  final String? reason;
  final CodEligibility codEligibility;

  CodOption({
    required this.status,
    required this.allowed,
    this.reason,
    required this.codEligibility,
  });

  factory CodOption.fromJson(Map<String, dynamic> json) {
    return CodOption(
      status: json['status'] as String? ?? 'restricted',
      allowed: json['allowed'] as bool? ?? false,
      reason: json['reason'] as String?,
      codEligibility: CodEligibility.fromJson(json['codEligibility'] as Map<String, dynamic>?),
    );
  }
}

class LocalPaymentProvider {
  final String providerId;
  final String providerName;
  final String type;
  final String numberingMode;
  final List<String> supportedCurrencies;
  final List<LocalPaymentAccount> accounts;

  LocalPaymentProvider({
    required this.providerId,
    required this.providerName,
    required this.type,
    required this.numberingMode,
    required this.supportedCurrencies,
    required this.accounts,
  });

  factory LocalPaymentProvider.fromJson(Map<String, dynamic> json) {
    return LocalPaymentProvider(
      providerId: json['providerId'] as String? ?? '',
      providerName: json['providerName'] as String? ?? '',
      type: json['type'] as String? ?? '',
      numberingMode: json['numberingMode'] as String? ?? '',
      supportedCurrencies: (json['supportedCurrencies'] as List<dynamic>? ?? const [])
          .map((item) => item.toString())
          .toList(),
      accounts: (json['accounts'] as List<dynamic>? ?? const [])
          .map((item) => LocalPaymentAccount.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class LocalPaymentAccount {
  final String id;
  final String currency;
  final String accountNumber;
  final bool isActive;
  final int displayOrder;
  final String? notes;

  LocalPaymentAccount({
    required this.id,
    required this.currency,
    required this.accountNumber,
    required this.isActive,
    required this.displayOrder,
    this.notes,
  });

  factory LocalPaymentAccount.fromJson(Map<String, dynamic> json) {
    return LocalPaymentAccount(
      id: json['id'] as String? ?? '',
      currency: json['currency'] as String? ?? '',
      accountNumber: json['accountNumber'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? false,
      displayOrder: (json['displayOrder'] ?? 0) as int,
      notes: json['notes'] as String?,
    );
  }
}
```

---

## 4. قائمة طلباتي

يسترجع جميع طلبات المستخدم مع دعم الفلترة والترقيم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/orders`
- **Auth Required:** ✅ نعم (Bearer Token)

| الاستعلام | النوع | الوصف |
|----------|------|--------|
| `page` | `number` | رقم الصفحة (افتراضي 1) |
| `limit` | `number` | عدد العناصر في الصفحة (افتراضي 20، حد أقصى 100) |
| `status` | `string` | فلترة حسب حالة الطلب (`pending_payment`, `processing`, …) |
| `paymentStatus` | `string` | فلترة حسب حالة الدفع (`pending`, `paid`, …) |
| `search` | `string` | بحث في رقم الطلب أو اسم المستلم |
| `sortBy` | `string` | الحقل المستخدم للترتيب (افتراضي `createdAt`) |
| `sortOrder` | `string` | `asc` أو `desc` (افتراضي `desc`) |
| `fromDate` | `string` | تاريخ ISO لبداية النطاق |
| `toDate` | `string` | تاريخ ISO لنهاية النطاق |

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
        "subtotal": 520000,
        "itemsDiscount": 40000,
        "couponDiscount": 12000,
        "totalDiscount": 52000,
        "shippingCost": 0,
        "tax": 0,
        "total": 468000,
        "currency": "YER",
        "shippingMethod": "standard",
        "totalsInAllCurrencies": {
          "USD": { "total": 187.2 },
          "YER": { "total": 468000 },
          "SAR": { "total": 702 }
        },
        "createdAt": "2025-10-15T12:00:00.000Z",
        "updatedAt": "2025-10-16T08:15:00.000Z"
      },
      {
        "_id": "order_124",
        "orderNumber": "ORD-2025-001235",
        "status": "delivered",
        "paymentStatus": "paid",
        "subtotal": 850000,
        "itemsDiscount": 0,
        "couponDiscount": 0,
        "total": 850000,
        "currency": "YER",
        "shippingMethod": "express",
        "createdAt": "2025-10-10T09:00:00.000Z",
        "updatedAt": "2025-10-14T19:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    },
    "codEligibility": {
      "eligible": true,
      "completedOrders": 4,
      "totalOrders": 6,
      "inProgressOrders": 1,
      "cancelledOrders": 1,
      "requiredOrders": 3,
      "remainingOrders": 0,
      "progress": "4/3",
      "message": null,
      "isAdmin": false
    },
    "customerOrderStats": {
      "totalOrders": 6,
      "completedOrders": 4,
      "inProgressOrders": 1,
      "cancelledOrders": 1,
      "requiredForCOD": 3,
      "remainingForCOD": 0,
      "codEligible": true
    },
    "message": "تم الحصول على الطلبات بنجاح"
  },
  "requestId": "req_orders_001"
}
```

> يتم إرجاع مستند الطلب بالكامل (نفس بنية `Order` في قاعدة البيانات)، ويمكن تجاهل الحقول غير المطلوبة في الواجهة.
- يتم إرجاع الحقول الجانبية `codEligibility` و`customerOrderStats` مع كل رد لتحديث واجهة المستخدم حول حالة الدفع عند الاستلام وعدد الطلبات السابقة.

### كود Flutter

```dart
Future<OrdersListResponse> getMyOrders({
  int page = 1,
  int limit = 10,
  String? status,
  String? paymentStatus,
  String? search,
  String sortBy = 'createdAt',
  String sortOrder = 'desc',
  DateTime? fromDate,
  DateTime? toDate,
}) async {
  final query = <String, dynamic>{
    'page': page,
    'limit': limit,
    'sortBy': sortBy,
    'sortOrder': sortOrder,
    if (status != null) 'status': status,
    if (paymentStatus != null) 'paymentStatus': paymentStatus,
    if (search != null && search.isNotEmpty) 'search': search,
    if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
    if (toDate != null) 'toDate': toDate.toIso8601String(),
  };

  final response = await _dio.get(
    '/orders',
    queryParameters: query,
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return OrdersListResponse.fromJson(apiResponse.data!);
  }

  throw ApiException(apiResponse.error!);
}

class OrdersListResponse {
  final List<OrderSummary> orders;
  final PaginationInfo pagination;
  final CodEligibility? codEligibility;
  final CustomerOrderStats? customerOrderStats;
  final String message;

  OrdersListResponse({
    required this.orders,
    required this.pagination,
    this.codEligibility,
    this.customerOrderStats,
    required this.message,
  });

  factory OrdersListResponse.fromJson(Map<String, dynamic> json) {
    return OrdersListResponse(
      orders: (json['orders'] as List)
          .map((item) => OrderSummary.fromJson(item as Map<String, dynamic>))
          .toList(),
      pagination: PaginationInfo.fromJson(json['pagination'] as Map<String, dynamic>),
      codEligibility: json['codEligibility'] != null
          ? CodEligibility.fromJson(json['codEligibility'] as Map<String, dynamic>)
          : null,
      customerOrderStats: json['customerOrderStats'] != null
          ? CustomerOrderStats.fromJson(json['customerOrderStats'] as Map<String, dynamic>)
          : null,
      message: json['message'] as String? ?? '',
    );
  }
}

class OrderSummary {
  final String id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final double total;
  final double subtotal;
  final double totalDiscount;
  final double shippingCost;
  final String currency;
  final DateTime createdAt;
  final DateTime updatedAt;

  OrderSummary({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentStatus,
    required this.total,
    required this.subtotal,
    required this.totalDiscount,
    required this.shippingCost,
    required this.currency,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderSummary.fromJson(Map<String, dynamic> json) {
    return OrderSummary(
      id: json['_id'] as String,
      orderNumber: json['orderNumber'] as String,
      status: json['status'] as String,
      paymentStatus: json['paymentStatus'] as String,
      total: (json['total'] ?? 0).toDouble(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      totalDiscount: (json['totalDiscount'] ?? 0).toDouble(),
      shippingCost: (json['shippingCost'] ?? 0).toDouble(),
      currency: json['currency'] as String? ?? 'YER',
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
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
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      limit: json['limit'] as int? ?? 10,
      totalPages: json['totalPages'] as int? ?? 1,
    );
  }
}
```

---

## 5. تفاصيل طلب

يسترجع تفاصيل طلب محدد.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/orders/:id`
- **Auth Required:** ✅ نعم (Bearer Token)


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

## 6. إلغاء طلب

يلغي طلب (يُسمح بالإلغاء في الحالات `pending_payment`, `confirmed`, `processing`, `on_hold` فقط).

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/orders/:id/cancel`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "reason": "تم طلب المنتج بالخطأ"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `reason` | `string` | ✅ نعم | سبب الإلغاء (حد أدنى 5 حروف) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_123",
      "orderNumber": "ORD-2025-001234",
      "status": "cancelled",
      "paymentStatus": "pending",
      "statusHistory": [
        {
          "status": "pending_payment",
          "changedAt": "2025-10-15T12:00:00.000Z",
          "changedBy": "user_456",
          "changedByRole": "customer",
          "notes": "تم إنشاء الطلب"
        },
        {
          "status": "cancelled",
          "changedAt": "2025-10-15T13:20:00.000Z",
          "changedBy": "user_456",
          "changedByRole": "customer",
          "notes": "تم إلغاء الطلب من تطبيق العميل"
        }
      ]
    },
    "message": "تم إلغاء الطلب بنجاح"
  },
  "requestId": "req_orders_003"
}
```

### Response - فشل (الحالة لا تسمح بالإلغاء)

```json
{
  "success": false,
  "error": {
    "code": "ORDER_602",
    "message": "لا يمكن إلغاء الطلب",
    "details": {
      "currentStatus": "shipped",
      "allowedStatuses": ["pending_payment", "confirmed", "processing", "on_hold"]
    },
    "fieldErrors": null
  },
  "requestId": "req_orders_003"
}
```

### كود Flutter

```dart
Future<OrderDetails> cancelOrder({
  required String orderId,
  required String reason,
}) async {
  final response = await _dio.post(
    '/orders/$orderId/cancel',
    data: {
      'reason': reason,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return OrderDetails.fromJson(apiResponse.data!['order']);
  }

  throw ApiException(apiResponse.error!);
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
  final CheckoutDiscounts discounts;
  final CodEligibility codEligibility;
  final CustomerOrderStats customerOrderStats;
  final CouponInfo? appliedCoupon;
  final double couponDiscount;

  CheckoutPreview({
    required this.items,
    required this.subtotal,
    required this.shipping,
    required this.total,
    required this.currency,
    required this.deliveryOptions,
    required this.discounts,
    required this.codEligibility,
    required this.customerOrderStats,
    this.appliedCoupon,
    required this.couponDiscount,
  });

  factory CheckoutPreview.fromJson(Map<String, dynamic> json) {
    return CheckoutPreview(
      items: (json['items'] as List<dynamic>)
          .map((item) => CheckoutItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shipping: (json['shipping'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] as String? ?? 'YER',
      deliveryOptions: (json['deliveryOptions'] as List<dynamic>? ?? const [])
          .map((option) => DeliveryOption.fromJson(option as Map<String, dynamic>))
          .toList(),
      discounts: CheckoutDiscounts.fromJson(json['discounts'] as Map<String, dynamic>?),
      codEligibility: CodEligibility.fromJson(json['codEligibility'] as Map<String, dynamic>?),
      customerOrderStats: CustomerOrderStats.fromJson(json['customerOrderStats'] as Map<String, dynamic>?),
      appliedCoupon: json['appliedCoupon'] != null
          ? CouponInfo.fromJson(json['appliedCoupon'] as Map<String, dynamic>)
          : null,
      couponDiscount: (json['couponDiscount'] ?? 0).toDouble(),
    );
  }

  bool get hasCoupon => appliedCoupon != null;
  double get totalDiscount => discounts.totalDiscount;
}

class CheckoutDiscounts {
  final double itemsDiscount;
  final double couponDiscount;
  final double totalDiscount;
  final List<CouponInfo> appliedCoupons;

  CheckoutDiscounts({
    required this.itemsDiscount,
    required this.couponDiscount,
    required this.totalDiscount,
    required this.appliedCoupons,
  });

  factory CheckoutDiscounts.fromJson(Map<String, dynamic>? json) {
    final data = json ?? const <String, dynamic>{};
    return CheckoutDiscounts(
      itemsDiscount: (data['itemsDiscount'] ?? 0).toDouble(),
      couponDiscount: (data['couponDiscount'] ?? 0).toDouble(),
      totalDiscount: (data['totalDiscount'] ?? 0).toDouble(),
      appliedCoupons: (data['appliedCoupons'] as List<dynamic>? ?? const [])
          .map((item) => CouponInfo.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}

class CodEligibility {
  final bool eligible;
  final int completedOrders;
  final int totalOrders;
  final int inProgressOrders;
  final int cancelledOrders;
  final int requiredOrders;
  final int remainingOrders;
  final String progress;
  final String? message;
  final bool? isAdmin;

  CodEligibility({
    required this.eligible,
    required this.completedOrders,
    required this.totalOrders,
    required this.inProgressOrders,
    required this.cancelledOrders,
    required this.requiredOrders,
    required this.remainingOrders,
    required this.progress,
    this.message,
    this.isAdmin,
  });

  factory CodEligibility.fromJson(Map<String, dynamic>? json) {
    final data = json ?? const <String, dynamic>{};
    int _parseInt(dynamic value, int fallback) {
      if (value is num) return value.toInt();
      if (value is String) return int.tryParse(value) ?? fallback;
      return fallback;
    }

    return CodEligibility(
      eligible: data['eligible'] as bool? ?? false,
      completedOrders: _parseInt(data['completedOrders'], 0),
      totalOrders: _parseInt(data['totalOrders'], 0),
      inProgressOrders: _parseInt(data['inProgressOrders'], 0),
      cancelledOrders: _parseInt(data['cancelledOrders'], 0),
      requiredOrders: _parseInt(data['requiredOrders'], 3),
      remainingOrders: _parseInt(data['remainingOrders'], 0),
      progress: data['progress'] as String? ?? '0/3',
      message: data['message'] as String?,
      isAdmin: data['isAdmin'] as bool?,
    );
  }
}

class CustomerOrderStats {
  final int totalOrders;
  final int completedOrders;
  final int inProgressOrders;
  final int cancelledOrders;
  final int requiredForCOD;
  final int remainingForCOD;
  final bool codEligible;

  CustomerOrderStats({
    required this.totalOrders,
    required this.completedOrders,
    required this.inProgressOrders,
    required this.cancelledOrders,
    required this.requiredForCOD,
    required this.remainingForCOD,
    required this.codEligible,
  });

  factory CustomerOrderStats.fromJson(Map<String, dynamic>? json) {
    final data = json ?? const <String, dynamic>{};
    int _parseInt(dynamic value, int fallback) {
      if (value is num) return value.toInt();
      if (value is String) return int.tryParse(value) ?? fallback;
      return fallback;
    }

    return CustomerOrderStats(
      totalOrders: _parseInt(data['totalOrders'], 0),
      completedOrders: _parseInt(data['completedOrders'], 0),
      inProgressOrders: _parseInt(data['inProgressOrders'], 0),
      cancelledOrders: _parseInt(data['cancelledOrders'], 0),
      requiredForCOD: _parseInt(data['requiredForCOD'], 3),
      remainingForCOD: _parseInt(data['remainingForCOD'], 0),
      codEligible: data['codEligible'] as bool? ?? false,
    );
  }
}

class CouponInfo {
  final String code;
  final String name;
  final double discountValue;
  final String type;
  final double discount;

  CouponInfo({
    required this.code,
    required this.name,
    required this.discountValue,
    required this.type,
    required this.discount,
  });

  factory CouponInfo.fromJson(Map<String, dynamic> json) {
    return CouponInfo(
      code: json['code'] as String? ?? '',
      name: json['name'] as String? ?? json['title'] as String? ?? '',
      discountValue: (json['discountValue'] ?? json['discountPercentage'] ?? 0).toDouble(),
      type: json['type'] as String? ?? '',
      discount: (json['discount'] ?? json['discountAmount'] ?? 0).toDouble(),
    );
  }
}

class CheckoutItem {
  final String itemId;
  final String? variantId;
  final String? productId;
  final int qty;
  final CheckoutUnit unit;
  final double lineTotal;
  final CheckoutItemSnapshot? snapshot;

  CheckoutItem({
    required this.itemId,
    this.variantId,
    this.productId,
    required this.qty,
    required this.unit,
    required this.lineTotal,
    this.snapshot,
  });

  factory CheckoutItem.fromJson(Map<String, dynamic> json) {
    return CheckoutItem(
      itemId: json['itemId'] as String? ?? '',
      variantId: json['variantId'] as String?,
      productId: json['productId'] as String?,
      qty: (json['qty'] ?? 0) as int,
      unit: CheckoutUnit.fromJson(json['unit'] as Map<String, dynamic>),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
      snapshot: json['snapshot'] != null
          ? CheckoutItemSnapshot.fromJson(json['snapshot'] as Map<String, dynamic>)
          : null,
    );
  }
}

class CheckoutUnit {
  final double basePrice;
  final double finalPrice;
  final String currency;
  final CheckoutAppliedRule? appliedRule;

  CheckoutUnit({
    required this.basePrice,
    required this.finalPrice,
    required this.currency,
    this.appliedRule,
  });

  factory CheckoutUnit.fromJson(Map<String, dynamic> json) {
    return CheckoutUnit(
      basePrice: (json['base'] ?? json['basePrice'] ?? 0).toDouble(),
      finalPrice: (json['final'] ?? json['finalPrice'] ?? 0).toDouble(),
      currency: json['currency'] as String? ?? 'YER',
      appliedRule: json['appliedRule'] != null
          ? CheckoutAppliedRule.fromJson(json['appliedRule'] as Map<String, dynamic>)
          : null,
    );
  }

  bool get hasDiscount => finalPrice < basePrice;
  double get discountAmount => basePrice - finalPrice;
  double get discountPercent => hasDiscount ? (discountAmount / basePrice * 100) : 0;
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
      type: json['type'] as String? ?? '',
      value: (json['value'] ?? 0).toDouble(),
      name: json['name'] as String? ?? '',
    );
  }
}

class CheckoutItemSnapshot {
  final String? name;
  final String? sku;
  final String? slug;
  final String? image;
  final String? brandName;
  final String? categoryName;
  final Map<String, dynamic> attributes;

  CheckoutItemSnapshot({
    this.name,
    this.sku,
    this.slug,
    this.image,
    this.brandName,
    this.categoryName,
    required this.attributes,
  });

  factory CheckoutItemSnapshot.fromJson(Map<String, dynamic> json) {
    return CheckoutItemSnapshot(
      name: json['name'] as String?,
      sku: json['sku'] as String?,
      slug: json['slug'] as String?,
      image: json['image'] as String?,
      brandName: json['brandName'] as String?,
      categoryName: json['categoryName'] as String?,
      attributes: Map<String, dynamic>.from(json['attributes'] as Map? ?? const {}),
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
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      cost: (json['cost'] ?? 0).toDouble(),
      estimatedDays: json['estimatedDays'] as String? ?? '',
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
  final String? paymentProvider;
  final String? localPaymentAccountId;
  final String? paymentReference;
  final CodEligibility? codEligibility;
  final CustomerOrderStats? customerOrderStats;
  final List<OrderItem> items;
  final DeliveryAddress deliveryAddress;
  final double subtotal;
  final double itemsDiscount;
  final double couponDiscount;
  final double autoDiscountsTotal;
  final double shippingCost;
  final double shippingDiscount;
  final double tax;
  final double totalDiscount;
  final double total;
  final String currency;
  final OrderTotalsInAllCurrencies? totalsInAllCurrencies;
  final List<String> appliedCouponCodes;
  final List<CouponInfo> appliedCoupons;
  final List<OrderStatusHistory> statusHistory;
  final String? customerNotes;
  final String? shippingMethod;
  final String? shippingCompany;
  final String? trackingNumber;
  final String? trackingUrl;
  final DateTime? estimatedDeliveryDate;
  final DateTime? deliveredAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  OrderDetails({
    required this.id,
    required this.orderNumber,
    required this.userId,
    required this.status,
    required this.paymentMethod,
    required this.paymentStatus,
    this.paymentProvider,
    this.localPaymentAccountId,
    this.paymentReference,
    this.codEligibility,
    this.customerOrderStats,
    required this.items,
    required this.deliveryAddress,
    required this.subtotal,
    required this.itemsDiscount,
    required this.couponDiscount,
    required this.autoDiscountsTotal,
    required this.shippingCost,
    required this.shippingDiscount,
    required this.tax,
    required this.totalDiscount,
    required this.total,
    required this.currency,
    this.totalsInAllCurrencies,
    required this.appliedCouponCodes,
    required this.appliedCoupons,
    required this.statusHistory,
    this.customerNotes,
    this.shippingMethod,
    this.shippingCompany,
    this.trackingNumber,
    this.trackingUrl,
    this.estimatedDeliveryDate,
    this.deliveredAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderDetails.fromJson(Map<String, dynamic> json) {
    return OrderDetails(
      id: json['_id'] as String? ?? '',
      orderNumber: json['orderNumber'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      status: json['status'] as String? ?? '',
      paymentMethod: json['paymentMethod'] as String? ?? 'COD',
      paymentStatus: json['paymentStatus'] as String? ?? 'pending',
      paymentProvider: json['paymentProvider'] as String?,
      localPaymentAccountId: json['localPaymentAccountId'] as String?,
      paymentReference: json['paymentReference'] as String?,
      codEligibility: json['codEligibility'] != null
          ? CodEligibility.fromJson(json['codEligibility'] as Map<String, dynamic>)
          : null,
      customerOrderStats: json['customerOrderStats'] != null
          ? CustomerOrderStats.fromJson(json['customerOrderStats'] as Map<String, dynamic>)
          : null,
      items: (json['items'] as List<dynamic>)
          .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      deliveryAddress: DeliveryAddress.fromJson(json['deliveryAddress'] as Map<String, dynamic>),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      itemsDiscount: (json['itemsDiscount'] ?? 0).toDouble(),
      couponDiscount: (json['couponDiscount'] ?? 0).toDouble(),
      autoDiscountsTotal: (json['autoDiscountsTotal'] ?? 0).toDouble(),
      shippingCost: (json['shippingCost'] ?? 0).toDouble(),
      shippingDiscount: (json['shippingDiscount'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      totalDiscount: (json['totalDiscount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      currency: json['currency'] as String? ?? 'YER',
      totalsInAllCurrencies: OrderTotalsInAllCurrencies.fromJson(json['totalsInAllCurrencies'] as Map<String, dynamic>?),
      appliedCouponCodes: (json['appliedCouponCodes'] as List<dynamic>? ?? const [])
          .map((code) => code.toString())
          .toList(),
      appliedCoupons: (json['appliedCoupons'] as List<dynamic>? ?? const [])
          .map((item) {
            final coupon = item as Map<String, dynamic>? ?? const <String, dynamic>{};
            final details = coupon['details'] as Map<String, dynamic>? ?? const <String, dynamic>{};
            return CouponInfo.fromJson({
              'code': coupon['code'],
              'name': details['title'] ?? coupon['code'],
              'type': details['type'],
              'discountValue': details['discountPercentage'] ?? details['discountAmount'],
              'discount': coupon['discount'],
            });
          })
          .toList(),
      statusHistory: (json['statusHistory'] as List<dynamic>? ?? const [])
          .map((item) => OrderStatusHistory.fromJson(item as Map<String, dynamic>))
          .toList(),
      customerNotes: json['customerNotes'] as String?,
      shippingMethod: json['shippingMethod'] as String?,
      shippingCompany: json['shippingCompany'] as String?,
      trackingNumber: json['trackingNumber'] as String?,
      trackingUrl: json['trackingUrl'] as String?,
      estimatedDeliveryDate: json['estimatedDeliveryDate'] != null
          ? DateTime.parse(json['estimatedDeliveryDate'] as String)
          : null,
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.parse(json['deliveredAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  int get totalItems => items.fold(0, (sum, item) => sum + item.qty);
  bool get isPending => status == 'pending_payment';
  bool get canBeCancelled => ['pending_payment', 'confirmed', 'processing', 'on_hold'].contains(status);
  bool get isActive => !['completed', 'cancelled', 'refunded', 'returned'].contains(status);
  bool get hasTracking => trackingNumber != null || trackingUrl != null;
}

class OrderTotalsInAllCurrencies {
  final Map<String, OrderCurrencyTotals> values;

  OrderTotalsInAllCurrencies(this.values);

  factory OrderTotalsInAllCurrencies.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return OrderTotalsInAllCurrencies(const <String, OrderCurrencyTotals>{});
    }

    final map = <String, OrderCurrencyTotals>{};
    json.forEach((currency, value) {
      if (value is Map<String, dynamic>) {
        map[currency] = OrderCurrencyTotals.fromJson(value);
      }
    });
    return OrderTotalsInAllCurrencies(map);
  }

  OrderCurrencyTotals? operator [](String currency) => values[currency];
}

class OrderCurrencyTotals {
  final double subtotal;
  final double shippingCost;
  final double tax;
  final double totalDiscount;
  final double total;

  OrderCurrencyTotals({
    required this.subtotal,
    required this.shippingCost,
    required this.tax,
    required this.totalDiscount,
    required this.total,
  });

  factory OrderCurrencyTotals.fromJson(Map<String, dynamic> json) {
    return OrderCurrencyTotals(
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      shippingCost: (json['shippingCost'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      totalDiscount: (json['totalDiscount'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}

class OrderItem {
  final String? productId;
  final String? variantId;
  final int qty;
  final double basePrice;
  final double discount;
  final double finalPrice;
  final double lineTotal;
  final String currency;
  final String? appliedPromotionId;
  final OrderItemSnapshot snapshot;
  final String? itemStatus;

  OrderItem({
    this.productId,
    this.variantId,
    required this.qty,
    required this.basePrice,
    required this.discount,
    required this.finalPrice,
    required this.lineTotal,
    required this.currency,
    this.appliedPromotionId,
    required this.snapshot,
    this.itemStatus,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'] as String?,
      variantId: json['variantId'] as String?,
      qty: (json['qty'] ?? 0) as int,
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      discount: (json['discount'] ?? json['promotionDiscount'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      lineTotal: (json['lineTotal'] ?? 0).toDouble(),
      currency: json['currency'] as String? ?? 'YER',
      appliedPromotionId: json['appliedPromotionId'] as String?,
      snapshot: OrderItemSnapshot.fromJson(json['snapshot'] as Map<String, dynamic>),
      itemStatus: json['itemStatus'] as String?,
    );
  }

  bool get hasDiscount => finalPrice < basePrice || discount > 0;
  double get discountAmount => hasDiscount ? (basePrice - finalPrice).abs() : 0;
}

class OrderItemSnapshot {
  final String name;
  final String slug;
  final String? sku;
  final String? image;
  final String? brandName;
  final String? categoryName;
  final Map<String, dynamic> attributes;

  OrderItemSnapshot({
    required this.name,
    required this.slug,
    this.sku,
    this.image,
    this.brandName,
    this.categoryName,
    required this.attributes,
  });

  factory OrderItemSnapshot.fromJson(Map<String, dynamic> json) {
    return OrderItemSnapshot(
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      sku: json['sku'] as String?,
      image: json['image'] as String?,
      brandName: json['brandName'] as String?,
      categoryName: json['categoryName'] as String?,
      attributes: Map<String, dynamic>.from(json['attributes'] as Map? ?? const {}),
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
      addressId: json['addressId'] as String? ?? '',
      label: json['label'] as String?,
      line1: json['line1'] as String? ?? '',
      city: json['city'] as String? ?? '',
      coords: json['coords'] != null
          ? DeliveryCoords.fromJson(json['coords'] as Map<String, dynamic>)
          : null,
      notes: json['notes'] as String?,
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
      status: json['status'] as String? ?? '',
      changedAt: DateTime.parse(json['changedAt'] as String),
      changedBy: json['changedBy'] as String? ?? '',
      changedByRole: json['changedByRole'] as String? ?? '',
      notes: json['notes'] as String?,
    );
  }
}
```

---

## 📝 ملاحظات مهمة

1. **Endpoints:**
   - Checkout endpoints في `/orders/checkout/...` وليس `/checkout/...`
   - Orders endpoints في `/orders/...`
   - Endpoints إضافية للعملاء: `GET /orders/recent`, `GET /orders/:id/track`, `POST /orders/:id/rate`, `POST /orders/:id/notes`, `GET /orders/stats/summary`

2. **حالات الطلب (مبسط - v2.1.0):**
   - **المسار الأساسي:**
     - `pending_payment`: في انتظار الدفع (يمكن الإلغاء)
     - `confirmed`: مؤكد ومدفوع (يمكن الإلغاء)
     - `processing`: قيد التجهيز (يمكن الإلغاء)
     - `shipped`: تم الشحن
     - `delivered`: تم التسليم
     - `completed`: مكتمل
   - **حالات استثنائية:**
     - `on_hold`: معلق
     - `cancelled`: ملغي
     - `returned`: مرتجع
     - `refunded`: مسترد

3. **حالات الدفع:**
   - `pending`: في الانتظار
   - `paid`: مدفوع
   - `failed`: فشل
   - `refunded`: مسترد

4. **الكوبونات والخصومات:**
   - يدعم النظام دمج كوبونات متعددة عبر الحقل `couponCodes` بالإضافة إلى `couponCode`.
   - الكوبونات تطبق بالتسلسل بعد خصومات العروض، ويتم إرجاع تفاصيل كاملة داخل `discounts.appliedCoupons`.
   - يتم تعيين `appliedCoupon` لأول كوبون (توافق مع الإصدارات السابقة).

5. **أهلية الدفع عند الاستلام (COD):**
   - يحتاج المستخدم إلى **3 طلبات مكتملة (`delivered`)** على الأقل.
   - تفاصيل الأهلية تظهر في `preview.codEligibility` وكذلك في رسالة الخطأ عند الرفض.
   - عند نجاح طلب COD يتم ترقية الحالة إلى `confirmed` مباشرة وتحديث حالة الدفع إلى `paid`.

6. **الشحن:**
   - `shippingCost` و`shippingDiscount` تدار من لوحة التحكم وتكون 0 افتراضياً.
   - واجهة العميل لا تختار شركة الشحن حالياً (`shippingCompany`, `trackingNumber` يتم تحديثها من لوحة التحكم).
   - `deliveryOptions` لا تزال فارغة حتى اكتمال تكامل شركات التوصيل.

7. **الإلغاء:**
   - متاح فقط في حالات: `pending_payment`, `confirmed`, `processing`, `on_hold`.
   - سبب الإلغاء إلزامي (`reason` ≥ 5 أحرف) ويتم تسجيله في `statusHistory`.

8. **إجماليات العملات:**
   - الحقل `totalsInAllCurrencies` يوفر ملخص USD/YER/SAR باستخدام أسعار الصرف المحدثة.
   - استخدمه لعرض المبالغ المحولة بدون إعادة الحساب على العميل.

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
7. ✅ **v2.0.0:** تبسيط حالات الطلب (10 حالات بدلاً من 15)
8. ✅ **v2.0.0:** تبسيط طرق الدفع (COD و BANK_TRANSFER فقط)
9. ✅ **v2.0.0:** إضافة دعم التحويل البنكي المحلي

### الملفات المرجعية:
- **Controller:** `backend/src/modules/checkout/controllers/order.controller.ts`
- **Service:** `backend/src/modules/checkout/services/order.service.ts`

---

**التالي:** [خدمة التصنيفات (Categories)](./06-categories-service.md)

