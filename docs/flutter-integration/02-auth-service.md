# 🔐 خدمة المصادقة (Authentication Service)

خدمة المصادقة توفر جميع endpoints المتعلقة بتسجيل الدخول، إدارة الحساب، والصلاحيات **للمستخدمين العاديين والمهندسين والتجار**.

> ✅ **تم التحقق من صحة هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/auth`  
> ⚠️ **هذا الملف للمستخدمين فقط** - endpoints الأدمن موجودة في وثائق منفصلة

---

## 📋 جدول المحتويات

1. [إرسال OTP](#1-إرسال-otp)
2. [التحقق من OTP وتسجيل الدخول](#2-التحقق-من-otp-وتسجيل-الدخول)
3. [تعيين كلمة المرور](#3-تعيين-كلمة-المرور)
4. [نسيت كلمة المرور](#4-نسيت-كلمة-المرور)
5. [إعادة تعيين كلمة المرور](#5-إعادة-تعيين-كلمة-المرور)
6. [الحصول على بيانات المستخدم](#6-الحصول-على-بيانات-المستخدم)
7. [تحديث بيانات المستخدم](#7-تحديث-بيانات-المستخدم)
8. [تحديث العملة المفضلة](#8-تحديث-العملة-المفضلة)
9. [حذف الحساب](#9-حذف-الحساب)
10. [تسجيل الدخول بكلمة المرور (User)](#10-تسجيل-الدخول-بكلمة-المرور-user)
11. [إنشاء حساب جديد بكلمة المرور](#11-إنشاء-حساب-جديد-بكلمة-المرور)
12. [Models في Flutter](#models-في-flutter)

---

## 1. إرسال OTP

يرسل رمز التحقق (OTP) إلى رقم الهاتف.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/auth/send-otp`
- **Auth Required:** ❌ لا

### Request Body

```json
{
  "phone": "777123456",
  "context": "register"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `phone` | `string` | ✅ نعم | رقم الهاتف (9 أرقام بدون 967+) |
| `context` | `string` | ❌ لا | `register` أو `reset` (افتراضي: `register`) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "sent": true,
    "devCode": "123456"
  },
  "requestId": "req_123"
}
```

> **ملاحظة:** `devCode` موجود فقط في بيئة التطوير للاختبار

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "GENERAL_004",
    "message": "خطأ في التحقق من البيانات",
    "details": null,
    "fieldErrors": [
      {
        "field": "phone",
        "message": "رقم الهاتف يجب أن يكون 9 أرقام"
      }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "path": "/api/auth/send-otp"
}
```

> **ملاحظة:** أخطاء الـ Validation تستخدم الكود `GENERAL_004` في النظام الجديد.

### كود Flutter

```dart
Future<Map<String, dynamic>> sendOtp({
  required String phone,
  String context = 'register',
}) async {
  final response = await _dio.post(
    '/auth/send-otp',
    data: {
      'phone': phone,
      'context': context,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (data) => data as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 2. التحقق من OTP وتسجيل الدخول

يتحقق من رمز OTP ويقوم بإنشاء حساب جديد أو تسجيل الدخول.

> 💡 **أنواع الحسابات التي يمكن إنشاؤها:**
> - **Customer (زبون عادي)** - الافتراضي - لا تحتاج `capabilityRequest`
> - **Engineer (مهندس)** - تحتاج `capabilityRequest: "engineer"` + `jobTitle`
> - **Merchant (تاجر)** - تحتاج `capabilityRequest: "merchant"`
> 
> ⚠️ **ملاحظة مهمة:** النوع في `capabilityRequest` هو `"merchant"` (وليس `"wholesale"`)، والحقول في API Response هي `merchantStatus` و `merchant_capable`.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/auth/verify-otp`
- **Auth Required:** ❌ لا

### Request Body

```json
{
  "phone": "777123456",
  "code": "123456",
  "firstName": "أحمد",
  "lastName": "محمد",
  "gender": "male",
  "city": "صنعاء",
  "capabilityRequest": "engineer",
  "jobTitle": "مهندس كهرباء",
  "deviceId": "device_abc123"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `phone` | `string` | ✅ نعم | رقم الهاتف |
| `code` | `string` | ✅ نعم | رمز OTP (6 أرقام) |
| `firstName` | `string` | ❌ لا | الاسم الأول (مطلوب للمستخدمين الجدد) |
| `lastName` | `string` | ❌ لا | اسم العائلة |
| `gender` | `string` | ❌ لا | `male`, `female`, `other` |
| `city` | `string` | ❌ لا | المدينة (افتراضي: صنعاء) |
| `capabilityRequest` | `string` | ❌ لا | `engineer` أو `merchant` |
| `jobTitle` | `string` | ❌ لا | المسمى الوظيفي (مطلوب إذا `capabilityRequest = engineer`) |
| `deviceId` | `string` | ❌ لا | معرف الجهاز (لمزامنة المفضلات تلقائياً) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "me": {
      "id": "64a1b2c3d4e5f6789",
      "phone": "777123456",
      "firstName": "أحمد",
      "lastName": "محمد",
      "gender": "male",
      "city": "صنعاء",
      "jobTitle": "مهندس كهرباء",
      "roles": ["user"],
      "permissions": [],
      "isAdmin": false,
      "preferredCurrency": "USD",
      "status": "active",
      "customerCapable": true,
      "engineerCapable": true,
      "engineerStatus": "unverified",
      "merchantCapable": false,
      "merchantStatus": "none",
      "merchantDiscountPercent": 0,
      "adminCapable": false,
      "adminStatus": "none"
    }
  },
  "requestId": "req_456"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "AUTH_100",
    "message": "رمز التحقق غير صالح",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:31:00.000Z",
  "path": "/api/auth/verify-otp"
}
```

### أكواد الأخطاء

| الكود | الوصف | HTTP Status |
|------|-------|-------------|
| `AUTH_100` | رمز OTP غير صحيح | 401 |
| `AUTH_122` | المسمى الوظيفي مطلوب عند طلب صلاحية مهندس | 400 |
| `GENERAL_004` | خطأ في البيانات المدخلة (Validation) | 400 |

### ⚠️ ملاحظة مهمة عن أنواع الحسابات وحالاتها

#### **أنواع الحسابات الثلاثة:**

1. **Customer (زبون عادي)** - الافتراضي
   - لا تحتاج إرسال `capabilityRequest`
   - الحالة: `engineerStatus: "none"`, `merchantStatus: "none"`
   - يمكنه: تصفح المنتجات، الشراء، إضافة العناوين

2. **Engineer (مهندس)**
   - تحتاج: `capabilityRequest: "engineer"` + `jobTitle`
   - الحالة الأولية: `engineerStatus: "unverified"`
   - يجب رفع السيرة الذاتية → `pending` → موافقة الأدمن → `approved`

3. **Merchant (تاجر)**
   - تحتاج: `capabilityRequest: "merchant"`
   - الحالة الأولية: `merchantStatus: "unverified"`
   - يجب رفع معلومات المحل → `pending` → موافقة الأدمن → `approved`

#### **جدول حالات المهندس/التاجر:**

| الحالة | المعنى | ماذا يجب فعله |
|--------|--------|---------------|
| `none` | مستخدم عادي (customer) | لا شيء - يمكنه الشراء مباشرة |
| `unverified` | طلب الصلاحية لكن لم يرفع الوثائق | **يجب رفع السيرة الذاتية/صورة المحل** |
| `pending` | رفع الوثائق وفي انتظار الموافقة | انتظار موافقة الأدمن |
| `approved` | تمت الموافقة | يمكن استخدام الصلاحية |
| `rejected` | تم الرفض | لا يمكن استخدام الصلاحية |

### أمثلة Flutter

#### مثال 1: تسجيل زبون عادي (Customer)

```dart
// بدون إرسال capabilityRequest = customer عادي
final response = await verifyOtp(
  phone: '777123456',
  code: '123456',
  firstName: 'أحمد',
  lastName: 'محمد',
  gender: 'male',
  city: 'صنعاء',
  // لا نرسل capabilityRequest
);

// الحالة:
print(response.me.engineerStatus);   // "none"
print(response.me.merchantStatus);  // "none"
// المستخدم customer عادي، يمكنه الشراء مباشرة
```

#### مثال 2: تسجيل مهندس

```dart
final response = await verifyOtp(
  phone: '777123456',
  code: '123456',
  firstName: 'أحمد',
  lastName: 'محمد',
  gender: 'male',
  city: 'صنعاء',
  capabilityRequest: 'engineer',  // ✨ طلب صلاحية مهندس
  jobTitle: 'مهندس كهرباء',       // ✨ مطلوب
);

// الحالة:
print(response.me.engineerStatus);   // "unverified" ⚠️
// يجب رفع السيرة الذاتية
if (response.me.isEngineerUnverified) {
  navigateToUploadCV();
}
```

#### مثال 3: تسجيل تاجر

```dart
final response = await verifyOtp(
  phone: '777123456',
  code: '123456',
  firstName: 'أحمد',
  lastName: 'محمد',
  gender: 'male',
  city: 'صنعاء',
  capabilityRequest: 'merchant',  // ✨ طلب صلاحية تاجر
);

// الحالة:
print(response.me.merchantStatus);   // "unverified" ⚠️
// يجب رفع معلومات المحل
if (response.me.isMerchantUnverified) {
  navigateToUploadStoreInfo();
}
```

### كود Flutter الأساسي

```dart
class AuthTokens {
  final String access;
  final String refresh;

  AuthTokens({required this.access, required this.refresh});

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      access: json['access'],
      refresh: json['refresh'],
    );
  }
}

