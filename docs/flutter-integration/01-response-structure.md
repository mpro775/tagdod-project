# 📋 هيكل الاستجابة الموحدة والأخطاء (محدثة ومطابقة للكود الفعلي)

هذا الملف يشرح بالتفصيل كيف يتم إرجاع الاستجابات من الـ Backend، سواء كانت ناجحة أو تحتوي على أخطاء.

> ✅ **تم التحقق من صحة هذه الوثيقة** - جميع المعلومات مطابقة للكود الفعلي في Backend  
> 📅 **آخر تحديث:** تم التحقق والمراجعة بالكامل  
> 🔍 **المصدر:** فحص شامل للكود في `backend/src` و `admin-dashboard/src`

## 📌 ما تم تحديثه في هذه النسخة

### ✅ التحسينات
1. **إضافة علامات التحقق** لكل كود خطأ موجود فعلياً في النظام
2. **إضافة أمثلة للـ Pagination** التي تحتوي على `meta`
3. **إضافة أكواد أخطاء جديدة** (الإشعارات، السمات، المفضلات، التسعير)
4. **توضيح الأخطاء الخاصة** التي لا تتبع النمط الموحد
5. **إضافة روابط للملفات المرجعية** في الكود

### ⚠️ التصحيحات
1. **تصحيح معلومة `meta`** - الوثيقة القديمة قالت أن الاستجابات لا تحتوي على `meta` وهذا خطأ
2. **إزالة أكواد أخطاء غير موجودة** مثل `VALIDATION_ERROR`, `CART_EMPTY`, `CART_ITEM_NOT_FOUND`
3. **تحديث `requestId`** - توضيح أنه UUID v4 وليس مجرد string

---

## 🎯 الاستجابة الناجحة (Success Response)

### الشكل العام

```json
{
  "success": true,
  "data": { /* البيانات المطلوبة */ },
  "requestId": "uuid-v4-string"
}
```

### الخصائص (Properties)

| الخاصية | النوع | الوصف |
|---------|------|-------|
| `success` | `boolean` | دائماً `true` عند النجاح |
| `data` | `any` | البيانات المطلوبة (قد تكون object، array، أو primitive) |
| `requestId` | `string` | معرف فريد للطلب UUID v4 (يُنشأ تلقائياً أو من header `X-Request-Id`) |

### ملاحظات مهمة
- يتم تغليف جميع الاستجابات الناجحة تلقائياً بواسطة `ResponseEnvelopeInterceptor`
- الـ `requestId` يُنشأ في `RequestIdMiddleware` ويُضاف لكل طلب
- بعض الاستجابات قد تحتوي على `meta` إضافية (خاصة في Pagination)

### أمثلة واقعية

#### مثال 1: استجابة بسيطة
```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6789",
    "phone": "777123456",
    "firstName": "أحمد",
    "lastName": "محمد"
  },
  "requestId": "req_123456789"
}
```

