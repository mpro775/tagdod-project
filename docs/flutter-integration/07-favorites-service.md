# ⭐ خدمة المفضلات (Favorites Service)

خدمة المفضلات توفر endpoints لإدارة المنتجات المفضلة للمستخدم مع دعم المزامنة بين الأجهزة.

---

## 📋 جدول المحتويات

1. [قائمة المفضلات](#1-قائمة-المفضلات)
2. [إضافة للمفضلة](#2-إضافة-للمفضلة)
3. [إزالة من المفضلة](#3-إزالة-من-المفضلة)
4. [تحديث مفضلة](#4-تحديث-مفضلة)
5. [حذف جميع المفضلات](#5-حذف-جميع-المفضلات)
6. [عدد المفضلات](#6-عدد-المفضلات)
7. [المفضلات حسب الوسوم](#7-المفضلات-حسب-الوسوم)
8. [مزامنة المفضلات](#8-مزامنة-المفضلات)
9. [زيادة عداد المشاهدات](#9-زيادة-عداد-المشاهدات)
10. [Models في Flutter](#models-في-flutter)

---

## 1. قائمة المفضلات

يسترجع قائمة المفضلات للمستخدم المسجل.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/favorites`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64fav123",
      "userId": "64user456",
      "productId": "64prod789",
      "variantId": "64var101",
      "note": "للمشروع الجديد",
      "tags": ["urgent", "compare"],
      "viewsCount": 5,
      "lastViewedAt": "2025-01-15T10:00:00.000Z",
      "isSynced": true,
      "syncedAt": "2025-01-15T09:30:00.000Z",
      "createdAt": "2025-01-15T09:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "product": {
        "_id": "64prod789",
        "name": "لوح شمسي 550 واط",
        "nameEn": "Solar Panel 550W",
        "slug": "solar-panel-550w",
        "image": "https://cdn.example.com/products/solar-panel.jpg",
        "imageId": "64img123",
        "brand": {
          "_id": "64brand123",
          "name": "Jinko Solar",
          "nameEn": "Jinko Solar"
        },
        "category": {
          "_id": "64cat123",
          "name": "ألواح شمسية",
          "nameEn": "Solar Panels"
        },
        "variants": [
          {
            "_id": "64var101",
            "attributes": {
              "wattage": "550W",
              "color": "أسود"
            },
            "pricing": {
              "basePrice": 135000,
              "finalPrice": 135000,
              "currency": "YER"
            },
            "inventory": {
              "stock": 25,
              "isAvailable": true
            }
          }
        ]
      }
    }
  ],
  "requestId": "req_fav_001"
}
```

### كود Flutter

```dart
Future<List<Favorite>> getFavorites() async {
  final response = await _dio.get('/favorites');

  final apiResponse = ApiResponse<List<Favorite>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Favorite.fromJson(item))
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

## 2. إضافة للمفضلة

يضيف منتج إلى قائمة المفضلات.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/favorites`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "productId": "64prod789",
  "variantId": "64var101",
  "note": "للمشروع الجديد",
  "tags": ["urgent", "compare"]
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64fav123",
    "userId": "64user456",
    "productId": "64prod789",
    "variantId": "64var101",
    "note": "للمشروع الجديد",
    "tags": ["urgent", "compare"],
    "viewsCount": 0,
    "isSynced": false,
    "createdAt": "2025-01-15T09:00:00.000Z",
    "updatedAt": "2025-01-15T09:00:00.000Z"
  },
  "requestId": "req_fav_002"
}
```

### كود Flutter

```dart
Future<Favorite> addFavorite({
  required String productId,
  String? variantId,
  String? note,
  List<String>? tags,
}) async {
  final response = await _dio.post('/favorites', data: {
    'productId': productId,
    if (variantId != null) 'variantId': variantId,
    if (note != null) 'note': note,
    if (tags != null) 'tags': tags,
  });

  final apiResponse = ApiResponse<Favorite>.fromJson(
    response.data,
    (json) => Favorite.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 3. إزالة من المفضلة

يزيل منتج من قائمة المفضلات.

### معلومات الطلب

- **Method:** `DELETE`
- **Endpoint:** `/favorites`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "productId": "64prod789",
  "variantId": "64var101"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "favoriteId": "64fav123"
  },
  "requestId": "req_fav_003"
}
```

### كود Flutter

```dart
Future<bool> removeFavorite({
  required String productId,
  String? variantId,
}) async {
  final response = await _dio.delete('/favorites', data: {
    'productId': productId,
    if (variantId != null) 'variantId': variantId,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['deleted'] ?? false;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 4. تحديث مفضلة

يحدث ملاحظات أو وسوم مفضلة موجودة.

### معلومات الطلب

- **Method:** `PATCH`
- **Endpoint:** `/favorites/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "note": "ملاحظات محدثة",
  "tags": ["urgent", "compare", "wishlist"]
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64fav123",
    "userId": "64user456",
    "productId": "64prod789",
    "variantId": "64var101",
    "note": "ملاحظات محدثة",
    "tags": ["urgent", "compare", "wishlist"],
    "viewsCount": 5,
    "lastViewedAt": "2025-01-15T10:00:00.000Z",
    "isSynced": true,
    "syncedAt": "2025-01-15T09:30:00.000Z",
    "createdAt": "2025-01-15T09:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  },
  "requestId": "req_fav_004"
}
```

### كود Flutter

```dart
Future<Favorite> updateFavorite({
  required String favoriteId,
  String? note,
  List<String>? tags,
}) async {
  final response = await _dio.patch('/favorites/$favoriteId', data: {
    if (note != null) 'note': note,
    if (tags != null) 'tags': tags,
  });

  final apiResponse = ApiResponse<Favorite>.fromJson(
    response.data,
    (json) => Favorite.fromJson((json as Map<String, dynamic>)['data']),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. حذف جميع المفضلات

يحذف جميع المفضلات للمستخدم.

### معلومات الطلب

- **Method:** `DELETE`
- **Endpoint:** `/favorites/clear/all`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "deletedCount": 15,
    "message": "تم حذف جميع المفضلات بنجاح"
  },
  "requestId": "req_fav_005"
}
```

### كود Flutter

```dart
Future<int> clearAllFavorites() async {
  final response = await _dio.delete('/favorites/clear/all');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['deletedCount'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 6. عدد المفضلات

يسترجع عدد المفضلات للمستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/favorites/count`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "count": 15
  },
  "requestId": "req_fav_006"
}
```

### كود Flutter

```dart
Future<int> getFavoritesCount() async {
  final response = await _dio.get('/favorites/count');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['count'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 7. المفضلات حسب الوسوم

يسترجع المفضلات حسب الوسوم المحددة.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/favorites/by-tags?tags=urgent,compare`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `tags` | `string` | ✅ | الوسوم مفصولة بفاصلة |

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
      "_id": "64fav123",
      "userId": "64user456",
      "productId": "64prod789",
      "variantId": "64var101",
      "note": "للمشروع الجديد",
      "tags": ["urgent", "compare"],
      "viewsCount": 5,
      "lastViewedAt": "2025-01-15T10:00:00.000Z",
      "isSynced": true,
      "syncedAt": "2025-01-15T09:30:00.000Z",
      "createdAt": "2025-01-15T09:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "requestId": "req_fav_007"
}
```

### كود Flutter

```dart
Future<List<Favorite>> getFavoritesByTags(List<String> tags) async {
  final response = await _dio.get(
    '/favorites/by-tags',
    queryParameters: {'tags': tags.join(',')},
  );

  final apiResponse = ApiResponse<List<Favorite>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Favorite.fromJson(item))
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

## 8. مزامنة المفضلات

يمزامن المفضلات من الجهاز الضيف إلى المستخدم المسجل.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/favorites/sync`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "deviceId": "device_abc123"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "syncedCount": 8,
    "message": "تم مزامنة 8 مفضلات بنجاح"
  },
  "requestId": "req_fav_008"
}
```

### كود Flutter

```dart
Future<int> syncFavorites(String deviceId) async {
  final response = await _dio.post('/favorites/sync', data: {
    'deviceId': deviceId,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['syncedCount'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 9. زيادة عداد المشاهدات

يزيد عداد مشاهدات مفضلة محددة.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/favorites/:id/view`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "viewed": true
  },
  "requestId": "req_fav_009"
}
```

### كود Flutter

```dart
Future<bool> incrementView(String favoriteId) async {
  final response = await _dio.post('/favorites/$favoriteId/view');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['viewed'] ?? false;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/favorite/favorite_models.dart`

```dart
class Favorite {
  final String id;
  final String userId;
  final String productId;
  final String? variantId;
  final String? note;
  final List<String> tags;
  final int viewsCount;
  final DateTime? lastViewedAt;
  final bool isSynced;
  final DateTime? syncedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final FavoriteProduct? product;

  Favorite({
    required this.id,
    required this.userId,
    required this.productId,
    this.variantId,
    this.note,
    required this.tags,
    required this.viewsCount,
    this.lastViewedAt,
    required this.isSynced,
    this.syncedAt,
    required this.createdAt,
    required this.updatedAt,
    this.product,
  });

  factory Favorite.fromJson(Map<String, dynamic> json) {
    return Favorite(
      id: json['_id'],
      userId: json['userId'],
      productId: json['productId'],
      variantId: json['variantId'],
      note: json['note'],
      tags: List<String>.from(json['tags'] ?? []),
      viewsCount: json['viewsCount'] ?? 0,
      lastViewedAt: json['lastViewedAt'] != null 
          ? DateTime.parse(json['lastViewedAt']) 
          : null,
      isSynced: json['isSynced'] ?? false,
      syncedAt: json['syncedAt'] != null 
          ? DateTime.parse(json['syncedAt']) 
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      product: json['product'] != null 
          ? FavoriteProduct.fromJson(json['product']) 
          : null,
    );
  }

  bool get hasNote => note != null && note!.isNotEmpty;
  bool get hasTags => tags.isNotEmpty;
  bool get isRecentlyViewed => lastViewedAt != null && 
      DateTime.now().difference(lastViewedAt!).inDays < 7;
  bool get isFrequentlyViewed => viewsCount > 5;
}

class FavoriteProduct {
  final String id;
  final String name;
  final String nameEn;
  final String slug;
  final String? image;
  final String? imageId;
  final FavoriteBrand? brand;
  final FavoriteCategory? category;
  final List<FavoriteVariant> variants;

  FavoriteProduct({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.slug,
    this.image,
    this.imageId,
    this.brand,
    this.category,
    required this.variants,
  });

  factory FavoriteProduct.fromJson(Map<String, dynamic> json) {
    return FavoriteProduct(
      id: json['_id'],
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
      slug: json['slug'],
      image: json['image'],
      imageId: json['imageId'],
      brand: json['brand'] != null 
          ? FavoriteBrand.fromJson(json['brand']) 
          : null,
      category: json['category'] != null 
          ? FavoriteCategory.fromJson(json['category']) 
          : null,
      variants: json['variants'] != null
          ? (json['variants'] as List)
              .map((item) => FavoriteVariant.fromJson(item))
              .toList()
          : [],
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }

  FavoriteVariant? get defaultVariant => variants.isNotEmpty ? variants.first : null;
  String? get primaryImage => image;
}

class FavoriteBrand {
  final String id;
  final String name;
  final String nameEn;

  FavoriteBrand({
    required this.id,
    required this.name,
    required this.nameEn,
  });

  factory FavoriteBrand.fromJson(Map<String, dynamic> json) {
    return FavoriteBrand(
      id: json['_id'],
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }
}

class FavoriteCategory {
  final String id;
  final String name;
  final String nameEn;

  FavoriteCategory({
    required this.id,
    required this.name,
    required this.nameEn,
  });

  factory FavoriteCategory.fromJson(Map<String, dynamic> json) {
    return FavoriteCategory(
      id: json['_id'],
      name: json['name'] ?? '',
      nameEn: json['nameEn'] ?? '',
    );
  }

  String getName(String locale) {
    if (locale == 'en') return nameEn;
    return name;
  }
}

class FavoriteVariant {
  final String id;
  final Map<String, dynamic> attributes;
  final FavoritePricing pricing;
  final FavoriteInventory inventory;

  FavoriteVariant({
    required this.id,
    required this.attributes,
    required this.pricing,
    required this.inventory,
  });

  factory FavoriteVariant.fromJson(Map<String, dynamic> json) {
    return FavoriteVariant(
      id: json['_id'],
      attributes: Map<String, dynamic>.from(json['attributes'] ?? {}),
      pricing: FavoritePricing.fromJson(json['pricing']),
      inventory: FavoriteInventory.fromJson(json['inventory']),
    );
  }

  String getAttributeValue(String key) {
    return attributes[key]?.toString() ?? '';
  }

  bool get isAvailable => inventory.isAvailable;
  bool get isInStock => inventory.stock > 0;
}

class FavoritePricing {
  final double basePrice;
  final double finalPrice;
  final String currency;

  FavoritePricing({
    required this.basePrice,
    required this.finalPrice,
    required this.currency,
  });

  factory FavoritePricing.fromJson(Map<String, dynamic> json) {
    return FavoritePricing(
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      finalPrice: (json['finalPrice'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER',
    );
  }

  bool get hasDiscount => finalPrice < basePrice;
  double get discountAmount => basePrice - finalPrice;
  double get discountPercent => hasDiscount ? (discountAmount / basePrice) * 100 : 0;
}

class FavoriteInventory {
  final int stock;
  final bool isAvailable;

  FavoriteInventory({
    required this.stock,
    required this.isAvailable,
  });

  factory FavoriteInventory.fromJson(Map<String, dynamic> json) {
    return FavoriteInventory(
      stock: json['stock'] ?? 0,
      isAvailable: json['isAvailable'] ?? false,
    );
  }

  bool get isLowStock => stock > 0 && stock < 10;
  bool get isOutOfStock => stock == 0;
}
```

---

## 📝 ملاحظات مهمة

1. **المفضلات المزدوجة:**
   - النظام يدعم المفضلات للمستخدمين المسجلين والزوار
   - `userId` للمستخدمين المسجلين
   - `deviceId` للزوار (Guest users)

2. **المزامنة:**
   - استخدم `syncFavorites(deviceId)` لمزامنة مفضلات الزائر عند تسجيل الدخول
   - `isSynced` يحدد ما إذا كانت المفضلة تمت مزامنتها
   - `syncedAt` وقت المزامنة

3. **الوسوم والملاحظات:**
   - `tags`: لتنظيم المفضلات (مثل: ["urgent", "compare", "wishlist"])
   - `note`: ملاحظات شخصية للمفضلة
   - استخدم `getFavoritesByTags()` للفلترة حسب الوسوم

4. **إحصائيات المشاهدة:**
   - `viewsCount`: عدد مرات فتح المفضلة
   - `lastViewedAt`: آخر مرة تم عرضها
   - استخدم `incrementView()` عند فتح المفضلة

5. **المنتجات:**
   - المفضلة مرتبطة بـ `productId` و `variantId` اختياري
   - `product` يحتوي على معلومات المنتج المحفوظة
   - استخدم `defaultVariant` للحصول على المتغير الافتراضي

6. **الأداء:**
   - جميع الـ endpoints تتطلب مصادقة
   - لا يوجد cache للمفضلات (بيانات شخصية)
   - استخدم `getFavoritesCount()` لعرض العدد في UI

7. **إدارة المفضلات:**
   - `clearAllFavorites()` لحذف جميع المفضلات
   - `updateFavorite()` لتحديث الملاحظات والوسوم
   - `removeFavorite()` لحذف مفضلة محددة

8. **العرض في التطبيق:**
   - اعرض `isRecentlyViewed` للمفضلات الحديثة
   - اعرض `isFrequentlyViewed` للمفضلات الشائعة
   - استخدم `hasNote` و `hasTags` لعرض المؤشرات
   - اعرض `isLowStock` و `isOutOfStock` للتنبيهات

---

**التالي:** [خدمة العناوين (Addresses)](./08-addresses-service.md)