class AuthUser {
  final String id;
  final String phone;
  final String? firstName;
  final String? lastName;
  final String? gender;
  final String? city;
  final String? jobTitle;
  final List<String> roles;
  final List<String> permissions;
  final bool isAdmin;
  final String preferredCurrency;
  final String status;
  final bool customerCapable;
  final bool engineerCapable;
  final String engineerStatus;
  final bool merchantCapable;
  final String merchantStatus;
  final double merchantDiscountPercent;
  final bool adminCapable;
  final String adminStatus;

  AuthUser({
    required this.id, 
    required this.phone,
    this.firstName,
    this.lastName,
    this.gender,
    this.city,
    this.jobTitle,
    this.roles = const [],
    this.permissions = const [],
    this.isAdmin = false,
    required this.preferredCurrency,
    this.status = 'active',
    this.customerCapable = true,
    this.engineerCapable = false,
    this.engineerStatus = 'none',
    this.merchantCapable = false,
    this.merchantStatus = 'none',
    this.merchantDiscountPercent = 0,
    this.adminCapable = false,
    this.adminStatus = 'none',
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'],
      phone: json['phone'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      gender: json['gender'],
      city: json['city'],
      jobTitle: json['jobTitle'],
      roles: json['roles'] != null 
          ? List<String>.from(json['roles']) 
          : [],
      permissions: json['permissions'] != null 
          ? List<String>.from(json['permissions']) 
          : [],
      isAdmin: json['isAdmin'] ?? false,
      preferredCurrency: json['preferredCurrency'] ?? 'USD',
      status: json['status'] ?? 'active',
      customerCapable: json['customerCapable'] ?? true,
      engineerCapable: json['engineerCapable'] ?? false,
      engineerStatus: json['engineerStatus'] ?? 'none',
      merchantCapable: json['merchantCapable'] ?? false,
      merchantStatus: json['merchantStatus'] ?? 'none',
      merchantDiscountPercent: (json['merchantDiscountPercent'] ?? 0).toDouble(),
      adminCapable: json['adminCapable'] ?? false,
      adminStatus: json['adminStatus'] ?? 'none',
    );
  }
  
  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
  
  bool get isEngineerPending => engineerStatus == 'pending';
  bool get isEngineerApproved => engineerStatus == 'approved';
  bool get isEngineerUnverified => engineerStatus == 'unverified';
  
  bool get isMerchantPending => merchantStatus == 'pending';
  bool get isMerchantApproved => merchantStatus == 'approved';
  bool get isMerchantUnverified => merchantStatus == 'unverified';
  
  bool get isActive => status == 'active';
  bool get isSuspended => status == 'suspended';
  bool get isDeleted => status == 'deleted';
  
  bool hasRole(String role) => roles.contains(role);
  bool hasPermission(String permission) => permissions.contains(permission);
}

class LoginResponse {
  final AuthTokens tokens;
  final AuthUser me;

  LoginResponse({required this.tokens, required this.me});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      tokens: AuthTokens.fromJson(json['tokens']),
      me: AuthUser.fromJson(json['me']),
    );
  }
}

