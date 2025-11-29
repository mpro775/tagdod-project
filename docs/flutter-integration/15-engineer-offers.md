# 💼 عروض المهندسين (Engineer Offers)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: يناير 2025  
> ✅ **تحديث:** إضافة دعم أنواع العملات (YER, SAR, USD) للعروض

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

يسترجع العروض المقدمة على طلب محدد مع إمكانية الفلترة حسب الحالة. **جميع العروض مدرجة افتراضياً بما فيها الملغاة.**

**Method:** `GET`  
**Endpoint:** `/services/customer/:id/offers`  
**Auth Required:** ✅ نعم

#### Query Parameters

| المعامل  | النوع                  | مطلوب | الوصف                                                                                                                                     |
| -------- | ---------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `status` | `string` أو `string[]` | ❌    | فلترة حسب حالة العرض (OFFERED, ACCEPTED, REJECTED, CANCELLED, OUTBID, EXPIRED). يمكن تمرير قيمة واحدة أو مصفوفة. بدون فلترة: جميع العروض. |

#### أمثلة على الاستخدام

- `GET /services/customer/:id/offers` - جميع العروض (بما فيها الملغاة)
- `GET /services/customer/:id/offers?status=OFFERED` - العروض المقدمة فقط
- `GET /services/customer/:id/offers?status=CANCELLED` - العروض الملغاة فقط
- `GET /services/customer/:id/offers?status=OFFERED&status=ACCEPTED` - العروض المقدمة والمقبولة

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
        "currency": "YER",
        "note": "سأقوم بتركيب النظام بأعلى جودة",
        "distanceKm": 2.5,
        "status": "OFFERED",
        "statusLabel": "عرض مقدم",
        "createdAt": "2025-01-15T14:00:00.000Z",
        "updatedAt": "2025-01-15T14:00:00.000Z"
      },
      {
        "_id": "64offer456",
        "requestId": "64service123",
        "engineerId": {
          "_id": "64engineer456",
          "firstName": "محمد",
          "lastName": "علي",
          "phone": "777654321",
          "jobTitle": "مهندس طاقة شمسية"
        },
        "amount": 800000,
        "currency": "YER",
        "note": null,
        "distanceKm": 5.2,
        "status": "CANCELLED",
        "statusLabel": "عرض ملغى",
        "createdAt": "2025-01-15T13:00:00.000Z",
        "updatedAt": "2025-01-15T16:00:00.000Z"
      }
    ]
  }
}
```

> ℹ️ **ملاحظات:**
>
> - جميع العروض تُرجع مع حقل `statusLabel` الذي يحتوي على التسمية العربية للحالة
> - العروض الملغاة (`CANCELLED`) مدرجة في النتائج حتى عند الفلترة حسب حالات أخرى
> - يمكن استخدام الفلترة لعرض عروض محددة حسب الحاجة

#### كود Flutter

```dart
Future<List<EngineerOffer>> getOffersForRequest(
  String requestId, {
  List<String>? status,
}) async {
  final queryParameters = <String, dynamic>{};
  if (status != null && status.isNotEmpty) {
    queryParameters['status'] = status;
  }

  final response = await _dio.get(
    '/services/customer/$requestId/offers',
    queryParameters: queryParameters,
  );

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

> ✅ **مثال على الاستخدام:**
>
> ```dart
> // جلب جميع العروض
> final allOffers = await getOffersForRequest(requestId);
>
> // جلب العروض المقدمة فقط
> final offeredOffers = await getOffersForRequest(
>   requestId,
>   status: ['OFFERED'],
> );
>
> // جلب العروض الملغاة فقط
> final cancelledOffers = await getOffersForRequest(
>   requestId,
>   status: ['CANCELLED'],
> );
>
> // جلب العروض المقدمة والمقبولة
> final activeOffers = await getOffersForRequest(
>   requestId,
>   status: ['OFFERED', 'ACCEPTED'],
> );
> ```

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
        "amount": 9000,
        "currency": "YER",
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

> ⚠️ **مهم:** لا يمكن للمهندس تقديم أكثر من عرض واحد لنفس الطلب. إذا كان لديه عرض موجود بالفعل، يجب استخدام [تحديث عرض](#4-تحديث-عرض) بدلاً من إنشاء عرض جديد.

#### Request Body

```json
{
  "requestId": "64service123",
  "amount": 750000,
  "currency": "YER",
  "note": "سأقوم بتركيب النظام بأعلى جودة",
  "lat": 44.206,
  "lng": 15.3694
}
```

> ℹ️ **نوع العملة:** يجب تحديد نوع العملة (`currency`) عند تقديم العرض. القيم المتاحة: `YER` (الريال اليمني)، `SAR` (الريال السعودي)، `USD` (الدولار الأمريكي).

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
      "currency": "YER",
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

#### Response - خطأ (400) - عرض موجود بالفعل

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "OFFER_ALREADY_EXISTS",
      "message": "لا يمكنك تقديم أكثر من عرض واحد لنفس الطلب. يمكنك تعديل عرضك الموجود بدلاً من ذلك."
    }
  }
}
```

> ⚠️ **مهم:** إذا حاول المهندس تقديم عرض جديد لنفس الطلب الذي قدم عليه عرضاً سابقاً، سيتم إرجاع هذا الخطأ. يجب استخدام endpoint [تحديث عرض](#4-تحديث-عرض) لتعديل العرض الموجود.

#### Response - خطأ (400) - حساب غير موثق

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "ENGINEER_UNVERIFIED",
      "message": "حسابك غير موثق. يرجى رفع وثائق التحقق أولاً"
    }
  }
}
```

