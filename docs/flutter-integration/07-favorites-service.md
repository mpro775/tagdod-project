# ⭐ خدمة المفضلات (Favorites Service)

توفر خدمة المفضلات واجهات برمجية لإدارة المنتجات المفضلة للمستخدمين المسجلين فقط، مع دعم الملاحظات والمزامنة مع الأجهزة السابقة.

> ℹ️ **هيكل الاستجابة**: جميع الاستجابات الناجحة تمر عبر `ResponseEnvelopeInterceptor` وتعود بالشكل `{ success, data, requestId }`. راجع `docs/flutter-integration/01-response-structure.md` لمزيد من التفاصيل.

---

## 📋 جدول المحتويات

1. [قائمة المفضلات](#1-قائمة-المفضلات)
2. [إضافة منتج للمفضلة](#2-إضافة-منتج-للمفضلة)
3. [إزالة منتج من المفضلة](#3-إزالة-منتج-من-المفضلة)
4. [تحديث الملاحظات](#4-تحديث-الملاحظات)
5. [حذف جميع المفضلات](#5-حذف-جميع-المفضلات)
6. [الحصول على عدد المفضلات](#6-الحصول-على-عدد-المفضلات)
7. [مزامنة المفضلات من جهاز سابق](#7-مزامنة-المفضلات-من-جهاز-سابق)
8. [زيادة عداد المشاهدات](#8-زيادة-عداد-المشاهدات)
9. [نماذج Flutter](#نماذج-flutter)

---

## 1. قائمة المفضلات

يسترجع جميع المنتجات المفضلة للمستخدم الحالي.

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
      "_id": "65f4f3a5e90b3c0012d9d011",
      "userId": "65f4f2bb0af4cf0012d8a001",
      "productId": {
        "_id": "65e1c12291c8d90012843321",
        "nameAr": "لوح شمسي 550 واط",
        "nameEn": "Solar Panel 550W",
        "slug": "solar-panel-550w",
        "mainImageId": {
          "url": "https://cdn.example.com/products/solar-panel.jpg"
        }
      },
      "note": "للمشروع الجديد",
      "isSynced": false,
      "syncedAt": null,
      "createdAt": "2025-02-10T09:30:00.000Z"
    }
  ],
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> **ملاحظة:** يتم إرجاع المنتج `productId` بشكل populated تلقائياً. يتم إخفاء الحقول `viewsCount` و `lastViewedAt` و `updatedAt` في هذه الاستجابة لأنها غير مطلوبة في الواجهات.

### كود Flutter

```dart
Future<List<Favorite>> getFavorites() async {
  final response = await _dio.get('/favorites');

  final apiResponse = ApiResponse<List<Favorite>>.fromJson(
    response.data,
    (json) => ((json as Map<String, dynamic>)['data'] as List)
        .map((item) => Favorite.fromJson(item as Map<String, dynamic>))
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

## 2. إضافة منتج للمفضلة

يضيف منتجاً واحداً إلى قائمة المفضلات للمستخدم.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/favorites`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "productId": "65e1c12291c8d90012843321",
  "note": "هدية عيد ميلاد"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "65f4f3a5e90b3c0012d9d011",
    "userId": "65f4f2bb0af4cf0012d8a001",
    "productId": "65e1c12291c8d90012843321",
    "note": "هدية عيد ميلاد",
    "viewsCount": 0,
    "isSynced": false,
    "createdAt": "2025-02-10T09:30:00.000Z",
    "updatedAt": "2025-02-10T09:30:00.000Z"
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<Favorite> addFavorite({
  required String productId,
  String? note,
}) async {
  final response = await _dio.post('/favorites', data: {
    'productId': productId,
    if (note != null) 'note': note,
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

## 3. إزالة منتج من المفضلة

يحذف منتجاً من قائمة المفضلات الخاصة بالمستخدم.

### معلومات الطلب

- **Method:** `DELETE`
- **Endpoint:** `/favorites`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "productId": "65e1c12291c8d90012843321"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<bool> removeFavorite({required String productId}) async {
  final response = await _dio.delete('/favorites', data: {
    'productId': productId,
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

## 4. تحديث الملاحظات

يحدّث ملاحظة منتج موجود في المفضلة.

### معلومات الطلب

- **Method:** `PATCH`
- **Endpoint:** `/favorites/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "note": "معلومات محدثة"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "65f4f3a5e90b3c0012d9d011",
    "userId": "65f4f2bb0af4cf0012d8a001",
    "productId": "65e1c12291c8d90012843321",
    "note": "معلومات محدثة",
    "isSynced": false,
    "updatedAt": "2025-02-10T11:15:00.000Z"
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

#### Errors

| `error.code`           | HTTP Status | الوصف                                     |
|------------------------|-------------|------------------------------------------|
| `FAVORITE_NOT_FOUND`   | 404         | لا يوجد عنصر مفضلة مطابق (`favoriteId`) |

---

## 5. حذف جميع المفضلات

يحذف جميع عناصر المفضلة للمستخدم الحالي باستخدام Soft Delete.

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
    "cleared": 15
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
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
    return apiResponse.data!['cleared'] ?? 0;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 6. الحصول على عدد المفضلات

يعيد عدد المنتجات الموجودة في المفضلة دون الحاجة لجلب القائمة.

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
    "count": 12
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
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

## 7. مزامنة المفضلات من جهاز سابق

تسمح هذه العملية بنقل المفضلات المخزّنة على جهاز غير مرتبط بحساب (مثل جلسة قبل تسجيل الدخول) إلى حساب المستخدم الحالي.

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
    "synced": 8,
    "skipped": 2,
    "total": 10
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<SyncResult> syncFavorites(String deviceId) async {
  final response = await _dio.post('/favorites/sync', data: {
    'deviceId': deviceId,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return SyncResult.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class SyncResult {
  final int synced;
  final int skipped;
  final int total;

  SyncResult({
    required this.synced,
    required this.skipped,
    required this.total,
  });

  factory SyncResult.fromJson(Map<String, dynamic> json) {
    return SyncResult(
      synced: json['synced'] ?? 0,
      skipped: json['skipped'] ?? 0,
      total: json['total'] ?? 0,
    );
  }
}
```

---

## 8. زيادة عداد المشاهدات

يزيد عداد المشاهدات لعناصر المفضلة عند عرض المنتج داخل التطبيق.

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
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<bool> incrementFavoriteView(String favoriteId) async {
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

## نماذج Flutter

### ملف: `lib/models/favorite/favorite_models.dart`

```dart
class Favorite {
  final String id;
  final String userId;
  final dynamic productId; // قد يكون String أو كائن populated
  final String? note;
  final bool isSynced;
  final DateTime? syncedAt;
  final DateTime createdAt;
  final int viewsCount;
  final DateTime? lastViewedAt;

  Favorite({
    required this.id,
    required this.userId,
    required this.productId,
    this.note,
    required this.isSynced,
    this.syncedAt,
    required this.createdAt,
    this.viewsCount = 0,
    this.lastViewedAt,
  });

  factory Favorite.fromJson(Map<String, dynamic> json) {
    return Favorite(
      id: json['_id'],
      userId: json['userId'] is String ? json['userId'] : json['userId']?['_id'],
      productId: json['productId'],
      note: json['note'],
      isSynced: json['isSynced'] ?? false,
      syncedAt: json['syncedAt'] != null ? DateTime.parse(json['syncedAt']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      viewsCount: json['viewsCount'] ?? 0,
      lastViewedAt: json['lastViewedAt'] != null ? DateTime.parse(json['lastViewedAt']) : null,
    );
  }

  bool get hasNote => note != null && note!.isNotEmpty;

  String getProductId() {
    return productId is String ? productId : productId['_id'];
  }

  String? getProductName() {
    if (productId is Map<String, dynamic>) {
      return productId['nameAr'] ?? productId['nameEn'] ?? productId['name'];
    }
    return null;
  }

  String? getProductImage() {
    if (productId is Map && productId['mainImageId'] is Map) {
      return productId['mainImageId']['url'] as String?;
    }
    return null;
  }
}
```

---

## 📝 ملاحظات مهمة

1. يتم ربط كل مفضلة بمنتج واحد عبر `productId`. لا توجد مفضلات على مستوى المتغيرات.
2. الحقول `viewsCount` و `lastViewedAt` موجودة في قاعدة البيانات لأغراض تحليلات، ويتم تحديثها عبر `POST /favorites/:id/view`.
3. عملية الإزالة تستخدم Soft Delete (`deletedAt`)، لذلك يمكن استرجاع البيانات للتحليلات لاحقاً.
4. استخدم `GET /favorites/count` لعرض العدد بسرعة دون تحميل القائمة كاملة.
5. استخدم `POST /favorites/sync` بعد تسجيل الدخول لدمج المفضلات التي تم حفظها من جهاز سابق مع حساب المستخدم الحالي.

---

## 📝 ملاحظات التحديث

> ⚠️ **تم تحديث هذه الوثيقة** لتتماشى مع التغييرات الأخيرة في خدمة المفضلات: تم إزالة أي إشارات لمنتجات المتغيرات أو واجهات الزوار، وتحديث نماذج الطلبات والاستجابات بما يطابق الكود الحالي في `backend/src/modules/favorites`.

### الملفات المرجعية

- **Controller:** `backend/src/modules/favorites/favorites.user.controller.ts`
- **Service:** `backend/src/modules/favorites/favorites.service.ts`
- **Schema:** `backend/src/modules/favorites/schemas/favorite.schema.ts`

---

**التالي:** [خدمة العناوين (Addresses)](./08-addresses-service.md)

# ⭐ خدمة المفضلات (Favorites Service)

خدمة المفضلات توفر endpoints لإدارة المنتجات المفضلة للمستخدم مع دعم المزامنة بين الأجهزة.

> ℹ️ **هيكل الاستجابة**: جميع الاستجابات الناجحة تمر عبر `ResponseEnvelopeInterceptor` وتعود بالشكل `{ success, data, requestId }`. راجع `docs/flutter-integration/01-response-structure.md` للتفاصيل.

> ✅ **تم التحقق وتحديث هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/favorites`

---

## 📋 جدول المحتويات

1. [قائمة المفضلات](#1-قائمة-المفضلات)
2. [إضافة للمفضلة](#2-إضافة-للمفضلة)
3. [إزالة من المفضلة](#3-إزالة-من-المفضلة)
4. [تحديث مفضلة](#4-تحديث-مفضلة)
5. [حذف جميع المفضلات](#5-حذف-جميع-المفضلات)
6. [عدد المفضلات](#6-عدد-المفضلات)
7. [مزامنة المفضلات](#7-مزامنة-المفضلات)
8. [زيادة عداد المشاهدات](#8-زيادة-عداد-المشاهدات)
9. [Models في Flutter](#models-في-flutter)

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
      "productId": {
        "_id": "64prod789",
        "nameAr": "لوح شمسي 550 واط",
        "nameEn": "Solar Panel 550W",
        "slug": "solar-panel-550w",
        "mainImageId": {
          "url": "https://cdn.example.com/products/solar-panel.jpg"
        }
      },
      "variantId": {
        "_id": "64var101",
        "sku": "SP-550-BLK",
        "basePriceUSD": 500,
        "stock": 25
      },
      "note": "للمشروع الجديد",
      "viewsCount": 5,
      "lastViewedAt": "2025-01-15T10:00:00.000Z",
      "isSynced": true,
      "syncedAt": "2025-01-15T09:30:00.000Z",
      "createdAt": "2025-01-15T09:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> **ملاحظة:** `productId` و `variantId` يتم populate تلقائياً مع بيانات المنتج والـ variant

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
  "note": "للمشروع الجديد"
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
    "viewsCount": 0,
    "isSynced": false,
    "createdAt": "2025-01-15T09:00:00.000Z",
    "updatedAt": "2025-01-15T09:00:00.000Z"
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<Favorite> addFavorite({
  required String productId,
  String? variantId,
  String? note,
}) async {
  final response = await _dio.post('/favorites', data: {
    'productId': productId,
    if (variantId != null) 'variantId': variantId,
    if (note != null) 'note': note,
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
    "deleted": true
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
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
  "note": "ملاحظات محدثة"
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
    "viewsCount": 5,
    "lastViewedAt": "2025-01-15T10:00:00.000Z",
    "isSynced": true,
    "syncedAt": "2025-01-15T09:30:00.000Z",
    "createdAt": "2025-01-15T09:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<Favorite> updateFavorite({
  required String favoriteId,
  String? note,
}) async {
  final response = await _dio.patch('/favorites/$favoriteId', data: {
    if (note != null) 'note': note,
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

### Errors

| `error.code` | HTTP Status | الوصف |
|---------------|-------------|-------|
| `FAVORITE_NOT_FOUND` | 404 | لا يوجد عنصر مفضلة مطابق (`error.details.favoriteId`) |

#### مثال خطأ

```json
{
  "success": false,
  "error": {
    "code": "FAVORITE_NOT_FOUND",
    "message": "المفضلة غير موجودة",
    "details": {
      "favoriteId": "64fav999"
    },
    "fieldErrors": null
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1",
  "timestamp": "2025-01-15T11:05:00.000Z",
  "path": "/api/v1/favorites/64fav999"
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
    "cleared": 15
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
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
    return apiResponse.data!['cleared'] ?? 0;
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
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
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

## 7. مزامنة المفضلات

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
    "synced": 8,
    "skipped": 2,
    "total": 10
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<SyncResult> syncFavorites(String deviceId) async {
  final response = await _dio.post('/favorites/sync', data: {
    'deviceId': deviceId,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => (json as Map<String, dynamic>)['data'],
  );

  if (apiResponse.isSuccess) {
    return SyncResult.fromJson(apiResponse.data!);
  } else {
    throw ApiException(apiResponse.error!);
  }
}

class SyncResult {
  final int synced;
  final int skipped;
  final int total;

  SyncResult({
    required this.synced,
    required this.skipped,
    required this.total,
  });

  factory SyncResult.fromJson(Map<String, dynamic> json) {
    return SyncResult(
      synced: json['synced'] ?? 0,
      skipped: json['skipped'] ?? 0,
      total: json['total'] ?? 0,
    );
  }
}
```

---

## 8. زيادة عداد المشاهدات

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
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
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
  final dynamic productId; // يمكن أن يكون String أو Object (populated)
  final dynamic variantId; // يمكن أن يكون String أو Object (populated)
  final String? note;
  final int viewsCount;
  final DateTime? lastViewedAt;
  final bool isSynced;
  final DateTime? syncedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  Favorite({
    required this.id,
    required this.userId,
    required this.productId,
    this.variantId,
    this.note,
    required this.viewsCount,
    this.lastViewedAt,
    required this.isSynced,
    this.syncedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Favorite.fromJson(Map<String, dynamic> json) {
    return Favorite(
      id: json['_id'],
      userId: json['userId'] is String ? json['userId'] : json['userId']?['_id'],
      productId: json['productId'], // يمكن أن يكون populated
      variantId: json['variantId'], // يمكن أن يكون populated
      note: json['note'],
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
    );
  }

  // Helpers
  bool get hasNote => note != null && note!.isNotEmpty;
  bool get isRecentlyViewed => lastViewedAt != null && 
      DateTime.now().difference(lastViewedAt!).inDays < 7;
  bool get isFrequentlyViewed => viewsCount > 5;
  
  // الحصول على ID المنتج
  String getProductId() {
    return productId is String ? productId : productId['_id'];
  }
  
  // الحصول على ID الـ variant
  String? getVariantId() {
    if (variantId == null) return null;
    return variantId is String ? variantId : variantId['_id'];
  }
  
  // الحصول على اسم المنتج (إذا كان populated)
  String? getProductName() {
    if (productId is Map) {
      return productId['nameAr'] ?? productId['name'];
    }
    return null;
  }
  
  // الحصول على صورة المنتج (إذا كان populated)
  String? getProductImage() {
    if (productId is Map && productId['mainImageId'] is Map) {
      return productId['mainImageId']['url'];
    }
    return null;
  }
}

// لا حاجة لـ models معقدة - productId و variantId سيكونان populated تلقائياً
// يمكنك الوصول إلى البيانات مباشرة من المفضلة
```

---

## 📝 ملاحظات مهمة

1. **المفضلات المزدوجة:**
   - النظام يدعم المفضلات للمستخدمين المسجلين والزوار
   - `userId` للمستخدمين المسجلين → `/favorites`
   - `deviceId` للزوار → `/favorites/guest`

2. **المزامنة:**
   - استخدم `POST /favorites/sync` لمزامنة مفضلات الزائر عند تسجيل الدخول
   - يُرجع `{ synced, skipped, total }`
   - `synced`: عدد المفضلات التي تمت مزامنتها
   - `skipped`: عدد المفضلات التي تم تخطيها (موجودة مسبقاً)

3. **الملاحظات:**
   - `note`: ملاحظات شخصية للمفضلة (اختياري)
   - يمكن تحديث الملاحظة عبر `PATCH /favorites/:id`

4. **إحصائيات المشاهدة:**
   - `viewsCount`: عدد مرات فتح المفضلة
   - `lastViewedAt`: آخر مرة تم عرضها
   - استخدم `POST /favorites/:id/view` لزيادة العداد

5. **المنتجات:**
   - المفضلة مرتبطة بـ `productId` و `variantId` اختياري
   - `product` يُرجع populated مع بيانات المنتج
   - `variantId` يُرجع populated مع بيانات الـ variant

6. **الأداء:**
   - جميع الـ endpoints تتطلب مصادقة (ماعدا guest endpoints)
   - لا يوجد cache للمفضلات (بيانات شخصية)
   - استخدم `GET /favorites/count` لعرض العدد في UI بدون تحميل القائمة

7. **Soft Delete:**
   - الحذف في المفضلات هو soft delete (deletedAt)
   - لا يتم حذف البيانات نهائياً من DB

8. **Guest Favorites Endpoints:**
   - `GET /favorites/guest?deviceId=xxx`
   - `POST /favorites/guest` (يتطلب `deviceId`, `productId`, واختيارياً `variantId`, `note`)
   - `DELETE /favorites/guest` (يتطلب `deviceId`, `productId`, واختيارياً `variantId`)
   - `DELETE /favorites/guest/clear?deviceId=xxx`
   - `GET /favorites/guest/count?deviceId=xxx`

---

## 📝 ملاحظات التحديث

> ⚠️ **تم تحديث هذه الوثيقة** - تم إزالة endpoints غير موجودة وتصحيح الـ responses

### التغييرات الرئيسية:
1. ✅ إزالة `/favorites/by-tags` (غير موجود في الكود)
2. ✅ تصحيح `/favorites/clear/all` response من `deletedCount` إلى `cleared`
3. ✅ تصحيح `/favorites/sync` response ليشمل `synced, skipped, total`
4. ✅ إزالة `tags` من الـ schema (غير مستخدمة حالياً)
5. ✅ توضيح تفاصيل `guest favorites` والمتطلبات في الـ body
6. ✅ إضافة توثيق لأخطاء `FAVORITE_NOT_FOUND` أثناء التحديث
7. ✅ تحديث أمثلة `requestId` لتتوافق مع UUID v4 كما في الـ Backend

### الملفات المرجعية:
- **Controller:** `backend/src/modules/favorites/favorites.user.controller.ts`
- **Service:** `backend/src/modules/favorites/favorites.service.ts`

---

**التالي:** [خدمة العناوين (Addresses)](./08-addresses-service.md)