Future<LoginResponse> verifyOtp({
  required String phone,
  required String code,
  String? firstName,
  String? lastName,
  String? gender,
  String? city,
  String? capabilityRequest,
  String? jobTitle,
  String? deviceId,
}) async {
  final response = await _dio.post(
    '/auth/verify-otp',
    data: {
      'phone': phone,
      'code': code,
      if (firstName != null) 'firstName': firstName,
      if (lastName != null) 'lastName': lastName,
      if (gender != null) 'gender': gender,
      if (city != null) 'city': city,
      if (capabilityRequest != null) 'capabilityRequest': capabilityRequest,
      if (jobTitle != null) 'jobTitle': jobTitle,
      if (deviceId != null) 'deviceId': deviceId,
    },
  );

  final apiResponse = ApiResponse<LoginResponse>.fromJson(
    response.data,
    (data) => LoginResponse.fromJson(data),
  );

  if (apiResponse.isSuccess) {
    // احفظ التوكنات
    await _saveTokens(apiResponse.data!.tokens);
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}

Future<void> _saveTokens(AuthTokens tokens) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('access_token', tokens.access);
  await prefs.setString('refresh_token', tokens.refresh);
}
```

---

## 3. تعيين كلمة المرور

يسمح للمستخدم بتعيين كلمة مرور لحسابه.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/auth/set-password`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "password": "MySecurePassword123!"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req_789"
}
```

### كود Flutter

```dart
Future<bool> setPassword(String password) async {
  final response = await _dio.post(
    '/auth/set-password',
    data: {'password': password},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (data) => data as Map<String, dynamic>,
  );

  return apiResponse.isSuccess && apiResponse.data!['updated'] == true;
}
```

---

## 4. نسيت كلمة المرور

يرسل OTP لإعادة تعيين كلمة المرور.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/auth/forgot-password`
- **Auth Required:** ❌ لا

### Request Body

```json
{
  "phone": "777123456"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "sent": true,
    "devCode": "123456"
  },
  "requestId": "req_101"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "AUTH_103",
    "message": "المستخدم غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:32:00.000Z",
  "path": "/api/auth/forgot-password"
}
```

### كود Flutter

```dart
Future<Map<String, dynamic>> forgotPassword(String phone) async {
  final response = await _dio.post(
    '/auth/forgot-password',
    data: {'phone': phone},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (data) => data as Map<String, dynamic>,
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 5. إعادة تعيين كلمة المرور

يعيد تعيين كلمة المرور باستخدام OTP.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/auth/reset-password`
- **Auth Required:** ❌ لا

### Request Body

```json
{
  "phone": "777123456",
  "code": "123456",
  "newPassword": "MyNewPassword123!"
}
```

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req_202"
}
```

### كود Flutter

```dart
Future<bool> resetPassword({
  required String phone,
  required String code,
  required String newPassword,
}) async {
  final response = await _dio.post(
    '/auth/reset-password',
    data: {
      'phone': phone,
      'code': code,
      'newPassword': newPassword,
    },
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (data) => data as Map<String, dynamic>,
  );

  return apiResponse.isSuccess && apiResponse.data!['updated'] == true;
}
```

---

## 6. الحصول على بيانات المستخدم

يسترجع بيانات المستخدم الحالي وصلاحياته.

### معلومات الطلب

- **Method:** `GET`
- **Endpoint:** `/auth/me`
- **Auth Required:** ✅ نعم (Bearer Token)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789",
      "phone": "777123456",
      "firstName": "أحمد",
      "lastName": "محمد",
      "gender": "male",
      "city": "صنعاء",
      "jobTitle": "مهندس كهرباء",
      "roles": ["user"],
      "permissions": [],
      "isAdmin": false,
      "preferredCurrency": "USD",
      "status": "active",
      "customerCapable": true,
      "engineerCapable": true,
      "engineerStatus": "pending",
      "merchantCapable": false,
      "merchantStatus": "none",
      "merchantDiscountPercent": 0,
      "adminCapable": false,
      "adminStatus": "none"
    },
    "capabilities": {
      "_id": "cap_123",
      "userId": "64a1b2c3d4e5f6789",
      "customer_capable": true,
      "engineer_capable": true,
      "engineer_status": "pending",
      "merchant_capable": false,
      "merchant_status": "none",
      "merchant_discount_percent": 0
    }
  },
  "requestId": "req_303"
}
```

### كود Flutter

