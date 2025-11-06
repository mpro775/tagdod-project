# 🎨 خدمة البنرات (Banners Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة البنرات توفر endpoints لعرض البنرات الإعلانية مع دعم التتبع والإحصائيات.

---

## 📋 جدول المحتويات

1. [قائمة البنرات النشطة](#1-قائمة-البنرات-النشطة)
2. [تتبع مشاهدات البنر](#2-تتبع-مشاهدات-البنر)
3. [تتبع نقرات البنر](#3-تتبع-نقرات-البنر)
4. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة البنرات النشطة

يسترجع البنرات النشطة حسب الموقع المحدد.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/marketing/banners`
- **Auth Required:** ❌ لا
- **Cache:** ✅ نعم (5 دقائق)

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `location` | `string` | ❌ | موقع البنر (انظر الأنواع أدناه) |

### أنواع المواقع

| الموقع | الوصف |
|--------|-------|
| `home_top` | أعلى الصفحة الرئيسية |
| `home_middle` | وسط الصفحة الرئيسية |
| `home_bottom` | أسفل الصفحة الرئيسية |
| `category_top` | أعلى صفحة الفئة |
| `product_page` | صفحة المنتج |
| `cart_page` | صفحة السلة |
| `checkout_page` | صفحة الدفع |
| `sidebar` | الشريط الجانبي |
| `footer` | التذييل |

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64banner123",
      "title": "عرض خاص على الألواح الشمسية",
      "description": "خصم 20% على جميع الألواح الشمسية",
      "imageUrl": "https://cdn.example.com/banners/solar-panels-offer.jpg",
      "linkUrl": "/products?categoryId=64cat123",
      "altText": "عرض الألواح الشمسية",
      "navigationType": "category",
      "navigationTarget": "64cat123",
      "navigationParams": {},
      "location": "home_top",
      "promotionType": "discount",
      "isActive": true,
      "sortOrder": 1,
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T23:59:59.000Z",
      "displayDuration": 30,
      "targetAudiences": ["wholesale", "retail"],
      "targetUserTypes": ["user", "engineer"],
      "targetCategories": ["64cat123", "64cat124"],
      "targetProducts": ["64prod123", "64prod124"],
      "viewCount": 1520,
      "clickCount": 245,
      "conversionCount": 15,
      "createdBy": "64admin123",
      "lastModifiedBy": "64admin123",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "requestId": "req_banner_001"
}
```

### كود Flutter

```dart
Future<List<Banner>> getActiveBanners({String? location}) async {
  final response = await _dio.get(
    '/marketing/banners',
    queryParameters: {
      if (location != null) 'location': location,
    },
  );

  final apiResponse = ApiResponse<List<Banner>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Banner.fromJson(item))
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

## 2. تتبع مشاهدات البنر

يزيد عداد مشاهدات البنر.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/marketing/banners/:id/view`
- **Auth Required:** ❌ لا
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "viewed": true,
  "requestId": "req_banner_002"
}
```

### كود Flutter

```dart
Future<bool> trackBannerView(String bannerId) async {
  final response = await _dio.get('/marketing/banners/$bannerId/view');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['viewed'] ?? false;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. تتبع نقرات البنر

يزيد عداد نقرات البنر.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/marketing/banners/:id/click`
- **Auth Required:** ❌ لا
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "clicked": true,
  "requestId": "req_banner_003"
}
```

### كود Flutter

```dart
Future<bool> trackBannerClick(String bannerId) async {
  final response = await _dio.get('/marketing/banners/$bannerId/click');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['clicked'] ?? false;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/banner/banner_models.dart`

```dart
enum BannerLocation {
  home_top,
  home_middle,
  home_bottom,
  category_top,
  product_page,
  cart_page,
  checkout_page,
  sidebar,
  footer,
}

extension BannerLocationExtension on BannerLocation {
  String get value {
    switch (this) {
      case BannerLocation.home_top: return 'home_top';
      case BannerLocation.home_middle: return 'home_middle';
      case BannerLocation.home_bottom: return 'home_bottom';
      case BannerLocation.category_top: return 'category_top';
      case BannerLocation.product_page: return 'product_page';
      case BannerLocation.cart_page: return 'cart_page';
      case BannerLocation.checkout_page: return 'checkout_page';
      case BannerLocation.sidebar: return 'sidebar';
      case BannerLocation.footer: return 'footer';
    }
  }

  static BannerLocation fromString(String value) {
    return BannerLocation.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BannerLocation.home_top,
    );
  }
}

enum BannerPromotionType {
  discount,
  free_shipping,
  new_arrival,
  sale,
  seasonal,
  brand_promotion,
}

extension BannerPromotionTypeExtension on BannerPromotionType {
  String get value {
    switch (this) {
      case BannerPromotionType.discount: return 'discount';
      case BannerPromotionType.free_shipping: return 'free_shipping';
      case BannerPromotionType.new_arrival: return 'new_arrival';
      case BannerPromotionType.sale: return 'sale';
      case BannerPromotionType.seasonal: return 'seasonal';
      case BannerPromotionType.brand_promotion: return 'brand_promotion';
    }
  }

  static BannerPromotionType? fromString(String? value) {
    if (value == null) return null;
    return BannerPromotionType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BannerPromotionType.sale,
    );
  }
}

enum BannerNavigationType {
  external_url,
  category,
  product,
  section,
  none,
}

extension BannerNavigationTypeExtension on BannerNavigationType {
  String get value {
    switch (this) {
      case BannerNavigationType.external_url: return 'external_url';
      case BannerNavigationType.category: return 'category';
      case BannerNavigationType.product: return 'product';
      case BannerNavigationType.section: return 'section';
      case BannerNavigationType.none: return 'none';
    }
  }

  static BannerNavigationType fromString(String? value) {
    if (value == null) return BannerNavigationType.none;
    return BannerNavigationType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BannerNavigationType.none,
    );
  }
}

enum UserRole {
  user,
  admin,
  super_admin,
  merchant,
  engineer,
}

extension UserRoleExtension on UserRole {
  String get value {
    switch (this) {
      case UserRole.user: return 'user';
      case UserRole.admin: return 'admin';
      case UserRole.super_admin: return 'super_admin';
      case UserRole.merchant: return 'merchant';
      case UserRole.engineer: return 'engineer';
    }
  }

  static UserRole? fromString(String? value) {
    if (value == null) return null;
    return UserRole.values.firstWhere(
      (e) => e.value == value,
      orElse: () => UserRole.user,
    );
  }
}

class Banner {
  final String id;
  final String title;
  final String? description;
  final String imageUrl;
  final String? linkUrl; // Legacy field - kept for backward compatibility
  final String? altText;
  final BannerNavigationType navigationType;
  final String? navigationTarget;
  final Map<String, dynamic>? navigationParams;
  final BannerLocation location;
  final BannerPromotionType? promotionType;
  final bool isActive;
  final int sortOrder;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? displayDuration;
  final List<String> targetAudiences;
  final List<UserRole> targetUserTypes;
  final List<String> targetCategories;
  final List<String> targetProducts;
  final int viewCount;
  final int clickCount;
  final int conversionCount;
  final String? createdBy;
  final String? lastModifiedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Banner({
    required this.id,
    required this.title,
    this.description,
    required this.imageUrl,
    this.linkUrl,
    this.altText,
    required this.navigationType,
    this.navigationTarget,
    this.navigationParams,
    required this.location,
    this.promotionType,
    required this.isActive,
    required this.sortOrder,
    this.startDate,
    this.endDate,
    this.displayDuration,
    required this.targetAudiences,
    required this.targetUserTypes,
    required this.targetCategories,
    required this.targetProducts,
    required this.viewCount,
    required this.clickCount,
    required this.conversionCount,
    this.createdBy,
    this.lastModifiedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Banner.fromJson(Map<String, dynamic> json) {
    // Handle imageId - could be populated Media object or just ID
    String imageUrl = '';
    if (json['imageId'] != null) {
      if (json['imageId'] is Map) {
        imageUrl = json['imageId']['url'] ?? json['imageId']['path'] ?? '';
      } else if (json['imageUrl'] != null) {
        imageUrl = json['imageUrl'];
      }
    } else if (json['imageUrl'] != null) {
      imageUrl = json['imageUrl'];
    }

    return Banner(
      id: json['_id'],
      title: json['title'] ?? '',
      description: json['description'],
      imageUrl: imageUrl,
      linkUrl: json['linkUrl'],
      altText: json['altText'],
      navigationType: BannerNavigationTypeExtension.fromString(json['navigationType']),
      navigationTarget: json['navigationTarget'],
      navigationParams: json['navigationParams'] != null 
          ? Map<String, dynamic>.from(json['navigationParams']) 
          : null,
      location: BannerLocationExtension.fromString(json['location']),
      promotionType: BannerPromotionTypeExtension.fromString(json['promotionType']),
      isActive: json['isActive'] ?? true,
      sortOrder: json['sortOrder'] ?? 0,
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'])
          : null,
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'])
          : null,
      displayDuration: json['displayDuration'],
      targetAudiences: List<String>.from(json['targetAudiences'] ?? []),
      targetUserTypes: (json['targetUserTypes'] as List<dynamic>?)
          ?.map((e) => UserRoleExtension.fromString(e.toString()))
          .whereType<UserRole>()
          .toList() ?? [],
      targetCategories: List<String>.from(json['targetCategories'] ?? []),
      targetProducts: List<String>.from(json['targetProducts'] ?? []),
      viewCount: json['viewCount'] ?? 0,
      clickCount: json['clickCount'] ?? 0,
      conversionCount: json['conversionCount'] ?? 0,
      createdBy: json['createdBy'],
      lastModifiedBy: json['lastModifiedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  // Navigation helpers
  bool get hasNavigation => navigationType != BannerNavigationType.none;
  bool get navigatesToCategory => navigationType == BannerNavigationType.category;
  bool get navigatesToProduct => navigationType == BannerNavigationType.product;
  bool get navigatesToSection => navigationType == BannerNavigationType.section;
  bool get navigatesToExternalUrl => navigationType == BannerNavigationType.external_url;
  
  // Legacy support
  bool get hasLink => (linkUrl != null && linkUrl!.isNotEmpty) || hasNavigation;
  
  // Targeting helpers
  bool get isVisibleToAllUsers => targetUserTypes.isEmpty;
  bool hasTargetUserType(UserRole role) => targetUserTypes.contains(role);
  
  bool get isExpired => endDate != null && endDate!.isBefore(DateTime.now());
  bool get isActiveNow => isActive && !isExpired;
  bool get hasStartDate => startDate != null;
  bool get hasEndDate => endDate != null;
  bool get isScheduled => hasStartDate || hasEndDate;
  bool get isCurrentlyActive {
    if (!isActive) return false;
    final now = DateTime.now();
    if (startDate != null && now.isBefore(startDate!)) return false;
    if (endDate != null && now.isAfter(endDate!)) return false;
    return true;
  }

  double get clickThroughRate {
    if (viewCount == 0) return 0.0;
    return (clickCount / viewCount) * 100;
  }

  double get conversionRate {
    if (clickCount == 0) return 0.0;
    return (conversionCount / clickCount) * 100;
  }

  bool get isHighPerforming => clickThroughRate > 5.0;
  bool get isLowPerforming => clickThroughRate < 1.0;
  bool get hasTargeting => targetAudiences.isNotEmpty || 
      targetUserTypes.isNotEmpty ||
      targetCategories.isNotEmpty || 
      targetProducts.isNotEmpty;
}
```

---

## 📝 ملاحظات مهمة

1. **أنواع المواقع:**
   - `home_top`: أعلى الصفحة الرئيسية
   - `home_middle`: وسط الصفحة الرئيسية
   - `home_bottom`: أسفل الصفحة الرئيسية
   - `category_top`: أعلى صفحة الفئة
   - `product_page`: صفحة المنتج
   - `cart_page`: صفحة السلة
   - `checkout_page`: صفحة الدفع
   - `sidebar`: الشريط الجانبي
   - `footer`: التذييل

2. **أنواع العروض:**
   - `discount`: خصم
   - `freeShipping`: شحن مجاني
   - `newArrival`: وصول جديد
   - `sale`: بيع
   - `seasonal`: موسمي
   - `brandPromotion`: ترويج العلامة التجارية

3. **التتبع والإحصائيات:**
   - `viewCount`: عدد المشاهدات
   - `clickCount`: عدد النقرات
   - `conversionCount`: عدد التحويلات
   - استخدم `trackBannerView()` عند عرض البنر
   - استخدم `trackBannerClick()` عند النقر على البنر

4. **الاستهداف:**
   - `targetAudiences`: الجماهير المستهدفة (wholesale, retail)
   - `targetUserTypes`: أنواع المستخدمين المستهدفين (user, engineer, merchant, admin, super_admin)
   - `targetCategories`: الفئات المستهدفة
   - `targetProducts`: المنتجات المستهدفة
   - استخدم `hasTargeting` للتحقق من وجود استهداف
   - استخدم `isVisibleToAllUsers` للتحقق من أن البانر مرئي للجميع
   - استخدم `hasTargetUserType(role)` للتحقق من استهداف نوع معين

5. **الجدولة:**
   - `startDate`: تاريخ البداية
   - `endDate`: تاريخ النهاية
   - `displayDuration`: مدة العرض (بالثواني)
   - استخدم `isCurrentlyActive` للتحقق من النشاط الحالي

6. **الأداء:**
   - `clickThroughRate`: معدل النقر (CTR)
   - `conversionRate`: معدل التحويل
   - `isHighPerforming`: أداء عالي (CTR > 5%)
   - `isLowPerforming`: أداء منخفض (CTR < 1%)

7. **التنقل (Navigation):**
   - `navigationType`: نوع التنقل (external_url, category, product, section, none)
   - `navigationTarget`: الهدف من التنقل (معرف الفئة، معرف المنتج، اسم القسم، أو رابط خارجي)
   - `navigationParams`: معاملات إضافية للتنقل
   - استخدم `hasNavigation` للتحقق من وجود تنقل
   - استخدم `navigatesToCategory`, `navigatesToProduct`, `navigatesToSection`, `navigatesToExternalUrl` للتحقق من نوع التنقل
   - عند النقر على البانر، استخدم `navigationType` و `navigationTarget` للتنقل المناسب:
     ```dart
     void handleBannerTap(Banner banner) {
       if (!banner.hasNavigation) return;
       
       switch (banner.navigationType) {
         case BannerNavigationType.category:
           Navigator.pushNamed(context, '/category/${banner.navigationTarget}');
           break;
         case BannerNavigationType.product:
           Navigator.pushNamed(context, '/product/${banner.navigationTarget}');
           break;
         case BannerNavigationType.section:
           Navigator.pushNamed(context, '/${banner.navigationTarget}');
           break;
         case BannerNavigationType.external_url:
           launchUrl(Uri.parse(banner.navigationTarget!));
           break;
         case BannerNavigationType.none:
           break;
       }
     }
     ```

8. **العرض في التطبيق:**
   - اعرض `isCurrentlyActive` للبنرات النشطة
   - اعرض `isExpired` للبنرات المنتهية
   - اعرض `isScheduled` للبنرات المجدولة
   - اعرض `hasLink` أو `hasNavigation` للبنرات القابلة للنقر

9. **Cache:**
   - البنرات مع cache لمدة 5 دقائق
   - يمكنك cache البيانات محلياً أيضاً
   - استخدم `location` parameter للفلترة

10. **الأداء:**
   - جميع الـ endpoints لا تتطلب مصادقة
   - استخدم `getActiveBanners()` للحصول على البنرات النشطة
   - استخدم `trackBannerView()` و `trackBannerClick()` للتتبع

11. **التحسين:**
    - اعرض البنرات عالية الأداء أولاً
    - استخدم الاستهداف لتحسين التحويل
    - تتبع الإحصائيات لتحسين الحملات

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تم تصحيح view/click responses - تضمين `viewed: true` و `clicked: true`
2. ✅ تم تحديث Enums - استخدام underscore في القيم (home_top بدلاً من homeTop) لمطابقة Backend
3. ✅ تم إضافة Extensions لـ Enums - للتحويل من/إلى String بشكل صحيح
4. ✅ تم تصحيح fromJson - استخدام Extensions بدلاً من `.name`
5. ✅ **جديد**: إضافة حقول التنقل (`navigationType`, `navigationTarget`, `navigationParams`)
6. ✅ **جديد**: إضافة `targetUserTypes` لاستهداف أنواع المستخدمين
7. ✅ **جديد**: إضافة `BannerNavigationType` enum و `UserRole` enum
8. ✅ **جديد**: إضافة helper methods للتنقل والاستهداف

**ملفات Backend المرجعية:**
- `backend/src/modules/marketing/public.controller.ts` - جميع endpoints
- `backend/src/modules/marketing/marketing.service.ts` - المنطق وgetActiveBanners
- `backend/src/modules/marketing/schemas/banner.schema.ts` - Banner Schema و Enums

---

**التالي:** [خدمة العلامات التجارية (Brands)](./10-brands-service.md)