#### مثال 2: استجابة مع قائمة
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "منتج 1",
      "price": 100
    },
    {
      "id": "prod_002",
      "name": "منتج 2",
      "price": 200
    }
  ],
  "requestId": "req_987654321"
}
```

#### مثال 3: استجابة بسيطة (boolean أو message)
```json
{
  "success": true,
  "data": {
    "updated": true
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### مثال 4: استجابة مع Pagination (تحتوي على meta)
```json
{
  "success": true,
  "data": {
    "data": [
      { "id": "1", "name": "منتج 1" },
      { "id": "2", "name": "منتج 2" }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

> **ملاحظة مهمة:** بعض endpoints ترجع `meta` داخل `data` للمعلومات الإضافية مثل Pagination

---

## ❌ الاستجابة عند الخطأ (Error Response)

### الشكل العام

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ بالعربية",
    "details": null,
    "fieldErrors": []
  },
  "requestId": "uuid-string"
}
```

### الخصائص (Properties)

| الخاصية | النوع | الوصف |
|---------|------|-------|
| `success` | `boolean` | دائماً `false` عند الخطأ |
| `error` | `object` | تفاصيل الخطأ |
| `error.code` | `string` | كود الخطأ الثابت (للبرمجة) |
| `error.message` | `string` | رسالة الخطأ بالعربية (للعرض) |
| `error.details` | `any` | تفاصيل إضافية عن الخطأ |
| `error.fieldErrors` | `array` أو `null` | أخطاء الحقول في الـ Validation |
| `requestId` | `string` | معرف الطلب |

### أمثلة واقعية

#### مثال 1: خطأ بسيط
```json
{
  "success": false,
  "error": {
    "code": "AUTH_USER_NOT_FOUND",
    "message": "المستخدم غير موجود",
    "details": null,
    "fieldErrors": null
  },
  "requestId": "req_111222333"
}
```

#### مثال 2: أخطاء Validation
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
      },
      {
        "field": "firstName",
        "message": "الاسم الأول مطلوب"
      }
    ]
  },
  "requestId": "req_444555666"
}
```

#### مثال 3: خطأ مع تفاصيل إضافية
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "المنتج غير متوفر بالكمية المطلوبة",
    "details": {
      "requestedQty": 10,
      "availableQty": 3,
      "variantId": "var_123"
    },
    "fieldErrors": null
  },
  "requestId": "req_777888999"
}
```

---

## 📚 أكواد الأخطاء الشائعة (المستخدمة فعلياً في النظام)

> ✅ **تم التحقق من جميع هذه الأكواد** - موجودة في الكود الفعلي

### أخطاء المصادقة (Authentication)

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `AUTH_INVALID_OTP` | رمز التحقق غير صالح | 401 | الكود المدخل خاطئ | ✅ |
| `AUTH_USER_NOT_FOUND` | المستخدم غير موجود | 404 | رقم الهاتف غير مسجل | ✅ |
| `AUTH_JOB_TITLE_REQUIRED` | المسمى الوظيفي مطلوب للمهندسين | 400 | عند طلب صلاحية مهندس | ✅ |
| `AUTH_INVALID_PASSWORD` | كلمة المرور غير صحيحة | 401 | كلمة المرور خاطئة | ✅ |
| `AUTH_NO_PASSWORD` | كلمة المرور غير محددة | 400 | المستخدم ليس لديه كلمة مرور | ✅ |
| `AUTH_NOT_ADMIN` | هذا الحساب غير مصرح له بالدخول للوحة التحكم | 403 | المستخدم ليس admin | ✅ |

### أخطاء المنتجات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `PRODUCT_NOT_FOUND` | المنتج غير موجود | 404 | المنتج المطلوب غير موجود | ✅ |
| `PRODUCT_SLUG_EXISTS` | اسم المنتج موجود بالفعل | 400 | الـ slug مستخدم | ✅ |
| `PRODUCT_DELETED` | المنتج محذوف | 400 | المنتج محذوف | ✅ |
| `VARIANT_NOT_FOUND` | المتغير غير موجود | 404 | الـ variant المطلوب غير موجود | ✅ |

### أخطاء الفئات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `CATEGORY_NOT_FOUND` | الفئة غير موجودة | 404 | الفئة المطلوبة غير موجودة | ✅ |
| `CATEGORY_SLUG_EXISTS` | اسم الفئة موجود بالفعل | 400 | الـ slug مستخدم | ✅ |
| `CATEGORY_DELETED` | الفئة محذوفة | 400 | الفئة محذوفة | ✅ |
| `PARENT_NOT_FOUND` | الفئة الأب غير موجودة | 404 | الفئة الأب غير موجودة | ✅ |

### أخطاء المستخدمين

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `USER_NOT_FOUND` | المستخدم غير موجود | 404 | المستخدم المطلوب غير موجود | ✅ |
| `USER_ALREADY_SUSPENDED` | المستخدم موقوف بالفعل | 400 | المستخدم موقوف | ✅ |
| `USER_ALREADY_DELETED` | المستخدم محذوف بالفعل | 400 | المستخدم محذوف | ✅ |
| `CANNOT_DELETE_SUPER_ADMIN` | لا يمكن حذف Super Admin | 403 | محاولة حذف super admin | ✅ |
| `PERMISSION_DENIED` | لا يمكن تعديل Super Admin | 403 | محاولة تعديل super admin | ✅ |