```dart
class User {
  final String id;
  final String phone;
  final String? firstName;
  final String? lastName;
  final String? gender;
  final String? city;
  final String? jobTitle;
  final List<String> roles;
  final List<String> permissions;
  final bool isAdmin;
  final String preferredCurrency;
  final String status;
  final bool customerCapable;
  final bool engineerCapable;
  final String engineerStatus;
  final bool merchantCapable;
  final String merchantStatus;
  final double merchantDiscountPercent;
  final bool adminCapable;
  final String adminStatus;

  User({
    required this.id,
    required this.phone,
    this.firstName,
    this.lastName,
    this.gender,
    this.city,
    this.jobTitle,
    this.roles = const [],
    this.permissions = const [],
    this.isAdmin = false,
    this.preferredCurrency = 'USD',
    this.status = 'active',
    this.customerCapable = true,
    this.engineerCapable = false,
    this.engineerStatus = 'none',
    this.merchantCapable = false,
    this.merchantStatus = 'none',
    this.merchantDiscountPercent = 0,
    this.adminCapable = false,
    this.adminStatus = 'none',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      phone: json['phone'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      gender: json['gender'],
      city: json['city'],
      jobTitle: json['jobTitle'],
      roles: json['roles'] != null 
          ? List<String>.from(json['roles']) 
          : [],
      permissions: json['permissions'] != null 
          ? List<String>.from(json['permissions']) 
          : [],
      isAdmin: json['isAdmin'] ?? false,
      preferredCurrency: json['preferredCurrency'] ?? 'USD',
      status: json['status'] ?? 'active',
      customerCapable: json['customerCapable'] ?? true,
      engineerCapable: json['engineerCapable'] ?? false,
      engineerStatus: json['engineerStatus'] ?? 'none',
      merchantCapable: json['merchantCapable'] ?? false,
      merchantStatus: json['merchantStatus'] ?? 'none',
      merchantDiscountPercent: (json['merchantDiscountPercent'] ?? 0).toDouble(),
      adminCapable: json['adminCapable'] ?? false,
      adminStatus: json['adminStatus'] ?? 'none',
    );
  }
  
  bool get isActive => status == 'active';
  bool get isSuspended => status == 'suspended';
  
  bool get isEngineerPending => engineerStatus == 'pending';
  bool get isEngineerApproved => engineerStatus == 'approved';
  bool get isEngineerUnverified => engineerStatus == 'unverified';
  
  bool get isMerchantPending => merchantStatus == 'pending';
  bool get isMerchantApproved => merchantStatus == 'approved';
  bool get isMerchantUnverified => merchantStatus == 'unverified';
}

class Capabilities {
  final String id;
  final String userId;
  final bool customerCapable;
  final bool engineerCapable;
  final String? engineerStatus; // pending, approved, rejected
  final bool merchantCapable;
  final String? merchantStatus;
  final double merchantDiscountPercent;

  Capabilities({
    required this.id,
    required this.userId,
    required this.customerCapable,
    required this.engineerCapable,
    this.engineerStatus,
    required this.merchantCapable,
    this.merchantStatus,
    required this.merchantDiscountPercent,
  });

  factory Capabilities.fromJson(Map<String, dynamic> json) {
    return Capabilities(
      id: json['_id'],
      userId: json['userId'],
      customerCapable: json['customer_capable'] ?? false,
      engineerCapable: json['engineer_capable'] ?? false,
      engineerStatus: json['engineer_status'],
      merchantCapable: json['merchant_capable'] ?? false,
      merchantStatus: json['merchant_status'],
      merchantDiscountPercent: 
          (json['merchant_discount_percent'] ?? 0).toDouble(),
    );
  }
}

class UserProfile {
  final User user;
  final Capabilities capabilities;

  UserProfile({required this.user, required this.capabilities});

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      user: User.fromJson(json['user']),
      capabilities: Capabilities.fromJson(json['capabilities']),
    );
  }
}

Future<UserProfile> getMe() async {
  final response = await _dio.get('/auth/me');

  final apiResponse = ApiResponse<UserProfile>.fromJson(
    response.data,
    (data) => UserProfile.fromJson(data),
  );

  if (apiResponse.isSuccess) {
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 7. تحديث بيانات المستخدم

يحدث بيانات المستخدم.

### معلومات الطلب

- **Method:** `PATCH`
- **Endpoint:** `/auth/me`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "firstName": "أحمد",
  "lastName": "علي",
  "gender": "male",
  "city": "عدن",
  "jobTitle": "مهندس طاقة شمسية"
}
```

> **ملاحظة:** جميع الحقول اختيارية، أرسل فقط ما تريد تحديثه.

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "req_404"
}
```

### كود Flutter

```dart
Future<bool> updateMe({
  String? firstName,
  String? lastName,
  String? gender,
  String? city,
  String? jobTitle,
}) async {
  final data = <String, dynamic>{};
  if (firstName != null) data['firstName'] = firstName;
  if (lastName != null) data['lastName'] = lastName;
  if (gender != null) data['gender'] = gender;
  if (city != null) data['city'] = city;
  if (jobTitle != null) data['jobTitle'] = jobTitle;

  final response = await _dio.patch('/auth/me', data: data);

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (data) => data as Map<String, dynamic>,
  );

  return apiResponse.isSuccess && apiResponse.data!['updated'] == true;
}
```

---

## 8. تحديث العملة المفضلة

يحدث العملة المفضلة للمستخدم.

### معلومات الطلب

- **Method:** `PATCH`
- **Endpoint:** `/auth/preferred-currency`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "currency": "USD"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `currency` | `string` | ✅ نعم | رمز العملة (مثل USD, EUR, SAR) |

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "updated": true,
    "preferredCurrency": "USD"
  },
  "requestId": "req_606"
}
```

### كود Flutter

```dart
Future<bool> updatePreferredCurrency(String currency) async {
  final response = await _dio.patch(
    '/auth/preferred-currency',
    data: {'currency': currency},
  );

  final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
    response.data,
    (data) => data as Map<String, dynamic>,
  );

  return apiResponse.isSuccess && apiResponse.data!['updated'] == true;
}
```

---

## 9. حذف الحساب

يحذف حساب المستخدم (Soft Delete) مع إدخال السبب.

### معلومات الطلب

- **Method:** `DELETE`
- **Endpoint:** `/auth/me`
- **Auth Required:** ✅ نعم (Bearer Token)

### Request Body

```json
{
  "reason": "لا أستخدم التطبيق بعد الآن"
}
```

**الحقول:**
- `reason` (required, string): سبب حذف الحساب (5-500 حرف)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "message": "تم حذف حسابك بنجاح"
  },
  "requestId": "req_505"
}
```

### Response - خطأ

```json
{
  "success": false,
  "error": {
    "code": "GENERAL_004",
    "message": "خطأ في التحقق من البيانات",
    "details": null,
    "fieldErrors": [
      {
        "field": "reason",
        "message": "يجب أن يكون السبب 5 أحرف على الأقل"
      }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:33:00.000Z",
  "path": "/api/auth/me"
}
```

### كود Flutter

```dart
Future<bool> deleteAccount(String reason) async {
  try {
    final response = await _dio.delete(
      '/auth/me',
      data: {
        'reason': reason,
      },
    );

    final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
      response.data,
      (data) => data as Map<String, dynamic>,
    );

    if (apiResponse.isSuccess && apiResponse.data!['deleted'] == true) {
      // امسح البيانات المحلية
      await _clearLocalData();
      return true;
    }
    return false;
  } catch (e) {
    // معالجة الأخطاء
    print('خطأ في حذف الحساب: $e');
    return false;
  }
}

Future<void> _clearLocalData() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.clear();
}
```

**ملاحظة:** الحذف من نوع Soft Delete، مما يعني أن البيانات يتم حفظها في قاعدة البيانات مع حالة "محذوف" ويمكن استعادتها من قبل الأدمن.

---

## 10. تسجيل الدخول بكلمة المرور (User)

يسمح للمستخدمين (عادي/مهندس/تاجر) بتسجيل الدخول باستخدام رقم الهاتف وكلمة المرور.

> 💡 **ملاحظة:** يرجع الحالة الفعلية للمستخدم (customer/engineer/merchant) حسب ما تم التسجيل به.

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/auth/user-login`
- **Auth Required:** ❌ لا

