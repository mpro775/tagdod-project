# 🔧 خدمة الطلبات الهندسية (Engineering Services)

خدمة الطلبات الهندسية توفر endpoints لطلب خدمات المهندسين وتقديم العروض.

---

## 📋 جدول المحتويات

### للمستخدمين (Customers)
1. [إنشاء طلب خدمة](#1-إنشاء-طلب-خدمة)
2. [طلباتي](#2-طلباتي)
3. [تفاصيل طلب](#3-تفاصيل-طلب)
4. [إلغاء طلب](#4-إلغاء-طلب)
5. [العروض المقدمة على طلب](#5-العروض-المقدمة-على-طلب)
6. [قبول عرض](#6-قبول-عرض)
7. [تقييم الخدمة](#7-تقييم-الخدمة)

### للمهندسين (Engineers)
8. [الطلبات القريبة](#8-الطلبات-القريبة)
9. [تقديم عرض](#9-تقديم-عرض)
10. [تحديث عرض](#10-تحديث-عرض)
11. [عروضي](#11-عروضي)
12. [بدء تنفيذ الطلب](#12-بدء-تنفيذ-الطلب)
13. [إكمال الطلب](#13-إكمال-الطلب)

---

## للمستخدمين (Customers)

### 1. إنشاء طلب خدمة

ينشئ طلب خدمة جديد للمهندسين.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/requests`
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
    "_id": "64service123",
    "userId": "64user123",
    "title": "تركيب نظام طاقة شمسية",
    "type": "INSTALLATION",
    "description": "أحتاج تركيب نظام 10 كيلو واط",
    "images": [
      "https://cdn.example.com/uploads/site-photo-1.jpg"
    ],
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
  },
  "requestId": "req_service_001"
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
  final response = await _dio.post('/services/requests', data: {
    'title': title,
    if (type != null) 'type': type,
    if (description != null) 'description': description,
    if (images != null) 'images': images,
    'addressId': addressId,
    if (scheduledAt != null) 'scheduledAt': scheduledAt.toIso8601String(),
  });

  final apiResponse = ApiResponse<ServiceRequest>.fromJson(
    response.data,
    (json) => ServiceRequest.fromJson(json),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 2. طلباتي

يسترجع قائمة طلبات المستخدم.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/services/requests/my`
- **Auth Required:** ✅ نعم
- **Cache:** ✅ نعم (5 دقائق)

### Response - نجاح

```json
{
  "success": true,
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
  ],
  "requestId": "req_service_002"
}
```

### كود Flutter

```dart
Future<List<ServiceRequest>> getMyRequests() async {
  final response = await _dio.get('/services/requests/my');

  final apiResponse = ApiResponse<List<ServiceRequest>>.fromJson(
    response.data,
    (json) => (json as List).map((item) => ServiceRequest.fromJson(item)).toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
- **Endpoint:** `/services/requests/:id`
- **Auth Required:** ✅ نعم
- **Cache:** ✅ نعم (5 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64service123",
    "userId": "64user123",
    "title": "تركيب نظام طاقة شمسية",
    "type": "INSTALLATION",
    "description": "أحتاج تركيب نظام 10 كيلو واط",
    "images": [
      "https://cdn.example.com/uploads/site-photo-1.jpg"
    ],
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
  },
  "requestId": "req_service_003"
}
```

### كود Flutter

```dart
Future<ServiceRequest> getServiceRequest(String requestId) async {
  final response = await _dio.get('/services/requests/$requestId');

  final apiResponse = ApiResponse<ServiceRequest>.fromJson(
    response.data,
    (json) => ServiceRequest.fromJson(json),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
- **Endpoint:** `/services/requests/:id/cancel`
- **Auth Required:** ✅ نعم
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "cancelled": true
  },
  "requestId": "req_service_004"
}
```

### كود Flutter

```dart
Future<bool> cancelServiceRequest(String requestId) async {
  final response = await _dio.post('/services/requests/$requestId/cancel');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['cancelled'] ?? false;
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
- **Endpoint:** `/services/requests/:id/offers`
- **Auth Required:** ✅ نعم
- **Cache:** ✅ نعم (5 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
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
  ],
  "requestId": "req_service_005"
}
```

### كود Flutter

```dart
Future<List<EngineerOffer>> getOffersForRequest(String requestId) async {
  final response = await _dio.get('/services/requests/$requestId/offers');

  final apiResponse = ApiResponse<List<EngineerOffer>>.fromJson(
    response.data,
    (json) => (json as List).map((item) => EngineerOffer.fromJson(item)).toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

### 6. قبول عرض

يقبل عرض مهندس على طلب.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/services/requests/:id/accept-offer`
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
    "accepted": true
  },
  "requestId": "req_service_006"
}
```

### كود Flutter

```dart
Future<bool> acceptOffer(String requestId, String offerId) async {
  final response = await _dio.post('/services/requests/$requestId/accept-offer', data: {
    'offerId': offerId,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['accepted'] ?? false;
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
- **Endpoint:** `/services/requests/:id/rate`
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
    "rated": true
  },
  "requestId": "req_service_007"
}
```

### كود Flutter

```dart
Future<bool> rateService(String requestId, int score, String? comment) async {
  final response = await _dio.post('/services/requests/$requestId/rate', data: {
    'score': score,
    if (comment != null) 'comment': comment,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['rated'] ?? false;
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
- **Endpoint:** `/services/requests/nearby`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ✅ نعم (5 دقائق)

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
  ],
  "requestId": "req_service_008"
}
```

### كود Flutter

```dart
Future<List<ServiceRequest>> getNearbyRequests({
  required double lat,
  required double lng,
  double radiusKm = 10,
}) async {
  final response = await _dio.get('/services/requests/nearby', queryParameters: {
    'lat': lat,
    'lng': lng,
    'radiusKm': radiusKm,
  });

  final apiResponse = ApiResponse<List<ServiceRequest>>.fromJson(
    response.data,
    (json) => (json as List).map((item) => ServiceRequest.fromJson(item)).toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
- **Endpoint:** `/services/offers`
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
    "_id": "64offer123",
    "requestId": "64service123",
    "engineerId": "64engineer123",
    "amount": 750000,
    "note": "سأقوم بتركيب النظام بأعلى جودة",
    "distanceKm": 2.5,
    "status": "OFFERED",
    "createdAt": "2025-01-15T14:00:00.000Z",
    "updatedAt": "2025-01-15T14:00:00.000Z"
  },
  "requestId": "req_service_009"
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
  final response = await _dio.post('/services/offers', data: {
    'requestId': requestId,
    'amount': amount,
    if (note != null) 'note': note,
    'lat': lat,
    'lng': lng,
  });

  final apiResponse = ApiResponse<EngineerOffer>.fromJson(
    response.data,
    (json) => EngineerOffer.fromJson(json),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
- **Endpoint:** `/services/offers/:id`
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
    "_id": "64offer123",
    "requestId": "64service123",
    "engineerId": "64engineer123",
    "amount": 700000,
    "note": "سأقوم بتركيب النظام بأعلى جودة مع خصم",
    "distanceKm": 2.5,
    "status": "OFFERED",
    "createdAt": "2025-01-15T14:00:00.000Z",
    "updatedAt": "2025-01-15T15:00:00.000Z"
  },
  "requestId": "req_service_010"
}
```

### كود Flutter

```dart
Future<EngineerOffer> updateOffer({
  required String offerId,
  double? amount,
  String? note,
}) async {
  final response = await _dio.patch('/services/offers/$offerId', data: {
    if (amount != null) 'amount': amount,
    if (note != null) 'note': note,
  });

  final apiResponse = ApiResponse<EngineerOffer>.fromJson(
    response.data,
    (json) => EngineerOffer.fromJson(json),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
- **Endpoint:** `/services/offers/my`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ✅ نعم (5 دقائق)

### Response - نجاح

```json
{
  "success": true,
  "data": [
    {
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
  ],
  "requestId": "req_service_011"
}
```

### كود Flutter

```dart
Future<List<EngineerOffer>> getMyOffers() async {
  final response = await _dio.get('/services/offers/my');

  final apiResponse = ApiResponse<List<EngineerOffer>>.fromJson(
    response.data,
    (json) => (json as List).map((item) => EngineerOffer.fromJson(item)).toList(),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
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
- **Endpoint:** `/services/requests/:id/start`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "started": true
  },
  "requestId": "req_service_012"
}
```

### كود Flutter

```dart
Future<bool> startServiceRequest(String requestId) async {
  final response = await _dio.post('/services/requests/$requestId/start');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['started'] ?? false;
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
- **Endpoint:** `/services/requests/:id/complete`
- **Auth Required:** ✅ نعم (Engineer)
- **Cache:** ❌ لا

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "completed": true
  },
  "requestId": "req_service_013"
}
```

### كود Flutter

```dart
Future<bool> completeServiceRequest(String requestId) async {
  final response = await _dio.post('/services/requests/$requestId/complete');

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!['completed'] ?? false;
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
  open,
  offersCollecting,
  assigned,
  inProgress,
  completed,
  rated,
  cancelled,
}

enum EngineerOfferStatus {
  offered,
  accepted,
  rejected,
  cancelled,
}

class ServiceRequest {
  final String id;
  final String userId;
  final String title;
  final String? type;
  final String? description;
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
      images: List<String>.from(json['images'] ?? []),
      addressId: json['addressId'],
      location: ServiceLocation.fromJson(json['location'] ?? {}),
      status: ServiceRequestStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == json['status'],
        orElse: () => ServiceRequestStatus.open,
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

  bool get isOpen => status == ServiceRequestStatus.open;
  bool get isOffersCollecting => status == ServiceRequestStatus.offersCollecting;
  bool get isAssigned => status == ServiceRequestStatus.assigned;
  bool get isInProgress => status == ServiceRequestStatus.inProgress;
  bool get isCompleted => status == ServiceRequestStatus.completed;
  bool get isRated => status == ServiceRequestStatus.rated;
  bool get isCancelled => status == ServiceRequestStatus.cancelled;
  
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
  final String requestId;
  final String engineerId;
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
      requestId: json['requestId'] ?? '',
      engineerId: json['engineerId'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      note: json['note'],
      distanceKm: json['distanceKm']?.toDouble(),
      status: EngineerOfferStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == json['status'],
        orElse: () => EngineerOfferStatus.offered,
      ),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  bool get isOffered => status == EngineerOfferStatus.offered;
  bool get isAccepted => status == EngineerOfferStatus.accepted;
  bool get isRejected => status == EngineerOfferStatus.rejected;
  bool get isCancelled => status == EngineerOfferStatus.cancelled;
  
  bool get hasNote => note != null && note!.isNotEmpty;
  bool get hasDistance => distanceKm != null;
  bool get isActive => isOffered || isAccepted;
  bool get isFinal => isAccepted || isRejected || isCancelled;
  
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

## ✅ تم الانتهاء

تم إنشاء جميع ملفات التوثيق بنجاح! 🎉

الملفات المنشأة:
- ✅ README.md (الفهرس الرئيسي)
- ✅ 01-response-structure.md (هيكل الاستجابة)
- ✅ 02-auth-service.md (المصادقة)
- ✅ 03-products-service.md (المنتجات)
- ✅ 04-cart-service.md (السلة)
- ✅ 05-checkout-service.md (الدفع والطلبات)
- ✅ 06-categories-service.md (التصنيفات)
- ✅ 07-favorites-service.md (المفضلات)
- ✅ 08-addresses-service.md (العناوين)
- ✅ 09-banners-service.md (البنرات)
- ✅ 10-brands-service.md (العلامات التجارية)
- ✅ 11-search-service.md (البحث)
- ✅ 12-coupons-service.md (الكوبونات)
- ✅ 13-pricing-service.md (التسعير)
- ✅ 14-notifications-service.md (الإشعارات)
- ✅ 15-services-service.md (الطلبات الهندسية)

**الموقع:** `docs/flutter-integration/`

