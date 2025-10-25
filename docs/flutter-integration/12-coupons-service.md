# 🎫 خدمة الكوبونات (Coupons Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة الكوبونات توفر endpoints للتحقق من كوبونات الخصم وتطبيقها مع دعم أنواع مختلفة من الخصومات.

---

## 📋 جدول المحتويات

1. [التحقق من كوبون](#1-التحقق-من-كوبون)
2. [Models في Flutter](#models-في-flutter)

---

## 1. التحقق من كوبون

يستعلم عن صحة كوبون الخصم ويحسب قيمة الخصم المطبقة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/marketing/coupons/validate`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `code` | `string` | ✅ | كود الكوبون |
| `userId` | `string` | ❌ | معرف المستخدم |
| `orderAmount` | `number` | ❌ | قيمة الطلب |
| `productIds` | `string[]` | ❌ | معرفات المنتجات |

### Response - نجاح (كوبون صالح)

```json
{
  "success": true,
  "valid": true,
  "coupon": {
    "_id": "64coupon123",
    "code": "SUMMER2025",
    "name": "خصم الصيف",
    "description": "خصم 20% على جميع المنتجات",
    "type": "percentage",
    "status": "active",
    "visibility": "public",
    "discountValue": 20,
    "minimumOrderAmount": 100000,
    "maximumDiscountAmount": 500000,
    "usageLimit": 1000,
    "usageLimitPerUser": 1,
    "usedCount": 45,
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validUntil": "2025-12-31T23:59:59.000Z",
    "appliesTo": "all_products",
    "applicableProductIds": [],
    "applicableCategoryIds": [],
    "applicableBrandIds": [],
    "applicableUserIds": [],
    "excludedUserIds": [],
    "buyXQuantity": null,
    "getYQuantity": null,
    "getYProductId": null,
    "totalRedemptions": 45,
    "totalDiscountGiven": 900000,
    "totalRevenue": 3600000,
    "deletedAt": null,
    "deletedBy": null,
    "createdBy": "64admin123",
    "lastModifiedBy": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "requestId": "req_coupon_001"
}
```

### Response - خطأ (كوبون غير صالح)

```json
{
  "success": true,
  "valid": false,
  "message": "Invalid coupon code",
  "requestId": "req_coupon_002"
}
```

**ملاحظة:** 
- الـ response يعيد `{ valid: true/false, coupon?, message? }` مباشرة (بدون `data` wrapper)
- إذا كان الكوبون صالح: `{ valid: true, coupon: {...} }`
- إذا كان غير صالح: `{ valid: false, message: "..." }`

### Errors

| Message | الوصف |
|---------|-------|
| `Invalid coupon code` | الكوبون غير موجود |
| `Coupon has expired` | الكوبون منتهي الصلاحية |
| `Coupon usage limit exceeded` | تم استنفاد حد الاستخدام |

### كود Flutter

```dart
Future<CouponValidationResult> validateCoupon({
  required String code,
  String? userId,
  double? orderAmount,
  List<String>? productIds,
}) async {
  final response = await _dio.get('/marketing/coupons/validate', queryParameters: {
    'code': code,
    if (userId != null) 'userId': userId,
    if (orderAmount != null) 'orderAmount': orderAmount,
    if (productIds != null) 'productIds': productIds,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return CouponValidationResult.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/coupon/coupon_models.dart`

```dart
enum CouponType {
  percentage,
  fixed_amount,
  free_shipping,
  buy_x_get_y,
}

extension CouponTypeExtension on CouponType {
  String get value {
    switch (this) {
      case CouponType.percentage: return 'percentage';
      case CouponType.fixed_amount: return 'fixed_amount';
      case CouponType.free_shipping: return 'free_shipping';
      case CouponType.buy_x_get_y: return 'buy_x_get_y';
    }
  }

  static CouponType fromString(String value) {
    return CouponType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => CouponType.percentage,
    );
  }
}

enum CouponStatus {
  active,
  inactive,
  expired,
  exhausted,
}

enum CouponVisibility {
  public,
  private,
  hidden,
}

enum DiscountAppliesTo {
  all_products,
  specific_products,
  specific_categories,
  specific_brands,
  minimum_order_amount,
}

extension DiscountAppliesToExtension on DiscountAppliesTo {
  String get value {
    switch (this) {
      case DiscountAppliesTo.all_products: return 'all_products';
      case DiscountAppliesTo.specific_products: return 'specific_products';
      case DiscountAppliesTo.specific_categories: return 'specific_categories';
      case DiscountAppliesTo.specific_brands: return 'specific_brands';
      case DiscountAppliesTo.minimum_order_amount: return 'minimum_order_amount';
    }
  }

  static DiscountAppliesTo fromString(String value) {
    return DiscountAppliesTo.values.firstWhere(
      (e) => e.value == value,
      orElse: () => DiscountAppliesTo.all_products,
    );
  }
}

class Coupon {
  final String id;
  final String code;
  final String name;
  final String? description;
  final CouponType type;
  final CouponStatus status;
  final CouponVisibility visibility;
  final double? discountValue;
  final double? minimumOrderAmount;
  final double? maximumDiscountAmount;
  final int? usageLimit;
  final int? usageLimitPerUser;
  final int usedCount;
  final DateTime validFrom;
  final DateTime validUntil;
  final DiscountAppliesTo appliesTo;
  final List<String> applicableProductIds;
  final List<String> applicableCategoryIds;
  final List<String> applicableBrandIds;
  final List<String> applicableUserIds;
  final List<String> excludedUserIds;
  final int? buyXQuantity;
  final int? getYQuantity;
  final String? getYProductId;
  final int totalRedemptions;
  final double totalDiscountGiven;
  final double totalRevenue;
  final DateTime? deletedAt;
  final String? deletedBy;
  final String? createdBy;
  final String? lastModifiedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Coupon({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    required this.type,
    required this.status,
    required this.visibility,
    this.discountValue,
    this.minimumOrderAmount,
    this.maximumDiscountAmount,
    this.usageLimit,
    this.usageLimitPerUser,
    required this.usedCount,
    required this.validFrom,
    required this.validUntil,
    required this.appliesTo,
    required this.applicableProductIds,
    required this.applicableCategoryIds,
    required this.applicableBrandIds,
    required this.applicableUserIds,
    required this.excludedUserIds,
    this.buyXQuantity,
    this.getYQuantity,
    this.getYProductId,
    required this.totalRedemptions,
    required this.totalDiscountGiven,
    required this.totalRevenue,
    this.deletedAt,
    this.deletedBy,
    this.createdBy,
    this.lastModifiedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['_id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      type: CouponTypeExtension.fromString(json['type']),
      status: CouponStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => CouponStatus.active,
      ),
      visibility: CouponVisibility.values.firstWhere(
        (e) => e.name == json['visibility'],
        orElse: () => CouponVisibility.public,
      ),
      discountValue: json['discountValue']?.toDouble(),
      minimumOrderAmount: json['minimumOrderAmount']?.toDouble(),
      maximumDiscountAmount: json['maximumDiscountAmount']?.toDouble(),
      usageLimit: json['usageLimit']?.toInt(),
      usageLimitPerUser: json['usageLimitPerUser']?.toInt(),
      usedCount: json['usedCount'] ?? 0,
      validFrom: DateTime.parse(json['validFrom']),
      validUntil: DateTime.parse(json['validUntil']),
      appliesTo: DiscountAppliesToExtension.fromString(json['appliesTo']),
      applicableProductIds: List<String>.from(json['applicableProductIds'] ?? []),
      applicableCategoryIds: List<String>.from(json['applicableCategoryIds'] ?? []),
      applicableBrandIds: List<String>.from(json['applicableBrandIds'] ?? []),
      applicableUserIds: List<String>.from(json['applicableUserIds'] ?? []),
      excludedUserIds: List<String>.from(json['excludedUserIds'] ?? []),
      buyXQuantity: json['buyXQuantity']?.toInt(),
      getYQuantity: json['getYQuantity']?.toInt(),
      getYProductId: json['getYProductId'],
      totalRedemptions: json['totalRedemptions'] ?? 0,
      totalDiscountGiven: (json['totalDiscountGiven'] ?? 0).toDouble(),
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      deletedAt: json['deletedAt'] != null ? DateTime.parse(json['deletedAt']) : null,
      deletedBy: json['deletedBy'],
      createdBy: json['createdBy'],
      lastModifiedBy: json['lastModifiedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isPercentage => type == CouponType.percentage;
  bool get isFixedAmount => type == CouponType.fixed_amount;
  bool get isFreeShipping => type == CouponType.free_shipping;
  bool get isBuyXGetY => type == CouponType.buy_x_get_y;
  
  bool get isActive {
    final now = DateTime.now();
    if (now.isBefore(validFrom)) return false;
    if (now.isAfter(validUntil)) return false;
    if (status != CouponStatus.active) return false;
    return true;
  }

  bool get isExpired => DateTime.now().isAfter(validUntil);
  bool get isNotStarted => DateTime.now().isBefore(validFrom);
  bool get isExhausted => usageLimit != null && usedCount >= usageLimit!;
  bool get isPublic => visibility == CouponVisibility.public;
  bool get isPrivate => visibility == CouponVisibility.private;
  bool get isHidden => visibility == CouponVisibility.hidden;
  bool get hasUsageLimit => usageLimit != null;
  bool get hasUserLimit => usageLimitPerUser != null;
  bool get hasMinimumOrder => minimumOrderAmount != null;
  bool get hasMaximumDiscount => maximumDiscountAmount != null;
  bool get hasProductRestrictions => applicableProductIds.isNotEmpty;
  bool get hasCategoryRestrictions => applicableCategoryIds.isNotEmpty;
  bool get hasBrandRestrictions => applicableBrandIds.isNotEmpty;
  bool get hasUserRestrictions => applicableUserIds.isNotEmpty;
  bool get hasExcludedUsers => excludedUserIds.isNotEmpty;
  bool get hasBuyXGetY => buyXQuantity != null && getYQuantity != null;
  bool get isDeleted => deletedAt != null;
  bool get hasDescription => description != null && description!.isNotEmpty;
  bool get hasStatistics => totalRedemptions > 0 || totalDiscountGiven > 0 || totalRevenue > 0;
  double get usagePercentage => usageLimit != null ? (usedCount / usageLimit!) * 100 : 0;
  double get averageDiscount => totalRedemptions > 0 ? totalDiscountGiven / totalRedemptions : 0;
  double get averageRevenue => totalRedemptions > 0 ? totalRevenue / totalRedemptions : 0;
}

class CouponValidationResult {
  final bool valid;
  final Coupon? coupon;
  final String? message;

  CouponValidationResult({
    required this.valid,
    this.coupon,
    this.message,
  });

  factory CouponValidationResult.fromJson(Map<String, dynamic> json) {
    return CouponValidationResult(
      valid: json['valid'] ?? false,
      coupon: json['coupon'] != null ? Coupon.fromJson(json['coupon']) : null,
      message: json['message'],
    );
  }

  bool get isValid => valid;
  bool get hasError => !valid && message != null;
  String? get errorMessage => message;
  
  // Coupon helpers
  bool get hasCoupon => coupon != null;
  bool get isPercentageDiscount => coupon?.isPercentage ?? false;
  bool get isFixedDiscount => coupon?.isFixedAmount ?? false;
  bool get isFreeShippingDiscount => coupon?.isFreeShipping ?? false;
  bool get isBuyXGetYDiscount => coupon?.isBuyXGetY ?? false;
  
  double? get discountValue => coupon?.discountValue;
  double? get minimumOrderAmount => coupon?.minimumOrderAmount;
  double? get maximumDiscountAmount => coupon?.maximumDiscountAmount;
}
```

---

## 📝 ملاحظات مهمة

1. **أنواع الكوبونات:**
   - `percentage`: خصم بنسبة مئوية
   - `fixed_amount`: خصم بمبلغ ثابت
   - `free_shipping`: شحن مجاني
   - `buy_x_get_y`: اشتر X واحصل على Y

2. **حالات الكوبون:**
   - `active`: نشط
   - `inactive`: غير نشط
   - `expired`: منتهي الصلاحية
   - `exhausted`: مستنفد

3. **رؤية الكوبون:**
   - `public`: عام
   - `private`: خاص
   - `hidden`: مخفي

4. **تطبيق الخصم:**
   - `all_products`: جميع المنتجات
   - `specific_products`: منتجات محددة
   - `specific_categories`: فئات محددة
   - `specific_brands`: براندات محددة
   - `minimum_order_amount`: حد أدنى للطلب

5. **القيود:**
   - `usageLimit`: حد الاستخدام الإجمالي
   - `usageLimitPerUser`: حد الاستخدام لكل مستخدم
   - `minimumOrderAmount`: الحد الأدنى لقيمة الطلب
   - `maximumDiscountAmount`: الحد الأقصى للخصم

6. **التحقق من الصحة:**
   - `isActive`: التحقق من النشاط
   - `isExpired`: التحقق من انتهاء الصلاحية
   - `isNotStarted`: التحقق من عدم بدء الصلاحية
   - `isExhausted`: التحقق من الاستنفاد

7. **القيود على المنتجات:**
   - `applicableProductIds`: منتجات قابلة للتطبيق
   - `applicableCategoryIds`: فئات قابلة للتطبيق
   - `applicableBrandIds`: براندات قابلة للتطبيق
   - `applicableUserIds`: مستخدمون قابلة للتطبيق
   - `excludedUserIds`: مستخدمون مستبعدون

8. **Buy X Get Y:**
   - `buyXQuantity`: كمية الشراء
   - `getYQuantity`: كمية الحصول
   - `getYProductId`: منتج الحصول

9. **الإحصائيات:**
   - `totalRedemptions`: إجمالي الاسترداد
   - `totalDiscountGiven`: إجمالي الخصم الممنوح
   - `totalRevenue`: إجمالي الإيرادات
   - `usagePercentage`: نسبة الاستخدام
   - `averageDiscount`: متوسط الخصم
   - `averageRevenue`: متوسط الإيرادات

10. **التحقق من الصحة:**
    - `validateCoupon()`: للتحقق من صحة الكوبون
    - `valid`: صحة الكوبون (true/false)
    - `coupon`: بيانات الكوبون (إذا كان صالح)
    - `message`: رسالة الخطأ (إذا كان غير صالح)

11. **الاستخدام:**
    - استخدم `isActive` للتحقق من النشاط
    - استخدم `isExpired` للتحقق من انتهاء الصلاحية
    - استخدم `isExhausted` للتحقق من الاستنفاد
    - استخدم `hasUsageLimit` للتحقق من وجود حد استخدام
    - استخدم `hasUserLimit` للتحقق من وجود حد للمستخدم

12. **القيود:**
    - استخدم `hasMinimumOrder` للتحقق من وجود حد أدنى للطلب
    - استخدم `hasMaximumDiscount` للتحقق من وجود حد أقصى للخصم
    - استخدم `hasProductRestrictions` للتحقق من وجود قيود على المنتجات
    - استخدم `hasCategoryRestrictions` للتحقق من وجود قيود على الفئات
    - استخدم `hasBrandRestrictions` للتحقق من وجود قيود على البراندات

13. **الخصم:**
    - استخدم `isPercentage` للتحقق من الخصم النسبي
    - استخدم `isFixedAmount` للتحقق من الخصم الثابت
    - استخدم `isFreeShipping` للتحقق من الشحن المجاني
    - استخدم `isBuyXGetY` للتحقق من اشتر X واحصل على Y

14. **النتائج:**
    - استخدم `isValid` للتحقق من صحة الكوبون
    - استخدم `hasError` للتحقق من وجود خطأ
    - استخدم `errorMessage` للحصول على رسالة الخطأ
    - استخدم `hasCoupon` للتحقق من وجود بيانات الكوبون
    - استخدم `discountValue`/`minimumOrderAmount`/`maximumDiscountAmount` للحصول على معلومات الخصم

15. **التحسين:**
    - استخدم `usagePercentage` لعرض نسبة الاستخدام
    - استخدم `averageDiscount` لعرض متوسط الخصم
    - استخدم `averageRevenue` لعرض متوسط الإيرادات
    - استخدم `hasStatistics` للتحقق من وجود إحصائيات
    - استخدم `hasDescription` للتحقق من وجود وصف

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تصحيح Validate Response - `{ valid: true/false, coupon?, message? }` بدلاً من `{ data: { coupon, calculatedDiscount, finalAmount, ... } }`
2. ✅ تحديث Enums - استخدام snake_case: `fixed_amount`, `free_shipping`, `buy_x_get_y`, `all_products`
3. ✅ إضافة Extensions للـ Enums - للتحويل من/إلى String بشكل صحيح
4. ✅ تبسيط `CouponValidationResult` - إزالة `calculatedDiscount`, `finalAmount`, `validationMessage`
5. ✅ إضافة error messages الفعلية (Invalid coupon code, Coupon has expired, Coupon usage limit exceeded)

**ملاحظات مهمة:**
- الـ validation **لا يحسب** الخصم - فقط يتحقق من الصحة
- الـ response يعيد الـ coupon object كامل إذا كان صالح
- الـ response يعيد `message` فقط إذا كان غير صالح
- حساب الخصم الفعلي يتم في `/orders/checkout/preview` endpoint

**ملفات Backend المرجعية:**
- `backend/src/modules/marketing/public.controller.ts` - validate endpoint
- `backend/src/modules/marketing/marketing.service.ts` - validateCoupon logic
- `backend/src/modules/marketing/schemas/coupon.schema.ts` - Coupon Schema و Enums
- `backend/src/modules/marketing/dto/coupon.dto.ts` - ValidateCouponDto

---

**التالي:** [خدمة التسعير (Pricing)](./13-pricing-service.md)

