# 💰 خدمة التسعير (Pricing Service)

خدمة التسعير توفر endpoints لحساب الأسعار الفعالة مع العروض والخصومات.

---

## 📋 جدول المحتويات

1. [سعر منتج (Variant)](#1-سعر-منتج-variant)
2. [Models في Flutter](#models-في-flutter)

---

## 1. سعر منتج (Variant)

يحسب السعر الفعال لمنتج معين مع تطبيق العروض والخصومات.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/marketing/pricing/variant`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `variantId` | `string` | ✅ | معرف المنتج |
| `currency` | `string` | ❌ | العملة (افتراضي: YER) |
| `qty` | `number` | ❌ | الكمية (افتراضي: 1) |
| `accountType` | `string` | ❌ | نوع الحساب (customer, wholesale, engineer) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "originalPrice": 150000,
    "effectivePrice": 135000,
    "appliedRule": {
      "_id": "64rule123",
      "active": true,
      "priority": 1,
      "startAt": "2025-01-01T00:00:00.000Z",
      "endAt": "2025-12-31T23:59:59.000Z",
      "conditions": {
        "categoryId": "cat_solar",
        "currency": "YER",
        "minQty": 1,
        "accountType": "customer"
      },
      "effects": {
        "percentOff": 10,
        "badge": "خصم الصيف",
        "giftSku": "gift_solar_kit"
      },
      "usageLimits": {
        "maxUses": 1000,
        "maxUsesPerUser": 1,
        "currentUses": 45
      },
      "metadata": {
        "title": "خصم الصيف",
        "description": "خصم 10% على جميع المنتجات الشمسية",
        "termsAndConditions": "يجب أن يكون الطلب أكثر من 100,000 ريال"
      },
      "stats": {
        "views": 1200,
        "appliedCount": 45,
        "revenue": 6750000,
        "savings": 750000
      },
      "couponCode": "SUMMER2025",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    "savings": 15000,
    "badge": "خصم الصيف",
    "giftSku": "gift_solar_kit"
  },
  "requestId": "req_pricing_001"
}
```

### Response - خطأ

```json
{
  "success": false,
  "error": {
    "code": "VARIANT_NOT_FOUND",
    "message": "المنتج غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_pricing_002"
}
```

### كود Flutter

```dart
Future<EffectivePriceResult> getVariantPrice({
  required String variantId,
  String currency = 'YER',
  int qty = 1,
  String? accountType,
}) async {
  final response = await _dio.get('/marketing/pricing/variant', queryParameters: {
    'variantId': variantId,
    'currency': currency,
    'qty': qty,
    if (accountType != null) 'accountType': accountType,
  });

  final apiResponse = ApiResponse<EffectivePriceResult>.fromJson(
    response.data,
    (json) => EffectivePriceResult.fromJson(json),
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

### ملف: `lib/models/pricing/pricing_models.dart`

```dart
class EffectivePriceResult {
  final double originalPrice;
  final double effectivePrice;
  final PriceRule? appliedRule;
  final double? savings;
  final String? badge;
  final String? giftSku;

  EffectivePriceResult({
    required this.originalPrice,
    required this.effectivePrice,
    this.appliedRule,
    this.savings,
    this.badge,
    this.giftSku,
  });

  factory EffectivePriceResult.fromJson(Map<String, dynamic> json) {
    return EffectivePriceResult(
      originalPrice: (json['originalPrice'] ?? 0).toDouble(),
      effectivePrice: (json['effectivePrice'] ?? 0).toDouble(),
      appliedRule: json['appliedRule'] != null 
          ? PriceRule.fromJson(json['appliedRule']) 
          : null,
      savings: json['savings']?.toDouble(),
      badge: json['badge'],
      giftSku: json['giftSku'],
    );
  }

  bool get hasDiscount => savings != null && savings! > 0;
  bool get hasAppliedRule => appliedRule != null;
  bool get hasBadge => badge != null && badge!.isNotEmpty;
  bool get hasGift => giftSku != null && giftSku!.isNotEmpty;
  double get discountPercentage => originalPrice > 0 
      ? ((originalPrice - effectivePrice) / originalPrice) * 100 
      : 0;
  double get finalPrice => effectivePrice;
}

class PriceRule {
  final String id;
  final bool active;
  final int priority;
  final DateTime startAt;
  final DateTime endAt;
  final PriceRuleConditions conditions;
  final PriceRuleEffects effects;
  final PriceRuleUsageLimits? usageLimits;
  final PriceRuleMetadata? metadata;
  final PriceRuleStats stats;
  final String? couponCode;
  final DateTime createdAt;
  final DateTime updatedAt;

  PriceRule({
    required this.id,
    required this.active,
    required this.priority,
    required this.startAt,
    required this.endAt,
    required this.conditions,
    required this.effects,
    this.usageLimits,
    this.metadata,
    required this.stats,
    this.couponCode,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PriceRule.fromJson(Map<String, dynamic> json) {
    return PriceRule(
      id: json['_id'] ?? '',
      active: json['active'] ?? true,
      priority: json['priority'] ?? 0,
      startAt: DateTime.parse(json['startAt']),
      endAt: DateTime.parse(json['endAt']),
      conditions: PriceRuleConditions.fromJson(json['conditions'] ?? {}),
      effects: PriceRuleEffects.fromJson(json['effects'] ?? {}),
      usageLimits: json['usageLimits'] != null 
          ? PriceRuleUsageLimits.fromJson(json['usageLimits']) 
          : null,
      metadata: json['metadata'] != null 
          ? PriceRuleMetadata.fromJson(json['metadata']) 
          : null,
      stats: PriceRuleStats.fromJson(json['stats'] ?? {}),
      couponCode: json['couponCode'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isActive {
    final now = DateTime.now();
    return active && now.isAfter(startAt) && now.isBefore(endAt);
  }

  bool get isExpired => DateTime.now().isAfter(endAt);
  bool get isNotStarted => DateTime.now().isBefore(startAt);
  bool get hasUsageLimit => usageLimits != null && usageLimits!.maxUses != null;
  bool get hasUserLimit => usageLimits != null && usageLimits!.maxUsesPerUser != null;
  bool get isExhausted => hasUsageLimit && usageLimits!.currentUses >= usageLimits!.maxUses!;
  bool get hasCoupon => couponCode != null && couponCode!.isNotEmpty;
  bool get hasMetadata => metadata != null;
  bool get hasStats => stats.views > 0 || stats.appliedCount > 0 || stats.revenue > 0 || stats.savings > 0;
  double get usagePercentage => hasUsageLimit 
      ? (usageLimits!.currentUses / usageLimits!.maxUses!) * 100 
      : 0;
  double get averageRevenue => stats.appliedCount > 0 ? stats.revenue / stats.appliedCount : 0;
  double get averageSavings => stats.appliedCount > 0 ? stats.savings / stats.appliedCount : 0;
}

class PriceRuleConditions {
  final String? categoryId;
  final String? productId;
  final String? variantId;
  final String? brandId;
  final String? currency;
  final int? minQty;
  final String? accountType;

  PriceRuleConditions({
    this.categoryId,
    this.productId,
    this.variantId,
    this.brandId,
    this.currency,
    this.minQty,
    this.accountType,
  });

  factory PriceRuleConditions.fromJson(Map<String, dynamic> json) {
    return PriceRuleConditions(
      categoryId: json['categoryId'],
      productId: json['productId'],
      variantId: json['variantId'],
      brandId: json['brandId'],
      currency: json['currency'],
      minQty: json['minQty']?.toInt(),
      accountType: json['accountType'],
    );
  }

  bool get hasCategory => categoryId != null && categoryId!.isNotEmpty;
  bool get hasProduct => productId != null && productId!.isNotEmpty;
  bool get hasVariant => variantId != null && variantId!.isNotEmpty;
  bool get hasBrand => brandId != null && brandId!.isNotEmpty;
  bool get hasCurrency => currency != null && currency!.isNotEmpty;
  bool get hasMinQty => minQty != null && minQty! > 0;
  bool get hasAccountType => accountType != null && accountType!.isNotEmpty;
}

class PriceRuleEffects {
  final double? percentOff;
  final double? amountOff;
  final double? specialPrice;
  final String? badge;
  final String? giftSku;

  PriceRuleEffects({
    this.percentOff,
    this.amountOff,
    this.specialPrice,
    this.badge,
    this.giftSku,
  });

  factory PriceRuleEffects.fromJson(Map<String, dynamic> json) {
    return PriceRuleEffects(
      percentOff: json['percentOff']?.toDouble(),
      amountOff: json['amountOff']?.toDouble(),
      specialPrice: json['specialPrice']?.toDouble(),
      badge: json['badge'],
      giftSku: json['giftSku'],
    );
  }

  bool get hasPercentageDiscount => percentOff != null && percentOff! > 0;
  bool get hasAmountDiscount => amountOff != null && amountOff! > 0;
  bool get hasSpecialPrice => specialPrice != null && specialPrice! > 0;
  bool get hasBadge => badge != null && badge!.isNotEmpty;
  bool get hasGift => giftSku != null && giftSku!.isNotEmpty;
  bool get hasDiscount => hasPercentageDiscount || hasAmountDiscount || hasSpecialPrice;
}

class PriceRuleUsageLimits {
  final int? maxUses;
  final int? maxUsesPerUser;
  final int currentUses;

  PriceRuleUsageLimits({
    this.maxUses,
    this.maxUsesPerUser,
    required this.currentUses,
  });

  factory PriceRuleUsageLimits.fromJson(Map<String, dynamic> json) {
    return PriceRuleUsageLimits(
      maxUses: json['maxUses']?.toInt(),
      maxUsesPerUser: json['maxUsesPerUser']?.toInt(),
      currentUses: json['currentUses'] ?? 0,
    );
  }

  bool get hasMaxUses => maxUses != null;
  bool get hasMaxUsesPerUser => maxUsesPerUser != null;
  bool get isExhausted => hasMaxUses && currentUses >= maxUses!;
  double get usagePercentage => hasMaxUses ? (currentUses / maxUses!) * 100 : 0;
}

class PriceRuleMetadata {
  final String? title;
  final String? description;
  final String? termsAndConditions;

  PriceRuleMetadata({
    this.title,
    this.description,
    this.termsAndConditions,
  });

  factory PriceRuleMetadata.fromJson(Map<String, dynamic> json) {
    return PriceRuleMetadata(
      title: json['title'],
      description: json['description'],
      termsAndConditions: json['termsAndConditions'],
    );
  }

  bool get hasTitle => title != null && title!.isNotEmpty;
  bool get hasDescription => description != null && description!.isNotEmpty;
  bool get hasTerms => termsAndConditions != null && termsAndConditions!.isNotEmpty;
}

class PriceRuleStats {
  final int views;
  final int appliedCount;
  final double revenue;
  final double savings;

  PriceRuleStats({
    required this.views,
    required this.appliedCount,
    required this.revenue,
    required this.savings,
  });

  factory PriceRuleStats.fromJson(Map<String, dynamic> json) {
    return PriceRuleStats(
      views: json['views'] ?? 0,
      appliedCount: json['appliedCount'] ?? 0,
      revenue: (json['revenue'] ?? 0).toDouble(),
      savings: (json['savings'] ?? 0).toDouble(),
    );
  }

  bool get hasViews => views > 0;
  bool get hasApplications => appliedCount > 0;
  bool get hasRevenue => revenue > 0;
  bool get hasSavings => savings > 0;
  double get averageRevenue => appliedCount > 0 ? revenue / appliedCount : 0;
  double get averageSavings => appliedCount > 0 ? savings / appliedCount : 0;
}
```

---

## 📝 ملاحظات مهمة

1. **السعر الفعال:**
   - `originalPrice`: السعر الأصلي
   - `effectivePrice`: السعر الفعال بعد تطبيق العروض
   - `savings`: قيمة التوفير
   - `discountPercentage`: نسبة الخصم

2. **قواعد التسعير:**
   - `active`: حالة القاعدة
   - `priority`: أولوية التطبيق
   - `startAt`/`endAt`: فترة الصلاحية
   - `isActive`: التحقق من النشاط

3. **شروط القاعدة:**
   - `categoryId`: فئة المنتج
   - `productId`: منتج محدد
   - `variantId`: متغير محدد
   - `brandId`: براند محدد
   - `currency`: العملة
   - `minQty`: الحد الأدنى للكمية
   - `accountType`: نوع الحساب

4. **تأثيرات القاعدة:**
   - `percentOff`: خصم بنسبة مئوية
   - `amountOff`: خصم بمبلغ ثابت
   - `specialPrice`: سعر خاص
   - `badge`: شارة العرض
   - `giftSku`: هدية

5. **حدود الاستخدام:**
   - `maxUses`: الحد الأقصى للاستخدام
   - `maxUsesPerUser`: الحد الأقصى لكل مستخدم
   - `currentUses`: الاستخدام الحالي
   - `isExhausted`: التحقق من الاستنفاد

6. **البيانات الوصفية:**
   - `title`: عنوان القاعدة
   - `description`: وصف القاعدة
   - `termsAndConditions`: الشروط والأحكام
   - `hasMetadata`: التحقق من وجود بيانات وصفية

7. **الإحصائيات:**
   - `views`: عدد المشاهدات
   - `appliedCount`: عدد التطبيقات
   - `revenue`: الإيرادات
   - `savings`: التوفير
   - `averageRevenue`: متوسط الإيرادات
   - `averageSavings`: متوسط التوفير

8. **الكوبونات:**
   - `couponCode`: كود الكوبون
   - `hasCoupon`: التحقق من وجود كوبون
   - ربط القاعدة بكوبون محدد

9. **التحقق من الصحة:**
   - `isActive`: التحقق من النشاط
   - `isExpired`: التحقق من انتهاء الصلاحية
   - `isNotStarted`: التحقق من عدم بدء الصلاحية
   - `isExhausted`: التحقق من الاستنفاد

10. **الاستخدام:**
    - استخدم `hasDiscount` للتحقق من وجود خصم
    - استخدم `hasAppliedRule` للتحقق من وجود قاعدة مطبقة
    - استخدم `hasBadge` للتحقق من وجود شارة
    - استخدم `hasGift` للتحقق من وجود هدية
    - استخدم `discountPercentage` لحساب نسبة الخصم

11. **الشروط:**
    - استخدم `hasCategory` للتحقق من وجود فئة
    - استخدم `hasProduct` للتحقق من وجود منتج
    - استخدم `hasVariant` للتحقق من وجود متغير
    - استخدم `hasBrand` للتحقق من وجود براند
    - استخدم `hasCurrency` للتحقق من وجود عملة
    - استخدم `hasMinQty` للتحقق من وجود حد أدنى للكمية
    - استخدم `hasAccountType` للتحقق من وجود نوع حساب

12. **التأثيرات:**
    - استخدم `hasPercentageDiscount` للتحقق من الخصم النسبي
    - استخدم `hasAmountDiscount` للتحقق من الخصم الثابت
    - استخدم `hasSpecialPrice` للتحقق من السعر الخاص
    - استخدم `hasBadge` للتحقق من وجود شارة
    - استخدم `hasGift` للتحقق من وجود هدية
    - استخدم `hasDiscount` للتحقق من وجود خصم

13. **حدود الاستخدام:**
    - استخدم `hasMaxUses` للتحقق من وجود حد أقصى للاستخدام
    - استخدم `hasMaxUsesPerUser` للتحقق من وجود حد أقصى لكل مستخدم
    - استخدم `isExhausted` للتحقق من الاستنفاد
    - استخدم `usagePercentage` لحساب نسبة الاستخدام

14. **البيانات الوصفية:**
    - استخدم `hasTitle` للتحقق من وجود عنوان
    - استخدم `hasDescription` للتحقق من وجود وصف
    - استخدم `hasTerms` للتحقق من وجود شروط
    - استخدم `hasMetadata` للتحقق من وجود بيانات وصفية

15. **الإحصائيات:**
    - استخدم `hasViews` للتحقق من وجود مشاهدات
    - استخدم `hasApplications` للتحقق من وجود تطبيقات
    - استخدم `hasRevenue` للتحقق من وجود إيرادات
    - استخدم `hasSavings` للتحقق من وجود توفير
    - استخدم `averageRevenue` لحساب متوسط الإيرادات
    - استخدم `averageSavings` لحساب متوسط التوفير

16. **التحسين:**
    - استخدم `usagePercentage` لعرض نسبة الاستخدام
    - استخدم `averageRevenue` لعرض متوسط الإيرادات
    - استخدم `averageSavings` لعرض متوسط التوفير
    - استخدم `hasStats` للتحقق من وجود إحصائيات
    - استخدم `hasMetadata` للتحقق من وجود بيانات وصفية

---

**التالي:** [خدمة الإشعارات (Notifications)](./14-notifications-service.md)