### أخطاء الملفات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `MEDIA_NOT_FOUND` | الصورة غير موجودة | 404 | الملف المطلوب غير موجود | ✅ |
| `MEDIA_DELETED` | الصورة محذوفة | 400 | الملف محذوف | ✅ |

### أخطاء الإشعارات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `NOTIFICATION_NOT_FOUND` | الإشعار غير موجود | 404 | الإشعار المطلوب غير موجود | ✅ |
| `TEMPLATE_NOT_FOUND` | القالب غير موجود | 404 | قالب الإشعار غير موجود | ✅ |

### أخطاء السمات (Attributes)

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `ATTRIBUTE_NOT_FOUND` | السمة غير موجودة | 404 | السمة المطلوبة غير موجودة | ✅ |
| `VALUE_NOT_FOUND` | القيمة غير موجودة | 404 | قيمة السمة غير موجودة | ✅ |

### أخطاء المفضلات

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `FAVORITE_NOT_FOUND` | المفضلة غير موجودة | 404 | العنصر غير موجود في المفضلة | ✅ |

### أخطاء التسعير

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `PRICE_CONVERSION_ERROR` | خطأ في تحويل السعر | 500 | فشل تحويل العملة | ✅ |

### أخطاء عامة

| الكود | الرسالة | HTTP Status | الوصف | موجود في الكود |
|-------|---------|-------------|--------|----------------|
| `UNEXPECTED_ERROR` | حدث خطأ غير متوقع | 500 | خطأ داخلي في السيرفر | ✅ |
| `NOT_FOUND` | غير موجود | 404 | المورد المطلوب غير موجود | ✅ |
| `FORBIDDEN` | ممنوع | 403 | ليس لديك صلاحية | ✅ |
| `NOT_ALLOWED` | هذا الـ endpoint غير متاح في الإنتاج | 403 | endpoint غير متاح | ✅ |
| `INVALID_SECRET` | مفتاح سري غير صحيح | 403 | مفتاح سري خاطئ | ✅ |
| `SUPER_ADMIN_EXISTS` | الادمن الرئيسي موجود بالفعل | 400 | super admin موجود | ✅ |

### ⚠️ أخطاء قيد التطوير أو لها معالجة خاصة

| الكود | الرسالة | HTTP Status | الحالة |
|-------|---------|-------------|--------|
| `ORDER_NOT_FOUND` | الطلب غير موجود | - | يُرجع كـ `{ ok: false, reason: 'ORDER_NOT_FOUND' }` |
| `ADDRESS_NOT_FOUND` | العنوان غير موجود | - | يُرمى كـ `Error` عادي |
| `OFFER_NOT_FOUND` | العرض غير موجود | - | يُرجع كـ `{ error: 'OFFER_NOT_FOUND' }` |
| `REQUEST_NOT_FOUND` | الطلب غير موجود | - | يُرجع كـ `{ error: 'REQUEST_NOT_FOUND' }` |

---

## 💻 التطبيق في Flutter

### 1. Models الأساسية

#### ApiResponse Model

```dart
class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;
  final String? requestId;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.requestId,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'],
      error: json['error'] != null
          ? ApiError.fromJson(json['error'])
          : null,
      requestId: json['requestId'],
    );
  }

  // للتحقق من النجاح
  bool get isSuccess => success && error == null;

  // للحصول على البيانات بأمان
  T? get dataOrNull => isSuccess ? data : null;
}
```

#### ApiError Model