#### Response - خطأ (400) - طلب التحقق قيد المراجعة

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "ENGINEER_PENDING",
      "message": "طلب التحقق قيد المراجعة. يرجى الانتظار حتى يتم الموافقة على حسابك"
    }
  }
}
```

#### Response - خطأ (400) - تم رفض طلب التحقق

```json
{
  "success": true,
  "data": {
    "data": {
      "error": "ENGINEER_REJECTED",
      "message": "تم رفض طلب التحقق الخاص بك. يرجى التواصل مع الدعم"
    }
  }
}
```

> ⚠️ **مهم:** يجب أن يكون المهندس موثقاً (حالة `APPROVED`) لتقديم العروض. إذا كان الحساب غير موثق أو قيد المراجعة أو مرفوض، سيتم منع تقديم العروض.

#### كود Flutter

```dart
Future<EngineerOffer> createOffer({
  required String requestId,
  required double amount,
  required String currency, // YER, SAR, USD
  String? note,
  required double lat,
  required double lng,
}) async {
  final response = await _dio.post('/services/engineer/offers', data: {
    'requestId': requestId,
    'amount': amount,
    'currency': currency,
    if (note != null) 'note': note,
    'lat': lat,
    'lng': lng,
  });

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (json) => json as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    final result = apiResponse.data!['data'] as Map<String, dynamic>?;

    // التحقق من وجود خطأ
    if (result != null && result.containsKey('error')) {
      final error = result['error'] as String;
      switch (error) {
        case 'OFFER_ALREADY_EXISTS':
          throw ApiException(
            result['message'] as String? ??
            'لا يمكنك تقديم أكثر من عرض واحد لنفس الطلب. يمكنك تعديل عرضك الموجود بدلاً من ذلك.'
          );
        case 'REQUEST_NOT_FOUND':
          throw ApiException('لم يتم العثور على طلب الخدمة');
        case 'SELF_NOT_ALLOWED':
          throw ApiException('لا يمكنك تقديم عرض على طلبك الخاص');
        case 'INVALID_STATUS':
          throw ApiException('لا يمكن تقديم عرض على هذا الطلب في حالته الحالية');
        case 'ENGINEER_UNVERIFIED':
          throw ApiException(
            result['message'] as String? ??
            'حسابك غير موثق. يرجى رفع وثائق التحقق أولاً'
          );
        case 'ENGINEER_PENDING':
          throw ApiException(
            result['message'] as String? ??
            'طلب التحقق قيد المراجعة. يرجى الانتظار حتى يتم الموافقة على حسابك'
          );
        case 'ENGINEER_REJECTED':
          throw ApiException(
            result['message'] as String? ??
            'تم رفض طلب التحقق الخاص بك. يرجى التواصل مع الدعم'
          );
        case 'NOT_ENGINEER':
        case 'ENGINEER_NOT_APPROVED':
          throw ApiException(
            result['message'] as String? ??
            'يجب تفعيل صلاحية المهندس أولاً'
          );
        case 'ENGINEER_NOT_FOUND':
          throw ApiException('لم يتم العثور على بيانات المهندس');
        default:
          throw ApiException('حدث خطأ أثناء تقديم العرض');
      }
    }

    return EngineerOffer.fromJson(result!);
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
  "currency": "SAR",
  "note": "سأقوم بتركيب النظام بأعلى جودة مع خصم"
}
```

> ℹ️ **تحديث العملة:** يمكن تحديث نوع العملة (`currency`) عند تحديث العرض. جميع الحقول اختيارية.

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
      "currency": "SAR",
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
  String? currency, // YER, SAR, USD
  String? note,
}) async {
  final response = await _dio.patch('/services/engineer/offers/$offerId', data: {
    if (amount != null) 'amount': amount,
    if (currency != null) 'currency': currency,
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
        "currency": "YER",
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

## أنواع العملات (Currency)

عند تقديم عرض، يجب على المهندس تحديد نوع العملة والقيمة. العميل سيرى نوع العملة والقيمة التي حددها المهندس.

### العملات المتاحة

| الرمز | الاسم            | الوصف                                      |
| ----- | ---------------- | ------------------------------------------ |
| `YER` | الريال اليمني    | العملة الافتراضية                          |
| `SAR` | الريال السعودي   | للعملاء الذين يفضلون الدفع بالريال السعودي |
| `USD` | الدولار الأمريكي | للعملاء الذين يفضلون الدفع بالدولار        |

> ℹ️ **ملاحظة:** القيمة الافتراضية للعملة هي `YER` للتوافق مع البيانات القديمة. جميع العروض الجديدة يجب أن تحتوي على نوع العملة.

---

## حالات العرض (Status)

### الحالات المتاحة

| الحالة      | الوصف              | متى تحدث                                     |
| ----------- | ------------------ | -------------------------------------------- |
| `OFFERED`   | عرض مقدم           | عند تقديم العرض                              |
| `ACCEPTED`  | عرض مقبول          | عند قبول العرض من العميل                     |
| `REJECTED`  | عرض مرفوض          | عند رفض العرض من العميل أو الإدارة           |
| `CANCELLED` | عرض ملغى           | عند إلغاء العرض من المهندس أو الإدارة        |
| `OUTBID`    | تم قبول عرض آخر    | ✅ **جديد** - عند قبول عرض آخر على نفس الطلب |
| `EXPIRED`   | عرض منتهي الصلاحية | ✅ **جديد** - بعد 5 أيام بدون قبول           |

> ✅ **حالات جديدة:**
>
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
  final String currency; // YER, SAR, USD
  final String? note;
  final double? distanceKm;
  final EngineerOfferStatus status;
  final String? _statusLabelFromApi; // ✅ جديد - من الـ API (حقل خاص)
  final DateTime createdAt;
  final DateTime updatedAt;

  EngineerOffer({
    required this.id,
    required this.requestId,
    required this.engineerId,
    required this.amount,
    required this.currency,
    this.note,
    this.distanceKm,
    required this.status,
    String? statusLabelFromApi, // ✅ جديد
    required this.createdAt,
  }) : _statusLabelFromApi = statusLabelFromApi;
    required this.updatedAt,
  });

  factory EngineerOffer.fromJson(Map<String, dynamic> json) {
    return EngineerOffer(
      id: json['_id'] ?? '',
      requestId: json['requestId'],
      engineerId: json['engineerId'],
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'YER', // افتراضي YER للتوافق مع البيانات القديمة
      note: json['note'],
      distanceKm: json['distanceKm']?.toDouble(),
      status: EngineerOfferStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => EngineerOfferStatus.OFFERED,
      ),
      statusLabelFromApi: json['statusLabel'], // ✅ جديد - من الـ API
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

  // ✅ محدث - يستخدم statusLabel من API إن وجد، وإلا يحسبه محلياً
  String get statusLabel {
    if (_statusLabelFromApi != null && _statusLabelFromApi!.isNotEmpty) {
      return _statusLabelFromApi!;
    }
    // Fallback إلى الحساب المحلي
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
        return 'تم قبول عرض آخر';
      case EngineerOfferStatus.EXPIRED:
        return 'عرض منتهي الصلاحية';
    }
  }

  String get formattedAmount {
    final currencySymbol = _getCurrencySymbol(currency);
    return '${amount.toStringAsFixed(0)} $currencySymbol';
  }

  String _getCurrencySymbol(String currency) {
    switch (currency) {
      case 'YER':
        return 'ريال يمني';
      case 'SAR':
        return 'ريال سعودي';
      case 'USD':
        return 'دولار';
      default:
        return 'ريال';
    }
  }

  String get formattedDistance => hasDistance ? '${distanceKm!.toStringAsFixed(1)} كم' : 'غير محدد';
}
```

