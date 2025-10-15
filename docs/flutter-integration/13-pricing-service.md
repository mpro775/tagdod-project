# 💰 خدمة التسعير (Pricing Service)

خدمة التسعير توفر endpoints لحساب الأسعار مع العروض والخصومات.

---

## Endpoints

### 1. سعر منتج (Variant)
- **GET** `/pricing/variant/:variantId?currency=YER&quantity=1&accountType=customer&couponCode=SUMMER2025`
- **Auth:** ❌ No
- **Response:**
```json
{
  "success": true,
  "data": {
    "variantId": "var_789",
    "basePrice": 150000,
    "salePrice": 135000,
    "quantity": 1,
    "subtotal": 135000,
    "promotions": [
      {
        "id": "promo_123",
        "name": "خصم الصيف",
        "type": "PERCENTAGE",
        "value": 10,
        "discount": 15000
      }
    ],
    "totalDiscount": 15000,
    "finalPrice": 135000,
    "currency": "YER"
  }
}
```

### 2. حساب السلة
- **POST** `/pricing/cart`
- **Auth:** ❌ No
- **Body:**
```json
{
  "items": [
    {"variantId": "var_789", "quantity": 2},
    {"variantId": "var_012", "quantity": 1}
  ],
  "currency": "YER",
  "accountType": "customer",
  "couponCode": "SUMMER2025"
}
```

- **Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "variantId": "var_789",
        "quantity": 2,
        "unitPrice": 135000,
        "lineTotal": 270000
      }
    ],
    "subtotal": 1120000,
    "shipping": 50000,
    "tax": 0,
    "discount": 224000,
    "total": 946000,
    "currency": "YER",
    "appliedPromotions": [...]
  }
}
```

### 3. التحقق من كوبون
- **GET** `/pricing/coupon/:code`
- **Auth:** ❌ No

---

## Models في Flutter

```dart
class PricingResult {
  final String variantId;
  final double basePrice;
  final double? salePrice;
  final int quantity;
  final double subtotal;
  final List<AppliedPromotion> promotions;
  final double totalDiscount;
  final double finalPrice;
  final String currency;

  PricingResult({
    required this.variantId,
    required this.basePrice,
    this.salePrice,
    required this.quantity,
    required this.subtotal,
    required this.promotions,
    required this.totalDiscount,
    required this.finalPrice,
    required this.currency,
  });

  factory PricingResult.fromJson(Map<String, dynamic> json) {
    return PricingResult(
      variantId: json['variantId'],
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      salePrice: json['salePrice']?.toDouble(),
      quantity: json['quantity'] ?? 1,
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      promotions: (json['promotions'] as List?)
              ?.map((e) => AppliedPromotion.fromJson(e))
              .toList() ??
          [],
      totalDiscount: (json['totalDiscount'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
    );
  }

  bool get hasDiscount => totalDiscount > 0;
}

class AppliedPromotion {
  final String id;
  final String name;
  final String type;
  final double value;
  final double discount;

  AppliedPromotion({
    required this.id,
    required this.name,
    required this.type,
    required this.value,
    required this.discount,
  });

  factory AppliedPromotion.fromJson(Map<String, dynamic> json) {
    return AppliedPromotion(
      id: json['id'],
      name: json['name'],
      type: json['type'],
      value: (json['value'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
    );
  }
}
```

---

**التالي:** [خدمة الإشعارات (Notifications)](./14-notifications-service.md)

