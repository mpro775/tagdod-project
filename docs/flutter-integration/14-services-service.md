# 🔧 خدمة الطلبات الهندسية (Engineering Services)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: أكتوبر 2025

خدمة الطلبات الهندسية توفر endpoints لطلب خدمات المهندسين وتقديم العروض.

> ℹ️ **هيكل الاستجابة**: جميع الاستجابات الناجحة تُغلّف تلقائياً بواسطة `ResponseEnvelopeInterceptor` وتعود بالشكل `{ success, data, requestId }`. معظم الـ endpoints في هذه الخدمة تُرجع بياناتها تحت المفتاح `data` داخل الحقل `data` الرئيسي (أي `apiResponse.data['data']`). راجع `docs/flutter-integration/01-response-structure.md` للتفاصيل الكاملة.

---

## 📋 جدول المحتويات

### للمستخدمين (Customers)
1. [إنشاء طلب خدمة](#1-إنشاء-طلب-خدمة)
2. [طلباتي](#2-طلباتي)
   - [طلبات بلا عروض](#طلبات-بلا-عروض)
   - [طلبات بعروض غير مقبولة](#طلبات-بعروض-غير-مقبولة)
   - [طلبات بعروض مقبولة](#طلبات-بعروض-مقبولة)
3. [تفاصيل طلب](#3-تفاصيل-طلب)
4. [إلغاء طلب](#4-إلغاء-طلب)
5. [العروض المقدمة على طلب](#5-العروض-المقدمة-على-طلب)
   - [تفاصيل عرض محدد](#تفاصيل-عرض-محدد)
6. [قبول عرض](#6-قبول-عرض)
7. [تقييم الخدمة](#7-تقييم-الخدمة)

### للمهندسين (Engineers)
8. [الطلبات القريبة](#8-الطلبات-القريبة)
   - [الطلبات في مدينتي](#الطلبات-في-مدينتي)
   - [جميع الطلبات المتاحة](#جميع-الطلبات-المتاحة)
9. [تقديم عرض](#9-تقديم-عرض)
10. [تحديث عرض](#10-تحديث-عرض)
    - [حذف عرض](#حذف-عرض)
11. [عروضي](#11-عروضي)
12. [بدء تنفيذ الطلب](#12-بدء-تنفيذ-الطلب)
13. [إكمال الطلب](#13-إكمال-الطلب)

---

## للمستخدمين (Customers)

### 1. إنشاء طلب خدمة

ينشئ طلب خدمة جديد للمهندسين.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/customer`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "title": "تركيب نظام طاقة شمسية",
  "type": "INSTALLATION",
  "description": "أحتاج تركيب نظام 10 كيلو واط",
  "images": [
    "https://cdn.example.com/uploads/site-photo-1.jpg"
  ],
  "addressId": "64address123",
  "scheduledAt": "2025-10-20T10:00:00.000Z"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64service123",
      "userId": "64user123",
      "title": "تركيب نظام طاقة شمسية",
      "type": "INSTALLATION",
      "description": "أحتاج تركيب نظام 10 كيلو واط",
      "images": [
        "https://cdn.example.com/uploads/site-photo-1.jpg"
      ],
      "city": "صنعاء",
      "addressId": "64address123",
      "location": {
        "type": "Point",
        "coordinates": [44.2060, 15.3694]
      },
      "status": "OPEN",
      "scheduledAt": "2025-10-20T10:00:00.000Z",
      "engineerId": null,
      "acceptedOffer": null,
      "rating": null,
      "adminNotes": [],
      "createdAt": "2025-01-15T12:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<ServiceRequest> createServiceRequest({
  required String title,
  String? type,
  String? description,
  List<String>? images,
  required String addressId,
  DateTime? scheduledAt,
}) async {
  final response = await _dio.post('/services/customer', data: {
    'title': title,
    if (type != null) 'type': type,
    if (description != null) 'description': description,
    if (images != null) 'images': images,
    'addressId': addressId,
    if (scheduledAt != null) 'scheduledAt': scheduledAt.toIso8601String(),
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return ServiceRequest.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

> ℹ️ **معلومة مهمة:** لا ترسل حقل `city` عند إنشاء الطلب. الخادم يستخرج المدينة تلقائياً من العنوان المحدد (`addressId`) ويعيدها ضمن الاستجابة.

---

### 2. طلباتي

يسترجع قائمة طلبات المستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/services/customer/my`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64service123",
        "userId": "64user123",
        "title": "تركيب نظام طاقة شمسية",
        "type": "INSTALLATION",
        "description": "أحتاج تركيب نظام 10 كيلو واط",
        "images": [
          "https://cdn.example.com/uploads/site-photo-1.jpg"
        ],
        "city": "صنعاء",
        "addressId": "64address123",
        "location": {
          "type": "Point",
          "coordinates": [44.2060, 15.3694]
        },
        "status": "OPEN",
        "scheduledAt": "2025-10-20T10:00:00.000Z",
        "engineerId": null,
        "acceptedOffer": null,
        "rating": null,
        "adminNotes": [],
        "createdAt": "2025-01-15T12:00:00.000Z",
        "updatedAt": "2025-01-15T12:00:00.000Z"
      }
    ]
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ يتم إرجاع `engineerId` ككائن `populated` يحتوي على `_id`, `firstName`, `lastName`, `phone`, `jobTitle`.

#### 🔍 تصنيفات الطلبات

##### طلبات بلا عروض
- **Endpoint:** `GET /services/customer/my/no-offers`

##### طلبات بعروض غير مقبولة
- **Endpoint:** `GET /services/customer/my/with-offers`

##### طلبات بعروض مقبولة
- **Endpoint:** `GET /services/customer/my/with-accepted-offer?status=ASSIGNED|IN_PROGRESS|COMPLETED|RATED`

جميع الاستجابات تُعيد هيكل الطلب نفسه مع الحقول الإضافية (`statusLabel`, `address`, `offers/engineer`) حسب الحالة:

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64service123",
        "title": "تركيب نظام طاقة شمسية",
        "status": "OFFERS_COLLECTING",
        "statusLabel": "تجميع العروض",
        "address": { "line1": "شارع تعز", "city": "صنعاء" },
        "offers": [
          {
            "_id": "64offer123",
            "amountYER": 9000,
            "statusLabel": "عرض مقدم",
            "engineer": {
              "name": "حسن اللقلي",
              "phone": "777123456",
              "whatsapp": "https://wa.me/967777123456"
            }
          }
        ]
      }
    ]
  }
}
```

> ✅ استعمل هذه النهايات لبناء تبويب "الطلبات" كما في التصميم (الكل، في الطريق إليك، ...).

### كود Flutter

```dart
Future<List<ServiceRequest>> getMyRequests() async {
  final response = await _dio.get('/services/customer/my');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return (apiResponse.data!['data'] as List)
        .map((item) => ServiceRequest.fromJson(item))
        .toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 3. تفاصيل طلب

يسترجع تفاصيل طلب محدد.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/services/customer/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64service123",
      "userId": "64user123",
      "title": "تركيب نظام طاقة شمسية",
      "type": "INSTALLATION",
      "description": "أحتاج تركيب نظام 10 كيلو واط",
      "images": [
        "https://cdn.example.com/uploads/site-photo-1.jpg"
      ],
      "city": "صنعاء",
      "addressId": "64address123",
      "location": {
        "type": "Point",
        "coordinates": [44.2060, 15.3694]
      },
      "status": "OPEN",
      "scheduledAt": "2025-10-20T10:00:00.000Z",
      "engineerId": null,
      "acceptedOffer": null,
      "rating": null,
      "adminNotes": [],
      "createdAt": "2025-01-15T12:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ الحقل `requestId` يكون مكتملاً (`populated`) ويتضمن بيانات الطلب (`_id`, `title`, `status`).

### كود Flutter

```dart
Future<ServiceRequest> getServiceRequest(String requestId) async {
  final response = await _dio.get('/services/customer/$requestId');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return ServiceRequest.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 4. إلغاء طلب

يلغي طلب خدمة.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/customer/:id/cancel`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ عند فشل الإلغاء يعيد الحقل `data` قيمة مثل `{ "error": "CANNOT_CANCEL" }`.

### كود Flutter

```dart
Future<bool> cancelServiceRequest(String requestId) async {
  final response = await _dio.post('/services/customer/$requestId/cancel');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 5. العروض المقدمة على طلب

يسترجع العروض المقدمة على طلب محدد.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/services/customer/:id/offers`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64offer123",
        "requestId": "64service123",
        "engineerId": {
          "_id": "64engineer123",
          "firstName": "أحمد",
          "lastName": "محمد",
          "phone": "777123456",
          "jobTitle": "مهندس كهرباء"
        },
        "amount": 750000,
        "note": "سأقوم بتركيب النظام بأعلى جودة",
        "distanceKm": 2.5,
        "status": "OFFERED",
        "createdAt": "2025-01-15T14:00:00.000Z",
        "updatedAt": "2025-01-15T14:00:00.000Z"
      }
    ]
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<List<EngineerOffer>> getOffersForRequest(String requestId) async {
  final response = await _dio.get('/services/customer/$requestId/offers');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return (apiResponse.data!['data'] as List)
        .map((item) => EngineerOffer.fromJson(item))
        .toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

#### تفاصيل عرض محدد

- **Method:** `GET`
- **Endpoint:** `/services/customer/:requestId/offers/:offerId`
- **Auth Required:** ✅ نعم

```json
{
  "success": true,
  "data": {
    "data": {
      "offer": {
        "_id": "64offer123",
        "amountYER": 9000,
        "note": "يشمل التركيب الكامل",
        "status": "OFFERED",
        "statusLabel": "عرض مقدم",
        "engineer": {
          "id": "64engineer123",
          "name": "حسن اللقلي",
          "jobTitle": "مهندس كهرباء",
          "phone": "777123456",
          "whatsapp": "https://wa.me/967777123456"
        }
      },
      "request": {
        "_id": "64service123",
        "title": "تركيب منظومة شمسية",
        "type": "INSTALLATION",
        "description": "احتياج لتركيب منظومة طاقة شمسية كاملة...",
        "images": ["https://cdn.example.com/uploads/site-photo-1.jpg"],
        "status": "OPEN",
        "statusLabel": "بانتظار العروض",
        "scheduledAt": "2025-10-20T10:00:00.000Z",
        "address": {
          "label": "المنزل",
          "line1": "شارع تعز - جوار مستشفى ناصر",
          "city": "صنعاء"
        }
      }
    }
  }
}
```

> استخدم هذا الـ endpoint لبناء شاشة "بيانات عرض المهندس".

---

### 6. قبول عرض

يقبل عرض مهندس على طلب.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/customer/:id/accept-offer`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "offerId": "64offer123"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ قد يعيد الحقل `data` قيمة `{ "error": "OFFER_NOT_FOUND" }` أو `{ "error": "INVALID_STATUS" }` عند الفشل.

### كود Flutter

```dart
Future<bool> acceptOffer(String requestId, String offerId) async {
  final response = await _dio.post('/services/customer/$requestId/accept-offer', data: {
    'offerId': offerId,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 7. تقييم الخدمة

يقيم المستخدم الخدمة المقدمة.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/customer/:id/rate`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Request Body

```json
{
  "score": 5,
  "comment": "خدمة ممتازة وجودة عالية"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ إذا كان الطلب غير مكتمل أو تم تقييمه مسبقاً يعيد الحقل `data` قيمة `{ "error": "NOT_COMPLETED" }`.

### كود Flutter

```dart
Future<bool> rateService(String requestId, int score, String? comment) async {
  final response = await _dio.post('/services/customer/$requestId/rate', data: {
    'score': score,
    if (comment != null) 'comment': comment,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## للمهندسين (Engineers)

### 8. الطلبات القريبة

يسترجع الطلبات القريبة من موقع المهندس.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/services/engineer/requests/nearby`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Query Parameters

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|-------|
| `lat` | `number` | ✅ | خط العرض |
| `lng` | `number` | ✅ | خط الطول |
| `radiusKm` | `number` | ❌ | نصف القطر بالكيلومتر (افتراضي: 10) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64service123",
        "userId": "64user123",
        "title": "تركيب نظام طاقة شمسية",
        "type": "INSTALLATION",
        "description": "أحتاج تركيب نظام 10 كيلو واط",
        "images": [
          "https://cdn.example.com/uploads/site-photo-1.jpg"
        ],
        "city": "صنعاء",
        "addressId": "64address123",
        "location": {
          "type": "Point",
          "coordinates": [44.2060, 15.3694]
        },
        "status": "OPEN",
        "scheduledAt": "2025-10-20T10:00:00.000Z",
        "engineerId": null,
        "acceptedOffer": null,
        "rating": null,
        "adminNotes": [],
        "createdAt": "2025-01-15T12:00:00.000Z",
        "updatedAt": "2025-01-15T12:00:00.000Z"
      }
    ]
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

#### الطلبات في مدينتي

- **Method:** `GET`
- **Endpoint:** `/services/engineer/requests/city`
- يعيد جميع الطلبات المتاحة في نفس مدينة المهندس (حالة `OPEN` أو `OFFERS_COLLECTING`) بدون فلترة حسب المسافة.

#### جميع الطلبات المتاحة

- **Method:** `GET`
- **Endpoint:** `/services/engineer/requests/all`
- يعيد كل الطلبات المتاحة بغض النظر عن المدينة أو المسافة (للاستخدام الإداري داخل التطبيق الميداني للمهندس).

### كود Flutter

```dart
Future<List<ServiceRequest>> getNearbyRequests({
  required double lat,
  required double lng,
  double radiusKm = 10,
}) async {
  final response = await _dio.get('/services/engineer/requests/nearby', queryParameters: {
    'lat': lat,
    'lng': lng,
    'radiusKm': radiusKm,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return (apiResponse.data!['data'] as List)
        .map((item) => ServiceRequest.fromJson(item))
        .toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 9. تقديم عرض

يقدم المهندس عرض على طلب.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/engineer/offers`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Request Body

```json
{
  "requestId": "64service123",
  "amount": 750000,
  "note": "سأقوم بتركيب النظام بأعلى جودة",
  "lat": 44.2060,
  "lng": 15.3694
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64offer123",
      "requestId": "64service123",
      "engineerId": "64engineer123",
      "amount": 750000,
      "note": "سأقوم بتركيب النظام بأعلى جودة",
      "distanceKm": 2.5,
      "status": "OFFERED",
      "createdAt": "2025-01-15T14:00:00.000Z",
      "updatedAt": "2025-01-15T14:00:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<EngineerOffer> createOffer({
  required String requestId,
  required double amount,
  String? note,
  required double lat,
  required double lng,
}) async {
  final response = await _dio.post('/services/engineer/offers', data: {
    'requestId': requestId,
    'amount': amount,
    if (note != null) 'note': note,
    'lat': lat,
    'lng': lng,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return EngineerOffer.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 10. تحديث عرض

يحدث المهندس عرضه.

### معلومات الطلب

- **Method:** `PATCH`
- **Endpoint:** `/services/engineer/offers/:id`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Request Body

```json
{
  "amount": 700000,
  "note": "سأقوم بتركيب النظام بأعلى جودة مع خصم"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "_id": "64offer123",
      "requestId": "64service123",
      "engineerId": "64engineer123",
      "amount": 700000,
      "note": "سأقوم بتركيب النظام بأعلى جودة مع خصم",
      "distanceKm": 2.5,
      "status": "OFFERED",
      "createdAt": "2025-01-15T14:00:00.000Z",
      "updatedAt": "2025-01-15T15:00:00.000Z"
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<EngineerOffer> updateOffer({
  required String offerId,
  double? amount,
  String? note,
}) async {
  final response = await _dio.patch('/services/engineer/offers/$offerId', data: {
    if (amount != null) 'amount': amount,
    if (note != null) 'note': note,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return EngineerOffer.fromJson(apiResponse.data!['data']);
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

#### حذف عرض

- **Method:** `DELETE`
- **Endpoint:** `/services/engineer/offers/:id`
- يسمح بحذف العرض طالما حالته `OFFERED`.

```dart
Future<bool> deleteOffer(String offerId) async {
  final response = await _dio.delete('/services/engineer/offers/$offerId');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 11. عروضي

يسترجع عروض المهندس.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/services/engineer/offers/my`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "64offer123",
        "requestId": {
          "_id": "64service123",
          "title": "تركيب نظام طاقة شمسية",
          "status": "ASSIGNED"
        },
        "engineerId": "64engineer123",
        "amount": 750000,
        "note": "سأقوم بتركيب النظام بأعلى جودة",
        "distanceKm": 2.5,
        "status": "OFFERED",
        "createdAt": "2025-01-15T14:00:00.000Z",
        "updatedAt": "2025-01-15T14:00:00.000Z"
      }
    ]
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

### كود Flutter

```dart
Future<List<EngineerOffer>> getMyOffers() async {
  final response = await _dio.get('/services/engineer/offers/my');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return (apiResponse.data!['data'] as List)
        .map((item) => EngineerOffer.fromJson(item))
        .toList();
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 12. بدء تنفيذ الطلب

يبدأ المهندس تنفيذ الطلب.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/engineer/requests/:id/start`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ في حال لم يكن الفني معيناً أو كانت الحالة غير صحيحة ستجد قيمة `{ "error": "NOT_ASSIGNED" }` أو `{ "error": "INVALID_STATUS" }`.

### كود Flutter

```dart
Future<bool> startServiceRequest(String requestId) async {
  final response = await _dio.post('/services/engineer/requests/$requestId/start');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 13. إكمال الطلب

يكمل المهندس تنفيذ الطلب.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/engineer/requests/:id/complete`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  },
  "requestId": "f4c4d5aa-1bde-4a22-85db-1fb3e7cc90a1"
}
```

> ℹ️ القيم المحتملة عند الفشل تشمل `{ "error": "NOT_ASSIGNED" }` أو `{ "error": "INVALID_STATUS" }`.

### كود Flutter

```dart
Future<bool> completeServiceRequest(String requestId) async {
  final response = await _dio.post('/services/engineer/requests/$requestId/complete');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;
    return result?['ok'] == true;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## Models في Flutter

### ملف: `lib/models/services/service_models.dart`

```dart
enum ServiceRequestStatus {
  OPEN,
  OFFERS_COLLECTING,
  ASSIGNED,
  IN_PROGRESS,
  COMPLETED,
  RATED,
  CANCELLED,
}

enum EngineerOfferStatus {
  OFFERED,
  ACCEPTED,
  REJECTED,
  CANCELLED,
}

class ServiceRequest {
  final String id;
  final String userId;
  final String title;
  final String? type;
  final String? description;
  final String city; // المدينة اليمنية (يتم تزويدها من الخادم)
  final List<String> images;
  final String? addressId;
  final ServiceLocation location;
  final ServiceRequestStatus status;
  final DateTime? scheduledAt;
  final String? engineerId;
  final AcceptedOffer? acceptedOffer;
  final ServiceRating? rating;
  final List<AdminNote> adminNotes;
  final DateTime createdAt;
  final DateTime updatedAt;

  ServiceRequest({
    required this.id,
    required this.userId,
    required this.title,
    this.type,
    this.description,
    this.city = 'صنعاء',
    required this.images,
    this.addressId,
    required this.location,
    required this.status,
    this.scheduledAt,
    this.engineerId,
    this.acceptedOffer,
    this.rating,
    required this.adminNotes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      type: json['type'],
      description: json['description'],
      city: json['city'] ?? 'صنعاء',
      images: List<String>.from(json['images'] ?? []),
      addressId: json['addressId'],
      location: ServiceLocation.fromJson(json['location'] ?? {}),
      status: ServiceRequestStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => ServiceRequestStatus.OPEN,
      ),
      scheduledAt: json['scheduledAt'] != null ? DateTime.parse(json['scheduledAt']) : null,
      engineerId: json['engineerId'],
      acceptedOffer: json['acceptedOffer'] != null 
          ? AcceptedOffer.fromJson(json['acceptedOffer']) 
          : null,
      rating: json['rating'] != null 
          ? ServiceRating.fromJson(json['rating']) 
          : null,
      adminNotes: (json['adminNotes'] as List?)
          ?.map((item) => AdminNote.fromJson(item))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isOpen => status == ServiceRequestStatus.OPEN;
  bool get isOffersCollecting => status == ServiceRequestStatus.OFFERS_COLLECTING;
  bool get isAssigned => status == ServiceRequestStatus.ASSIGNED;
  bool get isInProgress => status == ServiceRequestStatus.IN_PROGRESS;
  bool get isCompleted => status == ServiceRequestStatus.COMPLETED;
  bool get isRated => status == ServiceRequestStatus.RATED;
  bool get isCancelled => status == ServiceRequestStatus.CANCELLED;
  
  bool get hasType => type != null && type!.isNotEmpty;
  bool get hasDescription => description != null && description!.isNotEmpty;
  bool get hasImages => images.isNotEmpty;
  bool get hasAddress => addressId != null && addressId!.isNotEmpty;
  bool get isScheduled => scheduledAt != null;
  bool get hasEngineer => engineerId != null && engineerId!.isNotEmpty;
  bool get hasAcceptedOffer => acceptedOffer != null;
  bool get hasRating => rating != null;
  bool get hasAdminNotes => adminNotes.isNotEmpty;
  
  bool get canBeCancelled => isOpen || isOffersCollecting;
  bool get canAcceptOffers => isOpen || isOffersCollecting;
  bool get canBeRated => isCompleted && !hasRating;
  bool get isActive => !isCancelled && !isRated;
}

class ServiceLocation {
  final String type;
  final List<double> coordinates;

  ServiceLocation({
    required this.type,
    required this.coordinates,
  });

  factory ServiceLocation.fromJson(Map<String, dynamic> json) {
    return ServiceLocation(
      type: json['type'] ?? 'Point',
      coordinates: List<double>.from(json['coordinates'] ?? []),
    );
  }

  double get longitude => coordinates.isNotEmpty ? coordinates[0] : 0.0;
  double get latitude => coordinates.length > 1 ? coordinates[1] : 0.0;
  bool get hasCoordinates => coordinates.length >= 2;
}

class AcceptedOffer {
  final String offerId;
  final double amount;
  final String? note;

  AcceptedOffer({
    required this.offerId,
    required this.amount,
    this.note,
  });

  factory AcceptedOffer.fromJson(Map<String, dynamic> json) {
    return AcceptedOffer(
      offerId: json['offerId'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      note: json['note'],
    );
  }

  bool get hasNote => note != null && note!.isNotEmpty;
}

class ServiceRating {
  final int? score;
  final String? comment;
  final DateTime? at;

  ServiceRating({
    this.score,
    this.comment,
    this.at,
  });

  factory ServiceRating.fromJson(Map<String, dynamic> json) {
    return ServiceRating(
      score: json['score']?.toInt(),
      comment: json['comment'],
      at: json['at'] != null ? DateTime.parse(json['at']) : null,
    );
  }

  bool get hasScore => score != null && score! > 0;
  bool get hasComment => comment != null && comment!.isNotEmpty;
  bool get hasRating => hasScore || hasComment;
  bool get isComplete => hasScore && hasComment;
}

class AdminNote {
  final String note;
  final DateTime at;

  AdminNote({
    required this.note,
    required this.at,
  });

  factory AdminNote.fromJson(Map<String, dynamic> json) {
    return AdminNote(
      note: json['note'] ?? '',
      at: DateTime.parse(json['at']),
    );
  }

  bool get hasNote => note.isNotEmpty;
}

class EngineerOffer {
  final String id;
  final dynamic requestId; // قد يكون String أو Object (populated)
  final dynamic engineerId; // قد يكون String أو Object (populated)
  final double amount;
  final String? note;
  final double? distanceKm;
  final EngineerOfferStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  EngineerOffer({
    required this.id,
    required this.requestId,
    required this.engineerId,
    required this.amount,
    this.note,
    this.distanceKm,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory EngineerOffer.fromJson(Map<String, dynamic> json) {
    return EngineerOffer(
      id: json['_id'] ?? '',
      requestId: json['requestId'],
      engineerId: json['engineerId'],
      amount: (json['amount'] ?? 0).toDouble(),
      note: json['note'],
      distanceKm: json['distanceKm']?.toDouble(),
      status: EngineerOfferStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => EngineerOfferStatus.OFFERED,
      ),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isOffered => status == EngineerOfferStatus.OFFERED;
  bool get isAccepted => status == EngineerOfferStatus.ACCEPTED;
  bool get isRejected => status == EngineerOfferStatus.REJECTED;
  bool get isCancelled => status == EngineerOfferStatus.CANCELLED;
  
  bool get hasNote => note != null && note!.isNotEmpty;
  bool get hasDistance => distanceKm != null;
  bool get isActive => isOffered || isAccepted;
  bool get isFinal => isAccepted || isRejected || isCancelled;
  
  String get requestIdValue {
    if (requestId is Map) {
      return requestId['_id'] ?? '';
    }
    return requestId?.toString() ?? '';
  }

  String get engineerIdValue {
    if (engineerId is Map) {
      return engineerId['_id'] ?? '';
    }
    return engineerId?.toString() ?? '';
  }

  String get formattedAmount => '${amount.toStringAsFixed(0)} ريال';
  String get formattedDistance => hasDistance ? '${distanceKm!.toStringAsFixed(1)} كم' : 'غير محدد';
}

class CreateServiceRequestDto {
  final String title;
  final String? type;
  final String? description;
  final List<String>? images;
  final String addressId;
  final DateTime? scheduledAt;

  CreateServiceRequestDto({
    required this.title,
    this.type,
    this.description,
    this.images,
    required this.addressId,
    this.scheduledAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (type != null) 'type': type,
      if (description != null) 'description': description,
      if (images != null) 'images': images,
      'addressId': addressId,
      if (scheduledAt != null) 'scheduledAt': scheduledAt!.toIso8601String(),
    };
  }
}

class CreateOfferDto {
  final String requestId;
  final double amount;
  final String? note;
  final double lat;
  final double lng;

  CreateOfferDto({
    required this.requestId,
    required this.amount,
    this.note,
    required this.lat,
    required this.lng,
  });

  Map<String, dynamic> toJson() {
    return {
      'requestId': requestId,
      'amount': amount,
      if (note != null) 'note': note,
      'lat': lat,
      'lng': lng,
    };
  }
}

class UpdateOfferDto {
  final double? amount;
  final String? note;

  UpdateOfferDto({
    this.amount,
    this.note,
  });

  Map<String, dynamic> toJson() {
    return {
      if (amount != null) 'amount': amount,
      if (note != null) 'note': note,
    };
  }
}

class AcceptOfferDto {
  final String offerId;

  AcceptOfferDto({
    required this.offerId,
  });

  Map<String, dynamic> toJson() {
    return {
      'offerId': offerId,
    };
  }
}

class RateServiceDto {
  final int score;
  final String? comment;

  RateServiceDto({
    required this.score,
    this.comment,
  });

  Map<String, dynamic> toJson() {
    return {
      'score': score,
      if (comment != null) 'comment': comment,
    };
  }
}

class NearbyQueryDto {
  final double lat;
  final double lng;
  final double radiusKm;

  NearbyQueryDto({
    required this.lat,
    required this.lng,
    this.radiusKm = 10,
  });

  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lng': lng,
      'radiusKm': radiusKm,
    };
  }
}
```

---

## 📝 ملاحظات مهمة

### للمستخدمين (Customers)

1. **إنشاء طلب خدمة:**
   - `title`: عنوان الطلب (مطلوب)
   - `type`: نوع الخدمة (اختياري)
   - `description`: وصف الطلب (اختياري)
   - `city`: لا يتم إرساله؛ يتم تحديده تلقائياً من العنوان المختار
   - `images`: صور الطلب (اختياري)
   - `addressId`: معرف العنوان (مطلوب)
   - `scheduledAt`: موعد التنفيذ (اختياري)

2. **حالات الطلب:**
   - `OPEN`: مفتوح للعروض
   - `OFFERS_COLLECTING`: جمع العروض
   - `ASSIGNED`: تم التعيين
   - `IN_PROGRESS`: جاري التنفيذ
   - `COMPLETED`: مكتمل
   - `RATED`: تم التقييم
   - `CANCELLED`: ملغي

3. **العروض:**
   - يمكن للمستخدم رؤية جميع العروض المقدمة
   - يمكن قبول عرض واحد فقط
   - بعد القبول، يتم تعيين المهندس

4. **التقييم:**
   - يمكن التقييم بعد إكمال الخدمة
   - التقييم من 1 إلى 5 نجوم
   - يمكن إضافة تعليق اختياري

### للمهندسين (Engineers)

5. **الطلبات القريبة:**
   - `lat`, `lng`: موقع المهندس
   - `radiusKm`: نصف القطر بالكيلومتر
   - **فلترة حسب المدينة:** يتم تطبيقها تلقائياً بناءً على مدينة المهندس
   - يتم ترتيب النتائج حسب المسافة

6. **تقديم العروض:**
   - `requestId`: معرف الطلب
   - `amount`: المبلغ المقترح
   - `note`: ملاحظة اختيارية
   - `lat`, `lng`: موقع المهندس لحساب المسافة

7. **حالات العرض:**
   - `OFFERED`: تم تقديمه
   - `ACCEPTED`: تم قبوله
   - `REJECTED`: تم رفضه
   - `CANCELLED`: تم إلغاؤه

8. **تنفيذ الطلب:**
   - `start`: بدء التنفيذ
   - `complete`: إكمال التنفيذ
   - يجب أن يكون المهندس معين على الطلب

### البيانات والهيكل

9. **الموقع:**
   - `location`: إحداثيات جغرافية (GeoJSON)
   - `coordinates`: [longitude, latitude]
   - `hasCoordinates`: التحقق من وجود الإحداثيات

10. **العرض المقبول:**
    - `acceptedOffer`: تفاصيل العرض المقبول
    - `offerId`: معرف العرض
    - `amount`: المبلغ
    - `note`: ملاحظة

11. **التقييم:**
    - `rating`: تقييم الخدمة
    - `score`: النقاط (1-5)
    - `comment`: التعليق
    - `at`: وقت التقييم

12. **ملاحظات الأدمن:**
    - `adminNotes`: ملاحظات إدارية
    - `note`: نص الملاحظة
    - `at`: وقت إضافة الملاحظة

### الوظائف المساعدة

13. **حالات الطلب:**
    - `isOpen`: مفتوح
    - `isOffersCollecting`: جمع العروض
    - `isAssigned`: معين
    - `isInProgress`: جاري التنفيذ
    - `isCompleted`: مكتمل
    - `isRated`: تم التقييم
    - `isCancelled`: ملغي

14. **البيانات:**
    - `hasType`: له نوع
    - `hasDescription`: له وصف
    - `hasImages`: له صور
    - `hasAddress`: له عنوان
    - `isScheduled`: مجدول
    - `hasEngineer`: له مهندس
    - `hasAcceptedOffer`: له عرض مقبول
    - `hasRating`: له تقييم
    - `hasAdminNotes`: له ملاحظات إدارية

15. **الصلاحيات:**
    - `canBeCancelled`: يمكن إلغاؤه
    - `canAcceptOffers`: يمكن قبول العروض
    - `canBeRated`: يمكن تقييمه
    - `isActive`: نشط

16. **العروض:**
    - `isOffered`: تم تقديمه
    - `isAccepted`: تم قبوله
    - `isRejected`: تم رفضه
    - `isCancelled`: تم إلغاؤه
    - `hasNote`: له ملاحظة
    - `hasDistance`: له مسافة
    - `isActive`: نشط
    - `isFinal`: نهائي

17. **التنسيق:**
    - `formattedAmount`: المبلغ منسق
    - `formattedDistance`: المسافة منسقة
    - `longitude`: خط الطول
    - `latitude`: خط العرض
    - `hasCoordinates`: له إحداثيات

18. **الاستخدام:**
    - استخدم `CreateServiceRequestDto` لإنشاء طلب
    - استخدم `CreateOfferDto` لتقديم عرض
    - استخدم `UpdateOfferDto` لتحديث عرض
    - استخدم `AcceptOfferDto` لقبول عرض
    - استخدم `RateServiceDto` لتقييم خدمة
    - استخدم `NearbyQueryDto` للبحث القريب

19. **الأمان:**
    - يجب أن يكون المستخدم مسجل كمهندس للوصول لـ Engineer endpoints
    - يجب أن يكون المستخدم صاحب الطلب للوصول لتفاصيله
    - يجب أن يكون المهندس معين على الطلب لتنفيذه

20. **الأداء:**
    - يتم ترتيب الطلبات القريبة حسب المسافة
    - يتم ترتيب العروض حسب المسافة والسعر
    - يتم حفظ الإحداثيات في قاعدة البيانات للبحث السريع

---

## 🔄 Notes on Update

**التغييرات الرئيسية:**
1. ✅ تصحيح جميع Endpoints:
   - Customer: `/services/customer` و `/services/customer/...`
   - Engineer: `/services/engineer/...`
2. ✅ توحيد جميع الاستجابات تحت الغلاف `{ success, data, requestId }` مع توضيح أن البيانات الفعلية متاحة في `data['data']`
3. ✅ تحديث Enums إلى UPPERCASE:
   - `OPEN`, `OFFERS_COLLECTING`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `RATED`, `CANCELLED`
   - `OFFERED`, `ACCEPTED`, `REJECTED`, `CANCELLED`
4. ✅ تحديث جميع return types - توثيق الحقول الفعلية المعادة من الـ Backend (بما في ذلك قيم `ok`)
5. ✅ إزالة جميع الـ Cache flags (لا يوجد caching في endpoints الفعلية)
6. ✅ **تحديث نظام المدن اليمنية** - فلترة الطلبات حسب المدينة تلقائياً اعتماداً على العنوان

**Endpoints للعملاء (Customers):**
- `POST /services/customer` - إنشاء طلب
- `GET /services/customer/my` - طلباتي
- `GET /services/customer/:id` - تفاصيل طلب
- `POST /services/customer/:id/cancel` - إلغاء طلب
- `POST /services/customer/:id/accept-offer` - قبول عرض
- `POST /services/customer/:id/rate` - تقييم الخدمة
- `GET /services/customer/:id/offers` - العروض المقدمة

**Endpoints للمهندسين (Engineers):**
- `GET /services/engineer/requests/nearby` - الطلبات القريبة
- `POST /services/engineer/offers` - تقديم عرض
- `PATCH /services/engineer/offers/:id` - تحديث عرض
- `GET /services/engineer/offers/my` - عروضي
- `POST /services/engineer/requests/:id/start` - بدء تنفيذ
- `POST /services/engineer/requests/:id/complete` - إكمال الطلب

**ملفات Backend المرجعية:**
- `backend/src/modules/services/customer.controller.ts` - customer endpoints
- `backend/src/modules/services/engineer.controller.ts` - engineer endpoints
- `backend/src/modules/services/schemas/service-request.schema.ts` - ServiceRequest Schema
- `backend/src/modules/services/schemas/engineer-offer.schema.ts` - EngineerOffer Schema
- `backend/src/modules/services/enums/service-status.enum.ts` - Status Enums
- `backend/src/modules/services/enums/yemeni-cities.enum.ts` - Yemeni Cities Enum

---

## 🏙️ نظام المدن اليمنية

> ℹ️ هذه القائمة تُستخدم داخلياً لضمان مطابقة المدينة عند حفظ العنوان. لا حاجة لإرسال المدينة في طلبات الـ API؛ الخادم يحدِّدها تلقائياً من العنوان المرتبط.

### المدن المدعومة (22 مدينة)

```dart
class YemeniCities {
  static const String SANAA = 'صنعاء';
  static const String ADEN = 'عدن';
  static const String TAIZ = 'تعز';
  static const String HODEIDAH = 'الحديدة';
  static const String IBB = 'إب';
  static const String DHAMAR = 'ذمار';
  static const String MUKALLA = 'المكلا';
  static const String HAJJAH = 'حجة';
  static const String AMRAN = 'عمران';
  static const String SAADA = 'صعدة';
  static const String SEIYUN = 'سيئون';
  static const String ZINJIBAR = 'زنجبار';
  static const String MARIB = 'مأرب';
  static const String BAYDA = 'البيضاء';
  static const String LAHIJ = 'لحج';
  static const String ABYAN = 'أبين';
  static const String SHABWAH = 'شبوة';
  static const String MAHWIT = 'المحويت';
  static const String HADRAMOUT = 'حضرموت';
  static const String JAWF = 'الجوف';
  static const String MAHRA = 'المهرة';
  static const String SOCOTRA = 'سقطرى';

  static const String DEFAULT_CITY = SANAA;

  static const List<String> ALL_CITIES = [
    SANAA, ADEN, TAIZ, HODEIDAH, IBB, DHAMAR,
    MUKALLA, HAJJAH, AMRAN, SAADA, SEIYUN, ZINJIBAR,
    MARIB, BAYDA, LAHIJ, ABYAN, SHABWAH, MAHWIT,
    HADRAMOUT, JAWF, MAHRA, SOCOTRA,
  ];

  static const Map<String, String> CITY_EMOJI = {
    SANAA: '🏛️',
    ADEN: '🌊',
    TAIZ: '⛰️',
    HODEIDAH: '🏖️',
    IBB: '🌄',
    DHAMAR: '🏔️',
    MUKALLA: '🏝️',
    HAJJAH: '🌾',
    AMRAN: '🏰',
    SAADA: '🏜️',
    SEIYUN: '🕌',
    ZINJIBAR: '🏘️',
    MARIB: '🏛️',
    BAYDA: '⛰️',
    LAHIJ: '🌳',
    ABYAN: '🌴',
    SHABWAH: '🏔️',
    MAHWIT: '🌄',
    HADRAMOUT: '🏛️',
    JAWF: '🏜️',
    MAHRA: '🏝️',
    SOCOTRA: '🏝️',
  };

  static String getEmoji(String city) {
    return CITY_EMOJI[city] ?? '🏙️';
  }

  static bool isValidCity(String city) {
    return ALL_CITIES.contains(city);
  }
}
```

### آلية عمل الفلترة

**عند إنشاء طلب (لا ترسل المدينة):**
```dart
final request = await servicesService.createServiceRequest(
  title: 'إصلاح لوح شمسي',
  type: 'REPAIR',
  description: 'يحتاج صيانة',
  addressId: addressId,
);
```

**عند بحث المهندس:**
```dart
// المهندس من صنعاء
final nearbyRequests = await servicesService.getNearbyRequests(
  lat: 15.3694,
  lng: 44.2060,
  radiusKm: 10,
);

// النتيجة: فقط طلبات صنعاء ضمن نطاق 10 كم
// ✅ طلب 1 - صنعاء - 2 كم
// ✅ طلب 2 - صنعاء - 5 كم
// ✅ طلب 3 - صنعاء - 8 كم
// ❌ طلب 4 - عدن - 5 كم (مدينة مختلفة)
// ❌ طلب 5 - تعز - 3 كم (مدينة مختلفة)
```

### UI Component للمدن

```dart
class CityDropdown extends StatelessWidget {
  final String? value;
  final ValueChanged<String?>? onChanged;
  final bool enabled;

  const CityDropdown({
    Key? key,
    this.value,
    this.onChanged,
    this.enabled = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value ?? YemeniCities.DEFAULT_CITY,
      decoration: InputDecoration(
        labelText: 'المدينة',
        prefixIcon: Icon(Icons.location_city),
      ),
      items: YemeniCities.ALL_CITIES.map((city) {
        return DropdownMenuItem<String>(
          value: city,
          child: Row(
            children: [
              Text(YemeniCities.getEmoji(city)),
              SizedBox(width: 8),
              Text(city),
            ],
          ),
        );
      }).toList(),
      onChanged: enabled ? onChanged : null,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'المدينة مطلوبة';
        }
        if (!YemeniCities.isValidCity(value)) {
          return 'المدينة غير صحيحة';
        }
        return null;
      },
    );
  }
}
```

### Validation

```dart
String? validateCity(String? city) {
  if (city == null || city.isEmpty) {
    return 'المدينة مطلوبة';
  }
  
  if (!YemeniCities.isValidCity(city)) {
    return 'المدينة يجب أن تكون من المدن اليمنية المدعومة';
  }
  
  return null;
}
```

### الفوائد

1. **للعملاء:**
   - ✅ مهندسون من نفس المدينة
   - ✅ استجابة أسرع
   - ✅ تكاليف تنقل أقل

2. **للمهندسين:**
   - ✅ طلبات قريبة فقط
   - ✅ توفير الوقت والجهد
   - ✅ تركيز أفضل على منطقتهم

3. **للنظام:**
   - ✅ أداء محسّن (فهارس المدن)
   - ✅ بيانات أقل تحميلاً
   - ✅ تجربة مستخدم أفضل

---

