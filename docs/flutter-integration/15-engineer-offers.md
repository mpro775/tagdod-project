# 💼 عروض المهندسين (Engineer Offers)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: يناير 2025

خدمة عروض المهندسين توفر endpoints لإدارة العروض المقدمة على طلبات الخدمات.

> ℹ️ **هيكل الاستجابة**: جميع الاستجابات الناجحة تُغلّف تلقائياً بواسطة `ResponseEnvelopeInterceptor` وتعود بالشكل `{ success, data, requestId }`. معظم الـ endpoints تُرجع بياناتها تحت المفتاح `data` داخل الحقل `data` الرئيسي (أي `apiResponse.data['data']`). راجع `docs/flutter-integration/01-response-structure.md` للتفاصيل الكاملة.

---

## 📋 جدول المحتويات

### للعملاء (Customers)
1. [العروض المقدمة على طلب](#1-العروض-المقدمة-على-طلب)
2. [تفاصيل عرض محدد](#2-تفاصيل-عرض-محدد)

### للمهندسين (Engineers)
3. [تقديم عرض](#3-تقديم-عرض)
4. [تحديث عرض](#4-تحديث-عرض)
5. [حذف عرض](#5-حذف-عرض)
6. [عروضي](#6-عروضي)

---

## للعملاء (Customers)

### 1. العروض المقدمة على طلب

يسترجع العروض المقدمة على طلب محدد.

**Method:** `GET`  
**Endpoint:** `/services/customer/:id/offers`  
**Auth Required:** ✅ نعم

#### Response - نجاح

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
        "statusLabel": "عرض مقدم",
        "createdAt": "2025-01-15T14:00:00.000Z",
        "updatedAt": "2025-01-15T14:00:00.000Z"
      }
    ]
  }
}
```

#### كود Flutter

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

---

### 2. تفاصيل عرض محدد

يسترجع تفاصيل عرض محدد على طلب.

**Method:** `GET`  
**Endpoint:** `/services/customer/:requestId/offers/:offerId`  
**Auth Required:** ✅ نعم

#### Response - نجاح

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
        "createdAt": "2025-01-15T14:00:00.000Z",
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
        "status": "OPEN",
        "statusLabel": "بانتظار العروض"
      }
    }
  }
}
```

> ✅ استخدم هذا الـ endpoint لبناء شاشة "بيانات عرض المهندس".

---

## للمهندسين (Engineers)

### 3. تقديم عرض

يقدم المهندس عرض على طلب.

**Method:** `POST`  
**Endpoint:** `/services/engineer/offers`  
**Auth Required:** ✅ نعم (Engineer)

#### Request Body

```json
{
  "requestId": "64service123",
  "amount": 750000,
  "note": "سأقوم بتركيب النظام بأعلى جودة",
  "lat": 44.2060,
  "lng": 15.3694
}
```

#### Response - نجاح

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
  }
}
```

> ℹ️ عند تقديم أول عرض على طلب، يتم تحديث حالة الطلب تلقائياً من `OPEN` إلى `OFFERS_COLLECTING`.

#### كود Flutter

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

### 4. تحديث عرض

يحدث المهندس عرضه.

**Method:** `PATCH`  
**Endpoint:** `/services/engineer/offers/:id`  
**Auth Required:** ✅ نعم (Engineer)

#### Request Body

```json
{
  "amount": 700000,
  "note": "سأقوم بتركيب النظام بأعلى جودة مع خصم"
}
```

#### Response - نجاح

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
  }
}
```

> ⚠️ **مهم:** يمكن تحديث العرض فقط إذا كانت حالته `OFFERED`.

#### كود Flutter

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

---

### 5. حذف عرض

يحذف المهندس عرضه.

**Method:** `DELETE`  
**Endpoint:** `/services/engineer/offers/:id`  
**Auth Required:** ✅ نعم (Engineer)

> ⚠️ **مهم:** يسمح بحذف العرض طالما حالته `OFFERED`.

#### Response - نجاح

```json
{
  "success": true,
  "data": {
    "data": {
      "ok": true
    }
  }
}
```

#### كود Flutter

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

### 6. عروضي

يسترجع عروض المهندس.

**Method:** `GET`  
**Endpoint:** `/services/engineer/offers/my`  
**Auth Required:** ✅ نعم (Engineer)

#### Response - نجاح

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
        "status": "ACCEPTED",
        "statusLabel": "عرض مقبول",
        "createdAt": "2025-01-15T14:00:00.000Z",
        "updatedAt": "2025-01-15T14:00:00.000Z"
      }
    ]
  }
}
```

#### كود Flutter

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

## حالات العرض (Status)

### الحالات المتاحة

| الحالة | الوصف | متى تحدث |
|--------|-------|----------|
| `OFFERED` | عرض مقدم | عند تقديم العرض |
| `ACCEPTED` | عرض مقبول | عند قبول العرض من العميل |
| `REJECTED` | عرض مرفوض | عند رفض العرض من العميل أو الإدارة |
| `CANCELLED` | عرض ملغى | عند إلغاء العرض من المهندس أو الإدارة |
| `OUTBID` | تم قبول عرض آخر | ✅ **جديد** - عند قبول عرض آخر على نفس الطلب |
| `EXPIRED` | عرض منتهي الصلاحية | ✅ **جديد** - بعد 5 أيام بدون قبول |

> ✅ **حالات جديدة:**
> - `OUTBID`: عندما يتم قبول عرض آخر على نفس الطلب
> - `EXPIRED`: عندما ينتهي العرض بعد 5 أيام بدون قبول

### التدفق

```
OFFERED → ACCEPTED (عند قبول العرض)
       ↓
    OUTBID (عند قبول عرض آخر)
       ↓
    EXPIRED (بعد 5 أيام)
       ↓
    REJECTED (عند الرفض)
       ↓
    CANCELLED (عند الإلغاء)