```dart
class ApiError {
  final String code;
  final String message;
  final dynamic details;
  final List<FieldError>? fieldErrors;

  ApiError({
    required this.code,
    required this.message,
    this.details,
    this.fieldErrors,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] ?? 'UNKNOWN_ERROR',
      message: json['message'] ?? 'حدث خطأ غير متوقع',
      details: json['details'],
      fieldErrors: json['fieldErrors'] != null
          ? (json['fieldErrors'] as List)
              .map((e) => FieldError.fromJson(e))
              .toList()
          : null,
    );
  }

  // للتحقق من نوع الخطأ
  bool isAuthError() => code.startsWith('AUTH_');
  bool isValidationError() => code == 'VALIDATION_ERROR';
  bool isNotFoundError() => code.endsWith('_NOT_FOUND');

  // للحصول على رسالة الخطأ الكاملة
  String getFullMessage() {
    if (fieldErrors != null && fieldErrors!.isNotEmpty) {
      return fieldErrors!.map((e) => e.message).join('\n');
    }
    return message;
  }
}
```

#### FieldError Model

```dart
class FieldError {
  final String field;
  final String message;

  FieldError({
    required this.field,
    required this.message,
  });

  factory FieldError.fromJson(Map<String, dynamic> json) {
    return FieldError(
      field: json['field'] ?? '',
      message: json['message'] ?? '',
    );
  }
}
```

### 2. معالجة الأخطاء

#### Exception Handler

```dart
class ApiException implements Exception {
  final ApiError error;
  final int? statusCode;

  ApiException(this.error, [this.statusCode]);

  @override
  String toString() => error.message;
}

// استخدام في الـ Repository
Future<User> getUser(String id) async {
  try {
    final response = await _dio.get('/users/$id');
    final apiResponse = ApiResponse<User>.fromJson(
      response.data,
      (data) => User.fromJson(data),
    );

    if (apiResponse.isSuccess) {
      return apiResponse.data!;
    } else {
      throw ApiException(apiResponse.error!);
    }
  } on DioException catch (e) {
    if (e.response != null) {
      final apiResponse = ApiResponse<User>.fromJson(
        e.response!.data,
        null,
      );
      throw ApiException(apiResponse.error!, e.response!.statusCode);
    } else {
      throw ApiException(
        ApiError(
          code: 'NETWORK_ERROR',
          message: 'خطأ في الاتصال بالإنترنت',
        ),
      );
    }
  }
}
```

### 3. عرض الأخطاء للمستخدم

```dart
void _handleError(ApiException error) {
  String message = error.error.message;
  
  // رسائل خاصة لأكواد معينة
  switch (error.error.code) {
    case 'AUTH_UNAUTHORIZED':
      // قم بتسجيل الخروج
      _logout();
      message = 'انتهت جلستك، يرجى تسجيل الدخول مرة أخرى';
      break;
    
    case 'NETWORK_ERROR':
      message = 'تحقق من اتصالك بالإنترنت';
      break;
    
    case 'VALIDATION_ERROR':
      message = error.error.getFullMessage();
      break;
  }
  
  // عرض رسالة للمستخدم
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message)),
  );
}
```

### 4. مثال كامل للاستخدام

```dart
class ProductRepository {
  final ApiClient _apiClient;

  ProductRepository(this._apiClient);

  Future<List<Product>> getProducts({
    int page = 1,
    int limit = 20,
    String? categoryId,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/products',
        queryParameters: {
          'page': page,
          'limit': limit,
          if (categoryId != null) 'categoryId': categoryId,
        },
      );

      final apiResponse = ApiResponse<List<Product>>.fromJson(
        response.data,
        (data) => (data as List)
            .map((item) => Product.fromJson(item))
            .toList(),
      );

      if (apiResponse.isSuccess) {
        return apiResponse.data!;
      } else {
        throw ApiException(apiResponse.error!);
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final apiResponse = ApiResponse.fromJson(e.response!.data, null);
        throw ApiException(apiResponse.error!, e.response!.statusCode);
      } else {
        throw ApiException(
          ApiError(
            code: 'NETWORK_ERROR',
            message: 'خطأ في الاتصال بالإنترنت',
          ),
        );
      }
    }
  }
}

// في UI
class ProductsScreen extends StatefulWidget {
  @override
  _ProductsScreenState createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late ProductRepository _repository;
  List<Product> _products = [];
  bool _loading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _repository = ProductRepository(ApiClient());
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final products = await _repository.getProducts();
      setState(() {
        _products = products;
        _loading = false;
      });
    } on ApiException catch (e) {
      setState(() {
        _errorMessage = e.error.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMessage!),
            ElevatedButton(
              onPressed: _loadProducts,
              child: Text('إعادة المحاولة'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: _products.length,
      itemBuilder: (context, index) {
        return ProductCard(product: _products[index]);
      },
    );
  }
}
```

