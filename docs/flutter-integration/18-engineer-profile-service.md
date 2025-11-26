# 👷 خدمة بروفايل المهندس (Engineer Profile Service)

> ✅ **تم التحقق**: 100% متطابق مع الكود الفعلي في Backend  
> 📅 **آخر تحديث**: نوفمبر 2025  
> 🔄 **التحديثات الأخيرة**: 
> - إزالة حقل `languages` (لم يعد متاحاً)
> - إضافة `jobTitle` في endpoint التحديث
> - إضافة معلومات `user` (gender, status, engineer_status) في الاستجابة
> - إضافة معلومات `coupon` المرتبط بالمهندس في الاستجابة

خدمة بروفايل المهندس توفر endpoints لإدارة بروفايل المهندس، التقييمات، الرصيد، والعمولات.

> ℹ️ **ميزة جديدة**: تم إنشاء نظام منفصل لإدارة بروفايل المهندس (`EngineerProfile`) منفصل تماماً عن `User` schema. هذا يوفر:
> - فصل واضح بين بيانات المصادقة وبروفايل المهندس
> - إدارة شاملة للتقييمات (النجوم + النص)
> - نظام الرصيد والعمولات
> - حساب تلقائي للإحصائيات

---

## 📋 جدول المحتويات

1. [جلب بروفايل المهندس الحالي](#1-جلب-بروفايل-المهندس-الحالي)
2. [تحديث بروفايل المهندس](#2-تحديث-بروفايل-المهندس)
3. [جلب بروفايل مهندس محدد](#3-جلب-بروفايل-مهندس-محدد)
4. [جلب تقييمات مهندس محدد](#4-جلب-تقييمات-مهندس-محدد)
5. [جلب تقييمات المهندس الحالي](#5-جلب-تقييمات-المهندس-الحالي)
6. [Models في Flutter](#models-في-flutter)

---

## 1. جلب بروفايل المهندس الحالي

جلب بروفايل المهندس المسجل دخول حالياً مع جميع المعلومات والإحصائيات.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/engineers/profile/me`
- **Auth Required:** ✅ نعم (Engineer فقط)

### Headers

```dart
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {access_token}',
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64profile123",
    "userId": {
      "_id": "64user123",
      "firstName": "أحمد",
      "lastName": "محمد",
      "phone": "777123456",
      "city": "صنعاء"
    },
    "bio": "مهندس ميكانيكي محترف مع أكثر من 10 سنوات من الخبرة",
    "avatarUrl": "https://cdn.example.com/avatars/engineer123.jpg",
    "whatsappNumber": "967711234567",
    "cvFileUrl": "https://cdn.example.com/cvs/engineer123.pdf",
    "jobTitle": "مهندس ميكانيكي",
    "specialties": ["ميكانيك", "كهرباء", "سباكة"],
    "yearsOfExperience": 10,
    "certifications": ["شهادة معتمدة في الميكانيك"],
    "user": {
      "gender": "male",
      "status": "active",
      "engineer_status": "approved"
    },
    "coupon": {
      "code": "ENG2024",
      "name": "كوبون المهندس 2024",
      "description": "خصم خاص للمهندسين",
      "discountValue": 10,
      "type": "percentage",
      "commissionRate": 5
    },
    "ratings": [
      {
        "score": 5,
        "comment": "خدمة ممتازة ومهندس محترف جداً",
        "customerId": "64customer123",
        "customerName": "محمد أحمد",
        "serviceRequestId": "64service123",
        "ratedAt": "2025-10-15T10:30:00.000Z"
      }
    ],
    "totalRatings": 25,
    "averageRating": 4.8,
    "ratingDistribution": [15, 5, 3, 1, 1],
    "totalCompletedServices": 50,
    "totalEarnings": 50000,
    "walletBalance": 2500,
    "commissionTransactions": [
      {
        "transactionId": "COMM-1697123456-abc123",
        "type": "commission",
        "amount": 100,
        "orderId": "64order123",
        "couponCode": "ENG2024",
        "description": "عمولة من كوبون ENG2024",
        "createdAt": "2025-10-15T10:00:00.000Z"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-10-15T10:30:00.000Z"
  },
  "requestId": "req_123"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "غير مصرح - يجب أن تكون مهندساً",
    "details": null
  },
  "requestId": "req_123"
}
```

### كود Flutter

```dart
Future<EngineerProfile?> getMyProfile() async {
  try {
    final response = await _dio.get('/engineers/profile/me');
    
    if (response.data['success'] == true) {
      return EngineerProfile.fromJson(response.data['data']);
    }
    
    return null;
  } on DioException catch (e) {
    if (e.response?.statusCode == 401) {
      throw UnauthorizedException('يجب تسجيل الدخول');
    }
    throw Exception('فشل جلب البروفايل: ${e.message}');
  }
}
```

---

## 2. تحديث بروفايل المهندس

تحديث معلومات بروفايل المهندس المسجل دخول.

### معلومات الطلب

- **Method:** `PUT`
- **Endpoint:** `/engineers/profile/me`
- **Auth Required:** ✅ نعم (Engineer فقط)

### Request Body

```json
{
  "bio": "مهندس ميكانيكي محترف مع أكثر من 10 سنوات من الخبرة",
  "avatarUrl": "https://cdn.example.com/avatars/engineer123.jpg",
  "whatsappNumber": "967711234567",
  "jobTitle": "مهندس ميكانيكي",
  "specialties": ["ميكانيك", "كهرباء", "سباكة"],
  "yearsOfExperience": 10,
  "certifications": ["شهادة معتمدة في الميكانيك"]
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `bio` | `string` | ❌ | النبذة عن المهندس (حد أقصى 1000 حرف) |
| `avatarUrl` | `string` (URL) | ❌ | رابط الأفاتار (من Bunny.net) |
| `whatsappNumber` | `string` | ❌ | رقم الواتساب |
| `jobTitle` | `string` | ❌ | المسمى الوظيفي (حد أقصى 100 حرف) |
| `specialties` | `string[]` | ❌ | التخصصات (مثل: ["ميكانيك", "كهرباء"]) |
| `yearsOfExperience` | `number` | ❌ | سنوات الخبرة (0-50) |
| `certifications` | `string[]` | ❌ | الشهادات |

> ⚠️ **ملاحظة**: `cvFileUrl` يتم تحديثه عبر endpoint التوثيق (`/users/verification/submit`)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64profile123",
    "userId": "64user123",
    "bio": "مهندس ميكانيكي محترف مع أكثر من 10 سنوات من الخبرة",
    "avatarUrl": "https://cdn.example.com/avatars/engineer123.jpg",
    "whatsappNumber": "967711234567",
    "jobTitle": "مهندس ميكانيكي",
    "specialties": ["ميكانيك", "كهرباء", "سباكة"],
    "yearsOfExperience": 10,
    "certifications": ["شهادة معتمدة في الميكانيك"],
    "updatedAt": "2025-10-15T11:00:00.000Z"
  },
  "requestId": "req_123"
}
```

### كود Flutter

```dart
Future<EngineerProfile> updateMyProfile({
  String? bio,
  String? avatarUrl,
  String? whatsappNumber,
  String? jobTitle,
  List<String>? specialties,
  int? yearsOfExperience,
  List<String>? certifications,
}) async {
  final data = <String, dynamic>{};
  
  if (bio != null) data['bio'] = bio;
  if (avatarUrl != null) data['avatarUrl'] = avatarUrl;
  if (whatsappNumber != null) data['whatsappNumber'] = whatsappNumber;
  if (jobTitle != null) data['jobTitle'] = jobTitle;
  if (specialties != null) data['specialties'] = specialties;
  if (yearsOfExperience != null) data['yearsOfExperience'] = yearsOfExperience;
  if (certifications != null) data['certifications'] = certifications;
  
  try {
    final response = await _dio.put('/engineers/profile/me', data: data);
    
    if (response.data['success'] == true) {
      return EngineerProfile.fromJson(response.data['data']);
    }
    
    throw Exception('فشل تحديث البروفايل');
  } on DioException catch (e) {
    if (e.response?.statusCode == 401) {
      throw UnauthorizedException('يجب تسجيل الدخول');
    }
    throw Exception('فشل تحديث البروفايل: ${e.message}');
  }
}
```

---

## 3. جلب بروفايل مهندس محدد

جلب بروفايل مهندس محدد (عام - لا يحتاج تسجيل دخول).

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/engineers/profile/:engineerId`
- **Auth Required:** ❌ لا

### Path Parameters

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `engineerId` | `string` | ✅ | معرف المهندس |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "_id": "64profile123",
    "userId": {
      "_id": "64user123",
      "firstName": "أحمد",
      "lastName": "محمد",
      "phone": "777123456",
      "city": "صنعاء"
    },
    "bio": "مهندس ميكانيكي محترف",
    "avatarUrl": "https://cdn.example.com/avatars/engineer123.jpg",
    "whatsappNumber": "967711234567",
    "jobTitle": "مهندس ميكانيكي",
    "specialties": ["ميكانيك", "كهرباء"],
    "yearsOfExperience": 10,
    "totalRatings": 25,
    "averageRating": 4.8,
    "ratingDistribution": [15, 5, 3, 1, 1],
    "totalCompletedServices": 50
  },
  "requestId": "req_123"
}
```

> ⚠️ **ملاحظة**: هذا الـ endpoint لا يُرجع `walletBalance` و `commissionTransactions` لأسباب أمنية

### Response - فشل (المهندس غير موجود)

```json
{
  "success": true,
  "data": {
    "message": "البروفايل غير موجود"
  },
  "requestId": "req_123"
}
```

### كود Flutter

```dart
Future<EngineerProfile?> getEngineerProfile(String engineerId) async {
  try {
    final response = await _dio.get('/engineers/profile/$engineerId');
    
    if (response.data['success'] == true) {
      final data = response.data['data'];
      
      // التحقق من وجود رسالة خطأ
      if (data['message'] != null) {
        return null;
      }
      
      return EngineerProfile.fromJson(data);
    }
    
    return null;
  } on DioException catch (e) {
    throw Exception('فشل جلب البروفايل: ${e.message}');
  }
}
```

---

## 4. جلب تقييمات مهندس محدد

جلب تقييمات مهندس محدد مع خيارات التصفية والترتيب.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/engineers/profile/:engineerId/ratings`
- **Auth Required:** ❌ لا

### Query Parameters

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `page` | `number` | ❌ | رقم الصفحة (افتراضي: 1) |
| `limit` | `number` | ❌ | عدد العناصر في الصفحة (افتراضي: 10، حد أقصى: 50) |
| `sortBy` | `string` | ❌ | طريقة الترتيب: `recent` (الأحدث), `top` (الأعلى), `oldest` (الأقدم) (افتراضي: `recent`) |
| `minScore` | `number` | ❌ | الحد الأدنى للنجوم (1-5) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "ratings": [
      {
        "score": 5,
        "comment": "خدمة ممتازة ومهندس محترف جداً. أنصح بالتعامل معه.",
        "customerId": "64customer123",
        "customerName": "محمد أحمد",
        "serviceRequestId": "64service123",
        "ratedAt": "2025-10-15T10:30:00.000Z"
      },
      {
        "score": 4,
        "comment": "عمل جيد وسريع",
        "customerId": "64customer456",
        "customerName": "أحمد علي",
        "serviceRequestId": "64service456",
        "ratedAt": "2025-10-14T15:20:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "averageRating": 4.8,
    "totalRatings": 25
  },
  "requestId": "req_123"
}
```

### كود Flutter

```dart
Future<RatingsResponse> getEngineerRatings({
  required String engineerId,
  int page = 1,
  int limit = 10,
  String sortBy = 'recent',
  int? minScore,
}) async {
  final queryParams = <String, dynamic>{
    'page': page,
    'limit': limit,
    'sortBy': sortBy,
  };
  
  if (minScore != null) {
    queryParams['minScore'] = minScore;
  }
  
  try {
    final response = await _dio.get(
      '/engineers/profile/$engineerId/ratings',
      queryParameters: queryParams,
    );
    
    if (response.data['success'] == true) {
      return RatingsResponse.fromJson(response.data['data']);
    }
    
    throw Exception('فشل جلب التقييمات');
  } on DioException catch (e) {
    throw Exception('فشل جلب التقييمات: ${e.message}');
  }
}
```

---

## 5. جلب تقييمات المهندس الحالي

جلب تقييمات المهندس المسجل دخول (نفس الـ endpoint السابق لكن للمهندس الحالي).

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/engineers/profile/me/ratings`
- **Auth Required:** ✅ نعم (Engineer فقط)

### Query Parameters

نفس الـ query parameters في [جلب تقييمات مهندس محدد](#4-جلب-تقييمات-مهندس-محدد)

### Response - نجاح

نفس الـ response في [جلب تقييمات مهندس محدد](#4-جلب-تقييمات-مهندس-محدد)

### كود Flutter

```dart
Future<RatingsResponse> getMyRatings({
  int page = 1,
  int limit = 10,
  String sortBy = 'recent',
  int? minScore,
}) async {
  final queryParams = <String, dynamic>{
    'page': page,
    'limit': limit,
    'sortBy': sortBy,
  };
  
  if (minScore != null) {
    queryParams['minScore'] = minScore;
  }
  
  try {
    final response = await _dio.get(
      '/engineers/profile/me/ratings',
      queryParameters: queryParams,
    );
    
    if (response.data['success'] == true) {
      return RatingsResponse.fromJson(response.data['data']);
    }
    
    throw Exception('فشل جلب التقييمات');
  } on DioException catch (e) {
    if (e.response?.statusCode == 401) {
      throw UnauthorizedException('يجب تسجيل الدخول');
    }
    throw Exception('فشل جلب التقييمات: ${e.message}');
  }
}
```

---

## Models في Flutter

### EngineerProfile Model

```dart
class EngineerProfile {
  final String id;
  final UserInfo? userId;
  final String? bio;
  final String? avatarUrl;
  final String? whatsappNumber;
  final String? cvFileUrl;
  final String? jobTitle;
  final List<String>? specialties;
  final int? yearsOfExperience;
  final List<String>? certifications;
  final UserProfileInfo? user; // معلومات إضافية من User
  final CouponInfo? coupon; // الكوبون المرتبط
  final List<EngineerRating> ratings;
  final int totalRatings;
  final double averageRating;
  final List<int> ratingDistribution; // [5نجوم, 4نجوم, 3نجوم, 2نجوم, 1نجمة]
  final int totalCompletedServices;
  final double totalEarnings;
  final double walletBalance; // فقط في /me
  final List<CommissionTransaction> commissionTransactions; // فقط في /me
  final DateTime createdAt;
  final DateTime updatedAt;

  EngineerProfile({
    required this.id,
    this.userId,
    this.bio,
    this.avatarUrl,
    this.whatsappNumber,
    this.cvFileUrl,
    this.jobTitle,
    this.specialties,
    this.yearsOfExperience,
    this.certifications,
    this.user,
    this.coupon,
    required this.ratings,
    required this.totalRatings,
    required this.averageRating,
    required this.ratingDistribution,
    required this.totalCompletedServices,
    required this.totalEarnings,
    this.walletBalance = 0,
    this.commissionTransactions = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory EngineerProfile.fromJson(Map<String, dynamic> json) {
    return EngineerProfile(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] != null && json['userId'] is Map
          ? UserInfo.fromJson(json['userId'])
          : null,
      bio: json['bio'],
      avatarUrl: json['avatarUrl'],
      whatsappNumber: json['whatsappNumber'],
      cvFileUrl: json['cvFileUrl'],
      jobTitle: json['jobTitle'],
      specialties: json['specialties'] != null
          ? List<String>.from(json['specialties'])
          : null,
      yearsOfExperience: json['yearsOfExperience'],
      certifications: json['certifications'] != null
          ? List<String>.from(json['certifications'])
          : null,
      user: json['user'] != null
          ? UserProfileInfo.fromJson(json['user'])
          : null,
      coupon: json['coupon'] != null
          ? CouponInfo.fromJson(json['coupon'])
          : null,
      ratings: json['ratings'] != null
          ? (json['ratings'] as List)
              .map((r) => EngineerRating.fromJson(r))
              .toList()
          : [],
      totalRatings: json['totalRatings'] ?? 0,
      averageRating: (json['averageRating'] ?? 0).toDouble(),
      ratingDistribution: json['ratingDistribution'] != null
          ? List<int>.from(json['ratingDistribution'])
          : [0, 0, 0, 0, 0],
      totalCompletedServices: json['totalCompletedServices'] ?? 0,
      totalEarnings: (json['totalEarnings'] ?? 0).toDouble(),
      walletBalance: (json['walletBalance'] ?? 0).toDouble(),
      commissionTransactions: json['commissionTransactions'] != null
          ? (json['commissionTransactions'] as List)
              .map((t) => CommissionTransaction.fromJson(t))
              .toList()
          : [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId?.toJson(),
      'bio': bio,
      'avatarUrl': avatarUrl,
      'whatsappNumber': whatsappNumber,
      'cvFileUrl': cvFileUrl,
      'jobTitle': jobTitle,
      'specialties': specialties,
      'yearsOfExperience': yearsOfExperience,
      'certifications': certifications,
      'user': user?.toJson(),
      'coupon': coupon?.toJson(),
      'ratings': ratings.map((r) => r.toJson()).toList(),
      'totalRatings': totalRatings,
      'averageRating': averageRating,
      'ratingDistribution': ratingDistribution,
      'totalCompletedServices': totalCompletedServices,
      'totalEarnings': totalEarnings,
      'walletBalance': walletBalance,
      'commissionTransactions':
          commissionTransactions.map((t) => t.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class UserInfo {
  final String id;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? city;

  UserInfo({
    required this.id,
    this.firstName,
    this.lastName,
    this.phone,
    this.city,
  });

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      id: json['_id'] ?? json['id'] ?? '',
      firstName: json['firstName'],
      lastName: json['lastName'],
      phone: json['phone'],
      city: json['city'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'city': city,
    };
  }

  String get fullName {
    return '${firstName ?? ''} ${lastName ?? ''}'.trim();
  }
}

class UserProfileInfo {
  final String? gender;
  final String? status;
  final String? engineer_status;

  UserProfileInfo({
    this.gender,
    this.status,
    this.engineer_status,
  });

  factory UserProfileInfo.fromJson(Map<String, dynamic> json) {
    return UserProfileInfo(
      gender: json['gender'],
      status: json['status'],
      engineer_status: json['engineer_status'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'gender': gender,
      'status': status,
      'engineer_status': engineer_status,
    };
  }
}

class CouponInfo {
  final String code;
  final String name;
  final String? description;
  final double? discountValue;
  final String? type;
  final double? commissionRate;

  CouponInfo({
    required this.code,
    required this.name,
    this.description,
    this.discountValue,
    this.type,
    this.commissionRate,
  });

  factory CouponInfo.fromJson(Map<String, dynamic> json) {
    return CouponInfo(
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      discountValue: json['discountValue'] != null
          ? (json['discountValue'] as num).toDouble()
          : null,
      type: json['type'],
      commissionRate: json['commissionRate'] != null
          ? (json['commissionRate'] as num).toDouble()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'name': name,
      'description': description,
      'discountValue': discountValue,
      'type': type,
      'commissionRate': commissionRate,
    };
  }
}
```

### EngineerRating Model

```dart
class EngineerRating {
  final int score; // 1-5
  final String comment;
  final String customerId;
  final String? customerName;
  final String? serviceRequestId;
  final String? orderId;
  final DateTime ratedAt;

  EngineerRating({
    required this.score,
    required this.comment,
    required this.customerId,
    this.customerName,
    this.serviceRequestId,
    this.orderId,
    required this.ratedAt,
  });

  factory EngineerRating.fromJson(Map<String, dynamic> json) {
    return EngineerRating(
      score: json['score'] ?? 0,
      comment: json['comment'] ?? '',
      customerId: json['customerId'] is String
          ? json['customerId']
          : json['customerId']?['_id'] ?? json['customerId']?.toString() ?? '',
      customerName: json['customerName'],
      serviceRequestId: json['serviceRequestId'] is String
          ? json['serviceRequestId']
          : json['serviceRequestId']?['_id'] ?? json['serviceRequestId']?.toString(),
      orderId: json['orderId'] is String
          ? json['orderId']
          : json['orderId']?['_id'] ?? json['orderId']?.toString(),
      ratedAt: DateTime.parse(json['ratedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'score': score,
      'comment': comment,
      'customerId': customerId,
      'customerName': customerName,
      'serviceRequestId': serviceRequestId,
      'orderId': orderId,
      'ratedAt': ratedAt.toIso8601String(),
    };
  }
}
```

### CommissionTransaction Model

```dart
class CommissionTransaction {
  final String transactionId;
  final String type; // 'commission' | 'withdrawal' | 'refund'
  final double amount;
  final String? orderId;
  final String? couponCode;
  final String? description;
  final DateTime createdAt;

  CommissionTransaction({
    required this.transactionId,
    required this.type,
    required this.amount,
    this.orderId,
    this.couponCode,
    this.description,
    required this.createdAt,
  });

  factory CommissionTransaction.fromJson(Map<String, dynamic> json) {
    return CommissionTransaction(
      transactionId: json['transactionId'] ?? '',
      type: json['type'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      orderId: json['orderId'] is String
          ? json['orderId']
          : json['orderId']?['_id'] ?? json['orderId']?.toString(),
      couponCode: json['couponCode'],
      description: json['description'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'transactionId': transactionId,
      'type': type,
      'amount': amount,
      'orderId': orderId,
      'couponCode': couponCode,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
```

### RatingsResponse Model

```dart
class RatingsResponse {
  final List<EngineerRating> ratings;
  final int total;
  final int page;
  final int limit;
  final double averageRating;
  final int totalRatings;

  RatingsResponse({
    required this.ratings,
    required this.total,
    required this.page,
    required this.limit,
    required this.averageRating,
    required this.totalRatings,
  });

  factory RatingsResponse.fromJson(Map<String, dynamic> json) {
    return RatingsResponse(
      ratings: json['ratings'] != null
          ? (json['ratings'] as List)
              .map((r) => EngineerRating.fromJson(r))
              .toList()
          : [],
      total: json['total'] ?? 0,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 10,
      averageRating: (json['averageRating'] ?? 0).toDouble(),
      totalRatings: json['totalRatings'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ratings': ratings.map((r) => r.toJson()).toList(),
      'total': total,
      'page': page,
      'limit': limit,
      'averageRating': averageRating,
      'totalRatings': totalRatings,
    };
  }
}
```

---

## 🔗 التكامل مع الخدمات الأخرى

### 1. التكامل مع خدمة الطلبات الهندسية

عند تقييم خدمة (عبر `/services/customer/:id/rate`):
- يتم حفظ التقييم في `ServiceRequest.rating`
- يتم إضافة التقييم تلقائياً إلى `EngineerProfile.ratings`
- يتم إعادة حساب `averageRating` و `ratingDistribution` تلقائياً

> 📖 **للمزيد**: راجع [خدمة الطلبات الهندسية](./14-services-service.md#8-تقييم-الخدمة)

### 2. التكامل مع نظام الكوبونات

عند استخدام كوبون مهندس:
- يتم إضافة العمولة إلى `walletBalance` في `EngineerProfile`
- يتم إضافة سجل في `commissionTransactions`

> 📖 **للمزيد**: راجع [خدمة الكوبونات](./12-coupons-service.md)

### 3. التكامل مع نظام التوثيق

عند رفع السيرة الذاتية (عبر `/users/verification/submit`):
- يتم حفظ `cvFileUrl` في `EngineerProfile`

> 📖 **للمزيد**: راجع [خدمة المصادقة](./02-auth-service.md)

> ℹ️ **ملاحظة**: يمكن تحديث `jobTitle` عبر endpoint تحديث البروفايل (`/engineers/profile/me`)

---

## 💡 نصائح مهمة

### ✅ أفضل الممارسات

1. **استخدم `/me` endpoints** للمهندس الحالي (أسرع وأكثر أماناً)
2. **احفظ البروفايل محلياً** لتقليل عدد الطلبات
3. **استخدم Pagination** عند جلب التقييمات
4. **استخدم Filters** (`minScore`, `sortBy`) لتحسين تجربة المستخدم
5. **عرض `ratingDistribution`** بصرياً (مثل شريط تقدم)

### ⚠️ تحذيرات

1. **`walletBalance` و `commissionTransactions`** متاحة فقط في `/me` endpoint
2. **التقييمات تتزامن تلقائياً** - لا حاجة لمزامنة يدوية
3. **التعليق مطلوب** عند إضافة تقييم (لا يمكن إضافة تقييم بدون نص)
4. **النجوم من 1-5** فقط

---

## 📊 أمثلة الاستخدام

### مثال 1: عرض بروفايل المهندس

```dart
class EngineerProfileScreen extends StatefulWidget {
  final String engineerId;
  
  const EngineerProfileScreen({required this.engineerId});
  
  @override
  _EngineerProfileScreenState createState() => _EngineerProfileScreenState();
}

class _EngineerProfileScreenState extends State<EngineerProfileScreen> {
  EngineerProfile? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await engineerProfileService.getEngineerProfile(
        widget.engineerId,
      );
      setState(() {
        _profile = profile;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشل جلب البروفايل: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_profile == null) {
      return Scaffold(
        body: Center(child: Text('البروفايل غير موجود')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text('بروفايل المهندس')),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // الأفاتار والاسم
            CircleAvatar(
              radius: 50,
              backgroundImage: _profile!.avatarUrl != null
                  ? NetworkImage(_profile!.avatarUrl!)
                  : null,
              child: _profile!.avatarUrl == null
                  ? Icon(Icons.person, size: 50)
                  : null,
            ),
            SizedBox(height: 16),
            Text(
              _profile!.userId?.fullName ?? 'بدون اسم',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            if (_profile!.jobTitle != null)
              Text(
                _profile!.jobTitle!,
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            
            // التقييم
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.star, color: Colors.amber),
                SizedBox(width: 8),
                Text(
                  '${_profile!.averageRating.toStringAsFixed(1)}',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                SizedBox(width: 8),
                Text(
                  '(${_profile!.totalRatings} تقييم)',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ],
            ),
            
            // النبذة
            if (_profile!.bio != null)
              Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  _profile!.bio!,
                  style: TextStyle(fontSize: 16),
                ),
              ),
            
            // التخصصات
            if (_profile!.specialties != null && _profile!.specialties!.isNotEmpty)
              Wrap(
                spacing: 8,
                children: _profile!.specialties!
                    .map((s) => Chip(label: Text(s)))
                    .toList(),
              ),
            
            // التقييمات
            Divider(),
            Text(
              'التقييمات',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            _buildRatingsList(),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingsList() {
    // يمكنك استخدام RatingsResponse هنا
    return FutureBuilder<RatingsResponse>(
      future: engineerProfileService.getEngineerRatings(
        engineerId: widget.engineerId,
        limit: 10,
      ),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return CircularProgressIndicator();
        }
        
        if (snapshot.hasError) {
          return Text('فشل جلب التقييمات');
        }
        
        final ratings = snapshot.data?.ratings ?? [];
        
        return ListView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          itemCount: ratings.length,
          itemBuilder: (context, index) {
            final rating = ratings[index];
            return ListTile(
              leading: CircleAvatar(
                child: Text(rating.customerName?[0] ?? 'ع'),
              ),
              title: Text(rating.customerName ?? 'عميل'),
              subtitle: Text(rating.comment),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(
                  5,
                  (i) => Icon(
                    i < rating.score ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 16,
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
```

### مثال 2: تحديث البروفايل

```dart
Future<void> updateProfile() async {
  try {
    final updatedProfile = await engineerProfileService.updateMyProfile(
      bio: 'مهندس محترف مع خبرة واسعة',
      whatsappNumber: '967711234567',
      jobTitle: 'مهندس ميكانيكي',
      specialties: ['ميكانيك', 'كهرباء'],
      yearsOfExperience: 10,
    );
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('تم تحديث البروفايل بنجاح')),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('فشل تحديث البروفايل: $e')),
    );
  }
}
```

---

## 🔍 أكواد الأخطاء الشائعة

| الكود | الرسالة | الوصف |
|------|--------|-------|
| `AUTH_001` | غير مصرح | يجب تسجيل الدخول كمهندس |
| `AUTH_002` | غير مصرح - يجب أن تكون مهندساً | المستخدم ليس مهندساً |
| `GENERAL_004` | خطأ في التحقق من البيانات | بيانات غير صحيحة (validation error) |

---

## 📝 ملاحظات إضافية

### نظام التقييمات المتكامل

- **التقييمات تتزامن تلقائياً**: عند تقييم خدمة، يتم إضافة التقييم تلقائياً إلى بروفايل المهندس
- **منع التكرار**: إذا تم تعديل التقييم، يتم تحديثه بدلاً من إضافة جديد
- **الحساب التلقائي**: يتم حساب `averageRating` و `ratingDistribution` تلقائياً

### نظام الرصيد والعمولات

- **الرصيد**: `walletBalance` يحتوي على الرصيد الحالي للمهندس
- **العمولات**: `commissionTransactions` يحتوي على سجل جميع المعاملات
- **المصدر**: العمولات تأتي من استخدام كوبونات المهندس

### الفصل بين Schemas

- **`User` schema**: بيانات المصادقة والحساب الأساسية
- **`EngineerProfile` schema**: بيانات البروفايل والتقييمات والرصيد
- **لا يؤثر على تسجيل الدخول**: الفصل الكامل يضمن عدم تأثر المصادقة

---

**آخر تحديث:** نوفمبر 2025  
**النسخة:** 1.0.0

