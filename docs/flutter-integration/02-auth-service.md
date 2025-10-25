# 🔐 خدمة المصادقة (Authentication Service)

خدمة المصادقة توفر جميع endpoints المتعلقة بتسجيل الدخول، إدارة الحساب، والصلاحيات.

> ✅ **تم التحقق من صحة هذه الوثيقة** - مطابقة للكود الفعلي في `backend/src/modules/auth`

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
10. [Models في Flutter](#models-في-flutter)

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
    "code": "VALIDATION_ERROR",
    "message": "خطأ في البيانات المدخلة",
    "details": null,
    "fieldErrors": [
      {
        "field": "phone",
        "message": "رقم الهاتف يجب أن يكون 9 أرقام"
      }
    ]
  },
  "requestId": "req_123"
}
```

> **ملاحظة:** أخطاء الـ Validation قد تأتي من NestJS ValidationPipe مباشرة وقد يختلف شكلها قليلاً عن الهيكل الموحد.

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
| `capabilityRequest` | `string` | ❌ لا | `engineer` أو `wholesale` |
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
      "preferredCurrency": "USD"
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
    "code": "AUTH_INVALID_OTP",
    "message": "رمز التحقق غير صالح",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_456"
}
```

### أكواد الأخطاء

| الكود | الوصف | HTTP Status |
|------|-------|-------------|
| `AUTH_INVALID_OTP` | رمز OTP غير صحيح | 401 |
| `AUTH_JOB_TITLE_REQUIRED` | المسمى الوظيفي مطلوب عند طلب صلاحية مهندس | 400 |
| `VALIDATION_ERROR` | خطأ في البيانات المدخلة | 400 |