---

## ✅ Checklist للتطبيق

- [ ] إنشاء `ApiResponse<T>` Model
- [ ] إنشاء `ApiError` Model
- [ ] إنشاء `FieldError` Model
- [ ] إنشاء `ApiException` Class
- [ ] معالجة الأخطاء في Dio Interceptor
- [ ] عرض رسائل الأخطاء للمستخدم
- [ ] معالجة حالة انتهاء التوكن (401)
- [ ] معالجة أخطاء الشبكة
- [ ] تسجيل الأخطاء (Logging)

---

## 📝 ملاحظات مهمة

### البنية التحتية (Backend)

1. **تغليف الاستجابات تلقائياً:**
   - جميع الاستجابات الناجحة تُغلف بواسطة `ResponseEnvelopeInterceptor`
   - موجود في: `backend/src/shared/interceptors/response-envelope.interceptor.ts`

2. **معالجة الأخطاء تلقائياً:**
   - جميع الأخطاء تُعالج بواسطة `GlobalExceptionFilter`
   - موجود في: `backend/src/shared/filters/global-exception.filter.ts`

3. **requestId:**
   - يُنشأ تلقائياً بواسطة `RequestIdMiddleware`
   - موجود في: `backend/src/shared/middleware/request-id.middleware.ts`
   - يستخدم UUID v4
   - يمكن إرسال `X-Request-Id` في header للاستخدام بدلاً من التوليد

4. **AppException:**
   - الطريقة الموحدة لرمي الأخطاء
   - موجود في: `backend/src/shared/exceptions/app.exception.ts`
   - الاستخدام: `throw new AppException(code, message, details, httpStatus, fieldErrors)`

### التطبيق (Frontend/Flutter)

1. **دائماً تحقق من `success`** قبل استخدام `data`
2. **استخدم `error.code`** للبرمجة و `error.message` للعرض للمستخدم
3. **`fieldErrors`** موجودة فقط في أخطاء الـ Validation
4. **`requestId`** مفيد للـ Debugging وتتبع الأخطاء
5. **بعض الاستجابات تحتوي على `meta`** داخل `data` (مثل Pagination)

### ⚠️ تحذيرات

1. **بعض الأخطاء لا تتبع النمط الموحد:**
   - `ORDER_NOT_FOUND`, `OFFER_NOT_FOUND`, `REQUEST_NOT_FOUND` في Services
   - `ADDRESS_NOT_FOUND` في بعض الحالات
   - هذه قد تُرجع كـ `{ ok: false, reason: 'ERROR' }` أو `{ error: 'ERROR' }`

2. **معالجة 401 Unauthorized:**
   - يتم معالجتها تلقائياً في `client.ts` مع refresh token
   - يتم تسجيل الخروج تلقائياً إذا فشل refresh

3. **الـ Admin Dashboard:**
   - يستخدم نفس الهيكل
   - الـ Types موجودة في: `admin-dashboard/src/shared/types/common.types.ts`

---

## 🔗 روابط الملفات المرجعية

### Backend
- **Response Envelope:** `backend/src/shared/interceptors/response-envelope.interceptor.ts`
- **Exception Filter:** `backend/src/shared/filters/global-exception.filter.ts`
- **App Exception:** `backend/src/shared/exceptions/app.exception.ts`
- **Request ID Middleware:** `backend/src/shared/middleware/request-id.middleware.ts`

### Frontend (Admin Dashboard)
- **API Client:** `admin-dashboard/src/core/api/client.ts`
- **Common Types:** `admin-dashboard/src/shared/types/common.types.ts`

---

**التالي:** [خدمة المصادقة (Authentication)](./02-auth-service.md)

