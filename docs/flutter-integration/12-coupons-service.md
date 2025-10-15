# 🎫 خدمة الكوبونات (Coupons Service)

خدمة الكوبونات توفر endpoints للتحقق من كوبونات الخصم وتطبيقها.

---

## Endpoints

### 1. التحقق من كوبون
- **POST** `/coupons/validate`
- **Auth:** ❌ No
- **Body:**
```json
{
  "code": "SUMMER2025",
  "userId": "user_456",
  "cartTotal": 1000000,
  "currency": "YER"
}
```

- **Response - صالح:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "code": "SUMMER2025",
      "title": {"ar": "خصم الصيف", "en": "Summer Discount"},
      "description": {"ar": "خصم 20% على جميع المنتجات", "en": "20% off all products"},
      "type": "PERCENTAGE",
      "discountPercentage": 20,
      "discountAmount": null
    },
    "calculatedDiscount": 200000,
    "finalAmount": 800000
  },
  "message": "الكوبون صالح"
}
```

- **Response - غير صالح:**
```json
{
  "success": false,
  "message": "الكوبون منتهي الصلاحية"
}
```

### 2. الكوبونات العامة
- **GET** `/coupons/public`
- **Auth:** ❌ No
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "WELCOME10",
      "title": {"ar": "خصم الترحيب", "en": "Welcome Discount"},
      "type": "PERCENTAGE",
      "discountPercentage": 10,
      "minOrderAmount": 500000,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z"
    }
  ]
}
```

### 3. الكوبونات التلقائية
- **GET** `/coupons/auto-apply?userId=user_456&accountType=customer`
- **Auth:** ❌ No

### 4. كوبون بالكود
- **GET** `/coupons/code/:code`
- **Auth:** ❌ No

---

## Models في Flutter

```dart
class Coupon {
  final String code;
  final LocalizedString title;
  final LocalizedString? description;
  final String type; // PERCENTAGE, FIXED_AMOUNT
  final double? discountPercentage;
  final double? discountAmount;
  final double? minOrderAmount;
  final DateTime? startDate;
  final DateTime? endDate;

  Coupon({
    required this.code,
    required this.title,
    this.description,
    required this.type,
    this.discountPercentage,
    this.discountAmount,
    this.minOrderAmount,
    this.startDate,
    this.endDate,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      code: json['code'],
      title: LocalizedString.fromJson(json['title']),
      description: json['description'] != null
          ? LocalizedString.fromJson(json['description'])
          : null,
      type: json['type'],
      discountPercentage: json['discountPercentage']?.toDouble(),
      discountAmount: json['discountAmount']?.toDouble(),
      minOrderAmount: json['minOrderAmount']?.toDouble(),
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'])
          : null,
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'])
          : null,
    );
  }

  bool get isPercentage => type == 'PERCENTAGE';
  bool get isFixedAmount => type == 'FIXED_AMOUNT';
  
  bool get isActive {
    final now = DateTime.now();
    if (startDate != null && now.isBefore(startDate!)) return false;
    if (endDate != null && now.isAfter(endDate!)) return false;
    return true;
  }
}

class CouponValidationResult {
  final Coupon coupon;
  final double calculatedDiscount;
  final double finalAmount;

  CouponValidationResult({
    required this.coupon,
    required this.calculatedDiscount,
    required this.finalAmount,
  });

  factory CouponValidationResult.fromJson(Map<String, dynamic> json) {
    return CouponValidationResult(
      coupon: Coupon.fromJson(json['coupon']),
      calculatedDiscount: (json['calculatedDiscount'] ?? 0).toDouble(),
      finalAmount: (json['finalAmount'] ?? 0).toDouble(),
    );
  }
}
```

---

**التالي:** [خدمة التسعير (Pricing)](./13-pricing-service.md)