### Request Body

```json
{
  "phone": "777123456",
  "password": "MyPassword123!"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `phone` | `string` | ✅ نعم | رقم الهاتف (9 أرقام) |
| `password` | `string` | ✅ نعم | كلمة المرور |

### Response - نجاح

#### مثال 1: دخول customer عادي

```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "me": {
      "id": "64a1b2c3d4e5f6789",
      "phone": "777123456",
      "firstName": "أحمد",
      "lastName": "محمد",
      "gender": "male",
      "city": "صنعاء",
      "jobTitle": null,
      "roles": ["user"],
      "permissions": [],
      "isAdmin": false,
      "preferredCurrency": "USD",
      "status": "active",
      "customerCapable": true,
      "engineerCapable": false,
      "engineerStatus": "none",
      "merchantCapable": false,
      "merchantStatus": "none",
      "merchantDiscountPercent": 0,
      "adminCapable": false,
      "adminStatus": "none"
    }
  },
  "requestId": "req_701"
}
```

#### مثال 2: دخول مهندس معتمد

```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "me": {
      "id": "64a1b2c3d4e5f6789",
      "phone": "777123456",
      "firstName": "أحمد",
      "lastName": "محمد",
      "gender": "male",
      "city": "صنعاء",
      "jobTitle": "مهندس كهرباء",
      "roles": ["user", "engineer"],
      "permissions": [],
      "isAdmin": false,
      "preferredCurrency": "USD",
      "status": "active",
      "customerCapable": true,
      "engineerCapable": true,
      "engineerStatus": "approved",
      "merchantCapable": false,
      "merchantStatus": "none",
      "merchantDiscountPercent": 0,
      "adminCapable": false,
      "adminStatus": "none"
    }
  },
  "requestId": "req_701"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "AUTH_104",
    "message": "كلمة المرور غير صحيحة",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:34:00.000Z",
  "path": "/api/auth/user-login"
}
```

### أكواد الأخطاء

| الكود | الوصف | HTTP Status |
|------|-------|-------------|
| `AUTH_104` | كلمة المرور غير صحيحة | 401 |
| `AUTH_125` | كلمة المرور غير محددة | 400 |
| `AUTH_126` | الحساب غير نشط | 400 |

### كود Flutter

```dart
Future<LoginResponse> userLogin({
  required String phone,
  required String password,
}) async {
  final response = await _dio.post(
    '/auth/user-login',
    data: {
      'phone': phone,
      'password': password,
    },
  );

  final apiResponse = ApiResponse<LoginResponse>.fromJson(
    response.data,
    (data) => LoginResponse.fromJson(data),
  );

  if (apiResponse.isSuccess) {
    // احفظ التوكنات
    await _saveTokens(apiResponse.data!.tokens);
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 11. إنشاء حساب جديد بكلمة المرور

يسمح بإنشاء حساب جديد مباشرة باستخدام كلمة مرور (بدون OTP).

> 💡 **أنواع الحسابات:**
> - **Customer (زبون عادي)** - لا تحتاج `capabilityRequest`
> - **Engineer (مهندس)** - تحتاج `capabilityRequest: "engineer"` + `jobTitle`
> - **Merchant (تاجر)** - تحتاج `capabilityRequest: "merchant"`

### معلومات الطلب

- **Method:** `POST`
- **Endpoint:** `/auth/user-signup`
- **Auth Required:** ❌ لا

### Request Body

```json
{
  "phone": "777123456",
  "password": "MyPassword123!",
  "firstName": "أحمد",
  "lastName": "محمد",
  "gender": "male",
  "city": "صنعاء",
  "capabilityRequest": "engineer",
  "jobTitle": "مهندس كهرباء",
  "deviceId": "device_abc123"
}
```

| الحقل | النوع | مطلوب | الوصف |
|------|------|-------|-------|
| `phone` | `string` | ✅ نعم | رقم الهاتف (9 أرقام) |
| `password` | `string` | ✅ نعم | كلمة المرور |
| `firstName` | `string` | ✅ نعم | الاسم الأول |
| `lastName` | `string` | ✅ نعم | اسم العائلة |
| `gender` | `string` | ✅ نعم | `male`, `female`, `other` |
| `city` | `string` | ❌ لا | المدينة (افتراضي: صنعاء) |
| `capabilityRequest` | `string` | ❌ لا | `engineer` أو `merchant` (⚠️ إذا لم ترسل = **customer عادي**) |
| `jobTitle` | `string` | ❌ لا | المسمى الوظيفي (مطلوب إذا `capabilityRequest = engineer`) |
| `deviceId` | `string` | ❌ لا | معرف الجهاز (لمزامنة المفضلات تلقائياً) |

### Response - نجاح

#### مثال 1: تسجيل كـ Customer عادي (بدون capabilityRequest)

```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "me": {
      "id": "64a1b2c3d4e5f6789",
      "phone": "777123456",
      "firstName": "أحمد",
      "lastName": "محمد",
      "gender": "male",
      "city": "صنعاء",
      "jobTitle": null,
      "roles": ["user"],
      "permissions": [],
      "isAdmin": false,
      "preferredCurrency": "USD",
      "status": "active",
      "customerCapable": true,
      "engineerCapable": false,
      "engineerStatus": "none",
      "merchantCapable": false,
      "merchantStatus": "none",
      "merchantDiscountPercent": 0,
      "adminCapable": false,
      "adminStatus": "none"
    }
  },
  "requestId": "req_456"
}
```

#### مثال 2: تسجيل كمهندس (مع capabilityRequest: "engineer")

```json
{
  "success": true,
  "data": {
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "me": {
      "id": "64a1b2c3d4e5f6789",
      "phone": "777123456",
      "firstName": "أحمد",
      "lastName": "محمد",
      "gender": "male",
      "city": "صنعاء",
      "jobTitle": "مهندس كهرباء",
      "roles": ["user"],
      "permissions": [],
      "isAdmin": false,
      "preferredCurrency": "USD",
      "status": "active",
      "customerCapable": true,
      "engineerCapable": true,
      "engineerStatus": "unverified",
      "merchantCapable": false,
      "merchantStatus": "none",
      "merchantDiscountPercent": 0,
      "adminCapable": false,
      "adminStatus": "none"
    }
  },
  "requestId": "req_801"
}
```

### Response - فشل

```json
{
  "success": false,
  "error": {
    "code": "AUTH_128",
    "message": "رقم الهاتف موجود مسبقاً",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2023-12-01T10:35:00.000Z",
  "path": "/api/auth/user-signup"
}
```

### أكواد الأخطاء

| الكود | الوصف | HTTP Status |
|------|-------|-------------|
| `AUTH_128` | رقم الهاتف موجود مسبقاً | 409 |
| `AUTH_122` | المسمى الوظيفي مطلوب عند طلب صلاحية مهندس | 400 |
| `GENERAL_004` | خطأ في البيانات المدخلة (Validation) | 400 |

### ⚠️ ملاحظة مهمة عن أنواع الحسابات

#### **1. Customer (زبون عادي) - الافتراضي:**
```dart
// لا تحتاج إرسال capabilityRequest
final response = await userSignup(
  phone: '777123456',
  password: 'MyPassword123!',
  firstName: 'أحمد',
  lastName: 'محمد',
  gender: 'male',
  // لا نرسل capabilityRequest
);
// النتيجة: customer عادي يمكنه الشراء مباشرة
```

#### **2. Engineer (مهندس):**
```dart
final response = await userSignup(
  phone: '777123456',
  password: 'MyPassword123!',
  firstName: 'أحمد',
  lastName: 'محمد',
  gender: 'male',
  capabilityRequest: 'engineer',    // ✨ طلب صلاحية مهندس
  jobTitle: 'مهندس كهرباء',         // ✨ مطلوب
);
// النتيجة: engineerStatus = "unverified" - يجب رفع CV
if (response.me.isEngineerUnverified) {
  navigateToUploadCV();
}
```

#### **3. Merchant (تاجر):**
```dart
final response = await userSignup(
  phone: '777123456',
  password: 'MyPassword123!',
  firstName: 'أحمد',
  lastName: 'محمد',
  gender: 'male',
  capabilityRequest: 'merchant',    // ✨ طلب صلاحية تاجر
);
// النتيجة: merchantStatus = "unverified" - يجب رفع معلومات المحل
if (response.me.isMerchantUnverified) {
  navigateToUploadStoreInfo();
}
```

### كود Flutter

```dart
Future<LoginResponse> userSignup({
  required String phone,
  required String password,
  required String firstName,
  required String lastName,
  required String gender,
  String? city,
  String? capabilityRequest,
  String? jobTitle,
  String? deviceId,
}) async {
  final response = await _dio.post(
    '/auth/user-signup',
    data: {
      'phone': phone,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'gender': gender,
      if (city != null) 'city': city,
      if (capabilityRequest != null) 'capabilityRequest': capabilityRequest,
      if (jobTitle != null) 'jobTitle': jobTitle,
      if (deviceId != null) 'deviceId': deviceId,
    },
  );

  final apiResponse = ApiResponse<LoginResponse>.fromJson(
    response.data,
    (data) => LoginResponse.fromJson(data),
  );

  if (apiResponse.isSuccess) {
    // احفظ التوكنات
    await _saveTokens(apiResponse.data!.tokens);
    return apiResponse.data!;
  } else {
    throw ApiException(apiResponse.error!);
  }
}
```

---

## 12. Models في Flutter

### ملف: `lib/models/auth/auth_models.dart`

```dart
class AuthTokens {
  final String access;
  final String refresh;

  AuthTokens({required this.access, required this.refresh});

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      access: json['access'],
      refresh: json['refresh'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access': access,
      'refresh': refresh,
    };
  }
}

class User {
  final String id;
  final String phone;
  final String? firstName;
  final String? lastName;
  final String? gender;
  final String? city;
  final String? jobTitle;
  final List<String> roles;
  final List<String> permissions;
  final bool isAdmin;
  final String preferredCurrency;
  final String status;
  final bool customerCapable;
  final bool engineerCapable;
  final String engineerStatus;
  final bool merchantCapable;
  final String merchantStatus;
  final double merchantDiscountPercent;
  final bool adminCapable;
  final String adminStatus;

  User({
    required this.id,
    required this.phone,
    this.firstName,
    this.lastName,
    this.gender,
    this.city,
    this.jobTitle,
    this.roles = const [],
    this.permissions = const [],
    this.isAdmin = false,
    this.preferredCurrency = 'USD',
    this.status = 'active',
    this.customerCapable = true,
    this.engineerCapable = false,
    this.engineerStatus = 'none',
    this.merchantCapable = false,
    this.merchantStatus = 'none',
    this.merchantDiscountPercent = 0,
    this.adminCapable = false,
    this.adminStatus = 'none',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      phone: json['phone'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      gender: json['gender'],
      city: json['city'],
      jobTitle: json['jobTitle'],
      roles: json['roles'] != null 
          ? List<String>.from(json['roles']) 
          : [],
      permissions: json['permissions'] != null 
          ? List<String>.from(json['permissions']) 
          : [],
      isAdmin: json['isAdmin'] ?? false,
      preferredCurrency: json['preferredCurrency'] ?? 'USD',
      status: json['status'] ?? 'active',
      customerCapable: json['customerCapable'] ?? true,
      engineerCapable: json['engineerCapable'] ?? false,
      engineerStatus: json['engineerStatus'] ?? 'none',
      merchantCapable: json['merchantCapable'] ?? false,
      merchantStatus: json['merchantStatus'] ?? 'none',
      merchantDiscountPercent: (json['merchantDiscountPercent'] ?? 0).toDouble(),
      adminCapable: json['adminCapable'] ?? false,
      adminStatus: json['adminStatus'] ?? 'none',
    );
  }

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
  
  bool get isActive => status == 'active';
  bool get isSuspended => status == 'suspended';
  bool get isDeleted => status == 'deleted';
  
  bool get isEngineerPending => engineerStatus == 'pending';
  bool get isEngineerApproved => engineerStatus == 'approved';
  bool get isEngineerUnverified => engineerStatus == 'unverified';
  
  bool get isMerchantPending => merchantStatus == 'pending';
  bool get isMerchantApproved => merchantStatus == 'approved';
  bool get isMerchantUnverified => merchantStatus == 'unverified';
  
  bool hasRole(String role) => roles.contains(role);
  bool hasPermission(String permission) => permissions.contains(permission);
}

class Capabilities {
  final String id;
  final String userId;
  final bool customerCapable;
  final bool engineerCapable;
  final String? engineerStatus;
  final bool merchantCapable;
  final String? merchantStatus;
  final double merchantDiscountPercent;

  Capabilities({
    required this.id,
    required this.userId,
    required this.customerCapable,
    required this.engineerCapable,
    this.engineerStatus,
    required this.merchantCapable,
    this.merchantStatus,
    required this.merchantDiscountPercent,
  });

  factory Capabilities.fromJson(Map<String, dynamic> json) {
    return Capabilities(
      id: json['_id'],
      userId: json['userId'],
      customerCapable: json['customer_capable'] ?? false,
      engineerCapable: json['engineer_capable'] ?? false,
      engineerStatus: json['engineer_status'],
      merchantCapable: json['merchant_capable'] ?? false,
      merchantStatus: json['merchant_status'],
      merchantDiscountPercent:
          (json['merchant_discount_percent'] ?? 0).toDouble(),
    );
  }

  bool get isEngineerApproved => 
      engineerCapable && engineerStatus == 'approved';
  bool get isEngineerPending => engineerStatus == 'pending';
  bool get isMerchantApproved => 
      merchantCapable && merchantStatus == 'approved';
}

class UserProfile {
  final User user;
  final Capabilities capabilities;

  UserProfile({required this.user, required this.capabilities});

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      user: User.fromJson(json['user']),
      capabilities: Capabilities.fromJson(json['capabilities']),
    );
  }
}

class LoginResponse {
  final AuthTokens tokens;
  final AuthUser me;

  LoginResponse({required this.tokens, required this.me});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      tokens: AuthTokens.fromJson(json['tokens']),
      me: AuthUser.fromJson(json['me']),
    );
  }
}

class AuthUser {
  final String id;
  final String phone;
  final String? firstName;
  final String? lastName;
  final String? gender;
  final String? city;
  final String? jobTitle;
  final List<String> roles;
  final List<String> permissions;
  final bool isAdmin;
  final String preferredCurrency;
  final String status;
  final bool customerCapable;
  final bool engineerCapable;
  final String engineerStatus;
  final bool merchantCapable;
  final String merchantStatus;
  final double merchantDiscountPercent;
  final bool adminCapable;
  final String adminStatus;

  AuthUser({
    required this.id, 
    required this.phone,
    this.firstName,
    this.lastName,
    this.gender,
    this.city,
    this.jobTitle,
    this.roles = const [],
    this.permissions = const [],
    this.isAdmin = false,
    required this.preferredCurrency,
    this.status = 'active',
    this.customerCapable = true,
    this.engineerCapable = false,
    this.engineerStatus = 'none',
    this.merchantCapable = false,
    this.merchantStatus = 'none',
    this.merchantDiscountPercent = 0,
    this.adminCapable = false,
    this.adminStatus = 'none',
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'],
      phone: json['phone'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      gender: json['gender'],
      city: json['city'],
      jobTitle: json['jobTitle'],
      roles: json['roles'] != null 
          ? List<String>.from(json['roles']) 
          : [],
      permissions: json['permissions'] != null 
          ? List<String>.from(json['permissions']) 
          : [],
      isAdmin: json['isAdmin'] ?? false,
      preferredCurrency: json['preferredCurrency'] ?? 'USD',
      status: json['status'] ?? 'active',
      customerCapable: json['customerCapable'] ?? true,
      engineerCapable: json['engineerCapable'] ?? false,
      engineerStatus: json['engineerStatus'] ?? 'none',
      merchantCapable: json['merchantCapable'] ?? false,
      merchantStatus: json['merchantStatus'] ?? 'none',
      merchantDiscountPercent: (json['merchantDiscountPercent'] ?? 0).toDouble(),
      adminCapable: json['adminCapable'] ?? false,
      adminStatus: json['adminStatus'] ?? 'none',
    );
  }
  
  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
  
  bool get isActive => status == 'active';
  bool get isSuspended => status == 'suspended';
  bool get isDeleted => status == 'deleted';
  
  bool get isEngineerPending => engineerStatus == 'pending';
  bool get isEngineerApproved => engineerStatus == 'approved';
  bool get isEngineerUnverified => engineerStatus == 'unverified';
  
  bool get isMerchantPending => merchantStatus == 'pending';
  bool get isMerchantApproved => merchantStatus == 'approved';
  bool get isMerchantUnverified => merchantStatus == 'unverified';
  
  bool hasRole(String role) => roles.contains(role);
  bool hasPermission(String permission) => permissions.contains(permission);
}
```

---

## 📝 ملاحظات مهمة

1. **التوكنات:**
   - Access Token صالح لمدة 8 ساعات
   - Refresh Token صالح لمدة 30 يوم
   - احفظهما في `SharedPreferences` أو `FlutterSecureStorage`

2. **OTP في التطوير:**
   - في بيئة التطوير، يتم إرجاع `devCode` للاختبار
   - في Production، لن يكون موجوداً

3. **المدينة (City):**
   - حقل المدينة مهم للمهندسين وطلبات الخدمات
   - القيمة الافتراضية: "صنعاء"
   - يمكن تحديثها عبر endpoint `/auth/me`

4. **مزامنة المفضلات:**
   - عند تسجيل الدخول، أرسل `deviceId` لمزامنة المفضلات تلقائياً
   - استخدم `device_info_plus` للحصول على Device ID

5. **أنواع الحسابات:**
   - **Customer (زبون عادي):** النوع الافتراضي - لا يحتاج `capabilityRequest`
   - **Engineer (مهندس):** يحتاج `capabilityRequest: "engineer"` + `jobTitle`
   - **Merchant (تاجر):** يحتاج `capabilityRequest: "merchant"`

6. **حالة الحساب (status):**
   - `active`: حساب نشط ويمكن استخدامه ✅
   - `suspended`: حساب موقوف مؤقتاً من قبل الأدمن ⚠️
   - `pending`: في انتظار تفعيل ⏳
   - `deleted`: تم حذف الحساب ❌

7. **حقول الصلاحيات (Capability Fields):**
   - **`customerCapable`**: هل المستخدم قادر على الشراء كزبون (افتراضي: true)
   - **`engineerCapable`** + **`engineerStatus`**: صلاحية المهندس وحالة التوثيق
   - **`merchantCapable`** + **`merchantStatus`** + **`merchantDiscountPercent`**: صلاحية التاجر وحالة التوثيق ونسبة الخصم
   - **`adminCapable`** + **`adminStatus`**: صلاحية الأدمن وحالة التوثيق

8. **حالات المهندس/التاجر (engineerStatus / merchantStatus):**
   - `none`: مستخدم عادي (customer)
   - `unverified`: طلب الصلاحية عند التسجيل لكن لم يرفع الوثائق ⚠️
   - `pending`: رفع الوثائق وفي انتظار موافقة الأدمن ⏳
   - `approved`: تمت الموافقة ✅
   - `rejected`: تم الرفض ❌

9. **العملة المفضلة:**
   - كل مستخدم لديه عملة مفضلة (افتراضي: USD)
   - يمكن تحديثها عبر endpoint `/auth/preferred-currency`
   - يتم إرجاعها في استجابة تسجيل الدخول

10. **كيفية استخدام حالات المهندس/التاجر في Flutter:**
   ```dart
   // بعد تسجيل الدخول
   final loginResponse = await verifyOtp(...);
   
   // 1. Customer عادي
   if (loginResponse.me.engineerStatus == 'none' && 
       loginResponse.me.merchantStatus == 'none') {
     // مستخدم عادي - يمكنه الشراء مباشرة
     navigateToHome();
   }
   
   // 2. مهندس
   if (loginResponse.me.isEngineerUnverified) {
     // يجب رفع السيرة الذاتية
     showDialog('يرجى رفع السيرة الذاتية لإكمال التسجيل كمهندس');
     navigateToUploadCV();
   } else if (loginResponse.me.isEngineerPending) {
     // في انتظار الموافقة
     showDialog('طلبك قيد المراجعة من قبل الإدارة');
   } else if (loginResponse.me.isEngineerApproved) {
     // تمت الموافقة
     navigateToEngineerDashboard();
   }
   
   // 3. تاجر
   if (loginResponse.me.isMerchantUnverified) {
     navigateToUploadStoreInfo();
   } else if (loginResponse.me.isMerchantApproved) {
     navigateToMerchantDashboard();
   }
   ```

---

## 📝 ملاحظات التحديث

> ✅ **تم تحديث هذه الوثيقة بالكامل** لتطابق الكود الفعلي

### التحديثات المضافة في هذه النسخة:
1. ✅ **تحديث أكواد الأخطاء** - استخدام النظام الجديد (AUTH_100، AUTH_103، إلخ)
2. ✅ **إضافة endpoints جديدة:**
   - `/auth/user-login` - تسجيل دخول المستخدمين بكلمة المرور
   - `/auth/user-signup` - إنشاء حساب جديد بكلمة المرور
3. ✅ **توضيح أنواع الحسابات الثلاثة:**
   - **Customer (زبون عادي)** - النوع الافتراضي عند عدم إرسال `capabilityRequest`
   - **Engineer (مهندس)** - يحتاج `capabilityRequest: "engineer"` + `jobTitle`
   - **Merchant (تاجر)** - يحتاج `capabilityRequest: "merchant"`
4. ✅ **إضافة حقل `city` (المدينة):**
   - أضيف في `VerifyOtpDto` و `UserSignupDto`
   - يُحفظ في User Schema (افتراضي: صنعاء)
   - يظهر في `/auth/me` ويمكن تحديثه
5. ✅ **إضافة `timestamp` و `path`** في جميع أمثلة الأخطاء
6. ✅ **تحديث Flutter code examples** بأكواد الأخطاء الجديدة
7. ✅ **تصحيح مدة صلاحية Access Token** - 8 ساعات (كان 15 دقيقة)
8. ✅ **إضافة حقول حالة المهندس/التاجر في جميع Login/Signup Responses:**
   - `engineerStatus` - حالة المهندس (none/unverified/pending/approved/rejected)
   - `merchantStatus` - حالة التاجر/المتجر (none/unverified/pending/approved/rejected)
9. ✅ **إضافة أمثلة واضحة للأنواع الثلاثة:**
   - مثال Customer عادي (engineerStatus: "none", merchantStatus: "none")
   - مثال Engineer (engineerStatus: "unverified/approved")
   - مثال Merchant (merchantStatus: "unverified/approved")
10. ✅ **إضافة أخطاء جديدة:**
   - `AUTH_125` - كلمة المرور غير محددة
   - `AUTH_126` - الحساب غير نشط
   - `AUTH_128` - رقم الهاتف موجود مسبقاً
11. ✅ تحديث `VALIDATION_ERROR` إلى `GENERAL_004`
12. ✅ **حذف endpoints الأدمن** - هذا الملف للمستخدمين والتجار والمهندسين فقط
13. ✅ **تحديث نوع capabilityRequest والتسميات** - تم تغيير `"wholesale"` إلى `"merchant"` في جميع endpoints والحقول (`merchantStatus`, `merchant_capable`, `merchant_discount_percent`)
14. ✅ **إضافة حقول الحالة والصلاحيات الكاملة في جميع responses:**
   - `status` - حالة الحساب (active/suspended/pending/deleted)
   - `customerCapable` - قدرة المستخدم كزبون
   - `engineerCapable` - قدرة المستخدم كمهندس
   - `merchantCapable` - قدرة المستخدم كتاجر
   - `merchantDiscountPercent` - نسبة خصم التاجر
   - `adminCapable` - قدرة المستخدم كأدمن
   - `adminStatus` - حالة توثيق الأدمن
15. ✅ **تحديث Flutter Models** لتشمل جميع الحقول الجديدة مع getter methods لسهولة الاستخدام:
   - `isActive`, `isSuspended`, `isDeleted` - للتحقق من حالة الحساب
   - `isEngineerPending`, `isEngineerApproved`, `isEngineerUnverified` - للتحقق من حالة المهندس
   - `isMerchantPending`, `isMerchantApproved`, `isMerchantUnverified` - للتحقق من حالة التاجر

### الملفات المرجعية:
- **Controller:** `backend/src/modules/auth/auth.controller.ts`
- **DTOs:** `backend/src/modules/auth/dto/*.dto.ts`
- **Models:** `backend/src/modules/users/schemas/user.schema.ts`

---

**التالي:** [خدمة المنتجات (Products)](./03-products-service.md)