### كود Flutter

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
  final String preferredCurrency;

  AuthUser({
    required this.id, 
    required this.phone,
    required this.preferredCurrency,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'],
      phone: json['phone'],
      preferredCurrency: json['preferredCurrency'] ?? 'USD',
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

Future<LoginResponse> verifyOtp({
  required String phone,
  required String code,
  String? firstName,
  String? lastName,
  String? gender,
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
    "code": "AUTH_USER_NOT_FOUND",
    "message": "المستخدم غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_101"
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
      "jobTitle": "مهندس كهرباء",
      "roles": ["customer"],
      "permissions": [],
      "isAdmin": false
    },
    "capabilities": {
      "_id": "cap_123",
      "userId": "64a1b2c3d4e5f6789",
      "customer_capable": true,
      "engineer_capable": false,
      "engineer_status": "pending",
      "wholesale_capable": false,
      "wholesale_status": null,
      "wholesale_discount_percent": 0
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
  final String? jobTitle;
  final List<String> roles;
  final List<String> permissions;
  final bool isAdmin;

  User({
    required this.id,
    required this.phone,
    this.firstName,
    this.lastName,
    this.gender,
    this.jobTitle,
    this.roles = const [],
    this.permissions = const [],
    required this.isAdmin,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      phone: json['phone'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      gender: json['gender'],
      jobTitle: json['jobTitle'],
      roles: json['roles'] != null 
          ? List<String>.from(json['roles']) 
          : [],
      permissions: json['permissions'] != null 
          ? List<String>.from(json['permissions']) 
          : [],
      isAdmin: json['isAdmin'] ?? false,
    );
  }
}

class Capabilities {
  final String id;
  final String userId;
  final bool customerCapable;
  final bool engineerCapable;
  final String? engineerStatus; // pending, approved, rejected
  final bool wholesaleCapable;
  final String? wholesaleStatus;
  final double wholesaleDiscountPercent;

  Capabilities({
    required this.id,
    required this.userId,
    required this.customerCapable,
    required this.engineerCapable,
    this.engineerStatus,
    required this.wholesaleCapable,
    this.wholesaleStatus,
    required this.wholesaleDiscountPercent,
  });

  factory Capabilities.fromJson(Map<String, dynamic> json) {
    return Capabilities(
      id: json['_id'],
      userId: json['userId'],
      customerCapable: json['customer_capable'] ?? false,
      engineerCapable: json['engineer_capable'] ?? false,
      engineerStatus: json['engineer_status'],
      wholesaleCapable: json['wholesale_capable'] ?? false,
      wholesaleStatus: json['wholesale_status'],
      wholesaleDiscountPercent: 
          (json['wholesale_discount_percent'] ?? 0).toDouble(),
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
  String? jobTitle,
}) async {
  final data = <String, dynamic>{};
  if (firstName != null) data['firstName'] = firstName;
  if (lastName != null) data['lastName'] = lastName;
  if (gender != null) data['gender'] = gender;
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

يحذف حساب المستخدم نهائياً.

### معلومات الطلب

- **Method:** `DELETE`
- **Endpoint:** `/auth/me`
- **Auth Required:** ✅ نعم (Bearer Token)

### Response - نجاح

```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "requestId": "req_505"
}
```

### كود Flutter

```dart
Future<bool> deleteAccount() async {
  final response = await _dio.delete('/auth/me');

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
}

Future<void> _clearLocalData() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.clear();
}
```

---

## Models في Flutter

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
  final String? jobTitle;
  final List<String> roles;
  final List<String> permissions;
  final bool isAdmin;

  User({
    required this.id,
    required this.phone,
    this.firstName,
    this.lastName,
    this.gender,
    this.jobTitle,
    this.roles = const [],
    this.permissions = const [],
    required this.isAdmin,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      phone: json['phone'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      gender: json['gender'],
      jobTitle: json['jobTitle'],
      roles: json['roles'] != null 
          ? List<String>.from(json['roles']) 
          : [],
      permissions: json['permissions'] != null 
          ? List<String>.from(json['permissions']) 
          : [],
      isAdmin: json['isAdmin'] ?? false,
    );
  }

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
  
  bool hasRole(String role) => roles.contains(role);
  bool hasPermission(String permission) => permissions.contains(permission);
}

class Capabilities {
  final String id;
  final String userId;
  final bool customerCapable;
  final bool engineerCapable;
  final String? engineerStatus;
  final bool wholesaleCapable;
  final String? wholesaleStatus;
  final double wholesaleDiscountPercent;

  Capabilities({
    required this.id,
    required this.userId,
    required this.customerCapable,
    required this.engineerCapable,
    this.engineerStatus,
    required this.wholesaleCapable,
    this.wholesaleStatus,
    required this.wholesaleDiscountPercent,
  });

  factory Capabilities.fromJson(Map<String, dynamic> json) {
    return Capabilities(
      id: json['_id'],
      userId: json['userId'],
      customerCapable: json['customer_capable'] ?? false,
      engineerCapable: json['engineer_capable'] ?? false,
      engineerStatus: json['engineer_status'],
      wholesaleCapable: json['wholesale_capable'] ?? false,
      wholesaleStatus: json['wholesale_status'],
      wholesaleDiscountPercent:
          (json['wholesale_discount_percent'] ?? 0).toDouble(),
    );
  }

  bool get isEngineerApproved => 
      engineerCapable && engineerStatus == 'approved';
  bool get isEngineerPending => engineerStatus == 'pending';
  bool get isWholesaleApproved => 
      wholesaleCapable && wholesaleStatus == 'approved';
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
  final String preferredCurrency;

  AuthUser({
    required this.id, 
    required this.phone,
    required this.preferredCurrency,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'],
      phone: json['phone'],
      preferredCurrency: json['preferredCurrency'] ?? 'USD',
    );
  }
}
```

---

## 📝 ملاحظات مهمة

1. **التوكنات:**
   - Access Token صالح لمدة 15 دقيقة
   - Refresh Token صالح لمدة 30 يوم (تم تحديثه من 7 أيام)
   - احفظهما في `SharedPreferences` أو `FlutterSecureStorage`

2. **OTP في التطوير:**
   - في بيئة التطوير، يتم إرجاع `devCode` للاختبار
   - في Production، لن يكون موجوداً

3. **مزامنة المفضلات:**
   - عند تسجيل الدخول، أرسل `deviceId` لمزامنة المفضلات تلقائياً
   - استخدم `device_info_plus` للحصول على Device ID

4. **الصلاحيات:**
   - `customer_capable`: زبون عادي (افتراضي)
   - `engineer_capable`: مهندس (يحتاج موافقة الأدمن)
   - `wholesale_capable`: تاجر جملة (يحتاج موافقة الأدمن)

5. **العملة المفضلة:**
   - كل مستخدم لديه عملة مفضلة (افتراضي: USD)
   - يمكن تحديثها عبر endpoint `/auth/preferred-currency`
   - يتم إرجاعها في استجابة تسجيل الدخول


---

## 📝 ملاحظات التحديث

> ✅ **تم تحديث هذه الوثيقة** لتطابق الكود الفعلي

### التحديثات المضافة:
1. ✅ إضافة `roles` و `permissions` في User object
2. ✅ تحديث Flutter Models لتتضمن roles و permissions
3. ✅ إضافة helper methods: `hasRole()` و `hasPermission()`
4. ✅ إضافة HTTP Status Codes للأخطاء
5. ✅ توضيح ملاحظة عن VALIDATION_ERROR

### الملفات المرجعية:
- **Controller:** `backend/src/modules/auth/auth.controller.ts`
- **DTOs:** `backend/src/modules/auth/dto/*.dto.ts`
- **Models:** `backend/src/modules/users/schemas/user.schema.ts`

---

**التالي:** [خدمة المنتجات (Products)](./03-products-service.md)