```

---

## انتهاء الصلاحية

> ⚠️ **ميزة تلقائية:** يتم فحص العروض المنتهية الصلاحية يومياً في الساعة 2 صباحاً.

### العروض

- إذا كانت `OFFERED` ولم يتم قبولها لمدة **5 أيام** → `EXPIRED`
- يتم إرسال إشعار للمهندس عند انتهاء الصلاحية

---

## ما يحدث عند قبول عرض

عندما يقبل العميل عرضاً:

1. **العرض المقبول:**
   - يتم تحديث حالته إلى `ACCEPTED`
   - يتم تحديث حالة الطلب إلى `ASSIGNED`
   - يتم إرسال إشعار للمهندس صاحب العرض المقبول

2. **العروض الأخرى:**
   - يتم تحديث حالتها إلى `OUTBID` (تم قبول عرض آخر)
   - يتم إرسال إشعارات للمهندسين الذين تم رفض عروضهم
   - الرسالة: "تم قبول عرض آخر للطلب. تم إيقاف عرضك."

> ✅ **ميزة جديدة:** العروض المرفوضة بسبب قبول عرض آخر تُحدّث إلى `OUTBID` بدلاً من `REJECTED` لتوضيح السبب.

---

## Models في Flutter

### EngineerOfferStatus Enum

```dart
enum EngineerOfferStatus {
  OFFERED,
  ACCEPTED,
  REJECTED,
  CANCELLED,
  OUTBID,    // ✅ جديد
  EXPIRED,   // ✅ جديد
}
```

### EngineerOffer Model

```dart
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

  // Helper methods
  bool get isOffered => status == EngineerOfferStatus.OFFERED;
  bool get isAccepted => status == EngineerOfferStatus.ACCEPTED;
  bool get isRejected => status == EngineerOfferStatus.REJECTED;
  bool get isCancelled => status == EngineerOfferStatus.CANCELLED;
  bool get isOutbid => status == EngineerOfferStatus.OUTBID; // ✅ جديد
  bool get isExpired => status == EngineerOfferStatus.EXPIRED; // ✅ جديد
  
  bool get hasNote => note != null && note!.isNotEmpty;
  bool get hasDistance => distanceKm != null;
  bool get isActive => isOffered || isAccepted;
  bool get isFinal => isAccepted || isRejected || isCancelled || isOutbid || isExpired; // ✅ محدث
  
  String get statusLabel {
    switch (status) {
      case EngineerOfferStatus.OFFERED:
        return 'عرض مقدم';
      case EngineerOfferStatus.ACCEPTED:
        return 'عرض مقبول';
      case EngineerOfferStatus.REJECTED:
        return 'عرض مرفوض';
      case EngineerOfferStatus.CANCELLED:
        return 'عرض ملغى';
      case EngineerOfferStatus.OUTBID:
        return 'تم قبول عرض آخر'; // ✅ جديد
      case EngineerOfferStatus.EXPIRED:
        return 'عرض منتهي الصلاحية'; // ✅ جديد
    }
  }
  
  String get formattedAmount => '${amount.toStringAsFixed(0)} ريال';
  String get formattedDistance => hasDistance ? '${distanceKm!.toStringAsFixed(1)} كم' : 'غير محدد';
}
```

### CreateOfferDto

```dart
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
```

### UpdateOfferDto

```dart
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
```

---

## ملاحظات مهمة

1. **تقديم العروض:**
   - عند تقديم أول عرض، يتم تحديث حالة الطلب من `OPEN` إلى `OFFERS_COLLECTING`
   - يتم حساب المسافة تلقائياً بناءً على موقع المهندس

2. **قبول العرض:**
   - عند قبول عرض، يتم تحديث العروض الأخرى إلى `OUTBID`
   - يتم إرسال إشعارات للمهندسين

3. **انتهاء الصلاحية:**
   - العروض `OFFERED` لمدة 5 أيام → `EXPIRED`
   - يتم إرسال إشعارات تلقائياً

4. **تحديث العرض:**
   - يمكن تحديث العرض فقط إذا كانت حالته `OFFERED`
   - يمكن حذف العرض فقط إذا كانت حالته `OFFERED`

---

## ملفات Backend المرجعية

- `backend/src/modules/services/customer.controller.ts` - customer endpoints للعروض
- `backend/src/modules/services/engineer.controller.ts` - engineer endpoints للعروض
- `backend/src/modules/services/schemas/engineer-offer.schema.ts` - EngineerOffer Schema
- `backend/src/modules/services/services.service.ts` - Services Service
- `backend/src/modules/services/enums/service-status.enum.ts` - OfferStatus Enum