### CreateOfferDto

```dart
class CreateOfferDto {
  final String requestId;
  final double amount;
  final String currency; // YER, SAR, USD
  final String? note;
  final double lat;
  final double lng;

  CreateOfferDto({
    required this.requestId,
    required this.amount,
    required this.currency,
    this.note,
    required this.lat,
    required this.lng,
  });

  Map<String, dynamic> toJson() {
    return {
      'requestId': requestId,
      'amount': amount,
      'currency': currency,
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
  final String? currency; // YER, SAR, USD
  final String? note;

  UpdateOfferDto({
    this.amount,
    this.currency,
    this.note,
  });

  Map<String, dynamic> toJson() {
    return {
      if (amount != null) 'amount': amount,
      if (currency != null) 'currency': currency,
      if (note != null) 'note': note,
    };
  }
}
```

---

## ملاحظات مهمة

1. **تقديم العروض:**

   - ⚠️ **قيد مهم:** لا يمكن للمهندس تقديم أكثر من عرض واحد لنفس الطلب
   - إذا كان المهندس قد قدم عرضاً سابقاً على نفس الطلب، سيتم إرجاع خطأ `OFFER_ALREADY_EXISTS`
   - يجب استخدام endpoint [تحديث عرض](#4-تحديث-عرض) لتعديل العرض الموجود بدلاً من إنشاء عرض جديد
   - عند تقديم أول عرض، يتم تحديث حالة الطلب من `OPEN` إلى `OFFERS_COLLECTING`
   - يتم حساب المسافة تلقائياً بناءً على موقع المهندس
   - ✅ **جديد:** يجب تحديد نوع العملة (`currency`) عند تقديم العرض: `YER`، `SAR`، أو `USD`
   - العميل سيرى نوع العملة والقيمة التي حددها المهندس في عرضه

2. **قبول العرض:**

   - عند قبول عرض، يتم تحديث العروض الأخرى إلى `OUTBID`
   - يتم إرسال إشعارات للمهندسين

3. **انتهاء الصلاحية:**

   - العروض `OFFERED` لمدة 5 أيام → `EXPIRED`
   - يتم إرسال إشعارات تلقائياً

4. **تحديث العرض:**
   - يمكن تحديث العرض فقط إذا كانت حالته `OFFERED`
   - يمكن تحديث العرض مرة واحدة فقط (`updatesCount` محدود بـ 1)
   - يمكن حذف العرض فقط إذا كانت حالته `OFFERED`
   - ✅ **جديد:** يمكن تحديث نوع العملة (`currency`) عند تحديث العرض

---

## ملفات Backend المرجعية

- `backend/src/modules/services/customer.controller.ts` - customer endpoints للعروض
- `backend/src/modules/services/engineer.controller.ts` - engineer endpoints للعروض
- `backend/src/modules/services/schemas/engineer-offer.schema.ts` - EngineerOffer Schema
- `backend/src/modules/services/services.service.ts` - Services Service
- `backend/src/modules/services/enums/service-status.enum.ts` - OfferStatus Enum
